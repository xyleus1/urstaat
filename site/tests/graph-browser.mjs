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
const providerRequests = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', request => request.url().startsWith(base) || request.url().startsWith('data:') ? request.continue() : request.abort());
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.url().includes('/graph-media/future/')) futureArtworkRequests.push(request.url());
    if (!request.url().startsWith(base) && !request.url().startsWith('data:')) providerRequests.push(request.url());
  });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__researchGraph?.status.layout.gw > 0);
  const state = () => page.evaluate(() => window.__researchGraph.status);
  const coordinate = (year, value) => page.evaluate(({ year, value }) => {
    const { layout, domain } = window.__researchGraph.status;
    const rect = document.querySelector('.graph-plot').getBoundingClientRect();
    return {
      x: rect.left + layout.gx + (year - domain.firstYear) / (domain.lastYear - domain.firstYear) * layout.gw,
      y: rect.top + layout.gy + layout.gh * (1 - value / domain.maximum),
    };
  }, { year, value });
  const closePanel = async () => {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.graph-panel').hidden);
  };

  const initial = await state();
  assert.equal(initial.year, 2025);
  assert.equal(initial.synthetic, false);
  assert.equal(initial.baselineYear, 2020);
  assert.equal(initial.domain.maximum, 225);
  assert.equal(initial.values.llm, null);
  assert.equal(initial.values.humanoid, null);
  assert.equal(initial.values.data, null);
  assert.ok(Math.abs(initial.values.deployment - 5079000 / 3027000 * 100) < 1e-9);
  assert.ok(Math.abs(initial.values.specialist - 11106 / 5989 * 100) < 1e-9);
  assert.ok(Math.abs(initial.values.hardware - 105.70833333333334 / 100.00833333333334 * 100) < 1e-9);
  assert.equal(await page.$('.graph-key'), null);
  const definitions = await page.$$eval('.graph-label-definition', nodes => nodes.map(node => node.textContent));
  assert.equal(definitions.length, 6);
  assert.match(definitions[0], /MMLU.*5-shot/);
  assert.match(definitions[2], /da Vinci/i);
  assert.match(definitions[3], /IFR/i);
  assert.match(definitions[5], /BOJ.*Robots.*price/i);
  assert.equal(await page.$$eval('.graph-label.is-unmeasured', nodes => nodes.length), 2);
  const initialRail = await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent));
  const initialEndpoints = initial.endpoints;
  await page.evaluate(() => window.__researchGraph.setYear(2034.6));
  assert.equal((await state()).year, 2035);
  assert.ok(Object.values((await state()).values).every(value => value === null), 'Future stories have no numeric predictions');
  assert.deepEqual((await state()).endpoints, initialEndpoints, 'Latest observations remain fixed while inspecting another year');
  assert.deepEqual(await page.$$eval('.graph-label-value', nodes => nodes.map(node => node.textContent)), initialRail);
  assert.ok(await page.$$eval('.graph-label-basis', nodes => nodes.filter(node => /2020 = 100/.test(node.textContent)).length) === 4);

  // The year chooser stays identical for overlapping and individual lines.
  // Continuous small pointer movements must not keep restarting its delay.
  await page.evaluate(() => { window.__researchGraph.setYear(2020); window.__researchGraph.selectView('all'); });
  const baselinePoint = await coordinate(2020, 100);
  await page.evaluate(async point => {
    const plot = document.querySelector('.graph-plot');
    for (let i = 0; i < 20; i++) {
      plot.dispatchEvent(new PointerEvent('pointermove', { clientX: point.x + (i % 2 ? 1 : -1), clientY: point.y, pointerType: 'mouse', bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }, baselinePoint);
  assert.ok(await page.$eval('.graph-popup', node => !node.hidden && !!node.offsetParent), 'Menu appears during continuous motion, not only after the pointer stops');
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 6);
  assert.equal(await page.$$eval('.graph-popup-choice.is-nearby', nodes => nodes.length), 4);
  assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video, .graph-popup img', nodes => nodes.length), 0);
  assert.deepEqual(providerRequests, [], 'Hover makes no publisher media requests');
  await page.evaluate(() => { window.__menuBeforeMove = document.querySelector('.graph-popup-choices'); });
  await page.evaluate(point => document.querySelector('.graph-plot').dispatchEvent(new PointerEvent('pointermove', { clientX: point.x + 1, clientY: point.y + 1, pointerType: 'mouse', bubbles: true })), baselinePoint);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(() => window.__menuBeforeMove === document.querySelector('.graph-popup-choices')), true, 'Same-year movement keeps the existing menu DOM');
  await page.keyboard.press('Escape');
  assert.equal((await state()).preview, null);
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  // All six narrative topics remain available through the explicit year chooser.
  await page.click('.graph-open-year');
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 6);
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.filter(node => node.textContent.includes('No observation')).length), 2);
  await page.click('.graph-popup-choice');
  await closePanel();
  assert.equal(await page.evaluate(() => document.activeElement.className), 'graph-open-year', 'Chooser retains original opener');

  // A single measured line uses the same menu; only choosing a row loads media.
  await page.evaluate(() => { window.__researchGraph.selectView('series:deployment'); window.__researchGraph.setYear(2023); });
  const deploymentPoint = await coordinate(2023, (await state()).values.deployment);
  await page.mouse.click(deploymentPoint.x, deploymentPoint.y);
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 1);
  assert.equal((await state()).opened, null);
  assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video, .graph-popup img', nodes => nodes.length), 0);
  await page.click('.graph-popup-choice');
  await page.waitForFunction(() => window.__researchGraph.status.opened?.id === 'deployment-2023');
  assert.equal(await page.$$eval('.graph-panel iframe', nodes => nodes.length), 1);
  const dataContext = await page.$eval('.graph-panel .graph-observation', node => node.textContent);
  assert.match(dataContext, /IFR/i);
  assert.match(dataContext, /4,282,000/);
  assert.match(dataContext, /index/i);
  assert.ok(await page.$eval('.graph-panel .graph-observation .graph-source', node => node.href.startsWith('https://ifr.org/')));
  assert.ok(await page.$$eval('.graph-panel .graph-source', nodes => nodes.some(node => node.href.startsWith('https://bostondynamics.com/'))), 'Narrative source and numeric source remain distinguishable');
  await page.evaluate(() => window.__researchGraph.setYear(2036));
  assert.equal((await state()).opened.id, 'deployment-2023', 'Scrubbing must not replace pinned media');
  await page.evaluate(() => window.__researchGraph.openStory('llm', 2017));
  assert.equal(await page.$$eval('.graph-panel', nodes => nodes.length), 1);
  assert.equal((await state()).opened.id, 'llm-2017');
  assert.equal(await page.$$eval('.graph-panel iframe', nodes => nodes.length), 1);
  assert.equal(await page.$('.graph-panel .graph-observation'), null, 'A narrative-only year has no fabricated measurement');
  await closePanel();
  assert.equal(await page.$$eval('.graph-panel iframe', nodes => nodes.length), 0);
  assert.equal(await page.evaluate(() => window.heroToggles), 0);

  await page.focus('.graph-plot');
  await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, 2035);
  await page.keyboard.press('Home'); assert.equal((await state()).year, 2015);
  await page.keyboard.press('End'); assert.equal((await state()).year, 2040);
  await page.mouse.move(deploymentPoint.x, deploymentPoint.y);
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

  // Enter a single-line hover menu and choose its row across the pointer gap.
  await page.mouse.move(0, 0);
  await page.evaluate(() => { window.__researchGraph.selectView('series:deployment'); window.__researchGraph.setYear(2023); });
  const hoverPoint = await coordinate(2023, (await state()).values.deployment);
  const requestsBeforeHover = providerRequests.length;
  await page.mouse.move(hoverPoint.x, hoverPoint.y);
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video, .graph-popup img', nodes => nodes.length), 0);
  assert.equal(providerRequests.length, requestsBeforeHover, 'Single-line hover does not initialize a player');
  assert.match(await page.$eval('.graph-popup-choice', node => node.textContent), /index/);
  const expandRect = await page.$eval('.graph-popup-choice', button => { const r = button.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(expandRect.x, expandRect.y, { steps: 12 });
  await page.mouse.click(expandRect.x, expandRect.y);
  assert.equal((await state()).opened.id, 'deployment-2023');
  assert.equal(await page.$$eval('.graph-popup iframe', nodes => nodes.length), 0);
  await closePanel();

  // Future studies are explicit stories, not clicks on invented forecast curves.
  await page.evaluate(() => { window.__researchGraph.selectView('series:hardware'); window.__researchGraph.setYear(2028); });
  const futurePoint = await coordinate(2028, 100);
  await page.mouse.click(futurePoint.x, futurePoint.y);
  assert.equal((await state()).opened, null);
  assert.equal((await state()).preview, null);
  assert.equal((await state()).values.hardware, null);
  await page.click('.graph-open-year');
  await page.waitForSelector('.graph-popup-choice', { visible: true });
  assert.equal((await state()).opened, null, 'Open year also uses a menu with one active topic');
  assert.match(await page.$eval('.graph-popup-choice', node => node.textContent), /No forecast/);
  await page.click('.graph-popup-choice');
  assert.equal((await state()).opened.id, 'hardware-2028');
  assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
  assert.equal(await page.$eval('.graph-panel .graph-sketch-placeholder', node => node.textContent), 'Sketch forthcoming');
  assert.equal(await page.$$eval('.graph-panel img, .graph-panel iframe', nodes => nodes.length), 0, 'Intentional placeholders never request absent artwork');
  assert.equal(await page.$$eval('.graph-panel .is-unavailable', nodes => nodes.length), 0);
  assert.equal(await page.$('.graph-panel .graph-observation'), null);
  await closePanel();
  assert.equal(await page.evaluate(() => document.activeElement.className), 'graph-open-year');

  const labelMutations = await page.evaluate(async () => {
    let mutations = 0;
    const observer = new MutationObserver(records => { mutations += records.length; });
    observer.observe(document.querySelector('.graph-labels'), { attributes: true, subtree: true });
    for (const year of [2018, 2019, 2020, 2021]) window.__researchGraph.setYear(year);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    observer.disconnect(); return mutations;
  });
  assert.equal(labelMutations, 0, 'Annual scrubbing does not rewrite static endpoint labels');

  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 390, height: 844 });
  await page.waitForFunction(() => window.__researchGraph.status.layout.compact);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.equal(await page.$$eval('.graph-label-definition', nodes => nodes.length), 6);
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
  console.log('Graph component browser checks passed: consistent menus for overlap/singleton/filtered/future, stable hover timer and DOM, zero hover media requests, observed data, source context, annual input, static-label reuse, media pinning, Escape, mobile, reduced motion, teardown.');
} finally {
  const process = browser.process();
  try { await Promise.race([browser.close(), new Promise((_, reject) => setTimeout(() => reject(new Error('Browser teardown timeout')), 10000))]); }
  catch { process?.kill(); }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
