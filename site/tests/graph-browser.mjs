// Focused component regression check. Publisher playback is excluded;
// the existing event-media sources are unchanged by the sourced-data update.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outputDirectory = resolve(process.env.GRAPH_QA_DIR || resolve(root, '.qa'));
await mkdir(outputDirectory, { recursive: true });
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/revision/styles.css"><link rel="stylesheet" href="/site/graph.css"><style>body{margin:32px;background:#080a0b;color:#c7cdd0;font-family:Geist,Arial,sans-serif}#graph{max-width:1250px;margin:auto}</style><div id="graph"></div><script type="module">import{mountGraph}from'/site/graph.js';window.__researchGraph=mountGraph(document.querySelector('#graph'));window.heroToggles=0;addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented)window.heroToggles++});</script></html>`;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
const report = { started: new Date().toISOString(), checks: [], errors };
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/graph-media/future/')) futureArtworkRequests.push(url);
    // Keep this regression focused on the graph, without opening a WebGL/GPU
    // renderer or streaming a large hero recording on the full-page smoke check.
    if (/\/hero\/(?:hero-renderer\.js|exports\/actuator-startup-|assets\/.*\.glb)/.test(url)) { request.abort(); return; }
    if (!url.startsWith(base) && !url.startsWith('data:')) { providerRequests.push(url); request.abort(); }
    else request.continue();
  });
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.waitForFunction(() => window.__researchGraph?.status.layout.gw > 0);
  const state = () => page.evaluate(() => window.__researchGraph.status);
  const point = (year, value = 800) => page.evaluate(({ year, value }) => {
    const { layout, domain, transform, xDomain } = window.__researchGraph.status, rect = document.querySelector('.graph-plot').getBoundingClientRect();
    const display = value => {
      const logRatio = Math.log(value / transform.reference);
      return Math.sign(logRatio) * Math.log1p(Math.abs(logRatio) / transform.constant);
    };
    const fraction = (display(value) - display(domain.minimum)) / (display(domain.maximum) - display(domain.minimum));
    return { x: rect.left + layout.gx + (year - xDomain.minimum) / (xDomain.maximum - xDomain.minimum) * layout.gw, y: rect.top + layout.gy + layout.gh * (1 - fraction) };
  }, { year, value });
  const menu = async count => {
    await page.waitForSelector('.graph-popup[data-mode="menu"] .graph-popup-choice', { visible: true, timeout: 5000 });
    assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), count);
    assert.equal(await page.$$eval('.graph-popup iframe, .graph-popup video, .graph-popup .graph-preview-media', nodes => nodes.length), 0, 'Year menus never mount media');
    assert.equal((await state()).preview.mode, 'menu');
    assert.doesNotMatch(await page.$eval('.graph-popup', node => node.innerText), /\b(?:estimated|reconstructed|reconstruction)\b/i, 'Year menus use neutral historical labels');
  };
  const hover = async (year, value = 800) => {
    await page.mouse.move(10, 10);
    const p = await point(year, value); await page.mouse.move(p.x, p.y);
  };
  const choose = async id => {
    await page.click(`.graph-popup-choice[data-series="${id}"]`);
    await page.waitForSelector('.graph-popup[data-mode="event"] .graph-preview-media[data-provider]', { visible: true });
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
    [/METR/i, /humanoid.*(?:deployment|shipment)|(?:deployment|shipment).*humanoid/i, /IFR|industrial/i, /IFR|industrial/i, /episodes|corpora/i, /BOJ|Bank of Japan/i].forEach((pattern, i) => assert.match(rail[i].metric, pattern));
    assert.equal(rail[1].name, 'Humanoid deployment');
    rail.forEach(item => assert.ok(item.metricTop >= item.valueBottom - 1, `${item.name} index is below its multiple`));
    for (let a = 0; a < rail.length; a++) for (let b = a + 1; b < rail.length; b++) {
      if (Math.min(rail[a].right, rail[b].right) - Math.max(rail[a].left, rail[b].left) > 1) {
        const gap = Math.max(rail[a].top, rail[b].top) - Math.min(rail[a].bottom, rail[b].bottom);
        assert.ok(gap >= 4, `Rail labels have separation: ${rail[a].name} / ${rail[b].name}: ${gap}`);
      }
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  };
  const verifyPopupBounds = async () => {
    assert.ok(await page.$eval('.graph-popup', node => {
      const rect = node.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1;
    }), 'The preview stays within the viewport');
    assert.ok(await page.$eval('.graph-popup .graph-measurement-source', node => {
      const rect = node.getBoundingClientRect(), popup = node.closest('.graph-popup').getBoundingClientRect();
      return rect.left >= popup.left && rect.right <= popup.right && rect.top >= popup.top && rect.bottom <= popup.bottom;
    }), 'The numeric source link is not clipped by the preview');
  };
  const verifyForecastShapes = async minimum => {
    const projected = await page.evaluate(() => {
      const graph = window.__researchGraph;
      return {
        specialist: graph.pointFor('specialist', 2040).y - graph.pointFor('specialist', 2035).y,
        hardware: graph.pointFor('hardware', 2035).y - graph.pointFor('hardware', 2026).y,
        data: graph.pointFor('data', 2026).y - graph.pointFor('data', 2035).y,
      };
    });
    for (const [id, distance] of Object.entries(projected)) assert.ok(distance >= minimum, `${id} forecast has a visible ${distance.toFixed(1)}px change`);
    report.checks.push(`Forecast shape distances: ${JSON.stringify(projected)}`);
    const laterMovement = await page.evaluate(() => {
      const graph = window.__researchGraph;
      return Object.fromEntries(['llm', 'humanoid', 'data', 'hardware'].map(id => [id,
        Math.abs(graph.pointFor(id, 2035).y - graph.pointFor(id, 2030).y),
      ]));
    });
    for (const [id, distance] of Object.entries(laterMovement)) assert.ok(distance > 3, `${id} continues visibly through 2030–2035 instead of entering an early plateau`);
    report.checks.push(`Retimed 2030–2035 movement: ${JSON.stringify(laterMovement)}`);
  };
  const verifyHomeHeader = async () => {
    assert.equal(await page.$('.header .subject'), null, 'The removed header brand does not return');
    assert.equal(await page.$('.research-door'), null, 'The extra hero research door stays removed');
    assert.doesNotMatch(await page.$eval('#contents .section-heading', node => node.innerText), /(?:hover|tap) to preview/i);
    assert.match(await page.$eval('.header nav', node => node.innerText), /Research/);
    const bounds = await page.evaluate(() => {
      const box = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      return { information: box('.hero-information'), subtitle: box('.hero-information .subtitle'), authors: box('.hero-information .authors'), nav: box('.header nav'), header: box('.header'), width: innerWidth, scrollWidth: document.documentElement.scrollWidth };
    });
    assert.ok(Math.abs(bounds.subtitle.left - bounds.information.left) < 2, 'Subtitle aligns to the left edge');
    assert.ok(Math.abs(bounds.authors.right - bounds.information.right) < 2, 'Authors align to the right edge');
    assert.ok(bounds.subtitle.right <= bounds.authors.left, 'Subtitle and authors remain separate columns');
    assert.ok(Math.abs(bounds.nav.right - bounds.header.right) < 2, 'Navigation remains right aligned');
    assert.ok(bounds.scrollWidth <= bounds.width, 'Homepage has no horizontal overflow');
    assert.match(await page.$eval('.hero-information .authors', node => node.innerText), /Nima Kamali[\s\S]*Ava Poole/);
  };
  const verifySources = async () => {
    const text = await page.$eval('body', node => node.innerText);
    assert.doesNotMatch(text, /Research text|Software\s*&\s*type|\d+(?:\.\d+)?-second preview/i);
    assert.equal(await page.$('#software'), null);
    assert.equal(await page.$$eval('a[href]', nodes => nodes.filter(node => /\.json(?:[?#]|$)/i.test(node.getAttribute('href'))).length), 0, 'Sources do not expose raw JSON links');
    assert.equal(await page.$$eval('.source-article code', nodes => nodes.length), 0);
    assert.equal(await page.$eval('#trajectories', node => node.textContent), 'Graph sources');
    assert.match(text, /Historical trajectories combine published observations with interpolation and backward extensions\./);
    const contributors = await page.$eval('section[aria-labelledby="contributors"]', node => node.innerText);
    assert.match(contributors, /Written by Nima Kamali and Ava Poole\./);
    assert.match(contributors, /Special thanks to X\./);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Sources have no horizontal overflow');
  };
  const verifyResearch = async () => {
    assert.equal(await page.$$eval('.essay-body figure img', nodes => nodes.length), 10, 'All ten current document figures are present');
    await page.$$eval('.essay-body img', nodes => nodes.forEach(node => { node.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('.essay-body img')].every(node => node.complete && node.naturalWidth > 0));
    const content = await page.evaluate(() => {
      const body = document.querySelector('.essay-body').getBoundingClientRect();
      return {
        images: [...document.querySelectorAll('.essay-body figure')].map(figure => {
          const img = figure.querySelector('img'), rect = img.getBoundingClientRect(), link = figure.querySelector('.essay-figure-link');
          return { src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, alt: img.alt, caption: figure.querySelector('figcaption')?.textContent.trim(), declared: img.hasAttribute('width') && img.hasAttribute('height'), fits: rect.left >= body.left - 1 && rect.right <= body.right + 1, original: link?.href === img.src };
        }),
        quotes: [...document.querySelectorAll('.essay-quote')].map(node => ({ style: getComputedStyle(node).fontStyle, text: node.textContent.trim() })),
        anchorsValid: [...document.querySelectorAll('.reading-contents a[href^="#"]')].every(node => document.getElementById(node.hash.slice(1))),
        scalingPresent: !!document.getElementById('scaling'),
        fitsViewport: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    assert.ok(content.images.every(item => item.width > 0 && item.height > 0 && item.alt && item.caption && item.declared && item.fits && item.original), 'Figures load, fit the reading column, retain captions, and link to their originals');
    assert.equal(content.quotes.length, 17, 'All seventeen current document quotations are present');
    assert.ok(content.quotes.every(item => item.style === 'italic' && item.text), 'Every quotation is visibly italic');
    assert.ok(content.anchorsValid && content.scalingPresent, 'Research contents retain working section anchors and the new Scaling section');
    assert.ok(content.fitsViewport, 'Research has no horizontal overflow');
    return { figures: content.images.length, quotations: content.quotes.length };
  };
  await page.goto(base, { waitUntil: 'networkidle0' }); await ready();
  await page.evaluate(() => window.__researchGraph.setYear(2025));
  assert.deepEqual(Object.values((await state()).values), [100,100,100,100,100,100]);
  assert.equal((await state()).synthetic, false);
  assert.equal((await state()).baselineYear, 2025);
  assert.equal((await state()).scale, 'compressed-index');
  assert.deepEqual((await state()).transform, { reference: 100, constant: 1, logBase: Math.E });
  assert.ok((await state()).domain.minimum > 0);
  assert.equal(await page.$$eval('.graph-plot svg text', nodes => nodes.some(node => /^0(?:\.0+)?$/.test(node.textContent))), false, 'Positive logarithmic ticks are never rounded to zero');
  assert.ok(await page.$$eval('.graph-plot svg text', nodes => nodes.some(node => node.textContent === '100')), 'The normalized baseline is readable on the common index axis');
  assert.equal(await page.$$eval('button', nodes => nodes.some(node => /linear|logarithmic|log scale/i.test(node.textContent))), false, 'The scale has no user-facing toggle');
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
  for (const [requested, expected] of [[2027, 2026], [2028, 2030], [2032, 2030], [2033, 2035], [2038, 2040]]) {
    await page.evaluate(year => window.__researchGraph.setYear(year), requested);
    assert.equal((await state()).year, expected, `Controller input ${requested} snaps to ${expected}`);
    assert.equal(await page.$eval('#trajectory-year', input => Number(input.value)), expected);
  }
  // Even an input inside the current stop's interval must restore the slider
  // thumb, without depending on a graph-state change to do so.
  await page.evaluate(() => {
    window.__researchGraph.setYear(2030);
    const input = document.querySelector('#trajectory-year');
    input.value = '2031'; input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal((await state()).year, 2030);
  assert.equal(await page.$eval('#trajectory-year', input => input.value), '2030');
  const range = await page.$eval('#trajectory-year', input => { const r = input.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await page.mouse.click(range.x + range.width * .72, range.y + range.height / 2);
  assert.equal((await state()).year, 2035, 'Pointer input on the year-coordinate slider snaps to a future stop');
  await page.focus('#trajectory-year');
  await page.evaluate(() => window.__researchGraph.setYear(2025));
  for (const expected of [2026, 2030, 2035, 2040, 2040]) {
    await page.keyboard.press('ArrowRight'); assert.equal((await state()).year, expected, 'Slider moves forward by inspection stops');
  }
  for (const expected of [2035, 2030, 2026, 2025]) {
    await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, expected, 'Slider moves backward through the historical boundary');
  }
  await page.keyboard.press('PageUp'); assert.equal((await state()).year, 2026);
  await page.keyboard.press('PageUp'); assert.equal((await state()).year, 2030);
  await page.keyboard.press('PageDown'); assert.equal((await state()).year, 2026);
  await page.keyboard.press('Home'); assert.equal((await state()).year, 2015);
  await page.keyboard.press('End'); assert.equal((await state()).year, 2040);
  await page.keyboard.press('Enter'); await menu(6);
  assert.equal((await state()).preview.year, 2040, 'Slider Enter opens the inspected milestone menu');
  await page.keyboard.press('Escape'); await closedPopup();
  report.checks.push('Controller, pointer slider, same-stop normalization, slider arrows/PageUp/PageDown/Home/End and Enter preserve annual history with 2030/2035/2040 future stops');
  await page.evaluate(() => window.__researchGraph.setYear(2025));
  for (const id of ['llm', 'humanoid', 'specialist', 'deployment', 'data', 'hardware']) {
    for (const year of [2015, 2025, 2030, 2040]) {
      const measured = await page.evaluate(({ id, year }) => window.__researchGraph.pointFor(id, year), { id, year });
      const reading = await page.evaluate(({ id, year }) => { window.__researchGraph.setYear(year); return window.__researchGraph.status.readings[id]; }, { id, year });
      if (id === 'humanoid' && year === 2015) {
        assert.equal(reading, null, 'No humanoid deployment history is fabricated before the 2025 shipment anchor');
        assert.equal(measured, null, 'Unreported humanoid counts do not create a plotted point');
        continue;
      }
      const expected = await point(year, reading.value);
      const bounds = await page.$eval('.graph-plot', node => { const rect = node.getBoundingClientRect(); return { x: rect.left, y: rect.top }; });
      assert.ok(Math.abs(measured.x + bounds.x - expected.x) < 1.5, `${id}/${year} x conversion`);
      assert.ok(Math.abs(measured.y + bounds.y - expected.y) < 1.5, `${id}/${year} common transformed y conversion`);
      if (year === 2015 || year === 2040) {
        const { layout } = await state();
        assert.ok(measured.x > layout.gx && measured.x < layout.gx + layout.gw, `${id}/${year} endpoint is inset from the clipping edge`);
      }
    }
  }
  await page.evaluate(() => window.__researchGraph.setYear(2021));
  assert.ok((await state()).values.llm > 0);
  assert.equal((await state()).values.humanoid, null);
  assert.equal((await state()).readings.llm.kind, 'reconstructed');
  assert.equal((await state()).readings.humanoid, null);
  assert.equal(await page.evaluate(() => window.__researchGraph.pointFor('humanoid', 2021)), null);
  assert.doesNotMatch(await page.$eval('#graph', node => node.textContent), /NaN|Infinity|undefined/);
  await verifyForecastShapes(40);
  await page.$('#graph').then(element => element.screenshot({ path: resolve(outputDirectory, 'sourced-graph-desktop.png') }));
  report.checks.push('Desktop: deployment-count metric rail, 2025 normalization, one compressed-index mapping, retained 2015 histories, classified reconstructions, and no invented pre-2025 humanoid counts');

  // Even empty space in a historical year starts at the full menu, with no video request.
  await hover(2017); await menu(6);
  assert.equal((await state()).year, 2017);
  assert.match(await page.$eval('.graph-popup-choice[data-series="humanoid"]', node => node.textContent), /not reported/i);
  assert.deepEqual(providerRequests, []);
  await page.$eval('.graph-popup-choice', node => { node.dataset.qaIdentity = 'same-year'; });
  const sameYear = await point(2017, 700); await page.mouse.move(sameYear.x, sameYear.y);
  await menu(6);
  assert.equal(await page.$eval('.graph-popup-choice', node => node.dataset.qaIdentity), 'same-year');
  await hover(2032); await menu(6); assert.equal((await state()).year, 2030);
  assert.equal((await state()).preview.year, 2030, 'A hovered future position opens the snapped milestone menu');
  await page.screenshot({ path: resolve(outputDirectory, 'sourced-graph-year-menu.png') });
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
  assert.equal(await page.$eval('.graph-popup .graph-measurement', node => node.dataset.kind), 'reconstructed');
  assert.match(await page.$eval('.graph-popup .graph-measurement-status', node => node.textContent), /Historical/i);
  assert.doesNotMatch(await page.$eval('.graph-popup', node => node.innerText), /\b(?:estimated|reconstructed|reconstruction)\b/i);
  assert.doesNotMatch(await page.$eval('.graph-popup .graph-measurement-value', node => node.textContent), /≈/);
  assert.match(await page.$eval('.graph-popup .graph-measurement-source', node => node.textContent), /Methodology/i);
  assert.match(await page.$eval('.graph-popup .graph-measurement-source', node => node.href), /\/sources\/#trajectories$/);
  await page.waitForSelector('.graph-popup iframe', { visible: true });
  assert.equal((await state()).opened, null, 'Choosing a line opens its preview before its panel');
  assert.ok(await page.$eval('.graph-popup iframe', frame => frame.getBoundingClientRect().height >= 200));
  await page.click('.graph-preview-back'); await menu(1);
  await choose('llm'); await page.mouse.click(10, 10); await closedPopup();
  assert.equal(await page.$('.graph-popup iframe'), null, 'Closing an event preview removes its player');
  await hover(2017); await menu(1); await choose('llm'); await expand('llm-2017');
  assert.equal(await page.$eval('.graph-panel .graph-measurement', node => node.dataset.kind), 'reconstructed');
  assert.match(await page.$eval('.graph-panel .graph-measurement-status', node => node.textContent), /Historical/i);
  assert.doesNotMatch(await page.$eval('.graph-panel', node => node.innerText), /\b(?:estimated|reconstructed|reconstruction)\b/i);
  assert.doesNotMatch(await page.$eval('.graph-panel .graph-measurement-value', node => node.textContent), /≈/);
  assert.match(await page.$eval('.graph-panel .graph-measurement-source', node => node.textContent), /Methodology/i);
  await page.$('.graph-panel').then(element => element.screenshot({ path: resolve(outputDirectory, 'continuous-graph-reconstruction.png') }));
  await page.evaluate(() => window.__researchGraph.setYear(2036));
  assert.equal((await state()).year, 2035);
  assert.equal((await state()).opened.year, 2017, 'Scrubbing does not replace pinned media');
  await close();

  // The longest evidence view retains its raw confidence interval and source,
  // while the small historical values remain legible rather than rounded to zero.
  await hover(2026); await menu(1); await choose('llm');
  await verifyPopupBounds();
  await page.screenshot({ path: resolve(outputDirectory, 'sourced-graph-observed-preview.png') });
  await expand('llm-2026');
  assert.match(await page.$eval('.graph-panel .graph-measurement', node => node.textContent), /Reported interval:.*1\.62 human-hours.*6\.64 human-hours/s);
  assert.equal(await page.$$eval('.graph-panel .graph-measurement-source', nodes => nodes.length), 1);
  await page.$('.graph-panel').then(element => element.screenshot({ path: resolve(outputDirectory, 'sourced-graph-observed-panel.png') }));
  await close();

  // Source evidence is attached to a real measurement separately from the video.
  await page.evaluate(() => window.__researchGraph.selectView('series:hardware'));
  await hover(2025); await menu(1); await choose('hardware');
  assert.equal(await page.$eval('.graph-popup .graph-measurement', node => node.dataset.kind), 'observed');
  assert.match(await page.$eval('.graph-popup .graph-measurement-status', node => node.textContent), /Historical/i);
  assert.match(await page.$eval('.graph-popup .graph-measurement-value', node => node.textContent), /100/);
  assert.match(await page.$eval('.graph-popup .graph-measurement-source', node => node.href), /^https:\/\//);
  await expand('hardware-2025');
  assert.match(await page.$eval('.graph-panel .graph-measurement-name', node => node.textContent), /robot|BOJ|Bank of Japan/i);
  await close();

  // Historical demonstrations remain available even where deployment counts
  // were not reported; their media must not fabricate a quantitative history.
  await page.evaluate(() => window.__researchGraph.selectView('series:humanoid'));
  await hover(2017); await menu(1); await choose('humanoid');
  assert.equal(await page.$eval('.graph-popup .graph-measurement', node => node.dataset.kind), 'unreported');
  assert.match(await page.$eval('.graph-popup .graph-measurement-status', node => node.textContent), /No comparable observation reported for 2017/);
  assert.equal(await page.$('.graph-popup .graph-measurement-value'), null);
  await expand('humanoid-2017');
  assert.equal(await page.$eval('.graph-panel .graph-measurement', node => node.dataset.kind), 'unreported');
  assert.equal(await page.$('.graph-panel .graph-measurement-value'), null);
  assert.doesNotMatch(await page.$eval('.graph-panel .graph-measurement', node => node.textContent), /of modeled robot deployments/);
  await close();

  await hover(2035); await menu(1); await choose('humanoid');
  const modeledShare = (await state()).readings.humanoid.modeledShare;
  assert.ok(Number.isFinite(modeledShare) && modeledShare > 0 && modeledShare < 1);
  await expand('humanoid-2035');
  const shareText = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(modeledShare);
  assert.ok((await page.$eval('.graph-panel .graph-measurement', node => node.textContent)).includes(`${shareText} of modeled robot deployments.`));
  await close();

  // Line clicks and the keyboard Open year action use exactly the same menu path.
  await page.evaluate(() => { window.__researchGraph.selectView('series:deployment'); window.__researchGraph.setYear(2032); });
  assert.equal((await state()).year, 2030);
  const line = await point(2030, (await state()).values.deployment);
  await page.mouse.click(line.x, line.y); await menu(1);
  await choose('deployment');
  assert.equal(await page.$eval('.graph-popup .graph-measurement', node => node.dataset.kind), 'scenario');
  assert.ok(await page.$eval('.graph-popup .graph-measurement-source', node => !!node.getAttribute('href')));
  assert.equal(await page.$eval('.graph-popup .graph-sketch-placeholder', node => node.textContent), 'Sketch forthcoming');
  await expand('deployment-2030');
  assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
  assert.equal(await page.$$eval('.graph-panel img, .graph-panel iframe, .graph-panel .is-unavailable', nodes => nodes.length), 0);
  await close();
  await page.mouse.move(10, 10);
  await page.focus('.graph-plot');
  await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, 2026);
  await page.keyboard.press('ArrowLeft'); assert.equal((await state()).year, 2025);
  for (const expected of [2026, 2030, 2035, 2040]) {
    await page.keyboard.press('ArrowRight'); assert.equal((await state()).year, expected, 'Plot arrows traverse all future stops');
  }
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
  assert.equal((await state()).year, 2035);
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 190));
    for (let i = 0; i < 6; i++) {
      document.querySelector('.graph-plot').dispatchEvent(new WheelEvent('wheel', { deltaY: 8, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  });
  assert.equal((await state()).year, 2040);
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 190));
    window.__researchGraph.setYear(2030);
    document.querySelector('.graph-plot').dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
  });
  assert.equal((await state()).year, 2026, 'Reverse wheel crosses directly back to the historical boundary');
  assert.equal(await page.evaluate(() => window.heroToggles), 0);
  report.checks.push('Menu-first blank/line hover and click, source CI, neutral Historical labels with unchanged internal kinds, Methodology links, preview/Back/panel, future placeholders, keyboard/wheel input, Escape and focus');

  // Touch starts at the menu too, including empty grid space and a single series.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(base, { waitUntil: 'networkidle0' }); await ready();
  await verifyRail();
  await verifyForecastShapes(30);
  await page.$('#graph').then(element => element.screenshot({ path: resolve(outputDirectory, 'sourced-graph-mobile.png') }));
  const blank = await point(2032, 800); await page.touchscreen.tap(blank.x, blank.y); await menu(6);
  assert.equal((await state()).year, 2030, 'Touch inspection uses the same future snap policy');
  await choose('hardware');
  await verifyPopupBounds();
  await page.screenshot({ path: resolve(outputDirectory, 'sourced-graph-mobile-preview.png') });
  await page.click('.graph-popup .graph-media-open');
  assert.equal((await state()).opened.id, 'hardware-2030');
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
  report.checks.push('Mobile rail layout, menu-first touch, expanded media, vertical panning and teardown');

  // Smoke-check the actual page and its existing loader, with heavy hero media
  // excluded above. This catches integration and real stylesheet differences.
  await page.setViewport({ width: 1440, height: 1000, isMobile: false, hasTouch: false });
  await page.goto(`${base}/index.html#trajectories`, { waitUntil: 'networkidle0' });
  await ready();
  await page.$eval('#trajectories', node => node.scrollIntoView());
  await verifyRail();
  await hover(2031); await menu(6); await choose('data');
  assert.equal((await state()).year, 2030);
  assert.equal(await page.$eval('.graph-popup .graph-measurement', node => node.dataset.kind), 'scenario');
  await page.keyboard.press('Escape'); await closedPopup();
  await page.evaluate(() => document.activeElement?.blur());
  await page.$('#trajectories').then(element => element.screenshot({ path: resolve(outputDirectory, 'sourced-graph-homepage.png') }));
  report.checks.push('Actual homepage loader, Geist styling, six metric rail labels, and forecast menu');
  await page.evaluate(() => scrollTo(0, 0));
  await verifyHomeHeader();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-home-desktop.png') });
  await page.goto(`${base}/sources/index.html`, { waitUntil: 'networkidle0' });
  await verifySources();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-sources-desktop.png') });
  assert.equal(await page.evaluate(async () => (await fetch('/site/graph-model.js')).status), 200, 'The runtime graph model is served');
  await page.goto(`${base}/research/index.html`, { waitUntil: 'networkidle0' });
  const desktopResearch = await verifyResearch();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-research-desktop.png') });
  await page.$('.essay-body figure').then(element => element.screenshot({ path: resolve(outputDirectory, 'editorial-research-figure-desktop.png') }));
  await page.$('.essay-body blockquote').then(element => element.screenshot({ path: resolve(outputDirectory, 'editorial-research-quote-desktop.png') }));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle0' });
  await verifyHomeHeader();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-home-mobile.png') });
  await page.goto(`${base}/sources/index.html`, { waitUntil: 'networkidle0' });
  await verifySources();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-sources-mobile.png') });
  await page.goto(`${base}/research/index.html`, { waitUntil: 'networkidle0' });
  const mobileResearch = await verifyResearch();
  await page.screenshot({ path: resolve(outputDirectory, 'editorial-research-mobile.png') });
  await page.$('.essay-body figure').then(element => element.screenshot({ path: resolve(outputDirectory, 'editorial-research-figure-mobile.png') }));
  report.checks.push('Desktop/mobile clean header, two-column subtitle/authors, simplified Sources with contributors and retained provenance, runtime model available');
  report.checks.push(`Research desktop/mobile: ${desktopResearch.figures}/${mobileResearch.figures} loaded figures; ${desktopResearch.quotations}/${mobileResearch.quotations} italic quotations; captions, originals, section links and column bounds verified`);
  assert.deepEqual(errors, []);
  assert.deepEqual(futureArtworkRequests, [], 'Placeholders do not request missing sketches');
  report.passed = true;
  console.log('Continuous graph browser checks passed: neutral history labels with unchanged data kinds, retained source methodology, visible forecast shapes, menu-first interactions, annual history and five-year future input, desktop/mobile layout, homepage integration.');
} catch (error) {
  report.passed = false;
  report.failure = error.stack || String(error);
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  report.finished = new Date().toISOString();
  await writeFile(resolve(outputDirectory, 'sourced-graph-browser-report.json'), JSON.stringify(report, null, 2));
}
