import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';
import { parts, edges } from '../../research/part-2/supply-data.js';

const preview = await startPreviewServer();
const live = process.argv.find((arg) => /^https?:/.test(arg));
let browser;
const frame = (p) =>
  p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

function trackCutawayFrames() {
  const NativeWorker = window.Worker;
  if (!NativeWorker) return;
  window.Worker = class extends NativeWorker {
    constructor(url, options) {
      super(url, options);
      if (!new URL(url, document.baseURI).pathname.endsWith('/taku-cutaway-raster.js')) return;
      this.frames = { pending: 0, completed: 0 };
      window.cutawayFrames = this.frames;
      this.addEventListener('message', ({ data }) => {
        if (data.type === 'frame') {
          this.frames.pending--;
          this.frames.completed++;
        }
      });
    }

    postMessage(message, ...args) {
      super.postMessage(message, ...args);
      if (this.frames && message.type === 'draw') this.frames.pending++;
    }

    terminate() {
      if (this.frames && window.cutawayFrames === this.frames) window.cutawayFrames = null;
      super.terminate();
    }
  };
}

async function captureExplosion(page, model, key, percent) {
  const before = await page.evaluate(() => window.cutawayFrames?.completed ?? null);
  await page.keyboard.press(key);
  await page.waitForSelector(`.cutaway-study[data-explode="${percent}"]`);
  await frame(page);
  // The worker can still be painting the preceding slider value after two animation frames.
  // Its message handler presents the image and submits any newer queued pose in the same task.
  if (before !== null) {
    await page.waitForFunction((previous) => {
      const current = window.cutawayFrames;
      return !current || (current.completed > previous && current.pending === 0);
    }, { timeout: 15000 }, before);
  }
  return model.screenshot();
}

try {
  for (const [width, noWebGL] of [
    [390, true],
    [1440, false],
  ]) {
    browser = await puppeteer.launch({
      headless: 'shell',
      args: noWebGL
        ? ['--disable-gpu', '--disable-webgl']
        : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    const page = await browser.newPage(),
      errors = [],
      requests = [];
    await page.evaluateOnNewDocument(trackCutawayFrames);
    await page.bringToFront();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.status() + ' ' + r.url());
      requests.push(r.url());
    });
    await page.setViewport({
      width,
      height: width < 500 ? 844 : 900,
      isMobile: width < 500,
      hasTouch: width < 500,
      deviceScaleFactor: width < 500 ? 2 : 1,
    });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const url = live || preview.origin + (noWebGL ? '/urstaat/' : '/') + 'research/part-2/';
    console.log('Checking ' + width + 'px at ' + url);
    await page.goto(url + '#right-elbow', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.taku-stage[data-mode="live"]', { timeout: 60000 });
    await page.waitForSelector('#part-inspector:not([hidden])');
    assert.match(await page.$eval('#focused-part', (e) => e.textContent), /right elbow/i);
    await page.waitForSelector('#supply-map[data-part="elbow"]:not([hidden]) .index-step');
    assert.equal(await page.$('#trace-part, #close-map, #instructions'), null);
    const widthCheck = await page.evaluate(() => {
      const canvas = document.querySelector('#taku-canvas').getBoundingClientRect();
      const heading = document.querySelector('.taku-heading').getBoundingClientRect();
      const inputs = document.querySelector('#supply-map').getBoundingClientRect();
      return {
        left: canvas.left, right: canvas.right, viewport: document.documentElement.clientWidth,
        headingLeft: heading.left, inputsLeft: inputs.left,
      };
    });
    assert.ok(Math.abs(widthCheck.left) < 1 && Math.abs(widthCheck.right - widthCheck.viewport) < 1,
      'The robot canvas reaches both edges of the viewport');
    assert.ok(widthCheck.headingLeft > 0 && Math.abs(widthCheck.inputsLeft - widthCheck.headingLeft) < 1,
      'Inputs and headings share the reading column');
    if (width < 500) {
      assert.ok(await page.evaluate(() => {
        const canvas = document.querySelector('#taku-canvas').getBoundingClientRect();
        const toolbar = document.querySelector('.stage-tools').getBoundingClientRect();
        return toolbar.top >= canvas.bottom - 1;
      }), 'Phone controls leave the model unobstructed');
    }
    assert.ok(!requests.some((u) => /cutaways\/[^/]+\.bin\.gz/.test(u)), 'Cutaway geometry loads when opened');
    assert.equal(await page.evaluate(() => scrollY), 0, 'Automatic inputs preserve the opening camera position');
    if (width >= 500) {
      await page.hover('#show-cutaway');
      await page.waitForSelector('.taku-cutaway-connector[data-visible] path[d]');
      await page.mouse.move(0, 0);
      await page.waitForSelector('.taku-cutaway-connector:not([data-visible])');
    } else {
      assert.equal(await page.$('.taku-cutaway-connector[data-visible]'), null);
    }
    for (const [id, p] of Object.entries(parts)) {
      console.log('  ' + id + ' · ' + p.edgeIds.length + ' connections');
      await page.click('[data-shot="' + id + '"]');
      await page.waitForSelector('#supply-map[data-part="' + id + '"]');
      const first = await page.$('.index-step');
      assert.ok(await page.$$eval('.index-step', (steps) => steps.every((step) =>
        step.querySelector('.identity-name')?.textContent.trim() &&
        step.querySelector('.identity-flag[aria-label]') &&
        getComputedStyle(step).backgroundColor === getComputedStyle(document.body).backgroundColor &&
        !getComputedStyle(step.querySelector('.sequence-stage')).fontFamily.toLowerCase().includes('mono')
      )), 'Each stage shows a company and site flag on paper with a sans-serif category');
      await first.click();
      assert.ok(await page.$eval('#step-detail .identity-name', (e) => e.textContent.trim()));
      assert.ok(await page.$eval('#step-detail .supply-sources a', (a) => a.href.startsWith('https://')));
      await page.click('#step-detail .connection-link');
      await page.waitForSelector('.edge-ends .connection-link');
      assert.equal(await page.$$('.edge-ends button').then((a) => a.length), 2);
      await frame(page);
      assert.equal(
        await page.$$eval('[data-wire]', (a) => a.length),
        p.edgeIds.length,
        'Every route is also drawn in the sequence',
      );
      const ids = new Set(p.edgeIds.flatMap((k) => [edges[k].from, edges[k].to]));
      assert.equal(await page.$$('.index-step').then((x) => x.length), ids.size);
    }
    await page.click('[data-projection="flat"]');
    await frame(page);
    // Hit the ink of a real transcontinental connection, independently of the HTML index.
    await page.click('[data-shot="shoulder"]');
    await page.waitForSelector('#supply-map[data-part="shoulder"] [data-site="motor"]');
    await page.click('[data-site="motor"]');
    await page.$eval('#supply-globe', (c) => c.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await frame(page);
    const points = await page.$eval('#supply-globe', (c) => {
      const bounds = c.getBoundingClientRect(),
        w = c.width,
        h = c.height;
      const data = c.getContext('2d').getImageData(0, 0, w, h).data,
        tiles = new Map();
      for (let y = 4; y < h - 4; y += 2)
        for (let x = 4; x < w - 4; x += 2) {
          const k = 4 * (y * w + x);
          // Bright neutral ink is reserved for the active routes, arrows and selected pin.
          if (data[k] >= 248 && data[k + 1] >= 248 && data[k + 2] >= 248) {
            const cell = (x >> 5) + ',' + (y >> 5);
            if (!tiles.has(cell))
              tiles.set(cell, [
                bounds.left + ((x + 0.5) * bounds.width) / w,
                bounds.top + ((y + 0.5) * bounds.height) / h,
              ]);
          }
        }
      return [...tiles.values()];
    });
    let pickedRoute = false;
    for (const [x, y] of points.slice(0, 30)) {
      await page.mouse.click(x, y);
      if (await page.$('.edge-ends')) {
        pickedRoute = true;
        break;
      }
    }
    assert.ok(pickedRoute, 'Selecting a drawn route opens its manufacturing evidence');
    await frame(page);
    const flat = await page.$eval('#supply-globe', (c) => c.toDataURL());
    await page.click('[data-projection="globe"]');
    await frame(page);
    assert.notEqual(await page.$eval('#supply-globe', (c) => c.toDataURL()), flat);
    const grayscale = await page.$eval('#supply-globe', (canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) return false;
      }
      return true;
    });
    assert.ok(grayscale, 'Land, routes, labels and the selected site stay grayscale');
    await page.focus('#supply-globe');
    await page.keyboard.press('ArrowRight');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    for (const [shot, type] of [
      ['overview', 'panel'],
      ['wrist', 'wrist'],
      ['face', 'optics'],
      ['elbow', 'actuator'],
    ]) {
      await page.click('[data-shot="' + shot + '"]');
      if (type === 'panel') {
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      }
      await page.click('#show-cutaway');
      await page.waitForSelector(
        '#cutaway-dialog[open] #cutaway-host[data-cutaway-mode="live"]',
      );
      assert.match(await page.$eval('.cutaway-poster', (e) => e.src), new RegExp(type + '\\.webp$'));
      const spinning = type === 'panel';
      assert.equal(await page.$eval('.cutaway-spin', (b) => b.getAttribute('aria-pressed')), String(spinning));
      if (spinning) {
        const model = await page.$('.cutaway-canvas');
        await page.click('.cutaway-part:nth-child(2)');
        await page.click('.cutaway-part:nth-child(2)');
        assert.equal(await page.$eval('.cutaway-spin', (b) => b.getAttribute('aria-pressed')), 'true',
          'Releasing a part restores automatic rotation');
        const initial = await model.screenshot();
        await new Promise((resolve) => setTimeout(resolve, 400));
        assert.notDeepEqual(await model.screenshot(), initial, 'The exploded assembly turns on its own');
        await page.click('.cutaway-spin');
        assert.equal(await page.$eval('.cutaway-spin', (b) => b.getAttribute('aria-pressed')), 'false');
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await page.click('.cutaway-explode');
        await page.waitForFunction(() => document.querySelector('.cutaway-slider').value === '0');
        await page.click('.cutaway-explode');
        await page.waitForFunction(() => document.querySelector('.cutaway-slider').value === '100');
      }
      await page.click('.cutaway-part:nth-child(2)');
      await page.waitForSelector('.cutaway-part[aria-pressed="true"]');
      {
        assert.equal(await page.$eval('.cutaway-spin', (b) => b.disabled), false);
        if (noWebGL) assert.equal(await page.$eval('#cutaway-host', (e) => e.dataset.cutawayRenderer), 'canvas2d');
        await page.focus('.cutaway-slider');
        const model = await page.$('.cutaway-canvas');
        await model.scrollIntoView();
        const closed = await captureExplosion(page, model, 'Home', 0);
        const open = await captureExplosion(page, model, 'End', 100);
        assert.notDeepEqual(open, closed, type + ' changes visibly between assembled and exploded');
      }
      await page.keyboard.press('Escape');
      await page.waitForSelector('#cutaway-dialog:not([open])');
      await page.waitForSelector('#cutaway-host:empty');
      assert.ok(await page.$eval('#show-cutaway', (e) => e === document.activeElement));
      const [piece, node] = { panel: [4, 'al-sheet'], wrist: [3, 'rollers'], actuator: [2, 'wire'], optics: [2, 'imager'] }[type];
      await page.click('#show-cutaway');
      await page.waitForSelector(
        '#cutaway-dialog[open] #cutaway-host[data-cutaway-mode="live"]',
      );
      await page.click('.cutaway-part:nth-child(' + piece + ')');
      await page.waitForSelector('.cutaway-trace:not([hidden])', { visible: true });
      await page.click('.cutaway-trace');
      await page.waitForSelector('#supply-map:not([hidden]) [data-site="' + node + '"][aria-current="true"]');
    }
    assert.deepEqual(errors, []);
    await page.close();
    await browser.close();
    browser = null;
    console.log(width + 'px passed nine supply maps, full process diagrams and four exploded assemblies');
  }
} finally {
  await browser?.close();
  preview.server.close();
}
