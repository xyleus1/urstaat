import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  entryPoints: ['taku-viewer.js'],
  outfile: '../research/part-2/taku-viewer.min.js',
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['chrome110', 'safari16'],
  legalComments: 'inline',
  banner: {
    js: '/*! Three.js: ../../hero/assets/LICENSE-Three.txt | meshoptimizer: ../../hero/assets/LICENSE-Meshoptimizer.txt */',
  },
});

await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  stdin: {
    contents: "export {gunzipSync} from 'three/examples/jsm/libs/fflate.module.js';",
    resolveDir: fileURLToPath(new URL('.', import.meta.url)),
  },
  outfile: '../research/part-2/taku-inflate.min.js',
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'inline',
});
