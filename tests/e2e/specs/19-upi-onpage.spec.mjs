// UPI landing tool, easy mode for shopkeepers (UCM-IN-03, 2026-11-22).
import { test, expect } from '../support/fixtures.mjs';
import { decodeFirst } from '../support/decode.mjs';
import { getWizardDef } from '../support/catalog.mjs';
import fs from 'node:fs/promises';

const url = '/pages/upi-qr-code-generator.html';
const status = (page) => page.locator('#upi-status');
const btn = (page, name) => page.getByRole('button', { name, exact: true });
const expectedLink = ({ vpa, name, amount = '' }) => getWizardDef('upi').compile({ vpa, payeeName: name, amount, note: '' });

async function fill(page, { vpa, name, amount }) {
  if (vpa !== undefined) await page.getByLabel('Your UPI ID').fill(vpa);
  if (name !== undefined) await page.getByLabel('Shop name').fill(name);
  if (amount !== undefined) await page.getByLabel('Amount in ₹ (optional)').fill(amount);
}

// Tests that open their own context get the same third-party stubs as the shared fixture,
// so live runs don't depend on ad and analytics scripts (live phone probe 2026-11-22: tool works with them).
async function stubThirdParty(ctx) {
  await ctx.route(/googlesyndication\.com|doubleclick\.net|adservice\.google|googletagmanager\.com|google-analytics\.com|cloudflareinsights\.com|fundingchoicesmessages\.google\.com/,
    (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
}

async function download(page, button) {
  const ready = page.waitForEvent('download');
  await btn(page, button).click();
  const dl = await ready;
  return { name: dl.suggestedFilename(), bytes: await fs.readFile(await dl.path()) };
}

test('UPI-01 starts empty with downloads off and the JavaScript notice hidden', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('#upi-startup')).toBeHidden();
  await expect(status(page)).toHaveText('Enter your UPI ID and shop name to begin.');
  for (const name of ['Download QR image', 'Print shop poster (PDF)']) await expect(btn(page, name)).toBeDisabled();
});

test('UPI-02 the downloaded QR holds exactly the link the studio makes', async ({ page }) => {
  await page.goto(url);
  const form = { vpa: 'sharmastore@okbank', name: 'Sharma General Store' };
  await fill(page, form);
  await expect(status(page)).toContainText('Ready. Customers will see the name "Sharma General Store"');
  await expect(page.locator('#upi-preview img')).toBeVisible();
  const { name, bytes } = await download(page, 'Download QR image');
  expect(name).toBe('upi-qr-sharma-general-store.png');
  expect(await decodeFirst(bytes)).toBe(expectedLink(form));
});

test('UPI-03 an amount ends up in the code and in the status', async ({ page }) => {
  await page.goto(url);
  const form = { vpa: 'shop@upi', name: 'Tea Stall', amount: '150' };
  await fill(page, form);
  await expect(status(page)).toContainText('and the amount ₹150');
  const { bytes } = await download(page, 'Download QR image');
  const decoded = await decodeFirst(bytes);
  expect(decoded).toBe(expectedLink(form));
  expect(decoded).toContain('&am=150');
});

test('UPI-04 wrong inputs give plain messages and never leave a stale download', async ({ page }) => {
  await page.goto(url);
  await fill(page, { vpa: 'shop@upi', name: 'Tea Stall' });
  await expect(btn(page, 'Download QR image')).toBeEnabled();
  const cases = [
    [{ vpa: 'shop @upi' }, 'should not have spaces', '#upi-vpa'],
    [{ vpa: 'shopupi' }, 'does not look like a UPI ID', '#upi-vpa'],
    [{ vpa: 'shop@upi', name: '' }, 'Enter your shop name', '#upi-name'],
    [{ name: 'Tea Stall', amount: 'abc' }, 'Enter the amount as a number', '#upi-amount'],
    [{ amount: '0' }, 'Enter the amount as a number', '#upi-amount'],
  ];
  for (const [change, message, field] of cases) {
    await fill(page, change);
    await expect(status(page)).toContainText(message);
    await expect(page.locator(field)).toHaveAttribute('aria-invalid', 'true');
    await expect(btn(page, 'Download QR image')).toBeDisabled();
    await expect(btn(page, 'Print shop poster (PDF)')).toBeDisabled();
  }
  await fill(page, { amount: '' });
  await expect(btn(page, 'Download QR image')).toBeEnabled();
});

test('UPI-05 the poster is a real A5 PDF by default and A4 when chosen, and its QR scans', async ({ page }) => {
  // Capture the poster canvas handed to the PDF so the printed QR itself can be decoded.
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...a) { const u = orig.apply(this, a); if (this.width >= 1700) window.__poster = u; return u; };
  });
  await page.goto(url);
  await fill(page, { vpa: 'shop@upi', name: 'Tea Stall' });
  await expect(btn(page, 'Print shop poster (PDF)')).toBeEnabled();
  const a5 = await download(page, 'Print shop poster (PDF)');
  expect(a5.name).toBe('upi-poster-tea-stall-a5.pdf');
  expect(a5.bytes.subarray(0, 5).toString()).toBe('%PDF-');
  // jsPDF writes page sizes in points at full precision: A5 ≈ 419.53 x 595.28, A4 ≈ 595.28 x 841.89.
  expect(a5.bytes.toString('latin1')).toMatch(/MediaBox \[0 0 419\.5\d* 595\.2\d*\]/);
  const poster = await page.evaluate(() => window.__poster);
  expect(await decodeFirst(Buffer.from(poster.split(',')[1], 'base64'))).toBe(expectedLink({ vpa: 'shop@upi', name: 'Tea Stall' }));
  await page.getByLabel('Poster size').selectOption('a4');
  const a4 = await download(page, 'Print shop poster (PDF)');
  expect(a4.name).toBe('upi-poster-tea-stall-a4.pdf');
  expect(a4.bytes.toString('latin1')).toMatch(/MediaBox \[0 0 595\.2\d* 841\.8\d*\]/);
});

test('UPI-06 "Share" appears only where the phone can share images, and shares a PNG', async ({ browser, baseURL }) => {
  const without = await browser.newContext({ baseURL });
  await stubThirdParty(without);
  await without.addInitScript(() => { Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true }); });
  const p1 = await without.newPage();
  await p1.goto(url);
  await expect(p1.locator('#upi-share')).toBeHidden();
  await without.close();

  const withShare = await browser.newContext({ baseURL });
  await stubThirdParty(withShare);
  await withShare.addInitScript(() => {
    window.__shared = null;
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', { value: async (data) => { window.__shared = { n: data.files.length, type: data.files[0].type, name: data.files[0].name }; }, configurable: true });
  });
  const p2 = await withShare.newPage();
  await p2.goto(url);
  await fill(p2, { vpa: 'shop@upi', name: 'Tea Stall' });
  const share = p2.getByRole('button', { name: 'Share on WhatsApp or other apps' });
  await expect(share).toBeEnabled();
  await share.click();
  await expect.poll(() => p2.evaluate(() => window.__shared)).toEqual({ n: 1, type: 'image/png', name: 'upi-qr-tea-stall.png' });
  await withShare.close();
});

test('UPI-07 markup typed into the shop name stays text', async ({ page }) => {
  await page.goto(url);
  await fill(page, { vpa: 'shop@upi', name: '<b>Tea</b> Stall' });
  await expect(status(page)).toContainText('"<b>Tea</b> Stall"');
  await expect(page.locator('#upi-onpage b')).toHaveCount(0);
});

test('UPI-08 the UPI ID and shop name are never sent anywhere', async ({ page }) => {
  const sent = [];
  page.on('request', (req) => sent.push(`${req.url()} ${req.postData() || ''}`));
  await page.goto(url);
  await fill(page, { vpa: 'privacycheck@upi', name: 'Privacy Check Store' });
  await expect(btn(page, 'Download QR image')).toBeEnabled();
  await download(page, 'Download QR image');
  expect(sent.filter((s) => /privacycheck|Privacy%20Check|Privacy Check/i.test(s))).toEqual([]);
});

test('UPI-09 fits a phone screen with large touch targets', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 375, height: 812 } });
  await stubThirdParty(ctx);
  const page = await ctx.newPage();
  await page.goto(url);
  await fill(page, { vpa: 'shop@upi', name: 'Tea Stall' });
  await expect(btn(page, 'Download QR image')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const name of ['Download QR image', 'Print shop poster (PDF)']) {
    const box = await btn(page, name).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await ctx.close();
});
