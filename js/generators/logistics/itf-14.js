/**
 * ITF-14 Shipping Container Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: itf14). Heavy-duty packaging code with bearer bars.
 */

import { computeItf14 } from '../../core/checksums.js?v=3.0';

export default {
  id: "itf-14",
  name: "ITF-14 (Shipping Outer Case)",
  category: "logistics",
  description: "Interleaved 2 of 5 standard 14-digit code enclosed in thick bearer bars. Designed to print reliably on corrugated cardboard cartons and master shipping cases.",

  schema: {
    inputType: "text",
    placeholder: "e.g. 1001234567890 (13 or 14 digits)",
    regex: /^[0-9]{13,14}$/,
    errorMessage: "ITF-14 requires exactly 13 digits (check digit will be computed) or 14 valid digits.",
    defaultPayload: "1001234567890",
    autoChecksum: true,
    computeChecksum: (val) => computeItf14(val),
    // A full-length code must carry the correct GS1 check digit; never encode a wrong one.
    validate: (val) => {
      if (val.length !== 14) return null;
      const correct = computeItf14(val.slice(0, 13));
      return correct === val ? null : `Wrong check digit: the 14th digit should be ${correct.slice(-1)}, not ${val.slice(-1)}.`;
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
      min: 25,
      max: 80,
      default: 40,
      unit: "mm"
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
      unit: "px"
    }
  ],

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'block';
    if (targets.container) targets.container.style.display = 'none';

    let finalPayload = payload;
    if (payload.length === 13) {
      finalPayload = computeItf14(payload);
    }

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "itf14",
      text: finalPayload,
      scale: options.scale || 3,
      height: options.height || 40,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    });
  }
};
