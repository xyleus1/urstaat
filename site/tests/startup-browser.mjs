// Lazy-chart integration test. This fixture intentionally has no WebGL hero so
// loader behavior can be tested independently of device rendering performance.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/graph.css"><style>html{scroll-behavior:auto}body{margin:32px;font-family:Arial,sans-serif}nav a{display:inline-block;padding:16px}.spacer{height:3000px}#trajectories{max-width:1250px;margin:auto}</style><nav><a href="#trajectories">Trajectories</a></nav><main><section class="spacer" aria-label="Above-fold content"></section><section id="trajectories"><div id="robotics-graph"></div></section></main><script type="module" src="/app.js"></script></html>`;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/') { response.writeHead(200, { 'content-type': 'text/html' }); response.end(fixture); return; }
  const file = resolve(root, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${root}\\`) && !file.startsWith(`${root}/`)) { response.writeHead(403).end(); return; }
  try { const data = await readFile(file); response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); response.end(data); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ headless: true });
const errors = [];
const runs = [];
const graphPaths = ['/graph.js', '/vendor/graph-vendor.js', '/graph-stories.js'];

async function openFixture({ fragment = '', failVendorOnce = false } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const requests = [];
  let failed = false;
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    requests.push(url.pathname);
    if (failVendorOnce && !failed && url.pathname === '/vendor/graph-vendor.js') {
      failed = true; request.abort('failed'); return;
    }
    if (request.url().startsWith(base) || request.url().startsWith('data:')) request.continue();
    else request.abort();
  });
  await page.goto(`${base}/${fragment}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__researchVideos);
  return { context, page, requests };
}

async function assertDeferred(page, requests) {
  assert.equal(await page.evaluate(() => !!window.__researchGraph), false);
  assert.deepEqual(requests.filter(path => graphPaths.includes(path)), [], 'Chart, vendor, and stories stay off the initial request path');
  assert.ok(await page.$eval('#robotics-graph', node => node.getBoundingClientRect().height >= 900), 'The deferred graph reserves its layout space');
}

async function ready(page) {
  await page.waitForFunction(() => document.querySelector('#robotics-graph').dataset.graphLoad === 'ready' && !!window.__researchGraph);
  assert.equal(await page.$$eval('.graph-heading', nodes => nodes.length), 1);
}

try {
  {
    const { context, page, requests } = await openFixture();
    await assertDeferred(page, requests);
    await page.click('a[href="#trajectories"]');
    await ready(page);
    for (const path of graphPaths) assert.equal(requests.filter(item => item === path).length, 1, `${path} loads once on demand`);
    await page.evaluate(() => { window.__initialController = window.__researchGraph; document.querySelector('a[href="#trajectories"]').click(); document.querySelector('#robotics-graph').dispatchEvent(new PointerEvent('pointerenter')); });
    assert.equal(await page.evaluate(() => window.__initialController === window.__researchGraph), true, 'Repeated triggers reuse the mounted chart');
    await page.$eval('#trajectory-year', slider => { slider.value = '2030'; slider.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('.graph-open-year');
    await page.waitForSelector('.graph-popup-choice', { visible: true });
    assert.equal(await page.$$eval('.graph-popup-choice', nodes => nodes.length), 6);
    await page.click('.graph-popup-choice[data-series="hardware"]');
    await page.waitForFunction(() => window.__researchGraph.status.opened?.id === 'hardware-2030');
    assert.equal(await page.$$eval('.graph-panel .graph-sketch-placeholder', nodes => nodes.length), 1);
    runs.push('cold startup defers modules; anchor mounts once; menu opens its panel');
    await context.close();
  }
  {
    const { context, page, requests } = await openFixture();
    await assertDeferred(page, requests);
    const beforeViewport = await page.evaluate(() => {
      const section = document.querySelector('#trajectories');
      scrollTo(0, section.getBoundingClientRect().top + scrollY - innerHeight - 100);
      return section.getBoundingClientRect().top > innerHeight;
    });
    assert.equal(beforeViewport, true);
    await ready(page);
    assert.ok(await page.$eval('#trajectories', node => node.getBoundingClientRect().top > innerHeight), 'Chart initializes in the lead-in region before it becomes visible');
    runs.push('near-viewport observer loads in advance');
    await context.close();
  }
  {
    const { context, page, requests } = await openFixture({ fragment: '#trajectories' });
    await ready(page);
    assert.ok(requests.includes('/graph.js'));
    assert.equal(await page.evaluate(() => location.hash), '#trajectories');
    runs.push('direct graph fragment loads immediately');
    await context.close();
  }
  {
    const { context, page, requests } = await openFixture();
    await assertDeferred(page, requests);
    await page.$eval('#robotics-graph', node => node.dispatchEvent(new PointerEvent('pointerenter')));
    await ready(page);
    runs.push('pointer intent also initializes the graph');
    await context.close();
  }
  {
    const { context, page, requests } = await openFixture({ failVendorOnce: true });
    await assertDeferred(page, requests);
    await page.click('a[href="#trajectories"]');
    await page.waitForFunction(() => document.querySelector('#robotics-graph').dataset.graphLoad === 'error');
    assert.match(await page.$eval('.graph-load-retry', button => button.textContent), /reload/i, 'Recovery explicitly says that it reloads the page');
    assert.equal(await page.evaluate(() => !!window.__researchGraph), false);
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.graph-load-retry')]);
    await ready(page);
    assert.equal(await page.evaluate(() => location.hash), '#trajectories', 'Reload returns to the graph');
    assert.equal(await page.$('.graph-load-retry'), null);
    assert.ok(requests.filter(path => path === '/vendor/graph-vendor.js').length >= 2, 'A failed dependency is fetched again after recovery');
    assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation')[0].type), 'reload', 'Recovery replaces the failed document module map');
    runs.push('failed dependency offers reload recovery and successfully retries');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: runs, errors }));
} finally {
  const process = browser.process();
  let closeTimer;
  try { await Promise.race([browser.close(), new Promise((_, reject) => { closeTimer = setTimeout(() => reject(new Error('Browser teardown timeout')), 10000); })]); }
  catch { process?.kill(); }
  finally { clearTimeout(closeTimer); }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
