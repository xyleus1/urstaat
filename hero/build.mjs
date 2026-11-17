import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const modelHash = createHash('sha256').update(await readFile('assets/actuator.meshopt.glb')).digest('hex').slice(0, 12);
const bootstrap = await readFile('mount.js', 'utf8');
if (!bootstrap.includes(`actuator.meshopt.glb?v=${modelHash}`)) {
  throw new Error(`Update the model cache URL in mount.js to actuator.meshopt.glb?v=${modelHash}.`);
}
for (const profile of ['desktop', 'mobile']) {
  const hash = createHash('sha256').update(await readFile(`exports/actuator-startup-${profile}.webm`)).digest('hex').slice(0, 12);
  if (!bootstrap.includes(`version: '${hash}'`)) throw new Error(`Update the ${profile} startup video cache version in mount.js to ${hash}.`);
}
await build({ entryPoints: ['renderer.js'], bundle: true, format: 'esm', minify: true, sourcemap: true, outfile: 'hero-renderer.js', target: ['chrome110', 'safari16'], legalComments: 'linked' });
