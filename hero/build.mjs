import { build } from 'esbuild';
await build({ entryPoints: ['renderer.js'], bundle: true, format: 'esm', minify: true, sourcemap: true, outfile: 'hero-renderer.js', target: ['chrome110', 'safari16'], legalComments: 'linked' });
