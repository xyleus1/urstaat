import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from '../tests/preview-server.mjs';

// Pass a deployed Part 2 URL to measure CDN compression and delivery.
const deployed = process.argv.slice(2).find((arg) => /^https?:\/\//.test(arg));
const preview = deployed ? null : await startPreviewServer();
const url = deployed || preview.origin + '/research/part-2/';
let browser;
try {
  const args = process.argv.includes('--software')
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--enable-gpu'];
  browser = await puppeteer.launch({ headless: 'shell', args });
  for (const mobile of [true, false]) {
    const trials = [];
    for (let trial = 0; trial < (process.argv.includes('--quick') ? 1 : 3); trial++) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.bringToFront();
      await page.evaluateOnNewDocument(() => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.element?.matches('#still img')) window.takuPosterPaint = entry.startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.setViewport(
        mobile
          ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
          : { width: 1440, height: 900, deviceScaleFactor: 1 },
      );
      const cdp = await page.createCDPSession();
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 100,
        downloadThroughput: 1250000,
        uploadThroughput: 1250000,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 });
      const requests = new Map();
      cdp.on('Network.requestWillBeSent', (e) => requests.set(e.requestId, { url: e.request.url, bytes: 0 }));
      cdp.on('Network.loadingFinished', (e) => {
        const request = requests.get(e.requestId);
        if (request) request.bytes = e.encodedDataLength;
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.taku-stage[data-mode="live"]', { timeout: 60000 });
      const result = await page.evaluate(
        async (frameCount) => {
          const readyMs = Math.round(performance.getEntriesByName('taku-interactive')[0].startTime);
          const canvas = document.querySelector('#taku-canvas');
          const stage = canvas.closest('.taku-stage');
          const gl = stage.dataset.tier === 'cpu' ? null : canvas.getContext('webgl2');
          const device = gl?.getExtension('WEBGL_debug_renderer_info');
          const times = [],
            resolutions = new Set();
          const record = () => {
            times.push(performance.now());
            resolutions.add(canvas.width + 'x' + canvas.height);
          };
          stage.addEventListener('taku-projection', record);
          const start = performance.now();
          await new Promise((resolve) => {
            function orbit(now) {
              canvas.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
              );
              if (now - start < frameCount * 32) requestAnimationFrame(orbit);
              else resolve();
            }
            requestAnimationFrame(orbit);
          });
          stage.removeEventListener('taku-projection', record);
          const samples = times.slice(1).map((v, i) => v - times[i]);
          const submittedFrames = times.length;
          return {
            readyMs,
            posterPaintMs: window.takuPosterPaint ? Math.round(window.takuPosterPaint) : null,
            submittedFrames,
            resolutions: [...resolutions],
            orbitFps: Math.round(
              (1000 * Math.min(samples.length, submittedFrames)) / samples.reduce((sum, n) => sum + n, 0),
            ),
            p95FrameMs: Math.round(samples.sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1]),
            renderer: gl ? gl.getParameter(device ? device.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : 'Canvas 2D',
          };
        },
        process.argv.includes('--quick') ? 40 : 100,
      );
      const assets = [...requests.values()].filter((request) => request.url.startsWith('http'));
      assert.ok(result.submittedFrames > 0, 'The measured orbit must submit visible frames');
      assert.equal(result.resolutions.length, 1, 'The drawing buffer must remain constant during the orbit');
      assert.ok(
        assets.some((a) => /taku-(?:desktop|mobile)\.glb|taku-cpu\.bin\.gz/.test(a.url)),
        'A real robot model was loaded',
      );
      result.transferMiB = +(assets.reduce((sum, a) => sum + a.bytes, 0) / 1048576).toFixed(2);
      trials.push(result);
      console.error(
        `${mobile ? 'Mobile' : 'Desktop'} trial ${trial + 1}: ${result.readyMs} ms, ${result.orbitFps} fps, ${result.transferMiB} MiB on ${result.renderer}`,
      );
      await context.close();
    }
    console.log(
      JSON.stringify({ viewport: mobile ? '390px, DPR 2, 4x CPU' : '1440px, DPR 1', trials }, null, 2),
    );
  }
} finally {
  await browser?.close();
  if (preview) await new Promise((resolve) => preview.server.close(resolve));
}
