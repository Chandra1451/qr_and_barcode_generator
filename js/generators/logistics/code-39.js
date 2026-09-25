/**
 * Code 39 Industrial & Asset Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: code39). Standard 1D symbology for IT asset tracking,
 * inventory management, and government/defense MIL-STD-129 compliance.
 */

export default {
  id: "code-39",
  name: "Code 39 (Asset & Inventory)",
  category: "logistics",
  description: "Standard industrial alphanumeric barcode supporting uppercase letters, numbers, and key symbols. Widely used for IT asset tags, healthcare specimen tracking, and military logistics.",

  schema: {
    inputType: "text",
    placeholder: "e.g. ASSET-998812",
    regex: /^[0-9A-Z\-\.\ \$\/\+\%]+$/,
    errorMessage: "Code 39 supports uppercase A–Z, digits 0–9, and symbols (- . $ / + % space).",
    defaultPayload: "ASSET-100294",
    autoChecksum: false
  },

  controls: [
    {
      id: "includetext",
      type: "toggle",
      label: "Show Human-Readable Text",
      default: true
    },
    {
      id: "includecheck",
      type: "toggle",
      label: "Include Mod-43 Check Digit",
      default: false
    },
    {
      id: "height",
      type: "slider",
      label: "Bar Height",
      min: 15,
      max: 80,
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

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "code39",
      text: payload.toUpperCase(),
      scale: options.scale || 3,
      height: options.height || 35,
      includetext: options.includetext !== false,
      includecheck: Boolean(options.includecheck),
      includecheckintext: Boolean(options.includecheck),
      textxalign: "center",
      guardwhitespace: true
    });
  }
};
