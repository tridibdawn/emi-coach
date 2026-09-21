/**
 * Jest contract tests — key provider interface only (no native module).
 */
import {
  getDatabaseKey,
  getWrongDatabaseKey,
} from './TestDatabaseKeyProvider';
import {
  TEST_ONLY_DATABASE_KEY,
  TEST_ONLY_WRONG_DATABASE_KEY,
} from './testOnlyKey.fixture';

describe('TestDatabaseKeyProvider contracts', () => {
  it('returns fixture keys without deriving from PIN', async () => {
    await expect(getDatabaseKey()).resolves.toBe(TEST_ONLY_DATABASE_KEY);
    await expect(getWrongDatabaseKey()).resolves.toBe(
      TEST_ONLY_WRONG_DATABASE_KEY,
    );
  });

  it('uses distinct correct and wrong keys', async () => {
    const correct = await getDatabaseKey();
    const wrong = await getWrongDatabaseKey();
    expect(correct).not.toBe(wrong);
  });
});
