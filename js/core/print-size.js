/**
 * Real-world print size for barcode downloads.
 *
 * bwip-js draws every module as 1 point × scale pixels, and takes bar height in millimetres
 * assuming that 1-point module. A generator can declare a different real module width
 * (`moduleMm`, the GS1 "X-dimension"); downloads then carry that size:
 *   - PNG: a pHYs (DPI) chunk, so the image opens and prints at real size;
 *   - SVG: width/height in millimetres;
 *   - EPS: points per drawing unit.
 * Bar height stays true in millimetres because the generator passes bwipHeightMm() to bwip-js.
 * QR codes have no standard print size and are left alone.
 *
 * Sizes (GS1 General Specifications, via GS1 Sweden's size guide, checked 2026-10-11):
 * EAN-13 / UPC-A X 0.264–0.660 mm, recommended 0.330; ITF-14 X min/recommended 0.495 mm.
 */

/** One PostScript point in millimetres (bwip-js's module width at scale 1). */
export const POINT_MM = 25.4 / 72;

export function moduleMmOf(generator) {
  return Number(generator?.moduleMm) || POINT_MM;
}

/** Bar height to give bwip-js so the printed bars are `mm` tall at the generator's module width. */
export function bwipHeightMm(mm, moduleMm) {
  return (Number(mm) * POINT_MM) / (Number(moduleMm) || POINT_MM);
}

/** Pixels per inch of a bwip-js raster drawn at `scale` (1 module = `scale` px = moduleMm). */
export function pngDpiFor(generator, scale) {
  return (25.4 * (Number(scale) || 3)) / moduleMmOf(generator);
}

/** EPS points per SVG drawing unit (the SVG is drawn at `scale` units per module). */
export function epsPtPerUnit(generator, scale) {
  return moduleMmOf(generator) / POINT_MM / (Number(scale) || 3);
}

/** Adds width/height in millimetres to a bwip-js SVG so design programs import it at real size. */
export function svgWithPrintSize(svg, generator, scale) {
  const vb = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/.exec(svg);
  const start = svg.indexOf('<svg');
  if (!vb || start < 0) return svg;
  const mmPerUnit = moduleMmOf(generator) / (Number(scale) || 3);
  const w = +(Number(vb[1]) * mmPerUnit).toFixed(3);
  const h = +(Number(vb[2]) * mmPerUnit).toFixed(3);
  const end = svg.indexOf('>', start);
  const tag = svg.slice(start, end).replace(/\s(width|height)="[^"]*"/g, '');
  return svg.slice(0, start) + `${tag} width="${w}mm" height="${h}mm"` + svg.slice(end);
}

/* ------------------------------------------------------------------ PNG DPI */

let crcTable = null;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Returns PNG bytes with a pHYs chunk for `dpi` (any existing pHYs is replaced). */
export function pngBytesWithDpi(bytes, dpi) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || sig.some((b, i) => bytes[i] !== b)) return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  let o = 8;
  while (o + 12 <= bytes.length) {
    const len = view.getUint32(o);
    const type = String.fromCharCode(bytes[o + 4], bytes[o + 5], bytes[o + 6], bytes[o + 7]);
    if (type !== 'pHYs') chunks.push({ type, start: o, end: o + 12 + len });
    o += 12 + len;
    if (type === 'IEND') break;
  }
  if (!chunks.length || chunks[0].type !== 'IHDR') return bytes;

  const ppm = Math.round(Number(dpi) / 0.0254); // pixels per metre
  const phys = new Uint8Array(21);
  const pv = new DataView(phys.buffer);
  pv.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  pv.setUint32(8, ppm);
  pv.setUint32(12, ppm);
  phys[16] = 1; // unit: metre
  pv.setUint32(17, crc32(phys.subarray(4, 17)));

  const parts = [bytes.subarray(0, 8), bytes.subarray(chunks[0].start, chunks[0].end), phys];
  for (const c of chunks.slice(1)) parts.push(bytes.subarray(c.start, c.end));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** data:image/png;base64 URL → same image with a DPI tag. */
export function pngDataUrlWithDpi(dataUrl, dpi) {
  const base64 = dataUrl.split(',')[1] || '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const out = pngBytesWithDpi(bytes, dpi);
  let s = '';
  for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
  return 'data:image/png;base64,' + btoa(s);
}

/** PNG Blob → same image with a DPI tag. */
export async function pngBlobWithDpi(blob, dpi) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return new Blob([pngBytesWithDpi(bytes, dpi)], { type: 'image/png' });
}
