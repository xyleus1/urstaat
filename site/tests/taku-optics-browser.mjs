import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';

const { server, origin } = await startPreviewServer();
const reduce = (page, value) =>
  page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: value ? 'reduce' : 'no-preference' }]);
const spinning = (page) => page.$eval('.cutaway-study', (el) => el.dataset.spinning === 'true');
const spinRequested = (page) =>
  page.$eval('.cutaway-spin', (el) => el.getAttribute('aria-pressed') === 'true');
const afterDraw = (page) =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const routes = ['camera', 'imager', 'camera', 'camera', 'glass', 'window'];

async function run(canvas2D) {
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: canvas2D
      ? ['--disable-webgl', '--disable-gpu']
      : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport({ width: 850, height: 850 });
    await reduce(page, true);
    await page.goto(origin + '/hero/assets/LICENSE-MiniCheetah.txt');
    await page.addStyleTag({ url: origin + '/research/part-2/cutaways/cutaways.css' });
    await page.addStyleTag({ content: 'body{margin:0}.cutaway-scene{height:420px}' });
    await page.evaluate(async () => {
      const host = document.createElement('div');
      document.body.replaceChildren(host);
      const { mountTakuCutaway } = await import('/hero/taku-cutaways.js');
      window.mount = async (part) => {
        window.study?.destroy();
        window.study = mountTakuCutaway(host, {
          part,
          onTrace: (id) => {
            window.lastRoute = id;
          },
        });
        return window.study.ready;
      };
      await window.mount('optics');
    });
    assert.equal(
      await page.$eval('[data-cutaway-renderer]', (e) => e.dataset.cutawayRenderer),
      canvas2D ? 'canvas2d' : 'webgl',
    );
    assert.equal(await spinning(page), false, 'reduced motion starts paused');
    assert.equal(await page.$$eval('.cutaway-part', (items) => items.length), routes.length);
    // Each point is inside a different visible surface in the default exploded projection.
    // Coordinates are expressed in viewport heights relative to the image center.
    const samples = [
      [-0.55, 0.2],
      [-0.34, 0.12],
      [-0.17, 0.02],
      [0.06, -0.07],
      [0.26, -0.14],
      [0.47, -0.21],
    ];
    const bounds = await (await page.$('.cutaway-canvas')).boundingBox();
    for (const [index, [dx, dy]] of samples.entries()) {
      const x = bounds.x + bounds.width / 2 + bounds.height * dx;
      const y = bounds.y + bounds.height / 2 + bounds.height * dy;
      await page.mouse.click(x, y);
      await page.waitForFunction(
        (i) => document.querySelector('.cutaway-study').dataset.selected === String(i),
        { timeout: 2200 },
        index,
      );
      await page.click('.cutaway-trace');
      assert.equal(await page.evaluate(() => window.lastRoute), routes[index]);
      await page.click('.cutaway-part:nth-child(' + (index + 1) + ')');
      assert.equal(await page.$eval('.cutaway-study', (e) => e.dataset.selected), '-1');
    }

    await reduce(page, false);
    await page.waitForFunction(() => document.querySelector('.cutaway-study').dataset.spinning === 'true');
    const part = await (await page.$('.cutaway-part')).boundingBox();
    await page.mouse.move(part.x + 12, part.y + 12);
    await page.mouse.down();
    assert.equal(await spinning(page), false);
    assert.equal(await spinRequested(page), true, 'holding a subpart preserves requested spin');
    await page.mouse.up();
    assert.equal(await spinning(page), true, 'choosing resumes spin');
    await page.click('.cutaway-part');
    assert.equal(await spinning(page), true, 'deselecting also resumes spin');

    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(5, bounds.y + bounds.height + 30, { steps: 4 });
    assert.equal(await spinning(page), false);
    await page.mouse.up();
    assert.equal(await spinning(page), true, 'outside release resumes after orbit');
    await page.evaluate(() => {
      const control = document.querySelector('.cutaway-part');
      for (const id of [51, 52])
        control.dispatchEvent(
          new PointerEvent('pointerdown', { pointerId: id, pointerType: 'touch', button: 0, bubbles: true }),
        );
      window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 51 }));
    });
    assert.equal(await spinning(page), false, 'other touch is still held');
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 52 })));
    assert.equal(await spinning(page), true);
    const canvas = await page.$('.cutaway-canvas');
    const a = await canvas.screenshot();
    await new Promise((resolve) => setTimeout(resolve, 450));
    assert.notDeepEqual(await canvas.screenshot(), a, 'resumed rotation actually changes the picture');

    await page.click('.cutaway-spin');
    for (const id of ['actuator', 'wrist', 'panel', 'optics']) {
      assert.equal(await page.evaluate((part) => window.study.setPart(part), id), true);
      await page.click('.cutaway-part');
      await page.click('.cutaway-reset');
      assert.equal(await spinning(page), false, id + ' respects explicit pause');
    }
    await page.evaluate(() => window.mount('optics'));
    assert.equal(await spinning(page), false, 'closing and reopening retains explicit pause');
    await reduce(page, true);
    await page.click('.cutaway-spin');
    await page.click('.cutaway-part');
    assert.equal(await spinning(page), true, 'explicit opt-in works with reduced motion');
    await page.setViewport({ width: 390, height: 844 });
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
    await page.$eval('.cutaway-canvas', (e) => e.scrollIntoView({ block: 'start' }));
    const mobile = await (await page.$('.cutaway-canvas')).boundingBox();
    const touch = { x: mobile.x + mobile.width / 2, y: mobile.y + mobile.height / 2 };
    for (const release of ['touchEnd', 'touchCancel']) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
      assert.equal(await spinning(page), false, 'touch suspends orbit on the canvas');
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: 12, y: mobile.y + mobile.height + 12 }],
      });
      await cdp.send('Input.dispatchTouchEvent', { type: release, touchPoints: [] });
      assert.equal(await spinning(page), true, release + ' resumes on the phone');
    }
    await cdp.detach();
    await page.click('.cutaway-spin');
    // Verify that a failed geometry request still exposes the published still and routes.
    await page.setRequestInterception(true);
    page.on('request', (request) =>
      request.url().endsWith('/cutaways/optics.bin.gz') ? request.abort() : request.continue(),
    );
    await page.setCacheEnabled(false);
    assert.equal(await page.evaluate(() => window.mount('optics')), false);
    await page.waitForFunction(() => {
      const image = document.querySelector('.cutaway-poster');
      return !image.hidden && image.naturalWidth === 1080;
    });
    await page.click('.cutaway-part:nth-child(6)');
    await page.click('.cutaway-trace');
    assert.equal(await page.evaluate(() => window.lastRoute), 'window');
    await afterDraw(page);
    assert.deepEqual(errors, []);
    console.log(
      (canvas2D ? 'Canvas 2D' : 'WebGL') +
        ': six optical surfaces, six routes, rotation and fallback passed.',
    );
  } finally {
    await browser.close();
  }
}

try {
  await run(true);
  await run(false);
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
