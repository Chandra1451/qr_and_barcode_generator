/**
 * Unified Barcode & QR Rendering Engine
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Provides a standardized abstraction over bwip-js and qr-code-styling.
 */

import { loadBwip, loadQRCodeStyling } from './dynamic-loader.js';

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

    // Default configuration overrides
    const config = {
      scale: 3,
      includetext: true,
      textxalign: 'center',
      textsize: 13,
      paddingwidth: 10,
      paddingheight: 10,
      ...(!is2DCode && { height: 35 }),
      ...bwipOptions
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
    if (!this.bwip) {
      this.bwip = await loadBwip();
    }

    const is2DCode = ['datamatrix', 'azteccode', 'qrcode', 'pdf417', 'micropdf417', 'maxicode', 'dotcode', 'hanxin', 'gridmatrix'].includes(bwipOptions.bcid);
    const isTransparent = bwipOptions.transparentBg === true || bwipOptions.backgroundcolor === 'transparent';

    const config = {
      scale: 3,
      includetext: true,
      textxalign: 'center',
      textsize: 13,
      paddingwidth: 10,
      paddingheight: 10,
      ...(!is2DCode && { height: 35 }),
      ...bwipOptions
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

    try {
      return this.bwip.toSVG(config);
    } catch (err) {
      throw new Error(`bwip-js SVG generation error: ${err.message || err}`);
    }
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

    const hasLogo = Boolean(stylingOptions.image && stylingOptions.image.trim().length > 0);
    const dotsOptions = {
      type: stylingOptions.dotsType || 'rounded',
      color: stylingOptions.dotsColor || '#0f172a',
      ...stylingOptions.dotsOptions
    };

    if (stylingOptions.gradientEnabled) {
      const rotationRad = ((Number(stylingOptions.gradientRotation) || 45) * Math.PI) / 180;
      dotsOptions.gradient = {
        type: stylingOptions.gradientType || 'linear',
        rotation: rotationRad,
        colorStops: [
          { offset: 0, color: stylingOptions.gradientColor1 || '#06b6d4' },
          { offset: 1, color: stylingOptions.gradientColor2 || '#3b82f6' }
        ]
      };
    }

    const bgColor = stylingOptions.transparentBg ? 'transparent' : (stylingOptions.backgroundColor || '#ffffff');

    // Default configuration for high-aesthetic QR
    const options = {
      width: 320,
      height: 320,
      type: 'canvas',
      data: stylingOptions.data || 'https://example.com',
      image: hasLogo ? stylingOptions.image : '',
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: stylingOptions.imageSize || 0.28,
        margin: stylingOptions.imageMargin !== undefined ? stylingOptions.imageMargin : 4,
        crossOrigin: 'anonymous',
        ...stylingOptions.imageOptions
      },
      dotsOptions: dotsOptions,
      cornersSquareOptions: {
        color: stylingOptions.cornerColor || '#0f172a',
        type: stylingOptions.cornerType || 'extra-rounded',
        ...stylingOptions.cornersSquareOptions
      },
      cornersDotOptions: {
        color: stylingOptions.cornerDotColor || stylingOptions.cornerColor || '#06b6d4',
        type: stylingOptions.cornerDotType || 'dot',
        ...stylingOptions.cornersDotOptions
      },
      backgroundOptions: {
        color: bgColor,
        ...stylingOptions.backgroundOptions
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : (stylingOptions.errorCorrectionLevel || 'M'),
        ...stylingOptions.qrOptions
      }
    };

    container.innerHTML = '';
    this.currentQrInstance = new this.QRCodeStyling(options);
    this.currentQrInstance.append(container);

    return this.currentQrInstance;
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

    // Pass helper engineUtils to generator.render
    const engineUtils = {
      renderBwip: (canvas, opts) => this.renderBwipCanvas(canvas, {
        ...(options.barcolor ? { barcolor: options.barcolor } : {}),
        ...(options.backgroundcolor !== undefined ? { backgroundcolor: options.backgroundcolor } : {}),
        ...(options.transparentBg !== undefined ? { transparentBg: options.transparentBg } : {}),
        ...opts
      }),
      renderBwipSVG: (opts) => this.renderBwipSVG({
        ...(options.barcolor ? { barcolor: options.barcolor } : {}),
        ...(options.backgroundcolor !== undefined ? { backgroundcolor: options.backgroundcolor } : {}),
        ...(options.transparentBg !== undefined ? { transparentBg: options.transparentBg } : {}),
        ...opts
      }),
      renderQRCode: (container, opts) => this.renderQRCode(container, opts),
      bwip: this.bwip,
      QRCodeStyling: this.QRCodeStyling
    };

    return generator.render(targets, payload, options, engineUtils);
  }
}

// Export singleton instance
export const engine = new BarcodeEngine();
