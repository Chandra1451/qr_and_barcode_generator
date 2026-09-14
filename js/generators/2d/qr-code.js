/**
 * QR Code (Quick Response) Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by qr-code-styling for high-aesthetic custom geometry and styling.
 */

export default {
  id: "qr-code",
  name: "QR Code (Stylized & Standard)",
  category: "2d",
  description: "Standard 2D Quick Response matrix code. Supports high-density URLs, text, Wi-Fi configurations, vCards, and custom styling geometries.",

  schema: {
    inputType: "textarea",
    placeholder: "Enter URL, text, or payload (e.g. https://yourwebsite.com)",
    regex: /^.+$/,
    errorMessage: "QR Code payload cannot be empty.",
    defaultPayload: "https://github.com",
    autoChecksum: false
  },

  controls: [
    {
      id: "errorCorrectionLevel",
      type: "select",
      label: "Error Correction Level",
      options: [
        { label: "Low (7% recovery)", value: "L" },
        { label: "Medium (15% recovery)", value: "M" },
        { label: "Quartile (25% recovery)", value: "Q" },
        { label: "High (30% recovery - Recommended with logo)", value: "H" }
      ],
      default: "M"
    },
    {
      id: "dotsType",
      type: "select",
      label: "Dot Geometry Style",
      options: [
        { label: "Rounded Smooth", value: "rounded" },
        { label: "Circular Dots", value: "dots" },
        { label: "Classy Modern", value: "classy" },
        { label: "Classy Rounded", value: "classy-rounded" },
        { label: "Standard Square", value: "square" },
        { label: "Extra Rounded", value: "extra-rounded" }
      ],
      default: "rounded"
    },
    {
      id: "dotsColor",
      type: "color",
      label: "Pattern Color (Solid)",
      default: "#0f172a"
    },
    {
      id: "gradientEnabled",
      type: "toggle",
      label: "Use Two-Color Gradient",
      default: false
    },
    {
      id: "gradientColor1",
      type: "color",
      label: "Gradient Color 1",
      default: "#06b6d4"
    },
    {
      id: "gradientColor2",
      type: "color",
      label: "Gradient Color 2",
      default: "#3b82f6"
    },
    {
      id: "gradientRotation",
      type: "slider",
      label: "Gradient Angle",
      min: 0,
      max: 360,
      default: 45,
      unit: "°"
    },
    {
      id: "cornerType",
      type: "select",
      label: "Corner Eye Frame",
      options: [
        { label: "Extra Rounded", value: "extra-rounded" },
        { label: "Smooth Square", value: "square" },
        { label: "Circular Dot", value: "dot" }
      ],
      default: "extra-rounded"
    },
    {
      id: "cornerColor",
      type: "color",
      label: "Eye Frame Color",
      default: "#0f172a"
    },
    {
      id: "cornerDotType",
      type: "select",
      label: "Corner Eye Pupil",
      options: [
        { label: "Circular Dot", value: "dot" },
        { label: "Square Dot", value: "square" }
      ],
      default: "dot"
    },
    {
      id: "cornerDotColor",
      type: "color",
      label: "Eye Pupil Color",
      default: "#06b6d4"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#ffffff"
    },
    {
      id: "transparentBg",
      type: "toggle",
      label: "Transparent Background",
      default: false
    }
  ],

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'none';
    if (targets.container) targets.container.style.display = 'flex';

    return engineUtils.renderQRCode(targets.container, {
      data: payload,
      errorCorrectionLevel: options.errorCorrectionLevel || "M",
      dotsColor: options.dotsColor || "#0f172a",
      dotsType: options.dotsType || "rounded",
      gradientEnabled: Boolean(options.gradientEnabled),
      gradientType: options.gradientType || "linear",
      gradientColor1: options.gradientColor1 || "#06b6d4",
      gradientColor2: options.gradientColor2 || "#3b82f6",
      gradientRotation: options.gradientRotation !== undefined ? options.gradientRotation : 45,
      cornerType: options.cornerType || "extra-rounded",
      cornerColor: options.cornerColor || "#0f172a",
      cornerDotType: options.cornerDotType || "dot",
      cornerDotColor: options.cornerDotColor || "#06b6d4",
      backgroundColor: options.backgroundColor || "#ffffff",
      transparentBg: Boolean(options.transparentBg),
      image: options.image || "",
      imageSize: options.imageSize || 0.28,
      imageMargin: options.imageMargin !== undefined ? options.imageMargin : 4
    });
  }
};
