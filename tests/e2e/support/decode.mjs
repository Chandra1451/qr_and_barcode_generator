// Reference barcode decoder (ZXing C++ compiled to WebAssembly, run in Node).
// Used to prove that what the site draws or exports scans back to the exact payload.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import * as zxing from 'zxing-wasm/reader';
import { PNG } from 'pngjs';

const require = createRequire(import.meta.url);
let prepared = null;

async function prepare() {
  if (!prepared) {
    prepared = (async () => {
      // Load the .wasm from node_modules instead of a CDN (works offline, pinned version).
      try {
        const wasmPath = require.resolve('zxing-wasm/reader/zxing_reader.wasm');
        const wasmBinary = fs.readFileSync(wasmPath);
        if (typeof zxing.prepareZXingModule === 'function') {
          await zxing.prepareZXingModule({ overrides: { wasmBinary }, fireImmediately: true });
        } else if (typeof zxing.setZXingModuleOverrides === 'function') {
          zxing.setZXingModuleOverrides({ wasmBinary });
        }
      } catch {
        // Fall back to the library's default loading.
      }
    })();
  }
  return prepared;
}

const readFn = zxing.readBarcodes || zxing.readBarcodesFromImageFile;

async function readOnce(pngBytes) {
  const blob = new Blob([pngBytes], { type: 'image/png' });
  const results = await readFn(blob, { tryHarder: true, tryRotate: true, tryInvert: true, maxNumberOfSymbols: 4 });
  return results
    .filter((r) => r.isValid !== false && typeof r.text === 'string')
    .map((r) => ({ text: r.text, format: r.format }));
}

/** Threshold to pure black/white (keeps geometry; like a scanner's binarisation). */
function binarize(png) {
  const out = new PNG({ width: png.width, height: png.height });
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3] / 255;
    const lum = (0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2]) * a + 255 * (1 - a);
    const v = lum < 128 ? 0 : 255;
    out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
    out.data[i + 3] = 255;
  }
  return out;
}

function upscale(png, f) {
  const out = new PNG({ width: png.width * f, height: png.height * f });
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const si = (Math.floor(y / f) * png.width + Math.floor(x / f)) * 4;
      png.data.copy(out.data, (y * out.width + x) * 4, si, si + 4);
    }
  }
  return out;
}

/**
 * Decode every barcode in a PNG buffer.
 * ZXing 2.2.x misses some pixel-perfect Data Matrix/Aztec symbols drawn in a non-black
 * ink at certain module sizes (camera images never look like that). So when the first
 * read finds nothing, retry with a thresholded copy and a 2x upscale. Geometry and
 * content are unchanged, so a genuinely broken code still fails.
 * @param {Buffer|Uint8Array} imageBytes
 * @returns {Promise<Array<{text: string, format: string}>>}
 */
export async function decodeImage(imageBytes) {
  await prepare();
  let found = await readOnce(imageBytes);
  if (found.length) return found;
  let png;
  try {
    png = PNG.sync.read(Buffer.from(imageBytes));
  } catch {
    return found;
  }
  const bw = binarize(png);
  found = await readOnce(PNG.sync.write(bw));
  if (found.length) return found;
  if (bw.width * bw.height <= 4_000_000) found = await readOnce(PNG.sync.write(upscale(bw, 2)));
  return found;
}

/** Decode and return the first symbol's text, or null if nothing was found. */
export async function decodeFirst(imageBytes) {
  const all = await decodeImage(imageBytes);
  return all.length ? all[0].text : null;
}
