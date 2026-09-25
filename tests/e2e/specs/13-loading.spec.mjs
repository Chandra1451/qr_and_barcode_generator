// LOADING & CACHING — "sometimes when the site loads, some functions don't load and some
// settings stop working."
//
// The studio no longer loads everything up front:
//   • bwip-js (1.1 MB), jsPDF and JSZip are injected only when first needed, with an 8 s
//     timeout per source and a CDN fallback (js/core/dynamic-loader.js);
//   • qr-code-styling is prefetched in requestIdleCallback;
//   • JS files are cached 1 day under plain URLs, HTML only 1 hour (.htaccess).
// These tests reproduce the ways that can go wrong for a real visitor.

import { test, expect } from '../support/fixtures.mjs';
import { Studio } from '../support/studio.mjs';
import { gitAvailable, installStaleCache } from '../support/stale-cache.mjs';

const isExternal = !!process.env.UCM_BASE_URL;
const CDN = /cdn\.jsdelivr\.net|unpkg\.com/;

/** Every control a visitor can touch must still change the preview. */
async function expectCoreControlsWork(studio, page) {
  // QR styling bar
  let fp = await studio.waitForStableRender();
  await studio.setControl('qrPadding', 30);
  fp = await studio.waitForChange(fp, { what: 'QR padding' });
  // Corner radius (added after v2-studio.js?v=2.6 was introduced). QR preview rounding is CSS.
  await page.locator('.corner-preset-btn[data-radius="18"]').click();
  await expect(page.locator('#qr-styled-container canvas')).toHaveCSS('border-top-left-radius', '18px');
  // Rounded corners force a minimum quiet zone (engine clamp), so reset before testing padding.
  await page.locator('.corner-preset-btn[data-radius="0"]').click();
  // Barcode path (lazy bwip-js) + a generator slider
  await studio.selectGenerator('code-39');
  fp = await studio.fingerprint();
  await studio.setControl('padding', 0);
  await studio.waitForChange(fp, { what: 'Code 39 padding' });
  // Quick-launch bar
  await page.locator('.v2-quick-btn[data-symbology="ean-13"]').first().click();
  await expect(studio.symbologySelect).toHaveValue('ean-13');
}

test.describe('LOAD · returning visitor with yesterday\'s cached scripts', () => {
  test.skip(isExternal, 'uses git history of the local checkout');

  test('LOAD-01 new HTML + cached older JS still boots and every setting works', async ({ browser, baseURL }, testInfo) => {
    test.skip(!gitAvailable(), 'not a git checkout');
    const context = await browser.newContext({ acceptDownloads: true });
    await context.addInitScript(() => localStorage.setItem('ucs_cookie_consent', 'acknowledged'));
    await context.route(/googlesyndication|googletagmanager|google-analytics|doubleclick|fonts\.g/, (r) => r.fulfill({ status: 200, body: '' }));
    const info = await installStaleCache(context, baseURL);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const studio = new Studio(page);
    try {
      await page.goto('/index.html');
      await expect.poll(() => page.evaluate(() => !!window.v2StudioApp), {
        message: `studio never started with cached scripts from ${info.commit}. Errors: ${errors.join(' | ')}`,
        timeout: 10_000,
      }).toBe(true);
      await expectCoreControlsWork(studio, page);
      expect(errors).toEqual([]);
    } finally {
      await testInfo.attach('stale-cache', { body: JSON.stringify(info, null, 2), contentType: 'application/json' });
      await context.close();
    }
  });
});

test.describe('LOAD · lazy engine loading', () => {
  test('LOAD-02 studio still renders when the idle-time prefetch never runs', async ({ page, studio }) => {
    await page.addInitScript(() => { window.requestIdleCallback = () => 0; });
    await studio.open();
    expect(await studio.decodePreview()).toBe('https://github.com');
  });

  test('LOAD-03 picking a barcode the instant the page appears works (bwip-js not loaded yet)', async ({ page, studio }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('.v2-quick-btn[data-symbology="code-128"]').first().click();
    await studio.nudgeSlider('padding', 'ArrowLeft', 5);
    await page.waitForTimeout(500);
    const fp = await studio.waitForStableRender({ timeout: 15_000 });
    expect(fp.kind).toBe('bwip');
    expect((await studio.appState()).options.padding).toBe(5);
    await studio.expectNoRenderError();
  });

  test('LOAD-04 slow mobile connection: 1.1 MB barcode engine arrives after the 8 s timeout', async ({ page, studio, netLog }) => {
    test.setTimeout(120_000);
    await page.route(CDN, (r) => r.abort());
    await page.route(/\/js\/vendor\/bwip-js-min\.js/, async (route) => {
      await new Promise((r) => setTimeout(r, 10_000));
      await route.continue();
    });
    await studio.open();
    await studio.symbologySelect.selectOption('ean-13');
    const fp = await studio.waitForStableRender({ timeout: 60_000 }).catch(() => null);
    expect(fp?.kind, 'barcode never rendered on a slow connection (loader gave up after its timeout)').toBe('bwip');
    await studio.expectNoRenderError();
    expect(netLog.filter((r) => CDN.test(r.url)).map((r) => r.url), 'fell back to a CDN copy').toEqual([]);
  });

  test('LOAD-05 one failed engine download is not permanent: the next attempt recovers', async ({ page, studio }) => {
    await page.route(CDN, (r) => r.abort());
    let failFirst = true;
    await page.route(/\/js\/vendor\/bwip-js-min\.js/, (route) => {
      if (failFirst) { failFirst = false; return route.abort('connectionreset'); }
      return route.continue();
    });
    await studio.open();
    await studio.symbologySelect.selectOption('code-128');
    await expect(studio.errorBox).toBeVisible({ timeout: 15_000 }); // first try fails: expected
    // Network is back. Choosing a barcode again must work without reloading the page.
    await studio.symbologySelect.selectOption('ean-13');
    await expect.poll(async () => (await studio.fingerprint())?.kind, { timeout: 15_000, message: 'barcodes stay broken until reload (failed load is remembered)' }).toBe('bwip');
    await studio.expectNoRenderError();
  });
  // The failed first download is logged on purpose in LOAD-05.
  test.use({ allowConsoleErrors: [/bwip-js-min\.js|Failed to load script|Failed to load resource|ERR_CONNECTION_RESET|ERR_FAILED|DynamicLoader/] });

  test('LOAD-06 PDF export on a slow connection (jsPDF arrives after the timeout) still works', async ({ page, studio }) => {
    test.setTimeout(90_000);
    await page.route(CDN, (r) => r.abort());
    await page.route(/\/js\/vendor\/jspdf\.umd\.min\.js/, async (route) => {
      await new Promise((r) => setTimeout(r, 10_000));
      await route.continue();
    });
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-pdf-modal').click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }).catch(() => null),
      page.locator('#btn-generate-pdf').click(),
    ]);
    expect(download, `no PDF; toast: ${(await studio.toastTexts()).join(' | ')}`).not.toBeNull();
  });

  test('LOAD-07 every module the studio needs loads from the site (no 404s, no CDN) on a cold visit', async ({ page, studio, netLog }) => {
    const failed = [];
    page.on('response', (r) => { if (r.status() >= 400 && /\.js/.test(r.url())) failed.push(`${r.status()} ${r.url()}`); });
    await studio.open();
    await studio.selectGenerator('pdf417');
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    expect(failed).toEqual([]);
    expect(netLog.filter((r) => CDN.test(r.url)).map((r) => r.url)).toEqual([]);
  });
});
