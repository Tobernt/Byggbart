const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
async function main() {
  const output = path.resolve(__dirname, '../docs/evidence');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
      ['tablet', 768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('http://127.0.0.1:4398/');
      await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('http://127.0.0.1:4398/');
    await page.screenshot({ path: path.join(output, 'dark.png'), fullPage: true });
  } finally {
    await browser.close();
  }
  const { launch } = await import('chrome-launcher');
  const { default: lighthouse } = await import('lighthouse');
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox'],
    logLevel: 'silent',
  });
  try {
    const result = await lighthouse('http://127.0.0.1:4398/', {
      port: chrome.port,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      logLevel: 'error',
    });
    fs.writeFileSync(path.join(output, 'lighthouse.html'), result.report[0]);
    fs.writeFileSync(path.join(output, 'lighthouse.json'), result.report[1]);
    console.log(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score * 100]),
        ),
      ),
    );
  } finally {
    await chrome.kill();
  }
  const reportBrowser = await chromium.launch();
  try {
    const reportPage = await reportBrowser.newPage({ viewport: { width: 1440, height: 1000 } });
    await reportPage.goto(
      require('node:url').pathToFileURL(path.join(output, 'lighthouse.html')).href,
    );
    await reportPage.screenshot({ path: path.join(output, 'lighthouse.png') });
  } finally {
    await reportBrowser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
