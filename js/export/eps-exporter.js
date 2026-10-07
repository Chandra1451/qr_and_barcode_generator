/**
 * EPS (Encapsulated PostScript) export for barcodes
 * Universal QR, Barcode & Code Generator Suite
 *
 * Converts the vector SVG that bwip-js draws into an EPS file, shape for shape, so print
 * shops and older design software get the same barcode as the SVG download.
 *
 * bwip-js SVG uses only: one background <rect>, and <path> elements with absolute
 * M / L / Q / Z commands (bars as stroked lines, digits and 2D modules as filled shapes,
 * fill-rule="evenodd" for 2D codes and ITF-14 bearer bars). Anything else is rejected
 * rather than silently dropped.
 *
 * Size: bwip-js draws 1 module = 1 point at scale 1, so with ptPerUnit = 1 / scale the
 * EPS keeps the real bar height (millimetres) set in the studio.
 * Colour: pure black and white are written as CMYK (100% K / 0%) so presses print
 * barcodes in one ink instead of a four-colour "rich black"; other colours stay RGB.
 */

const NUM = (n) => {
  const s = (Math.round(n * 1000) / 1000).toFixed(3);
  return s.replace(/\.?0+$/, '') || '0';
};

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
}

/** '#RRGGBB' → PostScript colour operator. */
export function epsColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) throw new Error(`Unsupported colour for EPS: ${hex}`);
  const v = m[1].toUpperCase();
  if (v === '000000') return '0 0 0 1 setcmykcolor';
  if (v === 'FFFFFF') return '0 0 0 0 setcmykcolor';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  return `${NUM(r)} ${NUM(g)} ${NUM(b)} setrgbcolor`;
}

/** SVG path data (absolute M/L/Q/Z) → PostScript path operators. */
export function pathToPs(d) {
  const tokens = d.match(/[MLQZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  const out = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let i = 0;
  const num = () => {
    const v = Number(tokens[i++]);
    if (!Number.isFinite(v)) throw new Error('Malformed SVG path data');
    return v;
  };
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') {
      cx = num(); cy = num(); sx = cx; sy = cy;
      out.push(`${NUM(cx)} ${NUM(cy)} m`);
    } else if (cmd === 'L') {
      cx = num(); cy = num();
      out.push(`${NUM(cx)} ${NUM(cy)} l`);
    } else if (cmd === 'Q') {
      // Quadratic → cubic Bézier: control points at 2/3 of the way to the quadratic control point.
      const qx = num(), qy = num(), x = num(), y = num();
      const c1x = cx + (2 / 3) * (qx - cx), c1y = cy + (2 / 3) * (qy - cy);
      const c2x = x + (2 / 3) * (qx - x), c2y = y + (2 / 3) * (qy - y);
      out.push(`${NUM(c1x)} ${NUM(c1y)} ${NUM(c2x)} ${NUM(c2y)} ${NUM(x)} ${NUM(y)} c`);
      cx = x; cy = y;
    } else if (cmd === 'Z' || cmd === 'z') {
      out.push('z');
      cx = sx; cy = sy;
    } else {
      throw new Error(`Unsupported SVG path command for EPS: ${cmd}`);
    }
  }
  return out;
}

/** Keeps PostScript lines under 255 characters (DSC limit). */
function wrap(ops) {
  const lines = [];
  let line = '';
  for (const op of ops) {
    if (line && line.length + op.length + 1 > 200) {
      lines.push(line);
      line = op;
    } else {
      line = line ? `${line} ${op}` : op;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Plain-ASCII text for a DSC comment line. */
function dscText(s) {
  return String(s || '').replace(/[^\x20-\x7E]/g, '?').slice(0, 120);
}

/**
 * Converts bwip-js SVG to EPS.
 * @param {string} svg - output of bwip-js toSVG()
 * @param {object} opts
 * @param {number} opts.ptPerUnit - points per SVG unit (1 / bwip scale)
 * @param {number} [opts.cornerRadius] - rounded-corner radius in SVG units (as in the SVG export)
 * @param {string} [opts.title]
 * @returns {string}
 */
export function svgToEps(svg, { ptPerUnit = 1, cornerRadius = 0, title = 'Barcode' } = {}) {
  const vb = /viewBox="\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*"/.exec(svg);
  if (!vb) throw new Error('SVG has no viewBox');
  const [vx, vy, vw, vh] = vb.slice(1).map(Number);
  if (vx !== 0 || vy !== 0 || !(vw > 0) || !(vh > 0)) throw new Error('Unexpected SVG viewBox');

  const body = [];
  for (const m of svg.matchAll(/<(\w+)([^>]*)\/?>/g)) {
    const [, tag, rest] = m;
    if (tag === 'svg') continue;
    const a = parseAttrs(rest);
    if (tag === 'rect') {
      if (a.width !== '100%' || a.height !== '100%') throw new Error('Unexpected <rect> in barcode SVG');
      if (a.fill && a.fill !== 'none') body.push(epsColor(a.fill), `0 0 ${NUM(vw)} ${NUM(vh)} rectfill`);
    } else if (tag === 'path') {
      const ops = pathToPs(a.d || '');
      if (!ops.length) continue;
      if (a.fill && a.fill !== 'none') {
        body.push(epsColor(a.fill), 'newpath', ...wrap(ops), a['fill-rule'] === 'evenodd' ? 'eofill' : 'fill');
      }
      if (a.stroke && a.stroke !== 'none') {
        body.push(epsColor(a.stroke), `${NUM(Number(a['stroke-width']) || 1)} setlinewidth`, 'newpath', ...wrap(ops), 'stroke');
      }
    } else {
      throw new Error(`Unsupported SVG element for EPS: <${tag}>`);
    }
  }

  const wPt = vw * ptPerUnit;
  const hPt = vh * ptPerUnit;
  const r = Math.min(Number(cornerRadius) || 0, vw / 2, vh / 2);
  const clip = r > 0
    ? [`newpath ${NUM(r)} 0 m ${NUM(vw)} 0 ${NUM(vw)} ${NUM(vh)} ${NUM(r)} arct ${NUM(vw)} ${NUM(vh)} 0 ${NUM(vh)} ${NUM(r)} arct`,
       `0 ${NUM(vh)} 0 0 ${NUM(r)} arct 0 0 ${NUM(vw)} 0 ${NUM(r)} arct z clip newpath`]
    : [];

  return [
    '%!PS-Adobe-3.0 EPSF-3.0',
    '%%Creator: UniversalCodeMaker.com',
    `%%Title: ${dscText(title)}`,
    `%%CreationDate: ${new Date().toISOString()}`,
    `%%BoundingBox: 0 0 ${Math.ceil(wPt)} ${Math.ceil(hPt)}`,
    `%%HiResBoundingBox: 0 0 ${NUM(wPt)} ${NUM(hPt)}`,
    '%%LanguageLevel: 2',
    '%%DocumentData: Clean7Bit',
    '%%Pages: 1',
    '%%EndComments',
    '%%BeginProlog',
    '/m {moveto} bind def /l {lineto} bind def /c {curveto} bind def /z {closepath} bind def',
    '%%EndProlog',
    '%%Page: 1 1',
    'gsave',
    // SVG units → points, with the y axis flipped (SVG grows down, PostScript grows up).
    `${ptPerUnit.toFixed(8)} ${ptPerUnit.toFixed(8)} scale 0 ${NUM(vh)} translate 1 -1 scale`,
    '0 setlinecap 0 setlinejoin',
    ...clip,
    ...body,
    'grestore',
    'showpage',
    '%%Trailer',
    '%%EOF',
    ''
  ].join('\n');
}
