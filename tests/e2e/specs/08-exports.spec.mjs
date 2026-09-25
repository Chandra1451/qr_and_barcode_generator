// EXPORTS — downloaded files are valid, match what the preview shows (shape, colours,
// corners), and scan back to the payload. "Test the exported file, not just the preview."

import { test, expect } from '../support/fixtures.mjs';
import JSZip from 'jszip';
import { decodeFirst } from '../support/decode.mjs';
import { GENERATORS, BARCODE_GENERATORS, expectedScanText, normaliseScan } from '../support/catalog.mjs';
import { isPng, readPng, colorStats, hexToRgb, colorDistance, alphaAt, svgSize, pdfInfo, relDiff } from '../support/images.mjs';

/** Rasterise SVG text in the browser (white background, extra quiet zone) → PNG buffer. */
async function rasterizeSvg(page, svgText, targetWidth = 1200) {
  const size = svgSize(svgText) || { width: 300, height: 150 };
  const dataUrl = await page.evaluate(async ({ svg, size, targetWidth }) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = targetWidth / size.width;
    const c = document.createElement('canvas');
    c.width = Math.round(size.width * k) + 64;
    c.height = Math.round(size.height * k) + 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 32, 32, c.width - 64, c.height - 64);
    URL.revokeObjectURL(url);
    return c.toDataURL('image/png');
  }, { svg: svgText, size, targetWidth });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

/** PNG buffer padded onto white (for decoding exports with padding 0 / transparency). */
async function padOnWhite(page, pngBuf) {
  const dataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width + 64;
    c.height = img.height + 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 32, 32);
    return c.toDataURL('image/png');
  }, pngBuf.toString('base64'));
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

const expectedFor = (g) => normaliseScan(g.id, expectedScanText(g.id, g.defaultPayload ?? ''));
const QR_DEFAULT = 'https://github.com';

test.describe('EXP-PNG · PNG downloads', () => {
  for (const g of GENERATORS) {
    test(`EXP-01 ${g.id}: 1x/2x/4x PNGs are valid, scale correctly, match the preview shape, and scan`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      const preview = await studio.fingerprint();
      const sizes = {};
      for (const scale of ['1', '2', '4']) {
        await page.locator('#scale-factor-select').selectOption(scale);
        const file = await studio.download(page.locator('#btn-download-png'));
        expect(file.filename).toMatch(new RegExp(`^${g.id}-${scale}x-\\d+\\.png$`));
        expect(isPng(file.buffer), 'not a PNG file').toBe(true);
        const png = readPng(file.buffer);
        sizes[scale] = png;
        expect(relDiff(png.width / png.height, preview.width / preview.height),
          `${scale}x export ${png.width}x${png.height} has a different shape than the preview ${preview.width}x${preview.height}`).toBeLessThan(0.02);
        const text = await decodeFirst(await padOnWhite(page, file.buffer));
        expect(text, `${scale}x PNG does not scan`).not.toBeNull();
        expect(normaliseScan(g.id, text)).toBe(g.id === 'qr-code' ? QR_DEFAULT : expectedFor(g));
      }
      expect(relDiff(sizes['2'].width, sizes['1'].width * 2), '2x should be twice as wide as 1x').toBeLessThan(0.03);
      expect(relDiff(sizes['4'].width, sizes['1'].width * 4), '4x should be four times as wide as 1x').toBeLessThan(0.03);
    });
  }

  test('EXP-02 PNG export carries the styling shown in the preview (colours, rounded corners)', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('.barcode-preset-chip[data-bar="#003366"]').click();
    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(400);
    const file = await studio.download(page.locator('#btn-download-png'));
    const png = readPng(file.buffer);
    const stats = colorStats(png);
    expect(colorDistance(stats.ink, hexToRgb('#003366')), `bar colour in file: ${JSON.stringify(stats.ink)}`).toBeLessThan(20);
    expect(colorDistance(stats.background, hexToRgb('#f0f7ff')), `background in file: ${JSON.stringify(stats.background)}`).toBeLessThan(20);
    expect(alphaAt(png, 0, 0), 'rounded corner should be transparent in the file').toBe(0);
  });

  test('EXP-03 QR PNG export keeps colours, transparency and the logo', async ({ studio, page }) => {
    await studio.open();
    await studio.setControl('dotsType', 'square');
    await studio.setControl('dotsColor', '#b91c1c');
    await studio.setControl('cornerColor', '#b91c1c');
    await studio.setControl('cornerDotColor', '#b91c1c');
    await studio.setControl('transparentBg', true);
    await page.locator('.preset-icon-chip').nth(1).click();
    await page.waitForTimeout(500);
    const file = await studio.download(page.locator('#btn-download-png'));
    const png = readPng(file.buffer);
    const stats = colorStats(png);
    expect(stats.transparentRatio, 'transparent background lost in export').toBeGreaterThan(0.2);
    // With a transparent background, the most common opaque colour is the dot colour.
    expect(colorDistance(stats.background, hexToRgb('#b91c1c')), `dot colour in file: ${JSON.stringify(stats.background)}`).toBeLessThan(30);
    expect(await decodeFirst(await padOnWhite(page, file.buffer))).toBe(QR_DEFAULT);
  });
});

test.describe('EXP-SVG · vector downloads', () => {
  for (const g of GENERATORS) {
    test(`EXP-10 ${g.id}: SVG is valid, has the preview's proportions, and scans when rasterised`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      const preview = await studio.fingerprint();
      const file = await studio.download(page.locator('#btn-download-svg'));
      expect(file.filename).toMatch(/\.svg$/);
      const svg = file.buffer.toString('utf8');
      expect(svg).toMatch(/<svg[\s>]/);
      expect(svg, 'SVG should not embed scripts').not.toMatch(/<script/i);
      const size = svgSize(svg);
      expect(size, 'SVG has no viewBox or width/height').not.toBeNull();
      expect(relDiff(size.width / size.height, preview.width / preview.height),
        `SVG ${size.width}x${size.height} vs preview ${preview.width}x${preview.height}`).toBeLessThan(0.03);
      const text = await decodeFirst(await rasterizeSvg(page, svg));
      expect(text, 'rasterised SVG does not scan').not.toBeNull();
      expect(normaliseScan(g.id, text)).toBe(g.id === 'qr-code' ? QR_DEFAULT : expectedFor(g));
    });
  }

  test('EXP-11 SVG export carries bar colour and rounded corners', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    await page.locator('.barcode-preset-chip[data-bar="#14532d"]').click();
    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(300);
    const svg = (await studio.download(page.locator('#btn-download-svg'))).buffer.toString('utf8');
    expect(svg.toLowerCase()).toContain('14532d');
    expect(svg, 'rounded corners missing (no clipPath / rx)').toMatch(/clipPath|rx="/);
  });
});

test.describe('EXP-CLIP · clipboard', () => {
  test('EXP-20 "Copy" puts a scannable PNG on the clipboard', async ({ studio, page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await studio.open('?symbology=code-128');
    await page.locator('#btn-copy-clipboard').click();
    await expect(page.locator('#btn-copy-clipboard')).toContainText(/Copied/i);
    const b64 = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      const item = items.find((i) => i.types.includes('image/png'));
      if (!item) return null;
      const buf = await (await item.getType('image/png')).arrayBuffer();
      let s = '';
      new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); });
      return btoa(s);
    });
    expect(b64, 'no image/png on the clipboard').not.toBeNull();
    const text = await decodeFirst(await padOnWhite(page, Buffer.from(b64, 'base64')));
    expect(text).toBe(BARCODE_GENERATORS.find((g) => g.id === 'code-128').defaultPayload);
  });
});

test.describe('EXP-PDF · Avery / sign PDFs', () => {
  for (const tpl of ['avery-5160', 'avery-5163', 'avery-l7160', 'single-center']) {
    test(`EXP-30 ${tpl}: PDF downloads, is valid and contains the code`, async ({ studio, page }) => {
      await studio.open('?symbology=code-128');
      await page.locator('#btn-open-pdf-modal').click();
      await page.locator('#pdf-template-select').selectOption(tpl);
      const file = await studio.download(page.locator('#btn-generate-pdf'));
      expect(file.filename).toMatch(/\.pdf$/);
      const info = pdfInfo(file.buffer);
      expect(info.isPdf, 'not a PDF').toBe(true);
      expect(info.hasEof, 'PDF is truncated').toBe(true);
      expect(info.pageCount).toBeGreaterThanOrEqual(1);
      expect(info.imageCount, 'no barcode image embedded').toBeGreaterThanOrEqual(1);
      await expect(page.locator('#pdf-modal')).not.toHaveClass(/open/);
    });
  }

  test('EXP-31 asking for more labels than fit on one sheet is not silently cut', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-pdf-modal').click();
    await page.locator('#pdf-template-select').selectOption('avery-5163'); // 10 per sheet
    const max = Number(await page.locator('#pdf-quantity-input').getAttribute('max'));
    if (max <= 10) return; // UI already prevents it
    await page.locator('#pdf-quantity-input').evaluate((e) => { e.value = '20'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    const file = await studio.download(page.locator('#btn-generate-pdf'));
    expect(pdfInfo(file.buffer).pageCount, '20 labels on a 10-per-sheet template should give 2 pages').toBeGreaterThanOrEqual(2);
  });

  test('EXP-32 PDF labels use the colours and padding chosen in the studio', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    // First export loads jsPDF; then capture the images it embeds.
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    await page.evaluate(() => {
      window.__pdfImages = [];
      const api = window.jspdf?.jsPDF?.API;
      const orig = api.addImage;
      api.addImage = function (img, ...rest) {
        window.__pdfImages.push(typeof img === 'string' ? img : img?.toDataURL ? img.toDataURL('image/png') : '');
        return orig.call(this, img, ...rest);
      };
    });
    await page.locator('.barcode-preset-chip[data-bar="#991b1b"]').click();
    await page.waitForTimeout(300);
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    const first = await page.evaluate(() => window.__pdfImages.find((s) => s.startsWith('data:image/png')));
    expect(first, 'could not capture the embedded label image').toBeTruthy();
    const stats = colorStats(readPng(Buffer.from(first.split(',')[1], 'base64')));
    expect(colorDistance(stats.ink, hexToRgb('#991b1b')), `PDF bar colour ${JSON.stringify(stats.ink)} ≠ studio colour #991b1b`).toBeLessThan(25);
  });
});

test.describe('EXP-ZIP · batch export', () => {
  async function runBatch(studio, page, setup) {
    await page.locator('#btn-open-batch-modal').click();
    await setup();
    const file = await studio.download(page.locator('#btn-generate-batch'));
    expect(file.filename).toMatch(/\.zip$/);
    return JSZip.loadAsync(file.buffer);
  }

  test('EXP-40 sequence mode: right number of files, right names, each file scans to its own value', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    const zip = await runBatch(studio, page, async () => {
      await page.locator('#tab-batch-seq').click();
      await page.locator('#batch-prefix').fill('INV-');
      await page.locator('#batch-start').fill('1');
      await page.locator('#batch-count').fill('5');
      await page.locator('#batch-pad').fill('4');
      await page.locator('#batch-format-select').selectOption('png');
    });
    const files = Object.values(zip.files).filter((f) => !f.dir);
    expect(files.length).toBe(5);
    for (let i = 1; i <= 5; i++) {
      const value = `INV-${String(i).padStart(4, '0')}`;
      const f = files.find((x) => x.name.includes(value));
      expect(f, `no file for ${value} (files: ${files.map((x) => x.name).join(', ')})`).toBeTruthy();
      const buf = await f.async('nodebuffer');
      expect(isPng(buf)).toBe(true);
      expect(await decodeFirst(await padOnWhite(page, buf)), `${f.name} encodes the wrong value`).toBe(value);
    }
  });

  test('EXP-41 list mode + SVG: unsafe names are sanitised, every SVG scans', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    const items = ['ALPHA 1', 'b/2:c', 'GAMMA-3'];
    const zip = await runBatch(studio, page, async () => {
      await page.locator('#tab-batch-csv').click();
      await page.locator('#batch-csv-input').fill(items.join('\n'));
      await page.locator('#batch-format-select').selectOption('svg');
    });
    const files = Object.values(zip.files).filter((f) => !f.dir);
    expect(files.length).toBe(3);
    for (const f of files) {
      expect(f.name, 'unsafe characters in file name').not.toMatch(/[\\/:*?"<>|]/);
      expect(f.name).toMatch(/\.svg$/);
      const svg = await f.async('string');
      const text = await decodeFirst(await rasterizeSvg(page, svg));
      expect(items, `${f.name} scans to "${text}"`).toContain(text);
    }
  });

  test('EXP-42 batch QR codes scan', async ({ studio, page }) => {
    await studio.open();
    const zip = await runBatch(studio, page, async () => {
      await page.locator('#tab-batch-csv').click();
      await page.locator('#batch-csv-input').fill('https://example.com/a\nhttps://example.com/b');
      await page.locator('#batch-format-select').selectOption('png');
    });
    const files = Object.values(zip.files).filter((f) => !f.dir);
    const texts = [];
    for (const f of files) texts.push(await decodeFirst(await padOnWhite(page, await f.async('nodebuffer'))));
    expect(texts.sort()).toEqual(['https://example.com/a', 'https://example.com/b']);
  });

  test('EXP-43 batch files use the colours and padding chosen in the studio', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('.barcode-preset-chip[data-bar="#003366"]').click();
    await studio.setControl('padding', 0);
    await page.waitForTimeout(400);
    const single = readPng((await studio.download(page.locator('#btn-download-png'))).buffer);
    const zip = await runBatch(studio, page, async () => {
      await page.locator('#tab-batch-csv').click();
      await page.locator('#batch-csv-input').fill(BARCODE_GENERATORS.find((g) => g.id === 'code-128').defaultPayload);
      await page.locator('#batch-format-select').selectOption('png');
      await page.locator('#batch-scale-select').selectOption(await page.locator('#scale-factor-select').inputValue());
    });
    const f = Object.values(zip.files).find((x) => !x.dir);
    const batchPng = readPng(await f.async('nodebuffer'));
    const stats = colorStats(batchPng);
    expect(colorDistance(stats.ink, hexToRgb('#003366')), `batch bar colour ${JSON.stringify(stats.ink)} ≠ studio #003366`).toBeLessThan(20);
    expect(`${batchPng.width}x${batchPng.height}`, 'batch file differs in size from the single download with the same settings').toBe(`${single.width}x${single.height}`);
  });
});

test.describe('EXP-LBL · label maker exports', () => {
  test('EXP-50 label PNG, single-label PDF and sheet PDF all download and are valid', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    await page.waitForTimeout(400);

    const png = await studio.download(page.locator('#btn-export-label-png'));
    expect(isPng(png.buffer)).toBe(true);
    const img = readPng(png.buffer);
    const badge = await page.locator('#label-dimension-badge').textContent();
    const [, w, h] = badge.match(/([\d.]+)"\s*×\s*([\d.]+)"/);
    expect(relDiff(img.width / img.height, Number(w) / Number(h)), 'label PNG proportions ≠ label size').toBeLessThan(0.02);
    expect(img.width / Number(w), 'label PNG should be ~300 DPI').toBeGreaterThanOrEqual(290);
    const text = await decodeFirst(png.buffer);
    expect(text, 'barcode on the label does not scan').toBe(BARCODE_GENERATORS.find((g) => g.id === 'code-128').defaultPayload);

    for (const btn of ['#btn-export-label-pdf', '#btn-export-label-sheet']) {
      const file = await studio.download(page.locator(btn));
      const info = pdfInfo(file.buffer);
      expect(info.isPdf, `${btn} is not a PDF`).toBe(true);
      expect(info.pageCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('EXP-51 Amazon FNSKU preset produces a scannable Code 128 FNSKU label', async ({ studio, page }) => {
    await studio.open('?symbology=code-128&preset=amazon-fnsku-5160&label=1');
    await expect(page.locator('#label-maker-modal')).toHaveClass(/open/);
    await page.waitForTimeout(500);
    const png = await studio.download(page.locator('#btn-export-label-png'));
    const text = await decodeFirst(png.buffer);
    expect(text, 'FNSKU barcode does not scan').toMatch(/^X00[0-9A-Z]{7}$/);
  });
});
