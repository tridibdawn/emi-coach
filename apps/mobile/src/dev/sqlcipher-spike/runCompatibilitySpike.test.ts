/**
 * Jest contract tests — wrong-key authenticated-read error classification only.
 * Does NOT prove native SQLCipher runtime encryption.
 */
jest.mock('@op-engineering/op-sqlite', () => ({
  isSQLCipher: () => {
    throw new Error('Jest must not invoke native isSQLCipher');
  },
  open: () => {
    throw new Error('Jest must not invoke native open');
  },
}));

import { isWrongKeyReadError } from './runCompatibilitySpike';

describe('isWrongKeyReadError classifier contract', () => {
  it('classifies op-sqlite Android wrong-key authenticated-read error as expected failure', () => {
    const error = new Error(
      '[op-sqlite] sqlite query error: file is not a database',
    );
    expect(isWrongKeyReadError(error)).toBe(true);
  });

  it('accepts existing equivalent SQLCipher/native authentication failure messages', () => {
    expect(isWrongKeyReadError(new Error('SQLITE_NOTADB: notadb'))).toBe(true);
    expect(
      isWrongKeyReadError(
        new Error('file is encrypted or is not a database'),
      ),
    ).toBe(true);
    expect(isWrongKeyReadError(new Error('database disk image is malformed'))).toBe(
      true,
    );
    expect(isWrongKeyReadError(new Error('encrypted database'))).toBe(true);
  });

  it('rejects unrelated errors', () => {
    expect(isWrongKeyReadError(new Error('no such table: foo'))).toBe(false);
    expect(isWrongKeyReadError(new Error('unknown error'))).toBe(false);
  });
});
