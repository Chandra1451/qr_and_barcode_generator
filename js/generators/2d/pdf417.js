/**
 * PDF417 Stacked 2D Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: pdf417). Widely used on driver's licenses, IDs, and customs/shipping manifests.
 */

export default {
  id: "pdf417",
  name: "PDF417 (Stacked 2D)",
  category: "2d",
  description: "Stacked linear 2D barcode format capable of holding over a kilobyte of data. Standard on national identity cards, state driver licenses, and customs declarations.",

  schema: {
    inputType: "textarea",
    placeholder: "e.g. ANSI 6360000102DL00390237DLDAQD12345678...",
    regex: /\S/, // any non-blank text; line breaks allowed (AAMVA ID data)
    errorMessage: "PDF417 payload cannot be empty.",
    defaultPayload: "ID-US-DL:SMITH,JOHN:DOB-19880415:EXP-20290415",
    autoChecksum: false
  },

  controls: [
    {
      id: "scale",
      type: "slider",
      label: "Scale Factor",
      min: 1,
      max: 5,
      default: 3
    },
    {
      id: "columns",
      type: "slider",
      label: "Data Columns (0 = Auto)",
      min: 0,
      max: 10,
      default: 0
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

    const renderOpts = {
      bcid: "pdf417",
      text: payload,
      scale: options.scale || 3,
      paddingwidth: options.padding || 10,
      paddingheight: options.padding || 10
    };

    if (options.columns && Number(options.columns) > 0) {
      renderOpts.columns = Number(options.columns);
    }

    return engineUtils.renderBwip(targets.canvas, renderOpts);
  }
};
