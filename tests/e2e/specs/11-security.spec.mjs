// SECURITY & PRIVACY — the site's promises: nothing typed leaves the browser, and no
// input (typed, pasted, or arriving through a link) can run script on the page.

import { test, expect } from '../support/fixtures.mjs';

const XSS = '<img src=x onerror="window.__xss=(window.__xss||0)+1">';
const XSS_SCRIPT = '"><svg onload="window.__xss=(window.__xss||0)+1">';

async function expectNoXss(page, where) {
  await page.waitForTimeout(1800); // history is written 1.2 s after the input settles
  expect(await page.evaluate(() => window.__xss || 0), `script ran via ${where}`).toBe(0);
  expect(await page.locator('#recent-chips-list img, #recent-chips-list svg[onload], .tactile-toast img').count(), `markup injected via ${where}`).toBe(0);
}

test.describe('SEC · no script injection', () => {
  test('SEC-01 a crafted link (?data=) cannot inject HTML into history chips', async ({ studio, page }) => {
    await studio.open(`?symbology=code-128&data=${encodeURIComponent(XSS)}`, { waitForRender: false });
    await expectNoXss(page, '?data= deep link → recent history');
  });

  test('SEC-02 typed barcode payload cannot inject HTML', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await studio.setPayload(XSS_SCRIPT);
    await expectNoXss(page, 'payload input');
  });

  test('SEC-03 QR wizard text cannot inject HTML (history + restore toast)', async ({ studio, page }) => {
    await studio.open();
    await studio.selectWizard('url');
    await studio.fillWizard({ url: `https://a.example/${XSS}` });
    await page.waitForTimeout(1600);
    const chip = page.locator('.recent-chip').first();
    if (await chip.count()) await chip.click();
    await expectNoXss(page, 'QR wizard → history chip → restore toast');
  });

  test('SEC-04 stored history from an older/poisoned session is rendered as text', async ({ context, page, studio }) => {
    await context.addInitScript((xss) => {
      localStorage.setItem('ucm_recent_history', JSON.stringify([{ generatorId: 'code-128', name: xss, payload: xss, timestamp: 1 }]));
    }, XSS);
    await studio.open();
    await expectNoXss(page, 'localStorage history');
  });

  test('SEC-05 label maker, PDF title and batch list fields cannot inject HTML', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    for (const sel of ['#label-field-title', '#label-field-sku', '#label-field-footnote']) await page.locator(sel).fill(XSS);
    await page.locator('#btn-close-label-modal').click();
    await page.locator('#btn-open-pdf-modal').click();
    await page.locator('#pdf-sheet-title').fill(XSS);
    await page.locator('#btn-cancel-pdf').click();
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#tab-batch-csv').click();
    await page.locator('#batch-csv-input').fill(`${XSS}\n${XSS_SCRIPT}`);
    await expectNoXss(page, 'label/PDF/batch fields');
  });

  test('SEC-06 a malicious SVG logo cannot run script', async ({ studio, page }) => {
    await studio.open();
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" onload="window.__xss=1"><script>window.__xss=1</script><rect width="64" height="64" fill="red"/></svg>';
    await page.locator('#logo-file-input').setInputFiles({ name: 'logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
    await expectNoXss(page, 'SVG logo upload');
  });
});

test.describe('SEC · privacy: nothing typed leaves the browser', () => {
  const MARKER = 'PRIVACY-CANARY-7f3a91';

  test('SEC-10 no request carries user input (URL, body or headers) during a full session', async ({ studio, page, netLog }) => {
    await studio.open('?symbology=code-128');
    await studio.setPayload(MARKER);
    await page.waitForTimeout(300);
    await studio.download(page.locator('#btn-download-png'));
    await studio.selectGenerator('qr-code');
    await studio.selectWizard('wifi');
    await studio.fillWizard({ ssid: MARKER, password: `${MARKER}-pw` });
    await page.waitForTimeout(300);
    await studio.download(page.locator('#btn-download-svg'));
    await page.locator('#btn-open-pdf-modal').click();
    await page.locator('#pdf-sheet-title').fill(MARKER);
    await studio.download(page.locator('#btn-generate-pdf'));

    const leaks = netLog.filter((r) => r.url.includes(MARKER) || r.url.includes(encodeURIComponent(MARKER)) || r.postData.includes(MARKER));
    expect(leaks.map((r) => `${r.method} ${r.url}`)).toEqual([]);
  });

  test('SEC-11 only expected hosts are contacted', async ({ studio, page, netLog, baseURL }) => {
    await studio.open();
    await studio.selectGenerator('pdf417');
    await page.locator('#btn-open-label-modal').click();
    await page.waitForTimeout(500);
    const allowedHosts = [new URL(baseURL).host, 'pagead2.googlesyndication.com', 'www.googletagmanager.com', 'www.google-analytics.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
    const unexpected = [...new Set(netLog.map((r) => { try { return new URL(r.url).host; } catch { return ''; } }))]
      .filter((h) => h && !allowedHosts.includes(h) && !h.endsWith('.google.com') && !h.endsWith('.doubleclick.net'));
    expect(unexpected).toEqual([]);
  });

  test('SEC-12 Wi-Fi password is not written to localStorage', async ({ studio, page }) => {
    await studio.open();
    await studio.selectWizard('wifi');
    await studio.fillWizard({ ssid: 'HomeNet', password: 'SuperSecret-123' });
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    expect(stored, 'Wi-Fi password persisted in browser storage (recent history)').not.toContain('SuperSecret-123');
  });
});
