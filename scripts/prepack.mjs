import { rmSync } from 'node:fs';
import { root, templates } from './utils.mjs';

for (const t of templates) {
  for (const dir of ['node_modules', 'dist', '.parcel-cache']) {
    rmSync(root('templates', t, dir), { recursive: true, force: true });
  }
  console.log(`Cleaned ${t}`);
}
