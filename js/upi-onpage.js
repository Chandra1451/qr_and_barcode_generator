// UPI landing tool (easy mode for shopkeepers, UCM-IN-03): reuse the studio's UPI link builder,
// QR renderer and download helper. Text from the form is only ever written with textContent.
import { QR_WIZARDS } from './wizards/qr-wizards.js?v=3.29';
import { engine } from './core/engine.js?v=3.29';
import { downloadBlob } from './export/image-exporter.js?v=3.29';
import { loadJsPdf } from './core/dynamic-loader.js?v=3.29';

const $ = (id) => document.getElementById(id);
const vpaInput = $('upi-vpa');
const nameInput = $('upi-name');
const amountInput = $('upi-amount');
const preview = $('upi-preview');
const status = $('upi-status');
const downloadButton = $('upi-download');
const posterButton = $('upi-poster');
const shareButton = $('upi-share');
const sizeSelect = $('upi-poster-size');
const actions = [downloadButton, posterButton, shareButton];

// Plain black-on-white squares scan most reliably on printed counter cards.
const STYLE = Object.freeze({
  dotsType: 'square', dotsColor: '#000000', cornerType: 'square', cornerColor: '#000000',
  cornerDotType: 'square', cornerDotColor: '#000000', backgroundColor: '#ffffff',
  padding: 16, errorCorrectionLevel: 'M',
});
const VPA = /^[a-z0-9._-]{2,}@[a-z][a-z0-9._-]+$/i;
const AMOUNT = /^\d{1,7}(\.\d{1,2})?$/;
const POSTER = Object.freeze({ a5: { mm: [148, 210], px: [1748, 2480] }, a4: { mm: [210, 297], px: [2480, 3508] } });
const HINDI = 'किसी भी UPI ऐप से स्कैन करके भुगतान करें';
const SANS = 'system-ui, "Segoe UI", Roboto, Arial, sans-serif';
const DEVANAGARI = '"Noto Sans Devanagari", "Nirmala UI", Mangal, system-ui, sans-serif';

let revision = 0;
let ready = null; // { link, vpa, name, amount }
let timer = 0;

const setButtons = (enabled) => actions.forEach((b) => { b.disabled = !enabled; });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'shop';

function showHint(message) {
  const p = document.createElement('p');
  p.textContent = message;
  preview.replaceChildren(p);
}

/** Returns { error } or { vpa, name, amount }. Messages are plain and say what to do. */
function readForm() {
  const vpa = vpaInput.value.trim();
  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  const amount = amountInput.value.trim().replace(/^₹\s*/, '');
  if (!vpa && !name) return { error: 'Enter your UPI ID and shop name to begin.', quiet: true };
  if (!vpa) return { error: 'Enter your UPI ID. You can find it in your UPI app\'s profile.' };
  if (/\s/.test(vpa)) return { error: 'Your UPI ID should not have spaces in it.', field: vpaInput };
  if (!VPA.test(vpa)) return { error: 'That does not look like a UPI ID. It should look like yourname@bank, with one @.', field: vpaInput };
  if (!name) return { error: 'Enter your shop name. Customers see it when they pay.', field: nameInput };
  if (name.length > 50) return { error: 'Please keep the shop name under 50 letters.', field: nameInput };
  if (amount && (!AMOUNT.test(amount) || Number(amount) <= 0)) return { error: 'Enter the amount as a number, like 150 or 99.50, or leave it empty.', field: amountInput };
  return { vpa, name, amount };
}

async function update() {
  const current = ++revision;
  ready = null;
  setButtons(false);
  [vpaInput, nameInput, amountInput].forEach((i) => i.removeAttribute('aria-invalid'));
  const form = readForm();
  if (form.error) {
    if (form.field) form.field.setAttribute('aria-invalid', 'true');
    status.textContent = form.error;
    showHint('Your QR code will appear here.');
    return;
  }
  const link = QR_WIZARDS.upi.compile({ vpa: form.vpa, payeeName: form.name, amount: form.amount, note: '' });
  status.textContent = 'Making your QR code…';
  preview.setAttribute('aria-busy', 'true');
  try {
    const blob = await engine.renderStyledQr(STYLE, { data: link, scale: 1, format: 'png' });
    if (current !== revision) return;
    const img = new Image();
    img.alt = `UPI QR code for ${form.name}`;
    img.src = URL.createObjectURL(blob);
    img.addEventListener('load', () => URL.revokeObjectURL(img.src), { once: true });
    preview.replaceChildren(img);
    ready = { link, ...form };
    status.textContent = `Ready. Customers will see the name "${form.name}"${form.amount ? ` and the amount ₹${form.amount}` : ''}. Check it with your own phone before printing.`;
    setButtons(true);
  } catch {
    if (current !== revision) return;
    showHint('Preview unavailable.');
    status.textContent = 'Could not make the QR code. Check your internet connection and try again, or open the full studio.';
  } finally {
    if (current === revision) preview.removeAttribute('aria-busy');
  }
}

function scheduleUpdate() {
  clearTimeout(timer);
  timer = setTimeout(() => { void update(); }, 250);
}

async function qrImage(scale) {
  const blob = await engine.renderStyledQr(STYLE, { data: ready.link, scale, format: 'png' });
  const img = new Image();
  const url = URL.createObjectURL(blob);
  try { img.src = url; await img.decode(); } finally { URL.revokeObjectURL(url); }
  return img;
}

/** Largest font size (px) at which `text` fits in `maxWidth`, starting from `size`. */
function fitFont(ctx, text, size, weight, family, maxWidth, min = 24) {
  let s = size;
  for (; s > min; s -= 4) {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return s;
}

/** Draws the counter poster at 300 DPI on a canvas; the browser shapes the Hindi line correctly. */
async function drawPoster(sizeKey) {
  const { px: [w, h] } = POSTER[sizeKey];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const inner = w * 0.86;

  // Measure first so the whole block can be centred vertically on the page.
  const nameSize = fitFont(ctx, ready.name, Math.round(w * 0.085), 800, SANS, inner);
  const qrSize = Math.round(w * 0.72);
  const amountSize = Math.round(w * 0.06);
  const lineSize = fitFont(ctx, 'Scan & pay with any UPI app', Math.round(w * 0.05), 700, SANS, inner);
  const hindiSize = fitFont(ctx, HINDI, Math.round(w * 0.045), 700, DEVANAGARI, inner);
  const idSize = fitFont(ctx, `UPI ID: ${ready.vpa}`, Math.round(w * 0.04), 600, SANS, inner);
  const blockHeight = nameSize + nameSize * 0.6 + qrSize + w * 0.07 + (ready.amount ? w * 0.07 : 0)
    + lineSize * 1.5 + hindiSize * 1.8 + idSize;
  let y = Math.max(h * 0.06, (h - blockHeight) / 2) + nameSize;

  ctx.font = `800 ${nameSize}px ${SANS}`;
  ctx.fillText(ready.name, w / 2, y);
  y += nameSize * 0.6;

  const img = await qrImage(Math.ceil(qrSize / 320));
  ctx.drawImage(img, (w - qrSize) / 2, y, qrSize, qrSize);
  y += qrSize + w * 0.07;

  if (ready.amount) {
    ctx.font = `800 ${amountSize}px ${SANS}`;
    ctx.fillText(`Amount: ₹${ready.amount}`, w / 2, y);
    y += w * 0.07;
  }
  ctx.font = `700 ${lineSize}px ${SANS}`;
  ctx.fillText('Scan & pay with any UPI app', w / 2, y);
  y += lineSize * 1.5;
  ctx.font = `700 ${hindiSize}px ${DEVANAGARI}`;
  ctx.fillText(HINDI, w / 2, y);
  y += hindiSize * 1.8;
  ctx.font = `600 ${idSize}px ${SANS}`;
  ctx.fillText(`UPI ID: ${ready.vpa}`, w / 2, y);
  return canvas;
}

function busy(message, fn) {
  return async () => {
    if (!ready) return;
    const before = status.textContent;
    setButtons(false);
    status.textContent = message;
    try {
      await fn();
      status.textContent = before;
    } catch (err) {
      if (err && err.name === 'AbortError') status.textContent = before; // share sheet closed
      else status.textContent = 'Something went wrong. Please try again, or open the full studio.';
    } finally {
      if (ready) setButtons(true);
    }
  };
}

downloadButton.addEventListener('click', busy('Preparing your QR image…', async () => {
  const blob = await engine.renderStyledQr(STYLE, { data: ready.link, scale: 4, format: 'png' });
  downloadBlob(blob, `upi-qr-${slug(ready.name)}.png`);
}));

posterButton.addEventListener('click', busy('Preparing your poster…', async () => {
  const sizeKey = POSTER[sizeSelect.value] ? sizeSelect.value : 'a5';
  const canvas = await drawPoster(sizeKey);
  const jsPDF = await loadJsPdf();
  const [wmm, hmm] = POSTER[sizeKey].mm;
  const doc = new jsPDF({ unit: 'mm', format: sizeKey, orientation: 'portrait', compress: true });
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, wmm, hmm);
  downloadBlob(doc.output('blob'), `upi-poster-${slug(ready.name)}-${sizeKey}.pdf`);
}));

shareButton.addEventListener('click', busy('Opening share…', async () => {
  const blob = await engine.renderStyledQr(STYLE, { data: ready.link, scale: 4, format: 'png' });
  const file = new File([blob], `upi-qr-${slug(ready.name)}.png`, { type: 'image/png' });
  await navigator.share({ files: [file], title: `${ready.name} UPI QR code`, text: `Pay ${ready.name} with any UPI app` });
}));

// Show "Share" only where the phone can share image files.
try {
  const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' });
  shareButton.hidden = !(navigator.canShare && navigator.canShare({ files: [probe] }));
} catch {
  shareButton.hidden = true;
}

[vpaInput, nameInput, amountInput].forEach((input) => input.addEventListener('input', scheduleUpdate));
$('upi-form').addEventListener('submit', (event) => { event.preventDefault(); void update(); });
$('upi-startup').hidden = true;
void update();
