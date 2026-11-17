import { build } from 'esbuild';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
await mkdir(join(root, 'vendor'), { recursive: true });
await build({
  absWorkingDir: root,
  stdin: {
    contents: `
      import { use, init } from 'echarts/core';
      import { LineChart } from 'echarts/charts';
      import { GridComponent, TooltipComponent, GraphicComponent } from 'echarts/components';
      import { SVGRenderer } from 'echarts/renderers';
      use([LineChart, GridComponent, TooltipComponent, GraphicComponent, SVGRenderer]);
      export { init };
      export { animate } from 'motion/mini';
    `,
    resolveDir: root,
    sourcefile: 'graph-vendor-entry.js',
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  legalComments: 'linked',
  outfile: join(root, 'vendor/graph-vendor.js'),
});
// Keep numeric transforms independent of the DOM-dependent chart bundle so
// the same off-the-shelf scale is available to data checks and rendering.
await build({
  absWorkingDir: root,
  stdin: {
    contents: `export { scaleSymlog } from 'd3-scale';`,
    resolveDir: root,
    sourcefile: 'scale-vendor-entry.js',
  },
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: ['es2020'],
  minify: true,
  legalComments: 'linked',
  outfile: join(root, 'vendor/scale-vendor.js'),
});
const legalFile = join(root, 'vendor/graph-vendor.js.LEGAL.txt');
await writeFile(legalFile, (await readFile(legalFile, 'utf8')).replace(/[\t ]+$/gm, ''));
const licenses = await Promise.all([
  ['echarts', 'Apache ECharts 6.1.0'],
  ['zrender', 'ZRender'],
  ['motion', 'Motion 14.14.0'],
  ['motion-dom', 'Motion DOM'],
  ['motion-utils', 'Motion Utils'],
  ['d3-scale', 'D3 Scale 4.0.2'],
  ['d3-array', 'D3 Array'],
  ['d3-interpolate', 'D3 Interpolate'],
  ['d3-color', 'D3 Color'],
  ['d3-format', 'D3 Format'],
  ['d3-time', 'D3 Time'],
  ['d3-time-format', 'D3 Time Format'],
  ['internmap', 'InternMap'],
].map(async ([pkg, title]) => {
  for (const file of ['LICENSE', 'LICENSE.md']) {
    try { return `${title}\n${await readFile(join(root, 'node_modules', pkg, file), 'utf8')}`; } catch {}
  }
  throw new Error(`Missing license for ${pkg}`);
}));
await writeFile(join(root, 'vendor/LICENSES.txt'), licenses.join('\n\n----------------\n\n'));
await writeFile(join(root, 'vendor/NOTICE.echarts.txt'), await readFile(join(root, 'node_modules/echarts/NOTICE'), 'utf8'));
console.log('Built local SVG chart, motion, and isolated D3 scale vendor bundles.');
