import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['taku-globe.js'],
  outfile: '../research/part-2/supply-globe.min.js',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['chrome110', 'safari16'],
  banner: { js: '/*! D3 licenses: assets/LICENSE-D3.txt. Land: Natural Earth, public domain. */' },
});
