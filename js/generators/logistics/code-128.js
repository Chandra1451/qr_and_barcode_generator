/**
 * Code 128 Logistics & Asset Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: code128). High-density barcode encoding standard ASCII.
 */

export default {
  id: "code-128",
  name: "Code 128 (Logistics & Inventory)",
  category: "logistics",
  description: "High-density universal linear barcode capable of encoding all 128 ASCII characters. The world standard for inventory management, shipping labels, and enterprise asset tracking.",

  schema: {
    inputType: "text",
    placeholder: "e.g. SHIP-TRACK-889912",
    regex: /^[\x20-\x7E]+$/,
    errorMessage: "Code 128 supports printable ASCII characters.",
    defaultPayload: "LOGISTICS-2026-X99",
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
      bcid: "code128",
      text: payload,
      scale: options.scale || 3,
      height: options.height || 35,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true
    });
  }
};
