/**
 * High-Resolution Raster & Vector Image Exporter
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Supports:
 * - High-DPI PNG exports (1x Standard, 2x Retina, 4x Ultra 300+ DPI print-ready)
 * - Infinite-resolution vector SVG downloads for all 1D and 2D barcode standards
 * - Direct 1-click clipboard copy
 */

import { engine, applyCanvasCornerRadius, svgWithRoundedCorners } from '../core/engine.js?v=3.17';
import { svgToEps } from './eps-exporter.js?v=3.17';

/**
 * Injects a rounded clipPath into an SVG XML string to export lossless rounded corners
 * @param {string} svgString
 * @param {number} radius
 * @returns {string}
 */
export function applySvgCornerRadius(svgString, radius) {
  return svgWithRoundedCorners(svgString, radius);
}

/**
 * Initiates browser file download from a Blob
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Initiates browser file download from a Data URL
 */
export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports high-resolution PNG image at specified scale factor
 * @param {object} params
 * @param {object} params.generator - Symbology generator plugin
 * @param {string} params.payload - Code payload string
 * @param {object} params.options - Generator configuration options
 * @param {number} params.scaleFactor - Scale multiplier (1, 2, or 4)
 * @param {string} [params.logoDataUrl] - Active center logo data URL
 */
export async function exportHighResPng({ generator, payload, options, scaleFactor = 1, logoDataUrl = '' }) {
  if (!generator || !payload) {
    throw new Error('Generator and payload are required for export.');
  }

  const filename = `${generator.id}-${scaleFactor}x-${Date.now()}.png`;
  const cornerRadius = Number(options.cornerRadius) || 0;

  if (generator.id === 'qr-code') {
    // Same settings, quiet zone and corners as the preview, scaled (shared builder in engine.js).
    const blob = await engine.renderStyledQr(options, { data: payload, image: logoDataUrl, scale: scaleFactor });
    downloadBlob(blob, filename);
    return { success: true, filename };
  }

  // bwip-js barcodes
  const offscreenCanvas = document.createElement('canvas');
  const baseScale = Number(options.scale) || 3;
  const is2DCode = ['data-matrix', 'aztec', 'pdf417'].includes(generator.id);

  // In bwip-js, 'scale' scales both width and height uniformly (e.g. 2x, 4x DPI).
  // The 'height' option specifies the physical bar height in mm, which bwip-js ALREADY multiplies by scale.
  // Therefore, 'height' must NOT be multiplied by scaleFactor, otherwise height is scaled by scaleFactor^2!
  // The radius scales with the image, so the corner looks the same as the preview at any size.
  const scaledOptions = {
    ...options,
    scale: baseScale * scaleFactor,
    cornerRadius: cornerRadius * scaleFactor
  };
  if (!is2DCode && options.height !== undefined) {
    scaledOptions.height = Number(options.height);
  }

  // Errors (e.g. invalid input) propagate to the caller so no file is downloaded.
  // (A former fallback here downloaded a blank or Code 128 image instead.)
  // (engine.render rounds the corners and sizes the quiet zone for them.)
  await engine.render(generator, payload, scaledOptions, { canvas: offscreenCanvas });

  const dataUrl = offscreenCanvas.toDataURL('image/png');
  downloadDataUrl(dataUrl, filename);
  return { success: true, filename };
}

/**
 * Exports crisp vector SVG
 * @param {object} params
 */
export async function exportVectorSvg({ generator, payload, options, logoDataUrl = '' }) {
  if (!generator || !payload) {
    throw new Error('Generator and payload are required for SVG export.');
  }

  const filename = `${generator.id}-${Date.now()}.svg`;
  const cornerRadius = Number(options.cornerRadius) || 0;

  if (generator.id === 'qr-code') {
    if (engine.currentQrInstance) {
      const blob = await engine.currentQrInstance.getRawData('svg');
      if (cornerRadius > 0) {
        const rawSvg = await blob.text();
        const roundedSvg = applySvgCornerRadius(rawSvg, cornerRadius);
        const roundedBlob = new Blob([roundedSvg], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(roundedBlob, filename);
        return { success: true, filename };
      }
      downloadBlob(blob, filename);
      return { success: true, filename };
    }
  }

  // Same generator render path as the preview (format, checksum, text, height, columns,
  // colours, padding), so the SVG always matches what the user sees.
  let svgString = await engine.renderSVG(generator, payload, options);
  if (cornerRadius > 0) {
    svgString = applySvgCornerRadius(svgString, cornerRadius);
  }
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
  return { success: true, filename };
}

/**
 * Exports vector EPS (barcodes only; QR codes keep their styled SVG)
 * @param {object} params
 */
export async function exportVectorEps({ generator, payload, options }) {
  if (!generator || !payload) {
    throw new Error('Generator and payload are required for EPS export.');
  }
  // Same render path as the SVG download, so the EPS matches the SVG shape for shape.
  const { svg, scale } = await engine.renderVector(generator, payload, options);
  const eps = svgToEps(svg, {
    ptPerUnit: 1 / scale,
    cornerRadius: Number(options.cornerRadius) || 0,
    title: `${generator.name} ${payload}`
  });
  const filename = `${generator.id}-${Date.now()}.eps`;
  downloadBlob(new Blob([eps], { type: 'application/postscript' }), filename);
  return { success: true, filename };
}

/**
 * Copies barcode or QR code image directly to system clipboard
 */
export async function copyImageToClipboard({ generator, previewCanvas, qrStyledContainer, cornerRadius = 0 }) {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Direct clipboard write API is not supported in this browser environment.');
  }

  let blob = null;

  if (generator.id === 'qr-code') {
    const qrCanvas = qrStyledContainer?.querySelector('canvas');
    if (qrCanvas) {
      blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
    } else if (engine.currentQrInstance) {
      blob = await engine.currentQrInstance.getRawData('png');
    }
  } else if (previewCanvas) {
    blob = await new Promise(resolve => previewCanvas.toBlob(resolve, 'image/png'));
  }

  if (!blob) {
    throw new Error('Could not acquire barcode image raster blob for clipboard.');
  }

  if (cornerRadius > 0) {
    try {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      URL.revokeObjectURL(url);
      if (img.width > 0) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        applyCanvasCornerRadius(c, cornerRadius);
        blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
      }
    } catch (e) {
      // fallback to original blob
    }
  }

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);

  return { success: true };
}
