import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { startPreviewServer } from '../tests/preview-server.mjs';

const destination = new URL('../../research/part-2/stills/', import.meta.url);
const anchorsFile = new URL('../assets/still-anchors.json', destination);
const surfacesFile = new URL('../assets/still-surfaces.json', destination);
const views = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
const shots = [...views, 'right-shoulder', 'right-elbow', 'right-wrist', 'right-claw'];
const onlyShot = process.argv.find(arg => arg.startsWith('--shot='))?.slice(7);
const sizes = process.argv.includes('--desktop-only') ? [false] : [false, true];
const load = file => readFile(file, 'utf8').then(JSON.parse).catch(error => {
  if (error.code === 'ENOENT') return {};
  throw error;
});

// Each byte pair is the run length and the depth-tested surface label.
function pack(labels) {
  const pairs = [];
  for (let start = 0; start < labels.length;) {
    const code = labels[start];
    let end = start + 1;
    while (end < labels.length && end - start < 255 && labels[end] === code) end++;
    pairs.push(end - start, code);
    start = end;
  }
  return Buffer.from(pairs).toString('base64');
}

const [anchors, surfaces] = await Promise.all([load(anchorsFile), load(surfacesFile)]);
await mkdir(destination, { recursive: true });
const { server, origin } = await startPreviewServer();
let browser;
try {
  const args = process.argv.includes('--software') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
  browser = await puppeteer.launch({ headless: 'shell', args });
  for (const mobile of sizes) {
    const page = await browser.newPage();
    await page.bringToFront();
    await page.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 1050, deviceScaleFactor: mobile ? 2 : 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (!new URL(request.url()).pathname.endsWith('/explorer.js')) return request.continue();
      return request.respond({
        status: 200, contentType: 'text/javascript',
        body: `
          import { mountTaku } from './taku-viewer.min.js?v=field-1';
          import { mountTakuAtmosphere } from './taku-atmosphere.js?v=field-1';
          const stage = document.querySelector('.taku-stage');
          const atmosphere = mountTakuAtmosphere(stage);
          let nextAnchors;
          const viewer = await mountTaku({
            canvas: stage.querySelector('#taku-canvas'), mobile: ${mobile}, initialView: 'overview',
            assetUrl: new URL('assets/taku-${mobile ? 'mobile' : 'desktop'}.glb', import.meta.url).href,
            lighting: 'studio', antialiasing: 'msaa',
            onAnchors: anchors => { nextAnchors?.(anchors); nextAnchors = undefined; },
          });
          stage.dataset.mode = 'live';
          window.plate = async (id, side) => {
            await viewer.anchorsReady();
            const visible = new Promise(resolve => { nextAnchors = resolve; });
            viewer.setView(id, {side, immediate:true});
            const anchors = await visible;
            const { width, height, labels } = await viewer.readStudyMask();
            return { anchors, width, height, labels: Array.from(labels) };
          };
          addEventListener('pagehide', () => { atmosphere.dispose(); viewer.dispose(); }, {once:true});
        `,
      });
    });
    await page.goto(origin + '/research/part-2/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.plate === 'function', { timeout: 120000 });
    const surface = await page.$('.taku-surface');
    await surface.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    for (const shot of shots) {
      if (onlyShot && shot !== onlyShot) continue;
      const filename = shot + (mobile ? '-mobile.webp' : '.webp');
      if (process.argv.includes('--missing') && anchors[filename] && surfaces[filename]) continue;
      const id = shot.replace(/^right-/, ''), side = shot === id ? 'left' : 'right';
      const data = await page.evaluate((id, side) => window.plate(id, side), id, side);
      assert.equal(data.labels.length, data.width * data.height, filename);
      assert(data.anchors.some(anchor => anchor.id === id && anchor.side === side),
        'Missing selected anchor for ' + filename + '; visible surfaces ' + JSON.stringify(data.anchors));
      await surface.screenshot({ path: fileURLToPath(new URL(filename, destination)), type: 'webp', quality: 87 });
      anchors[filename] = data.anchors.map(({id, side, x, y}) => ({id, side, x: +x.toFixed(6), y: +y.toFixed(6)}));
      surfaces[filename] = [data.width, data.height, pack(data.labels)];
      await Promise.all([
        writeFile(anchorsFile, JSON.stringify(anchors) + '\n'),
        writeFile(surfacesFile, JSON.stringify(surfaces) + '\n'),
      ]);
      console.log('Rendered ' + filename);
    }
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
