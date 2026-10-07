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
        // ISBN prints an "ISBN 978-…" header wider than the bars. bwip-js fits that text
        // slightly differently at the small preview scale (3) than at 6+ (measured: 1.094 vs
        // 1.128 width/height; without text the ratio is identical at every scale). The bars
        // themselves scale exactly, so allow 4 % for ISBN and keep 2 % for everything else.
        const shapeTolerance = g.id === 'isbn' ? 0.04 : 0.02;
        expect(relDiff(png.width / png.height, preview.width / preview.height),
          `${scale}x export ${png.width}x${png.height} has a different shape than the preview ${preview.width}x${preview.height}`).toBeLessThan(shapeTolerance);
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

/**
 * Re-draws our EPS output as SVG so the downloaded file can be rasterised and scanned.
 * Understands exactly the operators eps-exporter.js writes (no general PostScript).
 */
function epsToSvg(eps) {
  const hi = /%%HiResBoundingBox: 0 0 ([\d.]+) ([\d.]+)/.exec(eps);
  const xf = /([\d.]+) [\d.]+ scale 0 ([\d.]+) translate 1 -1 scale/.exec(eps);
  if (!hi || !xf) throw new Error('EPS is missing its bounding box or page transform');
  const k = Number(xf[1]);
  const vh = Number(xf[2]);
  const vw = Number(hi[1]) / k;
  const body = eps.slice(eps.indexOf('0 setlinecap'), eps.indexOf('grestore'));
  const tokens = body.split(/\s+/).filter(Boolean);
  const out = [];
  const stack = [];
  let colour = '#000';
  let width = 1;
  let d = '';
  const cmyk = (c, m, y, kk) => `rgb(${[c, m, y].map((v) => Math.round(255 * (1 - v) * (1 - kk))).join(',')})`;
  for (const t of tokens) {
    if (/^-?[\d.]+$/.test(t)) { stack.push(Number(t)); continue; }
    switch (t) {
      case 'setcmykcolor': { const [c, m, y, kk] = stack.splice(-4); colour = cmyk(c, m, y, kk); break; }
      case 'setrgbcolor': { const [r, g, b] = stack.splice(-3); colour = `rgb(${[r, g, b].map((v) => Math.round(v * 255)).join(',')})`; break; }
      case 'setlinewidth': width = stack.pop(); break;
      case 'rectfill': { const [x, y, w, h] = stack.splice(-4); out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colour}"/>`); break; }
      case 'm': { const [x, y] = stack.splice(-2); d += `M${x} ${y}`; break; }
      case 'l': { const [x, y] = stack.splice(-2); d += `L${x} ${y}`; break; }
      case 'c': { const p = stack.splice(-6); d += `C${p.join(' ')}`; break; }
      case 'z': d += 'Z'; break;
      case 'newpath': d = ''; break;
      case 'fill': out.push(`<path d="${d}" fill="${colour}"/>`); d = ''; break;
      case 'eofill': out.push(`<path d="${d}" fill="${colour}" fill-rule="evenodd"/>`); d = ''; break;
      case 'stroke': out.push(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}"/>`); d = ''; break;
      case 'setlinecap': case 'setlinejoin': stack.pop(); break;
      default: throw new Error(`Unexpected EPS operator: ${t}`);
    }
  }
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;
}

test.describe('EXP-EPS · EPS downloads (barcodes)', () => {
  for (const g of BARCODE_GENERATORS) {
    test(`EXP-12 ${g.id}: EPS is valid, the size of the SVG at 1 pt per module, and scans`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      await expect(page.locator('#btn-download-eps')).toBeVisible();
      const file = await studio.download(page.locator('#btn-download-eps'));
      expect(file.filename).toMatch(/\.eps$/);
      const eps = file.buffer.toString('latin1');
      expect(eps.startsWith('%!PS-Adobe-3.0 EPSF-3.0\n')).toBe(true);
      expect(eps).toMatch(/^%%BoundingBox: 0 0 \d+ \d+$/m);
      expect(eps.trim().endsWith('%%EOF')).toBe(true);
      expect(eps.split('\n').every((line) => line.length <= 255), 'EPS line longer than 255 characters').toBe(true);
      expect(/[^\x09\x0a\x0d\x20-\x7e]/.test(eps), 'EPS is not 7-bit clean').toBe(false);
      const svg = (await studio.download(page.locator('#btn-download-svg'))).buffer.toString('utf8');
      const redrawn = epsToSvg(eps);
      expect(relDiff(svgSize(redrawn).width / svgSize(redrawn).height, svgSize(svg).width / svgSize(svg).height)).toBeLessThan(0.001);
      const text = await decodeFirst(await rasterizeSvg(page, redrawn));
      expect(text, 'EPS (re-drawn) does not scan').not.toBeNull();
      expect(normaliseScan(g.id, text)).toBe(expectedFor(g));
    });
  }

  test('EXP-13 EPS is offered for barcodes only, and keeps bar colour and rounded corners', async ({ studio, page }) => {
    await studio.open();
    await expect(page.locator('#btn-download-eps'), 'EPS button should be hidden for QR codes').toBeHidden();
    await studio.open('?symbology=ean-13');
    await page.locator('.barcode-preset-chip[data-bar="#14532d"]').click();
    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(300);
    const eps = (await studio.download(page.locator('#btn-download-eps'))).buffer.toString('latin1');
    // #14532d = rgb(20, 83, 45)
    expect(eps).toContain('0.078 0.325 0.176 setrgbcolor');
    // Corners are a rounded background shape, not a clip path (some programs ignore EPS clips).
    expect(eps, 'EPS should not rely on a clip path').not.toMatch(/\bclip\b/);
  });

  test('EXP-14 rounded corners show in the EPS itself (dark background, 40px corners)', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    await page.locator('.barcode-preset-chip[data-bg="#0f1117"]').click();
    await page.locator('.corner-preset-btn[data-radius="40"]').click();
    await page.waitForTimeout(300);
    const eps = (await studio.download(page.locator('#btn-download-eps'))).buffer.toString('latin1');
    const png = readPng(await rasterizeSvg(page, epsToSvg(eps)));
    const px = (x, y) => { const i = (png.width * y + x) * 4; return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] }; };
    const dark = hexToRgb('#0f1117');
    // rasterizeSvg draws the code 32px in from each edge of a white canvas.
    expect(colorDistance(px(34, 34), { r: 255, g: 255, b: 255 }), 'top-left corner is not cut off').toBeLessThan(40);
    expect(colorDistance(px(png.width - 35, png.height - 35), { r: 255, g: 255, b: 255 }), 'bottom-right corner is not cut off').toBeLessThan(40);
    expect(colorDistance(px(Math.round(png.width / 2), 34), dark), 'top edge should be the dark background').toBeLessThan(40);
  });
});

test.describe('EXP-QRSAME · every styled-QR export is the same image', () => {
  // Since 2026-10-08 the preview, PNG, PDF sheet and batch all build styled QR codes with one
  // function (qrStylingConfig / renderStyledQr in engine.js). Before, batch dropped the gradient
  // and the PDF dropped background, padding and logo size. At the same scale the files must match.
  function samePixels(a, b) {
    if (a.width !== b.width || a.height !== b.height) return { same: false, why: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` };
    let off = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) + Math.abs(a.data[i + 3] - b.data[i + 3]);
      if (d > 40) off++;
    }
    const ratio = off / (a.width * a.height);
    return { same: ratio < 0.005, why: `${(ratio * 100).toFixed(2)}% of pixels differ` };
  }

  test('EXP-15 PNG, batch PNG and PDF sheet image match (gradient, background, padding, corners)', async ({ studio, page }) => {
    await studio.open();
    await studio.fillWizard({ url: 'https://qa.example.com/same' });
    await studio.setControl('gradientEnabled', true);
    await studio.setControl('gradientColor1', '#dc2626');
    await studio.setControl('gradientColor2', '#2563eb');
    await studio.setControl('backgroundColor', '#fef9c3');
    await studio.setControl('qrPadding', 16);
    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.locator('#scale-factor-select').selectOption('2');
    await studio.waitForStableRender();

    const png = readPng((await studio.download(page.locator('#btn-download-png'))).buffer);
    // The background colour and both gradient colours must be in the file at all.
    const has = (img, hex, tol = 60) => {
      const c = hexToRgb(hex);
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] > 200 && colorDistance({ r: img.data[i], g: img.data[i + 1], b: img.data[i + 2] }, c) < tol) return true;
      }
      return false;
    };
    expect(has(png, '#fef9c3', 12), 'PNG lacks the chosen background colour').toBe(true);
    expect(has(png, '#dc2626'), 'PNG lacks gradient colour 1').toBe(true);
    expect(has(png, '#2563eb'), 'PNG lacks gradient colour 2').toBe(true);

    // Batch, same payload and scale.
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#tab-batch-csv').click();
    await page.locator('#batch-csv-input').fill('https://qa.example.com/same');
    await page.locator('#batch-format-select').selectOption('png');
    await page.locator('#batch-scale-select').selectOption('2');
    const zip = await JSZip.loadAsync((await studio.download(page.locator('#btn-generate-batch'))).buffer);
    const batchPng = readPng(await Object.values(zip.files).find((f) => !f.dir).async('nodebuffer'));
    const batchCheck = samePixels(batchPng, png);
    expect(batchCheck.same, `batch QR differs from the PNG download: ${batchCheck.why}`).toBe(true);
    await page.keyboard.press('Escape');

    // PDF sheet: capture the image jsPDF embeds (it renders at 2x).
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    await page.evaluate(() => {
      window.__pdfImages = [];
      const api = window.jspdf?.jsPDF?.API;
      const orig = api.addImage;
      api.addImage = function (img, ...rest) {
        window.__pdfImages.push(typeof img === 'string' ? img : '');
        return orig.call(this, img, ...rest);
      };
    });
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    const first = await page.evaluate(() => window.__pdfImages.find((s) => s.startsWith('data:image/png')));
    expect(first, 'could not capture the PDF label image').toBeTruthy();
    const pdfImg = readPng(Buffer.from(first.split(',')[1], 'base64'));
    const pdfCheck = samePixels(pdfImg, png);
    expect(pdfCheck.same, `PDF sheet QR differs from the PNG download: ${pdfCheck.why}`).toBe(true);
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
      // jsPDF stores images raw unless compress: true (a sheet was ~3.5 MB; compressed ~20 KB).
      expect(file.buffer.length, 'PDF is not compressed').toBeLessThan(500 * 1024);
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
