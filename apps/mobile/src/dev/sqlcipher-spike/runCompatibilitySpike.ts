/**
 * TEST ONLY — native SQLCipher compatibility spike for Phase 1B.
 * Must run on Android/iOS device or emulator; Jest must not fake this gate.
 */
import { isSQLCipher, open } from '@op-engineering/op-sqlite';
import {
  getDatabaseKey,
  getWrongDatabaseKey,
} from './TestDatabaseKeyProvider';
import {
  MIGRATION_001_NAME,
  MIGRATION_001_VERSION,
  SQL_CREATE_SCHEMA_MIGRATIONS,
  SQL_CREATE_TEST_TABLE,
  SQL_INSERT_TEST_ROW,
  SQL_RECORD_MIGRATION,
  SQL_SELECT_MIGRATION,
  SQL_SELECT_TEST_ROW,
  SQL_VERIFY_SCHEMA,
  SPIKE_DB_NAME,
  TEST_ROW_MARKER,
} from './migrations';

export type SpikeGateStatus = 'PASS' | 'FAIL' | 'NOT_RUN';

export type CompatibilitySpikeResult = {
  runtimeEncryption: SpikeGateStatus;
  migration: SpikeGateStatus;
  persistence: SpikeGateStatus;
  sqlCipherNative: boolean;
  correctKeyOpen: string;
  migrationSchemaMigrations: string;
  marker: string;
  wrongKeyOpenBehavior: string;
  wrongKeyOpenErrorText: string;
  wrongKeyAuthenticatedReadErrorText: string;
  wrongKeyAuthenticatedRead: SpikeGateStatus;
  correctKeyReopen: string;
  persistenceMarker: SpikeGateStatus;
  details: string[];
  error?: string;
};

function isWrongKeyReadError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? 'unknown error');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('notadb') ||
    normalized.includes('file is encrypted or is not a database') ||
    normalized.includes('encrypted') ||
    normalized.includes('malformed')
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? 'unknown error');
}

/**
 * Copy-ready evidence block for Phase 1B Android documentation.
 */
export function formatAndroidSpikeEvidence(
  result: CompatibilitySpikeResult,
): string {
  return [
    'ANDROID PHASE 1B SQLCIPHER SPIKE',
    '',
    'isSQLCipher():',
    String(result.sqlCipherNative),
    '',
    'Correct-key open:',
    result.correctKeyOpen,
    '',
    'Migration 001 / schema_migrations:',
    result.migrationSchemaMigrations,
    '',
    'Marker:',
    result.marker,
    '',
    'Wrong-key open:',
    result.wrongKeyOpenBehavior,
    '',
    'Exact wrong-key error text:',
    result.wrongKeyAuthenticatedReadErrorText,
    '',
    'Wrong-key authenticated read:',
    result.wrongKeyAuthenticatedRead,
    '',
    'Correct-key reopen:',
    result.correctKeyReopen,
    '',
    'Persistence marker phase1b-spike-v1:',
    result.persistenceMarker,
    '',
    'Android RUNTIME ENCRYPTION:',
    result.runtimeEncryption,
    '',
    'Android MIGRATION:',
    result.migration,
    '',
    'Android PERSISTENCE:',
    result.persistence,
  ].join('\n');
}

async function applyMigration001(
  encryptionKey: string,
): Promise<{ migrationRecorded: boolean; marker: string }> {
  const db = open({ name: SPIKE_DB_NAME, encryptionKey });
  try {
    await db.execute(SQL_CREATE_SCHEMA_MIGRATIONS);
    await db.execute(SQL_CREATE_TEST_TABLE);
    await db.execute(SQL_INSERT_TEST_ROW, [TEST_ROW_MARKER]);
    await db.execute(SQL_RECORD_MIGRATION, [
      MIGRATION_001_VERSION,
      MIGRATION_001_NAME,
    ]);

    const migration = await db.execute(SQL_SELECT_MIGRATION, [
      MIGRATION_001_VERSION,
    ]);
    const row = await db.execute(SQL_SELECT_TEST_ROW);
    const marker = String(row.rows?.[0]?.marker ?? '');
    const migrationRecorded =
      Number(migration.rows?.[0]?.version) === MIGRATION_001_VERSION &&
      String(migration.rows?.[0]?.name) === MIGRATION_001_NAME;

    return { migrationRecorded, marker };
  } finally {
    db.close();
  }
}

function deriveRuntimeEncryption(
  sqlCipherNative: boolean,
  correctKeySucceeded: boolean,
  wrongKeyAuthenticatedRead: SpikeGateStatus,
): SpikeGateStatus {
  if (!sqlCipherNative || !correctKeySucceeded) {
    return 'FAIL';
  }
  if (wrongKeyAuthenticatedRead === 'PASS') {
    return 'PASS';
  }
  if (wrongKeyAuthenticatedRead === 'NOT_RUN') {
    return 'NOT_RUN';
  }
  return 'FAIL';
}

/**
 * Runs the authenticated-read wrong-key gate and persistence checks.
 */
export async function runCompatibilitySpike(): Promise<CompatibilitySpikeResult> {
  const details: string[] = [];
  const sqlCipherNative = isSQLCipher();

  const result: CompatibilitySpikeResult = {
    runtimeEncryption: 'NOT_RUN',
    migration: 'NOT_RUN',
    persistence: 'NOT_RUN',
    sqlCipherNative,
    correctKeyOpen: 'not tested',
    migrationSchemaMigrations: 'not tested',
    marker: 'not tested',
    wrongKeyOpenBehavior: 'not tested',
    wrongKeyOpenErrorText: '',
    wrongKeyAuthenticatedReadErrorText: 'NOT RUN',
    wrongKeyAuthenticatedRead: 'NOT_RUN',
    correctKeyReopen: 'not tested',
    persistenceMarker: 'NOT_RUN',
    details,
  };

  details.push(`isSQLCipher(): ${String(sqlCipherNative)}`);

  let correctKeySucceeded = false;

  try {
    const correctKey = await getDatabaseKey();
    const wrongKey = await getWrongDatabaseKey();

    // Phase A — correct-key creation
    try {
      const seeded = await applyMigration001(correctKey);
      correctKeySucceeded = true;
      result.correctKeyOpen = 'PASS — open and execute succeeded';
      result.migration = seeded.migrationRecorded ? 'PASS' : 'FAIL';
      result.marker = seeded.marker;
      result.migrationSchemaMigrations = seeded.migrationRecorded
        ? `PASS — version ${MIGRATION_001_VERSION} (${MIGRATION_001_NAME}) recorded`
        : `FAIL — migration 001 not recorded (marker=${seeded.marker})`;
      details.push(
        `phase A migration=${result.migration} marker=${seeded.marker}`,
      );
    } catch (phaseAError) {
      result.correctKeyOpen = `FAIL — ${errorMessage(phaseAError)}`;
      result.migration = 'FAIL';
      result.migrationSchemaMigrations = `FAIL — ${errorMessage(phaseAError)}`;
      details.push(`phase A fatal: ${errorMessage(phaseAError)}`);
      result.runtimeEncryption = deriveRuntimeEncryption(
        sqlCipherNative,
        false,
        result.wrongKeyAuthenticatedRead,
      );
      return result;
    }

    // Phase B — wrong-key authentication test
    let wrongKeyDb: ReturnType<typeof open> | undefined;
    try {
      wrongKeyDb = open({ name: SPIKE_DB_NAME, encryptionKey: wrongKey });
      result.wrongKeyOpenBehavior = 'handle returned (no throw)';
      result.wrongKeyOpenErrorText = '';
    } catch (openError) {
      const openMessage = errorMessage(openError);
      result.wrongKeyOpenBehavior = 'threw immediately';
      result.wrongKeyOpenErrorText = openMessage;
      result.wrongKeyAuthenticatedRead = 'NOT_RUN';
      result.wrongKeyAuthenticatedReadErrorText = 'NOT RUN';
      details.push(`phase B wrong-key open threw: ${openMessage}`);
    }

    if (wrongKeyDb) {
      try {
        await wrongKeyDb.execute(SQL_VERIFY_SCHEMA);
        result.wrongKeyAuthenticatedReadErrorText =
          'authenticated read succeeded unexpectedly';
        result.wrongKeyAuthenticatedRead = 'FAIL';
        details.push('phase B wrong-key read succeeded unexpectedly');
      } catch (readError) {
        const readMessage = errorMessage(readError);
        result.wrongKeyAuthenticatedReadErrorText = readMessage;
        result.wrongKeyAuthenticatedRead = isWrongKeyReadError(readError)
          ? 'PASS'
          : 'FAIL';
        details.push(`phase B wrong-key read error: ${readMessage}`);
      } finally {
        wrongKeyDb.close();
      }
    }

    result.runtimeEncryption = deriveRuntimeEncryption(
      sqlCipherNative,
      correctKeySucceeded,
      result.wrongKeyAuthenticatedRead,
    );

    // Phase C — persistence test
    try {
      const db = open({ name: SPIKE_DB_NAME, encryptionKey: correctKey });
      try {
        const migration = await db.execute(SQL_SELECT_MIGRATION, [
          MIGRATION_001_VERSION,
        ]);
        const row = await db.execute(SQL_SELECT_TEST_ROW);
        const marker = String(row.rows?.[0]?.marker ?? '');
        const migrationOk =
          Number(migration.rows?.[0]?.version) === MIGRATION_001_VERSION &&
          String(migration.rows?.[0]?.name) === MIGRATION_001_NAME;
        const markerOk = marker === TEST_ROW_MARKER;

        result.persistence = migrationOk && markerOk ? 'PASS' : 'FAIL';
        result.persistenceMarker = markerOk ? 'PASS' : 'FAIL';
        result.correctKeyReopen = migrationOk && markerOk
          ? `PASS — migration 001 and marker ${TEST_ROW_MARKER} present`
          : `FAIL — migrationOk=${String(migrationOk)} marker=${marker}`;
        details.push(`phase C reopen marker=${marker} migrationOk=${String(migrationOk)}`);
      } finally {
        db.close();
      }
    } catch (phaseCError) {
      result.persistence = 'FAIL';
      result.persistenceMarker = 'FAIL';
      result.correctKeyReopen = `FAIL — ${errorMessage(phaseCError)}`;
      details.push(`phase C fatal: ${errorMessage(phaseCError)}`);
    }
  } catch (error) {
    result.error = errorMessage(error);
    if (result.migration === 'NOT_RUN') result.migration = 'FAIL';
    if (result.persistence === 'NOT_RUN') result.persistence = 'FAIL';
    result.runtimeEncryption = deriveRuntimeEncryption(
      sqlCipherNative,
      correctKeySucceeded,
      result.wrongKeyAuthenticatedRead,
    );
    details.push(`fatal: ${result.error}`);
  }

  return result;
}
