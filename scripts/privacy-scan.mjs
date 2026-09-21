#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LIST = readFileSync(join(ROOT, 'docs/privacy/forbidden-fields.yml'), 'utf8');
const FORBIDDEN = LIST.split('\n')
  .map((line) => line.replace(/^- /, '').trim())
  .filter((line) => line && !line.startsWith('#') && !line.startsWith('forbidden'));

const TARGETS = ['packages/analytics/src', 'packages/contracts/src'];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const identifier = (name) => new RegExp(`(?:^|[^A-Za-z0-9_])${name}(?:$|[^A-Za-z0-9_])`, 'i');
let failed = false;

for (const target of TARGETS) {
  const dir = join(ROOT, target);
  for (const file of walk(dir)) {
    if (!/\.(ts|tsx|js|mjs)$/.test(file)) continue;
    if (/\.test\.(ts|tsx|js)$/.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const field of FORBIDDEN) {
      if (identifier(field).test(text)) {
        console.error(`Forbidden field "${field}" in ${relative(ROOT, file)}`);
        failed = true;
      }
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log('privacy-scan (TS analytics/contracts): PASS');
