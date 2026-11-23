/**
 * Data Matrix (ECC 200) Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: datamatrix). Widely used in electronics, healthcare & aerospace.
 */

export default {
  id: "data-matrix",
  name: "Data Matrix (ECC 200)",
  category: "2d",
  quietZone: "1 module on every side",
  description: "High-density 2D matrix barcode capable of encoding large datasets in minuscule footprints. Standard in pharmaceutical tracking, surgical equipment, and aerospace parts.",

  schema: {
    inputType: "textarea",
    placeholder: "e.g. [)>*06*12S98765*1PABC-123*Q50*1T12345",
    regex: /\S/, // any non-blank text; line breaks allowed
    errorMessage: "Data Matrix payload cannot be empty.",
    defaultPayload: "https://example.com/item/1029384",
    autoChecksum: false
  },

  controls: [
    {
      // Fixed ECC 200 square sizes (rows × columns, in modules). Auto lets bwip-js pick the smallest
      // symbol that fits. Rectangles are left out until the label layout handles them (UCM-DM-01).
      id: "symbolSize",
      type: "select",
      label: "Symbol Size",
      options: [
        { label: "Auto (smallest that fits)", value: "auto" },
        ...[10, 12, 14, 16, 18, 20, 22, 24, 26, 32, 36, 40, 44, 48, 52, 64, 72, 80, 88, 96, 104, 120, 132, 144]
          .map((n) => ({ label: `${n} × ${n}`, value: `${n}x${n}` }))
      ],
      default: "auto"
    },
    {
      id: "scale",
      type: "slider",
      label: "Scale / Resolution",
      min: 2,
      max: 8,
      default: 4
    },
    {
      id: "padding",
      type: "slider",
      label: "Quiet Zone Padding",
      min: 0,
      max: 40,
      // 5 modules: the same margin the earlier half-module padding drew at 10 (UCM-DM-02).
      default: 5,
      unit: "x" // modules; js/core/engine.js converts to bwip-js units (2 per module for this format)
    }
  ],

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'block';
    if (targets.container) targets.container.style.display = 'none';

    const size = /^(\d+)x(\d+)$/.exec(String(options.symbolSize || ''));
    try {
      return await engineUtils.renderBwip(targets.canvas, {
        bcid: "datamatrix",
        text: payload,
        scale: options.scale || 4,
        paddingwidth: options.padding !== undefined ? options.padding : 5,
        paddingheight: options.padding !== undefined ? options.padding : 5,
        ...(size ? { rows: Number(size[1]), columns: Number(size[2]) } : {})
      });
    } catch (err) {
      // bwip-js reports a symbol that is too small for the data as "datamatrixNoValidSymbol".
      if (size && /NoValidSymbol|Maximum length/i.test(String(err?.message || err))) {
        throw new Error(`Too much data for a ${size[1]} × ${size[2]} symbol. Choose a larger size, or Auto.`);
      }
      throw err;
    }
  }
};
