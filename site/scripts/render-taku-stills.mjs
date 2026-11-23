import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { startPreviewServer } from '../tests/preview-server.mjs';

const destination = new URL('../../research/part-2/stills/', import.meta.url);
await mkdir(destination, { recursive: true });
const { server, origin } = await startPreviewServer();
let browser;
try {
  const args = process.argv.includes('--software') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
  browser = await puppeteer.launch({ headless: true, args });
  for (const mobile of [false, true]) {
    const page = await browser.newPage();
    await page.setViewport({ width: mobile ? 390 : 1568, height: mobile ? 844 : 1050, deviceScaleFactor: mobile ? 2 : 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    page.on('console', msg => { if (msg.type() === 'warn') console.log(msg.text()); });
    await page.goto(origin + '/research/part-2/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.taku-stage[data-mode="live"]', { timeout: 60000 });
    await page.addStyleTag({ content: '.stage-tools, .stage-status { visibility: hidden !important; }' });
    const shots = await page.$$eval('[data-shot]', links => links.map(link => link.dataset.shot));
    const canvas = await page.$('#taku-canvas');
    for (const shot of [...shots, 'right-shoulder', 'right-elbow', 'right-wrist', 'right-claw']) {
      const id = shot.replace(/^right-/, '');
      if (shot === id) await page.click('[data-shot="' + shot + '"]');
      else await page.evaluate(hash => { location.hash = hash; }, shot);
      await page.waitForFunction((target, right) => {
        const state = document.querySelector('.taku-stage').dataset;
        return state.settled === target && (!right || state.side === 'right');
      }, {}, id, shot !== id);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const filename = shot + (mobile ? '-mobile.webp' : '.webp');
      await canvas.screenshot({ path: fileURLToPath(new URL(filename, destination)), type: 'webp', quality: 87 });
      console.log('Rendered ' + filename);
    }
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
