#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SPIKE_DIR = join(ROOT, 'apps/mobile/src/dev/sqlcipher-spike');
const FIXTURE_FILE = 'testOnlyKey.fixture.ts';

/** @type {readonly { label: string; pattern: RegExp; allowInFixture?: boolean }[]} */
const RULES = [
  { label: 'PIN-derived key', pattern: /\bPIN\b|\bpin\b.*key|derive.*key.*pin/i },
  { label: 'AsyncStorage key persistence', pattern: /AsyncStorage/i },
  { label: 'Zustand key persistence', pattern: /\bzustand\b/i },
  { label: 'Redux key persistence', pattern: /\bredux\b|createSlice|useSelector/i },
  {
    label: 'Key logging',
    pattern: /console\.(log|info|debug|warn|error)\([^)]*key/i,
  },
  {
    label: 'Backend key transmission',
    pattern: /fetch\(|axios|XMLHttpRequest/i,
  },
];

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listTsFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...listTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}

/** @param {string} source */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function main() {
  if (!existsSync(SPIKE_DIR)) {
    console.error('[sqlcipher-spike-security] FAIL — spike directory missing.');
    process.exit(1);
  }

  let failed = false;
  for (const file of listTsFiles(SPIKE_DIR)) {
    const rel = relative(ROOT, file);
    const text = stripComments(readFileSync(file, 'utf8'));
    const isFixture = rel.endsWith(FIXTURE_FILE);

    for (const rule of RULES) {
      if (isFixture && rule.allowInFixture) continue;
      if (rule.pattern.test(text)) {
        console.error(`[sqlcipher-spike-security] FAIL — ${rule.label} in ${rel}`);
        failed = true;
      }
    }

    if (!isFixture) {
      const hardcodedKey = /encryptionKey\s*:\s*['"`][^'"`]+['"`]/;
      if (hardcodedKey.test(text)) {
        console.error(
          `[sqlcipher-spike-security] FAIL — hard-coded encryptionKey outside fixture in ${rel}`,
        );
        failed = true;
      }
    }
  }

  if (failed) process.exit(1);
  console.log('[sqlcipher-spike-security] PASS — spike sources pass security scan.');
}

main();
