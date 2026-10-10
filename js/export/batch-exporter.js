/**
 * Client-Side Batch Code Generator & ZIP Exporter
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Generates sequences or imported CSV/text lists of barcodes/QRs
 * directly in browser memory and bundles them into a ZIP download.
 * Zero server communication, zero data leakage.
 */

import { engine } from '../core/engine.js?v=3.19';
import { loadJsZip } from '../core/dynamic-loader.js?v=3.19';
import { downloadBlob, applySvgCornerRadius } from './image-exporter.js?v=3.19';

/**
 * Generates an array of sequenced alphanumeric string payloads
 * @param {object} params
 * @param {string} [params.prefix='']
 * @param {number} [params.start=1]
 * @param {number} [params.count=10]
 * @param {number} [params.padLength=3] - e.g. 3 -> '001', '002'
 * @param {string} [params.suffix='']
 * @returns {string[]}
 */
export function generateSequenceList({
  prefix = '',
  start = 1,
  count = 10,
  padLength = 3,
  suffix = ''
} = {}) {
  const safeStart = Math.max(0, parseInt(start, 10) || 1);
  const safeCount = Math.min(200, Math.max(1, parseInt(count, 10) || 10));
  const safePad = Math.max(0, Math.min(10, parseInt(padLength, 10) || 0));

  const items = [];
  for (let i = 0; i < safeCount; i++) {
    const num = safeStart + i;
    const numStr = safePad > 0 ? String(num).padStart(safePad, '0') : String(num);
    items.push(`${prefix}${numStr}${suffix}`);
  }
  return items;
}

/**
 * Parses multi-line or CSV text into an array of clean string payloads
 * @param {string} rawText
 * @returns {string[]}
 */
/** Most values one batch (ZIP or Avery sheet) takes, for browser stability (~7 sheets of Avery 5160). */
export const BATCH_LIMIT = 200;

/**
 * Parses pasted lines or CSV (first column) into values with their original line numbers,
 * so errors can point at the line the user typed. Blank lines are skipped.
 * @param {string} rawText
 * @param {number} [limit]
 * @returns {{ entries: { value: string, line: number }[], leftOut: number }}
 */
export function parseCsvOrLinesDetailed(rawText, limit = BATCH_LIMIT) {
  if (!rawText || typeof rawText !== 'string') return { entries: [], leftOut: 0 };

  const entries = [];
  rawText.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    // If CSV format (comma separated), pick the first column
    const val = line.includes(',') ? line.split(',')[0].trim().replace(/^["']|["']$/g, '') : line;
    if (val.length > 0) entries.push({ value: val, line: i + 1 });
  });

  return { entries: entries.slice(0, limit), leftOut: Math.max(0, entries.length - limit) };
}

/**
 * Parses multi-line or CSV text into an array of clean string payloads (first BATCH_LIMIT values).
 * @param {string} rawText
 * @returns {string[]}
 */
export function parseCsvOrLines(rawText) {
  return parseCsvOrLinesDetailed(rawText).entries.map((e) => e.value);
}

/**
 * Checks every value with the format's own rules (pattern and check digit) before anything is made.
 * @param {object} generator
 * @param {{ value: string, line: number }[]} entries
 * @returns {{ line: number, value: string, error: string }[]} the invalid ones (empty = all valid)
 */
export function findInvalidBatchItems(generator, entries) {
  const invalid = [];
  for (const { value, line } of entries) {
    const { valid, error } = engine.validate(generator, value);
    if (!valid) invalid.push({ line, value, error });
  }
  return invalid;
}

/**
 * Sanitizes a payload to create a safe, clean filename inside ZIP
 * @param {string} payload
 * @param {number} index
 * @param {string} ext
 * @returns {string}
 */
export function sanitizeZipFilename(payload, index, ext) {
  const indexPrefix = String(index + 1).padStart(3, '0');
  const safePayload = payload
    .replace(/^https?:\/\//i, '')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .slice(0, 30);
  return `${indexPrefix}_${safePayload}.${ext}`;
}

/**
 * Generates an in-memory ZIP containing all rendered code files
 * @param {object} params
 * @param {object} params.generator - Selected generator plugin
 * @param {string[]} params.items - Array of payload strings to encode
 * @param {'png'|'svg'} [params.format='png']
 * @param {number} [params.scaleFactor=2]
 * @param {object} [params.options={}]
 * @param {string} [params.logoDataUrl='']
 * @param {function} [params.onProgress] - Callback ({ current, total, percent, currentItem })
 * @returns {Promise<{ success: boolean, count: number, zipBlob: Blob, filename: string }>}
 */
export async function generateBatchZip({
  generator,
  items,
  format = 'png',
  scaleFactor = 2,
  options = {},
  logoDataUrl = '',
  onProgress = null
}) {
  if (!generator) throw new Error('A valid generator is required for batch export.');
  if (!items || !items.length) throw new Error('No items provided for batch generation.');

  const JSZip = await loadJsZip();
  const zip = new JSZip();
  const total = items.length;

  const offscreenCanvas = format === 'png' && generator.id !== 'qr-code'
    ? document.createElement('canvas')
    : null;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const filename = sanitizeZipFilename(item, i, format);

    if (format === 'svg') {
      if (generator.id === 'qr-code') {
        // Same settings, quiet zone and corners as the preview (shared builder in engine.js).
        const svgText = await engine.renderStyledQr(options, { data: item, image: logoDataUrl, scale: scaleFactor, format: 'svg' });
        zip.file(filename, svgText);
      } else {
        // Same generator render path as the preview (format, checksum, colours, padding).
        let svgString = await engine.renderSVG(generator, item, { ...options, scale: (Number(options.scale) || 3) * scaleFactor, cornerRadius: (Number(options.cornerRadius) || 0) * scaleFactor });
        if (Number(options.cornerRadius) > 0) svgString = applySvgCornerRadius(svgString, Number(options.cornerRadius) * scaleFactor);
        zip.file(filename, svgString);
      }
    } else {
      // PNG Format
      if (generator.id === 'qr-code') {
        const pngBlob = await engine.renderStyledQr(options, { data: item, image: logoDataUrl, scale: scaleFactor });
        zip.file(filename, pngBlob);
      } else {
        // Same generator render path as the preview (format, checksum, colours, padding, corners).
        await engine.render(generator, item, { ...options, scale: (Number(options.scale) || 3) * scaleFactor, cornerRadius: (Number(options.cornerRadius) || 0) * scaleFactor }, { canvas: offscreenCanvas });
        const dataUrl = offscreenCanvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
      }
    }

    if (onProgress) {
      const current = i + 1;
      const percent = Math.round((current / total) * 100);
      onProgress({ current, total, percent, currentItem: item });
    }

    // Yield periodically to maintain UI responsiveness
    if (i % 2 === 0) {
      await new Promise(resolve => setTimeout(resolve, 8));
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const zipFilename = `batch-${generator.id}-${total}-codes-${Date.now()}.zip`;
  downloadBlob(zipBlob, zipFilename);

  return {
    success: true,
    count: total,
    zipBlob,
    filename: zipFilename
  };
}
