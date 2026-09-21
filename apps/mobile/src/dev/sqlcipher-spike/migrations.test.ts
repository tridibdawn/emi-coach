/**
 * Jest contract tests — SQL strings and migration constants only.
 * These do NOT prove native SQLCipher runtime encryption.
 */
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

describe('sqlcipher-spike migration contracts', () => {
  it('uses the expected spike database file name', () => {
    expect(SPIKE_DB_NAME).toBe('phase1b-sqlcipher-spike.sqlite');
  });

  it('defines migration 001 metadata', () => {
    expect(MIGRATION_001_VERSION).toBe(1);
    expect(MIGRATION_001_NAME).toBe('sqlcipher_compatibility_test');
    expect(TEST_ROW_MARKER).toBe('phase1b-spike-v1');
  });

  it('creates schema_migrations and records migration 001', () => {
    expect(SQL_CREATE_SCHEMA_MIGRATIONS).toContain('schema_migrations');
    expect(SQL_RECORD_MIGRATION).toContain('schema_migrations');
    expect(SQL_SELECT_MIGRATION).toContain('schema_migrations');
  });

  it('creates the compatibility test table and row queries', () => {
    expect(SQL_CREATE_TEST_TABLE).toContain('sqlcipher_compatibility_test');
    expect(SQL_INSERT_TEST_ROW).toContain('?');
    expect(SQL_SELECT_TEST_ROW).toContain('marker');
  });

  it('uses authenticated-read verification SQL', () => {
    expect(SQL_VERIFY_SCHEMA).toContain('sqlite_master');
  });
});
