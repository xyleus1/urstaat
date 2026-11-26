import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';
import { parts, edges } from '../../research/part-2/supply-data.js';

const preview = await startPreviewServer();
const live = process.argv.find((arg) => /^https?:/.test(arg));
let browser;
const frame = (p) =>
  p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

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
    await page.waitForSelector('#supply-map[data-part="elbow"] .index-step');
    assert.equal(await page.$$eval('[data-atlas-part]', (links) => links.length), 9);
    assert.equal(await page.$eval('#part-study', (el) => el.hidden), true);
    assert.equal(await page.$('.cutaway-slider, #cutaway-dialog'), null);
    assert.ok(!requests.some((u) => /cutaways\/[^/]+\.bin\.gz/.test(u)), 'Geometry loads on opening a study');
    assert.equal(await page.evaluate(() => scrollY), 0);
    const camera = await page.$eval('.taku-stage', (stage) => stage.dataset.view);
    for (const [id, p] of Object.entries(parts)) {
      console.log('  ' + id + ' · ' + p.edgeIds.length + ' connections');
      await page.click('[data-atlas-part="' + id + '"]');
      await page.waitForSelector('#supply-map[data-part="' + id + '"]');
      const first = await page.$('.index-step');
      assert.ok(
        await page.$$eval('.index-step', (steps) =>
          steps.every(
            (step) =>
              step.querySelector('.identity-name')?.textContent.trim() &&
              step.querySelector('.identity-flag[aria-label]') &&
              getComputedStyle(step).backgroundColor === getComputedStyle(document.body).backgroundColor &&
              !getComputedStyle(step.querySelector('.sequence-stage'))
                .fontFamily.toLowerCase()
                .includes('mono'),
          ),
        ),
        'Each stage shows a company and site flag on paper with a sans-serif category',
      );
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
    await page.click('[data-atlas-part="shoulder"]');
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
    assert.equal(
      await page.$eval('.taku-stage', (stage) => stage.dataset.view),
      camera,
      'Atlas tabs keep the same camera',
    );
    // A camera deep link establishes a visible physical callout. Independently choose
    // another atlas network, then open the callout without submitting a Trace.
    for (const [id, study, piece, expected] of [
      ['overview', 'panel', 3, 'al-sheet'],
      ['face', 'optics', 1, 'imager'],
      ['shoulder', 'actuator', 2, 'magnet'],
      ['elbow', 'actuator', 1, 'wire'],
      ['wrist', 'wrist', 2, 'rollers'],
    ]) {
      await page.evaluate((part) => {
        location.hash = part;
      }, id);
      await page.waitForSelector('.taku-stage[data-view="' + id + '"]');
      await page.click('[data-atlas-part="base"]');
      await page.waitForSelector('#supply-map[data-part="base"]');
      const opener = '[data-callout][data-part="' + id + '"]:not([hidden])';
      await page.waitForSelector(opener, { visible: true, timeout: 20000 });
      await page.click(opener);
      await page.waitForSelector('#part-study:not([hidden]) [data-cutaway-mode="live"]');
      assert.equal(await page.$eval('#supply-map', (el) => el.dataset.part), 'base');
      const controls = await page.$$('.study-piece');
      assert.equal(controls.length, study === 'panel' ? 5 : 6);
      assert.equal(
        await page.$$eval('.study-piece', (items) => items.every((el) => el.offsetWidth && el.offsetHeight)),
        true,
      );
      assert.equal(await page.$('.cutaway-explode, .cutaway-slider, .cutaway-reset'), null);
      assert.match(await page.$eval('.cutaway-poster', (el) => el.src), new RegExp(study + '\\.webp$'));
      await controls[piece].focus();
      await page.keyboard.press('Enter');
      assert.equal(await controls[piece].evaluate((el) => el.getAttribute('aria-pressed')), 'true');
      assert.equal(
        await page.$eval('#supply-map', (el) => el.dataset.part),
        'base',
        'Picking a piece leaves the atlas alone',
      );
      await page.focus('.cutaway-trace');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#part-study', (el) => el.hidden), true);
      assert.equal(await page.evaluate(() => document.activeElement.matches('[data-callout]')), true);
      await page.keyboard.press('Enter');
      await page.waitForSelector('.study-piece');
      await page.click('.study-piece[data-piece="' + piece + '"]');
      await page.click('.cutaway-trace');
      await page.waitForSelector(
        '#supply-map[data-part="' + id + '"] [data-site="' + expected + '"][aria-current="true"]',
      );
      assert.equal(await page.$eval('#part-study', (el) => el.hidden), true, 'Trace closes the study');
      assert.equal(await page.evaluate(() => document.activeElement.matches('#step-detail h3')), true);
      assert.equal(
        await page.$$eval('[data-wire]', (items) => items.length),
        parts[id].edgeIds.length,
        'Trace preserves the complete network',
      );
    }
    for (const id of ['side', 'claw', 'waist', 'base']) {
      await page.click('[data-atlas-part="' + id + '"]');
      await page.waitForSelector('#supply-map[data-part="' + id + '"]');
      await page.click('#engage-model');
      await page.keyboard.press('Enter');
      await page.waitForSelector('#part-study:not([hidden]) #part-study-host[data-part="' + id + '"]');
      assert.equal(await page.$('.study-piece, .cutaway-canvas'), null);
      await page.click('.cutaway-trace');
      await page.waitForSelector('[data-site="' + parts[id].focusNode + '"][aria-current="true"]');
      assert.equal(await page.$eval('#part-study', (el) => el.hidden), true);
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
