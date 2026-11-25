import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { startPreviewServer } from '../tests/preview-server.mjs';

const destination = new URL('../../research/part-2/stills/', import.meta.url);
await mkdir(destination, { recursive: true });
const { server, origin } = await startPreviewServer();
let browser;
try {
  const args = process.argv.includes('--software')
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : [];
  browser = await puppeteer.launch({ headless: 'shell', args });
  const maskFile = new URL('../assets/still-regions.json', destination);
  const masks = await readFile(maskFile, 'utf8')
    .then(JSON.parse)
    .catch(() => ({}));
  const onlyShot = process.argv.find((arg) => arg.startsWith('--shot='))?.slice(7);
  for (const mobile of [false, true]) {
    const page = await browser.newPage();
    await page.bringToFront();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (!new URL(request.url()).pathname.endsWith('/explorer.js')) {
        request.continue();
        return;
      }
      // The reference plates always use the complete studio lighting and multisample mask.
      request.respond({
        status: 200,
        contentType: 'text/javascript',
        body: `
        import { mountTaku } from './taku-viewer.min.js?v=components-1';
        const stage=document.querySelector('.taku-stage'), shot=location.hash.slice(1)||'overview';
        const side=shot.startsWith('right-')?'right':'left', id=shot.replace(/^right-/,'');
        stage.dataset.view=id;
        if(['shoulder','elbow','wrist','claw'].includes(id))stage.dataset.side=side;
        const viewer=await mountTaku({
          canvas:stage.querySelector('canvas'),mobile:${mobile},initialView:id,initialSide:side,
          assetUrl:new URL('assets/taku-${mobile ? 'mobile' : 'desktop'}.glb',import.meta.url).href,
          lighting:'ggx',antialiasing:'msaa'
        });
        stage.dataset.mode='live';stage.dataset.settled=id;
        addEventListener('hashchange',()=>viewer.setView(id,{side,immediate:true}));
        addEventListener('pagehide',()=>viewer.dispose(),{once:true});
      `,
      });
    });
    await page.evaluateOnNewDocument(() => {
      window.captureTakuMask = location.hash.slice(1) || 'overview';
      const prototype = WebGL2RenderingContext.prototype;
      const blit = prototype.blitFramebuffer;
      // Capture the resolved part-membership channel during authoring only.
      prototype.blitFramebuffer = function (...args) {
        const result = blit.apply(this, args);
        const stage = this.canvas.closest?.('.taku-stage');
        const shot = stage && (stage.dataset.side === 'right' ? 'right-' : '') + stage.dataset.view;
        if (window.captureTakuMask && window.captureTakuMask === shot && args[8] & this.COLOR_BUFFER_BIT) {
          const draw = this.getParameter(this.DRAW_FRAMEBUFFER_BINDING);
          if (!draw) return result;
          const read = this.getParameter(this.READ_FRAMEBUFFER_BINDING);
          this.bindFramebuffer(this.READ_FRAMEBUFFER, draw);
          const w = this.drawingBufferWidth,
            h = this.drawingBufferHeight,
            bytes = new Uint8Array(w * h * 4);
          this.readPixels(0, 0, w, h, this.RGBA, this.UNSIGNED_BYTE, bytes);
          this.bindFramebuffer(this.READ_FRAMEBUFFER, read);
          const cols = 128,
            rows = Math.round((cols * h) / w),
            bits = new Uint8Array(Math.ceil((cols * rows) / 8));
          let count = 0;
          for (let y = 0; y < rows; y++)
            for (let x = 0; x < cols; x++) {
              const px = Math.floor(((x + 0.5) * w) / cols),
                py = h - 1 - Math.floor(((y + 0.5) * h) / rows);
              if (bytes[(py * w + px) * 4 + 3] > 127) {
                const bit = y * cols + x;
                bits[bit >> 3] |= 1 << (bit & 7);
                count++;
              }
            }
          window.takuMask = { cols, rows, bits: btoa(String.fromCharCode(...bits)), count };
          window.captureTakuMask = false;
        }
        return result;
      };
    });
    await page.setViewport({
      width: mobile ? 390 : 1568,
      height: mobile ? 844 : 1050,
      deviceScaleFactor: mobile ? 2 : 1,
    });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    page.on('console', (msg) => {
      if (msg.type() === 'warn') console.log(msg.text());
    });
    const shots = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
    for (const shot of [...shots, 'right-shoulder', 'right-elbow', 'right-wrist', 'right-claw']) {
      if (onlyShot && shot !== onlyShot) continue;
      const filename = shot + (mobile ? '-mobile.webp' : '.webp');
      if (process.argv.includes('--missing') && masks[filename]) continue;
      const id = shot.replace(/^right-/, '');
      // A fresh document gives each still an isolated camera and GPU lifetime.
      await page.goto('about:blank');
      await page.goto(origin + '/research/part-2/#' + shot, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.taku-stage[data-mode="live"]', { timeout: 90000 });
      await page.addStyleTag({
        content: '.stage-tools, .stage-status, #show-cutaway { visibility: hidden !important; }',
      });
      const canvas = await page.$('#taku-canvas');
      await page.waitForFunction(
        (target, right) => {
          const state = document.querySelector('.taku-stage').dataset;
          return state.settled === target && (!right || state.side === 'right');
        },
        {},
        id,
        shot !== id,
      );
      await canvas.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      if (!(await page.evaluate(() => Boolean(window.takuMask)))) {
        // Entering the viewport may re-enable the on-demand renderer after the preset has settled.
        await page.evaluate(() => dispatchEvent(new Event('hashchange')));
        await page.waitForFunction(() => Boolean(window.takuMask), { timeout: 10000 });
      }
      const mask = await page.evaluate(() => window.takuMask);
      if (!mask || mask.count < 4 || mask.count >= mask.cols * mask.rows * 0.95)
        throw new Error(
          'Invalid part mask for ' +
            filename +
            ': ' +
            JSON.stringify(mask && [mask.cols, mask.rows, mask.count]),
        );
      masks[filename] = [mask.cols, mask.rows, mask.bits];
      await canvas.screenshot({
        path: fileURLToPath(new URL(filename, destination)),
        type: 'webp',
        quality: 87,
      });
      await writeFile(maskFile, JSON.stringify(masks) + '\n');
      console.log('Rendered ' + filename);
    }
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
