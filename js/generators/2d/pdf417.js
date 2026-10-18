/**
 * PDF417 Stacked 2D Barcode Generator Plugin
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Powered by bwip-js (bcid: pdf417). Suitable for multi-line text and structured records.
 */

export default {
  id: "pdf417",
  name: "PDF417 (Stacked 2D)",
  category: "2d",
  quietZone: "2 modules on every side",
  description: "Stacked linear 2D barcode format for multi-line text and structured records. This tool encodes the text you provide; it does not create application-specific data formats.",

  schema: {
    inputType: "textarea",
    placeholder: "e.g. ORDER:10482\nBATCH:2026-10\nZONE:A3",
    regex: /\S/, // any non-blank text; line breaks are preserved
    errorMessage: "PDF417 payload cannot be empty.",
    defaultPayload: "ORDER:10482\nBATCH:2026-10\nZONE:A3",
    autoChecksum: false
  },

  controls: [
    {
      id: "scale",
      type: "slider",
      label: "Scale / Resolution",
      min: 1,
      max: 5,
      default: 3
    },
    {
      // 0 = Auto. The studio narrows the range per payload via controlHints() below.
      id: "columns",
      type: "slider",
      label: "Data Columns",
      min: 0,
      max: 30,
      default: 0,
      autoValue: 0
    },
    {
      id: "padding",
      type: "slider",
      label: "Quiet Zone Padding",
      min: 0,
      max: 40,
      default: 10,
      unit: "x" // modules (bar widths): bwip-js padding is in points = modules
    }
  ],

  /**
   * Useful column range for this payload, measured with bwip-js (size only, no drawing).
   * Fewer columns = more rows, so 1 column turns a short payload into a tall block.
   *  - min: fewest columns that keep the symbol at least as wide as it is tall
   *  - max: columns beyond this add width without removing any rows
   *  - auto: the column count bwip-js picks when none is given
   * Cached per payload; returns null if bwip-js isn't loaded or the payload can't encode at all.
   */
  columnLayout(payload, bwip) {
    if (!bwip || typeof bwip.raw !== 'function' || !payload) return null;
    if (this._layoutCache && this._layoutCache.payload === payload) return this._layoutCache.layout;
    const size = (columns) => {
      try {
        const sym = bwip.raw({ bcid: 'pdf417', text: payload, ...(columns ? { columns } : {}) })[0];
        return { w: sym.pixx, h: sym.pixy }; // modules; pixy already includes the 3× row height
      } catch (e) {
        return null; // this count can't hold the data (PDF417 allows 3–90 rows)
      }
    };
    let layout = null;
    const sizes = [];
    for (let c = 1; c <= 30; c++) sizes[c] = size(c);
    const fits = (c) => sizes[c] !== null;
    const widest = sizes[30] || [...sizes].reverse().find(Boolean);
    const auto = size(0);
    if (widest && auto) {
      let min = 30;
      for (let c = 1; c <= 30; c++) { if (fits(c) && sizes[c].h <= sizes[c].w) { min = c; break; } }
      let max = 30;
      for (let c = min; c <= 30; c++) { if (fits(c) && sizes[c].h === widest.h) { max = c; break; } }
      const autoCols = Math.round((auto.w - 69) / 17); // width = 17 × columns + 69 modules
      layout = { min, max: Math.max(max, min), auto: Math.min(Math.max(autoCols, 1), 30) };
    }
    this._layoutCache = { payload, layout };
    return layout;
  },

  /** Slider range and Auto value for the studio (see renderDynamicControls / applyControlHints). */
  controlHints(payload, options, bwip) {
    const layout = this.columnLayout(payload, bwip);
    if (!layout) return null;
    return { columns: { min: layout.min, max: layout.max, autoValue: layout.auto } };
  },

  async render(targets, payload, options, engineUtils) {
    if (targets.canvas) targets.canvas.style.display = 'block';
    if (targets.container) targets.container.style.display = 'none';

    const renderOpts = {
      bcid: "pdf417",
      text: payload,
      scale: options.scale || 3,
      paddingwidth: options.padding !== undefined ? options.padding : 10,
      paddingheight: options.padding !== undefined ? options.padding : 10
    };

    // A manual column count is kept inside the payload's useful range (e.g. an old setting
    // kept while the text got longer), so the code never becomes taller than it is wide and
    // always matches the slider.
    if (options.columns && Number(options.columns) > 0) {
      const layout = this.columnLayout(payload, engineUtils.bwip);
      const wanted = Number(options.columns);
      renderOpts.columns = layout ? Math.min(Math.max(wanted, layout.min), layout.max) : wanted;
    }

    return engineUtils.renderBwip(targets.canvas, renderOpts);
  }
};
