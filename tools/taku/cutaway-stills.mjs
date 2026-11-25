// Run after cutaway-models.mjs. The stills are captures of the same shader and mesh as the interactive study.
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startPreviewServer } from '../../site/tests/preview-server.mjs';
const require = createRequire(new URL('../../site/package.json', import.meta.url));
const puppeteer = require('puppeteer');
const { server, origin } = await startPreviewServer();
let browser;
try {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1080, height: 740, deviceScaleFactor: 1 });
  await page.goto(origin + '/hero/assets/LICENSE-MiniCheetah.txt');
  await page.evaluate(() => {
    document.body.replaceChildren();
    document.body.style.margin = '0';
    const host = document.createElement('div');
    host.id = 'host';
    document.body.append(host);
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/research/part-2/cutaways/cutaways.css';
    document.head.append(css);
  });
  await page.addStyleTag({
    content:
      '.cutaway-scene {height:550px!important;} .cutaway-camera-tools,.cutaway-hint {visibility:hidden;}',
  });
  for (const id of ['actuator', 'wrist', 'panel']) {
    const ok = await page.evaluate(async (id) => {
      window.study?.destroy();
      const { mountTakuCutaway } = await import('/hero/taku-cutaways.js');
      window.study = mountTakuCutaway(document.querySelector('#host'), { part: id });
      return window.study.ready;
    }, id);
    if (!ok) throw Error('WebGL failed for ' + id);
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const stage = await page.$('.cutaway-scene');
    const path = fileURLToPath(new URL('../../research/part-2/cutaways/' + id + '.webp', import.meta.url));
    await stage.screenshot({ path, type: 'webp', quality: 91 });
    console.log('Rendered ' + id);
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
