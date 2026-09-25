/**
 * High-Resolution Raster & Vector Image Exporter
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Supports:
 * - High-DPI PNG exports (1x Standard, 2x Retina, 4x Ultra 300+ DPI print-ready)
 * - Infinite-resolution vector SVG downloads for all 1D and 2D barcode standards
 * - Direct 1-click clipboard copy
 */

import { engine, applyCanvasCornerRadius, toQrByteString } from '../core/engine.js?v=2.8';
import { loadQRCodeStyling } from '../core/dynamic-loader.js?v=2.8';
import { computeEan13, computeUpcA } from '../core/checksums.js?v=2.8';

/**
 * Injects a rounded clipPath into an SVG XML string to export lossless rounded corners
 * @param {string} svgString
 * @param {number} radius
 * @returns {string}
 */
export function applySvgCornerRadius(svgString, radius) {
  if (!radius || radius <= 0 || !svgString) return svgString;

  const vbMatch = svgString.match(/viewBox=["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s*["']/i);
  let x = 0, y = 0, width = 0, height = 0;

  if (vbMatch) {
    x = parseFloat(vbMatch[1]);
    y = parseFloat(vbMatch[2]);
    width = parseFloat(vbMatch[3]);
    height = parseFloat(vbMatch[4]);
  } else {
    const wMatch = svgString.match(/width=["']([0-9.]+)["']/i);
    const hMatch = svgString.match(/height=["']([0-9.]+)["']/i);
    if (wMatch && hMatch) {
      width = parseFloat(wMatch[1]);
      height = parseFloat(hMatch[1]);
    }
  }

  if (!width || !height) return svgString;

  const r = Math.min(radius, width / 2, height / 2);
  const clipId = `ucm-rounded-corners-${Date.now().toString(36)}`;
  const clipDef = `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" ry="${r}" /></clipPath></defs>`;

  const svgOpenTagEnd = svgString.indexOf('>');
  if (svgOpenTagEnd === -1) return svgString;

  const openTag = svgString.slice(0, svgOpenTagEnd + 1);
  const closingTagIndex = svgString.lastIndexOf('</svg>');
  if (closingTagIndex === -1) return svgString;

  const innerContent = svgString.slice(svgOpenTagEnd + 1, closingTagIndex);
  return `${openTag}\n${clipDef}\n<g clip-path="url(#${clipId})">\n${innerContent}\n</g>\n</svg>`;
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
    const QRCodeStyling = await loadQRCodeStyling();
    const baseSize = 320;
    const exportSize = baseSize * scaleFactor;

    const hasLogo = Boolean(logoDataUrl && logoDataUrl.trim().length > 0);
    const dotsOptions = {
      type: options.dotsType || 'rounded',
      color: options.dotsColor || '#0f172a'
    };

    if (options.gradientEnabled) {
      const rotationRad = ((Number(options.gradientRotation) || 45) * Math.PI) / 180;
      dotsOptions.gradient = {
        type: options.gradientType || 'linear',
        rotation: rotationRad,
        colorStops: [
          { offset: 0, color: options.gradientColor1 || '#06b6d4' },
          { offset: 1, color: options.gradientColor2 || '#3b82f6' }
        ]
      };
    }

    const bgColor = options.transparentBg ? 'transparent' : (options.backgroundColor || '#ffffff');
    const basePadding = options.padding !== undefined ? Number(options.padding) : (options.margin !== undefined ? Number(options.margin) : 10);
    const minSafeMargin = cornerRadius > 0 ? Math.ceil(cornerRadius * 0.4) : 0;
    const qrMargin = Math.max(basePadding, minSafeMargin) * scaleFactor;
    const logoMargin = (options.imageMargin !== undefined ? Number(options.imageMargin) : 4) * scaleFactor;

    const qrExportInstance = new QRCodeStyling({
      width: exportSize,
      height: exportSize,
      margin: qrMargin,
      type: 'canvas',
      data: toQrByteString(payload),
      image: hasLogo ? logoDataUrl : '',
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: options.imageSize || 0.28,
        margin: logoMargin,
        crossOrigin: 'anonymous'
      },
      dotsOptions: dotsOptions,
      cornersSquareOptions: {
        color: options.cornerColor || '#0f172a',
        type: options.cornerType || 'extra-rounded'
      },
      cornersDotOptions: {
        color: options.cornerDotColor || options.cornerColor || '#06b6d4',
        type: options.cornerDotType || 'dot'
      },
      backgroundOptions: {
        color: bgColor
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : (options.errorCorrectionLevel || 'M')
      }
    });

    const blob = await qrExportInstance.getRawData('png');

    if (cornerRadius > 0) {
      const scaledRadius = Math.round(cornerRadius * scaleFactor);
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      URL.revokeObjectURL(objectUrl);

      const postCanvas = document.createElement('canvas');
      postCanvas.width = img.width;
      postCanvas.height = img.height;
      const pctx = postCanvas.getContext('2d');
      pctx.drawImage(img, 0, 0);
      applyCanvasCornerRadius(postCanvas, scaledRadius);

      const roundedBlob = await new Promise(res => postCanvas.toBlob(res, 'image/png'));
      downloadBlob(roundedBlob, filename);
      return { success: true, filename };
    }

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
  const scaledOptions = {
    ...options,
    scale: baseScale * scaleFactor
  };
  if (!is2DCode && options.height !== undefined) {
    scaledOptions.height = Number(options.height);
  }

  try {
    await engine.render(generator, payload, scaledOptions, { canvas: offscreenCanvas });
  } catch (err) {
    // Fallback directly to bwipCanvas if generator.render had an issue
    let finalPayload = payload;
    if (generator.id === 'upc-a' && payload.length === 11) {
      finalPayload = computeUpcA(payload);
    } else if (generator.id === 'ean-13' && payload.length === 12) {
      finalPayload = computeEan13(payload);
    }

    const scaledBwipOptions = {
      bcid: generator.id === 'data-matrix' ? 'datamatrix' :
            generator.id === 'aztec' ? 'azteccode' :
            generator.id === 'pdf417' ? 'pdf417' :
            generator.id === 'ean-13' ? 'ean13' :
            generator.id === 'upc-a' ? 'upca' :
            generator.id === 'itf-14' ? 'itf14' : 'code128',
      text: finalPayload,
      scale: baseScale * scaleFactor,
      includetext: options.includetext !== false,
      textxalign: 'center',
      guardwhitespace: ['ean-13', 'upc-a'].includes(generator.id),
      barcolor: options.barcolor || '000000',
      backgroundcolor: options.transparentBg ? undefined : (options.backgroundcolor || 'FFFFFF')
    };

    if (!is2DCode && options.height) {
      scaledBwipOptions.height = Number(options.height);
    }
    if (generator.id === 'pdf417' && Number(options.columns) > 0) {
      scaledBwipOptions.columns = Number(options.columns);
    }

    if (cornerRadius > 0) {
      const scaledRadius = Math.round(cornerRadius * scaleFactor);
      applyCanvasCornerRadius(offscreenCanvas, scaledRadius);
    }

    const dataUrl = offscreenCanvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, filename);
    return { success: true, filename };
  }

  if (cornerRadius > 0) {
    const scaledRadius = Math.round(cornerRadius * scaleFactor);
    applyCanvasCornerRadius(offscreenCanvas, scaledRadius);
  }

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

  let finalPayload = payload;
  if (generator.id === 'upc-a' && payload.length === 11) {
    finalPayload = computeUpcA(payload);
  } else if (generator.id === 'ean-13' && payload.length === 12) {
    finalPayload = computeEan13(payload);
  }

  const is2DCode = ['data-matrix', 'aztec', 'pdf417'].includes(generator.id);
  const padW = cornerRadius > 0 ? Math.max(10, Math.ceil(cornerRadius * 0.75)) : 10;
  const padH = cornerRadius > 0 ? Math.max(10, Math.ceil(cornerRadius * 0.75)) : 10;

  const svgOptions = {
    bcid: generator.id === 'data-matrix' ? 'datamatrix' :
          generator.id === 'aztec' ? 'azteccode' :
          generator.id === 'pdf417' ? 'pdf417' :
          generator.id === 'ean-13' ? 'ean13' :
          generator.id === 'upc-a' ? 'upca' :
          generator.id === 'itf-14' ? 'itf14' : 'code128',
    text: finalPayload,
    scale: options.scale || 3,
    paddingwidth: padW,
    paddingheight: padH,
    includetext: options.includetext !== false,
    textxalign: 'center',
    guardwhitespace: ['ean-13', 'upc-a'].includes(generator.id),
    barcolor: options.barcolor || '000000',
    backgroundcolor: (options.transparentBg || options.backgroundcolor === 'transparent') ? undefined : (options.backgroundcolor || 'FFFFFF')
  };

  if (!is2DCode && options.height) {
    svgOptions.height = Number(options.height);
  }
  if (generator.id === 'pdf417' && Number(options.columns) > 0) {
    svgOptions.columns = Number(options.columns);
  }

  let svgString = await engine.renderBwipSVG(svgOptions);
  if (cornerRadius > 0) {
    svgString = applySvgCornerRadius(svgString, cornerRadius);
  }
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
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
