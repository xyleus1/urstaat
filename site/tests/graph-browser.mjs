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
const futureArtworkRequests = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', request => request.url().startsWith(base) || request.url().startsWith('data:') ? request.continue() : request.abort());
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/graph-media/future/')) futureArtworkRequests.push(request.url()); });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__researchGraph?.status.layout.gw > 0);
  const state = () => page.evaluate(() => window.__researchGraph.status);
  assert.deepEqual(Object.values((await state()).values), [100,100,100,100,100,100]);
  assert.equal(await page.$('.graph-key'), null);
  const initialRail = await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent));
  await page.evaluate(() => window.__researchGraph.setYear(2034.6));
  assert.equal((await state()).year, 2035);
  assert.deepEqual(await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent)), initialRail);

  // All six curves coincide; keyboard access must expose all six choices.
  await page.evaluate(() => { window.__researchGraph.setYear(2026); window.__researchGraph.selectView('all'); });
  await page.click('.graph-open-year');
  try { await page.waitForSelector('.graph-popup-choice', { visible: true, timeout: 5000 }); }
  catch (error) {
    console.log(JSON.stringify(await page.evaluate(() => ({ state: window.__researchGraph.status, popup: document.querySelector('.graph-popup')?.outerHTML, divs: [...document.querySelectorAll('.graph-plot div')].map(node => ({ style: node.getAttribute('style'), text: node.textContent.slice(0,100) })) })), null, 2));
    console.log(errors); throw error;
  }
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 6);
  await page.keyboard.press('Escape');
  assert.equal((await state()).preview, null);
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  await page.click('.graph-open-year');
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  await page.click('.graph-popup-choice');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);
  assert.equal(await page.evaluate(() => document.activeElement.className), 'graph-open-year', 'Chooser retains original opener');

  // A real line click, not a test-only state hook, opens the correct annual event.
  await page.evaluate(() => { window.__researchGraph.selectView('series:deployment'); window.__researchGraph.setYear(2032); });
  const coordinates = await page.evaluate(() => {
    const { layout, values } = window.__researchGraph.status;
    const rect = document.querySelector('.graph-plot').getBoundingClientRect();
    return { x: rect.left + layout.gx + 17 / 25 * layout.gw, y: rect.top + layout.gy + layout.gh * (1 - values.deployment / 900) };
  });
  await page.mouse.click(coordinates.x, coordinates.y);
  try { await page.waitForFunction(() => window.__researchGraph.status.opened?.year === 2032, { timeout: 5000 }); }
  catch (error) { console.log(JSON.stringify({ coordinates, state: await state(), errors }, null, 2)); throw error; }
  assert.equal(await page.$eval('.graph-panel .graph-sketch-placeholder', node => node.textContent), 'Sketch forthcoming');
  assert.equal(await page.$$eval('.graph-panel img, .graph-panel iframe', nodes => nodes.length), 0, 'An intentional placeholder does not request missing media');
  assert.equal(await page.$$eval('.graph-panel .is-unavailable', nodes => nodes.length), 0, 'An intentional placeholder is not an error state');
  await page.evaluate(() => window.__researchGraph.setYear(2036));
  assert.equal((await state()).opened.year, 2032, 'Scrubbing must not replace pinned media');
  await page.evaluate(() => window.__researchGraph.openStory('llm', 2017));
  assert.equal(await page.$$eval('.graph-panel', nodes => nodes.length), 1);
  assert.equal((await state()).opened.id, 'llm-2017');
  assert.equal(await page.$$eval('.graph-panel iframe', nodes => nodes.length), 1);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);
  assert.equal(await page.$$eval('.graph-panel iframe', nodes => nodes.length), 0);
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  await page.focus('.graph-plot');
  await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, 2035);
  await page.keyboard.press('Home'); assert.equal((await state()).year, 2015);
  await page.keyboard.press('End'); assert.equal((await state()).year, 2040);
  await page.mouse.move(coordinates.x, coordinates.y);
  await page.evaluate(() => window.__researchGraph.setYear(2030));
  await page.mouse.wheel({ deltaY: 100 });
  await page.waitForFunction(() => window.__researchGraph.status.year === 2031);
  await page.evaluate(async () => {
    const plot = document.querySelector('.graph-plot');
    await new Promise(resolve => setTimeout(resolve, 190));
    for (let i = 0; i < 6; i++) {
      plot.dispatchEvent(new WheelEvent('wheel', { deltaY: 8, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  });
  assert.equal((await state()).year, 2032, 'Fine trackpad deltas accumulate into exactly one annual step');

  // Enter the real hover tooltip across the chart-to-popup gap, then expand it.
  await page.evaluate(() => { window.__researchGraph.selectView('series:llm'); window.__researchGraph.setYear(2017); });
  const hoverPoint = await page.evaluate(() => {
    const { layout, values } = window.__researchGraph.status, rect = document.querySelector('.graph-plot').getBoundingClientRect();
    return { x: rect.left + layout.gx + 2 / 25 * layout.gw, y: rect.top + layout.gy + layout.gh * (1 - values.llm / 900) };
  });
  await page.mouse.move(hoverPoint.x, hoverPoint.y);
  await page.waitForSelector('.graph-popup iframe', { visible: true });
  assert.ok(await page.$eval('.graph-popup iframe', frame => frame.getBoundingClientRect().height >= 200));
  const expandRect = await page.$eval('.graph-expand', button => { const r = button.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(expandRect.x, expandRect.y, { steps: 12 });
  await page.mouse.click(expandRect.x, expandRect.y);
  assert.equal((await state()).opened.id, 'llm-2017');
  assert.equal(await page.$$eval('.graph-popup iframe', nodes => nodes.length), 0);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);

  // The future placeholder is the same clickable media surface as a final sketch.
  await page.evaluate(() => { window.__researchGraph.selectView('series:hardware'); window.__researchGraph.setYear(2030); });
  const sketchPoint = await page.evaluate(() => {
    const { layout, values } = window.__researchGraph.status, rect = document.querySelector('.graph-plot').getBoundingClientRect();
    return { x: rect.left + layout.gx + 15 / 25 * layout.gw, y: rect.top + layout.gy + layout.gh * (1 - values.hardware / 900) };
  });
  await page.mouse.move(sketchPoint.x, sketchPoint.y);
  await page.waitForSelector('.graph-popup .graph-sketch-placeholder', { visible: true });
  await page.click('.graph-popup .graph-media-open');
  assert.equal((await state()).opened.id, 'hardware-2030');
  assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);

  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 390, height: 844 });
  await page.waitForFunction(() => window.__researchGraph.status.layout.compact);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.evaluate(() => window.__researchGraph.openStory('hardware', 2027));
  assert.equal((await state()).opened.kind, 'scenario');
  assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.evaluate(() => window.__researchGraph.closePanel());
  assert.equal(await page.$eval('.graph-panel', panel => panel.hidden), true);
  await page.evaluate(() => window.__researchGraph.destroy());
  assert.equal(await page.evaluate(() => '__roboticsGraph' in window), false);
  assert.deepEqual(errors, []);
  assert.deepEqual(futureArtworkRequests, [], 'No placeholder issues a request for a missing sketch');
  console.log('Graph component browser checks passed: rail, annual input, overlap, media replacement, future placeholders, Escape, mobile, reduced motion, teardown.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
