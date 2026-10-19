/**
 * EAN-13 Retail Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: ean13). Standard global retail product barcode.
 */

import { bwipHeightMm } from '../../core/print-size.js?v=3.26';
import { computeEan13 } from '../../core/checksums.js?v=3.26';

export default {
  id: "ean-13",
  name: "EAN-13 (International Retail)",
  category: "retail",
  quietZone: "11x left, 7x right",
  moduleMm: 0.33, // GS1 recommended X-dimension (100% size) (js/core/print-size.js)
  description: "Thirteen-digit retail GTIN format with a GS1 prefix, company and item references, and a Mod-10 check digit. The prefix does not identify a product's country of origin.",

  schema: {
    inputType: "text",
    placeholder: "e.g. 590123412345 (12 or 13 digits)",
    regex: /^[0-9]{12,13}$/,
    errorMessage: "EAN-13 requires exactly 12 digits (check digit will be computed) or 13 valid digits.",
    defaultPayload: "590123412345",
    autoChecksum: true,
    computeChecksum: (val) => computeEan13(val),
    // A full-length code must carry the correct GS1 check digit; never encode a wrong one.
    validate: (val) => {
      if (val.length !== 13) return null;
      const correct = computeEan13(val.slice(0, 12));
      return correct === val ? null : `Wrong check digit: the 13th digit should be ${correct.slice(-1)}, not ${val.slice(-1)}.`;
    }
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
      step: 0.05,
      default: 22.85, // GS1 nominal bar height at 100% size (General Specifications R26.0, 5.2.3.2)
      unit: "mm",
      warnBelow: { value: 22.85, text: "Below GS1's minimum bar height (22.85 mm at 100% size). GS1 allows shorter (truncated) bars only when a full-height barcode cannot fit; they lose omnidirectional scanning at the checkout." }
    },
    {
      id: "scale",
      type: "slider",
      label: "Scale / Resolution",
      min: 1,
      max: 5,
      default: 3
    },
    {
      id: "padding",
      type: "slider",
      label: "Quiet Zone Padding",
      min: 0,
      max: 40,
      default: 10,
      unit: "x" // modules (bar widths): bwip-js padding is in points = modules
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
      height: bwipHeightMm(options.height || 22.85, this.moduleMm), // bars print this many mm tall
      includetext: options.includetext !== false,
      guardwhitespace: options.includetext !== false, // ">" quiet-zone marker only alongside the digits
      barcolor: options.barcolor,
      backgroundcolor: options.backgroundcolor,
      transparentBg: options.transparentBg,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    });
  }
};
