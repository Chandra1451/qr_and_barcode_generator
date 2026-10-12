// EXPORTS — downloaded files are valid, match what the preview shows (shape, colours,
// corners), and scan back to the payload. "Test the exported file, not just the preview."

import { test, expect } from '../support/fixtures.mjs';
import JSZip from 'jszip';
import zlib from 'node:zlib';
import { decodeFirst } from '../support/decode.mjs';
import { GENERATORS, BARCODE_GENERATORS, expectedScanText, normaliseScan } from '../support/catalog.mjs';
import { isPng, readPng, colorStats, hexToRgb, colorDistance, alphaAt, svgSize, pdfInfo, relDiff, pngDpi } from '../support/images.mjs';

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
  // Since 2026-10-07 the preview, PNG, PDF sheet and batch all build styled QR codes with one
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

test.describe('EXP-CONN · connections from the feature map (each test also checks the opposite case)', () => {
  /** Captures the PNG images jsPDF embeds in the next PDF downloads. jsPDF must already be loaded. */
  async function hookPdfImages(page) {
    await page.evaluate(() => {
      window.__pdfImages = [];
      const api = window.jspdf?.jsPDF?.API;
      if (api.__ucmHooked) return;
      const orig = api.addImage;
      api.addImage = function (img, ...rest) {
        window.__pdfImages.push(typeof img === 'string' ? img : '');
        return orig.call(this, img, ...rest);
      };
      api.__ucmHooked = true;
    });
  }
  async function pdfLabelImage(studio, page) {
    await page.evaluate(() => { window.__pdfImages = []; });
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf'));
    const first = await page.evaluate(() => window.__pdfImages.find((s) => s.startsWith('data:image/png')));
    expect(first, 'could not capture the PDF label image').toBeTruthy();
    return readPng(Buffer.from(first.split(',')[1], 'base64'));
  }

  test('EXP-33 PDF sheet barcodes get the studio\'s rounded corners (and square ones at 0px)', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-pdf-modal').click();
    await studio.download(page.locator('#btn-generate-pdf')); // loads jsPDF
    await hookPdfImages(page);

    const square = await pdfLabelImage(studio, page);
    expect(alphaAt(square, 1, 1), 'corner should be opaque with 0px corners').toBeGreaterThan(200);

    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(300);
    const rounded = await pdfLabelImage(studio, page);
    expect(alphaAt(rounded, 1, 1), 'PDF barcode corner is not rounded (pixel is opaque)').toBeLessThan(50);
    expect(alphaAt(rounded, Math.round(rounded.width / 2), Math.round(rounded.height / 2))).toBeGreaterThan(200);
  });

  test('EXP-44 batch SVG QR codes get the rounded corners, and still scan', async ({ studio, page }) => {
    const batchSvg = async () => {
      await page.locator('#btn-open-batch-modal').click();
      await page.locator('#tab-batch-csv').click();
      await page.locator('#batch-csv-input').fill('https://qa.example.com/svg');
      await page.locator('#batch-format-select').selectOption('svg');
      await page.locator('#batch-scale-select').selectOption('2');
      const zip = await JSZip.loadAsync((await studio.download(page.locator('#btn-generate-batch'))).buffer);
      await page.keyboard.press('Escape');
      return Object.values(zip.files).find((f) => !f.dir).async('string');
    };
    await studio.open();
    const square = await batchSvg();
    expect(square, 'no corner clip expected at 0px').not.toMatch(/ucm-rounded-corners/);

    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(300);
    const rounded = await batchSvg();
    expect(rounded, 'batch SVG QR has no rounded-corner clip').toMatch(/<clipPath id="ucm-rounded-corners-[^"]+"><rect [^>]*rx="36"/);
    const text = await decodeFirst(await rasterizeSvg(page, rounded));
    expect(text, 'rounded batch SVG QR does not scan').toBe('https://qa.example.com/svg');
  });

  test('EXP-45 QR SVG download with rounded corners is a valid file that scans', async ({ studio, page }) => {
    // Bug found 2026-10-07: the corner clip was inserted after the <?xml?> declaration, outside <svg>.
    await studio.open();
    await page.locator('.corner-preset-btn[data-radius="18"]').click();
    await page.waitForTimeout(300);
    const svg = (await studio.download(page.locator('#btn-download-svg'))).buffer.toString('utf8');
    expect(svg.indexOf('<clipPath id="ucm-rounded-corners-'), 'corner clip must sit inside <svg>').toBeGreaterThan(svg.search(/<svg[\s>]/));
    const text = await decodeFirst(await rasterizeSvg(page, svg));
    expect(text, 'rounded QR SVG does not open or scan').not.toBeNull();
  });

  test('EXP-52 label maker barcodes use the studio\'s bar colour (and black by default)', async ({ studio, page }) => {
    const labelPng = async () => {
      await page.locator('#btn-open-label-modal').click();
      await page.waitForTimeout(800); // the label's short barcode re-render is async
      const png = readPng((await studio.download(page.locator('#btn-export-label-png'))).buffer);
      await page.keyboard.press('Escape');
      return png;
    };
    const share = (img, hex) => {
      const c = hexToRgb(hex);
      let n = 0;
      for (let i = 0; i < img.data.length; i += 4) {
        if (colorDistance({ r: img.data[i], g: img.data[i + 1], b: img.data[i + 2] }, c) < 40) n++;
      }
      return n / (img.width * img.height);
    };
    await studio.open('?symbology=code-128');
    const black = await labelPng();
    expect(share(black, '#991b1b'), 'default label should contain no red').toBeLessThan(0.001);

    await page.locator('.barcode-preset-chip[data-bar="#991b1b"]').click();
    await page.waitForTimeout(400);
    const red = await labelPng();
    expect(share(red, '#991b1b'), 'label barcode ignores the studio bar colour').toBeGreaterThan(0.02);
  });
});

/** All page content streams of a PDF, inflated (jsPDF compresses them with Flate). */
function pdfPageText(buf) {
  const out = [];
  const src = buf.toString('latin1');
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length;
    const end = src.indexOf('endstream', start);
    if (end < 0) break;
    try { out.push(zlib.inflateSync(buf.subarray(start, end)).toString('latin1')); } catch { /* not a Flate text stream */ }
  }
  return out.join('\n');
}

test.describe('EXP-AVL · Avery sheet with a different code per label (batch)', () => {
  /** Opens the batch window with a pasted list and the Avery PDF format. */
  async function averyBatch(page, lines, { caption = true, template = 'avery-5160' } = {}) {
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#tab-batch-csv').click();
    await page.locator('#batch-csv-input').fill(lines.join('\n'));
    await page.locator('#batch-format-select').selectOption('avery-pdf');
    await page.locator('#batch-avery-template').selectOption(template);
    await page.locator('#batch-avery-caption').evaluate((e, v) => { e.checked = v; }, caption);
  }
  /** Records the label images and caption texts jsPDF draws in the next PDF. */
  async function hookJsPdf(page) {
    await page.evaluate(() => {
      window.__pdfImages = [];
      window.__pdfTexts = [];
      const api = window.jspdf.jsPDF.API;
      if (api.__ucmListHook) return;
      const addImage = api.addImage;
      api.addImage = function (img, ...rest) { window.__pdfImages.push(typeof img === 'string' ? img : ''); return addImage.call(this, img, ...rest); };
      api.__ucmListHook = true;
    });
  }

  test('EXP-46 35 Code 128 values → 2 pages, each label scans to its own value, captions printed', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    const values = Array.from({ length: 35 }, (_, i) => `ASSET-${String(i + 1).padStart(4, '0')}`);
    // First run loads jsPDF; the second is the one we inspect.
    await averyBatch(page, values.slice(0, 2));
    await studio.download(page.locator('#btn-generate-batch'));
    await hookJsPdf(page);
    await averyBatch(page, values);
    const file = await studio.download(page.locator('#btn-generate-batch'));
    // The message shows for 3.2 s after the download starts: check it before the slow decoding below.
    await expect.poll(async () => (await studio.toastTexts()).join(' ')).toMatch(/35 labels on 2 sheets/);
    expect(file.filename).toMatch(/\.pdf$/);
    const info = pdfInfo(file.buffer);
    expect(info.isPdf && info.hasEof).toBe(true);
    expect(info.pageCount, 'Avery 5160 holds 30, so 35 values need 2 pages').toBe(2);
    const images = await page.evaluate(() => window.__pdfImages.filter((s) => s.startsWith('data:image/png')));
    expect(images.length).toBe(35);
    for (let i = 0; i < images.length; i++) {
      const text = await decodeFirst(Buffer.from(images[i].split(',')[1], 'base64'));
      expect(text, `label ${i + 1} should scan to its own value`).toBe(values[i]);
    }
    // Captions are PDF text: every value is drawn as "(VALUE) Tj" in the (compressed) page streams.
    const pageText = pdfPageText(file.buffer);
    for (const v of values) expect(pageText, `caption for ${v} missing`).toContain(`(${v}) Tj`);

    // Opposite case: captions switched off → no values printed as text.
    await averyBatch(page, values.slice(0, 2), { caption: false });
    const plain = await studio.download(page.locator('#btn-generate-batch'));
    expect(pdfPageText(plain.buffer)).not.toContain('(ASSET-0001) Tj');
  });

  test('EXP-47 invalid lines stop the sheet and are listed by line number (ZIP too)', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    const lines = ['5901234123457', 'ABC', '', '5901234123458', '590123412345'];
    for (const format of ['avery-pdf', 'png']) {
      await averyBatch(page, lines);
      await page.locator('#batch-format-select').selectOption(format);
      let downloaded = false;
      const onDownload = () => { downloaded = true; };
      page.on('download', onDownload);
      await page.locator('#btn-generate-batch').click();
      const box = page.locator('#batch-message-box');
      await expect(box).toBeVisible();
      await expect(box).toContainText('Nothing was made');
      await expect(box).toContainText('Line 2: "ABC"');
      await expect(box).toContainText('Line 4: "5901234123458"');
      await expect(box).not.toContainText('Line 5');
      await page.waitForTimeout(1500);
      page.off('download', onDownload);
      expect(downloaded, `${format}: nothing should download while lines are invalid`).toBe(false);
      await page.keyboard.press('Escape');
    }
  });

  test('EXP-48 more than 200 lines: the counter and the result say how many were left out', async ({ studio, page }) => {
    await studio.open('?symbology=code-39');
    const lines = Array.from({ length: 203 }, (_, i) => `C${i}`);
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#tab-batch-csv').click();
    await page.locator('#batch-csv-input').fill(lines.join('\n'));
    await expect(page.locator('#val-batch-csv-count')).toHaveText('200 items (3 left out: limit 200)');
    await page.locator('#batch-format-select').selectOption('svg');
    const file = await studio.download(page.locator('#btn-generate-batch'));
    const zip = await JSZip.loadAsync(file.buffer);
    expect(Object.values(zip.files).filter((f) => !f.dir).length).toBe(200);
    await expect.poll(async () => (await studio.toastTexts()).join(' ')).toMatch(/3 more lines were left out \(limit 200\)/);
  });

  test('EXP-49 QR values on an Avery sheet: each label scans to its own link', async ({ studio, page }) => {
    await studio.open();
    const values = ['https://qa.example.com/a', 'https://qa.example.com/b', 'https://qa.example.com/c'];
    await averyBatch(page, values.slice(0, 1));
    await studio.download(page.locator('#btn-generate-batch'));
    await hookJsPdf(page);
    await averyBatch(page, values, { template: 'avery-5163' });
    await studio.download(page.locator('#btn-generate-batch'));
    const images = await page.evaluate(() => window.__pdfImages.filter((s) => s.startsWith('data:image/png')));
    expect(images.length).toBe(3);
    for (let i = 0; i < images.length; i++) {
      expect(await decodeFirst(Buffer.from(images[i].split(',')[1], 'base64'))).toBe(values[i]);
    }
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

  // Amazon (US and India help, checked 2026-10-12): white space of 0.25" on the sides and 0.125" on the
  // top and bottom around the barcode and text and from the label edges. Short and two-line titles.
  for (const title of ['Organic Dark Roast Coffee', 'Organic Dark Roast Whole Bean Coffee, Single Origin Colombia, 16 oz Resealable Bag']) {
    test(`EXP-52 Amazon FNSKU label keeps Amazon's white space at the edges (title ${title.length} chars)`, async ({ studio, page }) => {
      await studio.open('?symbology=code-128&preset=amazon-fnsku-5160&label=1');
      await expect(page.locator('#label-maker-modal')).toHaveClass(/open/);
      await page.locator('#label-field-title').fill(title);
      await page.waitForTimeout(500);
      const png = await studio.download(page.locator('#btn-export-label-png'));
      const img = readPng(png.buffer);
      const ppi = img.width / 2.625;
      let minX = img.width, maxX = -1, minY = img.height, maxY = -1;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const i = (y * img.width + x) * 4;
          // Ink = clearly darker than paper (anti-aliased text edges count too).
          if (img.data[i + 3] > 128 && img.data[i] + img.data[i + 1] + img.data[i + 2] < 600) {
            minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
        }
      }
      const inches = (px) => (px / ppi).toFixed(3);
      expect(maxX, 'label has no ink').toBeGreaterThan(0);
      expect(minX, `left white space ${inches(minX)}" < 0.25"`).toBeGreaterThanOrEqual(Math.floor(0.25 * ppi));
      expect(img.width - 1 - maxX, `right white space ${inches(img.width - 1 - maxX)}" < 0.25"`).toBeGreaterThanOrEqual(Math.floor(0.25 * ppi));
      expect(minY, `top white space ${inches(minY)}" < 0.125"`).toBeGreaterThanOrEqual(Math.floor(0.125 * ppi));
      expect(img.height - 1 - maxY, `bottom white space ${inches(img.height - 1 - maxY)}" < 0.125"`).toBeGreaterThanOrEqual(Math.floor(0.125 * ppi));
      expect(await decodeFirst(png.buffer), 'FNSKU barcode does not scan').toMatch(/^X00[0-9A-Z]{7}$/);
    });
  }

  // Amazon counts a label that doesn't match the unit as "mislabeled": the FNSKU text and the bars must agree.
  test('EXP-53 Amazon label: typing an FNSKU changes the barcode itself', async ({ studio, page }) => {
    await studio.open('?symbology=code-128&preset=amazon-fnsku-5160&label=1');
    await expect(page.locator('#label-maker-modal')).toHaveClass(/open/);
    await page.locator('#label-field-sku').fill('X00ZQ4TEST');
    await expect(page.locator('#payload-input')).toHaveValue('X00ZQ4TEST');
    await page.waitForTimeout(800);
    const png = await studio.download(page.locator('#btn-export-label-png'));
    expect(await decodeFirst(png.buffer), 'label barcode ≠ the FNSKU typed in the label field').toBe('X00ZQ4TEST');
  });

  test('EXP-54 Amazon preset chosen in the label maker: FNSKU field shows the barcode value; product name starts empty', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await studio.setPayload('ABC-12345');
    await page.locator('#btn-open-label-modal').click();
    await page.selectOption('#label-preset-select', 'amazon-fnsku-5160');
    await expect(page.locator('#label-field-sku'), 'FNSKU field shows text the barcode does not encode').toHaveValue('ABC-12345');
    await expect(page.locator('#label-field-title'), 'product name pre-filled with the format name').toHaveValue('');
    await expect(page.locator('label[for="label-field-title"]')).toHaveText('Product name');
    await page.waitForTimeout(800);
    const png = await studio.download(page.locator('#btn-export-label-png'));
    expect(await decodeFirst(png.buffer)).toBe('ABC-12345');
    // Back to a general preset: the general captions return.
    await page.selectOption('#label-preset-select', 'retail-225-125');
    await expect(page.locator('label[for="label-field-sku"]')).toHaveText('SKU / Item Identifier');
  });
});

// PRINT SIZE — downloads carry the barcode's real size (js/core/print-size.js; research and
// sources in projects/universalcodemaker/20_features/print-size.md). Registry-driven: every
// barcode generator, using its declared module width (moduleMm, default 1 pt = 0.3528 mm).
test.describe('EXP-SIZE · real print size and quiet zones', () => {
  const POINT_MM = 25.4 / 72;
  const LINEAR = BARCODE_GENERATORS.filter((g) => g.category !== '2d');

  /** Narrowest bar and the tallest bar run (in px) along a row through the bars. */
  function measureBars(png) {
    const dark = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i + 3] > 128 && png.data[i] + png.data[i + 1] + png.data[i + 2] < 300; };
    const y = Math.round(png.height * 0.3);
    const bars = []; let x = 0;
    while (x < png.width) { const d = dark(x, y); const s = x; while (x < png.width && dark(x, y) === d) x++; if (d) bars.push({ start: s, len: x - s }); }
    const X = Math.min(...bars.map((b) => b.len));
    const heights = bars.map((b) => {
      const cx = b.start + Math.floor(b.len / 2);
      let run = 0, best = 0;
      for (let yy = 0; yy < png.height; yy++) { if (dark(cx, yy)) { run++; best = Math.max(best, run); } else run = 0; }
      return best;
    }).sort((a, b) => a - b);
    // Median = an ordinary bar (EAN/UPC guard bars are longer and a minority).
    return { X, typical: heights[Math.floor(heights.length / 2)], bars };
  }

  const defaultScale = (g) => g.controls.find((c) => c.id === 'scale')?.default || 3;

  for (const g of BARCODE_GENERATORS) {
    const moduleMm = g.moduleMm || POINT_MM;

    test(`EXP-SIZE-01 ${g.id}: PNG carries a DPI tag that prints it at real size`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      await page.selectOption('#scale-factor-select', '2');
      const file = await studio.download(page.locator('#btn-download-png'));
      const png = readPng(file.buffer); // pngjs checks every chunk CRC, including the new pHYs
      const dpi = pngDpi(file.buffer);
      expect(dpi, 'pHYs chunk').not.toBeNull();
      expect(Math.abs(dpi.x - dpi.y)).toBeLessThan(0.01);
      const scale = defaultScale(g) * 2; // default scale × 2x export
      expect(relDiff(dpi.x, (25.4 * scale) / moduleMm), 'DPI = 25.4 × scale ÷ module mm').toBeLessThan(0.002);
      if (g.category !== '2d') {
        const { X } = measureBars(png);
        expect(relDiff((X / dpi.x) * 25.4, moduleMm), `narrow bar ${(X / dpi.x * 25.4).toFixed(3)} mm`).toBeLessThan(0.03);
      }
    });

    test(`EXP-SIZE-02 ${g.id}: SVG has its real size in mm, and EPS matches it`, async ({ studio, page }) => {
      await studio.open(`?symbology=${g.id}`);
      const svg = (await studio.download(page.locator('#btn-download-svg'))).buffer.toString('utf8');
      const tag = svg.match(/<svg[^>]*>/)[0];
      const w = Number((tag.match(/\swidth="([\d.]+)mm"/) || [])[1]);
      const h = Number((tag.match(/\sheight="([\d.]+)mm"/) || [])[1]);
      expect(w > 0 && h > 0, `width/height in mm on <svg>: ${tag.slice(0, 160)}`).toBe(true);
      const vb = svgSize(svg);
      expect(relDiff(w / (vb.width / defaultScale(g)), moduleMm), 'mm per module').toBeLessThan(0.002);
      expect(relDiff(w / h, vb.width / vb.height), 'aspect ratio kept').toBeLessThan(0.002);
      const eps = (await studio.download(page.locator('#btn-download-eps'))).buffer.toString('latin1');
      const bb = eps.match(/%%BoundingBox:\s*(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)/).slice(1).map(Number);
      expect(Math.abs((bb[2] - bb[0]) * POINT_MM - w), `EPS width ${((bb[2] - bb[0]) * POINT_MM).toFixed(1)} mm vs SVG ${w} mm`).toBeLessThan(1);
    });

    test(`EXP-SIZE-03 ${g.id}: the studio readout shows this format's quiet zone`, async ({ studio, page }) => {
      expect(g.quietZone, 'generator declares quietZone').toBeTruthy();
      await studio.open(`?symbology=${g.id}`);
      await expect(page.locator('#spec-quiet-zone')).toHaveText(g.quietZone);
    });
  }

  for (const g of LINEAR) {
    const moduleMm = g.moduleMm || POINT_MM;
    test(`EXP-SIZE-04 ${g.id}: bars print as tall as the Bar Height setting says`, async ({ studio, page }) => {
      const heightControl = g.controls.find((c) => c.id === 'height');
      test.skip(!heightControl, 'no bar height control');
      await studio.open(`?symbology=${g.id}`);
      await page.selectOption('#scale-factor-select', '2');
      const file = await studio.download(page.locator('#btn-download-png'));
      const png = readPng(file.buffer);
      const dpi = pngDpi(file.buffer).x;
      const { X, typical } = measureBars(png);
      // ITF-14's bearer bars touch the bars top and bottom (bwip-js border 4 modules each side).
      const bearer = g.id === 'itf-14' ? 2 * 4 * X : 0;
      const mm = ((typical - bearer) / dpi) * 25.4;
      expect(Math.abs(mm - heightControl.default), `measured ${mm.toFixed(2)} mm for a ${heightControl.default} mm setting (module ${moduleMm} mm)`).toBeLessThan(0.6);
    });
  }

  test('EXP-SIZE-05 label maker PNG is tagged 300 DPI, so it prints at label size', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    await page.waitForTimeout(800);
    const file = await studio.download(page.locator('#btn-export-label-png'));
    readPng(file.buffer);
    expect(Math.round(pngDpi(file.buffer).x)).toBe(300);
  });

  test('EXP-SIZE-06 quiet zones actually drawn meet each linear format\'s minimum', async ({ studio, page }) => {
    const minimum = { 'ean-13': [11, 7], isbn: [11, 7], 'upc-a': [9, 9], 'code-128': [10, 10], 'code-39': [10, 10] };
    for (const [id, [left, right]] of Object.entries(minimum)) {
      await studio.open(`?symbology=${id}`);
      const png = readPng((await studio.download(page.locator('#btn-download-png'))).buffer);
      const { X, bars } = measureBars(png);
      const lq = bars[0].start / X, rq = (png.width - (bars.at(-1).start + bars.at(-1).len)) / X;
      expect(lq, `${id} left quiet zone`).toBeGreaterThanOrEqual(left - 0.01);
      expect(rq, `${id} right quiet zone`).toBeGreaterThanOrEqual(right - 0.01);
    }
  });
});

// GS1 TEXT LAYOUT AND GUARD BARS — GS1 General Specifications R26.0: guard bars extend 5X below the
// other bars (also UPC-A's first and last characters); EAN-13's leading digit sits left of the start
// guard (5.2.5). bwip-js's own EAN/UPC layout does this; a centred text string did not
// (projects/universalcodemaker/20_features/guard-bars.md).
test.describe('EXP-GUARD · GS1 guard bars and digit layout', () => {
  const EAN_UPC = ['ean-13', 'upc-a', 'isbn'];

  function profile(png) {
    const dark = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i + 3] > 128 && png.data[i] + png.data[i + 1] + png.data[i + 2] < 300; };
    const y0 = Math.round(png.height * 0.3);
    const bars = []; let x = 0;
    while (x < png.width) { const d = dark(x, y0); const s = x; while (x < png.width && dark(x, y0) === d) x++; if (d) bars.push({ s, e: x }); }
    const X = Math.min(...bars.map((b) => b.e - b.s));
    const span = bars.map((b) => {
      const cx = b.s + Math.floor((b.e - b.s) / 2);
      let top = y0, bot = y0;
      while (top > 0 && dark(cx, top - 1)) top--;
      while (bot < png.height - 1 && dark(cx, bot + 1)) bot++;
      return { top, bot };
    });
    const bottoms = span.map((r) => r.bot).sort((a, b) => a - b);
    const normalBottom = bottoms[Math.floor(bottoms.length / 2)];
    const guards = span.filter((r) => r.bot > normalBottom + X);
    // GS1 layout: digits sit level with the guard extensions (between the ordinary bars' bottom and
    // the guards' bottom). A centred string sits wholly below the guards instead.
    const guardBottom = Math.max(...span.map((r) => r.bot));
    const inGuard = (xx) => bars.some((b, i) => span[i].bot > normalBottom + X && xx >= b.s - 1 && xx <= b.e);
    let besideGuards = 0, leftInk = 0, rightInk = 0, underStartGuard = 0;
    for (let y = normalBottom + 2; y <= guardBottom; y++) {
      for (let xx = 0; xx < png.width; xx++) {
        if (!dark(xx, y) || inGuard(xx)) continue;
        besideGuards++;
        if (xx < bars[0].s - 1) leftInk++;
        if (xx > bars.at(-1).e + 1) rightInk++;
        // Between the start guard's two bars: empty in GS1's layout, crossed by a centred string.
        if (xx >= bars[0].s && xx <= bars[1].e) underStartGuard++;
      }
    }
    // Gap (in X) between the leading digit and the start guard, in the digit row: GS1's layout
    // leaves clear space; a centred string runs into the guard.
    let nearest = -1;
    for (let y = normalBottom + 2; y <= guardBottom; y++) {
      for (let xx = bars[0].s - 1; xx >= 0; xx--) if (dark(xx, y)) { nearest = Math.max(nearest, xx); break; }
    }
    const leadingGap = nearest < 0 ? Infinity : (bars[0].s - 1 - nearest) / X;
    return { X, normalBottom, guards, besideGuards, leftInk, rightInk, underStartGuard, leadingGap };
  }

  for (const id of EAN_UPC) {
    test(`EXP-GUARD-01 ${id}: guard bars extend 5X below the other bars`, async ({ studio, page }) => {
      await studio.open(`?symbology=${id}`);
      await page.selectOption('#scale-factor-select', '4');
      const png = readPng((await studio.download(page.locator('#btn-download-png'))).buffer);
      const { X, normalBottom, guards } = profile(png);
      expect(guards.length, 'extended bars found').toBeGreaterThanOrEqual(6);
      for (const g of guards) {
        const ext = (g.bot - normalBottom) / X;
        expect(Math.abs(ext - 5), `guard extension ${ext.toFixed(2)}X`).toBeLessThan(0.6);
      }
      if (id === 'upc-a') expect(guards.length, 'UPC-A: guards + first/last character bars').toBeGreaterThan(6);
    });

    test(`EXP-GUARD-02 ${id}: the leading digit is printed left of the bars`, async ({ studio, page }) => {
      await studio.open(`?symbology=${id}`);
      await page.selectOption('#scale-factor-select', '4');
      const png = readPng((await studio.download(page.locator('#btn-download-png'))).buffer);
      const { leftInk, rightInk, leadingGap } = profile(png);
      expect(leftInk, 'digit left of the start guard').toBeGreaterThan(50);
      expect(leadingGap, `gap between the leading digit and the start guard: ${leadingGap.toFixed(2)}X (GS1 R26 5.2.5)`).toBeGreaterThan(1);
      if (id === 'upc-a') expect(rightInk, 'UPC-A check digit right of the end guard').toBeGreaterThan(50);
    });
  }
});
