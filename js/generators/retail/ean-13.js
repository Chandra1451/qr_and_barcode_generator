/**
 * EAN-13 Retail Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: ean13). Standard global retail product barcode.
 */

import { computeEan13 } from '../../core/checksums.js';

export default {
  id: "ean-13",
  name: "EAN-13 (International Retail)",
  category: "retail",
  description: "Standard 13-digit European Article Number used across global retail point-of-sale systems. Encodes a country prefix, manufacturer code, product identifier, and Mod-10 check digit.",

  schema: {
    inputType: "text",
    placeholder: "e.g. 590123412345 (12 or 13 digits)",
    regex: /^[0-9]{12,13}$/,
    errorMessage: "EAN-13 requires exactly 12 digits (check digit will be computed) or 13 valid digits.",
    defaultPayload: "590123412345",
    autoChecksum: true,
    computeChecksum: (val) => computeEan13(val)
  },

  controls: [
    {
      id: "includetext",
      type: "toggle",
      label: "Show Human-Readable Text",
      default: true
    },
    {
      id: "height",
      type: "slider",
      label: "Bar Height",
      min: 20,
      max: 70,
      default: 35,
      unit: "mm"
    },
    {
      id: "scale",
      type: "slider",
      label: "Scale / Resolution",
      min: 1,
      max: 5,
      default: 3
    }
  ],

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'block';
    if (targets.container) targets.container.style.display = 'none';

    // Auto-complete check digit if 12 digits provided
    let finalPayload = payload;
    if (payload.length === 12) {
      finalPayload = computeEan13(payload);
    }

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "ean13",
      text: finalPayload,
      scale: options.scale || 3,
      height: options.height || 35,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true
    });
  }
};
