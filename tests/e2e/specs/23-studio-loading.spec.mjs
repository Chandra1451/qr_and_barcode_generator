// STUDIO LOADING STATUS (UCM-LOAD-01, owner 2026-11-28) — the studio never leaves a visitor with
// a silent preview or a button that does nothing: a slow engine says so, a stuck or failed one says
// so with Try again, and slow exports show they are working. Studio only; the rest of the site is unchanged.
// Plan: projects/universalcodemaker/30_design/studio-loading-status-plan-2026-11-28.md

import { test, expect } from '../support/fixtures.mjs';

const CDN = /cdn\.jsdelivr\.net|unpkg\.com/;
const BWIP = /\/js\/vendor\/bwip-js-min\.js/;
const JSPDF = /\/js\/vendor\/jspdf\.umd\.min\.js/;
const JSZIP = /\/js\/vendor\/jszip\.min\.js/;
// Buttons that need a drawn code (EPS only exists for barcodes, so it is checked where shown).
const ACTIONS = ['#btn-download-svg', '#btn-download-png', '#btn-copy-clipboard', '#btn-open-pdf-modal', '#btn-open-label-modal'];
const FAILED_BARCODE = "The barcode engine didn't load. Check your connection, then try again.";

// Blocked and failed downloads are the point of these tests.
test.use({ allowConsoleErrors: [/bwip-js-min\.js|jspdf\.umd\.min\.js|jszip\.min\.js|Failed to load resource|ERR_CONNECTION_REFUSED|ERR_INTERNET_DISCONNECTED|ERR_FAILED|DynamicLoader/] });

/** Hold an engine download until release() is called (a slow or stuck connection). */
async function hold(page, pattern) {
  let release;
  const gate = new Promise((r) => { release = r; });
  await page.route(pattern, async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  return () => release();
}

const panel = (page) => page.locator('#preview-loading');

test.describe('LOADST · studio shows what is loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(CDN, (r) => r.abort());
  });

  test('LOADST-01 slow barcode engine: status and waiting buttons, then the code and working buttons', async ({ page, studio }) => {
    const release = await hold(page, BWIP);
    await studio.open();
    await studio.symbologySelect.selectOption('ean-13');
    await expect(panel(page)).toBeVisible({ timeout: 2_000 });
    await expect(page.locator('#preview-loading-text')).toHaveText('Loading the barcode engine…');
    await expect(page.locator('#btn-preview-retry')).toBeHidden();
    for (const id of [...ACTIONS, '#btn-download-eps']) await expect(page.locator(id), `${id} while loading`).toBeDisabled();
    await expect(page.locator('#btn-download-svg')).toHaveAttribute('title', 'Available when the code has loaded');

    release();
    await expect(panel(page)).toBeHidden({ timeout: 15_000 });
    expect((await studio.waitForStableRender()).kind).toBe('bwip');
    for (const id of [...ACTIONS, '#btn-download-eps']) await expect(page.locator(id), `${id} after loading`).toBeEnabled();
    // Titles the buttons had before are put back.
    await expect(page.locator('#btn-download-eps')).toHaveAttribute('title', 'EPS vector file for print shops and older design software');
    await expect(page.locator('#btn-download-svg')).not.toHaveAttribute('title', /.+/);
    await studio.download(page.locator('#btn-download-svg'));
    await studio.expectNoRenderError();
  });

  test('LOADST-02 engine already loaded: no status flash when switching codes', async ({ page, studio }) => {
    await studio.open('?symbology=code-128');
    await page.evaluate(() => {
      window.__panelShown = false;
      const box = document.getElementById('preview-loading');
      new MutationObserver(() => { if (!box.hidden) window.__panelShown = true; }).observe(box, { attributes: true });
    });
    await studio.selectGenerator('qr-code');
    await studio.selectGenerator('ean-13');
    await studio.selectGenerator('data-matrix');
    expect(await page.evaluate(() => window.__panelShown)).toBe(false);
  });

  test('LOADST-03 after 15 s it says it is still loading', async ({ page, studio }) => {
    await page.clock.install();
    await hold(page, BWIP);
    await studio.open();
    await studio.symbologySelect.selectOption('code-128');
    await expect(panel(page)).toBeVisible({ timeout: 2_000 });
    await expect(page.locator('#preview-loading-slow')).toBeHidden();
    await page.clock.fastForward(16_000);
    await expect(page.locator('#preview-loading-slow')).toHaveText('Still loading. This can take a while on a slow connection.');
    await expect(page.locator('#btn-preview-retry')).toBeHidden();
  });

  test('LOADST-04 a stuck download fails after 60 s with Try again; the typed number is kept', async ({ page, studio }) => {
    await page.clock.install();
    const release = await hold(page, BWIP);
    await studio.open();
    await studio.symbologySelect.selectOption('ean-13');
    await studio.payloadInput.fill('4006381333931');
    await expect(panel(page)).toBeVisible({ timeout: 2_000 });
    await page.clock.fastForward(61_000);
    await expect(page.locator('#preview-loading-text')).toHaveText(FAILED_BARCODE);
    await expect(page.locator('#btn-preview-retry')).toBeVisible();
    await expect(page.locator('#preview-loading-slow')).toBeHidden();
    await expect(page.locator('.preview-loading-bar')).toBeHidden();
    await expect(page.locator('#btn-download-svg')).toBeDisabled();

    release(); // the connection recovers
    await page.locator('#btn-preview-retry').click();
    await expect(panel(page)).toBeHidden({ timeout: 15_000 });
    expect(await studio.decodePreview()).toBe('4006381333931');
    await expect(page.locator('#btn-download-svg')).toBeEnabled();
  });

  test('LOADST-05 every source fails: plain message, Try again works once the network is back', async ({ page, studio }) => {
    let fail = true;
    await page.route(BWIP, (route) => (fail ? route.abort('connectionrefused') : route.continue()));
    await studio.open();
    await studio.symbologySelect.selectOption('code-128');
    await expect(page.locator('#preview-loading-text')).toHaveText(FAILED_BARCODE, { timeout: 15_000 });
    // The technical loader message never reaches the visitor.
    await expect(page.locator('#preview-stage')).not.toContainText('Failed to load script');
    await expect(studio.errorBox).toBeHidden();
    fail = false;
    await page.locator('#btn-preview-retry').click();
    await expect(panel(page)).toBeHidden({ timeout: 15_000 });
    expect((await studio.waitForStableRender()).kind).toBe('bwip');
    await studio.expectNoRenderError();
  });

  test('LOADST-06 offline: says so, and Try again works when back online', async ({ page, context, studio }) => {
    await studio.open();
    await context.setOffline(true);
    await studio.symbologySelect.selectOption('upc-a');
    await expect(page.locator('#preview-loading-text')).toHaveText('You appear to be offline. Connect, then try again.', { timeout: 15_000 });
    await context.setOffline(false);
    await page.locator('#btn-preview-retry').click();
    await expect(panel(page)).toBeHidden({ timeout: 15_000 });
    expect((await studio.waitForStableRender()).kind).toBe('bwip');
  });

  test('LOADST-09 reduced motion: the bar does not move', async ({ page, studio }) => {
    await hold(page, BWIP);
    await studio.open();
    await studio.symbologySelect.selectOption('code-39');
    await expect(panel(page)).toBeVisible({ timeout: 2_000 });
    const bar = page.locator('.preview-loading-bar span');
    await expect.poll(() => bar.evaluate((e) => getComputedStyle(e).animationName)).toBe('previewLoadingSlide');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => bar.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  });

  test('LOADST-10 screen readers hear the loading and the failure', async ({ page, studio }) => {
    // Held, then refused: the visitor first waits, then the download fails.
    let refuse;
    const gate = new Promise((r) => { refuse = r; });
    await page.route(BWIP, async (route) => { await gate; await route.abort('connectionrefused'); });
    await studio.open();
    await studio.symbologySelect.selectOption('itf-14');
    await expect(page.locator('#preview-status')).toHaveText('Loading the barcode engine…', { timeout: 3_000 });
    refuse();
    await expect(page.locator('#preview-status')).toHaveText(FAILED_BARCODE, { timeout: 15_000 });
  });
});

test.describe('LOADST · slow and failed exports', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(CDN, (r) => r.abort());
  });

  test('LOADST-07 slow PDF tool: "Preparing PDF…", one run only, then the PDF', async ({ page, studio }) => {
    const release = await hold(page, JSPDF);
    const downloads = [];
    page.on('download', (d) => downloads.push(d));
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-pdf-modal').click();
    const btn = page.locator('#btn-generate-pdf');
    await btn.click();
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveText('Preparing PDF…');
    await btn.evaluate((e) => e.click()); // a second click while busy starts nothing
    release();
    await expect.poll(() => downloads.length, { timeout: 30_000 }).toBe(1);
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText(/Generate PDF/);
    await page.waitForTimeout(1_000);
    expect(downloads.length, 'a second PDF was made from the click while busy').toBe(1);
  });

  test('LOADST-08 PDF and ZIP tools that do not load: plain message, buttons usable again', async ({ page, studio }) => {
    await page.route(JSPDF, (r) => r.abort('connectionrefused'));
    await page.route(JSZIP, (r) => r.abort('connectionrefused'));
    await studio.open('?symbology=code-128');

    await page.locator('#btn-open-pdf-modal').click();
    const pdfBtn = page.locator('#btn-generate-pdf');
    await pdfBtn.click();
    await expect.poll(() => studio.toastTexts(), { timeout: 15_000 }).toContainEqual(expect.stringContaining("The PDF tool didn't load. Check your connection, then try again."));
    await expect(pdfBtn).toBeEnabled();
    await expect(pdfBtn).toHaveText(/Generate PDF/);
    await page.locator('#btn-cancel-pdf').click();

    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#batch-format-select').selectOption('png');
    const zipBtn = page.locator('#btn-generate-batch');
    await zipBtn.click();
    await expect.poll(() => studio.toastTexts(), { timeout: 15_000 }).toContainEqual(expect.stringContaining("The ZIP tool didn't load. Check your connection, then try again."));
    await expect(zipBtn).toBeEnabled();
    // No progress bar left sitting at "Processing 0 / 10".
    await expect(page.locator('#batch-progress-box')).toBeHidden();
  });
});
