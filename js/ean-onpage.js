// EAN landing tool: reuse the shared plugin, validation, renderer and exporters.
import generator from './generators/retail/ean-13.js?v=3.27';
import { engine } from './core/engine.js?v=3.27';
import { exportHighResPng, exportVectorSvg } from './export/image-exporter.js?v=3.27';

const form = document.querySelector('#ean-form');
const input = document.querySelector('#ean-number');
const status = document.querySelector('#ean-status');
const preview = document.querySelector('#ean-preview');
const generateButton = document.querySelector('#ean-generate');
const exampleButton = document.querySelector('#ean-example');
const downloads = [...document.querySelectorAll('[data-ean-export]')];
const options = Object.freeze({ scale: 3, height: 22.85, padding: 10, includetext: true, barcolor: '#000000', backgroundcolor: '#ffffff' });
let revision = 0;
let readyPayload = '';
let isExample = false;

function disableDownloads() { downloads.forEach(button => { button.disabled = true; }); }
function clearPreview(message = 'Your barcode will appear here.') {
  const hint = document.createElement('p');
  hint.textContent = message;
  preview.replaceChildren(hint);
}
function changed() {
  revision++;
  readyPayload = '';
  isExample = false;
  input.removeAttribute('aria-invalid');
  disableDownloads();
  clearPreview();
  status.textContent = input.value ? 'Number changed. Generate to check it and update the preview.' : 'Enter a product number to begin.';
  generateButton.disabled = false;
  preview.removeAttribute('aria-busy');
}

async function generate() {
  const current = ++revision;
  const payload = input.value.trim();
  readyPayload = '';
  disableDownloads();
  clearPreview();
  const validation = engine.validate(generator, payload);
  if (!validation.valid) {
    input.setAttribute('aria-invalid', 'true');
    status.textContent = validation.error;
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  generateButton.disabled = true;
  preview.setAttribute('aria-busy', 'true');
  status.textContent = 'Generating your barcode…';
  try {
    // Detached canvas prevents a late render from displaying a superseded number.
    const canvas = document.createElement('canvas');
    await engine.render(generator, payload, options, { canvas });
    if (current !== revision) return;
    const fullNumber = payload.length === 12 ? generator.schema.computeChecksum(payload) : payload;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `EAN-13 barcode: ${fullNumber}`);
    preview.replaceChildren(canvas);
    readyPayload = payload;
    status.textContent = `${isExample ? 'Demonstration only. ' : ''}${fullNumber} — ${payload.length === 12 ? 'last digit calculated' : 'check digit valid'}. Ready to download.`;
    downloads.forEach(button => { button.disabled = false; });
  } catch {
    if (current !== revision) return;
    clearPreview('Preview unavailable.');
    status.textContent = 'Could not generate the barcode. Check your connection and try Generate barcode again, or use the full studio below.';
  } finally {
    if (current === revision) {
      generateButton.disabled = false;
      preview.removeAttribute('aria-busy');
    }
  }
}

input.addEventListener('input', changed);
form.addEventListener('submit', event => { event.preventDefault(); void generate(); });
exampleButton.addEventListener('click', () => {
  input.value = generator.schema.defaultPayload;
  changed();
  isExample = true;
  void generate();
});
downloads.forEach(button => button.addEventListener('click', async () => {
  if (!readyPayload) return;
  const payload = readyPayload;
  const previousMessage = status.textContent;
  disableDownloads();
  input.disabled = generateButton.disabled = exampleButton.disabled = true;
  status.textContent = 'Preparing your download…';
  try {
    if (button.dataset.eanExport === 'svg') await exportVectorSvg({ generator, payload, options });
    else await exportHighResPng({ generator, payload, options, scaleFactor: button.dataset.eanExport === 'png4' ? 4 : 2 });
    status.textContent = previousMessage;
  } catch {
    status.textContent = 'Could not prepare the download. Try the download again or open the full studio below.';
  } finally {
    input.disabled = generateButton.disabled = exampleButton.disabled = false;
    downloads.forEach(item => { item.disabled = false; });
  }
}));
generateButton.disabled = exampleButton.disabled = false;
document.querySelector('#ean-startup').hidden = true;
