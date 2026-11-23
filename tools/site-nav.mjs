// Site menu (UCM-NAV-01): the one list of links for the header menu and the footer Guides column.
// Paths are relative to the site root; `prefix` is '' for root pages and '../' for pages/*.html.

export const SITE_NAV_VERSION = '1.0';

export const START_LINKS = [
  { href: 'index.html', label: 'Studio (every code type)' },
  { href: 'barcode-scanner.html', label: 'Barcode and QR scanner' },
  { href: 'pages/check-digit-calculator.html', label: 'Check digit calculator' },
];

export const NAV_GROUPS = [
  { title: 'Product barcodes', links: [
    { href: 'pages/ean-13-barcode-generator.html', label: 'EAN-13' },
    { href: 'pages/upc-a-barcode-generator.html', label: 'UPC-A' },
    { href: 'pages/isbn-book-barcode-generator.html', label: 'ISBN (books)' },
    { href: 'pages/itf-14-barcode-generator.html', label: 'ITF-14 (cartons)' },
    { href: 'pages/amazon-fba-fnsku-barcode-generator.html', label: 'Amazon FBA (FNSKU labels)' },
    { href: 'pages/shopify-barcode-generator.html', label: 'Shopify product barcodes' },
  ] },
  { title: 'Other barcodes', links: [
    { href: 'pages/code-128-barcode-generator.html', label: 'Code 128' },
    { href: 'pages/code-39-barcode-generator.html', label: 'Code 39' },
    { href: 'pages/data-matrix-generator.html', label: 'Data Matrix' },
    { href: 'pages/aztec-code-generator.html', label: 'Aztec' },
    { href: 'pages/pdf417-barcode-generator.html', label: 'PDF417' },
  ] },
  { title: 'QR codes', links: [
    { href: 'pages/wifi-qr-code-generator.html', label: 'Wi-Fi' },
    { href: 'pages/upi-qr-code-generator.html', label: 'UPI payments' },
    { href: 'pages/vcard-qr-code-generator.html', label: 'Contact card (vCard)' },
    { href: 'pages/whatsapp-qr-code-generator.html', label: 'WhatsApp' },
    { href: 'pages/google-reviews-qr-code-generator.html', label: 'Google reviews' },
    { href: 'pages/google-maps-location-qr-code-generator.html', label: 'Google Maps location' },
    { href: 'pages/email-qr-code-generator.html', label: 'Email' },
    { href: 'pages/sms-qr-code-generator.html', label: 'SMS' },
    { href: 'pages/phone-call-qr-code-generator.html', label: 'Phone call' },
    { href: 'pages/calendar-event-qr-code-generator.html', label: 'Calendar event' },
    { href: 'pages/crypto-qr-code-generator.html', label: 'Crypto payment' },
    { href: 'pages/plain-text-qr-code-generator.html', label: 'Plain text' },
  ] },
  { title: 'Printing and bulk', links: [
    { href: 'pages/avery-5160-barcode-generator.html', label: 'Avery 5160 label sheets' },
    { href: 'pages/bulk-barcode-generator-excel.html', label: 'Bulk barcodes from a list' },
  ] },
  { title: 'Guides', links: [
    { href: 'pages/how-to-get-a-barcode-for-your-product.html', label: 'How to get a barcode for your product' },
    { href: 'pages/do-i-need-a-barcode-to-sell-on-amazon.html', label: 'Barcodes for selling on Amazon' },
    { href: 'pages/barcode-for-products-in-india.html', label: 'Barcodes for products in India' },
    { href: 'pages/upc-vs-ean-13-barcode.html', label: 'UPC vs EAN-13' },
    { href: 'symbology-docs.html', label: 'Barcode formats explained' },
  ] },
  { title: 'About this site', links: [
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'privacy-policy.html', label: 'Privacy policy' },
    { href: 'terms.html', label: 'Terms' },
  ] },
];

const linkHtml = (prefix, current) => ({ href, label }) =>
  `<li><a href="${prefix}${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`;

/** Head tags: stylesheet and script, versioned on their own. */
export function siteNavHeadHtml(prefix) {
  return `<link rel="stylesheet" href="${prefix}css/site-nav.css?v=${SITE_NAV_VERSION}">
  <script type="module" src="${prefix}js/core/site-nav.js?v=${SITE_NAV_VERSION}"></script>`;
}

/** Header button. Without JavaScript it is a link to the footer directory. */
export function siteNavButtonHtml() {
  return `<a href="#site-directory" class="site-nav-btn" id="site-nav-btn" aria-haspopup="dialog" aria-controls="site-nav" aria-expanded="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span>Menu</span>
          </a>`;
}

/** The menu panel. `current` is the page's own root-relative path, marked with aria-current. */
export function siteNavDialogHtml(prefix, current) {
  const li = linkHtml(prefix, current);
  const groups = NAV_GROUPS.map((g) => `
      <details class="site-nav-group">
        <summary>${g.title} <span class="site-nav-count">${g.links.length}</span></summary>
        <ul>${g.links.map(li).join('')}</ul>
      </details>`).join('');
  return `<dialog id="site-nav" class="site-nav" aria-labelledby="site-nav-title">
    <div class="site-nav-inner">
      <div class="site-nav-head">
        <h2 id="site-nav-title">All tools and guides</h2>
        <button type="button" class="site-nav-close" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
        </button>
      </div>
      <nav aria-label="All tools and guides">
        <p class="site-nav-label">Start here</p>
        <ul class="site-nav-start">${START_LINKS.map(li).join('')}</ul>${groups}
      </nav>
    </div>
  </dialog>`;
}

/** Footer directory column for the guides (the footer already lists the tool pages). */
export function footerGuidesColumnHtml(prefix) {
  const guides = [{ href: 'pages/check-digit-calculator.html', label: 'Check Digit Calculator' }, ...NAV_GROUPS.find((g) => g.title === 'Guides').links];
  return `<div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Guides &amp; Calculators
          </h4>
          <ul>${guides.map(({ href, label }) => `
            <li><a href="${prefix}${href}">${label}</a></li>`).join('')}
          </ul>
        </div>`;
}
