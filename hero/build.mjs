import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const modelHash = createHash('sha256').update(await readFile('assets/actuator.meshopt.glb')).digest('hex').slice(0, 12);
if (!(await readFile('mount.js', 'utf8')).includes(`actuator.meshopt.glb?v=${modelHash}`)) {
  throw new Error(`Update the model cache URL in mount.js to actuator.meshopt.glb?v=${modelHash}.`);
}
await build({ entryPoints: ['renderer.js'], bundle: true, format: 'esm', minify: true, sourcemap: true, outfile: 'hero-renderer.js', target: ['chrome110', 'safari16'], legalComments: 'linked' });
