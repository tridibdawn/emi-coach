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
  wrongKeyOpenBehavior: string;
  wrongKeyAuthenticatedReadBehavior: string;
  sqlCipherNative: boolean;
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

/**
 * Runs the authenticated-read wrong-key gate and persistence checks.
 */
export async function runCompatibilitySpike(): Promise<CompatibilitySpikeResult> {
  const details: string[] = [];
  const result: CompatibilitySpikeResult = {
    runtimeEncryption: 'NOT_RUN',
    migration: 'NOT_RUN',
    persistence: 'NOT_RUN',
    wrongKeyOpenBehavior: 'not tested',
    wrongKeyAuthenticatedReadBehavior: 'not tested',
    sqlCipherNative: isSQLCipher(),
    details,
  };

  try {
    const correctKey = await getDatabaseKey();
    const wrongKey = await getWrongDatabaseKey();

    details.push(`isSQLCipher(): ${String(result.sqlCipherNative)}`);

    const seeded = await applyMigration001(correctKey);
    result.migration = seeded.migrationRecorded ? 'PASS' : 'FAIL';
    details.push(
      `migration 001 recorded: ${String(seeded.migrationRecorded)} marker=${seeded.marker}`,
    );

    let wrongKeyDb: ReturnType<typeof open> | undefined;
    try {
      wrongKeyDb = open({ name: SPIKE_DB_NAME, encryptionKey: wrongKey });
      result.wrongKeyOpenBehavior = 'open returned handle (no throw)';
    } catch (openError) {
      result.wrongKeyOpenBehavior = `open threw: ${
        openError instanceof Error ? openError.message : String(openError)
      }`;
    }

    try {
      const dbForProbe = wrongKeyDb ?? open({ name: SPIKE_DB_NAME, encryptionKey: wrongKey });
      try {
        await dbForProbe.execute(SQL_VERIFY_SCHEMA);
        result.wrongKeyAuthenticatedReadBehavior =
          'authenticated read succeeded unexpectedly';
        result.runtimeEncryption = 'FAIL';
      } catch (readError) {
        const message =
          readError instanceof Error ? readError.message : String(readError);
        result.wrongKeyAuthenticatedReadBehavior = message;
        result.runtimeEncryption = isWrongKeyReadError(readError) ? 'PASS' : 'FAIL';
        details.push(`wrong-key read error: ${message}`);
      } finally {
        if (dbForProbe !== wrongKeyDb) {
          dbForProbe.close();
        }
      }
    } finally {
      wrongKeyDb?.close();
    }

    const db = open({ name: SPIKE_DB_NAME, encryptionKey: correctKey });
    try {
      const migration = await db.execute(SQL_SELECT_MIGRATION, [
        MIGRATION_001_VERSION,
      ]);
      const row = await db.execute(SQL_SELECT_TEST_ROW);
      const marker = String(row.rows?.[0]?.marker ?? '');
      const migrationOk =
        Number(migration.rows?.[0]?.version) === MIGRATION_001_VERSION &&
        marker === TEST_ROW_MARKER;
      result.persistence = migrationOk ? 'PASS' : 'FAIL';
      details.push(`reopen marker=${marker} migrationOk=${String(migrationOk)}`);
      if (result.migration === 'PASS' && result.runtimeEncryption === 'PASS') {
        // migration already set above; runtime set from wrong-key probe
      }
    } finally {
      db.close();
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    if (result.runtimeEncryption === 'NOT_RUN') result.runtimeEncryption = 'FAIL';
    if (result.migration === 'NOT_RUN') result.migration = 'FAIL';
    if (result.persistence === 'NOT_RUN') result.persistence = 'FAIL';
    details.push(`fatal: ${result.error}`);
  }

  return result;
}
