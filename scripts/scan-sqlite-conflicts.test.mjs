import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { scanSqliteConflicts } from './scan-sqlite-conflicts.mjs';

describe('scan-sqlite-conflicts', () => {
  it('does not flag OP-SQLite bundled plain + SQLCipher sqlite3.c sources', () => {
    const root = mkdtempSync(join(tmpdir(), 'emi-sqlite-conflict-'));
    const opRoot = join(
      root,
      'apps/mobile/node_modules/@op-engineering/op-sqlite/cpp',
    );
    mkdirSync(join(opRoot, 'sqlcipher'), { recursive: true });
    writeFileSync(join(opRoot, 'sqlite3.c'), '// plain sqlite amalgamation');
    writeFileSync(join(opRoot, 'sqlcipher/sqlite3.c'), '// sqlcipher amalgamation');

    const { conflicts, opSqliteSqlite3Sources } = scanSqliteConflicts(root);
    expect(opSqliteSqlite3Sources).toHaveLength(2);
    expect(conflicts).toEqual([]);
  });

  it('flags an independent sqlite3.c outside OP-SQLite', () => {
    const root = mkdtempSync(join(tmpdir(), 'emi-sqlite-conflict-'));
    const rogue = join(root, 'node_modules/rogue-sqlite/native/sqlite3.c');
    mkdirSync(join(rogue, '..'), { recursive: true });
    writeFileSync(rogue, '// rogue sqlite');

    const { conflicts } = scanSqliteConflicts(root);
    expect(conflicts.some((c) => c.includes('rogue-sqlite'))).toBe(true);
  });

  it('flags expo-sqlite when present', () => {
    const root = mkdtempSync(join(tmpdir(), 'emi-sqlite-conflict-'));
    const expo = join(root, 'node_modules/expo-sqlite/package.json');
    mkdirSync(join(expo, '..'), { recursive: true });
    writeFileSync(expo, '{}');

    const { conflicts } = scanSqliteConflicts(root);
    expect(conflicts.some((c) => c.includes('expo-sqlite'))).toBe(true);
  });
});
