// BARCODE & QR SCANNER (barcode-scanner.html)
//
// The scanner must read what the studio makes, and it must stay private and safe:
// nothing is uploaded, the reader never comes from a third-party CDN, decoded text is
// never treated as HTML, only http(s) links can be opened, and the hand-off to the
// studio never puts the decoded text in a URL.

import { test, expect } from '../support/fixtures.mjs';
import { PNG } from 'pngjs';
import { BARCODE_GENERATORS, expectedScanText, normaliseScan } from '../support/catalog.mjs';

const SCANNER = '/barcode-scanner.html';

// Chromium's built-in fake camera (a moving test pattern) for SCAN-31; harmless elsewhere.
test.use({ launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });
const DECODE_TIMEOUT = 20_000;

/** Render a QR code with the Plain Text wizard and return the preview as PNG bytes. */
async function qrPng(studio, page, text) {
  await studio.open('?symbology=qr-code&wizard=text');
  const before = await studio.fingerprint();
  await page.locator('.wizard-input[data-field="text"]').fill(text);
  await studio.waitForChange(before, { what: 'the QR preview' });
  await studio.waitForStableRender();
  return studio.previewPng();
}

async function scanPng(page, png, name = 'code.png') {
  await page.goto(SCANNER);
  await page.setInputFiles('#scan-file', { name, mimeType: 'image/png', buffer: png });
  await expect(page.locator('#scan-status')).toHaveAttribute('data-kind', /ok|error/, { timeout: DECODE_TIMEOUT });
}

const resultTexts = (page) => page.locator('.scan-result-text').allTextContents();

test.describe('SCAN · reads what the studio makes', () => {
  for (const g of BARCODE_GENERATORS) {
    test(`SCAN-01 ${g.id}: a studio PNG is read back to its payload`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      const png = await studio.previewPng();
      await scanPng(page, png);
      const texts = (await resultTexts(page)).map((t) => normaliseScan(g.id, t));
      expect(texts).toContain(normaliseScan(g.id, expectedScanText(g.id, g.defaultPayload)));
      await expect(page.getByRole('button', { name: 'Create a copy in Studio' }).first()).toBeVisible();
    });
  }

  test('SCAN-02 qr-code: multi-line UTF-8 text is read back exactly', async ({ studio, page }) => {
    const text = 'Line one\nZweite Zeile – ünïcödé ✓\n第三行';
    await scanPng(page, await qrPng(studio, page, text));
    expect(await resultTexts(page)).toContain(text);
  });

  test('SCAN-03 an image without a code says so', async ({ page }) => {
    const white = new PNG({ width: 64, height: 64 });
    white.data.fill(255);
    const blank = PNG.sync.write(white);
    await scanPng(page, blank, 'blank.png');
    await expect(page.locator('#scan-status')).toHaveAttribute('data-kind', 'error');
    await expect(page.locator('#scan-status')).toContainText('No QR code or barcode found');
    await expect(page.locator('.scan-result')).toHaveCount(0);
  });

  test('SCAN-04 a non-image file is refused without decoding', async ({ page }) => {
    await page.goto(SCANNER);
    await page.setInputFiles('#scan-file', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(page.locator('#scan-status')).toContainText('not an image');
  });
});

test.describe('SCAN · privacy', () => {
  test('SCAN-10 the reader loads only from this site and nothing about the scan is sent anywhere', async ({ studio, page, netLog, baseURL }) => {
    const secret = 'PRIVATE-SCAN-TEST-7f3a91';
    const png = await qrPng(studio, page, secret);
    netLog.length = 0;
    await scanPng(page, png);
    expect(await resultTexts(page)).toContain(secret);

    const origin = new URL(baseURL).origin;
    const readerRequests = netLog.filter((r) => /zxing/i.test(r.url));
    expect(readerRequests.length, 'the reader should have been loaded').toBeGreaterThan(0);
    for (const r of readerRequests) expect(new URL(r.url).origin, `reader file from another host: ${r.url}`).toBe(origin);

    const leaks = netLog.filter((r) => r.url.includes(secret) || r.postData.includes(secret) || (r.method !== 'GET' && new URL(r.url).origin === origin));
    expect(leaks, 'decoded text must never leave the browser').toEqual([]);
    const thirdParty = netLog.filter((r) => !r.url.startsWith(origin) && !/^data:|^blob:/.test(r.url)
      && !/googlesyndication|doubleclick|adservice\.google|googletagmanager|google-analytics|fonts\.g/.test(r.url));
    expect(thirdParty.map((r) => r.url), 'unexpected third-party requests').toEqual([]);
  });

  test('SCAN-11 "Create a copy in Studio" keeps the text out of the URL and loads it into the studio', async ({ studio, page, netLog }) => {
    const secret = 'HANDOFF-TEST-4c2d';
    await scanPng(page, await qrPng(studio, page, secret));
    netLog.length = 0;
    await page.getByRole('button', { name: 'Create a copy in Studio' }).click();
    await page.waitForURL(/index\.html\?from=scanner$/);
    await expect(page.locator('.wizard-input[data-field="text"]')).toHaveValue(secret);
    expect(netLog.filter((r) => r.url.includes(secret)), 'the decoded text appeared in a request URL').toEqual([]);
    expect(await page.evaluate(() => sessionStorage.getItem('ucm_scan_handoff')), 'hand-off must be deleted after use').toBeNull();
  });

  test('SCAN-12 barcode hand-off selects the matching generator', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await studio.page.locator('#payload-input').fill('SCAN-HANDOFF-128');
    await studio.waitForStableRender();
    await scanPng(page, await studio.previewPng());
    await page.getByRole('button', { name: 'Create a copy in Studio' }).click();
    await page.waitForURL(/from=scanner/);
    await expect(page.locator('#symbology-select')).toHaveValue('code-128');
    await expect(page.locator('#payload-input')).toHaveValue('SCAN-HANDOFF-128');
  });
});

test.describe('SCAN · untrusted content is handled safely', () => {
  test('SCAN-20 HTML inside a code is shown as text and never runs', async ({ studio, page }) => {
    const evil = '<img src=x onerror="window.__scanXss=1"><script>window.__scanXss=2</script>';
    await scanPng(page, await qrPng(studio, page, evil));
    expect(await resultTexts(page)).toContain(evil);
    await expect(page.locator('#scan-results img, #scan-results script')).toHaveCount(0);
    expect(await page.evaluate(() => window.__scanXss)).toBeUndefined();
  });

  test('SCAN-21 an https link gets a safe Open button and a phishing warning', async ({ studio, page }) => {
    await scanPng(page, await qrPng(studio, page, 'https://example.com/menu?table=4'));
    const open = page.getByRole('link', { name: 'Open example.com' });
    await expect(open).toHaveAttribute('href', 'https://example.com/menu?table=4');
    await expect(open).toHaveAttribute('target', '_blank');
    await expect(open).toHaveAttribute('rel', /noopener/);
    await expect(open).toHaveAttribute('rel', /noreferrer/);
    await expect(page.locator('.scan-result-warning')).toContainText('example.com');
  });

  for (const bad of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'file:///etc/passwd']) {
    test(`SCAN-22 "${bad.split(':')[0]}:" content is never turned into a link`, async ({ studio, page }) => {
      await scanPng(page, await qrPng(studio, page, bad));
      expect(await resultTexts(page)).toContain(bad);
      await expect(page.locator('#scan-results a')).toHaveCount(0);
    });
  }
});

test.describe('SCAN · page', () => {
  test('SCAN-30 camera button is offered, and the upload control is keyboard reachable', async ({ page }) => {
    await page.goto(SCANNER);
    await expect(page.locator('#scan-camera-btn')).toBeVisible();
    await expect(page.locator('#scan-camera-box')).toBeHidden();
    await page.locator('#scan-file').focus();
    await expect(page.locator('#scan-file')).toBeFocused();
  });
});

test.describe('SCAN · camera (browser fake camera)', () => {
  test.use({ permissions: ['camera'] });

  test('SCAN-31 the camera starts on request and Stop really releases it', async ({ page }) => {
    await page.goto(SCANNER);
    await page.locator('#scan-camera-btn').click();
    await expect(page.locator('#scan-camera-box')).toBeVisible();
    await expect(page.locator('#scan-status')).toContainText('Point the camera');
    await expect.poll(() => page.evaluate(() => {
      const v = document.querySelector('#scan-video');
      return v.srcObject?.getVideoTracks()[0]?.readyState ?? 'none';
    })).toBe('live');
    // Only video is requested, never the microphone.
    expect(await page.evaluate(() => document.querySelector('#scan-video').srcObject.getAudioTracks().length)).toBe(0);

    const track = await page.evaluateHandle(() => document.querySelector('#scan-video').srcObject.getVideoTracks()[0]);
    await page.locator('#scan-camera-stop').click();
    await expect(page.locator('#scan-camera-box')).toBeHidden();
    expect(await track.evaluate((t) => t.readyState)).toBe('ended');
  });
});

test('SCAN-32 nothing but the inputs shows before a scan (no empty preview or camera box)', async ({ page }) => {
  await page.goto(SCANNER);
  await expect(page.locator('#scan-preview')).toBeHidden();
  await expect(page.locator('#scan-camera-box')).toBeHidden();
  await expect(page.locator('.scan-result')).toHaveCount(0);
});
