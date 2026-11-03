import { test, expect } from '../support/fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { decodeFirst } from '../support/decode.mjs';
import { pngDpi } from '../support/images.mjs';
import { PNG } from 'pngjs';

const url = '/pages/ean-13-barcode-generator.html';
const input = page => page.getByLabel('Product number', { exact: true });
const status = page => page.locator('#ean-status');

async function routeBaseline(page) {
  if (!process.env.UCM_EAN_BASELINE_HTML) return;
  const html = await fs.readFile(process.env.UCM_EAN_BASELINE_HTML, 'utf8');
  await page.route('**/pages/ean-13-barcode-generator.html', route => route.fulfill({ body: html, contentType: 'text/html' }));
}

// Optional comparison against the released HTML proves these checks detect the missing feature.
test.beforeEach(async ({ page }) => {
  await routeBaseline(page);
});

async function generate(page, value = '590123412345') {
  await input(page).fill(value);
  await page.getByRole('button', { name: 'Generate barcode', exact: true }).click();
  await expect(status(page)).toContainText('5901234123457');
}

test('Empty, valid, invalid and changed values never leave stale downloads', async ({ page }) => {
  const requests = [];
  page.on('request', req => requests.push({ url: req.url(), body: req.postData() || '' }));
  const response = await page.goto(url);
  expect(response.headers()['x-robots-tag'] || '').not.toMatch(/noindex/i);
  await expect(input(page)).toBeEmpty();
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled();
  await generate(page);
  await expect(page.locator('#ean-preview canvas')).toBeVisible();
  for (const value of ['5901234123458', '12345678901', '12345678901234', '59012341234a']) {
    await input(page).fill(value);
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled();
    await expect(page.locator('#ean-preview canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Generate barcode', exact: true }).click();
    await expect(input(page)).toHaveAttribute('aria-invalid', 'true');
  }
  await generate(page, '5901234123457');
  await input(page).fill('000123456789');
  await input(page).press('Enter');
  await expect(status(page)).toContainText('0001234567895');
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeEnabled();
  const generatedNumbers = ['590123412345', '5901234123457', '000123456789', '0001234567895'];
  expect(requests.filter(request => generatedNumbers.some(value => request.url.includes(value) || request.body.includes(value)))).toEqual([]);
});

test('Actual SVG and both PNG downloads decode and preserve physical size metadata', async ({ page }, testInfo) => {
  await page.goto(url);
  await generate(page);
  let svgWidth, svgHeight;
  for (const name of ['Download SVG', 'PNG 2×', 'PNG 4×']) {
    const downloadReady = page.waitForEvent('download');
    await page.getByRole('button', { name, exact: true }).click();
    const download = await downloadReady;
    await download.saveAs(testInfo.outputPath(name === 'Download SVG' ? 'ean-example.svg' : name === 'PNG 2×' ? 'ean-example-2x.png' : 'ean-example-4x.png'));
    const bytes = await fs.readFile(await download.path());
    if (name === 'Download SVG') {
      const svg = bytes.toString();
      expect(svg).toMatch(/width="[\d.]+mm"/);
      expect(svg).toMatch(/height="[\d.]+mm"/);
      svgWidth = Number(svg.match(/width="([\d.]+)mm"/)[1]);
      svgHeight = Number(svg.match(/height="([\d.]+)mm"/)[1]);
      const png = await page.evaluate(async text => {
        const image = new Image();
        image.src = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth * 4; canvas.height = image.naturalHeight * 4;
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(image.src);
        return canvas.toDataURL().split(',')[1];
      }, svg);
      expect(await decodeFirst(Buffer.from(png, 'base64'))).toBe('5901234123457');
    } else {
      expect(await decodeFirst(bytes)).toBe('5901234123457');
      expect(pngDpi(bytes)?.x).toBeCloseTo(name === 'PNG 2×' ? 461.818 : 923.636, 0);
      expect(pngDpi(bytes)?.y).toBeCloseTo(name === 'PNG 2×' ? 461.818 : 923.636, 0);
      const png = PNG.sync.read(bytes);
      // bwip's vector/raster outer bounds include differently rounded text/padding.
      // Permit less than one 0.33 mm module, rather than claiming identical crops.
      expect(Math.abs(png.width / pngDpi(bytes).x * 25.4 - svgWidth)).toBeLessThan(0.33);
      expect(Math.abs(png.height / pngDpi(bytes).y * 25.4 - svgHeight)).toBeLessThan(0.33);
    }
  }
});

test('Example is explicitly a demonstration and normal edits remove that label', async ({ page }) => {
  await page.goto(url);
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await expect(status(page)).toContainText('Demonstration only. 5901234123457');
  await generate(page);
  await expect(status(page)).not.toContainText('Demonstration');
});

test('JavaScript unavailable leaves guidance and an explicit fallback', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await routeBaseline(page);
  await page.goto(url);
  await expect(page.getByText('This tool needs JavaScript.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'open the full studio', exact: true })).toHaveAttribute('href', '../index.html?symbology=ean-13');
  await expect(page.getByRole('button', { name: 'Generate barcode', exact: true })).toBeDisabled();
  await context.close();
});

test('Editing during slow library loading cancels obsolete preview; retry succeeds', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/js/vendor/bwip-js-min.js', async route => { await gate; await route.continue(); });
  await page.goto(url);
  await input(page).fill('590123412345');
  await page.getByRole('button', { name: 'Generate barcode', exact: true }).click();
  await expect(status(page)).toContainText('Generating');
  await input(page).fill('invalid');
  release();
  await page.waitForFunction(() => Boolean(window.bwipjs));
  await expect(page.locator('#ean-preview canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled();
  await generate(page);
});

test.describe('Intentional render failure', () => {
  // The shared renderer logs this injected failure; keep all unrelated console errors guarded.
  test.use({ allowConsoleErrors: [/Test render failure/] });

  test('Render failure is actionable and can recover', async ({ page }) => {
    await page.goto(url);
    await generate(page);
    await page.evaluate(() => { window.originalToCanvas = window.bwipjs.toCanvas; window.bwipjs.toCanvas = () => { throw new Error('Test render failure'); }; });
    await input(page).fill('5901234123457');
    await page.getByRole('button', { name: 'Generate barcode', exact: true }).click();
    await expect(status(page)).toContainText('Could not generate');
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled();
    await page.evaluate(() => { window.bwipjs.toCanvas = window.originalToCanvas; });
    await generate(page);
  });
});

test('Full customization opens the EAN studio without putting the entered number in its URL', async ({ page }) => {
  await page.goto(url);
  await generate(page);
  const studioLink = page.getByRole('link', { name: 'Launch studio for full customization', exact: true });
  await expect(studioLink).toHaveAttribute('href', '../index.html?symbology=ean-13');
  await studioLink.click();
  await expect(page).toHaveURL(/\/index\.html\?symbology=ean-13$/);
  await expect(page.locator('#symbology-select')).toHaveValue('ean-13');
  expect(page.url()).not.toContain('590123412345');
});

for (const theme of ['light', 'dark']) {
  for (const width of [320, 375, 390, 1366]) {
    test(`Readable widget and exports at ${width}px ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(value => localStorage.setItem('ucm_theme', value), theme);
      await page.goto(url);
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      await generate(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).include('#ean-onpage').analyze();
      expect(results.violations).toEqual([]);
      await page.locator('#ean-onpage').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 100));
      await page.screenshot({ path: testInfo.outputPath(`ean-${width}-${theme}.png`), fullPage: true });
    });
  }
}
