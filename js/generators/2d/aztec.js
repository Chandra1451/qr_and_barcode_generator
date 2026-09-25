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
  description: "High-efficiency 2D matrix barcode featuring a central square bullseye finder pattern. Standard for commercial airline boarding passes, train ticketing, and car registration documents.",

  schema: {
    inputType: "textarea",
    placeholder: "e.g. M1DESMARAIS/LUC   E123456 YULFRALH 0432 123Y012A0001",
    regex: /^.+$/,
    errorMessage: "Aztec Code payload cannot be empty.",
    defaultPayload: "BOARDING_PASS_ETKT_987654321_GATE_B12",
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
      bcid: "azteccode",
      text: payload,
      scale: options.scale || 4,
      paddingwidth: options.padding || 10,
      paddingheight: options.padding || 10
    });
  }
};
