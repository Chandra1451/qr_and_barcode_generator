/**
 * Barcode & QR Scanner (barcode-scanner.html)
 * Universal QR, Barcode & Code Generator Suite
 *
 * Reads QR codes and barcodes from an uploaded/pasted/dropped image or the device camera,
 * entirely in the visitor's browser. Nothing is uploaded: the browser decodes the image,
 * and only raw pixels (ImageData) are handed to the self-hosted zxing-wasm reader.
 *
 * Security notes:
 *  - Decoded text is untrusted. It is only ever written with textContent, never innerHTML.
 *  - Only http(s) links get an "Open" button, shown with their real hostname and opened
 *    with rel="noopener noreferrer". javascript:, data:, file: etc. are never linkable.
 *  - Large images are downscaled before decoding so a huge file can't freeze the tab.
 *  - "Create in Studio" passes the text through sessionStorage (same tab, same origin),
 *    never in the URL, so it can't end up in server logs or analytics page URLs.
 */

const VENDOR_DIR = 'js/vendor/zxing-wasm-2.2.4/';
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 2400; // px; larger images are scaled down before decoding
const MAX_PIXELS = 100e6; // a small file can still unpack into a huge bitmap ("decompression bomb")
const CAMERA_MAX_SIDE = 1280;
const CAMERA_INTERVAL_MS = 250;
export const HANDOFF_KEY = 'ucm_scan_handoff';

const READER_OPTIONS = {
  formats: [],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  maxNumberOfSymbols: 8
};

const FORMAT_NAMES = {
  QRCode: 'QR Code', MicroQRCode: 'Micro QR Code', rMQRCode: 'rMQR Code',
  DataMatrix: 'Data Matrix', Aztec: 'Aztec Code', PDF417: 'PDF417', MaxiCode: 'MaxiCode',
  Code128: 'Code 128', Code39: 'Code 39', Code93: 'Code 93', Codabar: 'Codabar',
  'EAN-13': 'EAN-13', 'EAN-8': 'EAN-8', 'UPC-A': 'UPC-A', 'UPC-E': 'UPC-E', ITF: 'ITF (Interleaved 2 of 5)',
  DataBar: 'GS1 DataBar', DataBarExpanded: 'GS1 DataBar Expanded', DataBarLimited: 'GS1 DataBar Limited',
  DXFilmEdge: 'DX Film Edge'
};

/** Which Studio generator can recreate a decoded code (null = none). */
export function studioGeneratorFor(format, text) {
  switch (format) {
    case 'QRCode':
    case 'MicroQRCode':
    case 'rMQRCode':
      return 'qr-code';
    case 'DataMatrix': return 'data-matrix';
    case 'Aztec': return 'aztec';
    case 'PDF417': return 'pdf417';
    case 'Code128': return 'code-128';
    case 'Code39': return 'code-39';
    case 'EAN-13': return /^97[89]\d{10}$/.test(text) ? 'isbn' : 'ean-13';
    case 'UPC-A': return 'upc-a';
    case 'ITF': return /^\d{14}$/.test(text) ? 'itf-14' : null;
    default: return null;
  }
}

/** A short, human description of what the text is (e.g. "Website link"). */
export function describeContent(text) {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return 'Website link';
  if (/^WIFI:/i.test(t)) return 'Wi-Fi network';
  if (/^BEGIN:VCARD/i.test(t)) return 'Contact card (vCard)';
  if (/^MECARD:/i.test(t)) return 'Contact card (MeCard)';
  if (/^BEGIN:VCALENDAR|^BEGIN:VEVENT/i.test(t)) return 'Calendar event';
  if (/^mailto:/i.test(t)) return 'Email';
  if (/^tel:/i.test(t)) return 'Phone number';
  if (/^(smsto|sms):/i.test(t)) return 'Text message (SMS)';
  if (/^geo:/i.test(t)) return 'Map location';
  if (/^upi:\/\//i.test(t)) return 'UPI payment request';
  if (/^(bitcoin|ethereum|litecoin|solana):/i.test(t)) return 'Crypto payment request';
  if (/^\d+$/.test(t)) return 'Number';
  return 'Text';
}

/** Returns a URL object only for plain http(s) links; everything else is not linkable. */
export function safeHttpUrl(text) {
  const t = text.trim();
  if (!/^https?:\/\//i.test(t) || /\s/.test(t)) return null;
  try {
    const url = new URL(t);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ decoder */

let decoderPromise = null;

function loadDecoder() {
  if (decoderPromise) return decoderPromise;
  decoderPromise = new Promise((resolve, reject) => {
    if (window.ZXingWASM) return resolve(window.ZXingWASM);
    const script = document.createElement('script');
    script.src = VENDOR_DIR + 'zxing-reader.iife.js';
    script.async = true;
    script.onload = () => (window.ZXingWASM ? resolve(window.ZXingWASM) : reject(new Error('Reader did not initialise')));
    script.onerror = () => reject(new Error('Could not load the reader'));
    document.head.appendChild(script);
  }).then(async (zx) => {
    // Load the .wasm from this site, never from the library's default CDN.
    const wasmUrl = new URL(VENDOR_DIR + 'zxing_reader.wasm', document.baseURI).href;
    await zx.prepareZXingModule({
      overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
      fireImmediately: true
    });
    return zx;
  }).catch((err) => {
    decoderPromise = null; // allow a retry
    throw err;
  });
  return decoderPromise;
}

async function decodeImageData(imageData, options = READER_OPTIONS) {
  const zx = await loadDecoder();
  const results = await zx.readBarcodes(imageData, options);
  // Same symbol can be reported twice (e.g. rotated pass); keep one of each.
  const seen = new Set();
  return results.filter((r) => {
    if (!r.isValid) return false;
    const key = r.format + '\u0000' + r.text;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Draw an image source into a canvas no larger than maxSide and return its pixels. */
function toImageData(source, width, height, maxSide, scaleUp = 1) {
  let scale = Math.min(1, maxSide / Math.max(width, height)) * scaleUp;
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // White backing so transparent PNG/SVG codes (dark modules on nothing) still read.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = scaleUp <= 1;
  ctx.drawImage(source, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

async function fileToDrawable(file) {
  if (typeof createImageBitmap === 'function' && file.type !== 'image/svg+xml') {
    try {
      const bmp = await createImageBitmap(file);
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch { /* fall back to <img> below */ }
  }
  // <img> decoding: an SVG loaded this way can't run scripts or fetch anything.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const width = img.naturalWidth || 1024;
    const height = img.naturalHeight || 1024;
    return { source: img, width, height, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ------------------------------------------------------------------ UI */

class ScannerPage {
  constructor(root) {
    this.root = root;
    this.dom = {
      drop: root.querySelector('#scan-drop'),
      file: root.querySelector('#scan-file'),
      cameraBtn: root.querySelector('#scan-camera-btn'),
      cameraStop: root.querySelector('#scan-camera-stop'),
      cameraBox: root.querySelector('#scan-camera-box'),
      video: root.querySelector('#scan-video'),
      status: root.querySelector('#scan-status'),
      results: root.querySelector('#scan-results'),
      preview: root.querySelector('#scan-preview')
    };
    this.stream = null;
    this.cameraTimer = null;
    this.previewUrl = null;
    this.bind();
  }

  bind() {
    const { drop, file, cameraBtn, cameraStop } = this.dom;

    file.addEventListener('change', () => {
      if (file.files && file.files[0]) this.scanFile(file.files[0]);
      file.value = '';
    });

    ['dragenter', 'dragover'].forEach((type) => drop.addEventListener(type, (e) => {
      e.preventDefault();
      drop.classList.add('is-dragover');
    }));
    ['dragleave', 'drop'].forEach((type) => drop.addEventListener(type, () => drop.classList.remove('is-dragover')));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith('image/'));
      if (f) this.scanFile(f);
      else this.setStatus('Please drop an image file (PNG, JPG, WebP, GIF, BMP or SVG).', 'error');
    });

    document.addEventListener('paste', (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.kind === 'file' && i.type.startsWith('image/'));
      if (!item) return;
      e.preventDefault();
      this.scanFile(item.getAsFile());
    });

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function' || !window.isSecureContext) {
      cameraBtn.disabled = true;
      cameraBtn.title = 'Camera scanning needs a browser with camera support over HTTPS.';
    }
    cameraBtn.addEventListener('click', () => this.startCamera());
    cameraStop.addEventListener('click', () => this.stopCamera());

    // Never leave the camera running in the background.
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.stopCamera(); });
    window.addEventListener('pagehide', () => this.stopCamera());

    // Warm the decoder once the page is idle so the first scan feels instant.
    const warm = () => loadDecoder().catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
    else setTimeout(warm, 1500);
  }

  setStatus(message, kind = 'info') {
    this.dom.status.textContent = message;
    this.dom.status.dataset.kind = kind;
  }

  showPreview(file) {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
    const { preview } = this.dom;
    if (!file) {
      preview.hidden = true;
      preview.removeAttribute('src');
      return;
    }
    this.previewUrl = URL.createObjectURL(file);
    preview.src = this.previewUrl;
    preview.hidden = false;
  }

  async scanFile(file) {
    this.stopCamera();
    if (!file || !file.type.startsWith('image/')) {
      this.setStatus('That file is not an image. Choose a PNG, JPG, WebP, GIF, BMP or SVG.', 'error');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.setStatus('That image is larger than 25 MB. Please use a smaller photo or screenshot.', 'error');
      return;
    }
    this.showPreview(file);
    this.clearResults();
    this.setStatus('Reading the image…', 'busy');

    let drawable;
    try {
      drawable = await fileToDrawable(file);
    } catch {
      this.setStatus('This image could not be opened. Try a PNG or JPG screenshot.', 'error');
      return;
    }
    if (drawable.width * drawable.height > MAX_PIXELS) {
      drawable.close();
      this.setStatus('That image is too large to scan (over 100 megapixels). Please use a smaller photo or screenshot.', 'error');
      return;
    }
    try {
      let results = await decodeImageData(toImageData(drawable.source, drawable.width, drawable.height, MAX_SIDE));
      // Small or tightly-cropped codes read better when enlarged.
      if (!results.length && Math.max(drawable.width, drawable.height) < 800) {
        results = await decodeImageData(toImageData(drawable.source, drawable.width, drawable.height, MAX_SIDE, 2));
      }
      this.showResults(results);
    } catch (err) {
      console.error('[Scanner]', err);
      this.setStatus('The reader could not start. Check your connection and reload the page.', 'error');
    } finally {
      drawable.close();
    }
  }

  async startCamera() {
    if (this.stream) return;
    this.clearResults();
    this.showPreview(null);
    this.setStatus('Asking for camera permission…', 'busy');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
    } catch (err) {
      this.stream = null;
      const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      this.setStatus(denied
        ? 'Camera access was blocked. Allow the camera in your browser settings, or upload a photo instead.'
        : 'No camera could be started on this device. You can upload a photo instead.', 'error');
      return;
    }
    const { video, cameraBox, cameraBtn } = this.dom;
    video.srcObject = this.stream;
    cameraBox.hidden = false;
    cameraBtn.hidden = true;
    try { await video.play(); } catch { /* autoplay of muted inline video is allowed; ignore */ }
    this.setStatus('Point the camera at a QR code or barcode…', 'busy');
    loadDecoder().catch(() => this.setStatus('The reader could not start. Check your connection and reload the page.', 'error'));
    this.scheduleFrame();
  }

  scheduleFrame() {
    this.cameraTimer = setTimeout(() => this.scanFrame(), CAMERA_INTERVAL_MS);
  }

  async scanFrame() {
    const { video } = this.dom;
    if (!this.stream) return;
    if (video.readyState >= 2 && video.videoWidth) {
      try {
        const data = toImageData(video, video.videoWidth, video.videoHeight, CAMERA_MAX_SIDE);
        const results = await decodeImageData(data, { ...READER_OPTIONS, maxNumberOfSymbols: 4 });
        if (!this.stream) return;
        if (results.length) {
          this.stopCamera();
          this.showResults(results);
          return;
        }
      } catch (err) {
        console.error('[Scanner]', err);
      }
    }
    if (this.stream) this.scheduleFrame();
  }

  stopCamera() {
    clearTimeout(this.cameraTimer);
    this.cameraTimer = null;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    const { video, cameraBox, cameraBtn } = this.dom;
    video.srcObject = null;
    cameraBox.hidden = true;
    cameraBtn.hidden = false;
  }

  clearResults() {
    this.dom.results.replaceChildren();
  }

  showResults(results) {
    this.clearResults();
    if (!results.length) {
      this.setStatus('No QR code or barcode found. Try a sharper, well-lit photo with the whole code in view.', 'error');
      return;
    }
    this.setStatus(results.length === 1 ? 'Found 1 code.' : `Found ${results.length} codes.`, 'ok');
    results.forEach((r, i) => this.dom.results.appendChild(this.renderResult(r, i)));
    // On phones the result lands below the fold; bring it into view.
    const box = this.dom.status.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      this.dom.status.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  renderResult(result, index) {
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined) n.textContent = text;
      return n;
    };
    const text = result.text;
    const card = el('article', 'scan-result');
    card.setAttribute('aria-label', `Result ${index + 1}`);

    const head = el('div', 'scan-result-head');
    head.appendChild(el('span', 'scan-chip', FORMAT_NAMES[result.format] || result.format));
    head.appendChild(el('span', 'scan-chip scan-chip-muted', describeContent(text)));
    card.appendChild(head);

    const body = el('pre', 'scan-result-text', text);
    body.tabIndex = 0;
    card.appendChild(body);

    const actions = el('div', 'scan-result-actions');

    const copyBtn = el('button', 'btn btn-ink btn-sm', 'Copy text');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(body);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = 'Selected: press Ctrl+C';
      }
      setTimeout(() => { copyBtn.textContent = 'Copy text'; }, 2000);
    });
    actions.appendChild(copyBtn);

    const url = safeHttpUrl(text);
    if (url) {
      const open = el('a', 'btn btn-ink btn-sm', `Open ${url.hostname}`);
      open.href = url.href;
      open.target = '_blank';
      open.rel = 'noopener noreferrer nofollow';
      actions.appendChild(open);
    }

    const genId = studioGeneratorFor(result.format, text);
    if (genId) {
      const edit = el('button', 'btn btn-laser btn-sm', 'Create a copy in Studio');
      edit.type = 'button';
      edit.addEventListener('click', () => {
        try {
          sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ generatorId: genId, text, at: Date.now() }));
        } catch {
          this.setStatus('Your browser blocked storage, so the text can’t be passed to the Studio. Copy it instead.', 'error');
          return;
        }
        window.location.href = 'index.html?from=scanner';
      });
      actions.appendChild(edit);
    }
    card.appendChild(actions);

    if (url) {
      const warn = el('p', 'scan-result-warning');
      warn.textContent = `This code links to ${url.hostname}. Only open it if you trust where the code came from: fake QR codes are a common phishing trick.`;
      card.appendChild(warn);
    }
    return card;
  }
}

const root = document.getElementById('scanner-app');
if (root) new ScannerPage(root);
