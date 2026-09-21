#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const packages = readdirSync('packages');
for (const name of packages) {
  execSync(`yarn exec tsc --noEmit -p packages/${name}`, { stdio: 'inherit' });
}
