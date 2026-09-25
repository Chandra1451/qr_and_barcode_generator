/**
 * ISBN-13 Bookland Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: isbn). International Standard Book Number barcode
 * compliant with ISO 2108, Amazon KDP, and IngramSpark publishing specifications.
 */

export default {
  id: "isbn",
  name: "ISBN-13 (Book Publishing)",
  category: "retail",
  description: "International Standard Book Number (Bookland EAN-13) for paperback, hardcover, and self-published books. Supports official 978/979 prefixes and optional 5-digit price extensions (EAN-5).",

  schema: {
    inputType: "text",
    placeholder: "e.g. 978-0-306-40615-7 or 9780306406157",
    regex: /^(?:97[89][-\s]?[0-9]{1,5}[-\s]?[0-9]{1,7}[-\s]?[0-9]{1,6}[-\s]?[0-9]|97[89][0-9]{10})(?:\s+[0-9]{5})?$/,
    errorMessage: "Enter a valid 13-digit ISBN starting with 978 or 979 (hyphens allowed, optional 5-digit price addon).",
    defaultPayload: "978-0-306-40615-7",
    autoChecksum: true
  },

  controls: [
    {
      id: "addon",
      type: "text",
      label: "Price Addon (EAN-5)",
      placeholder: "e.g. 51999 for $19.99 USD",
      default: ""
    },
    {
      id: "includetext",
      type: "toggle",
      label: "Show Human-Readable ISBN",
      default: true
    },
    {
      id: "height",
      type: "slider",
      label: "Bar Height",
      min: 20,
      max: 60,
      default: 30,
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

    // Format text with optional price addon if provided in controls
    let cleanText = payload.trim();
    if (options.addon && /^[0-9]{5}$/.test(options.addon.trim()) && !cleanText.includes(' ')) {
      cleanText += ' ' + options.addon.trim();
    }

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "isbn",
      text: cleanText,
      scale: options.scale || 3,
      height: options.height || 30,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true
    });
  }
};
