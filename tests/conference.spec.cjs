const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
test('required content and local assets are present', async ({ page, request }) => {
  const external = [],
    errors = [];
  await page.route('**/*', (route) => {
    if (!route.request().url().startsWith('http://127.0.0.1:4399')) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.programme__item')).toHaveCount(5);
  await expect(page.locator('.speaker-card')).toHaveCount(5);
  await expect(page.locator('.ticket-card')).toHaveCount(3);
  for (const image of await page.locator('img').all()) {
    expect(await image.getAttribute('alt')).toBeTruthy();
    expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    const response = await request.get(await image.getAttribute('src'));
    expect(response.ok()).toBe(true);
    expect((await response.body()).length).toBeLessThan(1000000);
  }
  for (const link of await page.locator('.site-nav a').all())
    expect(await page.locator(await link.getAttribute('href')).count()).toBe(1);
  await expect(page.locator('#praktiskt iframe')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
for (const width of [320, 768, 1024, 1440]) {
  test(`responsive and accessible at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    }
  });
}
test('keyboard hover equivalent, reduced motion, theme selection and mobile navigation work', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  const card = page.locator('.speaker-card').first();
  await card.locator('a').focus();
  await expect(card.locator('img')).toHaveCSS('filter', 'grayscale(0)');
  expect(
    await card.locator('.speaker-card__details').evaluate((e) => e.clientHeight),
  ).toBeGreaterThan(30);
  await expect(page.locator('.pipeline')).toHaveCSS('animation-name', 'none');
  await page.locator('.theme-toggle').click();
  const selected = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', selected);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.site-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
});
test('page remains useful without JavaScript and at zoom-equivalent viewport widths', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  const noScript = await context.newPage();
  await noScript.goto('http://127.0.0.1:4399');
  await expect(noScript.locator('.site-nav a').first()).toBeVisible();
  expect(await noScript.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    320,
  );
  await context.close();
  // 1440px at 200% and 300% browser zoom leaves 720px and 480px of CSS layout space.
  for (const width of [720, 480]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});
test('rehearsal timer, local portfolio and source reading work', async ({ page, request }) => {
  await page.goto('/redovisning.html');
  await page.locator('#timer-toggle').click();
  await expect(page.locator('#clock')).toHaveText('02:59', { timeout: 3000 });
  await page.locator('#timer-toggle').click();
  await expect(page.locator('#timer-status')).toHaveText('Pausad.');
  await page.locator('#timer-reset').click();
  await expect(page.locator('#clock')).toHaveText('03:00');
  if (
    require('node:fs').existsSync(
      require('node:path').resolve(__dirname, '../../SoftwareEngineerPortfolio/index.html'),
    )
  )
    expect((await request.get('/portfolio/')).ok()).toBe(true);
  expect((await request.get('/src/styles.css')).ok()).toBe(true);
  expect((await request.get('/.git/config')).status()).toBe(404);
  expect((await request.get('/assets/..%5c.git%5cconfig')).status()).toBe(404);
});
