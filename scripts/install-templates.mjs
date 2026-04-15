import { execSync } from 'node:child_process';
import { root, templates } from './utils.mjs';

// During npm pack, templates don't need their deps installed
const npmCommand = process.env.npm_command;
if (npmCommand === 'pack') {
  console.log('Skipping template installs (npm pack)');
  process.exit(0);
}

for (const t of templates) {
  const flags = t === 'parcel' ? '--ignore-scripts' : '';
  console.log(`Installing ${t}...`);
  execSync(`npm i ${flags}`, { cwd: root('templates', t), stdio: 'inherit' });
}
