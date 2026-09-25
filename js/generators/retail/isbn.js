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
    autoChecksum: true,
    // Reject a wrong ISBN-13 check digit instead of encoding it.
    validate: (val) => {
      const digits = val.trim().split(/\s+/)[0].replace(/\D/g, '');
      if (digits.length !== 13) return null;
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (i % 2 ? 3 : 1);
      const check = String((10 - (sum % 10)) % 10);
      return check === digits[12] ? null : `Wrong ISBN check digit: the last digit should be ${check}, not ${digits[12]}.`;
    }
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

    // Format text with optional price addon if provided in controls
    let cleanText = payload.trim();
    if (options.addon && /^[0-9]{5}$/.test(options.addon.trim()) && !cleanText.includes(' ')) {
      cleanText += ' ' + options.addon.trim();
    }

    // bwip-js "isbn" needs the hyphenated form. An un-hyphenated ISBN-13 is the same
    // EAN-13 symbol, so render it as ean13 (the "ISBN ..." header line is omitted).
    const unHyphenated = /^97[89][0-9]{10}$/.test(cleanText.split(/\s+/)[0]);

    return engineUtils.renderBwip(targets.canvas, {
      bcid: unHyphenated ? "ean13" : "isbn",
      text: cleanText, // "ISBN [addon]" — both bcids take the add-on after a space
      scale: options.scale || 3,
      height: options.height || 30,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    });
  }
};
