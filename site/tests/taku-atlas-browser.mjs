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
    await page.waitForSelector('.taku-stage[data-mode="' + (noWebGL ? 'stills' : 'live') + '"]');
    await page.waitForSelector('#part-inspector:not([hidden])');
    assert.match(await page.$eval('#focused-part', (e) => e.textContent), /right elbow/i);
    assert.ok(
      !requests.some((url) => /supply-(globe|data)|\.bin\.gz/.test(url)),
      'Map and cutaway meshes load on demand',
    );
    if (noWebGL) {
      await page.waitForNetworkIdle();
      await page.waitForFunction(() => document.querySelector('#still img').naturalWidth > 0);
    }
    const box = await (await page.$(noWebGL ? '#still img' : '#taku-canvas')).boundingBox();
    await page.mouse.click(box.x + box.width * 0.514, box.y + box.height * 0.48);
    await page.waitForSelector('#supply-map[data-part="elbow"]:not([hidden])');
    await page.click('#close-map');
    await page.focus('#trace-part');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#supply-map[data-part="elbow"]:not([hidden])');
    for (const [id, p] of Object.entries(parts)) {
      console.log('  ' + id + ' · ' + p.edgeIds.length + ' connections');
      await page.click('[data-shot="' + id + '"]');
      await page.waitForSelector('#supply-map[data-part="' + id + '"]');
      const first = await page.$('.index-step');
      await first.click();
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
          if (
            data[k] > 235 &&
            data[k + 1] >= 135 &&
            data[k + 1] <= 165 &&
            data[k + 2] >= 100 &&
            data[k + 2] <= 135
          ) {
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
    await page.focus('#supply-globe');
    await page.keyboard.press('ArrowRight');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.click('#close-map');
    await page.waitForSelector('#supply-map[hidden]');
    for (const [shot, type] of [
      ['overview', 'panel'],
      ['wrist', 'wrist'],
      ['elbow', 'actuator'],
    ]) {
      await page.click('[data-shot="' + shot + '"]');
      await page.click('#show-cutaway');
      await page.waitForSelector(
        '#cutaway-dialog[open] #cutaway-host[data-cutaway-mode="' + (noWebGL ? 'poster' : 'live') + '"]',
      );
      assert.match(await page.$eval('.cutaway-poster', (e) => e.src), new RegExp(type + '\\.webp$'));
      await page.click('.cutaway-part:nth-child(2)');
      await page.waitForSelector('.cutaway-part[aria-pressed="true"]');
      if (!noWebGL) {
        await page.focus('.cutaway-slider');
        await page.keyboard.press('Home');
        await frame(page);
        const closed = await (await page.$('.cutaway-canvas')).screenshot();
        await page.keyboard.press('End');
        await frame(page);
        assert.notDeepEqual(
          await (await page.$('.cutaway-canvas')).screenshot(),
          closed,
          'Exploding changes the model',
        );
      }
      await page.keyboard.press('Escape');
      await page.waitForSelector('#cutaway-dialog:not([open])');
      await page.waitForSelector('#cutaway-host:empty');
      assert.ok(await page.$eval('#show-cutaway', (e) => e === document.activeElement));
      const [piece, node] = { panel: [4, 'al-sheet'], wrist: [3, 'rollers'], actuator: [2, 'wire'] }[type];
      await page.click('#show-cutaway');
      await page.waitForSelector(
        '#cutaway-dialog[open] #cutaway-host[data-cutaway-mode="' + (noWebGL ? 'poster' : 'live') + '"]',
      );
      await page.click('.cutaway-part:nth-child(' + piece + ')');
      await page.waitForSelector('.cutaway-trace:not([hidden])', { visible: true });
      await page.click('.cutaway-trace');
      await page.waitForSelector('#supply-map:not([hidden]) [data-site="' + node + '"][aria-current="true"]');
      await page.click('#close-map');
    }
    assert.deepEqual(errors, []);
    await page.close();
    await browser.close();
    browser = null;
    console.log(width + 'px passed nine supply maps, full process diagrams and three exploded assemblies');
  }
} finally {
  await browser?.close();
  preview.server.close();
}
