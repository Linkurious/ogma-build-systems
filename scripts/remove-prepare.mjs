import { readFileSync, writeFileSync } from 'node:fs';
import { root } from './utils.mjs';

const pkgPath = root('package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
delete pkg.scripts.prepare;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Removed prepare script from package.json');
