#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ROOT_PKG = join(ROOT, 'package.json');
const MOBILE_PKG = join(ROOT, 'apps/mobile/package.json');
const PATCH_DIR = join(ROOT, '.yarn/patches');

const CONFIG_KEYS = [
  'sqlcipher',
  'libsql',
  'turso',
  'iosSqlite',
  'sqliteVec',
  'performanceMode',
  'fts5',
  'rtree',
  'sqliteFlags',
  'tokenizers',
];

/** @param {string} filePath */
function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

/**
 * @param {Record<string, unknown> | undefined} a
 * @param {Record<string, unknown> | undefined} b
 */
function configsMatch(a, b) {
  for (const key of CONFIG_KEYS) {
    const left = JSON.stringify(a?.[key] ?? null);
    const right = JSON.stringify(b?.[key] ?? null);
    if (left !== right) {
      return { ok: false, key, left: a?.[key], right: b?.[key] };
    }
  }
  return { ok: true };
}

function main() {
  const rootConfig = readJson(ROOT_PKG)['op-sqlite'];
  const mobileConfig = readJson(MOBILE_PKG)['op-sqlite'];

  if (!rootConfig?.sqlcipher) {
    console.error('[op-sqlite-config] FAIL — root package.json must set op-sqlite.sqlcipher: true');
    process.exit(1);
  }

  if (!mobileConfig?.sqlcipher) {
    console.error(
      '[op-sqlite-config] FAIL — apps/mobile/package.json must duplicate op-sqlite.sqlcipher: true (iOS podspec resolves apps/mobile first).',
    );
    process.exit(1);
  }

  const match = configsMatch(rootConfig, mobileConfig);
  if (!match.ok) {
    console.error(
      `[op-sqlite-config] FAIL — op-sqlite.${match.key} diverges between root (${JSON.stringify(match.left)}) and apps/mobile (${JSON.stringify(match.right)}).`,
    );
    process.exit(1);
  }

  const patchFiles = existsSync(PATCH_DIR)
    ? readdirSync(PATCH_DIR).filter((name) =>
        name.startsWith('@op-engineering-op-sqlite-npm-18.2.5'),
      )
    : [];
  if (patchFiles.length === 0) {
    console.error(
      '[op-sqlite-config] FAIL — expected Yarn patch for @op-engineering/op-sqlite Android config discovery.',
    );
    process.exit(1);
  }

  const patchText = readFileSync(join(PATCH_DIR, patchFiles[0]), 'utf8');
  if (!patchText.includes('rootDir/../../')) {
    console.error(
      '[op-sqlite-config] FAIL — op-sqlite Android patch must start config discovery at package parent (mirrors podspec).',
    );
    process.exit(1);
  }

  console.log('[op-sqlite-config] PASS');
  console.log('  iOS (op-sqlite.podspec): apps/mobile/package.json');
  console.log('  Android (patched build.gradle): apps/mobile/package.json');
  console.log('  Monorepo root package.json: kept for workspace documentation + CI identity check');
}

main();
