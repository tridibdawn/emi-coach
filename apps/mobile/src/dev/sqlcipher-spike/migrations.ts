/**
 * TEST ONLY — migration 001 for Phase 1B SQLCipher spike.
 */
export const SPIKE_DB_NAME = 'phase1b-sqlcipher-spike.sqlite';

export const MIGRATION_001_VERSION = 1;
export const MIGRATION_001_NAME = 'sqlcipher_compatibility_test';
export const TEST_ROW_MARKER = 'phase1b-spike-v1';

export const SQL_CREATE_SCHEMA_MIGRATIONS = `CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);`;

export const SQL_CREATE_TEST_TABLE = `CREATE TABLE IF NOT EXISTS sqlcipher_compatibility_test (
  id INTEGER PRIMARY KEY NOT NULL,
  marker TEXT NOT NULL
);`;

export const SQL_INSERT_TEST_ROW = `INSERT OR REPLACE INTO sqlcipher_compatibility_test (id, marker) VALUES (1, ?);`;

export const SQL_SELECT_TEST_ROW = `SELECT marker FROM sqlcipher_compatibility_test WHERE id = 1;`;

export const SQL_RECORD_MIGRATION = `INSERT OR REPLACE INTO schema_migrations (version, name, applied_at) VALUES (?, ?, datetime('now'));`;

export const SQL_SELECT_MIGRATION = `SELECT version, name FROM schema_migrations WHERE version = ?;`;

export const SQL_VERIFY_SCHEMA = `SELECT name FROM sqlite_master;`;
