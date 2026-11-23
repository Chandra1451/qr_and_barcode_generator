/**
 * Aztec Code Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: azteccode). Central bullseye finder pattern used in airline boarding passes and transport tickets.
 */

export default {
  id: "aztec",
  name: "Aztec Code",
  category: "2d",
  quietZone: "None required (1 module helps some scanners)",
  description: "High-efficiency 2D matrix barcode featuring a central square bullseye finder pattern. Standard for commercial airline boarding passes, train ticketing, and car registration documents.",

  schema: {
    inputType: "textarea",
    placeholder: "e.g. M1DESMARAIS/LUC   E123456 YULFRALH 0432 123Y012A0001",
    regex: /\S/, // any non-blank text; line breaks allowed
    errorMessage: "Aztec Code payload cannot be empty.",
    defaultPayload: "BOARDING_PASS_ETKT_987654321_GATE_B12",
    autoChecksum: false
  },

  controls: [
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

    return engineUtils.renderBwip(targets.canvas, {
      bcid: "azteccode",
      text: payload,
      scale: options.scale || 4,
      paddingwidth: options.padding !== undefined ? options.padding : 5,
      paddingheight: options.padding !== undefined ? options.padding : 5
    });
  }
};
