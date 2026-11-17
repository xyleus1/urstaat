// Focused component regression check. Publisher playback is deliberately not
// asserted here; root QA tests those providers from the real website origin.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/graph.css"><style>body{margin:32px;background:#080a0b;color:#c7cdd0;font-family:Arial,sans-serif}#graph{max-width:1250px;margin:auto}</style><div id="graph"></div><script type="module">import{mountGraph}from'/graph.js';window.__researchGraph=mountGraph(document.querySelector('#graph'));window.heroToggles=0;addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented)window.heroToggles++});</script></html>`;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  if (request.url === '/') { response.writeHead(200, { 'content-type': 'text/html' }); response.end(fixture); return; }
  const file = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
  if (!file.startsWith(`${root}\\`) && !file.startsWith(`${root}/`)) { response.writeHead(403).end(); return; }
  try { const data = await readFile(file); response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); response.end(data); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
const errors = [];
const futureArtworkRequests = [], providerRequests = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/graph-media/future/')) futureArtworkRequests.push(url);
    if (!url.startsWith(base) && !url.startsWith('data:')) { providerRequests.push(url); request.abort(); }
    else request.continue();
  });
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.waitForFunction(() => window.__researchGraph?.status.layout.gw > 0);
  const state = () => page.evaluate(() => window.__researchGraph.status);
  const point = (year, value = 800) => page.evaluate(({ year, value }) => {
    const { layout } = window.__researchGraph.status, rect = document.querySelector('.graph-plot').getBoundingClientRect();
    return { x: rect.left + layout.gx + (year - 2015) / 25 * layout.gw, y: rect.top + layout.gy + layout.gh * (1 - value / 900) };
  }, { year, value });
  const menu = async count => {
    await page.waitForSelector('.graph-popup[data-mode="menu"] .graph-popup-choice', { visible: true, timeout: 5000 });
    assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), count);
    assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video, .graph-popup .graph-preview-media', nodes => nodes.length), 0, 'Year menus never mount media');
    assert.equal((await state()).preview.mode, 'menu');
  };
  const hover = async (year, value = 800) => {
    await page.mouse.move(10, 10);
    const p = await point(year, value); await page.mouse.move(p.x, p.y);
  };
  const choose = async id => {
    await page.click(`.graph-popup-choice[data-series="${id}"]`);
    await page.waitForSelector('.graph-popup[data-mode="event"] .graph-preview-media', { visible: true });
    assert.equal((await state()).preview.mode, 'event');
  };
  const expand = async id => {
    await page.click('.graph-expand:not(.graph-preview-back)');
    await page.waitForFunction(id => window.__researchGraph.status.opened?.id === id, {}, id);
    assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video', nodes => nodes.length), 0);
  };
  const close = async () => {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);
  };
  const closedPopup = async () => {
    await page.waitForFunction(() => window.__researchGraph.status.preview === null);
    assert.ok(await page.$eval('.graph-popup', node => {
      const wrapper = node.parentElement, rect = wrapper.getBoundingClientRect(), style = getComputedStyle(wrapper);
      return rect.width <= 1 || rect.height <= 1 || style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none';
    }), 'A closed tooltip wrapper cannot intercept the graph');
  };
  const verifyRail = async () => {
    const rail = await page.$$eval('.graph-label', nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect(), value = node.querySelector('.graph-label-value').getBoundingClientRect();
      const metric = node.querySelector('.graph-label-metric'), bounds = metric.getBoundingClientRect();
      return { name: node.querySelector('.graph-label-name').textContent, metric: metric.textContent, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, metricTop: bounds.top, valueBottom: value.bottom };
    }));
    assert.deepEqual(rail.map(item => item.metric), ['Language capability index', 'Embodied capability index', 'Task-specific capability index', 'Fleet scale index', 'Collected experience index', 'Cost-efficiency index']);
    rail.forEach(item => assert.ok(item.metricTop >= item.valueBottom - 1, `${item.name} index is below its multiple`));
    for (let a = 0; a < rail.length; a++) for (let b = a + 1; b < rail.length; b++) {
      if (Math.min(rail[a].right, rail[b].right) - Math.max(rail[a].left, rail[b].left) > 1) {
        const gap = Math.max(rail[a].top, rail[b].top) - Math.min(rail[a].bottom, rail[b].bottom);
        assert.ok(gap >= 4, `Rail labels have separation: ${rail[a].name} / ${rail[b].name}: ${gap}`);
      }
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  };
  await page.goto(base, { waitUntil: 'networkidle0' }); await ready();
  assert.deepEqual(Object.values((await state()).values), [100,100,100,100,100,100]);
  assert.equal((await state()).synthetic, true);
  assert.equal((await state()).baselineYear, 2026);
  assert.equal(await page.$('.graph-key'), null);
  const initialRail = await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent));
  const endpoints = (await state()).endpoints;
  for (const year of [2035, 2040]) {
    await page.evaluate(year => window.__researchGraph.setYear(year), year);
    assert.ok(Object.values((await state()).values).every(Number.isFinite), 'All six future curves remain numeric');
    assert.deepEqual((await state()).endpoints, endpoints);
    assert.deepEqual(await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent)), initialRail);
  }
  assert.equal(await page.evaluate(() => document.body.textContent.includes('No numerical forecast')), false);
  await verifyRail();

  // Even empty space in a historical year starts at the full menu, with no video request.
  await hover(2017); await menu(6);
  assert.equal((await state()).year, 2017);
  assert.deepEqual(providerRequests, []);
  await page.$eval('.graph-popup-choice', node => { node.dataset.qaIdentity = 'same-year'; });
  const sameYear = await point(2017, 700); await page.mouse.move(sameYear.x, sameYear.y);
  await menu(6);
  assert.equal(await page.$eval('.graph-popup-choice', node => node.dataset.qaIdentity), 'same-year');
  await hover(2032); await menu(6); assert.equal((await state()).year, 2032);
  await hover(2026, 100); await menu(6); assert.equal((await state()).year, 2026);
  assert.deepEqual(providerRequests, []);
  await page.mouse.move(10, 10); await closedPopup();
  await page.click('.graph-open-year'); await menu(6);
  await page.mouse.click(10, 10); await closedPopup();
  await hover(2026, 100); await menu(6);
  await page.keyboard.press('Escape'); assert.equal((await state()).preview, null);
  await closedPopup();
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  // A solo line still starts with a one-item menu; selecting it reveals the old preview.
  await page.evaluate(() => window.__researchGraph.selectView('series:llm'));
  await hover(2017); await menu(1); assert.deepEqual(providerRequests, []);
  await choose('llm');
  await page.waitForSelector('.graph-popup iframe', { visible: true });
  assert.equal((await state()).opened, null, 'Choosing a line opens its preview before its panel');
  assert.ok(await page.$eval('.graph-popup iframe', frame => frame.getBoundingClientRect().height >= 200));
  await page.click('.graph-preview-back'); await menu(1);
  await choose('llm'); await page.mouse.click(10, 10); await closedPopup();
  assert.equal(await page.$('.graph-popup iframe'), null, 'Closing an event preview removes its player');
  await hover(2017); await menu(1); await choose('llm'); await expand('llm-2017');
  await page.evaluate(() => window.__researchGraph.setYear(2036));
  assert.equal((await state()).opened.year, 2017, 'Scrubbing does not replace pinned media');
  await close();

  // Line clicks and the keyboard Open year action use exactly the same menu path.
  await page.evaluate(() => { window.__researchGraph.selectView('series:deployment'); window.__researchGraph.setYear(2032); });
  const line = await point(2032, (await state()).values.deployment);
  await page.mouse.click(line.x, line.y); await menu(1);
  await choose('deployment');
  assert.equal(await page.$eval('.graph-popup .graph-sketch-placeholder', node => node.textContent), 'Sketch forthcoming');
  await expand('deployment-2032');
  assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.graph-panel img, .graph-panel iframe, .graph-panel .is-unavailable', nodes => nodes.length), 0);
  await close();
  await page.mouse.move(10, 10);
  await page.focus('.graph-plot');
  await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, 2031);
  await page.keyboard.press('Home'); assert.equal((await state()).year, 2015);
  await page.keyboard.press('End'); assert.equal((await state()).year, 2040);
  await page.keyboard.press('Enter'); await menu(1);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.graph-popup[data-mode="event"]', { visible: true });
  await page.click('.graph-preview-back');
  await new Promise(resolve => setTimeout(resolve, 450));
  await menu(1);
  await page.keyboard.press('Escape');
  await closedPopup();
  await page.click('.graph-open-year'); await menu(1);
  await choose('deployment'); await expand('deployment-2040'); await close();
  assert.equal(await page.evaluate(() => document.activeElement.className), 'graph-open-year');

  await page.focus('.graph-plot');
  await page.evaluate(() => {
    window.__researchGraph.setYear(2030);
    document.querySelector('.graph-plot').dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
  });
  assert.equal((await state()).year, 2031);
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 190));
    for (let i = 0; i < 6; i++) {
      document.querySelector('.graph-plot').dispatchEvent(new WheelEvent('wheel', { deltaY: 8, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  });
  assert.equal((await state()).year, 2032);
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  // Touch starts at the menu too, including empty grid space and a single series.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(base, { waitUntil: 'networkidle0' }); await ready();
  await verifyRail();
  const blank = await point(2035, 800); await page.touchscreen.tap(blank.x, blank.y); await menu(6);
  await choose('hardware');
  await page.click('.graph-popup .graph-media-open');
  assert.equal((await state()).opened.id, 'hardware-2035');
  await close();
  await page.evaluate(() => window.__researchGraph.selectView('series:hardware'));
  const solo = await point(2024, 800); await page.touchscreen.tap(solo.x, solo.y); await menu(1);
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0, 0));
  const panStart = await point(2028, 400), beforePan = await page.evaluate(() => scrollY);
  const touch = await page.createCDPSession();
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: panStart.x, y: panStart.y }] });
  for (let step = 1; step <= 6; step++) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: panStart.x, y: panStart.y - step * 24 }] });
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(before => scrollY > before + 5, { timeout: 5000 }, beforePan);
  await touch.detach();
  await page.evaluate(() => window.__researchGraph.destroy());
  assert.equal(await page.evaluate(() => '__roboticsGraph' in window), false);
  assert.deepEqual(errors, []);
  assert.deepEqual(futureArtworkRequests, [], 'Placeholders do not request missing sketches');
  console.log('Graph browser checks passed: menu-first blank/line hover and click, previews, Back, zero menu media, annual input, unchanged future curves, rail metrics, desktop/mobile layout, touch, Escape, teardown.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
