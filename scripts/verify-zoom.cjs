// Kontrollera verklig webbläsarzoom genom Chromiums tabs-API i en isolerad profil.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
async function main() {
  const extension = path.resolve('.local-data/zoom-extension');
  fs.mkdirSync(extension, { recursive: true });
  fs.writeFileSync(
    path.join(extension, 'manifest.json'),
    JSON.stringify({
      manifest_version: 3,
      name: 'Local zoom verification',
      version: '1.0',
      permissions: ['tabs'],
      background: { service_worker: 'worker.js' },
    }),
  );
  fs.writeFileSync(
    path.join(extension, 'worker.js'),
    'chrome.runtime.onInstalled.addListener(()=>{});',
  );
  const context = await chromium.launchPersistentContext(path.resolve('.local-data/zoom-profile'), {
    channel: 'chromium',
    headless: true,
    viewport: null,
    args: [
      '--window-size=1440,1000',
      '--disable-extensions-except=' + extension,
      '--load-extension=' + extension,
    ],
  });
  try {
    const worker = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4398/');
    const checks = [];
    for (const zoom of [1, 2, 3]) {
      await worker.evaluate(async (factor) => {
        const tabs = await chrome.tabs.query({});
        const tab = tabs.find((tab) => tab.url.startsWith('http://127.0.0.1:4398/'));
        await chrome.tabs.setZoom(tab.id, factor);
      }, zoom);
      await page.waitForTimeout(250);
      const state = await page.evaluate(() => {
        const selectors = ['.speaker-grid', '.ticket-grid', '.programme'];
        const overlap = selectors.some((selector) => {
          const children = [...document.querySelector(selector).children].map((child) =>
            child.getBoundingClientRect(),
          );
          return children.some((a, i) =>
            children
              .slice(i + 1)
              .some(
                (b) =>
                  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
              ),
          );
        });
        return {
          outerWidth,
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          devicePixelRatio,
          overlap,
        };
      });
      if (state.scrollWidth > state.innerWidth || state.overlap)
        throw new Error('Layout error at zoom ' + zoom);
      checks.push({ zoom, ...state });
      await page.screenshot({ path: `docs/evidence/zoom-${zoom * 100}.png`, fullPage: true });
    }
    const result = { browser: context.browser().version(), method: 'chrome.tabs.setZoom', checks };
    fs.writeFileSync('docs/evidence/browser-zoom.json', JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(checks));
  } finally {
    await context.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
