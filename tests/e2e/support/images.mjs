// Image helpers for exported files (PNG pixels, SVG geometry, PDF structure).

import { PNG } from 'pngjs';

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function isPng(buf) {
  return Buffer.isBuffer(buf) && buf.subarray(0, 8).equals(PNG_SIGNATURE);
}

export function readPng(buf) {
  return PNG.sync.read(buf);
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * Summarise a decoded PNG: the most common opaque colour (background), the most common
 * colour that clearly differs from it (ink), and how many pixels are fully transparent.
 */
export function colorStats(png) {
  const counts = new Map();
  let transparent = 0;
  const { data } = png;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      transparent++;
      continue;
    }
    if (data[i + 3] < 250) continue; // skip anti-aliased edges
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const toRgb = (k) => ({ r: (k >> 16) & 255, g: (k >> 8) & 255, b: k & 255 });
  const background = sorted.length ? toRgb(sorted[0][0]) : null;
  const inkEntry = sorted.find(([k]) => background && colorDistance(toRgb(k), background) > 60);
  return {
    background,
    ink: inkEntry ? toRgb(inkEntry[0]) : null,
    transparentRatio: transparent / (png.width * png.height),
  };
}

/** Alpha of a single pixel (x, y). */
export function alphaAt(png, x, y) {
  return png.data[(png.width * y + x) * 4 + 3];
}

/** Width/height of an SVG document from its viewBox (falls back to width/height attributes). */
export function svgSize(svgText) {
  const vb = svgText.match(/viewBox\s*=\s*"([\d.\-\s,]+)"/i);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return { width: w, height: h };
  }
  const w = svgText.match(/<svg[^>]*\swidth\s*=\s*"([\d.]+)/i);
  const h = svgText.match(/<svg[^>]*\sheight\s*=\s*"([\d.]+)/i);
  return w && h ? { width: Number(w[1]), height: Number(h[1]) } : null;
}

/** Very small PDF sanity parser: header, EOF marker and page count. */
export function pdfInfo(buf) {
  const text = buf.toString('latin1');
  return {
    isPdf: text.startsWith('%PDF-'),
    hasEof: /%%EOF\s*$/.test(text),
    pageCount: (text.match(/\/Type\s*\/Page(?!s)\b/g) || []).length,
    imageCount: (text.match(/\/Subtype\s*\/Image\b/g) || []).length,
  };
}

export function aspect(w, h) {
  return w / h;
}

/** Relative difference between two numbers (0.02 = 2 %). */
export function relDiff(a, b) {
  return Math.abs(a - b) / Math.max(Math.abs(b), 1e-9);
}
