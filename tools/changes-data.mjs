// "What changed" page entries (UCM-HS-01): user-visible changes, newest first, in plain language.
// Add an entry at each release that visitors would notice, and list corrections too. Source: 70_delivery/releases.md.
// Links are root-relative (changes.html sits at the site root).
export const CHANGES = [
  { date: '2026-11-28', items: [
    'The <a href="pages/data-matrix-generator.html">Data Matrix page</a> now explains fixed sizes; the <a href="pages/pdf417-barcode-generator.html">PDF417 page</a> lists EPS downloads.',
    'The About page now explains how we check things and what we won\'t do. This page started.',
    'The studio now says when it is still loading a code engine. If one doesn\'t load, it says so and offers Try again instead of waiting with no message.',
  ] },
  { date: '2026-11-23', items: [
    'New <a href="pages/check-digit-calculator.html">check digit calculator</a> for EAN-13, UPC-A, GTIN-14 and ISBN-13, for one number or a list.',
    'New guide: <a href="pages/barcode-for-products-in-india.html">how to get a barcode for products in India</a>.',
    'A menu on every page with all tools and guides.',
    'Every guide now lists its sources and shows when its facts were last checked.',
    'Data Matrix: choose a fixed symbol size. The quiet-zone setting for Data Matrix and Aztec now counts whole modules.',
    'Corrections: Amazon\'s barcode rules re-read and wording fixed in the Amazon, product and UPC vs EAN-13 guides; GS1 fees re-checked; an example number with one digit too many fixed; the barcode formats page checked against the code.',
    'The page-not-found screen now works at any address.',
  ] },
  { date: '2026-11-22', items: [
    'A simpler <a href="pages/upi-qr-code-generator.html">UPI QR tool</a> for shops, with a printable counter poster (English and Hindi).',
    '"What\'s inside this code" shows the exact text inside every QR code you make.',
    'The scanner shows UPI payment details in plain words.',
    'A homepage card for shops in India.',
  ] },
  { date: '2026-11-20', items: ['Homepage and scanner wording checked against what the tools actually do.'] },
  { date: '2026-11-16', items: ['Page text rewritten in plain language; claims we couldn\'t back up were removed.'] },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

export function changesListHtml() {
  return CHANGES.map((e) => `
      <section class="doc-section changes-entry">
        <h2><time datetime="${e.date}">${longDate(e.date)}</time></h2>
        <ul>${e.items.map((i) => `
          <li>${i}</li>`).join('')}
        </ul>
      </section>`).join('');
}
