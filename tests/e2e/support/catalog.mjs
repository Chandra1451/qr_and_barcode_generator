// Test catalogue: reads the site's own generator registry, QR wizards and page list
// so every new generator, control, wizard or landing page is tested automatically.
//
// The site's plugin files are plain ES modules without a package.json "type" field.
// Node >= 22.12 detects ES module syntax on its own, so they can be imported here.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const E2E_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SITE_ROOT = path.resolve(E2E_ROOT, '../..');

// The site's imports carry cache-busting queries (`./x.js?v=2.7`). Browsers resolve those,
// but Playwright's loader does not, so import a temporary copy of js/ with them stripped.
const JS_COPY = (() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ucm-catalog-'));
  for (const rel of fs.readdirSync(path.join(SITE_ROOT, 'js'), { recursive: true }).map(String)) {
    const src = path.join(SITE_ROOT, 'js', rel);
    if (rel.replace(/\\/g, '/').startsWith('vendor') || !fs.statSync(src).isFile() || !rel.endsWith('.js')) continue;
    const dest = path.join(dir, 'js', rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(src, 'utf8').replace(/(\.js)\?v=[\w.-]+(['"])/g, '$1$2'));
  }
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
})();

async function importSite(relPath) {
  return import(pathToFileURL(path.join(JS_COPY, relPath)).href);
}

const registry = await importSite('js/generators/registry.js');
const wizardsModule = await importSite('js/wizards/qr-wizards.js');

/** Serializable generator metadata (RegExp and functions stripped). */
export const GENERATORS = registry.getAllGenerators().map((g) => ({
  id: g.id,
  name: g.name,
  category: g.category,
  description: g.description,
  defaultPayload: g.schema?.defaultPayload ?? '',
  inputType: g.schema?.inputType ?? 'text',
  regex: g.schema?.regex ?? null,
  controls: (g.controls || []).map((c) => ({ ...c })),
}));

export const QR_ID = 'qr-code';
export const BARCODE_GENERATORS = GENERATORS.filter((g) => g.id !== QR_ID);
export const getGeneratorMeta = (id) => GENERATORS.find((g) => g.id === id);

/** QR wizards, including their real compile() so tests can compute the expected payload. */
export const WIZARDS = wizardsModule.getAllWizards();
export const getWizardDef = (id) => WIZARDS.find((w) => w.id === id);

export function wizardDefaults(wizard) {
  const values = {};
  for (const f of wizard.fields) values[f.id] = f.type === 'checkbox' ? Boolean(f.default) : (f.default ?? '');
  return values;
}

/** Aliases accepted by the studio's ?symbology= deep link (mirrors js/v2-studio.js). */
export const SYMBOLOGY_ALIASES = {
  code39: 'code-39',
  code128: 'code-128',
  ean13: 'ean-13',
  upca: 'upc-a',
  itf14: 'itf-14',
  isbn13: 'isbn',
  'isbn-13': 'isbn',
  datamatrix: 'data-matrix',
  qrcode: 'qr-code',
};

/** Symbologies drawn with bwip-js as a square 1:1 matrix by default. */
export const SQUARE_2D = ['data-matrix', 'aztec'];
/** Linear (1D) symbologies. */
export const LINEAR_1D = GENERATORS.filter((g) => g.category !== '2d').map((g) => g.id);

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

/** Root pages that are part of the live site (classic/ and v2/ are archived/redirects). */
export const ROOT_PAGES = ['index.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'symbology-docs.html', '404.html']
  .filter((f) => fs.existsSync(path.join(SITE_ROOT, f)));

export const LANDING_PAGES = fs
  .readdirSync(path.join(SITE_ROOT, 'pages'))
  .filter((f) => f.endsWith('.html'))
  .sort()
  .map((f) => `pages/${f}`);

/** Every public page except the studio itself. */
export const CONTENT_PAGES = [...ROOT_PAGES.filter((p) => p !== 'index.html'), ...LANDING_PAGES];
export const ALL_PAGES = [...ROOT_PAGES, ...LANDING_PAGES];

export function readSiteFile(relPath) {
  return fs.readFileSync(path.join(SITE_ROOT, relPath), 'utf8');
}

/** Label-maker preset ids, read from the studio markup. */
export function labelPresetIds() {
  const html = readSiteFile('index.html');
  const select = html.match(/<select[^>]*id="label-preset-select"[\s\S]*?<\/select>/);
  return select ? [...select[0].matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]) : [];
}

// ---------------------------------------------------------------------------
// Independent oracles (deliberately NOT imported from the site's code)
// ---------------------------------------------------------------------------

/** GS1 Mod-10 check digit for a digit string (weights 3,1 from the right). */
export function gs1CheckDigit(digits) {
  let sum = 0;
  const reversed = String(digits).split('').reverse();
  reversed.forEach((d, i) => {
    sum += Number(d) * (i % 2 === 0 ? 3 : 1);
  });
  return String((10 - (sum % 10)) % 10);
}

/**
 * The text a standards-compliant scanner must return for a payload typed into the studio.
 * Returns null when the output is not a pure function of the payload.
 */
export function expectedScanText(generatorId, payload) {
  const digits = String(payload).replace(/\D/g, '');
  switch (generatorId) {
    case 'ean-13':
      return digits.length === 12 ? digits + gs1CheckDigit(digits) : digits;
    case 'upc-a':
      return digits.length === 11 ? digits + gs1CheckDigit(digits) : digits;
    case 'itf-14':
      return digits.length === 13 ? digits + gs1CheckDigit(digits) : digits;
    case 'isbn':
      // ISBN-13 is printed as EAN-13; an optional 5-digit add-on is a separate symbol.
      return digits.slice(0, 13);
    default:
      return String(payload);
  }
}

/** Normalise decoder output so formatting differences do not cause false failures. */
export function normaliseScan(generatorId, text) {
  if (['ean-13', 'upc-a', 'itf-14', 'isbn'].includes(generatorId)) {
    let d = String(text).replace(/\D/g, '');
    // Some decoders report UPC-A as a 13-digit EAN with a leading 0.
    if (generatorId === 'upc-a' && d.length === 13 && d.startsWith('0')) d = d.slice(1);
    return d;
  }
  return String(text).replace(/\r\n/g, '\n');
}
