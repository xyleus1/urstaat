import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';

const { server, origin } = await startPreviewServer();
const shots = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
const buttonFor = (id) => '[data-shot="' + id + '"]';
let browser;
try {
  const args = process.argv.includes('--no-webgl')
    ? ['--disable-webgl', '--disable-gpu']
    : process.argv.includes('--software')
      ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : [];
  browser = await puppeteer.launch({ headless: 'shell', args });
  for (const width of [320, 390, 1440]) {
    const mobile = width < 500;
    const page = await browser.newPage();
    const errors = [],
      models = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().includes('Shader Error')) errors.push(message.text());
    });
    page.on('response', (response) => {
      const path = new URL(response.url()).pathname;
      if (path.endsWith('.glb') || path.endsWith('taku-cpu.bin.gz')) models.push(path);
    });
    await page.setViewport({ width, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const mount = mobile ? '/urstaat/' : '/';
    await page.goto(origin + mount + 'research/part-2/#elbow', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.taku-stage[data-mode="live"]', { timeout: 60000 });
    assert.equal(await page.$eval('.taku-stage', (el) => el.dataset.settled), 'elbow');
    const tier = await page.$eval('.taku-stage', (stage) => stage.dataset.tier);
    assert.ok(tier === 'cpu' || tier === (mobile ? 'mobile' : 'desktop'));
    assert.deepEqual(models, [
      mount + 'research/part-2/assets/taku-' + (tier === 'cpu' ? 'cpu.bin.gz' : tier + '.glb'),
    ]);
    assert.deepEqual(
      await page.$$eval('[data-shot]', (links) => links.map((link) => link.dataset.shot)),
      shots,
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.setOfflineMode(true);
    // Previously an orbit immediately substituted a lower-DPR buffer and mesh.
    const orbitSizes = await page.$eval('#taku-canvas', async (canvas) => {
      const measure = () => [canvas.width, canvas.height];
      const before = measure();
      canvas.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      );
      const during = measure();
      await new Promise((resolve) => setTimeout(resolve, 320));
      return [before, during, measure()];
    });
    assert.deepEqual(orbitSizes[0], orbitSizes[1], 'Orbit preserves full drawing resolution');
    assert.deepEqual(orbitSizes[0], orbitSizes[2], 'Stopping preserves the same resolution');
    const seen = new Set();
    for (const id of shots) {
      if (mobile) await page.tap(buttonFor(id));
      else {
        await page.focus(buttonFor(id));
        await page.keyboard.press('Enter');
      }
      await page.waitForFunction(
        (shot) => document.querySelector('.taku-stage').dataset.settled === shot,
        {},
        id,
      );
      assert.equal(await page.$eval('.camera-views [aria-current]', (link) => link.dataset.shot), id);
      assert.equal(new URL(page.url()).hash, id === 'overview' ? '' : '#' + id);
      assert.equal(await page.$$eval('.camera-views [aria-current]', (elements) => elements.length), 1);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const screenshot = await (await page.$('#taku-canvas')).screenshot();
      seen.add(createHash('sha256').update(screenshot).digest('hex'));
    }
    assert.equal(seen.size, shots.length, 'Every preset shows a different composition');
    await page.click('[data-zoom="1.25"]');
    await page.click('#reset');
    await page.waitForSelector('.taku-stage[data-settled="overview"]');
    if (!mobile) {
      const rect = await (await page.$('#taku-canvas')).boundingBox();
      // The two end plates visible in the three-quarter overview.
      for (const [side, x, y] of [
        ['left', 0.568, 0.416],
        ['right', 0.455, 0.392],
      ]) {
        await page.mouse.click(rect.x + x * rect.width, rect.y + y * rect.height);
        await page.waitForFunction(
          (which) => {
            const state = document.querySelector('.taku-stage').dataset;
            return state.settled === 'elbow' && state.side === which;
          },
          {},
          side,
        );
        assert.equal(new URL(page.url()).hash, side === 'left' ? '#elbow' : '#right-elbow');
        await page.click('#reset');
        await page.waitForSelector('.taku-stage[data-settled="overview"]');
      }
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await page.click(buttonFor('face'));
      await page.click(buttonFor('wrist'));
      await page.waitForSelector('.taku-stage[data-settled="wrist"]');
      const canvas = await page.$('#taku-canvas');
      const before = await canvas.screenshot();
      await page.mouse.move(rect.x + 0.5 * rect.width, rect.y + 0.5 * rect.height);
      await page.mouse.down();
      await page.mouse.move(rect.x + 0.59 * rect.width, rect.y + 0.51 * rect.height, { steps: 5 });
      await page.mouse.up();
      await new Promise((resolve) => setTimeout(resolve, 450));
      assert.notDeepEqual(await canvas.screenshot(), before, 'Dragging orbits the settled close-up');
      assert.equal(new URL(page.url()).hash, '#wrist', 'Dragging is distinct from tapping another part');
    }
    if (width === 390) {
      await page.setOfflineMode(false);
      await page.tap(buttonFor('wrist'));
      await page.waitForSelector('[data-settled="wrist"]');
      const client = await page.createCDPSession();
      const box = await (await page.$('#taku-canvas')).boundingBox();
      const start = { x: box.x + box.width * 0.45, y: box.y + box.height * 0.5 };
      const capture = () => page.$('#taku-canvas').then((canvas) => canvas.screenshot());
      for (const [dx, dy] of [
        [64, 0],
        [0, 70],
      ]) {
        const before = await capture();
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
        for (let i = 1; i <= 5; i++)
          await client.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: start.x + (dx * i) / 5, y: start.y + (dy * i) / 5 }],
          });
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await new Promise((resolve) => setTimeout(resolve, 300));
        assert.notDeepEqual(await capture(), before, 'Touch can orbit horizontally and vertically');
      }
      if (tier !== 'cpu') {
        await page.evaluate(() =>
          document
            .querySelector('#taku-canvas')
            .getContext('webgl2')
            .getExtension('WEBGL_lose_context')
            .loseContext(),
        );
        await page.waitForSelector('.taku-stage[data-mode="live"][data-tier="cpu"][data-settled="wrist"]');
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log('All nine offline views passed at ' + width + 'px.');
  }

  const fallback = await browser.newPage();
  await fallback.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(origin + '/research/part-2/');
  await fallback.waitForSelector('.taku-stage[data-mode="live"][data-tier="cpu"]');
  for (const id of shots) {
    await fallback.click(buttonFor(id));
    await fallback.waitForSelector('.taku-stage[data-settled="' + id + '"]');
  }
  assert.equal(await fallback.$eval('.stage-tools', (el) => el.hidden), false);
  await fallback.close();

  const stalled = await browser.newPage();
  await stalled.evaluateOnNewDocument(() => {
    const Native = window.Worker;
    window.Worker = class extends Native {
      constructor(url, ...args) {
        if (String(url).includes('gpu-check.js')) return { terminate() {} };
        super(url, ...args);
      }
    };
  });
  await stalled.goto(origin + '/research/part-2/', { waitUntil: 'domcontentloaded' });
  await stalled.click(buttonFor('shoulder'));
  await stalled.waitForSelector('.taku-stage[data-mode="live"][data-tier="cpu"][data-settled="shoulder"]');
  await stalled.close();

  const noWorker = await browser.newPage();
  await noWorker.evaluateOnNewDocument(() => {
    window.Worker = undefined;
    window.WebGL2RenderingContext = undefined;
  });
  await noWorker.goto(origin + '/research/part-2/#face', { waitUntil: 'domcontentloaded' });
  await noWorker.waitForSelector('.taku-stage[data-mode="live"][data-tier="cpu"][data-settled="face"]');
  await noWorker.close();

  const plain = await browser.newPage();
  await plain.setJavaScriptEnabled(false);
  await plain.goto(origin + '/research/part-2/');
  const links = await plain.$$eval('[data-shot]', (nodes) => nodes.map((node) => node.href));
  for (const url of links) assert.equal((await fetch(url)).status, 200);
  await plain.close();
  console.log('WebGL fallback and JavaScript-free still links passed.');
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
