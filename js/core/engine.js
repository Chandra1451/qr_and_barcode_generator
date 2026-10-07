/**
 * Unified Barcode & QR Rendering Engine
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Provides a standardized abstraction over bwip-js and qr-code-styling.
 */

import { loadBwip, loadQRCodeStyling } from './dynamic-loader.js?v=3.16';

/**
 * Converts text to a UTF-8 "byte string" for qr-code-styling.
 * The library writes each character's low byte in byte mode, so "—" (U+2014) became
 * 0x14 and emoji/₹/Indic/CJK text scanned as garbage. Passing UTF-8 bytes (one char per
 * byte) encodes correctly; scanners detect UTF-8. Pure ASCII is returned unchanged.
 * @param {string} text
 * @returns {string}
 */
export function toQrByteString(text) {
  const str = String(text ?? '');
  if (!/[^\x00-\x7F]/.test(str)) return str;
  let out = '';
  for (const byte of new TextEncoder().encode(str)) out += String.fromCharCode(byte);
  return out;
}

/**
 * Sizes a qr-code-styling instance so its quiet zone is exactly `marginPx`.
 * With a fixed canvas size the library rounds the dot size down and centres the code,
 * so margins 0…~10 all looked identical ("padding slider does nothing"). Here the dot
 * size is fixed from `codeAreaPx` and the canvas grows/shrinks by the margin instead,
 * the same way barcode padding works.
 * @returns {number|null} the new canvas size, or null if the module count is unavailable
 */
export function snapQrToMargin(instance, marginPx, codeAreaPx = 300, dotScale = 1) {
  const count = instance?._qr?.getModuleCount?.();
  if (!count) return null;
  // dotScale keeps exports an exact multiple of the preview (preview dot × export scale).
  const dot = Math.max(1, Math.floor(codeAreaPx / count)) * dotScale;
  const size = count * dot + 2 * Math.round(marginPx);
  instance.update({ width: size, height: size });
  return size;
}

/**
 * Smallest quiet zone (px) that keeps the code itself clear of a rounded corner of radius r:
 * at the diagonal the arc sits r·(1 − 1/√2) ≈ 0.29r in from each edge, +1 px for anti-aliasing.
 * Every renderer and exporter uses this one rule, so all codes round the same way. (Barcodes used
 * 0.75r in bwip-js points, which are multiplied by scale, so the white border grew ~7× faster
 * than needed as the radius went up; QR used 0.4r.)
 * @param {number} radiusPx - corner radius in the image's own pixels
 * @returns {number}
 */
export function cornerSafeInset(radiusPx) {
  const r = Number(radiusPx) || 0;
  return r > 0 ? Math.ceil(r * (1 - Math.SQRT1_2)) + 1 : 0;
}

/**
 * Rounds the corners of an SVG with a clip path (lossless). Used by the SVG download and
 * styled-QR exports; image-exporter re-exports it as applySvgCornerRadius.
 */
export function svgWithRoundedCorners(svgString, radius) {
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

  // The opening <svg …> tag, not the first '>': QR SVGs start with an <?xml …?> declaration,
  // and inserting the clip after it put the clip outside <svg> and broke the file (until 2026-10-07).
  const svgOpenTagStart = svgString.search(/<svg[\s>]/);
  if (svgOpenTagStart === -1) return svgString;
  const svgOpenTagEnd = svgString.indexOf('>', svgOpenTagStart);
  if (svgOpenTagEnd === -1) return svgString;

  const openTag = svgString.slice(0, svgOpenTagEnd + 1);
  const closingTagIndex = svgString.lastIndexOf('</svg>');
  if (closingTagIndex === -1) return svgString;

  const innerContent = svgString.slice(svgOpenTagEnd + 1, closingTagIndex);
  return `${openTag}\n${clipDef}\n<g clip-path="url(#${clipId})">\n${innerContent}\n</g>\n</svg>`;
}

/**
 * The one place that turns studio QR settings into qr-code-styling options. The preview and
 * every export (PNG, PDF sheet, batch PNG/SVG) use it, so a setting can't work in one place
 * and be ignored in another (before 2026-10-07 five copies had drifted: batch dropped the
 * gradient, the PDF dropped background, padding and logo size).
 * @param {object} styling - studio options (dotsType, dotsColor, gradient*, corner*, backgroundColor,
 *   transparentBg, padding, cornerRadius, imageSize, imageMargin, errorCorrectionLevel, …)
 * @param {object} opts
 * @param {string} opts.data - payload (raw text; encoded to UTF-8 bytes here)
 * @param {string} [opts.image] - logo data URL ('' for none)
 * @param {number} [opts.scale] - export scale; 1 = preview size (320 px)
 * @param {'canvas'|'svg'} [opts.type]
 * @returns {{ config: object, margin: number, scale: number }} margin in output pixels
 */
export function qrStylingConfig(styling = {}, { data = '', image = '', scale = 1, type = 'canvas' } = {}) {
  const hasLogo = Boolean(image && String(image).trim().length > 0);
  const dotsOptions = {
    type: styling.dotsType || 'rounded',
    color: styling.dotsColor || '#0f172a',
    ...styling.dotsOptions
  };
  if (styling.gradientEnabled) {
    const rotationRad = ((Number(styling.gradientRotation) || 45) * Math.PI) / 180;
    dotsOptions.gradient = {
      type: styling.gradientType || 'linear',
      rotation: rotationRad,
      colorStops: [
        { offset: 0, color: styling.gradientColor1 || '#06b6d4' },
        { offset: 1, color: styling.gradientColor2 || '#3b82f6' }
      ]
    };
  }
  const cornerRadius = Number(styling.cornerRadius) || 0;
  const requestedPad = styling.padding !== undefined ? Number(styling.padding)
    : (styling.margin !== undefined ? Number(styling.margin) : 10);
  const margin = Math.max(requestedPad * scale, cornerSafeInset(cornerRadius * scale));
  const logoMargin = (styling.imageMargin !== undefined ? Number(styling.imageMargin) : 4) * scale;

  return {
    margin,
    scale,
    config: {
      width: 320 * scale,
      height: 320 * scale,
      margin,
      type,
      data: toQrByteString(data || 'https://example.com'),
      image: hasLogo ? image : '',
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: styling.imageSize || 0.28,
        margin: logoMargin,
        crossOrigin: 'anonymous',
        ...styling.imageOptions
      },
      dotsOptions,
      cornersSquareOptions: {
        color: styling.cornerColor || '#0f172a',
        type: styling.cornerType || 'extra-rounded',
        ...styling.cornersSquareOptions
      },
      cornersDotOptions: {
        color: styling.cornerDotColor || styling.cornerColor || '#06b6d4',
        type: styling.cornerDotType || 'dot',
        ...styling.cornersDotOptions
      },
      backgroundOptions: {
        color: styling.transparentBg ? 'transparent' : (styling.backgroundColor || '#ffffff'),
        ...styling.backgroundOptions
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : (styling.errorCorrectionLevel || 'M'),
        ...styling.qrOptions
      }
    }
  };
}

/**
 * Rounds a canvas element's on-screen box with the same curve as its pixels. The preview scales
 * canvases to fit, so a fixed `${r}px` CSS radius was larger than the pixel radius and clipped
 * into the code; percentages scale with the element.
 * @param {HTMLCanvasElement} canvas
 * @param {number} radius - corner radius in canvas pixels
 */
export function setCanvasCssRadius(canvas, radius) {
  if (!canvas) return;
  const r = Number(radius) || 0;
  if (r <= 0 || !canvas.width || !canvas.height) {
    canvas.style.borderRadius = '0px';
    return;
  }
  const clamped = Math.min(r, canvas.width / 2, canvas.height / 2);
  canvas.style.borderRadius = `${(clamped / canvas.width) * 100}% / ${(clamped / canvas.height) * 100}%`;
}

/**
 * Applies smooth anti-aliased rounded corners to an HTML5 canvas in-place
 * @param {HTMLCanvasElement} canvas
 * @param {number} radius - Corner radius in pixels
 */
export function applyCanvasCornerRadius(canvas, radius) {
  if (!canvas || !radius || radius <= 0) return;
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return;

  const r = Math.min(radius, width / 2, height / 2);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(0, 0, width, height, r);
  } else {
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

export class BarcodeEngine {
  constructor() {
    this.bwip = null;
    this.QRCodeStyling = null;
    this.currentQrInstance = null;
  }

  /**
   * Initializes the engine dependencies
   */
  async init() {
    const [bwip, qrcs] = await Promise.all([
      loadBwip(),
      loadQRCodeStyling()
    ]);
    this.bwip = bwip;
    this.QRCodeStyling = qrcs;
    return true;
  }

  /**
   * Validates a payload against a generator schema
   * @param {object} generator - The generator plugin
   * @param {string} payload - The input string
   * @returns {{ valid: boolean, error: string | null }}
   */
  validate(generator, payload) {
    if (!generator || !generator.schema) {
      return { valid: true, error: null };
    }

    const { regex, errorMessage, required = true } = generator.schema;

    if (!payload && required) {
      return { valid: false, error: 'Input payload is required.' };
    }

    if (regex && !regex.test(payload)) {
      return {
        valid: false,
        error: errorMessage || 'Payload does not match required format.'
      };
    }

    // Optional semantic check beyond the regex (e.g. a wrong GS1 check digit).
    if (typeof generator.schema.validate === 'function') {
      const problem = generator.schema.validate(payload);
      if (problem) return { valid: false, error: problem };
    }

    return { valid: true, error: null };
  }

  /**
   * Renders a barcode to an HTML5 Canvas using bwip-js
   * @param {HTMLCanvasElement} canvas - Target canvas element
   * @param {object} bwipOptions - Options for bwip-js
   */
  async renderBwipCanvas(canvas, bwipOptions) {
    if (!this.bwip) {
      this.bwip = await loadBwip();
    }

    const is2DCode = ['datamatrix', 'azteccode', 'qrcode', 'pdf417', 'micropdf417', 'maxicode', 'dotcode', 'hanxin', 'gridmatrix'].includes(bwipOptions.bcid);
    const isTransparent = bwipOptions.transparentBg === true || bwipOptions.backgroundcolor === 'transparent';
    const cornerRadius = Number(bwipOptions.cornerRadius) || 0;
    const requestedPad = bwipOptions.padding !== undefined ? Number(bwipOptions.padding)
      : (bwipOptions.paddingwidth !== undefined ? Number(bwipOptions.paddingwidth) : 10);
    // bwip-js padding is in points (× scale px); the corner rule is in pixels.
    const minSafePad = Math.ceil(cornerSafeInset(cornerRadius) / (Number(bwipOptions.scale) || 3));
    const finalPad = Math.max(requestedPad, minSafePad);

    // Default configuration overrides
    const config = {
      scale: 3,
      includetext: true,
      textxalign: 'center',
      textsize: 13,
      ...(!is2DCode && { height: 35 }),
      ...bwipOptions,
      paddingwidth: finalPad,
      paddingheight: finalPad
    };

    // Clean up color options for bwip-js
    if (isTransparent) {
      delete config.backgroundcolor;
    } else if (!config.backgroundcolor) {
      config.backgroundcolor = 'FFFFFF';
    } else {
      config.backgroundcolor = String(config.backgroundcolor).replace('#', '');
    }

    if (config.barcolor) {
      config.barcolor = String(config.barcolor).replace('#', '');
    } else {
      config.barcolor = '000000';
    }

    // bwipjs.toCanvas takes either canvas id or the canvas element directly
    try {
      this.bwip.toCanvas(canvas, config);
      if (cornerRadius > 0) applyCanvasCornerRadius(canvas, cornerRadius);
      setCanvasCssRadius(canvas, cornerRadius);
      return { success: true };
    } catch (err) {
      throw new Error(`bwip-js rendering error: ${err.message || err}`);
    }
  }

  /**
   * Generates pure SVG string using bwip-js
   * @param {object} bwipOptions - Options for bwip-js
   * @returns {Promise<string>} SVG XML string
   */
  async renderBwipSVG(bwipOptions) {
    return (await this.renderBwipVector(bwipOptions)).svg;
  }

  /** SVG plus the bwip-js scale it was drawn at (the EPS export needs the scale for true size). */
  async renderBwipVector(bwipOptions) {
    if (!this.bwip) {
      this.bwip = await loadBwip();
    }
    const config = this.bwipVectorConfig(bwipOptions);
    try {
      return { svg: this.bwip.toSVG(config), scale: Number(config.scale) || 3 };
    } catch (err) {
      throw new Error(`bwip-js SVG generation error: ${err.message || err}`);
    }
  }

  /** bwip-js options for vector output (shared by the SVG and EPS downloads). */
  bwipVectorConfig(bwipOptions) {
    const is2DCode = ['datamatrix', 'azteccode', 'qrcode', 'pdf417', 'micropdf417', 'maxicode', 'dotcode', 'hanxin', 'gridmatrix'].includes(bwipOptions.bcid);
    const isTransparent = bwipOptions.transparentBg === true || bwipOptions.backgroundcolor === 'transparent';

    const cornerRadius = Number(bwipOptions.cornerRadius) || 0;
    const requestedPad = bwipOptions.padding !== undefined ? Number(bwipOptions.padding)
      : (bwipOptions.paddingwidth !== undefined ? Number(bwipOptions.paddingwidth) : 10);
    // bwip-js padding is in points (× scale px); the corner rule is in pixels.
    const minSafePad = Math.ceil(cornerSafeInset(cornerRadius) / (Number(bwipOptions.scale) || 3));
    const finalPad = Math.max(requestedPad, minSafePad);

    const config = {
      scale: 3,
      includetext: true,
      textxalign: 'center',
      textsize: 13,
      ...(!is2DCode && { height: 35 }),
      ...bwipOptions,
      paddingwidth: finalPad,
      paddingheight: finalPad
    };

    if (isTransparent) {
      delete config.backgroundcolor;
    } else if (!config.backgroundcolor) {
      config.backgroundcolor = 'FFFFFF';
    } else {
      config.backgroundcolor = String(config.backgroundcolor).replace('#', '');
    }

    if (config.barcolor) {
      config.barcolor = String(config.barcolor).replace('#', '');
    } else {
      config.barcolor = '000000';
    }

    return config;
  }

  /**
   * Renders a styled QR Code using qr-code-styling into a container element
   * @param {HTMLElement} container - DOM element to render inside
   * @param {object} stylingOptions - Configuration for QRCodeStyling
   * @returns {Promise<object>} The active QRCodeStyling instance
   */
  async renderQRCode(container, stylingOptions) {
    if (!this.QRCodeStyling) {
      this.QRCodeStyling = await loadQRCodeStyling();
    }

    const cornerRadius = Number(stylingOptions.cornerRadius) || 0;
    const { config: options, margin: qrMargin } = qrStylingConfig(stylingOptions, {
      data: stylingOptions.data,
      image: stylingOptions.image
    });
    container.innerHTML = '';
    this.currentQrInstance = new this.QRCodeStyling(options);
    // 300 px code area = the 320 px default size minus the default 10 px margins.
    snapQrToMargin(this.currentQrInstance, qrMargin, 300);
    this.currentQrInstance.append(container);

    container.style.overflow = 'visible';
    const qrCanvas = container.querySelector('canvas');

    container.style.borderRadius = '0px';
    if (qrCanvas) {
      if (cornerRadius > 0) applyCanvasCornerRadius(qrCanvas, cornerRadius);
      setCanvasCssRadius(qrCanvas, cornerRadius);
    }

    return this.currentQrInstance;
  }

  /**
   * Styled QR for exports (PNG, PDF sheet, batch): same settings, geometry and corners as the
   * preview, at `scale` × the preview size.
   * @returns {Promise<Blob|string>} PNG Blob, or SVG text when format is 'svg'
   */
  async renderStyledQr(styling, { data, image = '', scale = 1, format = 'png' } = {}) {
    if (!this.QRCodeStyling) {
      this.QRCodeStyling = await loadQRCodeStyling();
    }
    const { config, margin } = qrStylingConfig(styling, { data, image, scale, type: format === 'svg' ? 'svg' : 'canvas' });
    const instance = new this.QRCodeStyling(config);
    snapQrToMargin(instance, margin, 300, scale);
    const radius = Math.round((Number(styling.cornerRadius) || 0) * scale);

    if (format === 'svg') {
      const svg = await (await instance.getRawData('svg')).text();
      return radius > 0 ? svgWithRoundedCorners(svg, radius) : svg;
    }

    const blob = await instance.getRawData('png');
    if (radius <= 0) return blob;
    const img = new Image();
    const url = URL.createObjectURL(blob);
    try {
      img.src = url;
      await img.decode();
    } finally {
      URL.revokeObjectURL(url);
    }
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    applyCanvasCornerRadius(canvas, radius);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  /**
   * Universal rendering gateway: delegates to the specific generator's render() implementation
   * @param {object} generator - The generator plugin
   * @param {string} payload - Input payload
   * @param {object} options - UI control options
   * @param {object} targets - { canvas: HTMLCanvasElement, container: HTMLElement }
   */
  async render(generator, payload, options, targets) {
    if (!generator) {
      throw new Error('No generator specified.');
    }

    // Validate payload
    const validation = this.validate(generator, payload);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return generator.render(targets, payload, options, this.engineUtilsFor(options));
  }

  /**
   * Renders a 1D/2D barcode to an SVG string through the generator's own render()
   * (its bcid, checksum completion, text, height, columns, addon...), with the same
   * colours and padding as the preview. Every SVG/PDF/batch export goes through here,
   * so exports can't drift from the preview.
   * @returns {Promise<string>} SVG markup
   */
  async renderSVG(generator, payload, options = {}) {
    if (!generator) throw new Error('No generator specified.');
    if (generator.id === 'qr-code') throw new Error('Use the QR instance for QR SVG export.');
    const validation = this.validate(generator, payload);
    if (!validation.valid) throw new Error(validation.error);

    const utils = this.engineUtilsFor(options);
    utils.renderBwip = (_canvas, opts) => utils.renderBwipSVG(opts);
    return generator.render({}, payload, options, utils);
  }

  /** Like renderSVG, but returns { svg, scale } for exports that need the drawing scale (EPS). */
  async renderVector(generator, payload, options = {}) {
    if (!generator) throw new Error('No generator specified.');
    if (generator.id === 'qr-code') throw new Error('Vector EPS is available for barcodes; use SVG for QR codes.');
    const validation = this.validate(generator, payload);
    if (!validation.valid) throw new Error(validation.error);

    const utils = this.engineUtilsFor(options);
    utils.renderBwip = (_canvas, opts) => utils.renderBwipVector(opts);
    return generator.render({}, payload, options, utils);
  }

  /** Helpers passed to generator.render(); studio-wide options (colours, padding, corners) are merged in. */
  engineUtilsFor(options) {
    const shared = (opts) => ({
      ...(options.barcolor ? { barcolor: options.barcolor } : {}),
      ...(options.backgroundcolor !== undefined ? { backgroundcolor: options.backgroundcolor } : {}),
      ...(options.transparentBg !== undefined ? { transparentBg: options.transparentBg } : {}),
      ...(options.cornerRadius !== undefined ? { cornerRadius: options.cornerRadius } : {}),
      ...(options.padding !== undefined ? { padding: options.padding } : {}),
      ...opts
    });
    return {
      renderBwip: (canvas, opts) => this.renderBwipCanvas(canvas, shared(opts)),
      renderBwipSVG: (opts) => this.renderBwipSVG(shared(opts)),
      renderBwipVector: (opts) => this.renderBwipVector(shared(opts)),
      renderQRCode: (container, opts) => this.renderQRCode(container, {
        ...(options.cornerRadius !== undefined ? { cornerRadius: options.cornerRadius } : {}),
        ...(options.padding !== undefined ? { padding: options.padding } : {}),
        ...opts
      }),
      bwip: this.bwip,
      QRCodeStyling: this.QRCodeStyling
    };
  }
}

// Export singleton instance
export const engine = new BarcodeEngine();
