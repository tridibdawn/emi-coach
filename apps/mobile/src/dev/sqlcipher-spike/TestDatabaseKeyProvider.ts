/**
 * TEST ONLY — supplies the spike encryption key from the isolated fixture.
 * Production will use OS-wrapped random DEK; PIN is verifier only.
 */
import {
  TEST_ONLY_DATABASE_KEY,
  TEST_ONLY_WRONG_DATABASE_KEY,
} from './testOnlyKey.fixture';

export async function getDatabaseKey(): Promise<string> {
  return TEST_ONLY_DATABASE_KEY;
}

export async function getWrongDatabaseKey(): Promise<string> {
  return TEST_ONLY_WRONG_DATABASE_KEY;
}
