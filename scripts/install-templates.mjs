import { execSync } from 'node:child_process';
import { root, templates } from './utils.mjs';

const userconfig = root('.npmrc');

for (const t of templates) {
  const flags = t === 'parcel' ? '--ignore-scripts' : '';
  console.log(`Installing ${t}...`);
  execSync(`npm i ${flags} --userconfig "${userconfig}"`, { cwd: root('templates', t), stdio: 'inherit' });
}
