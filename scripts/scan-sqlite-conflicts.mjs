#!/usr/bin/env node
/**
 * Link-time SQLite conflict scanner.
 *
 * Invariant: ONE ACTIVE NATIVE SQLITE IMPLEMENTATION AT LINK TIME.
 * OP-SQLite ships both cpp/sqlite3.c and cpp/sqlcipher/sqlite3.c; with sqlcipher
 * enabled only one is compiled. Those dual sources must NOT be reported.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OP_SQLITE_SEGMENT = join('@op-engineering', 'op-sqlite');

/** @type {readonly string[]} */
const CONFLICTING_PACKAGE_NAMES = [
  'expo-sqlite',
  'react-native-sqlite-storage',
  'react-native-quick-sqlite',
  '@journeyapps/react-native-quick-sqlite',
  'better-sqlite3',
];

/** @type {readonly string[]} */
const OP_SQLITE_ALLOWED_SQLITE3_C = [
  `${OP_SQLITE_SEGMENT}/cpp/sqlite3.c`,
  `${OP_SQLITE_SEGMENT}/cpp/sqlcipher/sqlite3.c`,
];

/**
 * @param {string} dir
 * @param {(filePath: string) => void} onFile
 */
function walkFiles(dir, onFile) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === '.git' || entry === 'build' || entry === 'Pods') continue;
      walkFiles(full, onFile);
    } else {
      onFile(full);
    }
  }
}

/**
 * @param {string} rootDir
 * @returns {{ conflicts: string[], opSqliteSqlite3Sources: string[] }}
 */
export function scanSqliteConflicts(rootDir = ROOT) {
  const conflicts = [];
  const opSqliteSqlite3Sources = [];
  const nodeModulesRoots = [
    join(rootDir, 'node_modules'),
    join(rootDir, 'apps', 'mobile', 'node_modules'),
  ];

  for (const nodeModules of nodeModulesRoots) {
    if (!existsSync(nodeModules)) continue;

    for (const pkgName of CONFLICTING_PACKAGE_NAMES) {
      const pkgDir = join(nodeModules, pkgName);
      if (existsSync(pkgDir)) {
        conflicts.push(
          `Independent SQLite package detected: ${relative(rootDir, pkgDir)}`,
        );
      }
    }

    walkFiles(nodeModules, (filePath) => {
      if (!filePath.endsWith('sqlite3.c')) return;
      const rel = relative(rootDir, filePath).replaceAll('\\', '/');
      const isOpSqliteAllowed = OP_SQLITE_ALLOWED_SQLITE3_C.some((allowed) =>
        rel.endsWith(allowed),
      );
      if (isOpSqliteAllowed) {
        opSqliteSqlite3Sources.push(rel);
        return;
      }
      conflicts.push(`Independent sqlite3.c source: ${rel}`);
    });
  }

  return { conflicts: [...new Set(conflicts)], opSqliteSqlite3Sources };
}

function main() {
  const { conflicts, opSqliteSqlite3Sources } = scanSqliteConflicts();
  const hasOpSqlite = opSqliteSqlite3Sources.length > 0;

  if (!hasOpSqlite) {
    console.warn(
      '[sqlite-conflicts] @op-engineering/op-sqlite not installed; skipping OP-SQLite dual-source allowance check.',
    );
  } else {
    console.log(
      `[sqlite-conflicts] OP-SQLite bundled sqlite3 sources (allowed): ${opSqliteSqlite3Sources.join(', ')}`,
    );
  }

  if (conflicts.length > 0) {
    console.error('[sqlite-conflicts] FAIL — independent SQLite implementations:');
    for (const conflict of conflicts) {
      console.error(`  - ${conflict}`);
    }
    process.exit(1);
  }

  console.log('[sqlite-conflicts] PASS — no independent second SQLite linkage detected.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
