/**
 * Client-Side Batch Code Generator & ZIP Exporter
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Generates sequences or imported CSV/text lists of barcodes/QRs
 * directly in browser memory and bundles them into a ZIP download.
 * Zero server communication, zero data leakage.
 */

import { engine, toQrByteString } from '../core/engine.js?v=2.8';
import { loadQRCodeStyling, loadJsZip } from '../core/dynamic-loader.js?v=2.8';
import { downloadBlob } from './image-exporter.js?v=2.8';
import { computeEan13, computeUpcA } from '../core/checksums.js?v=2.8';

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
export function parseCsvOrLines(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/);
  const results = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // If CSV format (comma separated), pick first column unless it's a quoted cell
    let val = line;
    if (line.includes(',')) {
      const parts = line.split(',');
      val = parts[0].trim().replace(/^["']|["']$/g, '');
    }

    if (val.length > 0) {
      results.push(val);
    }
  }

  // Cap at 200 items for browser stability
  return results.slice(0, 200);
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

  let QRCodeStyling = null;
  if (generator.id === 'qr-code') {
    QRCodeStyling = await loadQRCodeStyling();
  }

  const offscreenCanvas = format === 'png' && generator.id !== 'qr-code'
    ? document.createElement('canvas')
    : null;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const filename = sanitizeZipFilename(item, i, format);

    if (format === 'svg') {
      if (generator.id === 'qr-code') {
        const qrSvgInstance = new QRCodeStyling({
          width: 320 * scaleFactor,
          height: 320 * scaleFactor,
          type: 'svg',
          data: toQrByteString(item),
          image: logoDataUrl || '',
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: options.imageSize || 0.28,
            margin: options.imageMargin !== undefined ? options.imageMargin : 4,
            crossOrigin: 'anonymous'
          },
          dotsOptions: {
            type: options.dotsType || 'rounded',
            color: options.dotsColor || '#0f172a'
          },
          cornersSquareOptions: {
            color: options.cornerColor || '#0f172a',
            type: options.cornerType || 'extra-rounded'
          },
          cornersDotOptions: {
            color: options.cornerDotColor || options.cornerColor || '#06b6d4',
            type: options.cornerDotType || 'dot'
          },
          backgroundOptions: {
            color: options.transparentBg ? 'transparent' : (options.backgroundColor || '#ffffff')
          },
          qrOptions: {
            errorCorrectionLevel: logoDataUrl ? 'H' : (options.errorCorrectionLevel || 'M')
          }
        });
        const svgBlob = await qrSvgInstance.getRawData('svg');
        const svgText = await svgBlob.text();
        zip.file(filename, svgText);
      } else {
        const bwipBcid = generator.id === 'data-matrix' ? 'datamatrix' :
                         generator.id === 'aztec' ? 'azteccode' :
                         generator.id === 'pdf417' ? 'pdf417' :
                         generator.id === 'ean-13' ? 'ean13' :
                         generator.id === 'upc-a' ? 'upca' :
                         generator.id === 'itf-14' ? 'itf14' : 'code128';

        let itemPayload = item;
        if (generator.id === 'upc-a' && item.length === 11) {
          itemPayload = computeUpcA(item);
        } else if (generator.id === 'ean-13' && item.length === 12) {
          itemPayload = computeEan13(item);
        }

        const is2DCode = ['data-matrix', 'aztec', 'pdf417'].includes(generator.id);
        const svgOpts = {
          bcid: bwipBcid,
          text: itemPayload,
          scale: (Number(options.scale) || 3) * scaleFactor,
          includetext: options.includetext !== false,
          textxalign: 'center',
          guardwhitespace: ['ean-13', 'upc-a'].includes(generator.id),
          backgroundcolor: options.transparentBg ? undefined : 'FFFFFF'
        };
        if (!is2DCode && options.height) {
          svgOpts.height = Number(options.height);
        }
        if (generator.id === 'pdf417' && Number(options.columns) > 0) {
          svgOpts.columns = Number(options.columns);
        }

        const svgString = await engine.renderBwipSVG(svgOpts);
        zip.file(filename, svgString);
      }
    } else {
      // PNG Format
      if (generator.id === 'qr-code') {
        const qrPngInstance = new QRCodeStyling({
          width: 320 * scaleFactor,
          height: 320 * scaleFactor,
          type: 'canvas',
          data: toQrByteString(item),
          image: logoDataUrl || '',
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: options.imageSize || 0.28,
            margin: (options.imageMargin !== undefined ? options.imageMargin : 4) * scaleFactor,
            crossOrigin: 'anonymous'
          },
          dotsOptions: {
            type: options.dotsType || 'rounded',
            color: options.dotsColor || '#0f172a'
          },
          cornersSquareOptions: {
            color: options.cornerColor || '#0f172a',
            type: options.cornerType || 'extra-rounded'
          },
          cornersDotOptions: {
            color: options.cornerDotColor || options.cornerColor || '#06b6d4',
            type: options.cornerDotType || 'dot'
          },
          backgroundOptions: {
            color: options.transparentBg ? 'transparent' : (options.backgroundColor || '#ffffff')
          },
          qrOptions: {
            errorCorrectionLevel: logoDataUrl ? 'H' : (options.errorCorrectionLevel || 'M')
          }
        });
        const pngBlob = await qrPngInstance.getRawData('png');
        zip.file(filename, pngBlob);
      } else {
        const bwipBcid = generator.id === 'data-matrix' ? 'datamatrix' :
                         generator.id === 'aztec' ? 'azteccode' :
                         generator.id === 'pdf417' ? 'pdf417' :
                         generator.id === 'ean-13' ? 'ean13' :
                         generator.id === 'upc-a' ? 'upca' :
                         generator.id === 'itf-14' ? 'itf14' : 'code128';

        let itemPayload = item;
        if (generator.id === 'upc-a' && item.length === 11) {
          itemPayload = computeUpcA(item);
        } else if (generator.id === 'ean-13' && item.length === 12) {
          itemPayload = computeEan13(item);
        }

        const scaledOpts = {
          bcid: bwipBcid,
          text: itemPayload,
          scale: (Number(options.scale) || 3) * scaleFactor,
          includetext: options.includetext !== false,
          textxalign: 'center',
          guardwhitespace: ['ean-13', 'upc-a'].includes(generator.id),
          backgroundcolor: options.transparentBg ? undefined : 'FFFFFF'
        };
        const is2DCode = ['data-matrix', 'aztec', 'pdf417'].includes(generator.id);
        if (!is2DCode && options.height) {
          scaledOpts.height = Number(options.height);
        }
        if (generator.id === 'pdf417' && Number(options.columns) > 0) {
          scaledOpts.columns = Number(options.columns);
        }

        await engine.renderBwipCanvas(offscreenCanvas, scaledOpts);
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
