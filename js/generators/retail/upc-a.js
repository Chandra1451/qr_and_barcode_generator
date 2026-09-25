/**
 * UPC-A Retail Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: upca). Standard retail barcode in North America (USA & Canada).
 */

import { computeUpcA } from '../../core/checksums.js?v=2.7';

export default {
  id: "upc-a",
  name: "UPC-A (North American Retail)",
  category: "retail",
  description: "Universal Product Code standard 12-digit barcode used at retail POS checkouts across the United States and Canada.",

  schema: {
    inputType: "text",
    placeholder: "e.g. 01234567890 (11 or 12 digits)",
    regex: /^[0-9]{11,12}$/,
    errorMessage: "UPC-A requires exactly 11 digits (check digit will be computed) or 12 valid digits.",
    defaultPayload: "01234567890",
    autoChecksum: true,
    computeChecksum: (val) => computeUpcA(val)
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
    if (payload.length === 11) {
      finalPayload = computeUpcA(payload);
    }

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "upca",
      text: finalPayload,
      scale: options.scale || 3,
      height: options.height || 35,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true,
      barcolor: options.barcolor,
      backgroundcolor: options.backgroundcolor,
      transparentBg: options.transparentBg,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    });
  }
};
