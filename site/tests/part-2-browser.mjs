import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { startPreviewServer } from './preview-server.mjs';

const { server, origin } = await startPreviewServer();
let browser;
try {
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== origin || url.pathname.includes('/hero/mount.js')) request.abort();
    else request.continue();
  });

  const follow = async (selector, url) => {
    const [response] = await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click(selector)]);
    assert.equal(response.status(), 200);
    assert.equal(page.url(), url);
  };
  const label = selector => page.$eval(selector, node => node.textContent.trim());
  const checkGraphBar = async expanded => {
    const placement = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      const row = box('.chapter-bar'), panel = box('.graph-panel');
      return {
        expanded: panel.height > 0,
        fits: row.height > 0 && row.top >= Math.max(box('#trajectories').bottom, panel.bottom) - 1
          && row.bottom <= box('.site-footer').top + 1,
      };
    });
    assert.equal(placement.expanded, expanded);
    assert.ok(placement.fits, 'Read Part 2 stays below the graph and above the footer');
  };

  for (const mount of ['/', '/urstaat/']) {
    const home = origin + mount, part1 = home + 'research/', part2 = part1 + 'part-2/';
    await page.goto(home);
    const navigation = await page.$$eval('.header nav a', links => links.map(link => [
      link.textContent.trim().replace(/\s*→$/, ''), link.href,
    ]));
    assert.deepEqual(navigation, [['Research', part1], ['Contents', home + '#contents'], ['Trajectories', home + '#trajectories'], ['Read Part 2', part2]]);
    const barTitle = await label('.chapter-bar .chapter-title');
    assert.equal(await label('.chapter-bar .chapter-action'), 'Read Part 2 →');
    assert.deepEqual(await page.$eval('.footer-read', link => [link.textContent.trim(), link.href]), ['Read Part 1', part1]);

    await page.waitForSelector('.graph-open-year', { visible: true });
    await checkGraphBar(false);
    await page.click('.graph-open-year');
    await page.click('.graph-popup-choice[data-series="data"]');
    await page.click('.graph-expand:not(.graph-preview-back)');
    await page.waitForSelector('.graph-panel', { visible: true });
    await checkGraphBar(true);
    await page.click('.graph-panel-close');
    await page.waitForSelector('.graph-panel', { hidden: true });
    await checkGraphBar(false);

    await follow('.chapter-bar', part2);
    assert.ok(barTitle);
    assert.equal(await label('article h1'), barTitle, 'The bar names the destination essay');
    assert.equal(await label('.reading-header .back-link'), 'Back to Part 1');
    await follow('.reading-header .back-link', part1);
    assert.ok(await page.$eval('.chapter-turn', link => {
      const row = link.getBoundingClientRect();
      return row.height > 0 && row.top >= document.querySelector('.essay-body').getBoundingClientRect().bottom - 1
        && row.bottom <= document.querySelector('.essay-end').getBoundingClientRect().top + 1;
    }), 'The chapter link follows the essay and precedes its utility footer');
    assert.equal(await label('.chapter-turn .chapter-action'), 'Read Part 2 →');
    assert.equal(await label('.chapter-turn .chapter-title'), barTitle);
    await follow('.chapter-turn', part2);
  }
  console.log('Part 2 links, graph detail layout, essay ending, and HTTP navigation passed at / and /urstaat/.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
