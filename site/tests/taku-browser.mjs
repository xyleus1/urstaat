import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';

const { server, origin } = await startPreviewServer();
const live = process.argv.find(arg => /^https?:/.test(arg));
const software = process.argv.includes('--software');
const browser = await puppeteer.launch({
  headless: 'shell',
  args: software ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--disable-gpu', '--disable-webgl'],
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const active = '.taku-stage[data-mode="live"]';
const canvas = '#taku-canvas';
const callout = (id, side = 'left') => `[data-callout][data-part="${id}"][data-side="${side}"]:not([hidden])`;
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const pin = (page, id, side = 'left') => page.$eval(`.robot-callouts g[data-part="${id}"][data-side="${side}"] circle`, node => [
  Number(node.getAttribute('cx')), Number(node.getAttribute('cy')),
]);

async function surfaceTouch(client, box, dx, dy) {
  const x = box.x + box.width * .56, y = box.y + box.height * .76;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 5; i++)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x: x + dx * i / 5, y: y + dy * i / 5 }],
    });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
try {
  const requestedWidth = process.argv.find(arg => arg.startsWith('--width='))?.slice(8);
  const widths = requestedWidth ? [Number(requestedWidth)] : [320, 390, 1440];
  for (const width of process.argv.includes('--posters-only') ? [] : widths) {
    const mobile = width < 500;
    const page = await browser.newPage();
    await page.bringToFront();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'warn' || message.type() === 'error') console.warn(message.text());
    });
    await page.setViewport({ width, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    if (software) {
      await page.setRequestInterception(true);
      page.on('request', r => r.url().includes('gpu-check.js')
        ? r.respond({ status: 200, contentType: 'text/javascript', body: "self.postMessage('hardware');" })
        : r.continue());
    }
    const url = live || origin + (mobile ? '/urstaat' : '') + '/research/part-2/';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector(active, { timeout: 60000 });
    } catch (error) {
      console.error('Viewer failed to start', width, errors, await page.$eval('.taku-stage', el => ({ ...el.dataset })));
      throw error;
    }
    await page.waitForSelector(callout('face'), { visible: true });
    assert.equal(await page.$$('[data-shot]').then(a => a.length), 0);
    assert.equal(await page.$$('[data-atlas-part]').then(a => a.length), 9);
    assert.equal(await page.$eval('.taku-stage', e => e.dataset.engaged), 'false');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const normal = await pin(page, 'elbow');
    const initialBox = await (await page.$(canvas)).boundingBox();
    const client = await page.createCDPSession();
    if (mobile) await surfaceTouch(client, initialBox, 0, -105);
    else {
      await page.mouse.move(initialBox.x + 22, initialBox.y + 65);
      await page.mouse.wheel({ deltaY: 180 });
    }
    await page.waitForFunction(() => scrollY > 18);
    assert.equal(await page.$eval('.taku-stage', e => e.dataset.engaged), 'false', 'Page scrolling stays native');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await frame(page);
    await page.click(callout('face'));
    await page.waitForSelector('#part-study-host[data-part="face"]');
    await page.waitForSelector('.study-piece');
    assert.equal(await page.$$('.study-piece').then(a => a.length), 6);
    assert.equal(await page.$eval('#supply-map', e => e.dataset.part), 'overview');
    assert.deepEqual(await pin(page, 'elbow'), normal, 'Inspecting another surface preserves the camera');
    await page.click('.study-close');
    await page.click('[data-atlas-part="wrist"]');
    await page.waitForSelector('#supply-map[data-part="wrist"]');
    assert.equal(await page.$eval('.taku-stage', e => e.dataset.part), 'wrist');
    assert.deepEqual(await pin(page, 'elbow'), normal, 'Atlas tabs preserve the orbit');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    if (mobile) {
      const b = await (await page.$(canvas)).boundingBox();
      await page.touchscreen.tap(b.x + b.width * .08, b.y + b.height * .75);
    } else {
      await page.focus(canvas);
      await page.keyboard.press('Enter');
    }
    await page.waitForSelector('[data-engaged="true"]');
    const size = () => page.$eval(canvas, c => [c.width, c.height]);
    const originalSize = await size();
    const beforeOrbit = await (await page.$(canvas)).screenshot();
    const b = await (await page.$(canvas)).boundingBox();
    if (mobile) await surfaceTouch(client, b, 76, -23);
    else {
      await page.mouse.move(b.x + b.width * .34, b.y + b.height * .8);
      await page.mouse.down(); await page.mouse.move(b.x + b.width * .58, b.y + b.height * .78, { steps: 8 }); await page.mouse.up();
    }
    await wait(250);
    assert.notDeepEqual(await (await page.$(canvas)).screenshot(), beforeOrbit);
    assert.deepEqual(await size(), originalSize, 'Moving keeps the full render resolution');
    await page.click('#reset');
    await page.focus(canvas);
    for (let i = 0; i < 20; i++) await page.keyboard.press('+');
    await page.waitForSelector('[data-zoom="1.25"]:disabled');
    await page.$eval(canvas, el => {
      for (let i = 0; i < 20; i++) el.dispatchEvent(new WheelEvent('wheel', { deltaY: 190, bubbles: true, cancelable: true }));
    });
    await page.waitForSelector('[data-zoom="0.8"]:disabled');
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-engaged="false"]');
    await page.evaluate(() => { location.hash = 'right-elbow'; });
    await page.waitForSelector('[data-settled="elbow"][data-part="elbow"][data-side="right"]');
    await page.waitForSelector(callout('elbow', 'right'));
    await page.click(callout('elbow', 'right'));
    await page.waitForSelector('#part-study-host[data-part="elbow"][data-side="right"]');
    await page.keyboard.press('Escape');
    if (software && width === 390 && await page.$eval('.taku-stage', el => el.dataset.tier === 'mobile')) {
      await page.$eval(canvas, el => el.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
      await page.waitForSelector('[data-mode="live"][data-tier="cpu"][data-part="elbow"][data-side="right"]');
      await page.waitForSelector(callout('elbow', 'right'));
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(width + 'px: native scroll, orbit, limits, inline studies, source controls and deep links passed');
  }

  // A slow or failed renderer must leave both poster picking and evidence usable.
  const page = await browser.newPage();
  await page.bringToFront();
  await page.setViewport({ width: 1200, height: 850 });
  await page.setRequestInterception(true);
  let hold;
  const blockedModel = new Promise(resolve => { hold = resolve; });
  page.on('request', r => /gpu-check\.js/.test(r.url())
    ? r.respond({ status: 200, contentType: 'text/javascript', body: "self.postMessage('unavailable');" })
    : /taku-cpu\.bin\.gz/.test(r.url()) ? hold(r) : r.continue());
  await page.goto(live || origin + '/research/part-2/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(callout('face'));
  assert.equal(await page.$eval('.taku-stage', e => e.dataset.mode), 'loading');
  await page.click(callout('face'));
  await page.waitForSelector('#part-study-host[data-part="face"] .study-piece');
  await page.click('.cutaway-trace');
  await page.waitForSelector('#supply-map[data-part="face"]');
  assert.equal(await page.$eval('#part-study', el => el.hidden), true);
  await (await blockedModel).abort();
  await page.waitForSelector('.taku-stage[data-mode="stills"]');
  await page.click(callout('face'));
  await page.waitForSelector('#part-study-host[data-part="face"] .study-piece');
  await page.close();
  console.log('Poster-only inspection and Trace passed');
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
