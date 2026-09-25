// SMOKE — every page opens cleanly (no console errors, no failed requests, no
// horizontal scroll), the studio renders, and the existing unit-test runner passes.

import { test, expect } from '../support/fixtures.mjs';
import { ALL_PAGES } from '../support/catalog.mjs';

const isExternal = !!process.env.UCM_BASE_URL;

test.describe('SMOKE · pages', () => {
  for (const p of ALL_PAGES) {
    test(`SMOKE-01 ${p} loads without errors @smoke`, async ({ page }) => {
      const res = await page.goto(`/${p}`);
      if (p === '404.html') expect(res.status()).toBeLessThan(500);
      else expect(res.status(), `HTTP status for ${p}`).toBe(200);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('header.v2-header')).toBeVisible();
      await expect(page.locator('footer.v2-footer')).toBeVisible();
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      expect(overflow, 'page is wider than the viewport (horizontal scroll / zoomed-out on phones)').toBeLessThanOrEqual(1);
    });
  }
});

test('SMOKE-02 studio shows a rendered QR code on first load @smoke', async ({ studio }) => {
  await studio.open();
  const fp = await studio.fingerprint();
  expect(fp.kind).toBe('qr');
  expect(fp.inkRatio, 'preview is blank').toBeGreaterThan(0.05);
  await studio.expectNoRenderError();
  expect(await studio.decodePreview()).toBe('https://github.com');
});

test('SMOKE-03 vendor engines load from the site itself, never from a public CDN @smoke', async ({ studio, netLog }) => {
  await studio.open();
  await studio.selectGenerator('code-128');
  const cdn = netLog.filter((r) => /cdn\.jsdelivr\.net|unpkg\.com/.test(r.url)).map((r) => r.url);
  expect(cdn, 'self-hosted vendor file failed and the loader fell back to a CDN').toEqual([]);
});

test('SMOKE-04 existing in-browser unit tests all pass', async ({ page }) => {
  test.skip(isExternal, '/tests/ is blocked on the live site');
  await page.goto('/tests/test-runner.html');
  const results = await page.waitForFunction(() => window.__TEST_RESULTS__, null, { timeout: 30_000 }).then((h) => h.jsonValue());
  expect(results.failed, `unit test failures: ${JSON.stringify(results)}`).toBe(0);
  expect(results.passed).toBeGreaterThan(0);
});

test('SMOKE-05 private folders are not reachable (production rule)', async ({ request, baseURL }) => {
  test.skip(!isExternal, 'checks .htaccess rules; run with UCM_BASE_URL set to the live site');
  for (const p of ['/tools/', '/tests/', '/tests/e2e/package.json', '/02_PROJECT_MEMORY.md', '/.git/config']) {
    const res = await request.get(new URL(p, baseURL).href, { failOnStatusCode: false, maxRedirects: 0 });
    expect([403, 404], `${p} returned ${res.status()}`).toContain(res.status());
  }
});
