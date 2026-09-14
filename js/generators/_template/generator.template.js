/**
 * Standard Code Generator Plugin Template
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Follow this template to add any new code standard in under 30 minutes!
 */

export default {
  // 1. Unique Identifier & Metadata
  id: "template-code",
  name: "Template Code Name",
  category: "retail", // "2d" | "retail" | "logistics" | "postal"
  description: "Detailed description of the barcode symbology and where it is standardly used.",
  
  // 2. Input Validation Schema
  schema: {
    inputType: "text", // "text" | "number" | "textarea"
    placeholder: "e.g. 1234567890",
    regex: /^[0-9]+$/,
    errorMessage: "Input must contain only numbers.",
    defaultPayload: "1234567890",
    autoChecksum: false // Set to true if an automatic check-digit routine applies
  },

  // 3. Dynamic UI Controls to display in the options panel
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

  // 4. Pure Rendering Function
  // targets: { canvas: HTMLCanvasElement, container: HTMLElement }
  // payload: string
  // options: key-value object of current control values
  // engineUtils: helper methods (renderBwip, renderQRCode, etc.)
  async render(targets, payload, options, engineUtils) {
    // For 1D and standard 2D, invoke bwip-js
    return engineUtils.renderBwip(targets.canvas, {
      bcid: "code128", // Symbology identifier in bwip-js
      text: payload,
      scale: options.scale || 3,
      height: options.height || 35,
      includetext: options.includetext !== false,
      textxalign: "center",
      guardwhitespace: true
    });
  }
};
