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
      id: "scale",
      type: "slider",
      label: "Module Scale",
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
      default: 10,
      unit: "px"
    }
  ],

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'block';
    if (targets.container) targets.container.style.display = 'none';

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "datamatrix",
      text: payload,
      scale: options.scale || 4,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    });
  }
};
