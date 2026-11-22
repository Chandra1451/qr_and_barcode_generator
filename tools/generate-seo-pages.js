/**
 * Programmatic SEO Landing Page Generator
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Generates 18+ high-intent, keyword-targeted landing pages with:
 * - Direct deep-links to pre-configured generator in index.html
 * - Full WebApplication, FAQPage, and BreadcrumbList JSON-LD schemas
 * - Comprehensive technical specifications and industry guidelines
 * - Accessible FAQ accordions
 * - Generates root sitemap.xml
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { eanOnpageHtml } from './ean-onpage-template.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://universalcodemaker.com';
// Cache-busting version for shared CSS (served with a 1-year immutable cache).
// Keep in sync with the ?v= used on the root pages; bump whenever the CSS changes.
const ASSET_VERSION = '3.4';
const PAGES_DIR = path.join(__dirname, '..', 'pages');

if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}


// Scoped content for the approved EAN/UPC identifier pages. Other page chrome stays byte-identical.
function hasEanWorkflow(slug) {
  return ['ean-13-barcode-generator', 'how-to-get-a-barcode-for-your-product', 'upc-vs-ean-13-barcode'].includes(slug);
}

function identifierNoticeHtml(showGuideLink = true) {
  return `<aside class="identifier-notice" aria-label="Product identifier notice"><strong>Product identifier notice</strong><p>Use the number assigned to your product. UniversalCodeMaker creates the barcode image; obtain the identifier from the appropriate issuer and check your retailer's requirements.${showGuideLink ? ' <a href="./how-to-get-a-barcode-for-your-product.html">How to get a barcode for your product</a> explains the steps.' : ''}</p></aside>`;
}

function eanWorkflowStyles(slug) {
  if (!hasEanWorkflow(slug)) return '';
  return `<style>
    .identifier-notice,.ean-workflow,.ean-diagram { background:var(--surface); color:var(--text-primary); border:2px solid var(--border); border-radius:var(--radius-sm); padding:clamp(1rem,3vw,1.75rem); margin:1.5rem 0; text-align:left; min-width:0; }
    .identifier-notice p { margin:.5rem 0 0; color:var(--text-secondary); line-height:1.65; }
    .ean-workflow h2 { font-size:clamp(1.3rem,3vw,1.65rem); margin:0 0 1rem; }
    .ean-workflow h3 { font-size:1.1rem; margin:1.5rem 0 .75rem; }
    .benefit-card-header h3 { font-family:var(--font-heading); font-size:1.05rem; font-weight:700; margin:0; color:var(--text-primary); }
    .ean-workflow p,.ean-workflow li { color:var(--text-secondary); line-height:1.7; }
    .ean-workflow ol { padding-left:1.4rem; }
    .ean-workflow li+li { margin-top:.75rem; }
    .ean-workflow a,.identifier-notice a,.ean-diagram a { color:var(--accent); text-decoration:underline; text-underline-offset:.15em; }
    .ean-data-table { border-collapse:collapse; width:100%; margin:1rem 0; font-size:1rem; }
    .ean-data-table th,.ean-data-table td { text-align:left; vertical-align:top; border-bottom:1px solid var(--border); padding:.8rem; overflow-wrap:anywhere; line-height:1.6; }
    .ean-data-table th { color:var(--text-primary); }
    .ean-data-table td { color:var(--text-secondary); }
    .ean-data-table code { overflow-wrap:anywhere; }
    .ean-diagram { margin:1.25rem 0; }
    .ean-diagram-art { display:block; width:100%; max-width:560px; height:auto; margin:auto; color:var(--text-primary); }
    .ean-diagram-legend { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem 1.25rem; margin:1rem 0; padding:0; list-style:none; font-size:1rem; line-height:1.6; }
    .ean-diagram figcaption { font-size:1rem; line-height:1.65; color:var(--text-secondary); }
    .ean-diagram .diagram-source { margin-top:.7rem; }
    @media(max-width:600px) {
      .ean-diagram-legend { grid-template-columns:1fr; }
      .ean-data-table th,.ean-data-table td { padding:.65rem .35rem; }
      .ean-data-table th:first-child,.ean-data-table td:first-child { width:36%; }
    }${slug === 'upc-vs-ean-13-barcode' ? '\n    .ean-diagram-art.diagram-wide { max-width:820px; }\n    .ean-callout { background:var(--surface-alt); border-left:4px solid var(--optic-blue); padding:1rem 1.25rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; margin:1rem 0; }' : ''}
  </style>`;
}

function eanDiagramHtml(id) {
  return `<figure class="ean-diagram">
    <svg class="ean-diagram-art" viewBox="0 0 500 290" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">EAN-13 quiet zones, bar height and check digit</title>
      <desc id="${id}-desc">Schematic only. Numbered areas correspond to the readable legend below. The bars are illustrative, not a scannable barcode.</desc>
      <defs><pattern id="${id}-bars" width="28" height="150" patternUnits="userSpaceOnUse"><rect width="4" height="150" fill="currentColor"/><rect x="8" width="8" height="150" fill="currentColor"/><rect x="20" width="4" height="150" fill="currentColor"/></pattern></defs>
      <rect x="24" y="46" width="44" height="150" fill="var(--accent)" opacity=".18"/>
      <rect x="68" y="46" width="380" height="150" fill="url(#${id}-bars)"/>
      <rect x="448" y="46" width="28" height="150" fill="var(--accent)" opacity=".18"/>
      <path d="M488 46h8m-4 0v150m-4 0h8" fill="none" stroke="currentColor" stroke-width="2"/>
      <g fill="currentColor" font-family="monospace" font-size="40" text-anchor="middle"><text x="46" y="34">1</text><text x="462" y="34">2</text><text x="486" y="236">3</text></g>
      <text x="66" y="236" font-family="monospace" font-size="32" fill="currentColor">5 901234 12345</text>
      <rect x="421" y="205" width="32" height="38" rx="3" fill="var(--accent)" opacity=".18"/><text x="427" y="236" font-family="monospace" font-size="32" fill="currentColor">7</text>
      <text x="435" y="280" font-family="monospace" font-size="36" text-anchor="middle" fill="currentColor">4</text>
    </svg>
    <ol class="ean-diagram-legend">
      <li><strong>1. Left quiet zone:</strong> at least 11 times the narrowest bar width (X), or 3.63 mm at X = 0.330 mm.</li>
      <li><strong>2. Right quiet zone:</strong> at least 7X, or 2.31 mm at X = 0.330 mm.</li>
      <li><strong>3. Full bar height:</strong> the nominal consumer-item height is 22.85 mm at X = 0.330 mm. Keep the bars at their intended height.</li>
      <li><strong>4. Check digit:</strong> the last digit is calculated from the preceding digits. In this demonstration it is 7.</li>
    </ol>
    <figcaption>Schematic illustration, not a scan sample. X is the width of the narrowest bar. Extra file padding can make an export larger than the symbol and its minimum margins. UPC-A has different quiet-zone requirements.<p class="diagram-source">Dimensions: <a href="https://gs1.se/en/guides/how-to-guides/size-guide/" target="_blank" rel="noopener noreferrer">GS1 Sweden size guide</a>.</p></figcaption>
  </figure>`;
}

function eanPackagingHtml() {
  return `<section class="ean-workflow" aria-labelledby="ean-input-title">
    <h2 id="ean-input-title">Check what the tool will encode</h2>
    <p>Enter the first 12 data digits of a GTIN-13 to calculate digit 13, or enter all 13 digits to check the last digit. A complete 12-digit GTIN-12 belongs in the <a href="./upc-a-barcode-generator.html">UPC-A generator</a>. Need help deciding between the two? Read our side-by-side technical comparison: <a href="./upc-vs-ean-13-barcode.html">UPC vs EAN-13: Which Barcode Do You Need?</a>, or follow our complete seller walkthrough: <a href="./how-to-get-a-barcode-for-your-product.html">How to Get a Barcode for Your Product</a>.</p>
    <p>These are demonstration values, not identifiers issued to you for retail use.</p>
    <table class="ean-data-table"><thead><tr><th scope="col">Input</th><th scope="col">Expected result</th></tr></thead><tbody>
      <tr><th scope="row"><code>590123412345</code></th><td>The tool calculates the last digit and encodes <code>5901234123457</code>.</td></tr>
      <tr><th scope="row"><code>5901234123457</code></th><td>The complete number passes the check-digit check.</td></tr>
      <tr><th scope="row"><code>5901234123458</code></th><td>The last digit should be <strong>7</strong>, not 8. Compare with the source number before exporting.</td></tr>
    </tbody></table>
    <h2>From product number to printed packaging</h2>
    <ol>
      <li><strong>Enter your number.</strong> Use the <a href="#ean-onpage">EAN-13 generator on this page</a> with the complete number or unfinished data portion as explained above. The human-readable digits are included.</li>
      <li><strong>Choose the file.</strong> Use SVG for vector packaging artwork. Choose 2x or 4x PNG when your document workflow needs a higher-resolution raster image. EPS is also available for barcodes.</li>
      <li><strong>Place the barcode.</strong> Keep its proportions, full bar height and blank margins. Check final physical dimensions in your artwork; the preview's screen size is not its print size.</li>
      <li><strong>Check the file.</strong> Decode an exported PNG with a compatible reader, such as the <a href="../barcode-scanner.html">site's scanner</a>, and compare every digit with your source product record.</li>
      <li><strong>Print one proof.</strong> Use the intended stock and final print size. Check the decoded number before a full run. Arrange a barcode-quality verification report separately if your retailer requests one.</li>
    </ol>
    ${eanDiagramHtml('ean-tool')}
    <h3>Consumer-item size and export settings</h3>
    <p>For EAN-13 on consumer items at retail checkout, GS1's recommended X-dimension is 0.330 mm, with bars 22.85 mm high. The consumer-item range is X 0.264–0.660 mm, with corresponding heights 18.28–45.70 mm. Keep the required margins; the file can contain extra surrounding space.</p>
    <p>Use dark bars on a light background. Preserve proportions when resizing vector artwork. PNG print resolution depends on export settings and the physical size at which you place it; the 1x option is not always 300 DPI. See <a href="https://www.gs1uk.org/knowledge-hub/barcodes/what-colour-should-a-barcode-be" target="_blank" rel="noopener noreferrer">GS1 UK's colour guidance</a>.</p>
    <h3>Printing problems to check</h3>
    <table class="ean-data-table"><thead><tr><th scope="col">Problem</th><th scope="col">Practical next check</th></tr></thead><tbody>
      <tr><th scope="row">Wrong check digit</th><td>Compare with the source record; check that a full UPC-A was not entered as EAN data.</td></tr>
      <tr><th scope="row">Artwork touches the bars</th><td>Restore the quiet zones and move nearby text or borders away.</td></tr>
      <tr><th scope="row">Enlarged PNG looks blurred</th><td>Re-export at a higher raster setting or use SVG, preserving the intended physical size.</td></tr>
      <tr><th scope="row">File decodes; print does not</th><td>Check final size, contrast, material, glare and printer scaling on the actual proof.</td></tr>
      <tr><th scope="row">Avery labels drift down the sheet</th><td>Print at Actual size / 100% and compare a plain-paper proof with the sheet. Follow the <a href="./avery-5160-barcode-generator.html">Avery 5160 workflow</a>, including its barcode-height limits.</td></tr>
    </tbody></table>
    <p>Need a different value on every label? Use the <a href="./bulk-barcode-generator-excel.html">batch generator</a> with a pasted list and an Avery PDF export.</p>
  </section>`;
}

// Matrix of programmatic pages
const SEO_PAGES = [
  // 1D Retail & Logistics
  {
    slug: 'ean-13-barcode-generator',
    name: 'EAN-13 Barcode Generator',
    shortName: 'EAN-13',
    queryParam: 'symbology=ean-13',
    category: 'Retail & POS',
    metaTitle: 'Free EAN-13 Barcode Generator: SVG, EPS & PNG',
    metaDescription: 'Make EAN-13 barcode images from your product number. Calculate or check the last digit, export SVG, EPS or PNG, and follow practical printing guidance.',
    h1: 'Free EAN-13 Barcode Generator',
    lead: 'Make an EAN-13 barcode image from your existing product number. Enter 12 digits to calculate the check digit, or all 13 digits to check it. Download SVG, EPS or PNG for your artwork and labels.',
    technicalSpec: {
      standard: 'ISO/IEC 15420 / GS1 General Specifications',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '12 data digits + 1 Mod-10 check digit (total 13 digits)',
      size: 'Consumer-item retail checkout: bar width (X-dimension) 0.264–0.660 mm, target 0.330 mm: 37.29 mm wide incl. quiet zones, bars 22.85 mm high',
      quietZones: 'Left: 3.63mm (11X), Right: 2.31mm (7X)'
    },
    useCases: [
      'Consumer-product packaging for a retailer that accepts EAN-13',
      'Labels for a product with an assigned GTIN-13',
      'Packaging artwork that needs a vector barcode graphic',
      'Reprinting a product barcode while preserving the assigned number'
    ],
    relatedSlugs: [
      'upc-vs-ean-13-barcode',
      'how-to-get-a-barcode-for-your-product',
      'upc-a-barcode-generator',
      'itf-14-barcode-generator',
      'isbn-book-barcode-generator',
      'shopify-barcode-generator'
    ],
    faqs: [
      {
        q: 'How is the 13th check digit of an EAN-13 barcode calculated?',
        a: 'The 13th digit is a GS1 Modulo-10 checksum calculated by multiplying odd-positioned digits by 1 and even-positioned digits by 3, summing them, and determining the remainder needed to round up to the nearest multiple of 10. Our generator calculates this automatically.'
      },
      {
        q: 'Do I need to buy official EAN-13 numbers from GS1?',
        a: 'Retailers and marketplaces may require a licensed GS1 GTIN. To license numbers directly from GS1 and register your brand in the official database, see our guide: <a href="./how-to-get-a-barcode-for-your-product.html">How to Get a Barcode for Your Product</a>. For closed-loop inventory that does not need a retail GTIN, use an internal identifier in a format such as Code 128.'
      },
      {
        q: 'Should I use EAN-13 or UPC-A for retail checkout?',
        a: 'If your product is sold primarily in the United States or Canada, retailers often expect a 12-digit UPC-A. For products sold outside North America or exported internationally, use a 13-digit EAN-13. Point-of-sale scanners worldwide decode both formats. See our full comparison: <a href="./upc-vs-ean-13-barcode.html">UPC vs EAN-13: Which Barcode Do You Need?</a>.'
      },
      {
        q: 'Can I download an EAN-13 barcode in vector SVG for packaging design?',
        a: 'Yes. Our generator produces infinitely scalable vector SVG files that can be imported directly into Adobe Illustrator, CorelDRAW, or InDesign for prepress commercial packaging.'
      }
    ]
  },
  {
    slug: 'upc-a-barcode-generator',
    name: 'UPC-A Barcode Generator',
    shortName: 'UPC-A',
    queryParam: 'symbology=upc-a',
    category: 'Retail & POS',
    metaTitle: 'Free UPC-A Barcode Generator: 12-Digit Retail GTIN-12',
    metaDescription: 'Free UPC-A barcode generator for 12-digit product numbers. Type 11 digits and the check digit is added for you. Download SVG, PNG or EPS, or print label sheets.',
    h1: 'Free UPC-A Retail Barcode Generator',
    lead: "Make a UPC-A barcode, the 12-digit code on products sold in the US and Canada. Type the first 11 digits and the check digit is added for you, or type all 12 and the generator checks it. You still need the number itself from GS1.",
    technicalSpec: {
      digits: "12 (GTIN-12): type 11 for an automatic check digit, or 12 to have it checked",
      standard: "ISO/IEC 15420 and the GS1 General Specifications",
      printSize: "37.29 mm wide including margins, bars 22.85 mm high (0.330 mm narrow bar)",
      quietZone: "9 narrow-bar widths on each side",
      downloads: "SVG, PNG and EPS downloads, plus Avery 5160, 5163 and L7160 label sheets",
      privacy: "Built in your browser; the generator does not upload your product numbers"
    },
    useCases: [
      "Product packaging for shops in the US and Canada",
      "Amazon and other marketplace listings that ask for a UPC",
      "Shelf and price labels in a small shop",
      "Replacing a damaged label with the same number"
    ],
    relatedSlugs: [
      'upc-vs-ean-13-barcode',
      'how-to-get-a-barcode-for-your-product',
      'ean-13-barcode-generator',
      'itf-14-barcode-generator',
      'shopify-barcode-generator',
      'amazon-fba-fnsku-barcode-generator'
    ],
    faqs: [
      {
        q: 'What is the difference between UPC-A and EAN-13?',
        a: 'UPC-A is a 12-digit standard primarily used for retail products in the United States and Canada, while EAN-13 is a 13-digit standard used across Europe and the rest of the world. Mechanically, any UPC-A code can be converted into an EAN-13 by prepending a single leading zero (0), which produces an identical Modulo-10 check digit. Most modern point-of-sale scanners read both. For a complete comparison, read our guide: <a href="./upc-vs-ean-13-barcode.html">UPC vs EAN-13: Which Barcode Do You Need?</a>.'
      },
      {
        q: 'How does the generator calculate and verify the 12th Modulo-10 check digit?',
        a: 'When you enter the first 11 data digits, the generator calculates the final 12th digit in real time using the official GS1 Modulo-10 algorithm: odd-position digits (1st, 3rd, 5th, etc.) are multiplied by 3, even-position digits are multiplied by 1, all products are summed, and the check digit is the number required to round up to the nearest multiple of 10. If you enter all 12 digits, the studio verifies the check digit and alerts you if there is a mismatch.'
      },
      {
        q: 'Do I need a UPC-A barcode to list and sell products on Amazon?',
        a: 'Yes, for most physical products listed on Amazon North America (US, Canada, Mexico), Amazon requires a valid GS1 GTIN-12 (UPC-A) or GTIN-13 (EAN-13). Amazon automatically cross-checks your barcode number against the GS1 GEPIR / Verified by GS1 database; if the company prefix does not match your brand or legal business entity, the listing may be rejected. If you manufacture private label products or handmade goods without barcodes, you can request a GTIN exemption directly in Amazon Seller Central. See our complete walkthrough: <a href="./do-i-need-a-barcode-to-sell-on-amazon.html">Amazon Barcode Requirements</a>.'
      },
      {
        q: 'Can I print UPC-A barcodes on Avery adhesive label sheets?',
        a: 'Yes. UniversalCodeMaker includes a built-in Avery label maker. You can print PDF sheets for Avery 5160 (30 labels per Letter sheet, 1" × 2-5/8"), Avery 5163 (10 per sheet, 2" × 4") or Avery L7160 (21 per A4 sheet). Print at Actual size and test one sheet on plain paper first.'
      },
      {
        q: 'Why is truncating or shortening UPC-A bars discouraged on retail packaging?',
        a: 'GS1 advises against cutting the bars shorter than the nominal 22.85 mm (0.900 in). Checkout scanners read the code from several angles, and short bars leave fewer angles that cross the whole pattern, so the cashier may end up typing the number.'
      },
      {
        q: 'Are my product numbers, SKUs, or inventory details stored on UniversalCodeMaker servers?',
        a: 'No. The barcode is drawn by JavaScript in your browser, and the generator does not upload your GTIN-12 numbers, product titles or label designs.'
      }
    ]
  },
  {
    slug: 'code-128-barcode-generator',
    name: 'Code 128 Barcode Generator',
    shortName: 'Code 128',
    queryParam: 'symbology=code-128',
    category: 'Logistics & Shipping',
    metaTitle: 'Free Code 128 Barcode Generator: High-Density Shipping SVG',
    metaDescription: 'Free Code 128 barcode generator for SKUs, shipping and warehouse labels. Letters, numbers and symbols, check character added for you. SVG, PNG, EPS.',
    h1: 'Free Code 128 Logistics Barcode Generator',
    lead: "Make a Code 128 barcode for SKUs, bin locations, shipping and warehouse labels. It takes letters, numbers and punctuation, packs long numbers compactly, and adds its check character for you.",
    technicalSpec: {
      standard: "ISO/IEC 15417",
      characters: "All 128 ASCII characters: letters, digits, punctuation and spaces",
      subsets: "A, B and C chosen automatically; long runs of digits are packed two per symbol",
      checkCharacter: "Mod-103, added automatically",
      notSupported: "GS1-128 (the generator does not add the FNC1 character it needs)",
      quietZone: "At least 10 narrow-bar widths on each side",
      downloads: "SVG, PNG and EPS downloads, plus Avery 5160, 5163 and L7160 label sheets",
      privacy: "Built in your browser; the generator does not upload your SKUs or tracking numbers"
    },
    useCases: [
      "Internal SKU and product labels",
      "Warehouse bin and shelf locations",
      "Asset tags for equipment",
      "Amazon FNSKU labels (Amazon uses Code 128 for them)"
    ],
    faqs: [
      {
        q: "Is this the same as GS1-128?",
        a: "No. GS1-128 is Code 128 with a special FNC1 character and GS1 data fields, used on retail supply-chain cartons and pallets. This generator makes plain Code 128 and does not add FNC1, so don't use it where a customer asks for GS1-128."
      },
      {
        q: "Do I need to choose subset A, B or C?",
        a: "No. The generator picks the subsets for you and switches between them inside one barcode, which keeps it as short as possible."
      },
      {
        q: "Can I use lowercase letters and spaces?",
        a: "Yes. Code 128 covers all ASCII characters. Keep values short anyway; every character makes the barcode wider."
      },
      {
        q: "How small can I print it?",
        a: "It depends on your printer and scanner. Keep the quiet zone clear on both sides, print a proof at the final size and scan it with the scanner you will actually use."
      }
    ],
    relatedSlugs: [
      'amazon-fba-fnsku-barcode-generator',
      'itf-14-barcode-generator',
      'data-matrix-generator',
      'code-39-barcode-generator',
      'avery-5160-barcode-generator',
      'bulk-barcode-generator-excel'
    ]
  },
  {
    slug: 'itf-14-barcode-generator',
    name: 'ITF-14 Barcode Generator',
    shortName: 'ITF-14',
    queryParam: 'symbology=itf-14',
    category: 'Logistics & Shipping',
    metaTitle: 'Free ITF-14 Barcode Generator: Shipping Carton GTIN-14',
    metaDescription: 'Free ITF-14 barcode generator for shipping cartons. Type 13 digits and the check digit is added; bearer bars included. Download SVG, PNG or EPS.',
    h1: 'Free ITF-14 Shipping Carton Barcode Generator',
    lead: "Make an ITF-14 barcode for outer shipping cartons and cases. Type 13 digits and the check digit is added, or type 14 to have it checked. The frame around the bars (the bearer bars) is drawn for you.",
    technicalSpec: {
      digits: "14 (GTIN-14): type 13 for an automatic check digit, or 14 to have it checked",
      standard: "ISO/IEC 16390 and the GS1 General Specifications",
      bearerBars: "Drawn around the symbol to protect it when printed on cardboard",
      defaultNarrowBar: "0.495 mm",
      quietZone: "10 narrow-bar widths, inside the bearer bars",
      downloads: "SVG, PNG and EPS downloads, plus Avery 5160, 5163 and L7160 label sheets",
      privacy: "Built in your browser; the generator does not upload your carton numbers"
    },
    useCases: [
      "Outer cartons that hold several retail units",
      "Cases and inner packs received at a warehouse",
      "Carton labels for retailer or distributor deliveries"
    ],
    faqs: [
      {
        q: "Can ITF-14 be scanned at a shop checkout?",
        a: "It isn't meant for checkout. ITF-14 identifies the carton. Anything sold to shoppers one by one needs its own UPC-A or EAN-13."
      },
      {
        q: "How do I get a 14-digit carton number?",
        a: "Under GS1 rules, a carton number is usually built from the product's GTIN: an indicator digit (1 to 8) chosen by the brand owner, then the first 12 digits of the GTIN-13 without its check digit, then a new check digit. Type the first 13 digits here and the check digit is added."
      },
      {
        q: "What are the thick bars around the code for?",
        a: "They are bearer bars. They spread printing pressure on corrugated board and help stop a scanner reading only part of the code."
      }
    ],
    relatedSlugs: [
      'code-128-barcode-generator',
      'ean-13-barcode-generator',
      'upc-a-barcode-generator',
      'amazon-fba-fnsku-barcode-generator',
      'how-to-get-a-barcode-for-your-product',
      'bulk-barcode-generator-excel'
    ]
  },
  // 2D Matrix Codes
  {
    slug: 'data-matrix-generator',
    name: 'Data Matrix Barcode Generator',
    shortName: 'Data Matrix',
    queryParam: 'symbology=data-matrix',
    category: '2D Matrix',
    metaTitle: 'Free Data Matrix ECC 200 Generator: Parts Marking & SVG',
    metaDescription: 'Free Data Matrix (ECC 200) generator for small parts, labels and internal tracking. The size is picked for your data. Download SVG or PNG.',
    h1: 'Free Data Matrix (ECC 200) 2D Barcode Generator',
    lead: "Make a Data Matrix code, the small square 2D code used on parts, electronics and labels where space is tight. Type your text or number and the symbol size is chosen to fit it.",
    technicalSpec: {
      standard: "ISO/IEC 16022, ECC 200",
      size: "Chosen automatically from the amount of data",
      errorCorrection: "Built in (Reed-Solomon); not adjustable here",
      notSupported: "GS1 DataMatrix (the generator does not add FNC1 or GS1 data fields)",
      quietZone: "At least 1 module on every side",
      privacy: "Built in your browser; the generator does not upload what you encode"
    },
    useCases: [
      "Serial numbers on small parts and circuit boards",
      "Lab sample and inventory labels",
      "Internal tracking where a linear barcode won't fit"
    ],
    faqs: [
      {
        q: "Can I use this for GS1 DataMatrix on medicines?",
        a: "No. GS1 DataMatrix needs an FNC1 character and GS1 application identifiers, which this generator does not add. Use a tool built for GS1 DataMatrix for regulated packaging."
      },
      {
        q: "Can a damaged code still be read?",
        a: "Often, yes. ECC 200 uses Reed-Solomon error correction, so a scratched or partly covered code can still be read. How much damage it tolerates depends on the symbol size."
      },
      {
        q: "Will a phone camera read it?",
        a: "Many phone scanner apps and most 2D barcode scanners read Data Matrix, but the iPhone and Android camera apps may not. Test with the device your users have."
      }
    ],
    relatedSlugs: ['pdf417-barcode-generator', 'aztec-code-generator', 'code-128-barcode-generator']
  },
  {
    slug: 'aztec-code-generator',
    name: 'Aztec Code Generator',
    shortName: 'Aztec Code',
    queryParam: 'symbology=aztec',
    category: '2D Matrix',
    metaTitle: 'Free Aztec Code Generator: Airline & Transit 2D SVG',
    metaDescription: 'Free Aztec Code generator. Square 2D code with a bullseye centre that needs no blank margin. Type your text; the size is picked for you. SVG or PNG.',
    h1: 'Free Aztec Code 2D Barcode Generator',
    lead: "Make an Aztec Code, the square 2D code with a bullseye in the middle that is often seen on transport tickets. It needs no blank margin around it. Type the text to encode and the size is chosen for you.",
    technicalSpec: {
      standard: "ISO/IEC 24778",
      finder: "Bullseye in the centre, so the code can be read without a margin",
      quietZone: "None required (one module helps some scanners)",
      size: "Chosen automatically from the amount of data",
      errorCorrection: "Built in; not adjustable here",
      privacy: "Built in your browser; the generator does not upload what you encode"
    },
    useCases: [
      "Event and transport tickets for your own system",
      "Labels where there is no room for a margin",
      "Screens and phone displays that scanners read"
    ],
    faqs: [
      {
        q: "Can I make an airline boarding pass or rail ticket with it?",
        a: "Only the barcode image. Airline and rail barcodes contain data in formats set by the carrier, and they are issued by the carrier's own systems. This generator encodes exactly the text you type."
      },
      {
        q: "Why doesn't it need a white border?",
        a: "Scanners find an Aztec Code from its centre bullseye rather than its edges, so it can be printed right up to other artwork. A thin margin still helps some scanners."
      },
      {
        q: "Will phones read it?",
        a: "Most 2D scanner apps do, but phone camera apps vary. Test with the devices that will scan it."
      }
    ],
    relatedSlugs: [
      'pdf417-barcode-generator',
      'data-matrix-generator',
      'code-128-barcode-generator',
      'code-39-barcode-generator',
      'bulk-barcode-generator-excel',
      'avery-5160-barcode-generator'
    ]
  },
  {
    slug: 'pdf417-barcode-generator',
    name: 'PDF417 Barcode Generator',
    shortName: 'PDF417',
    queryParam: 'symbology=pdf417',
    category: '2D Stacked',
    metaTitle: 'Free PDF417 Barcode Generator: SVG & PNG',
    metaDescription: 'Free PDF417 generator for shipping papers, labels and documents. Encodes exactly the text you enter, with adjustable data columns. SVG or PNG.',
    h1: 'Free PDF417 Stacked 2D Barcode Generator',
    lead: "Make a PDF417 barcode, the stacked 2D barcode used on shipping papers, labels and documents. It encodes exactly the text you enter, and you can set how many data columns it uses to make it wider or taller.",
    technicalSpec: {
      standard: "ISO/IEC 15438",
      layout: "Stacked rows; data columns adjustable from 1 to 30",
      errorCorrection: "Built in; not adjustable here",
      quietZone: "At least 2 modules on every side",
      scope: "Encodes the text you type; it does not create ID documents",
      privacy: "Built in your browser; the generator does not upload what you encode"
    },
    useCases: [
      "Shipping papers and delivery notes",
      "Inventory and document labels with several fields",
      "Badges for your own organisation's access system"
    ],
    faqs: [
      {
        q: "What do the data columns change?",
        a: "The shape. More columns make the barcode wider and shorter; fewer make it narrower and taller. The data stays the same."
      },
      {
        q: "Can I make driving licence or ID card barcodes?",
        a: "No. ID barcodes follow formats controlled by the issuing authority, and this tool is not for making identity documents. It encodes exactly the text you type."
      },
      {
        q: "Will phones read it?",
        a: "Many 2D scanner apps do, but phone camera apps vary. Test with the scanner that will read it."
      }
    ],
    relatedSlugs: ['data-matrix-generator', 'aztec-code-generator', 'code-128-barcode-generator']
  },
  // Smart QR Wizards
  {
    slug: 'wifi-qr-code-generator',
    name: 'Wi-Fi QR Code Generator',
    shortName: 'Wi-Fi QR',
    queryParam: 'wizard=wifi',
    category: 'Smart QR',
    metaTitle: 'Free Wi-Fi QR Code Generator: Auto-Connect Password QR',
    metaDescription: 'Free Wi-Fi QR code generator. Guests scan to join without typing the password. Supports WPA3, WPA2, WEP and hidden networks, and runs in your browser.',
    h1: 'Free Wi-Fi Auto-Connect QR Code Generator',
    lead: "Make a QR code that joins a Wi-Fi network when scanned. Guests point their phone camera at it and tap to connect, so nobody has to spell out the password. It suits home, café and office guest networks that use one shared password.",
    technicalSpec: {
      contents: "WIFI:S:network;T:security;P:password;H:hidden;; (the usual Wi-Fi QR format)",
      security: "WPA/WPA2/WPA3 (one setting), WEP, or an open network",
      hiddenNetworks: "Supported; tick Hidden Network so the phone looks for it",
      notFor: "Networks that ask each person for a username (WPA2/WPA3-Enterprise)",
      privacy: "Built in your browser; the generator does not upload network names or passwords"
    },
    useCases: [
      "A table card in a café, restaurant or waiting room",
      "The guest room or the fridge door at home",
      "Welcome folders in holiday rentals",
      "Meeting rooms and reception desks on a guest network",
      "Events and pop-up shops with temporary Wi-Fi"
    ],
    faqs: [
      {
        q: "Do guests need an app to scan it?",
        a: "Usually not. The camera app on recent iPhones and Android phones recognises Wi-Fi QR codes and offers to join the network. Some older phones need a QR scanner app."
      },
      {
        q: "Is it safe to put my Wi-Fi password in a QR code?",
        a: "Anyone who scans the code can read the password, just as if it were written on the card. For a code on public display, use a guest network rather than your main one."
      },
      {
        q: "My router uses WPA3. Will the code work?",
        a: "Choose the WPA/WPA2/WPA3 setting. Phones join WPA2 and mixed WPA2/WPA3 networks this way; a few WPA3-only setups may not accept it. Test the code with a couple of phones before printing."
      },
      {
        q: "Does the generator keep my password?",
        a: "No. The code is built in your browser, and the generator does not upload your network name or password."
      }
    ],
    relatedSlugs: [
      'google-reviews-qr-code-generator',
      'google-maps-location-qr-code-generator',
      'upi-qr-code-generator',
      'vcard-qr-code-generator',
      'whatsapp-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'vcard-qr-code-generator',
    name: 'vCard QR Code Generator',
    shortName: 'vCard QR',
    queryParam: 'wizard=vcard',
    category: 'Smart QR',
    metaTitle: 'Free vCard QR Code Generator: Digital Business Card VCF',
    metaDescription: 'Free vCard QR code generator. People scan your business card code and save your name, phone, email and website to their contacts without typing.',
    h1: 'Free vCard Digital Business Card QR Code Generator',
    lead: "Make a QR code that saves your contact details to someone's phone. They scan it, tap Add to Contacts, and your name, number and email are saved without any typing.",
    technicalSpec: {
      format: "vCard 3.0 (RFC 2426), stored as text inside the code",
      fields: "First and last name, company, job title, one phone number, email, website, address",
      opensIn: "The phone's contacts app, which asks before saving",
      photos: "Not included; a photo is far too large for a QR code",
      privacy: "Built in your browser; the generator does not upload your contact details"
    },
    useCases: [
      "The back of a printed business card",
      "Conference badges and name tags",
      "Email signatures and the last slide of a talk",
      "Shop counters and service vans, so customers save your number",
      "Property and recruitment flyers"
    ],
    faqs: [
      {
        q: "What does the other person see when they scan it?",
        a: "Their camera shows a contact preview. Tapping it opens the contacts app with your details filled in, and they decide whether to save it."
      },
      {
        q: "Can I add two phone numbers?",
        a: "Not at the moment. There is one phone field, saved as a work number, so use the number you most want people to call."
      },
      {
        q: "Does the generator keep my details?",
        a: "No. The card is built in your browser, and the generator does not upload your contact details."
      }
    ],
    relatedSlugs: [
      'wifi-qr-code-generator',
      'google-reviews-qr-code-generator',
      'google-maps-location-qr-code-generator',
      'upi-qr-code-generator',
      'whatsapp-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'crypto-qr-code-generator',
    name: 'Crypto QR Code Generator',
    shortName: 'Crypto QR',
    queryParam: 'wizard=crypto',
    category: 'Smart QR',
    metaTitle: 'Free Crypto QR Code Generator: Bitcoin, Ethereum & Solana',
    metaDescription: 'Free crypto QR code generator for Bitcoin, Ethereum and Solana wallet addresses, with an optional amount. Uses standard payment links. Download SVG or PNG.',
    h1: 'Free Crypto Payment & Wallet QR Code Generator',
    lead: "Make a QR code for your Bitcoin, Ethereum or Solana wallet address, with an optional amount. Wallet apps that read the standard payment links fill in the address for the payer. You only ever need your public address.",
    technicalSpec: {
      bitcoin: "bitcoin:address?amount=… (BIP-21)",
      ethereum: "ethereum:address?value=… (EIP-681; the amount is converted to wei)",
      solana: "solana:address?amount=… (Solana Pay transfer link)",
      amount: "Optional; leave it blank to let the payer choose",
      privacy: "Built in your browser. Only a public address is needed; never enter a private key or recovery phrase"
    },
    useCases: [
      "A donation or tip jar on a stream, blog or event poster",
      "Payment details on a freelance invoice",
      "A counter sign for a shop that accepts crypto",
      "Labelling your own receiving address on paper"
    ],
    faqs: [
      {
        q: "Do you ever need my private key or recovery phrase?",
        a: "No. You only enter a public wallet address and, if you like, an amount. The code is built in your browser and the generator does not upload it. Never type a private key or recovery phrase into any QR generator, this one included."
      },
      {
        q: "Will every wallet read the amount?",
        a: "Not always. Wallets differ in how much of these payment links they support; some read only the address. Ask the payer to check the address and amount on their screen before sending."
      },
      {
        q: "Can I use it for tokens such as USDT?",
        a: "Not at the moment. The generator makes plain BTC, ETH and SOL payment links. Token payments need extra fields that we don't build yet."
      },
      {
        q: "How do I check the code before printing?",
        a: "Scan it with your own wallet app and compare the first and last characters of the address with your wallet's receive screen."
      }
    ],
    relatedSlugs: [
      'upi-qr-code-generator',
      'wifi-qr-code-generator',
      'google-reviews-qr-code-generator',
      'plain-text-qr-code-generator',
      'vcard-qr-code-generator',
      'bulk-barcode-generator-excel'
    ]
  },
  {
    slug: 'email-qr-code-generator',
    name: 'Email QR Code Generator',
    shortName: 'Email QR',
    queryParam: 'wizard=email',
    category: 'Smart QR',
    metaTitle: 'Free Email QR Code Generator: Pre-Filled mailto & Subject',
    metaDescription: 'Free email QR code generator. One scan opens a new email with the address, subject and message already filled in. Download SVG or PNG.',
    h1: 'Free Pre-Filled Email (mailto) QR Code Generator',
    lead: "Make a QR code that opens a new email with the address, subject and message already filled in. The person who scans it reviews the draft in their own mail app and taps Send.",
    technicalSpec: {
      link: "mailto:address?subject=…&body=… (RFC 6068)",
      fields: "Recipient, subject and message",
      sending: "Nothing is sent until the person taps Send in their own mail app",
      privacy: "Built in your browser; the generator does not upload the address or message"
    },
    useCases: [
      "Warranty registration and support requests on product labels",
      "RSVPs for events and club sign-ups",
      "Feedback cards in shops and hotels",
      "Job ads and recruitment posters",
      "Reporting a fault from equipment or a meeting room"
    ],
    faqs: [
      {
        q: "Does the code send an email by itself?",
        a: "No. It opens a draft. The person sees the recipient, subject and message, can edit them, and decides whether to send."
      },
      {
        q: "Can I add CC or BCC addresses?",
        a: "Not at the moment. The generator fills in one recipient, the subject and the message."
      },
      {
        q: "What if the phone has no mail app set up?",
        a: "Then the phone may show nothing useful when the code is scanned. If your audience mostly uses webmail, consider a Website URL code that links to a contact form instead."
      },
      {
        q: "Does the generator keep my address or message?",
        a: "No. The code is built in your browser, and the generator does not upload them."
      }
    ],
    relatedSlugs: [
      'sms-qr-code-generator',
      'phone-call-qr-code-generator',
      'whatsapp-qr-code-generator',
      'vcard-qr-code-generator',
      'wifi-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'sms-qr-code-generator',
    name: 'SMS Text QR Code Generator',
    shortName: 'SMS QR',
    queryParam: 'wizard=sms',
    category: 'Smart QR',
    metaTitle: 'Free SMS QR Code Generator: Pre-Filled Text Message & SVG',
    metaDescription: 'Free SMS QR code generator. One scan opens a text message to your number with the words already filled in. Good for opt-ins, RSVPs and quick replies.',
    h1: 'Free Pre-Filled SMS Text Message QR Code Generator',
    lead: "Make a QR code that opens a text message to your number with the words already written. The person who scans it checks the message and taps Send, which is handy for keyword opt-ins, RSVPs and quick replies.",
    technicalSpec: {
      contents: "SMSTO:number:message (a format phone cameras commonly recognise)",
      number: "Digits and a leading + are kept; spaces and brackets are removed",
      sending: "Nothing is sent until the person taps Send; normal text charges apply to them",
      privacy: "Built in your browser; the generator does not upload the number or message"
    },
    useCases: [
      "Keyword sign-ups such as JOIN on posters and receipts",
      "RSVP cards for events",
      "Curbside pickup signs (text us when you arrive)",
      "Requests for a call back from a service van or yard sign"
    ],
    faqs: [
      {
        q: "Does the code send a text by itself?",
        a: "No. It opens the messaging app with your number and message filled in. The person can edit it and decides whether to send it."
      },
      {
        q: "How should I write the phone number?",
        a: "Include the country code with a +, for example +44 7700 900123. Spaces and brackets are removed for you. Without the country code the text may not reach you from abroad."
      },
      {
        q: "Does it work on iPhone and Android?",
        a: "The SMSTO format is widely recognised, but camera apps differ. Scan the printed code on both an iPhone and an Android phone before printing a batch."
      },
      {
        q: "Does the generator keep the number or message?",
        a: "No. The code is built in your browser, and the generator does not upload them."
      }
    ],
    relatedSlugs: [
      'email-qr-code-generator',
      'phone-call-qr-code-generator',
      'whatsapp-qr-code-generator',
      'vcard-qr-code-generator',
      'wifi-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'phone-call-qr-code-generator',
    name: 'Phone Call QR Code Generator',
    shortName: 'Phone QR',
    queryParam: 'wizard=phone',
    category: 'Smart QR',
    metaTitle: 'Free Phone Call QR Code Generator: 1-Tap tel: Dialing & SVG',
    metaDescription: 'Free phone call QR code generator. One scan shows your number ready to dial, with no typing. Good for vans, signs, menus and storefronts.',
    h1: 'Free Click-to-Call Phone Dialer QR Code Generator',
    lead: "Make a QR code that puts your phone number on the caller's screen, ready to dial. The phone always asks before calling, so it is a quick way to get calls from vans, signs, menus and shop doors.",
    technicalSpec: {
      link: "tel:+number (RFC 3966)",
      number: "Digits and a leading + are kept; spaces, dashes and brackets are removed",
      dialing: "The phone shows the number and asks before calling",
      privacy: "Built in your browser; the generator does not upload the phone number"
    },
    useCases: [
      "Service vans and trade vehicles",
      "For-sale and to-let signs",
      "Takeaway menus and shop doors",
      "Out-of-hours and help numbers on equipment"
    ],
    faqs: [
      {
        q: "Will scanning the code start a call straight away?",
        a: "No. The phone shows the number and asks the person to confirm before it dials."
      },
      {
        q: "How should I write the number?",
        a: "Use the international format with a +, for example +1 800 555 0199. Without the country code, people calling from another country may not get through."
      },
      {
        q: "Can I add an extension?",
        a: "Not at the moment. The generator keeps only digits and the +, so extensions are left out. Point the code at a direct line if you have one."
      },
      {
        q: "How big should I print it?",
        a: "A common rule of thumb is to make the code at least a tenth of the scanning distance: about 3 cm for a menu read at arm's length, about 10 cm for a sign read from a metre away. Test-scan at the real distance."
      }
    ],
    relatedSlugs: [
      'sms-qr-code-generator',
      'email-qr-code-generator',
      'whatsapp-qr-code-generator',
      'vcard-qr-code-generator',
      'wifi-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'calendar-event-qr-code-generator',
    name: 'Calendar Event QR Code Generator',
    shortName: 'Event QR',
    queryParam: 'wizard=event',
    category: 'Smart QR',
    metaTitle: 'Free Calendar Event QR Code Generator (iCal & Outlook)',
    metaDescription: 'Free calendar event QR code generator. Add the title, place, start and end time and notes; guests scan to add the event to their phone calendar.',
    h1: 'Free iCal Calendar Event QR Code Generator',
    lead: "Make a QR code that adds your event to a phone calendar. Enter the title, place, start and end time and a short note. Guests scan it and save the event, already set to the right time in their own time zone.",
    technicalSpec: {
      format: "iCalendar VEVENT text (RFC 5545) inside the code",
      fields: "Title, location, start, end and notes",
      times: "Converted to UTC, so phones show the event in the reader's own time zone",
      allDayEvents: "Not supported yet; use a start and end time",
      privacy: "Built in your browser; the generator does not upload the event details"
    },
    useCases: [
      "Wedding invitations and save-the-date cards",
      "Posters for talks, classes and open days",
      "Conference programmes and badges",
      "Appointment reminder cards"
    ],
    faqs: [
      {
        q: "Will the time be right for guests in other time zones?",
        a: "Yes. The time you enter is taken as your local time and stored in UTC, so each phone shows it in its own time zone. Check the start time after scanning the preview."
      },
      {
        q: "Which phones can add the event?",
        a: "Many phone cameras recognise calendar QR codes and offer to add the event, but support varies by phone and app. Test with an iPhone and an Android phone before printing, and print the date and time next to the code as well."
      },
      {
        q: "Can I make an all-day event?",
        a: "Not yet. Every event has a start and an end time. For a whole day, use the opening and closing times."
      },
      {
        q: "What if the date changes?",
        a: "The details are inside the code, so a new date needs a new code. A Website URL code pointing to an event page is easier to keep current."
      }
    ],
    relatedSlugs: [
      'google-maps-location-qr-code-generator',
      'whatsapp-qr-code-generator',
      'vcard-qr-code-generator',
      'wifi-qr-code-generator',
      'upi-qr-code-generator',
      'google-reviews-qr-code-generator'
    ]
  },
  {
    slug: 'google-maps-location-qr-code-generator',
    name: 'Google Maps Location QR Code Generator',
    shortName: 'Maps QR',
    queryParam: 'wizard=location',
    category: 'Smart QR',
    metaTitle: 'Free Google Maps Location QR Code Generator (GPS & Address)',
    metaDescription: 'Make a free QR code that opens a place in Google Maps from an address, a place name or GPS coordinates. Static code, no sign-up. Download SVG or PNG.',
    h1: 'Free Google Maps Location QR Code Generator',
    lead: 'Make a QR code that opens a place in Google Maps: your shop, a wedding venue, the gate of a car park. Type an address or a place name, or use GPS coordinates for a spot that has no address. People scan it, see the pin and tap Directions.',
    technicalSpec: {
      link: 'https://www.google.com/maps/search/?api=1&query=... (Google\'s documented Maps URL; no API key)',
      whatYouEnter: 'A place name, an address, or latitude and longitude. If both are filled in, the coordinates are used',
      opensIn: 'The Google Maps app if it is installed, otherwise Google Maps in the phone\'s browser',
      codeType: 'Static QR code (ISO/IEC 18004). No redirect through us, no account',
      privacy: 'Built in your browser; the generator does not upload the address or coordinates'
    },
    useCases: [
      'A "find us" code on shop windows, flyers and business cards',
      'Wedding and party invitations, so guests reach the right venue',
      'Open-house signs and property brochures',
      'Check-in cards at hotels and holiday rentals',
      'Car park entrances, trailheads and event gates that have no street address'
    ],
    faqs: [
      {
        q: 'Can I use latitude and longitude instead of an address?',
        a: 'Yes. Fill in both boxes with decimal numbers, latitude first (for example 37.7749 and -122.4194). This is the best option for places with no street address, such as a field used for a festival or the side gate of a venue.'
      },
      {
        q: 'Does the code start turn-by-turn navigation?',
        a: 'Not straight away. It opens Google Maps with a pin on the place. From there the person taps Directions, and Google Maps routes them from wherever they are.'
      },
      {
        q: 'How do I find the coordinates of a spot?',
        a: 'On a computer, right-click the spot in Google Maps; the coordinates are the first line of the menu, and clicking them copies them. On a phone, touch and hold the spot until a pin drops, and the coordinates appear at the top of the screen or in the place details.'
      },
      {
        q: 'Will the code expire?',
        a: 'The code itself does not expire. The Maps link is stored inside it, with no redirect through us and no subscription to lapse. It keeps working for as long as Google supports this link format, which it documents for public use.'
      }
    ],
    relatedSlugs: [
      'google-reviews-qr-code-generator',
      'upi-qr-code-generator',
      'wifi-qr-code-generator',
      'vcard-qr-code-generator',
      'whatsapp-qr-code-generator',
      'calendar-event-qr-code-generator'
    ]
  },
  {
    slug: 'plain-text-qr-code-generator',
    name: 'Plain Text QR Code Generator',
    shortName: 'Text QR',
    queryParam: 'wizard=text',
    category: 'Smart QR',
    metaTitle: 'Free Plain Text QR Code Generator: Raw Notes & Multi-Line',
    metaDescription: 'Free plain text QR code generator for notes, instructions and serial numbers. The text is inside the code, so phones show it without a website.',
    h1: 'Free Plain Text Multi-Line QR Code Generator',
    lead: "Put plain text, multi-line notes or serial numbers into a QR code. Phones show the text when scanned, with no website in between.",
    technicalSpec: {
      contents: "Your text, exactly as typed, including line breaks",
      capacity: "Up to 2,953 bytes in the largest QR size at error correction level L; short text gives a smaller, easier code",
      reading: "Shown on the phone without opening a website",
      privacy: "Built in your browser; the generator does not upload your text"
    },
    useCases: [
      "Short instructions on equipment and machines",
      "Serial and asset numbers on labels",
      "Puzzles, quizzes and scavenger hunts",
      "Public keys and wallet deposit addresses (never private keys or recovery phrases)"
    ],
    faqs: [
      {
        q: "Is the text private?",
        a: "The text is encoded in your browser and the generator does not upload it. But a QR code is not encrypted: anyone who scans it can read the text. Do not put passwords, private keys or recovery phrases in a plain text QR code."
      },
      {
        q: "How much text fits?",
        a: "The QR standard allows up to 2,953 bytes in the largest size, but a code that full is hard to scan. A few lines is a good limit for anything printed smaller than a postcard."
      },
      {
        q: "Will line breaks show?",
        a: "Yes, they are kept in the code. How they look depends on the scanning app."
      }
    ],
    relatedSlugs: [
      'wifi-qr-code-generator',
      'vcard-qr-code-generator',
      'crypto-qr-code-generator',
      'google-reviews-qr-code-generator',
      'code-128-barcode-generator',
      'bulk-barcode-generator-excel'
    ]
  },
  {
    slug: 'amazon-fba-fnsku-barcode-generator',
    name: 'Amazon FBA / FNSKU Barcode Generator',
    shortName: 'Amazon FBA / FNSKU',
    queryParam: 'symbology=code-128&preset=amazon-fnsku-5160&label=1',
    category: 'Retail & POS',
    metaTitle: 'Free Amazon FBA FNSKU Barcode Generator: Avery 5160 SVG',
    metaDescription: 'Free Amazon FNSKU label generator. Make Code 128 FNSKU labels with product name and condition on Avery 5160 sheets or thermal labels. Download a PDF.',
    h1: 'Free Amazon FBA FNSKU Barcode & Label Generator',
    lead: "Make Amazon FBA unit labels from your FNSKU: a Code 128 barcode with the product name and condition, sized for Avery 5160 sheets or 1 × 2-5/8 inch thermal labels. Seller Central can print these labels too; this is a free alternative when you need more control.",
    technicalSpec: {
      barcode: "Code 128 of your FNSKU (from Seller Central)",
      labelContents: "Product name, FNSKU barcode and condition",
      labelSize: "1 × 2-5/8 in (Avery 5160 sheet, 30 per page, or thermal)",
      whiteSpace: "0.25 in at the sides and 0.125 in top and bottom, as Amazon's label instructions describe",
      printing: "Laser or thermal printer; Amazon advises against inkjet",
      privacy: "Built in your browser; the generator does not upload your FNSKUs or product names"
    },
    useCases: [
      "Labelling units before sending them to an Amazon warehouse",
      "Relabelling returned or damaged-label stock",
      "Small batches where printing from Seller Central is awkward"
    ],
    faqs: [
      {
        q: "What is the difference between an FNSKU and a UPC?",
        a: "A UPC is the product's GS1 number and identifies the product anywhere. An FNSKU is Amazon's own code that ties a unit to your seller account inside Amazon's warehouses. Amazon shows the FNSKU for each listing in Seller Central."
      },
      {
        q: "Do I need to cover the original barcode?",
        a: "Amazon asks for only one scannable barcode on the outside of each unit, so cover any existing barcode with the FNSKU label. Check Amazon's current labelling rules for your marketplace."
      },
      {
        q: "Can I print on an inkjet printer?",
        a: "Amazon's label guidance asks sellers not to use inkjet printers for these labels, because the ink can smudge. Use a laser or thermal printer."
      },
      {
        q: "Does the generator keep my FNSKUs?",
        a: "No. FNSKU labels are built in your browser, and the generator does not upload your FNSKUs, product titles or SKU lists."
      }
    ],
    relatedSlugs: [
      'do-i-need-a-barcode-to-sell-on-amazon',
      'avery-5160-barcode-generator',
      'code-128-barcode-generator',
      'upc-a-barcode-generator',
      'how-to-get-a-barcode-for-your-product',
      'bulk-barcode-generator-excel'
    ]
  },
  {
    slug: 'google-reviews-qr-code-generator',
    name: 'Google Reviews QR Code Generator',
    shortName: 'Google Review QR',
    queryParam: 'symbology=qr-code&wizard=google_review',
    category: 'Smart QR',
    metaTitle: 'Free Google Review QR Code Generator: Open the Review Box',
    metaDescription: 'Make a free QR code that opens your Google review form in one scan. Paste your Place ID or review link, then download SVG or a high-resolution PNG.',
    h1: 'Free Google Reviews QR Code Generator',
    lead: "Make a QR code that opens your Google review box in one scan, so customers can leave a review without searching for your business first.",
    technicalSpec: {
      input: "Your Google review link, or a Place ID that starts with ChIJ",
      placeIdLink: "search.google.com/local/writereview?placeid=… (built for you from a Place ID)",
      opensIn: "Google Maps or the browser; posting a review needs a Google account",
      privacy: "Built in your browser; the generator does not upload your link or Place ID"
    },
    useCases: [
      "Counter and table cards in cafés and restaurants",
      "Receipts and thank-you cards",
      "Follow-up cards from tradespeople and salons",
      "Hotel and holiday-rental welcome sheets"
    ],
    faqs: [
      {
        q: "Where do I find my review link?",
        a: "In your Google Business Profile, look for the option to ask for reviews and copy the link it gives you. Paste it into the generator as it is."
      },
      {
        q: "What is a Place ID, and do I need one?",
        a: "It is Google's ID for your listing and starts with ChIJ. You only need it if you don't have a review link. Paste it and the generator builds the review link."
      },
      {
        q: "Does the app or the browser open?",
        a: "If the Google Maps app is installed, the link usually opens there, where the customer is often already signed in. Otherwise it opens in the phone's web browser. Either way, posting a review needs a Google account."
      },
      {
        q: "Can I ask only happy customers for a review?",
        a: "No. Google's review policy doesn't allow businesses to discourage negative reviews or to ask only satisfied customers. Offer the code to everyone, and don't offer rewards for reviews."
      }
    ],
    relatedSlugs: [
      'google-maps-location-qr-code-generator',
      'wifi-qr-code-generator',
      'whatsapp-qr-code-generator',
      'vcard-qr-code-generator',
      'upi-qr-code-generator',
      'calendar-event-qr-code-generator'
    ]
  },
  {
    slug: 'whatsapp-qr-code-generator',
    name: 'WhatsApp QR Code Generator',
    shortName: 'WhatsApp QR',
    queryParam: 'symbology=qr-code&wizard=whatsapp',
    category: 'Smart QR',
    metaTitle: 'Free WhatsApp QR Code Generator: Direct Chat & wa.me Link',
    metaDescription: 'Free WhatsApp QR code generator. One scan opens a chat with your number and an optional greeting already typed, without saving your number first.',
    h1: 'Free WhatsApp Direct Chat QR Code Generator',
    lead: "Make a QR code that opens a WhatsApp chat with your number, with an optional greeting already typed. Customers don't need to save your number first.",
    technicalSpec: {
      link: "https://wa.me/number?text=… (WhatsApp's click-to-chat link)",
      number: "Full international number, digits only; anything else is removed",
      message: "Optional; the person can edit it before sending",
      privacy: "Built in your browser; the generator does not upload the number or message"
    },
    useCases: [
      "Order and booking signs for small shops and home businesses",
      "Support stickers on products",
      "Event and tour group check-ins",
      "Flyers and business cards"
    ],
    faqs: [
      {
        q: "How do I write the number?",
        a: "Use the full international number without the + or leading zeros, for example 919876543210 for an Indian mobile or 15551234567 for a US one. The generator removes spaces and symbols."
      },
      {
        q: "Does the message send automatically?",
        a: "No. The chat opens with the greeting in the text box, and the person decides whether to send it."
      },
      {
        q: "What happens on a computer or a phone without WhatsApp?",
        a: "The wa.me link opens a WhatsApp page in the browser, which offers WhatsApp Web or the app download."
      },
      {
        q: "Does the generator keep my number?",
        a: "No. The code is built in your browser, and the generator does not upload the number or message."
      }
    ],
    relatedSlugs: [
      'upi-qr-code-generator',
      'wifi-qr-code-generator',
      'vcard-qr-code-generator',
      'google-maps-location-qr-code-generator',
      'google-reviews-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  },
  {
    slug: 'upi-qr-code-generator',
    name: 'UPI QR Code Generator',
    shortName: 'UPI Payment QR',
    queryParam: 'symbology=qr-code&wizard=upi',
    category: 'Smart QR',
    metaTitle: 'Free UPI QR Code Generator: PhonePe, GPay, Paytm & Amount',
    metaDescription: 'Free UPI QR code generator for your UPI ID. Add a fixed amount, a note or your shop logo. Customers pay with Google Pay, PhonePe, Paytm, BHIM or their bank app.',
    h1: 'Free UPI Scan-to-Pay QR Code Generator',
    lead: "Make a UPI payment QR code for your UPI ID. Add a fixed amount for a bill, leave it open for a shop counter, put a note such as an invoice number, or add your logo. Customers scan it with Google Pay, PhonePe, Paytm, BHIM or their bank's UPI app, check the details and pay.",
    technicalSpec: {
      link: "upi://pay?pa=UPI ID&pn=name&cu=INR&am=amount&tn=note",
      fields: "UPI ID (VPA), payee name, optional amount in rupees, optional note",
      worksWith: "A UPI ID from any bank or UPI app, including a mobile-number UPI ID",
      logo: "Optional; the code switches to the highest error correction so it still scans",
      payments: "Built in your browser; UniversalCodeMaker never handles the payment"
    },
    useCases: [
      "A counter stand for a shop, kirana store or food stall",
      "Bills and invoices with a fixed amount and the invoice number as the note",
      "Donations for a temple, NGO, society or fundraiser",
      "Table cards in cafés and restaurants",
      "Freelancers and tutors collecting fees"
    ],
    faqs: [
      {
        q: "Which apps can pay with this code?",
        a: "It uses the standard upi://pay link, which UPI apps such as Google Pay, PhonePe, Paytm and BHIM are built to read, as do banks' own UPI apps. Test it with the apps your customers use before printing."
      },
      {
        q: "How do I make a UPI QR code with a fixed amount?",
        a: "Enter the amount in rupees. The payer sees it filled in and only has to confirm. Leave it blank for a shop counter, where every bill is different."
      },
      {
        q: "Can I make a UPI QR code for my shop or business?",
        a: "Yes. Enter your business UPI ID and shop name, leave the amount blank, and print the code on a counter card or sticker. Print your UPI ID in text beside it too, for anyone who prefers to type it."
      },
      {
        q: "Can I use it for donations?",
        a: "Yes. Leave the amount blank so people can give what they like, and put something like Donation or the cause in the note so you can recognise the payments later."
      },
      {
        q: "Does it work with my bank account or my mobile number?",
        a: "It works with any UPI ID. Your bank or UPI app shows your UPI ID; some apps give you one based on your mobile number. Enter that ID exactly as the app shows it. The code doesn't hold your account number."
      },
      {
        q: "Can I add my logo?",
        a: "Yes. Upload your logo in the studio and it goes in the centre of the code. The studio switches to the highest error correction so the code still scans. Keep the logo small and test the printed code."
      },
      {
        q: "What happens if I leave the payee name blank?",
        a: "The code uses Merchant as the name. Use your shop or account name instead, so payers can check they are paying the right person."
      },
      {
        q: "Can I get a UPI payment link instead of a QR code?",
        a: "Yes. Under the form in the studio, open What's inside this code and press Copy text. You get the upi://pay link with your UPI ID, name, amount and note. It opens only on phones with a UPI app, so it suits WhatsApp or SMS messages and payment buttons on a mobile website; on a computer it does nothing."
      },
      {
        q: "Can I turn an existing UPI QR code into a link?",
        a: "Yes. Open our <a href=\"../barcode-scanner.html\">barcode scanner</a> and upload a photo of the code. It shows the upi://pay link inside, including the UPI ID, name and amount, and you can copy it."
      },
      {
        q: "Are there fees?",
        a: "UniversalCodeMaker charges nothing and never handles the money. The code points to your UPI ID, so payments reach your bank account through UPI. Any charges are set by your bank or payment app, not by us."
      },
      {
        q: "How do I know a customer has paid?",
        a: "Check your own UPI app or bank notification. Don't rely on a screenshot from the customer."
      }
    ],
    relatedSlugs: [
      'google-reviews-qr-code-generator',
      'google-maps-location-qr-code-generator',
      'wifi-qr-code-generator',
      'vcard-qr-code-generator',
      'whatsapp-qr-code-generator',
      'plain-text-qr-code-generator'
    ]
  }
,
  {
    slug: 'avery-5160-barcode-generator',
    name: 'Avery 5160 Barcode & QR Code Label Generator',
    shortName: 'Avery 5160',
    queryParam: 'label=open&preset=avery-5160',
    category: 'Retail & POS',
    metaTitle: 'Free Avery 5160 Barcode Generator: 30-Up Label Sheet PDF',
    metaDescription: 'Free barcode and QR code labels on Avery 5160 sheets: 30 labels per US Letter page. Same code on every label, or a different code per label. PDF download.',
    h1: 'Free Avery 5160 Barcode & Label Sheet Generator',
    lead: "Print barcodes and QR codes on Avery 5160 label sheets: 30 labels of 1 × 2-5/8 inches on a US Letter page. Fill the sheet with the same code, or use the batch tool to put a different code on each label.",
    technicalSpec: {
      sheet: "US Letter, 3 columns × 10 rows (30 labels)",
      labelSize: "1 × 2-5/8 in (25.4 × 66.7 mm)",
      alsoSupported: "Avery 5163 (10 per Letter sheet) and Avery L7160 (21 per A4 sheet)",
      modes: "Same code on every label, or a list of up to 200 different codes",
      output: "PDF built in your browser",
      privacy: "Built in your browser; the generator does not upload your codes or labels"
    },
    useCases: [
      "Product and price labels for a small shop",
      "Asset tags and inventory labels",
      "Amazon FNSKU labels",
      "Address or event labels with a QR code"
    ],
    faqs: [
      {
        q: "Can each label have a different barcode?",
        a: "Yes. In the batch tool, paste a list of values or generate a numbered sequence and choose the Avery 5160 sheet. Each value goes on its own label, in order."
      },
      {
        q: "My labels don't line up. What should I check?",
        a: "Print at Actual size or 100%. Fit to page shrinks the layout so labels drift down the sheet. Print one page on plain paper and hold it against a label sheet before using labels."
      },
      {
        q: "Which other Avery sheets work?",
        a: "The tool has layouts for Avery 5160 (and 8160, the same layout), 5163 and L7160. Other products work only if they use exactly the same layout."
      }
    ],
    relatedSlugs: [
      'bulk-barcode-generator-excel',
      'amazon-fba-fnsku-barcode-generator',
      'code-128-barcode-generator',
      'code-39-barcode-generator',
      'upc-a-barcode-generator',
      'how-to-get-a-barcode-for-your-product'
    ]
  },
  {
    slug: 'isbn-book-barcode-generator',
    name: 'ISBN Book Barcode Generator',
    shortName: 'ISBN-13 Bookland',
    queryParam: 'symbology=isbn',
    category: 'Retail & POS',
    metaTitle: 'Free ISBN Book Barcode Generator: Bookland EAN-13 & SVG',
    metaDescription: 'Free ISBN barcode generator for book covers. Enter your 13-digit ISBN and an optional 5-digit price add-on. Download SVG, PNG or EPS for the cover.',
    h1: 'Free ISBN-13 Bookland Barcode Generator',
    lead: "Make the barcode for the back cover of a book from your 13-digit ISBN, with an optional 5-digit price add-on. The ISBN itself comes from your national ISBN agency; this tool draws the barcode.",
    technicalSpec: {
      input: "A 13-digit ISBN starting 978 or 979, with or without hyphens",
      symbol: "EAN-13 (Bookland), the barcode used for ISBNs",
      priceAddOn: "Optional 5-digit add-on (EAN-5)",
      printSize: "Based on a 0.330 mm narrow bar, as for EAN-13",
      downloads: "SVG, PNG and EPS",
      privacy: "Built in your browser; the generator does not upload your ISBN"
    },
    useCases: [
      "Back covers of self-published books",
      "Replacement barcodes when a cover is redesigned",
      "Small presses printing their own covers"
    ],
    faqs: [
      {
        q: "How do I get a barcode for my book?",
        a: "First get an ISBN from the ISBN agency for your country (in the US that is Bowker). Then enter the 13-digit ISBN here, add a price add-on if your market uses one, and download the file for your cover designer."
      },
      {
        q: "What is the 5-digit add-on?",
        a: "An optional second barcode to the right of the main one. In the US the first digit is the currency (5 for US dollars) and the rest is the price, so 51995 means $19.95. 90000 means no price is encoded."
      },
      {
        q: "My printer or publishing platform makes a barcode for me. Do I need this?",
        a: "Some print-on-demand services add a barcode to the cover automatically. Check their cover guidelines; if they do, you don't need a separate one."
      },
      {
        q: "Can I use a 10-digit ISBN?",
        a: "Not directly. The barcode uses the 13-digit form. Older 10-digit ISBNs have a 978 equivalent; your ISBN agency's records show it."
      }
    ],
    relatedSlugs: ['how-to-get-a-barcode-for-your-product', 'ean-13-barcode-generator', 'upc-vs-ean-13-barcode']
  },
  {
    slug: 'code-39-barcode-generator',
    name: 'Code 39 Barcode Generator',
    shortName: 'Code 39 Asset',
    queryParam: 'symbology=code-39',
    category: 'Logistics & 1D',
    metaTitle: 'Free Code 39 Barcode Generator: Asset Tags & Mod-43 SVG',
    metaDescription: 'Free Code 39 barcode generator for asset tags and inventory labels. Uppercase letters, digits and a few symbols, optional Mod-43 check digit. SVG, PNG, EPS.',
    h1: 'Free Code 39 Asset & Industrial Barcode Generator',
    lead: "Make a Code 39 barcode for asset tags, inventory and older systems that expect it. It takes uppercase letters, digits and a few symbols, and can add an optional Mod-43 check digit.",
    technicalSpec: {
      standard: "ISO/IEC 16388",
      characters: "0–9, A–Z (uppercase), space and - . $ / + %",
      startStop: "The * start and stop characters are added for you",
      checkDigit: "Optional Mod-43 (tick Include Mod-43 Check Digit)",
      quietZone: "At least 10 narrow-bar widths on each side",
      downloads: "SVG, PNG and EPS downloads, plus Avery 5160, 5163 and L7160 label sheets",
      privacy: "Built in your browser; the generator does not upload your asset numbers"
    },
    useCases: [
      "IT and equipment asset tags",
      "Inventory labels for systems that already use Code 39",
      "Library and file labels"
    ],
    faqs: [
      {
        q: "Code 39 or Code 128?",
        a: "Use Code 39 when your system or scanner setup expects it. For anything new, Code 128 is shorter for the same data and takes lowercase letters."
      },
      {
        q: "Should I add the Mod-43 check digit?",
        a: "Only if the system reading the code expects it. If it doesn't, the extra character can end up in the scanned value."
      },
      {
        q: "Why can't I use lowercase letters?",
        a: "Standard Code 39 only has 43 characters: digits, uppercase letters, space and six symbols."
      }
    ],
    relatedSlugs: [
      'code-128-barcode-generator',
      'avery-5160-barcode-generator',
      'bulk-barcode-generator-excel',
      'data-matrix-generator',
      'itf-14-barcode-generator',
      'amazon-fba-fnsku-barcode-generator'
    ]
  },
  {
    slug: 'bulk-barcode-generator-excel',
    name: 'Bulk Barcode Generator from Excel',
    shortName: 'Bulk Excel / CSV',
    queryParam: 'batch=open',
    category: 'Logistics & 1D',
    metaTitle: 'Free Bulk Barcode Generator: Excel, CSV & Sequential',
    metaDescription: 'Free bulk barcode generator. Paste a column from Excel or a CSV, or make a numbered series, and download up to 200 codes as a ZIP or Avery label sheets.',
    h1: 'Free Bulk Barcode Generator from Excel & CSV',
    lead: "Make up to 200 barcodes or QR codes at once. Paste a column from Excel or Google Sheets, paste CSV text (the first column is used), or generate a numbered series. Download them as a ZIP of image files or as Avery label sheets.",
    technicalSpec: {
      input: "Pasted lines, the first column of a CSV, or a numbered series",
      series: "Prefix, start number, count, zero-padding and suffix (e.g. SKU-001 to SKU-200)",
      limit: "200 values per batch",
      outputs: "ZIP of SVG or PNG files, or Avery 5160, 5163 or L7160 PDF sheets",
      fileNames: "Numbered in order, e.g. 001_SKU-A101.svg",
      checks: "Invalid values (for example a wrong check digit) stop the batch and are listed by line",
      privacy: "Processed in your browser; the generator does not upload your list"
    },
    useCases: [
      "Labels for a whole product range",
      "Numbered asset tags and serial labels",
      "QR codes for a list of web addresses",
      "A sheet of different FNSKU or SKU labels"
    ],
    faqs: [
      {
        q: "How do I get my data in from Excel?",
        a: "Select the column of values in Excel or Google Sheets, copy it, and paste it into the batch box. One value per line. If you paste CSV text, the first column is used."
      },
      {
        q: "What happens if one value is invalid?",
        a: "The batch stops and lists the line numbers with problems, such as a UPC with a wrong check digit, so you can fix them before printing."
      },
      {
        q: "Why the 200 limit?",
        a: "Everything is drawn in your browser, and very large batches can make it slow or unstable. Split longer lists into several batches."
      }
    ],
    relatedSlugs: [
      'avery-5160-barcode-generator',
      'code-128-barcode-generator',
      'code-39-barcode-generator',
      'shopify-barcode-generator',
      'amazon-fba-fnsku-barcode-generator',
      'how-to-get-a-barcode-for-your-product'
    ]
  },
  {
    slug: 'shopify-barcode-generator',
    name: 'Shopify Product Barcode Generator',
    shortName: 'Shopify Barcode',
    queryParam: 'symbology=upc-a&preset=retail-225-125',
    category: 'Retail & POS',
    metaTitle: 'Free Shopify Barcode Generator: Product SKUs & POS Tags',
    metaDescription: 'Free barcode labels for Shopify products. Make UPC-A, EAN-13 or Code 128 barcodes from your product list and print price tags or Avery sheets.',
    h1: 'Free Shopify Product Barcode & SKU Generator',
    lead: "Make barcode labels for your Shopify products: UPC-A or EAN-13 for products with GS1 numbers, Code 128 for your own SKUs. Print 2.25 × 1.25 inch thermal price tags or Avery sheets, and scan them with Shopify POS.",
    technicalSpec: {
      formats: "UPC-A or EAN-13 (GS1 numbers), Code 128 (your own SKUs)",
      labels: "2.25 × 1.25 in thermal price tag, or Avery 5160, 5163 and L7160 sheets",
      bulk: "Paste a column from your Shopify product export, up to 200 values per batch",
      shopifyField: "Shopify's Barcode field on each variant holds the number",
      privacy: "Built in your browser; the generator does not upload your product list"
    },
    useCases: [
      "Price tags for products in a physical shop",
      "Variant labels for sizes and colours",
      "Labels for stock counts with Shopify POS"
    ],
    faqs: [
      {
        q: "Do I need GS1 barcodes for Shopify?",
        a: "It depends on where you sell. If you only sell on your online store or in-person using Shopify POS, you usually do not need GS1 barcodes; Code 128 labels made from your own SKUs work fine with a scanner. If you list products on channels such as Amazon, Walmart or Google Shopping, they generally ask for GS1-issued UPC or EAN numbers (GTINs), though the rules and exemptions differ by channel. Check each channel's current requirements before you print."
      },
      {
        q: "How do I make labels for my whole catalogue?",
        a: "Export your products from Shopify admin as a CSV, copy the SKU or Barcode column, and paste it into the batch tool. Choose the barcode type and a label sheet, then download the PDF."
      },
      {
        q: "Where does the number go in Shopify?",
        a: "In each product variant, in the Barcode field. Shopify POS scans that number to find the variant."
      }
    ],
    relatedSlugs: [
      'bulk-barcode-generator-excel',
      'avery-5160-barcode-generator',
      'upc-a-barcode-generator',
      'code-128-barcode-generator',
      'ean-13-barcode-generator',
      'how-to-get-a-barcode-for-your-product'
    ]
  }
];

const ENRICHMENTS = {
  "ean-13-barcode-generator": {
    "benefits": [
      {
        "title": "EAN-13 for Product Identifiers",
        "desc": "Turn a GTIN-13 into a barcode graphic for product labels and packaging artwork."
      },
      {
        "title": "Calculate or Check the Last Digit",
        "desc": "Enter 12 data digits to calculate the final digit, or enter all 13 to check it."
      },
      {
        "title": "Vector and Raster Downloads",
        "desc": "Export SVG or EPS for artwork, or PNG for documents and labels."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling packaged retail goods outside the US?",
        "a": "EAN-13 is the standard checkout barcode for consumer products in supermarkets and retail chains in most countries outside the US and Canada."
      },
      {
        "q": "Selling on Amazon or Google Shopping globally?",
        "a": "Use the product's GTIN-13 for its barcode image. For listing identifiers, exemptions and FBA labels, see the Amazon seller guide linked below."
      },
      {
        "q": "Need barcodes for internal warehouse or asset tracking?",
        "a": "Use an internal identifier in a format such as Code 128 when the code stays inside your own system. Confirm the format and data rules with the warehouse, retailer or platform that will receive it."
      }
    ],
    "legalCaution": {
      "title": "Identifier Options & Printing Checks",
      "points": [
        "GS1 licensing options vary by country; GS1 US offers individual GTINs as well as company prefixes. See the product-barcode guide for obtaining and assigning numbers.",
        "Always keep the quiet zones clear (3.63 mm on the left, 2.31 mm on the right at the target size). Text or artwork inside them, or shortened (truncated) bars, make the barcode harder to scan; GS1 advises against both.",
        "Never print in colour combinations that look low-contrast under red light (e.g., red bars on white, or black bars on green). Checkout scanners use red light, so bars must be dark and the background light. Retailers that test print quality grade it under ISO/IEC 15416."
      ]
    },
    "authorityLinks": [
      {
        "name": "GS1 UK: Check Digits",
        "desc": "How the last digit is calculated and what it checks.",
        "url": "https://www.gs1uk.org/knowledge-hub/standards/what-is-a-check-digit"
      },
      {
        "name": "GS1 Sweden: Consumer-Item Sizes",
        "desc": "Application-specific dimensions, bar heights and quiet zones.",
        "url": "https://gs1.se/en/guides/how-to-guides/size-guide/"
      },
      {
        "name": "ISO/IEC 15420 International Standard",
        "desc": "ISO standard specification for EAN/UPC bar code symbology.",
        "url": "https://www.iso.org/standard/84892.html"
      }
    ]
  },
  "upc-a-barcode-generator": {
    "benefits": [
      {
        "title": "Check digit done for you",
        "desc": "Type 11 digits and the 12th is calculated with the GS1 Mod-10 rule; type 12 and a wrong last digit is flagged."
      },
      {
        "title": "Print-size aware",
        "desc": "The default bar height follows the GS1 nominal size, and the height control warns when you go below GS1's minimum."
      },
      {
        "title": "Files for print shops",
        "desc": "SVG and EPS keep the bar widths exact at any size; PNG suits documents and labels."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling in the US or Canada?",
        "a": "UPC-A is the usual choice. Get the number from GS1 US or GS1 Canada first."
      },
      {
        "q": "Selling mainly outside North America?",
        "a": "Use EAN-13. Checkout scanners worldwide read both, but EAN-13 is the norm elsewhere."
      },
      {
        "q": "Labelling an outer shipping carton?",
        "a": "Use ITF-14 rather than UPC-A."
      }
    ],
    "legalCaution": {
      "title": "Rules to know",
      "points": [
        "Making the barcode image doesn't give you the number. Retail UPCs are licensed through GS1, and marketplaces check the number against GS1's records.",
        "Each product variant, such as a size or colour, needs its own number."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Universal Product Code (UPC)",
        "desc": "History, 12-digit encoding structure, and parity check details.",
        "url": "https://en.wikipedia.org/wiki/Universal_Product_Code"
      },
      {
        "name": "GS1 US Official Barcode Portal",
        "desc": "Official guide for obtaining genuine US retail barcode prefixes.",
        "url": "https://www.gs1us.org/upcs-barcodes-prefixes/get-a-barcode"
      },
      {
        "name": "ISO/IEC 15420 International Standard",
        "desc": "ISO barcode symbology specification for EAN/UPC linear barcodes.",
        "url": "https://www.iso.org/standard/84892.html"
      }
    ]
  },
  "code-128-barcode-generator": {
    "benefits": [
      {
        "title": "Letters and numbers",
        "desc": "SKUs like ABC-1042 work as they are, without converting them to digits."
      },
      {
        "title": "Compact for long numbers",
        "desc": "Runs of digits are packed two per symbol, so long numbers stay short."
      },
      {
        "title": "Read by almost any scanner",
        "desc": "Code 128 is one of the most widely supported linear barcodes in warehouses and shops."
      }
    ],
    "decisionGuide": [
      {
        "q": "Internal SKUs, bins or asset tags?",
        "a": "Code 128 is a good default."
      },
      {
        "q": "Products sold in shops?",
        "a": "Checkout systems expect UPC-A or EAN-13 with a GS1 number, not Code 128."
      },
      {
        "q": "A retailer asked for GS1-128 on cartons?",
        "a": "This generator can't make GS1-128. Use a tool that supports FNC1 and GS1 application identifiers."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Leave a clear margin on both sides of the bars; labels cut too close are a common cause of failed scans.",
        "Scan a printed proof with the scanner you will actually use."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Code 128 Barcode",
        "desc": "Complete encoding table, subset A/B/C definitions, and Modulo 103 checksum calculation.",
        "url": "https://en.wikipedia.org/wiki/Code_128"
      },
      {
        "name": "GS1-128 Logistics Standard",
        "desc": "Official GS1 specifications for supply chain logistics identification.",
        "url": "https://www.gs1.org/standards/barcodes/gs1-128"
      },
      {
        "name": "ISO/IEC 15417 Standard",
        "desc": "International standard for Code 128 symbology format.",
        "url": "https://www.iso.org/standard/43896.html"
      }
    ]
  },
  "itf-14-barcode-generator": {
    "benefits": [
      {
        "title": "Check digit done for you",
        "desc": "Type 13 digits and the 14th is calculated; a wrong 14th digit is flagged."
      },
      {
        "title": "Bearer bars included",
        "desc": "The frame that protects the code on cardboard is drawn automatically."
      },
      {
        "title": "Vector files for box artwork",
        "desc": "SVG and EPS keep exact bar widths for printed cartons."
      }
    ],
    "decisionGuide": [
      {
        "q": "A carton of identical retail units?",
        "a": "ITF-14 is the usual choice."
      },
      {
        "q": "A single product sold in shops?",
        "a": "Use UPC-A or EAN-13 instead."
      },
      {
        "q": "Need batch numbers or dates in the code?",
        "a": "That needs GS1-128, which this generator can't make."
      }
    ],
    "legalCaution": {
      "title": "Rules to know",
      "points": [
        "The 14-digit number comes from your GS1 company prefix; generating the image doesn't license it.",
        "Corrugated board absorbs ink, so print a proof on the real board and scan it."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: ITF-14 Barcode",
        "desc": "Overview of Interleaved 2 of 5 shipping carton symbology and bearer bar rules.",
        "url": "https://en.wikipedia.org/wiki/ITF-14"
      },
      {
        "name": "GS1 Official ITF-14 Standard",
        "desc": "GS1 general specifications for outer carton trade item identification.",
        "url": "https://www.gs1.org/standards/barcodes/itf-14"
      },
      {
        "name": "ISO/IEC 16390 Standard",
        "desc": "International standard for Interleaved 2 of 5 barcode specifications.",
        "url": "https://www.iso.org/standard/43898.html"
      }
    ]
  },
  "data-matrix-generator": {
    "benefits": [
      {
        "title": "Very small",
        "desc": "Fits a serial number into a few millimetres, where a linear barcode won't fit."
      },
      {
        "title": "Reads when damaged",
        "desc": "Built-in error correction copes with some scratches and wear."
      },
      {
        "title": "Size picked for you",
        "desc": "The symbol grows only as much as your data needs."
      }
    ],
    "decisionGuide": [
      {
        "q": "Tiny parts or labels?",
        "a": "Data Matrix is a good fit."
      },
      {
        "q": "Regulated medicine or GS1 healthcare packaging?",
        "a": "You need GS1 DataMatrix, which this generator can't make."
      },
      {
        "q": "People will scan it with phone cameras?",
        "a": "A QR code is the safer choice."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Test the printed code with the scanners that will read it in daily use.",
        "Keep at least one module of clear space around the code."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Data Matrix",
        "desc": "Details on ECC 200 error correction, symbol sizes, and encoding modes.",
        "url": "https://en.wikipedia.org/wiki/Data_Matrix"
      },
      {
        "name": "GS1 DataMatrix Healthcare Guide",
        "desc": "Official GS1 implementation guidelines for pharmaceuticals and medical devices.",
        "url": "https://www.gs1.org/standards/barcodes/datamatrix"
      },
      {
        "name": "ISO/IEC 16022 Standard",
        "desc": "International standard for Data Matrix 2D barcode symbology.",
        "url": "https://www.iso.org/standard/80926.html"
      }
    ]
  },
  "aztec-code-generator": {
    "benefits": [
      {
        "title": "No margin needed",
        "desc": "Fits in tight spaces because it is found from the centre, not the edges."
      },
      {
        "title": "Compact",
        "desc": "Holds a lot of data in a small square."
      },
      {
        "title": "Size picked for you",
        "desc": "The symbol grows only as much as your data needs."
      }
    ],
    "decisionGuide": [
      {
        "q": "Your own tickets or passes?",
        "a": "Aztec is a good fit, especially on screens."
      },
      {
        "q": "General public scanning with phones?",
        "a": "A QR code is more widely recognised by camera apps."
      }
    ],
    "legalCaution": {
      "title": "Before you use it",
      "points": [
        "Only encode tickets or passes for a system you run or are allowed to issue for.",
        "Test the code on the scanners that will read it."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Aztec Code",
        "desc": "Detailed explanation of core bullseye structure, error correction, and transit ticketing.",
        "url": "https://en.wikipedia.org/wiki/Aztec_Code"
      },
      {
        "name": "ISO/IEC 24778 Standard",
        "desc": "Official ISO specification for Aztec Code 2D symbology.",
        "url": "https://www.iso.org/standard/82441.html"
      }
    ]
  },
  "pdf417-barcode-generator": {
    "benefits": [
      {
        "title": "Fits long labels",
        "desc": "The wide, stacked shape suits labels and forms that have more width than height."
      },
      {
        "title": "Adjustable shape",
        "desc": "Change the number of data columns to fit the space."
      },
      {
        "title": "Holds a lot of text",
        "desc": "Several fields fit in one code."
      }
    ],
    "decisionGuide": [
      {
        "q": "Long, flat label or form area?",
        "a": "PDF417 fits well."
      },
      {
        "q": "Small square space?",
        "a": "Data Matrix or QR is more compact."
      }
    ],
    "legalCaution": {
      "title": "Rules to know",
      "points": [
        "Do not use this tool to make or copy identity documents or official credentials.",
        "Test the printed code with the scanner that will read it."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: PDF417",
        "desc": "Overview of PDF417 codewords, layout, capacity, and error-correction concepts.",
        "url": "https://en.wikipedia.org/wiki/PDF417"
      },
      {
        "name": "ISO/IEC 15438 Standard",
        "desc": "International standard specification for PDF417 stacked linear symbology.",
        "url": "https://www.iso.org/standard/65502.html"
      }
    ]
  },
  "wifi-qr-code-generator": {
    "benefits": [
      {
        "title": "No password to spell out",
        "desc": "Guests scan and join. Nobody has to read out a long password full of capitals and symbols."
      },
      {
        "title": "Uses the phone's own camera",
        "desc": "Recent iPhones and Android phones read Wi-Fi codes without an extra app."
      },
      {
        "title": "Nothing to keep paying for",
        "desc": "The network details are inside the code, so there is no account or subscription behind it."
      }
    ],
    "decisionGuide": [
      {
        "q": "A café, shop or rental with one guest password?",
        "a": "This is what Wi-Fi QR codes are for. Put it on table cards or the welcome sheet."
      },
      {
        "q": "An office network where everyone logs in?",
        "a": "A Wi-Fi QR code can't hold a username. Set up a guest network with a shared password and make the code for that."
      },
      {
        "q": "You change the guest password often?",
        "a": "Every change needs a new code. Put the code in a frame you can swap rather than printing it on menus."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Only share a network you are allowed to share, such as your own or a guest network your employer approves.",
        "If your router offers a guest network, use it, so visitors are kept apart from your own computers and printers."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: QR Code",
        "desc": "Comprehensive guide to QR code history, error correction, and mobile device scanning.",
        "url": "https://en.wikipedia.org/wiki/QR_code"
      },
      {
        "name": "Wi-Fi Alliance QR Standards",
        "desc": "Official Wi-Fi Easy Connect (DPP) and network setup guidelines.",
        "url": "https://www.wi-fi.org/"
      },
      {
        "name": "ISO/IEC 18004 Standard",
        "desc": "International standard for the QR Code symbology (2024 edition).",
        "url": "https://www.iso.org/standard/83389.html"
      }
    ]
  },
  "vcard-qr-code-generator": {
    "benefits": [
      {
        "title": "No typing for the other person",
        "desc": "Your details land in their contacts app in one scan, spelled the way you spell them."
      },
      {
        "title": "Works without internet",
        "desc": "The contact is inside the code, so saving it does not need a website or a signal."
      },
      {
        "title": "Opens in the contacts app",
        "desc": "iPhone and Android cameras recognise vCard codes and offer to add the contact."
      }
    ],
    "decisionGuide": [
      {
        "q": "Printed business cards?",
        "a": "Yes. Put the code on the back with a white margin around it, at least 2.5 cm wide."
      },
      {
        "q": "Your details change often?",
        "a": "A vCard code can't be changed after printing. A Website URL code that points to your own contact page can stay the same while you update the page."
      },
      {
        "q": "Want to share a photo or portfolio?",
        "a": "Add your website or LinkedIn address to the card. Photos don't fit in a QR code."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Only include details you are happy for anyone holding the card to save.",
        "Scan the printed proof at its final size on an iPhone and an Android phone."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: vCard Standard",
        "desc": "Complete history, syntax, and field properties of the vCard standard format.",
        "url": "https://en.wikipedia.org/wiki/VCard"
      },
      {
        "name": "IETF RFC 2426 (vCard 3.0)",
        "desc": "The vCard version this generator writes.",
        "url": "https://datatracker.ietf.org/doc/html/rfc2426"
      }
    ]
  },
  "crypto-qr-code-generator": {
    "benefits": [
      {
        "title": "No long address to copy",
        "desc": "Payers scan instead of copying a long address by hand, where one wrong character sends money to the wrong place."
      },
      {
        "title": "Standard payment links",
        "desc": "Uses the BIP-21, EIP-681 and Solana Pay formats that wallet apps are built to read."
      },
      {
        "title": "Public address only",
        "desc": "The code holds nothing that could move your funds."
      }
    ],
    "decisionGuide": [
      {
        "q": "Accepting tips or donations?",
        "a": "Leave the amount blank so people can choose."
      },
      {
        "q": "Billing a fixed amount?",
        "a": "Add the amount, then check it on the payer's screen before they confirm. Crypto payments can't be reversed."
      }
    ],
    "legalCaution": {
      "title": "Before you share it",
      "points": [
        "Check the address on your wallet's receive screen. A wrong character can't be fixed after a payment is sent.",
        "Tax and reporting rules for crypto payments depend on where you live; check them before taking payments for a business."
      ]
    },
    "authorityLinks": [
      {
        "name": "Bitcoin BIP-0021 URI Standard",
        "desc": "Official Bitcoin Improvement Proposal for payment request URI formatting.",
        "url": "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"
      },
      {
        "name": "Ethereum EIP-681 Standard",
        "desc": "Ethereum standard for URL format for transaction requests.",
        "url": "https://eips.ethereum.org/EIPS/eip-681"
      },
      {
        "name": "Solana Pay Specification",
        "desc": "Standard specification for Solana payment request URLs and merchant transfers.",
        "url": "https://github.com/solana-foundation/pay/blob/main/typescript/packages/solana-pay/spec/SPEC.md"
      }
    ]
  },
  "email-qr-code-generator": {
    "benefits": [
      {
        "title": "The right subject every time",
        "desc": "A pre-filled subject such as a product model or event name makes incoming mail easy to sort."
      },
      {
        "title": "Sent from their own mail app",
        "desc": "A mailto link opens the scanner's own email app. The message goes from their account, not through this site."
      },
      {
        "title": "No typing the address",
        "desc": "Nobody mistypes your email address from a poster."
      }
    ],
    "decisionGuide": [
      {
        "q": "Support or warranty requests?",
        "a": "Put the model number in the subject so you know which product the message is about."
      },
      {
        "q": "Need a name, order number or photo from people?",
        "a": "A web form collects that more reliably. Use a Website URL code that points to the form."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Use an address someone actually reads, and check it by scanning the printed proof.",
        "Keep the message short. Long text makes the code denser and harder to scan when printed small."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 6068 (mailto URI Scheme)",
        "desc": "Official Internet standard specifying mailto uniform resource identifiers.",
        "url": "https://datatracker.ietf.org/doc/html/rfc6068"
      },
      {
        "name": "Wikipedia: Mailto",
        "desc": "Overview of mailto protocol, syntax parameters, and client handling.",
        "url": "https://en.wikipedia.org/wiki/Mailto"
      }
    ]
  },
  "sms-qr-code-generator": {
    "benefits": [
      {
        "title": "No number to type",
        "desc": "People don't have to copy your number off a poster or receipt."
      },
      {
        "title": "Works without data",
        "desc": "Texts go over the mobile network, which helps at venues where mobile data is weak."
      },
      {
        "title": "Your exact wording",
        "desc": "A pre-filled keyword arrives the same way every time, so it is easy to sort or automate."
      }
    ],
    "decisionGuide": [
      {
        "q": "Running a text sign-up list?",
        "a": "Pre-fill the keyword, and follow the consent rules for marketing texts where you operate."
      },
      {
        "q": "Your audience mostly uses WhatsApp?",
        "a": "A WhatsApp QR code opens a chat there instead."
      }
    ],
    "legalCaution": {
      "title": "Rules to check",
      "points": [
        "Marketing texts usually need the person's consent and a clear way to opt out. Check the rules where you operate before you send replies.",
        "Don't ask people to text personal or payment details."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 5724 (SMS URI Standard)",
        "desc": "Official RFC standard specification for SMS URI schemes.",
        "url": "https://datatracker.ietf.org/doc/html/rfc5724"
      }
    ]
  },
  "phone-call-qr-code-generator": {
    "benefits": [
      {
        "title": "No misdialled numbers",
        "desc": "The number comes from the code, so a digit can't be misread from a fast-moving van."
      },
      {
        "title": "Works without data",
        "desc": "The call goes over the normal phone network once the number is on screen."
      },
      {
        "title": "Always asks first",
        "desc": "Phones confirm before dialing, so nobody calls by accident."
      }
    ],
    "decisionGuide": [
      {
        "q": "Vans, signs and storefronts?",
        "a": "Print it large enough for the distance, and also show the number in plain text."
      },
      {
        "q": "Want people to save your number for later?",
        "a": "A vCard QR code saves your name, number and email to their contacts instead."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Call the number from the printed code once, from a phone on another network.",
        "Show the number in plain text too, for people who can't scan."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 3966 (tel: URI Scheme)",
        "desc": "Official RFC specifying the telephone subscriber URI format.",
        "url": "https://datatracker.ietf.org/doc/html/rfc3966"
      }
    ]
  },
  "calendar-event-qr-code-generator": {
    "benefits": [
      {
        "title": "No copying dates by hand",
        "desc": "Guests save the title, place and time in one scan instead of typing them into a calendar."
      },
      {
        "title": "Time zones handled",
        "desc": "The time is stored in UTC, so guests travelling in from elsewhere see it at the right hour."
      },
      {
        "title": "No account needed",
        "desc": "The event is inside the code, not on a server, so there is nothing to sign up for."
      }
    ],
    "decisionGuide": [
      {
        "q": "A fixed date on printed invitations?",
        "a": "Good fit. Print the date and time next to the code too."
      },
      {
        "q": "Details still likely to change?",
        "a": "Link to an event web page with a Website URL code instead, and update the page."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Scan the printed proof and check the date, time and place in the calendar app.",
        "Keep the notes short. Long text makes the code dense and harder to scan on small cards."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 5545 (iCalendar Standard)",
        "desc": "Official RFC standard specification for electronic calendaring and scheduling.",
        "url": "https://datatracker.ietf.org/doc/html/rfc5545"
      },
      {
        "name": "Wikipedia: iCalendar",
        "desc": "Overview of iCalendar structure, recurrence rules, and client compatibility.",
        "url": "https://en.wikipedia.org/wiki/ICalendar"
      }
    ]
  },
  "google-maps-location-qr-code-generator": {
    "benefits": [
      {
        "title": "Opens straight in Google Maps",
        "desc": "One scan opens the place in the Google Maps app (or the browser), where visitors tap Directions to get there."
      },
      {
        "title": "Works without an address",
        "desc": "Coordinates can pin a car park, a trailhead or an event gate that has no street address."
      },
      {
        "title": "No address to retype",
        "desc": "Visitors don't type anything, so there is less room for typos or a similarly named street in another town."
      }
    ],
    "decisionGuide": [
      {
        "q": "A shop, restaurant or office with a normal address?",
        "a": "Type the business name and town. Then scan the preview and check it opens your place, not one with a similar name."
      },
      {
        "q": "No address, or an entrance that is hard to find?",
        "a": "Use coordinates for the exact gate or door rather than the middle of the site."
      },
      {
        "q": "Want people to see your reviews and opening hours?",
        "a": "Copy the share link of your Google Maps listing and turn it into a Website URL QR code instead. See the questions below."
      }
    ],
    "legalCaution": {
      "title": "Before you print a batch",
      "points": [
        "Scan the printed code on an iPhone and an Android phone, and check it opens the right place.",
        "Point coordinates at the public entrance, not a private loading dock or the middle of a large building."
      ]
    },
    "authorityLinks": [
      {
        "name": "Google Maps URL Scheme Documentation",
        "desc": "Official developer documentation for universal cross-platform map links.",
        "url": "https://developers.google.com/maps/documentation/urls/get-started"
      }
    ]
  },
  "plain-text-qr-code-generator": {
    "benefits": [
      {
        "title": "Just text, no app needed",
        "desc": "The scanner shows the text itself; no website or special app is involved."
      },
      {
        "title": "Readable offline",
        "desc": "The text is inside the code, so a phone can read it without a network connection."
      },
      {
        "title": "Room for a short note",
        "desc": "Up to 2,953 bytes of ordinary text in the largest QR size at error correction level L. Shorter text gives a smaller code that is easier to scan."
      }
    ],
    "decisionGuide": [
      {
        "q": "Machine serial numbers or short instructions?",
        "a": "Good fit. Keep the text short so the code stays easy to scan on small labels."
      },
      {
        "q": "Public keys or wallet addresses?",
        "a": "Fine to share as text. Never encode private keys or recovery phrases: anyone who scans the code can read them."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Anyone with a phone can read a plain text code. Leave out anything you wouldn't print in plain words.",
        "For long text, choose error correction level L or M so the code doesn't become too dense."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: QR Code",
        "desc": "Technical specifications, version matrices (1–40), and character capacities.",
        "url": "https://en.wikipedia.org/wiki/QR_code"
      },
      {
        "name": "ISO/IEC 18004 Standard",
        "desc": "Official ISO standard for QR Code symbology.",
        "url": "https://www.iso.org/standard/83389.html"
      }
    ]
  },
  "amazon-fba-fnsku-barcode-generator": {
    "benefits": [
      {
        "title": "Amazon's label contents",
        "desc": "Product name, FNSKU barcode and condition on each label."
      },
      {
        "title": "Sheet or thermal",
        "desc": "Print 30 per page on Avery 5160 or one at a time on 1 × 2-5/8 inch thermal labels."
      },
      {
        "title": "Different FNSKU per label",
        "desc": "The batch tool fills a sheet with a list of different FNSKUs."
      }
    ],
    "decisionGuide": [
      {
        "q": "Your products already have their own GS1 barcodes?",
        "a": "Amazon's rules on which units need an FNSKU label have changed over time. Check the barcode type shown for each listing in Seller Central before you print."
      },
      {
        "q": "Labelling a few units at a time?",
        "a": "A thermal printer with 1 × 2-5/8 inch labels avoids wasting half-used sheets."
      }
    ],
    "legalCaution": {
      "title": "Amazon rules to check",
      "points": [
        "Amazon's labelling rules change. Check the current Seller Central help pages for your marketplace before sending stock.",
        "Print a test sheet at Actual size and check that the labels line up before printing a full run."
      ]
    },
    "authorityLinks": [
      {
        "name": "Amazon (US): Use Amazon barcodes for FBA",
        "desc": "Label size, contents, placement, printer and label paper rules.",
        "url": "https://sellercentral.amazon.com/help/hub/reference/external/G200141490"
      },
      {
        "name": "Amazon (US): FBA barcode choice and labeling FAQ",
        "desc": "The 31 March 2026 change: brand owners and resellers.",
        "url": "https://sellercentral.amazon.com/help/hub/reference/external/GEFKUGES6NSE7CBP"
      },
      {
        "name": "Amazon (India): FBA product barcode requirements",
        "desc": "Labelling rules for Amazon.in fulfilment centres.",
        "url": "https://sellercentral.amazon.in/help/hub/reference/external/G201100910"
      }
    ]
  },
  "google-reviews-qr-code-generator": {
    "benefits": [
      {
        "title": "Straight to the review box",
        "desc": "Customers don't have to search for your business and then find the review button."
      },
      {
        "title": "Works from a link or a Place ID",
        "desc": "Paste the review link from your Business Profile, or a Place ID if that is what you have."
      },
      {
        "title": "Print once",
        "desc": "The link is inside the code, so the card keeps working without a subscription."
      }
    ],
    "decisionGuide": [
      {
        "q": "A shop, café or service with a Google Business Profile?",
        "a": "Good fit. Put the card where people wait, such as the counter or the table."
      },
      {
        "q": "Just want people to find you on the map?",
        "a": "A Google Maps location QR code opens your place without the review box."
      }
    ],
    "legalCaution": {
      "title": "Review rules",
      "points": [
        "Ask all customers, not only happy ones, and don't offer discounts or gifts for reviews. Google's policies forbid both, and consumer-protection rules in some countries restrict them too.",
        "Scan the printed card and check it opens your own listing."
      ]
    },
    "authorityLinks": [
      {
        "name": "Google Business Profile: Customer Reviews Policy",
        "desc": "Official rules and best practices for requesting Google customer reviews.",
        "url": "https://support.google.com/business/answer/3474122"
      },
      {
        "name": "Google: Maps user-contributed content policy",
        "desc": "Google's rules for reviews, including no review gating and no incentives.",
        "url": "https://support.google.com/contributionpolicy/answer/7400114"
      }
    ]
  },
  "whatsapp-qr-code-generator": {
    "benefits": [
      {
        "title": "No saving the number first",
        "desc": "The chat opens straight away, without adding you to contacts."
      },
      {
        "title": "A greeting that tells you why",
        "desc": "A pre-filled line such as I'd like to book a table shows you where the customer found the code."
      },
      {
        "title": "Works with WhatsApp Business",
        "desc": "The same link format opens chats with WhatsApp Business numbers."
      }
    ],
    "decisionGuide": [
      {
        "q": "Taking orders or bookings by chat?",
        "a": "Good fit. Pre-fill a greeting that names the product or table."
      },
      {
        "q": "Customers without WhatsApp?",
        "a": "Add an SMS or Phone Call QR code next to it."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Business use of WhatsApp is covered by WhatsApp's own business policies; check them if you send marketing messages.",
        "Scan the printed code and send yourself a test message."
      ]
    },
    "authorityLinks": [
      {
        "name": "WhatsApp Official: How to Use Click to Chat",
        "desc": "Official documentation for the wa.me protocol and URL-encoded messaging parameters.",
        "url": "https://faq.whatsapp.com/5913398998672934"
      },
      {
        "name": "WhatsApp Business Policy",
        "desc": "Terms and compliance guidelines for commercial communication on WhatsApp.",
        "url": "https://www.whatsapp.com/legal/business-policy/"
      }
    ]
  },
  "upi-qr-code-generator": {
    "benefits": [
      {
        "title": "Works with the usual UPI apps",
        "desc": "One code for customers on Google Pay, PhonePe, Paytm, BHIM and bank apps."
      },
      {
        "title": "Fixed amount or open",
        "desc": "Add the amount for a bill or invoice, or leave it open for a shop counter or donations."
      },
      {
        "title": "Your name and logo",
        "desc": "Show your shop name to payers and add your logo in the centre of the code."
      }
    ],
    "decisionGuide": [
      {
        "q": "A shop counter or stall?",
        "a": "Leave the amount blank and add your shop name. Print your UPI ID in text next to the code."
      },
      {
        "q": "A single bill or invoice?",
        "a": "Set the amount and put the invoice number in the note."
      },
      {
        "q": "Collecting donations?",
        "a": "Leave the amount blank and write the cause in the note."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Check your UPI ID letter by letter. Money sent to a wrong ID is hard to get back.",
        "Scan the printed code with two or three UPI apps and check the name and amount they show.",
        "Your bank or payment app may have its own rules for business collections. Check them if you take a lot of payments."
      ]
    },
    "authorityLinks": [
      {
        "name": "NPCI: Unified Payments Interface (UPI)",
        "desc": "National Payments Corporation of India official technical architecture and linking specifications.",
        "url": "https://www.npci.org.in/what-we-do/upi/product-overview"
      },
      {
        "name": "Reserve Bank of India: Digital Payment Guidelines",
        "desc": "RBI regulatory frameworks for electronic payments and QR-based merchant acceptance.",
        "url": "https://www.rbi.org.in/"
      }
    ]
  },
  "avery-5160-barcode-generator": {
    "benefits": [
      {
        "title": "Same or different codes",
        "desc": "Fill all 30 labels with one code, or put a list of different codes on the sheet."
      },
      {
        "title": "Any code type",
        "desc": "Barcodes and QR codes from the studio both work on the sheet."
      },
      {
        "title": "Plain PDF",
        "desc": "Print from any PDF viewer; no label software needed."
      }
    ],
    "decisionGuide": [
      {
        "q": "Printing at home or in an office?",
        "a": "Avery 5160 on a laser printer is a simple start."
      },
      {
        "q": "Printing labels every day?",
        "a": "A thermal label printer may be cheaper per label and avoids half-used sheets."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Always print a plain-paper test page at Actual size first.",
        "Amazon advises against inkjet printers for FNSKU labels; use a laser printer for those."
      ]
    },
    "authorityLinks": [
      {
        "name": "Avery 5160 Template",
        "desc": "Avery's official template page for 1\" × 2-5/8\" address labels (30 per sheet).",
        "url": "https://www.avery.com/templates/5160"
      }
    ]
  },
  "isbn-book-barcode-generator": {
    "benefits": [
      {
        "title": "Made from your ISBN",
        "desc": "Paste it with or without hyphens; the barcode uses the 13 digits."
      },
      {
        "title": "Price add-on built in",
        "desc": "Add the 5-digit price code next to the main barcode when your market uses one."
      },
      {
        "title": "Files for cover designers",
        "desc": "SVG and EPS stay sharp at any size in cover artwork."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling through US bookshops?",
        "a": "Add the 5-digit price add-on, or 90000 if you don't want a price printed."
      },
      {
        "q": "Only selling online or through a print-on-demand service?",
        "a": "Check whether the service adds the barcode for you before making one."
      }
    ],
    "legalCaution": {
      "title": "Rules to know",
      "points": [
        "Use an ISBN issued to you by your national ISBN agency. A generated barcode doesn't create a valid ISBN.",
        "Follow your printer's cover guidelines for the barcode's position and size."
      ]
    },
    "authorityLinks": [
      {
        "name": "International ISBN Agency Official Portal",
        "desc": "Global standard administrator for book numbering and publisher prefixes.",
        "url": "https://www.isbn-international.org/"
      },
      {
        "name": "Bowker Identifier Services (US ISBN Agency)",
        "desc": "Official US provider for book ISBN registration and publisher barcodes.",
        "url": "https://www.myidentifiers.com/"
      }
    ]
  },
  "code-39-barcode-generator": {
    "benefits": [
      {
        "title": "Simple and widely read",
        "desc": "An old, simple format that most handheld scanners read."
      },
      {
        "title": "Optional check digit",
        "desc": "Add Mod-43 when your system expects it."
      },
      {
        "title": "Label sheets",
        "desc": "Print asset tags on Avery 5160, 5163 or L7160 sheets."
      }
    ],
    "decisionGuide": [
      {
        "q": "An existing system already uses Code 39?",
        "a": "Stay with it so scans match what's in your records."
      },
      {
        "q": "Starting fresh?",
        "a": "Code 128 makes shorter barcodes for the same data."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Check whether your system expects the Mod-43 check digit before printing a batch.",
        "Code 39 gets wide quickly; keep values short for small tags."
      ]
    },
    "authorityLinks": [
      {
        "name": "AIM, the barcode industry association",
        "desc": "The industry body behind the original Code 39 specification (ANSI/AIM BC1).",
        "url": "https://www.aimglobal.org/"
      },
      {
        "name": "US DoD MIL-STD-129 Marking for Shipment",
        "desc": "Military standard for shipment and packaging asset identification.",
        "url": "https://quicksearch.dla.mil/"
      }
    ]
  },
  "bulk-barcode-generator-excel": {
    "benefits": [
      {
        "title": "Straight from a spreadsheet",
        "desc": "Copy a column, paste it, and get one code per line."
      },
      {
        "title": "Checked before printing",
        "desc": "Invalid values are listed by line before any sheet is made."
      },
      {
        "title": "Files in order",
        "desc": "ZIP files are numbered so they stay in the same order as your list."
      }
    ],
    "decisionGuide": [
      {
        "q": "Printing labels?",
        "a": "Choose an Avery sheet so each value gets its own label."
      },
      {
        "q": "Sending files to a designer or printer?",
        "a": "Choose the ZIP of SVG files."
      }
    ],
    "legalCaution": {
      "title": "Before you print",
      "points": [
        "Retail barcodes in your list still need GS1-licensed numbers.",
        "Print one test sheet at Actual size before printing the whole batch."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 4180: Common Format for CSV Files",
        "desc": "Standard specification for Comma-Separated Values MIME type.",
        "url": "https://www.ietf.org/rfc/rfc4180.txt"
      },
      {
        "name": "GS1 General Specifications for Automated Identification",
        "desc": "Global retail guidelines for sequential inventory and serial number assignment.",
        "url": "https://www.gs1.org/"
      }
    ]
  },
  "shopify-barcode-generator": {
    "benefits": [
      {
        "title": "Your own SKUs work",
        "desc": "Code 128 labels from your SKUs need no GS1 numbers for in-store use."
      },
      {
        "title": "Whole catalogue at once",
        "desc": "Paste a column from your product export, up to 200 values per batch."
      },
      {
        "title": "Price-tag size",
        "desc": "A 2.25 × 1.25 inch thermal layout is built in."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling only in your own shop and online store?",
        "a": "Code 128 from your SKUs is usually enough."
      },
      {
        "q": "Also selling on Amazon, Walmart or Google Shopping?",
        "a": "Get GS1 numbers and use UPC-A or EAN-13."
      }
    ],
    "legalCaution": {
      "title": "Rules to know",
      "points": [
        "Marketplaces check retail barcode numbers against GS1 records; don't print UPCs you haven't licensed.",
        "Test-scan a printed label with your Shopify POS scanner before labelling stock."
      ]
    },
    "authorityLinks": [
      {
        "name": "Shopify Help Center: Barcodes and Shopify POS",
        "desc": "Official Shopify guide for setting up product barcodes and scanner hardware.",
        "url": "https://help.shopify.com/en/manual/products/details/barcodes"
      },
      {
        "name": "Google Merchant Center: Unique Product Identifiers (GTIN)",
        "desc": "Google requirements for retail barcodes when listing e-commerce products.",
        "url": "https://support.google.com/merchants/answer/160161"
      }
    ]
  },
};

/**
 * Practical guide sections per landing page: how-to steps, printing/size advice, common
 * mistakes and extra FAQs. Optional; pages without an entry simply skip these sections.
 * HTML is allowed in the strings (links, <strong>); keep claims true to what the studio does.
 */
const GUIDES = {
  "google-maps-location-qr-code-generator": {
    "howTo": [
      "Type your <strong>place name or address</strong>, for example <em>\"Blue Door Café, 12 High Street, Leeds\"</em>. Search for it in Google Maps first and copy the wording that finds the right result.",
      "For a spot with no address (an event entrance, a car park, a trailhead), fill in <strong>latitude and longitude</strong> instead. In Google Maps, long-press the exact spot (right-click on a computer) and copy the numbers shown.",
      "Coordinates are used if both are filled in; otherwise the place name or address is searched.",
      "Scan the preview with your phone and check that Google Maps opens the right place.",
      "Download <strong>SVG</strong> or <strong>PNG</strong> for flyers, signs and business cards."
    ],
    "print": [
      "<strong>Size:</strong> at least <strong>2 cm (0.8 in)</strong> wide for flyers and cards read up close; for a door or window sign read from 1–2 metres away, about 10–20 cm (4–8 in). This follows a common rule of thumb, not part of the QR standard: make the code at least a tenth of the scanning distance. Test-scan at the real distance before printing.",
      "<strong>Add a line of text</strong> such as <em>\"Scan for directions\"</em> and the address, so people know what the code does and can still find you without scanning.",
      "<strong>Keep the white border</strong> around the code, and print dark on light."
    ],
    "mistakes": [
      "<strong>A vague place name</strong> that matches several places (\"Main Street Café\"). Add the street and town, or use coordinates.",
      "<strong>Coordinates in the wrong order.</strong> Latitude comes first (north–south, −90 to 90), then longitude (east–west, −180 to 180).",
      "<strong>Pinning the middle of a big site</strong> instead of the visitor entrance.",
      "<strong>Not test-scanning on both iPhone and Android</strong> before printing."
    ],
    "moreFaqs": [
      {
        "q": "Does the QR code open Google Maps or Apple Maps?",
        "a": "Google Maps. If the Google Maps app is installed it opens there; otherwise the place opens in the phone's web browser on Google Maps. It does not open Apple Maps or Waze."
      },
      {
        "q": "I already have a Google Maps share link. Can I use that?",
        "a": "Yes. In Google Maps, tap Share and copy the link, then make a Website link QR code with it. That opens the exact place you shared, including its name and reviews."
      },
      {
        "q": "Will the QR code still work if my business moves?",
        "a": "It keeps pointing to the old place, because the location is stored in the code itself. Make and print a new code after a move."
      }
    ]
  },
  "avery-5160-barcode-generator": {
    "title": "How to print QR codes and barcodes on Avery 5160 labels",
    "howTo": [
      "Make your code in the studio: any of the 10 formats, including <strong>QR codes</strong> for links, Wi-Fi, contact cards or Google reviews. For QR codes, keep the content short (a short link rather than a long one) so the dots stay big enough for a small label.",
      "Open the <strong>Physical Label Maker</strong> and choose <strong>Avery® 5160 — 30 Labels / Sheet</strong>. The button above opens it with this preset.",
      "Pick the <strong>Split</strong> layout to put a QR code on the left and your title, price or SKU on the right. Barcodes work in the other layouts too.",
      "Click <strong>Avery Sheet (PDF)</strong>. Every label on the sheet gets the same design. To print only the code, without text, use <strong>Print Avery PDF Label Sheet</strong> in the studio instead (1 to 300 labels).",
      "Print one page on plain paper at <strong>Actual size / 100%</strong>, hold it against a label sheet to check the alignment, then print on the labels and scan one with your phone."
    ],
    "print": [
      "<strong>QR size:</strong> on a 1-inch-tall 5160 label, the Split layout prints the QR code about <strong>22 mm (0.88 in)</strong> square, including the white border it needs. By the common rule of thumb (code at least a tenth of the scanning distance; not part of the QR standard) that suits a phone held up to about 20 cm (8 in) away. It's too small for posters or signs; test-scan a printed label.",
      "<strong>No logo on tiny QR codes:</strong> a centre logo switches the code to the highest error correction, which makes the pattern denser. Leave it out on labels this small.",
      "<strong>Retail barcodes:</strong> a 1-inch label is shorter than an EAN-13 or UPC-A at GS1's target size (bars 22.85 mm plus the digits). Use a smaller size within GS1's range, or a taller label such as Avery 5163.",
      "<strong>Printer:</strong> 5160 labels are made for laser printers and 8160 for inkjet printers. Both are the same size and use the same template.",
      "<strong>Scale:</strong> print at Actual size (100%). \"Fit to page\" shrinks the page, and the labels drift out of line further down the sheet."
    ],
    "mistakes": [
      "<strong>Printing with \"Fit to page\" or \"Shrink to printable area\"</strong> switched on.",
      "<strong>Long QR content on a small label</strong>, such as a long tracking link or Wi-Fi password. The dots get too small to scan reliably; use a shorter link.",
      "<strong>Inkjet labels in a laser printer, or the other way round.</strong> Toner may not fuse to inkjet stock, and inkjet ink can smear on laser labels.",
      "<strong>Printing a full pack before test-scanning</strong> one printed label."
    ],
    "moreFaqs": [
      {
        "q": "Can I put a QR code on Avery 5160 labels?",
        "a": "Yes. Make the QR code in the studio, open the label maker with the Avery 5160 preset and choose the Split layout. The QR code prints about 22 mm (0.88 in) square with your text beside it, on all 30 labels of the sheet."
      },
      {
        "q": "Which QR code types work on small labels?",
        "a": "Short ones scan best at this size: a website or Google review link, a phone number, or a short text. Wi-Fi codes with long passwords and full contact cards hold more data, so their dots get smaller; test-scan a printed label before printing a whole pack."
      }
    ]
  },
  "upc-a-barcode-generator": {
    "howTo": [
      "Get your 12-digit product number (GTIN-12) from <strong>GS1 US</strong> (or GS1 Canada). Depending on how many products you have, you can license a company prefix or, in the US, buy single GTINs. Our guide <a href=\"./how-to-get-a-barcode-for-your-product.html\">How to get a barcode for your product</a> walks through it.",
      "Open the studio with <strong>UPC-A</strong> selected (the button above does this) and type the first <strong>11 digits</strong>. The 12th check digit is calculated for you. If you enter all 12, the studio checks the last one. Got a 13-digit number instead? That's an EAN-13: see <a href=\"./upc-vs-ean-13-barcode.html\">UPC vs EAN-13</a>.",
      "Keep the human-readable digits under the bars switched on, as retail packaging needs them.",
      "Scan the preview with the built-in <a href=\"../barcode-scanner.html\">barcode scanner</a> or a phone to confirm it reads back the right 12 digits.",
      "Download <strong>SVG</strong> for packaging artwork, or print label sheets with the Avery label maker."
    ],
    "print": [
      "<strong>Size:</strong> GS1 sets the size by the width of the narrowest bar (the X-dimension). At the target of <strong>0.330 mm</strong>, a UPC-A is <strong>37.29 mm (1.468 in) wide</strong> including its margins, with bars <strong>22.85 mm (0.900 in) high</strong>. You can scale it between 0.264 mm and 0.660 mm (often called 80% to 200%); don't go below the minimum for retail checkout.",
      "<strong>Margins:</strong> keep a blank quiet zone of 9 bar-widths on each side (about 3 mm at 100%). Don't let text, borders or artwork touch the bars.",
      "<strong>Height:</strong> don't cut the bars shorter to save space. GS1 US advises against this (\"truncating\") because it makes the barcode harder to scan at the checkout.",
      "<strong>Colours:</strong> black or dark blue bars on white work best. Red bars don't scan, because red-light checkout scanners see red as white.",
      "<strong>Resize the SVG, not a small PNG.</strong> Stretching a low-resolution image makes the bar widths uneven."
    ],
    "mistakes": [
      "<strong>Buying cheap UPCs from resellers</strong> for products sold on Amazon or in US retail chains. These platforms check numbers against the GS1 database, and a number licensed to another company can get listings blocked.",
      "<strong>Using one UPC for several variants.</strong> Each size, colour, flavour or pack count needs its own number.",
      "<strong>Putting UPC-A on outer shipping cartons.</strong> Cartons use ITF-14 or GS1-128 instead.",
      "<strong>Not test-scanning a printed proof</strong> before a full print run."
    ],
    "moreFaqs": [
      {
        "q": "How do I get a UPC code for my product?",
        "a": "Get the number from GS1 US (or GS1 Canada), the organisations that run the UPC system. They license company prefixes, and GS1 US also sells single GTINs, with no yearly renewal fee, for sellers with only a few products. Once you have the number, making the barcode image here is free."
      },
      {
        "q": "Do I need a different UPC for each size or colour?",
        "a": "Yes. Every product variant that is sold separately, such as each size, colour, flavour or pack count, needs its own number, so stores and marketplaces can tell them apart."
      },
      {
        "q": "Is a UPC-A number the same as a GTIN-12?",
        "a": "Yes. UPC-A encodes a GTIN-12. Systems that expect 13 digits store it with a leading zero, and systems that expect 14 digits add two leading zeros. It is still the same product number."
      },
      {
        "q": "Can I make a UPC-E barcode here?",
        "a": "Not yet. This generator makes full-size UPC-A. UPC-E is a shortened 8-digit form for very small packs, and only some UPC-A numbers can be compressed into it."
      }
    ]
  },
  "wifi-qr-code-generator": {
    "howTo": [
      "Open the studio with the <strong>Wi-Fi</strong> QR type selected (the button above does this).",
      "Type the <strong>network name (SSID)</strong> exactly as your phone shows it. Names are case-sensitive, and spaces count.",
      "Choose the <strong>security type</strong>: <em>WPA / WPA2 / WPA3</em> for almost every home and business router, <em>WEP</em> only for very old routers, or <em>None</em> for an open network.",
      "Enter the <strong>password</strong>, and tick <strong>Hidden Network</strong> if your router doesn't broadcast its name.",
      "Scan the preview with your phone camera (or the built-in <a href=\"../barcode-scanner.html\">barcode scanner</a>) and join the network once, before you print anything.",
      "Download <strong>SVG</strong> for print shops and signs, or <strong>PNG</strong> at 2× or 4× for documents, then print."
    ],
    "print": [
      "<strong>Size:</strong> print the code at least <strong>2.5 cm (1 in)</strong> wide for a table card read up close. A common rule of thumb (not part of the QR standard) is a scanning distance of up to about 10× the code's width, so a 3 cm code suits roughly 30 cm. Test-scan at the real distance.",
      "<strong>Margin:</strong> keep the white border (quiet zone) around the code. Cropping it off is the most common reason a printed code won't scan.",
      "<strong>Contrast:</strong> dark code on a light background. Light-on-dark (inverted) codes fail on some Android phones.",
      "<strong>Surface:</strong> matte paper or a matte laminate. Glossy lamination causes glare under ceiling lights.",
      "Add a short line of text such as <em>\"Scan to join our Wi-Fi\"</em> and the network name, so guests know what the code is for and can still type it if needed."
    ],
    "mistakes": [
      "<strong>Changing the password later.</strong> The password is inside the code, so the old code stops working. Make and print a new one whenever you change it.",
      "<strong>A typo in the network name</strong>, or the wrong capitalisation. The phone looks for exactly what's in the code.",
      "<strong>Company networks that ask for a username and password</strong> (WPA2/WPA3-Enterprise). Standard Wi-Fi QR codes are made for a single shared password, so use a guest network instead.",
      "<strong>Printing before testing.</strong> Scan the final file on at least one iPhone and one Android phone first."
    ],
    "moreFaqs": [
      {
        "q": "What happens to the QR code if I change my Wi-Fi password?",
        "a": "It stops working, because the password is stored inside the code itself (there's no server in between). Create a new code with the new password and replace the printed one."
      },
      {
        "q": "Does a Wi-Fi QR code work for 5 GHz and 6 GHz networks?",
        "a": "Yes. The code contains the network name, security type and password, not a frequency band. The phone joins that network the same way it would if you typed the details."
      },
      {
        "q": "Can I test the code before printing it?",
        "a": "Yes. Point your phone camera at the preview on screen, or upload the downloaded image to our free in-browser barcode scanner, which shows exactly what the code contains."
      }
    ]
  },
  "vcard-qr-code-generator": {
    "howTo": [
      "Open the studio with the <strong>vCard</strong> QR type selected (the button above does this).",
      "Fill in the fields you want to share: first and last name, company, job title, phone, email, website and address. Leave out anything you don't want on the card.",
      "Write the phone number in <strong>international format</strong> with the country code, for example <em>+1 555 019 2834</em> or <em>+44 20 7946 0000</em>.",
      "Scan the preview with your phone and check that <strong>Add to Contacts</strong> shows every field correctly.",
      "Download <strong>SVG</strong> for business cards and print design, or <strong>PNG</strong> for email signatures and slides."
    ],
    "print": [
      "<strong>Business cards:</strong> a standard card is 85 × 55 mm (3.5 × 2 in). Print the code at least <strong>2.5 cm (1 in)</strong> wide, with a clear white margin around it.",
      "<strong>Fewer fields scan faster.</strong> A vCard is plain text inside the code, so every extra field makes the pattern denser. Name, phone, email and website are usually enough.",
      "<strong>Contrast:</strong> keep the code dark on a light background, even if your card design is dark. Put the code on a white panel.",
      "<strong>Logo:</strong> if you add a logo in the centre, the studio switches to the highest error correction level automatically. Keep the logo small and test the final print."
    ],
    "mistakes": [
      "<strong>Phone numbers without the country code.</strong> They may dial the wrong number, or none, when scanned abroad.",
      "<strong>Testing on screen only.</strong> Always scan the printed proof at its final size, especially on small cards.",
      "<strong>Expecting to edit it later.</strong> The contact details are stored in the code itself, so a new job title or phone number needs a new code.",
      "<strong>Adding a photo.</strong> Photos are far too large for a QR code. Share them through your website or LinkedIn link instead."
    ],
    "moreFaqs": [
      {
        "q": "Will a vCard QR code work on both iPhone and Android?",
        "a": "Yes. The iPhone Camera app and Android camera or Google Lens recognise vCard codes and offer to add the contact. We write vCard 3.0, which both read."
      },
      {
        "q": "Can I change the details after printing?",
        "a": "No. The details are stored inside the code, so there is no server or subscription behind it, and also no way to edit it. If something changes, generate a new code."
      },
      {
        "q": "Can I put my photo or logo in the contact card?",
        "a": "A photo can't fit inside a QR code. You can place a small logo in the centre of the code itself as decoration; it isn't added to the saved contact."
      }
    ]
  },
  "ean-13-barcode-generator": {
    "moreFaqs": [
      {
        "q": "What size should I print an EAN-13 barcode?",
        "a": "At GS1's target size (narrowest bar 0.330 mm) it is 37.29 mm wide including the margins, with bars 22.85 mm high. The smallest allowed for retail checkout (0.264 mm bars) is 29.83 mm wide with 18.28 mm bars; the largest is twice the target. Always keep the margins and the full bar height."
      },
      {
        "q": "Can a US store scan an EAN-13 barcode?",
        "a": "Yes. Scanners in the US and Canada read EAN-13 as well as UPC-A, and a UPC-A number is simply an EAN-13 with a leading zero. Some US retailers still ask suppliers for UPC-A, so check your retailer's requirements."
      },
      {
        "q": "Can I use EAN-13 barcodes for my own stock or inventory without GS1?",
        "a": "For stock-room bins and company assets, Code 128 can carry your own SKU or asset number. Choose a format your inventory software and scanners accept."
      }
    ]
  }
};

// Long-form guide pages (pages/<slug>.html). They answer the questions people search before they
// need a tool, then link into the matching generators. Same chrome as the landing pages.
const ARTICLES = [
  {
    slug: 'how-to-get-a-barcode-for-your-product',
    name: 'How to Get a Barcode for Your Product',
    badge: 'Seller Guide',
    queryParam: 'symbology=ean-13',
    metaTitle: 'How to Get a Barcode for Your Product (GTIN Guide)',
    metaDescription: 'Step-by-step guide to getting product barcodes: official GS1 pricing ($30 single GTIN), EAN-13 vs UPC-A, check digit calculation, and free vector generation.',
    h1: 'How to Get a Barcode for Your Product',
    lead: 'For a retail product, first obtain or confirm the product identifier your retailer requires. Then make the barcode image that carries it. This guide explains the difference between a GTIN and its barcode, how to choose the matching generator, and what to check before printing.',
    datePublished: '2026-10-07',
    dateModified: '2026-11-11',
    relatedSlugs: [
      'upc-vs-ean-13-barcode',
      'ean-13-barcode-generator',
      'upc-a-barcode-generator',
      'do-i-need-a-barcode-to-sell-on-amazon',
      'shopify-barcode-generator',
      'itf-14-barcode-generator'
    ],
    ctas: [
      { href: '../index.html?symbology=ean-13', label: 'Make an EAN-13 barcode' },
      { href: '../index.html?symbology=upc-a', label: 'Make a UPC-A barcode' }
    ],
    sections: [
      {
        id: 'short-answer',
        h2: 'The short answer',
        html: `
        <ol>
          <li><strong>Check the receiving retailer or marketplace's requirements.</strong> Confirm the identifier type, who assigns it and whether an exception applies.</li>
          <li><strong>Obtain or confirm the assigned number.</strong> For GS1 identifiers, use the organisation serving your country and check its current licensing options.</li>
          <li><strong>Match the number to its carrier.</strong> Use EAN-13 for a GTIN-13 and UPC-A for a GTIN-12. Check how your recipient expects any padded database representation to be supplied.</li>
          <li><strong>Make the image, then check the file and printed proof.</strong> Compare the decoded number with the source record before printing in volume.</li>
        </ol>
        <p>For stock-room bins or company assets, see <a href="#internal-use">internal identifiers</a>.</p>

        <figure class="ean-diagram">
          <svg class="ean-diagram-art diagram-wide" viewBox="0 0 1000 240" role="img" aria-labelledby="product-pipeline-title product-pipeline-desc">
            <title id="product-pipeline-title">Product barcode creation pipeline: from GS1 GTIN to printed packaging</title>
            <desc id="product-pipeline-desc">4-step visual flow: 1. License official GTIN from GS1; 2. Assign unique variant GTIN per SKU; 3. Generate vector barcode in UniversalCodeMaker; 4. Test scan and proof print before mass production.</desc>
            <defs>
              <marker id="pipe-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                <path d="M1 1L5 3L1 5" fill="none" stroke="var(--optic-blue)" stroke-width="1.2"/>
              </marker>
            </defs>

            <!-- Card 1: License GTIN -->
            <g transform="translate(10, 15)">
              <rect width="220" height="210" rx="8" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <rect x="16" y="16" width="60" height="20" rx="4" fill="var(--optic-blue-tint)"/>
              <text x="46" y="30" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">STEP 1</text>
              <text x="16" y="60" font-family="var(--font-heading, sans-serif)" font-size="16" font-weight="700" fill="var(--text-primary)">License GTIN</text>
              <text x="16" y="80" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">Official GS1 Registry</text>
              <path d="M16 95h188" stroke="var(--border-subtle)" stroke-width="1"/>
              <text x="16" y="118" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• 12 digits (UPC-A) for US</text>
              <text x="16" y="138" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• 13 digits (EAN) worldwide</text>
              <text x="16" y="158" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Verified by GS1 / GEPIR</text>
              <text x="16" y="190" font-family="var(--font-mono, monospace)" font-size="11" fill="var(--optic-blue)">$30 Single / $250 Prefix</text>
            </g>

            <!-- Arrow 1 -> 2 -->
            <path d="M242 120h16" stroke="var(--optic-blue)" stroke-width="2" marker-end="url(#pipe-arrow)"/>

            <!-- Card 2: Assign Variant -->
            <g transform="translate(268, 15)">
              <rect width="220" height="210" rx="8" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <rect x="16" y="16" width="60" height="20" rx="4" fill="var(--optic-blue-tint)"/>
              <text x="46" y="30" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">STEP 2</text>
              <text x="16" y="60" font-family="var(--font-heading, sans-serif)" font-size="16" font-weight="700" fill="var(--text-primary)">Assign by Variant</text>
              <text x="16" y="80" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">One per Distinct SKU</text>
              <path d="M16 95h188" stroke="var(--border-subtle)" stroke-width="1"/>
              <text x="16" y="118" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Different size = new GTIN</text>
              <text x="16" y="138" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Multipack = new GTIN</text>
              <text x="16" y="158" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Never reuse old numbers</text>
              <text x="16" y="190" font-family="var(--font-mono, monospace)" font-size="11" fill="var(--text-secondary)">Track in master inventory</text>
            </g>

            <!-- Arrow 2 -> 3 -->
            <path d="M500 120h16" stroke="var(--optic-blue)" stroke-width="2" marker-end="url(#pipe-arrow)"/>

            <!-- Card 3: Generate Vector -->
            <g transform="translate(526, 15)">
              <rect width="220" height="210" rx="8" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <rect x="16" y="16" width="60" height="20" rx="4" fill="var(--optic-blue-tint)"/>
              <text x="46" y="30" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">STEP 3</text>
              <text x="16" y="60" font-family="var(--font-heading, sans-serif)" font-size="16" font-weight="700" fill="var(--text-primary)">Generate Vector</text>
              <text x="16" y="80" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">UniversalCodeMaker</text>
              <path d="M16 95h188" stroke="var(--border-subtle)" stroke-width="1"/>
              <text x="16" y="118" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Automatic check digit</text>
              <text x="16" y="138" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• SVG / EPS vector files</text>
              <text x="16" y="158" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Enforce quiet zones</text>
              <text x="16" y="190" font-family="var(--font-mono, monospace)" font-size="11" fill="var(--sensor-green)">Free Local Generation</text>
            </g>

            <!-- Arrow 3 -> 4 -->
            <path d="M758 120h16" stroke="var(--optic-blue)" stroke-width="2" marker-end="url(#pipe-arrow)"/>

            <!-- Card 4: Proof & Print -->
            <g transform="translate(784, 15)">
              <rect width="206" height="210" rx="8" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <rect x="16" y="16" width="60" height="20" rx="4" fill="var(--optic-blue-tint)"/>
              <text x="46" y="30" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">STEP 4</text>
              <text x="16" y="60" font-family="var(--font-heading, sans-serif)" font-size="16" font-weight="700" fill="var(--text-primary)">Proof &amp; Verify</text>
              <text x="16" y="80" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">Pre-Production Check</text>
              <path d="M16 95h174" stroke="var(--border-subtle)" stroke-width="1"/>
              <text x="16" y="118" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• 100% size: 37.29 mm</text>
              <text x="16" y="138" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Test read with scanner</text>
              <text x="16" y="158" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-primary)">• Check contrast &amp; margins</text>
              <text x="16" y="190" font-family="var(--font-mono, monospace)" font-size="11" fill="var(--text-secondary)">Barcode Scanner Tool</text>
            </g>
          </svg>
          <ol class="ean-diagram-legend">
            <li><strong>1. License GTIN:</strong> Obtain your product number directly from GS1 to ensure your company is registered in the official GS1 registry (Verified by GS1 / GEPIR).</li>
            <li><strong>2. Assign by Variant:</strong> Assign a distinct GTIN to every sellable consumer variant (e.g. 250 ml vs 500 ml, red vs blue).</li>
            <li><strong>3. Generate Vector Barcode:</strong> Enter your digits in UniversalCodeMaker to compute the check digit and export sharp vector files (SVG/EPS) for packaging artwork.</li>
            <li><strong>4. Proof &amp; Verify:</strong> Test-scan a sample print using our <a href="../barcode-scanner.html">Barcode Scanner</a> before commissioning volume print runs.</li>
          </ol>
          <figcaption>Schematic workflow overview. Dimensions and standards source: <a href="https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications" target="_blank" rel="noopener noreferrer">GS1 General Specifications</a>.</figcaption>
        </figure>`
      },
      {
        id: 'gtin-ean-upc',
        h2: 'GTIN, EAN-13 and UPC-A: what\'s the difference?',
        html: `
        <p><strong>GTIN</strong> (Global Trade Item Number) is the product number. <strong>EAN-13</strong> and <strong>UPC-A</strong> are the barcodes that carry it at the checkout.</p>
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th scope="col">Number</th><th scope="col">Digits</th><th scope="col">Barcode format</th><th scope="col">Where it's used</th></tr></thead>
            <tbody>
              <tr><td>GTIN-13</td><td>13</td><td><a href="./ean-13-barcode-generator.html">EAN-13</a></td><td>Retail almost everywhere outside the US and Canada</td></tr>
              <tr><td>GTIN-12</td><td>12</td><td><a href="./upc-a-barcode-generator.html">UPC-A</a></td><td>Retail in the US and Canada</td></tr>
              <tr><td>GTIN-14</td><td>14</td><td><a href="./itf-14-barcode-generator.html">ITF-14</a></td><td>Outer cartons and cases, not consumer packs</td></tr>
              <tr><td>ISBN-13</td><td>13</td><td><a href="./isbn-book-barcode-generator.html">EAN-13 (Bookland)</a></td><td>Books, from your national ISBN agency, not GS1</td></tr>
            </tbody>
          </table>
        </div>
        <p>Put a 0 in front of a 12-digit UPC-A number and you have the same product's 13-digit number. Checkout scanners around the world read both barcodes, so a UPC-A product can be sold in Europe and an EAN-13 product in the US. Some US retailers still ask suppliers for UPC-A, so check what your buyer wants. For full visual diagrams and quiet zone specs, see our <a href="./upc-vs-ean-13-barcode.html">UPC vs EAN-13: which barcode do you need?</a> comparison guide.</p>`
      },
      {
        id: 'do-you-need-gs1',
        h2: 'Step 1: Decide whether you need a GS1 number',
        html: `
        <p>Start with the organisation that will receive or scan the code. Retailers and marketplaces may require GS1 identifiers, but the rules depend on the recipient, category and market. Check before buying numbers or printing packaging. For an existing product, confirm its assigned identifier before obtaining another one.</p>
        <p><strong>Selling on Amazon involves two jobs.</strong> The listing uses a product identifier such as a GTIN, unless an applicable exemption is approved. For FBA stock, check which barcode must be on each unit: an accepted manufacturer barcode or an Amazon barcode (FNSKU), according to the current rules for your marketplace and seller/product status. An FNSKU comes from Seller Central and is separate from the retail GTIN.</p>
        <p>See <a href="./do-i-need-a-barcode-to-sell-on-amazon.html">Do I need a barcode to sell on Amazon?</a> for the US/India decision guide, and check current Seller Central instructions before preparing stock. Amazon explains <a href="https://sell.amazon.com/blog/amazon-gtin-guide" target="_blank" rel="noopener noreferrer">listing identifiers</a> and <a href="https://sell.amazon.com/blog/fba-packaging-prep-labeling" target="_blank" rel="noopener noreferrer">FBA labelling</a> separately.</p>
        <p id="internal-use">For identifiers used only inside your own inventory system, such as stock-room bins or company assets, <a href="./code-128-barcode-generator.html">Code 128</a> can carry your own SKU or asset number. Choose a format your software and scanners accept. Keep internal identifiers separate from retail GTINs and check requirements when a trading partner receives the labels.</p>`
      },
      {
        id: 'get-numbers',
        h2: 'Step 2: Get your numbers from GS1',
        html: `
        <p>UniversalCodeMaker generates barcode graphic files (SVG, EPS, PNG) from numbers you provide for free. However, if your product is sold through commercial retail stores, distributors, or major online marketplaces, the <strong>product identifier itself must be licensed from GS1</strong> so it is registered to your company in the official global registry.</p>

        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead>
              <tr>
                <th scope="col">Licensing office / option</th>
                <th scope="col">Initial cost</th>
                <th scope="col">Annual renewal</th>
                <th scope="col">Best suited for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-a-barcode" target="_blank" rel="noopener noreferrer">GS1 US</a>: Single GTIN-12</strong></th>
                <td>USD $30</td>
                <td><strong>$0 (No renewal fee)</strong></td>
                <td>Small businesses selling 1 to 9 products or variants in North America / Amazon</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-started-guide" target="_blank" rel="noopener noreferrer">GS1 US</a>: Company Prefix (1–10 items)</strong></th>
                <td>USD $250</td>
                <td>USD $50 / year</td>
                <td>Growing businesses planning larger catalogues under their own brand prefix</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1uk.org/" target="_blank" rel="noopener noreferrer">GS1 UK</a>: Small Business Band</strong></th>
                <td>£50 + VAT</td>
                <td>£50 + VAT / year</td>
                <td>UK &amp; European sellers with up to 10 product lines (turnover under £100k)</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1india.org/register-for-barcodes" target="_blank" rel="noopener noreferrer">GS1 India</a>: 100 Barcode Block</strong></th>
                <td>From ₹50,200 (10-yr term)</td>
                <td>Included in term</td>
                <td>Indian manufacturers &amp; exporters (eligible micro-enterprises can receive up to 80% MSME subsidy refund)</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1.org/" target="_blank" rel="noopener noreferrer">National GS1 Offices (Global)</a></strong></th>
                <td>Varies by country</td>
                <td>Country-dependent</td>
                <td>Direct registration in local currency (e.g. GS1 Canada, GS1 Australia, GS1 Germany)</td>
              </tr>
              <tr>
                <th scope="row"><strong>Third-Party Resellers (brokers)</strong></th>
                <td>$5 – $10</td>
                <td>$0</td>
                <td><strong>High risk:</strong> Numbers were previously licensed to older companies. GS1 database will not show your brand name. Amazon and major retail chains reject unverified barcodes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ean-callout" style="margin-top: 1.25rem;">
          <strong>Why cheap reseller barcodes fail on Amazon and retail:</strong>
          <p style="margin: 0.5rem 0 0;">Marketplaces such as Amazon automatically verify barcode numbers against the official GS1 database (via <a href="https://www.gs1.org/services/verified-by-gs1" target="_blank" rel="noopener noreferrer">Verified by GS1</a>, formerly GEPIR) under <a href="https://sellercentral.amazon.com/help/hub/reference/external/G200317470" target="_blank" rel="noopener noreferrer">Amazon's Product ID policy</a>. When a reseller sells you a recycled UPC, the database lists the original licensee—not your brand. If the company name does not match, Amazon flags the listing as invalid and can suspend or remove the product.</p>
        </div>`
      },
      {
        id: 'assign',
        h2: 'Step 3: Give every product variant its own number',
        html: `
        <ul>
          <li>Each item sold separately needs its own GTIN: 250 ml and 500 ml are two numbers; red and blue are two numbers; a single bar and a 6-pack are two numbers.</li>
          <li>Keep a simple spreadsheet: number, product name, size or variant, and the date you assigned it.</li>
          <li>Do not reuse a GTIN for a different product. Follow the <a href="https://ref.gs1.org/standards/gtin-management/" target="_blank" rel="noopener noreferrer">GS1 GTIN Management Standard</a> when assigning numbers or changing products and packs.</li>
        </ul>`
      },
      {
        id: 'check-digit',
        h2: 'Step 4: The check digit (done for you)',
        html: `
        <p>The last digit of every EAN-13 and UPC-A is a <strong>check digit</strong>. It helps detect some entry or reading errors. Our generator calculates it when you type 12 digits (EAN-13) or 11 digits (UPC-A), and checks it if you type the full number. Example only: these digits are not an identifier issued to you. Here is how the calculation works, using <code>590123412345</code>:</p>
        <ol>
          <li>Starting from the <strong>rightmost</strong> digit, multiply the digits alternately by 3 and 1: 5×3, 4×1, 3×3, 2×1, 1×3, 4×1, 3×3, 2×1, 1×3, 0×1, 9×3, 5×1.</li>
          <li>Add the results: 15 + 4 + 9 + 2 + 3 + 4 + 9 + 2 + 3 + 0 + 27 + 5 = <strong>83</strong>.</li>
          <li>The check digit is what you add to reach the next multiple of 10: 90 − 83 = <strong>7</strong>.</li>
        </ol>
        <p>See <a href="https://www.gs1uk.org/knowledge-hub/standards/what-is-a-check-digit" target="_blank" rel="noopener noreferrer">GS1 UK's check-digit explanation</a>. If your product record already includes the last digit, use the complete number and compare the result with that record.</p><p>So the full EAN-13 is <code>5901234123457</code>. The same rule works for UPC-A: <code>03600029145</code> gets check digit <strong>2</strong>.</p>`
      },
      {
        id: 'make',
        h2: 'Step 5: Make the barcode',
        html: `
        <p>Once you have your GS1-assigned number, select the matching generator below to create print-ready vector artwork or label sheets:</p>

        <div class="content-grid" style="margin: 1.5rem 0 2rem;">
          <div class="info-card" style="border-top: 4px solid var(--accent);">
            <h3 class="info-card-title">Make a UPC-A Barcode</h3>
            <p>For products sold in the United States or Canada. Enter 11 data digits to calculate the 12th check digit, or all 12 digits to verify.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>12 digits (GTIN-12)</li>
              <li>Vector SVG &amp; EPS for packaging</li>
              <li>Avery label sheet layouts</li>
            </ul>
            <a href="./upc-a-barcode-generator.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Open UPC-A Generator
            </a>
          </div>

          <div class="info-card" style="border-top: 4px solid var(--optic-blue);">
            <h3 class="info-card-title">Make an EAN-13 Barcode</h3>
            <p>For products sold internationally, outside North America, or on global Amazon stores. Generate directly on the page or open in the studio.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>13 digits (GTIN-13)</li>
              <li>On-page generator &amp; preview</li>
              <li>Quiet-zone &amp; packaging guide</li>
            </ul>
            <a href="./ean-13-barcode-generator.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Open EAN-13 Generator
            </a>
          </div>

          <div class="info-card" style="border-top: 4px solid var(--sensor-green);">
            <h3 class="info-card-title">UPC vs EAN-13 Comparison</h3>
            <p>Need help choosing between the two? See our side-by-side technical comparison, quiet zone schematics, and zero-prefix database conversion guide.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>Side-by-side specs &amp; quiet zones</li>
              <li>Modulo-10 leading zero proof</li>
              <li>Retail checkout compatibility</li>
            </ul>
            <a href="./upc-vs-ean-13-barcode.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Read Comparison Guide
            </a>
          </div>

          <div class="info-card" style="border-top: 4px solid #f59e0b;">
            <h3 class="info-card-title">Make Carton Barcodes (ITF-14)</h3>
            <p>For corrugated outer shipping cartons and wholesale master cases. Encodes a 14-digit GTIN-14 with thick bearer bars.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>14 digits (GTIN-14)</li>
              <li>Outer master case packaging</li>
              <li>Bearer bars for rough printing</li>
            </ul>
            <a href="./itf-14-barcode-generator.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Open ITF-14 Generator
            </a>
          </div>
        </div>

        <p>The generator processes product-number fields in your browser rather than uploading them to UniversalCodeMaker's server. See the <a href="../privacy-policy.html">Privacy Policy</a> for site measurement, advertising and hosting details.</p>`
      },
      {
        id: 'size',
        h2: 'Step 6: Print consumer-item EAN/UPC at the right size',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th scope="col">Measurement</th><th scope="col">EAN-13</th><th scope="col">UPC-A</th></tr></thead>
            <tbody>
              <tr><td>Target size (narrowest bar 0.330 mm)</td><td colspan="2">37.29 mm (1.468 in) wide including margins, bars 22.85 mm (0.900 in) high</td></tr>
              <tr><td>Smallest for retail checkout (bar 0.264 mm, "80%")</td><td colspan="2">29.83 mm wide, bars 18.28 mm high</td></tr>
              <tr><td>Largest (bar 0.660 mm, "200%")</td><td colspan="2">74.58 mm wide, bars 45.70 mm high</td></tr>
              <tr><td>Blank margin (quiet zone)</td><td>11 bar-widths left, 7 right</td><td>9 bar-widths each side</td></tr>
            </tbody>
          </table>
        </div>
        ${eanDiagramHtml('product-guide')}
        <p>These consumer-item reference dimensions come from the <a href="https://gs1.se/en/guides/how-to-guides/size-guide/" target="_blank" rel="noopener noreferrer">GS1 Sweden size guide</a>. Extra export padding can increase the full-file dimensions; preserve it and check the actual symbol at its final size.</p>
        <ul>
          <li><strong>Don't shorten the bars</strong> to fit a small pack. Use a smaller size within the allowed range instead.</li>
          <li><strong>Dark bars on a light background.</strong> Black on white is best. Follow <a href="https://www.gs1uk.org/knowledge-hub/barcodes/what-colour-should-a-barcode-be" target="_blank" rel="noopener noreferrer">GS1 UK's colour guidance</a> when choosing artwork colours.</li>
          <li><strong>Matte surfaces</strong> scan better than glossy ones, and the barcode shouldn't wrap around a tight curve.</li>
        </ul>`
      },
      {
        id: 'test',
        h2: 'Step 7: Test before you print in volume',
        html: `
        <ol><li><strong>Compare the decoded number.</strong> Open an exported PNG in a compatible reader, such as <a href="../barcode-scanner.html">our scanner</a>, and compare every digit with the assigned number.</li><li><strong>Check a printed proof.</strong> Use the final size, stock and equipment for the intended workflow where available. Retest after changing size, colour, material or placement.</li><li><strong>Check verification requirements.</strong> If your retailer requests a barcode-quality report, arrange its verification process in addition to the scan test.</li></ol>
        `
      },
      {
        id: 'sunrise-2027',
        h2: 'What about 2D barcodes? (GS1 Sunrise 2027)',
        html: `
        <p>GS1's 2027 ambition concerns retailer readiness to read both existing and newer barcode carriers. Follow your trading partners' current packaging instructions when adding a 2D code. This site's ordinary QR and Data Matrix generators do not by themselves establish a retail GS1 workflow. See <a href="https://ref.gs1.org/sme-guidance/solution-provider-2d-readiness/" target="_blank" rel="noopener noreferrer">GS1's 2D readiness guidance</a>.</p>
        `
      }
    ],
    faqs: [
      {
        q: 'Can I buy a single barcode number instead of an expensive company prefix?',
        a: 'Yes. For small businesses needing 1 to 9 codes, GS1 US offers individual GTIN-12 identifiers for $30 each with no annual renewal fee. In the UK, GS1 UK offers small business memberships for £50 + VAT per year. Avoid cheap third-party brokers, as unverified reseller barcodes risk rejection on Amazon and retail stores.'
      },
      {
        q: 'Why do cheap reseller barcodes get rejected by Amazon and major retailers?',
        a: 'Marketplaces such as Amazon automatically verify barcode numbers against the official GS1 database (Verified by GS1, formerly known as GEPIR). When you buy recycled numbers from third-party brokers, the database shows the previous company\'s name instead of your brand. If the company name does not match, Amazon flags the listing as invalid and can suspend or remove the product.'
      },
      {
        q: 'Do I need a barcode to sell on Shopify or Etsy?',
        a: 'Shopify does not require barcodes to create listings, but strongly recommends GTINs for automated inventory tracking and syncing with Google Shopping. Etsy does not require barcodes for handmade, vintage, or craft supply items.'
      },
      {
        q: 'What is the difference between a SKU and a barcode (GTIN)?',
        a: 'A SKU (Stock Keeping Unit) is an internal inventory code created by you for internal warehouse management. A GTIN (such as a UPC or EAN) is a globally unique identifier issued by GS1 that allows retailers, distributors, and checkout scanners worldwide to recognize your product.'
      },
      {
        q: 'Should I use EAN-13 or UPC-A?',
        a: 'Use whichever format your number was issued in: EAN-13 for a 13-digit number (standard outside North America and accepted on Amazon), or UPC-A for a 12-digit number (standard in the US and Canada). Scanners worldwide read both formats.'
      },
      {
        q: 'Can I just make up my own barcode numbers?',
        a: 'For internal stockrooms, asset tags, or closed-loop warehouse tracking, you can create internal codes using Code 128. However, for products sold through commercial retail stores, distributors, or major online marketplaces, you must use an official GS1-assigned GTIN.'
      },
      {
        q: 'Do I need a new barcode if I change the packaging?',
        a: 'Usually not for minor visual redesigns. A new barcode is required if the product changes in size, weight, formulation, quantity, or variant (such as color or flavor) so that retailers and consumers can distinguish between versions.'
      }
    ]
  },
  // Guide A (owner decision D2, 2026-10-12). Facts and sources: projects/universalcodemaker/50_content/seller-guides.md.
  {
    slug: 'do-i-need-a-barcode-to-sell-on-amazon',
    name: 'Do I Need a Barcode to Sell on Amazon?',
    badge: 'Seller Guide',
    queryParam: 'symbology=upc-a',
    metaTitle: 'Amazon Barcode Requirements (2026): UPC, GTIN & FNSKU Guide',
    metaDescription: 'Complete 2026 Amazon barcode requirements: when you need a GS1 GTIN/UPC to list vs FNSKU labels for FBA, exact label sizes, exemptions, and official costs.',
    dateModified: '2026-11-11',
    h1: 'Do I Need a Barcode to Sell on Amazon?',
    lead: 'Usually yes, and often two different ones: a product number (UPC or EAN) to create the listing, and an Amazon label (FNSKU) on every unit if Amazon stores and ships your stock. This guide covers what Amazon US and Amazon.in ask for in 2026, and what each costs.',
    datePublished: '2026-10-12',
    relatedSlugs: [
      'how-to-get-a-barcode-for-your-product',
      'upc-vs-ean-13-barcode',
      'upc-a-barcode-generator',
      'ean-13-barcode-generator',
      'amazon-fba-fnsku-barcode-generator',
      'code-128-barcode-generator'
    ],
    ctas: [
      { href: '../index.html?symbology=upc-a', label: 'Make a UPC-A barcode' },
      { href: '../index.html?symbology=code-128&preset=amazon-fnsku-5160&label=1', label: 'Make FNSKU labels' }
    ],
    sections: [
      {
        id: 'short-answer',
        h2: 'The short answer',
        html: `
        <ol>
          <li><strong>To list a new product</strong>, most Amazon categories need a product number (a GTIN: UPC, EAN, JAN or ISBN). Amazon checks UPCs against the GS1 database, so get yours from GS1. No barcode at all? Many private-label, handmade and generic products can get a <a href="#gtin-exemption">GTIN exemption</a> instead.</li>
          <li><strong>To ship to Amazon's warehouses (FBA)</strong>, every unit needs a barcode Amazon can track. Since 31 March 2026 in the US, only brand owners registered as brand representatives can use the product's own UPC; everyone else puts an Amazon <strong>FNSKU</strong> label on each unit. On Amazon.in, FNSKU labels are the default.</li>
          <li><strong>If you ship orders yourself</strong>, you don't need FNSKU labels: they are only for stock sent to Amazon's fulfilment centres.</li>
          <li><strong>Making the barcode image is free.</strong> What costs money is the GS1 number: $30 for a single number from GS1 US, from ₹50,200 for the first year from GS1 India (<a href="#costs">costs</a>).</li>
        </ol>
        <div class="article-callout"><p>Amazon's rules change. Everything here was checked against Amazon Seller Central help and GS1's own websites on 12 October 2026; follow the links to see the current version.</p></div>
        <div class="seller-guide-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
          <a href="./amazon-fba-fnsku-barcode-generator.html" class="scanner-tool-card" style="display: block; padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: inherit; transition: border-color 0.2s;">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Amazon FBA Label Generator &rarr;</strong>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Generate ready-to-print FNSKU Code 128 stickers for Avery 5160 30-up sheets and thermal rolls.</span>
          </a>
          <a href="./how-to-get-a-barcode-for-your-product.html" class="scanner-tool-card" style="display: block; padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: inherit; transition: border-color 0.2s;">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Product Barcode Guide &rarr;</strong>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Complete retail barcode licensing walkthrough, national GS1 fee tables, and packaging specs.</span>
          </a>
          <a href="./upc-a-barcode-generator.html" class="scanner-tool-card" style="display: block; padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: inherit; transition: border-color 0.2s;">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">UPC-A Generator &rarr;</strong>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Generate 12-digit standard retail barcodes for US &amp; Canadian product listings in vector SVG.</span>
          </a>
          <a href="./upc-vs-ean-13-barcode.html" class="scanner-tool-card" style="display: block; padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: inherit; transition: border-color 0.2s;">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">UPC vs EAN-13 Guide &rarr;</strong>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Compare 12-digit US and 13-digit global retail codes, check digits, and quiet zones.</span>
          </a>
        </div>`
      },
      {
        id: 'two-barcodes',
        h2: 'Two different barcodes',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th></th><th>Product number (GTIN)</th><th>Amazon barcode (FNSKU)</th></tr></thead>
            <tbody>
              <tr><th scope="row">What it identifies</th><td>The product, everywhere it's sold</td><td>Your units in Amazon's warehouses</td></tr>
              <tr><th scope="row">Where it comes from</th><td>GS1 (for books: your ISBN agency)</td><td>Your Seller Central account</td></tr>
              <tr><th scope="row">Barcode</th><td><a href="./upc-a-barcode-generator.html">UPC-A</a> or <a href="./ean-13-barcode-generator.html">EAN-13</a>, printed on the pack</td><td><a href="./amazon-fba-fnsku-barcode-generator.html">Code 128</a> on a sticker; starts with an X</td></tr>
              <tr><th scope="row">Needed for</th><td>Creating a new listing (most categories)</td><td>Sending stock to FBA (see below)</td></tr>
            </tbody>
          </table>
        </div>
        <p>The GTIN works on Amazon, in shops and on other marketplaces. The FNSKU only means something inside Amazon.</p>`
      },
      {
        id: 'product-id',
        h2: 'Step 1: the product number you need to list',
        html: `
        <ul>
          <li><strong>Amazon US</strong>: "For most categories, you are required to provide a unique product identifier, known as a GTIN (Global Trade Item Number), to create new listings." Amazon checks UPCs against the GS1 database; UPCs that don't match GS1's records are invalid, and invalid listings are removed, which can cost you the right to create listings or to sell.</li>
          <li><strong>Get numbers from GS1</strong>, not from resellers. GS1 US explains that a UPC looked up in the GS1 database shows the company it is registered to, and a number "associated with another company" risks rejection. Amazon US says to obtain UPCs "directly from GS1 (and not from other third parties selling UPC licenses)".</li>
          <li><strong>Category rules differ.</strong> In most US categories, major brands need a UPC and private-label brands can ask for an exemption; books need an ISBN, EAN or JAN; bundles in electronics, office products and video games need their own UPC.</li>
          <li><strong>Amazon.in</strong>: a product ID is needed to add a product that isn't already sold on Amazon; if another seller already sells it, you can add your offer without one. Amazon.in runs the same GS1 database check.</li>
        </ul>
        <p>How to get GS1 numbers, give each variant its own number and print them at the right size: <a href="./how-to-get-a-barcode-for-your-product.html">How to get a barcode for your product</a>.</p>`
      },
      {
        id: 'gtin-exemption',
        h2: 'No barcode? The GTIN exemption',
        html: `
        <p>If your product has never had a barcode, you can apply in Seller Central to list it without one. Amazon US accepts applications for:</p>
        <ul>
          <li>private-label or handmade products,</li>
          <li>products you make, brand or publish without barcodes,</li>
          <li>parts without a product number (for example car parts or phone accessories),</li>
          <li>bundles, and generic unbranded products.</li>
        </ul>
        <p>You can't get one if the product already has a GS1 barcode or GTIN, is already in Amazon's catalogue, or belongs to a brand that requires a UPC. Expect to send real photos of all six sides of the product and packaging, with the brand name permanently on the product.</p>
        <div class="gtin-exemption-steps" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin: 1.25rem 0;">
          <h4 style="margin-top: 0; color: var(--text-primary); font-size: 1.05rem;">How to Apply for a GTIN Exemption in Seller Central</h4>
          <ol style="margin-bottom: 0; padding-left: 1.25rem;">
            <li>Log in to Amazon Seller Central, go to <strong>Catalog</strong> &rarr; <strong>Add Products</strong>, and click <strong>"I am adding a product not sold on Amazon"</strong>.</li>
            <li>Select your product category and check <strong>"I don't have a Product ID"</strong>.</li>
            <li>Enter your exact Brand name (or select "Generic" if unbranded) and click <strong>Apply for GTIN Exemption</strong>.</li>
            <li>Submit unedited photos of all sides of your product and packaging demonstrating that no barcode is present and that brand labeling meets Amazon standards.</li>
            <li>Approval is typically granted within 24 to 48 hours and applies across that entire brand and category combination.</li>
          </ol>
        </div>
        <p><strong>Exempt products still need FNSKU labels</strong> for FBA: only products with a valid GTIN can skip them.</p>`
      },
      {
        id: 'fba-labels',
        h2: 'Step 2: FBA labels (FNSKU)',
        html: `
        <p>Every unit you send to an Amazon fulfilment centre needs a scannable barcode. Which one depends on who you are and where you sell.</p>
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th>You are…</th><th>Amazon US (since 31 March 2026)</th><th>Amazon.in</th></tr></thead>
            <tbody>
              <tr><td>Brand owner, brand representative in Brand Registry, product has one scannable UPC/EAN/ISBN</td><td>Manufacturer barcode allowed, no sticker</td><td>FNSKU label on each unit</td></tr>
              <tr><td>Reseller (including authorised resellers)</td><td>FNSKU label on each unit, even with a UPC</td><td>FNSKU label on each unit</td></tr>
              <tr><td>Product has no barcode, or a GTIN exemption</td><td>FNSKU label on each unit</td><td>FNSKU label on each unit</td></tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li><strong>Why it changed</strong>: Amazon US stopped "commingling", where one seller's order could be filled with another seller's identical unit. Labels keep each seller's stock separate.</li>
          <li><strong>Amazon.in</strong> labels units with FNSKUs by default and allows stickerless, shared stock for books only.</li>
          <li><strong>Amazon US no longer labels for you</strong>: its prep and item-labelling service ended on 1 January 2026. Units that arrive without a required label are marked as defective.</li>
          <li><strong>Label rules</strong>: 1" × 2" to 2" × 3", black on white, removable adhesive; white space of 0.25" on the sides and 0.125" at the top and bottom; FNSKU, product name and condition on the label; thermal or laser printer, never inkjet; cover every other barcode on the unit. Details and a free label maker: <a href="./amazon-fba-fnsku-barcode-generator.html">Amazon FBA FNSKU label generator</a>.</li>
        </ul>
        <div class="fba-label-specs" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin: 1.25rem 0;">
          <h4 style="margin-top: 0; color: var(--text-primary); font-size: 1.05rem;">Amazon FBA Label Dimensions &amp; Print Specifications</h4>
          <ul style="margin-bottom: 0; padding-left: 1.25rem;">
            <li><strong>Standard Label Size:</strong> 1" &times; 2⅝" (25.4 mm &times; 66.7 mm) — standard 30-up Avery 5160 / 5960 / 8160 sheets or direct thermal rolls. Supported range is 1" &times; 2" up to 2" &times; 3".</li>
            <li><strong>Quiet Zones (Margins):</strong> Minimum 0.25" (6.35 mm) blank margin on left and right sides; minimum 0.125" (3.175 mm) top and bottom. Never truncate quiet zones.</li>
            <li><strong>Required Information:</strong> FNSKU barcode in Code 128 (starts with "X"), human-readable FNSKU string, product title (up to 50 characters), and item condition (e.g., "New" or "Used").</li>
            <li><strong>Print Technology:</strong> Direct thermal (Zebra GX430t or similar) or laser printer at 300 DPI or higher. Inkjet printers are strictly prohibited by Amazon due to ink smudging risks.</li>
            <li><strong>Placement:</strong> Cover any existing manufacturer barcodes (UPC/EAN/ISBN) completely. Place on a flat, smooth surface; do not fold over edges, curves, or package seals.</li>
          </ul>
        </div>
        <p>Need to print Amazon labels now? Use our free <a href="./amazon-fba-fnsku-barcode-generator.html">Amazon FBA FNSKU Label Generator</a> to format single thermal stickers or 30-up Avery 5160 PDF sheets directly in your browser.</p>`
      },
      {
        id: 'who-ships',
        h2: 'Who ships your orders changes what you need',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th>Option</th><th>Who stores and packs</th><th>Who delivers</th><th>FNSKU labels?</th></tr></thead>
            <tbody>
              <tr><td>Fulfillment by Amazon (FBA), US and India</td><td>Amazon</td><td>Amazon</td><td>Yes, as in the table above</td></tr>
              <tr><td>Fulfilled by Merchant (US)</td><td>You</td><td>You or your carrier</td><td>No</td></tr>
              <tr><td>Easy Ship (India)</td><td>You</td><td>Amazon picks up and delivers</td><td>No</td></tr>
              <tr><td>Self-Ship (India)</td><td>You</td><td>You or your courier</td><td>No</td></tr>
            </tbody>
          </table>
        </div>
        <p>Whichever you choose, a new listing still needs its product number (Step 1). You can pick a different option for each product; Amazon India says most sellers use a mix.</p>`
      },
      {
        id: 'costs',
        h2: 'What the numbers cost (checked 12 October 2026)',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th>GS1 office</th><th>Smallest option</th><th>First year</th><th>After that</th></tr></thead>
            <tbody>
              <tr><td>GS1 US</td><td>1 GTIN</td><td>$30</td><td>No annual fee</td></tr>
              <tr><td>GS1 US</td><td>Company prefix, 10 products</td><td>$250</td><td>$50 a year</td></tr>
              <tr><td>GS1 India</td><td>100 barcodes, turnover up to ₹5 crore</td><td>₹50,200 (₹27,000 registration + ₹13,000 subscription + 18% GST + ₹3,000 security deposit)</td><td>Renew the subscription to keep using the numbers (GS1 India's fee table)</td></tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>GS1 US prices: <a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-started-guide" target="_blank" rel="noopener noreferrer">GS1 US get-started guide</a>. GS1 India prices: <a href="https://www.gs1india.org/register-for-barcodes" target="_blank" rel="noopener noreferrer">GS1 India registration</a> (fee table effective 1 October 2026; longer terms and larger capacities cost more).</li>
          <li>In India, barcodes starting with 890 come only from GS1 India, and only the brand owner (or someone it authorises) can apply. You choose 100, 1,000, 10,000 or 1,00,000 numbers, and can't change that later.</li>
          <li>Indian micro-manufacturing enterprises can get up to 80% of the GS1 fees for the first 3 years refunded (up to ₹50,650) under the Ministry of MSME's barcode scheme, for the 100 and 1,000 barcode plans.</li>
          <li>FNSKUs don't come from GS1: you print them from your Seller Central account.</li>
        </ul>`
      },
      {
        id: 'what-changed',
        h2: 'What changed in 2026',
        html: `
        <ul>
          <li><strong>1 January</strong>: Amazon US ended its FBA prep and item-labelling service. You apply your own labels.</li>
          <li><strong>31 March</strong>: Amazon US ended commingling. Resellers must label every FBA unit; brand representatives can use the manufacturer barcode.</li>
          <li><strong>1 October</strong>: GS1 India's new fee table took effect.</li>
        </ul>`
      }
    ],
    faqs: [
      {
        q: 'Can I buy cheap UPC codes online for Amazon?',
        a: 'It is risky. Amazon checks UPCs against the GS1 database and removes listings whose numbers don\'t match, and GS1 US warns that a number associated with another company risks rejection. Amazon US tells sellers to get UPCs directly from GS1. GS1 India says only it can issue barcodes starting with 890.'
      },
      {
        q: 'Do I need my own barcode to resell another brand\'s product on Amazon?',
        a: 'On Amazon.in, no: a product ID is only needed to add a product that isn\'t already sold on Amazon. For FBA, resellers need an FNSKU label on each unit: in the US since 31 March 2026 even if the product has a UPC, and on Amazon.in by default.'
      },
      {
        q: 'Can I use the same UPC on Amazon and in shops?',
        a: 'Yes. A GTIN identifies the product itself, so it works on Amazon, in stores and on other marketplaces. The FNSKU is Amazon-only.'
      },
      {
        q: 'Can I print FNSKU labels on an inkjet printer?',
        a: 'No. Amazon says not to use inkjet printers for its barcodes, because inkjet labels smear more easily. Use a thermal printer or a laser printer with label sheets such as Avery 5160, at 300 dpi or more.'
      },
      {
        q: 'Do I need a barcode to sell on Amazon India?',
        a: 'To add a product that isn\'t already on Amazon.in, yes, or a GTIN exemption. To sell something already listed, no. For FBA, each unit needs an FNSKU label unless it\'s a book in the stickerless programme.'
      },
      {
        q: 'What is the exact barcode label size required for Amazon FBA?',
        a: 'Amazon FBA requires barcode labels to measure between 1" × 2" and 2" × 3". The most popular standard format is 1" × 2⅝" (Avery 5160 30-up sheets or direct thermal roll equivalent). Labels must feature at least 0.25" (6.35 mm) side quiet zones and 0.125" (3.175 mm) top and bottom margins, printed at 300 DPI or higher using direct thermal or laser printers. Inkjet printing is prohibited.'
      },
      {
        q: 'How do I buy a legitimate GTIN barcode to list products on Amazon?',
        a: 'Obtain your product identifiers directly from your national GS1 organization (such as GS1 US, GS1 UK, or GS1 India). For small catalogs, GS1 US provides single GTINs for $30 with no annual renewal fees, or company prefixes starting at $250 for 10 products. Amazon automatically validates listing GTINs against the GS1 Verified by GS1 database; recycled barcodes from unauthorized third-party resellers are flagged and rejected.'
      },
      {
        q: 'What is the difference between an Amazon FNSKU and a manufacturer UPC barcode?',
        a: 'A UPC (or EAN) is a global product number that identifies the product item across all retail stores and marketplaces. An FNSKU (Fulfillment Network Stock Keeping Unit) is an Amazon-internal barcode (Code 128 starting with "X") that identifies a specific seller\'s inventory in Amazon warehouses. When preparing units for FBA, the FNSKU label must be placed over the manufacturer\'s UPC barcode.'
      }
    ]
  },
  // Guide "UPC vs EAN-13" (owner choice 2026-10-14, refreshed 2026-11-11). Facts and sources: projects/universalcodemaker/50_content/guide-upc-vs-ean.md.
  {
    slug: 'upc-vs-ean-13-barcode',
    name: 'UPC vs EAN-13: Which Barcode Do You Need?',
    badge: 'Seller Guide',
    queryParam: 'symbology=ean-13',
    metaTitle: 'UPC vs EAN-13: Which Barcode Do You Need?',
    metaDescription: 'UPC-A has 12 digits for US/Canada retail; EAN-13 has 13 digits worldwide. See side-by-side diagrams, quiet zones, official GS1 pricing, and how to convert them.',
    h1: 'UPC vs EAN-13: Which Barcode Do You Need?',
    lead: 'UPC-A (12 digits) and EAN-13 (13 digits) are the primary barcodes used at retail checkout around the world. They share the same physical size, bar geometry and scanner compatibility. The difference lies in where your product number originates, how quiet zones are arranged, and where you sell.',
    datePublished: '2026-10-14',
    dateModified: '2026-11-11',
    relatedSlugs: [
      'how-to-get-a-barcode-for-your-product',
      'ean-13-barcode-generator',
      'upc-a-barcode-generator',
      'do-i-need-a-barcode-to-sell-on-amazon',
      'itf-14-barcode-generator',
      'shopify-barcode-generator'
    ],
    ctas: [
      { href: '../index.html?symbology=ean-13', label: 'Make an EAN-13 barcode' },
      { href: '../index.html?symbology=upc-a', label: 'Make a UPC-A barcode' }
    ],
    sections: [
      {
        id: 'short-answer',
        h2: 'The short answer',
        html: `
        <div class="ean-callout" style="margin-bottom: 1.5rem;">
          <strong>Quick rule of thumb:</strong>
          <ul style="margin: 0.5rem 0 0 1.25rem;">
            <li><strong>Selling primarily in the US or Canada?</strong> Use a 12-digit <strong>UPC-A</strong>.</li>
            <li><strong>Selling outside North America, or exporting globally?</strong> Use a 13-digit <strong>EAN-13</strong>.</li>
            <li><strong>Selling on Amazon?</strong> Amazon accepts both UPC and EAN product identifiers. Use whichever format your GS1 record issued.</li>
          </ul>
        </div>
        <ul>
          <li><strong>Both scan at checkout worldwide.</strong> Modern point-of-sale scanners read both symbologies. North American retailers adopted EAN-13 scanning readiness under the 2005 "Sunrise" initiative, and GS1 US confirms that EAN codes work in the US while UPC codes work in Europe.</li>
          <li><strong>Use the format your number was issued in.</strong> If your GS1 certificate assigns a 12-digit number (GTIN-12), encode it in UPC-A. If it assigns a 13-digit number (GTIN-13), encode it in EAN-13. Do not invent digits or buy separate numbers for different countries.</li>
          <li><strong>International sellers exporting to North America:</strong> If your domestic product carries a valid GS1-issued EAN-13, most US retailers and marketplaces accept it without relabelling. Confirm with your distributor or buyer whether they require a 12-digit UPC-A for legacy inventory systems.</li>
        </ul>`
      },
      {
        id: 'side-by-side',
        h2: 'Side by side: technical specifications',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">UPC-A</th>
                <th scope="col">EAN-13</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Identifier length</th>
                <td>12 digits (GTIN-12)</td>
                <td>13 digits (GTIN-13)</td>
              </tr>
              <tr>
                <th scope="row">Primary geographic region</th>
                <td>United States and Canada</td>
                <td>Worldwide (Europe, UK, Asia, Latin America, Australia)</td>
              </tr>
              <tr>
                <th scope="row">Number composition</th>
                <td>Company prefix + Item reference (11 digits) + Check digit</td>
                <td>GS1 prefix (country) + Company + Item reference (12 digits) + Check digit</td>
              </tr>
              <tr>
                <th scope="row">Printed digit placement</th>
                <td>First digit left of bars, check digit right of bars; 10 digits centered below</td>
                <td>First digit floating outside left quiet zone; remaining 12 digits split below</td>
              </tr>
              <tr>
                <th scope="row">Minimum quiet zones (margins)</th>
                <td><strong>9X left, 9X right</strong> (symmetric: 2.97 mm each side at 100%)</td>
                <td><strong>11X left (3.63 mm), 7X right (2.31 mm)</strong> (asymmetric)</td>
              </tr>
              <tr>
                <th scope="row">Target physical size (100%)</th>
                <td colspan="2">Identical: <strong>37.29 mm wide</strong> (including quiet zones) &times; <strong>22.85 mm high</strong> at X = 0.330 mm</td>
              </tr>
              <tr>
                <th scope="row">Allowed checkout scale</th>
                <td colspan="2">80% to 200% (X-dimension 0.264 mm to 0.660 mm, height 18.28 mm to 45.70 mm)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <figure class="ean-diagram">
          <svg class="ean-diagram-art diagram-wide" viewBox="0 0 1000 520" role="img" aria-labelledby="upc-ean-diag-title upc-ean-diag-desc">
            <title id="upc-ean-diag-title">UPC-A vs EAN-13 structural comparison diagram</title>
            <desc id="upc-ean-diag-desc">Schematic showing UPC-A with 12 digits and 9X symmetric quiet zones versus EAN-13 with 13 digits and 11X left / 7X right quiet zones, plus the leading zero database conversion.</desc>
            <defs>
              <pattern id="diag-upc-bars" width="24" height="140" patternUnits="userSpaceOnUse">
                <rect width="3" height="140" fill="var(--text-primary)"/>
                <rect x="6" width="6" height="140" fill="var(--text-primary)"/>
                <rect x="16" width="3" height="140" fill="var(--text-primary)"/>
              </pattern>
              <pattern id="diag-ean-bars" width="24" height="140" patternUnits="userSpaceOnUse">
                <rect width="4" height="140" fill="var(--text-primary)"/>
                <rect x="7" width="5" height="140" fill="var(--text-primary)"/>
                <rect x="15" width="4" height="140" fill="var(--text-primary)"/>
              </pattern>
              <marker id="diag-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                <path d="M1 1L5 3L1 5" fill="none" stroke="var(--optic-blue)" stroke-width="1.2"/>
              </marker>
            </defs>

            <!-- Main Comparison Card -->
            <rect x="10" y="10" width="980" height="500" rx="8" fill="var(--surface)" stroke="var(--border-subtle)"/>

            <!-- Header -->
            <g font-family="var(--font-heading, sans-serif)" fill="var(--text-primary)">
              <text x="36" y="48" font-size="22" font-weight="700">UPC-A vs. EAN-13: Structure &amp; Margins</text>
              <text x="36" y="74" font-size="14" fill="var(--text-secondary)">Retail checkout standard · Same physical symbol size (37.29 mm × 22.85 mm at X = 0.330 mm) · Schematic only</text>
            </g>

            <!-- LEFT: UPC-A -->
            <g transform="translate(36, 95)">
              <rect width="440" height="270" rx="6" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <text x="20" y="32" font-family="var(--font-heading, sans-serif)" font-size="17" font-weight="700" fill="var(--text-primary)">UPC-A (GTIN-12)</text>
              <text x="20" y="52" font-family="var(--font-body, sans-serif)" font-size="13" fill="var(--text-secondary)">Standard in US &amp; Canada · 12 digits</text>

              <rect x="60" y="72" width="36" height="120" fill="var(--optic-blue-tint)"/>
              <rect x="96" y="72" width="248" height="120" fill="url(#diag-upc-bars)"/>
              <rect x="344" y="72" width="36" height="120" fill="var(--optic-blue-tint)"/>

              <g stroke="var(--optic-blue)" stroke-width="1.2" fill="none">
                <path d="M60 66v-8m36 8v-8M60 62h36"/>
                <path d="M344 66v-8m36 8v-8M344 62h36"/>
              </g>
              <text x="78" y="54" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">9X</text>
              <text x="362" y="54" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">9X</text>

              <g font-family="var(--font-mono, monospace)" font-size="18" fill="var(--text-primary)">
                <text x="42" y="200" fill="var(--text-secondary)">0</text>
                <text x="110" y="208" letter-spacing="3">36000 29145</text>
                <rect x="384" y="184" width="22" height="26" rx="3" fill="var(--optic-blue-tint)"/>
                <text x="389" y="202" font-weight="700" fill="var(--optic-blue)">2</text>
              </g>
              <text x="20" y="248" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">Symmetric quiet zones: 9X left, 9X right (2.97 mm at 100%)</text>
            </g>

            <!-- RIGHT: EAN-13 -->
            <g transform="translate(504, 95)">
              <rect width="440" height="270" rx="6" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <text x="20" y="32" font-family="var(--font-heading, sans-serif)" font-size="17" font-weight="700" fill="var(--text-primary)">EAN-13 (GTIN-13)</text>
              <text x="20" y="52" font-family="var(--font-body, sans-serif)" font-size="13" fill="var(--text-secondary)">Standard Worldwide &amp; Amazon · 13 digits</text>

              <rect x="52" y="72" width="44" height="120" fill="var(--optic-blue-tint)"/>
              <rect x="96" y="72" width="248" height="120" fill="url(#diag-ean-bars)"/>
              <rect x="344" y="72" width="28" height="120" fill="var(--optic-blue-tint)"/>

              <g stroke="var(--optic-blue)" stroke-width="1.2" fill="none">
                <path d="M52 66v-8m44 8v-8M52 62h44"/>
                <path d="M344 66v-8m28 8v-8M344 62h28"/>
              </g>
              <text x="74" y="54" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">11X</text>
              <text x="358" y="54" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="var(--optic-blue)" text-anchor="middle">7X</text>

              <g font-family="var(--font-mono, monospace)" font-size="18" fill="var(--text-primary)">
                <text x="34" y="208" font-weight="700" fill="var(--optic-blue)">5</text>
                <text x="106" y="208" letter-spacing="3">901234 12345</text>
                <rect x="376" y="190" width="22" height="26" rx="3" fill="var(--optic-blue-tint)"/>
                <text x="381" y="208" font-weight="700" fill="var(--optic-blue)">7</text>
              </g>
              <text x="20" y="248" font-family="var(--font-body, sans-serif)" font-size="12" fill="var(--text-secondary)">Asymmetric quiet zones: 11X left (3.63 mm), 7X right (2.31 mm)</text>
            </g>

            <!-- BOTTOM: The Database Zero-Prefix Conversion Banner -->
            <g transform="translate(36, 385)">
              <rect width="908" height="96" rx="6" fill="var(--surface-alt)" stroke="var(--border-subtle)"/>
              <text x="24" y="32" font-family="var(--font-heading, sans-serif)" font-size="15" font-weight="700" fill="var(--text-primary)">How Retail Databases Connect Them: The Leading Zero (0)</text>
              <g font-family="var(--font-mono, monospace)" font-size="15" fill="var(--text-primary)">
                <text x="24" y="64">UPC-A: <tspan font-weight="700">036000291452</tspan> (12 digits)</text>
                <path d="M305 59h35" stroke="var(--optic-blue)" stroke-width="2" marker-end="url(#diag-arrow)"/>
                <text x="355" y="64">GTIN-13: <tspan fill="var(--optic-blue)" font-weight="700">0</tspan><tspan font-weight="700">036000291452</tspan> (13 digits)</text>
              </g>
              <text x="640" y="64" font-family="var(--font-body, sans-serif)" font-size="13" fill="var(--text-secondary)">Check digit (2) remains unchanged.</text>
            </g>
          </svg>
          <ol class="ean-diagram-legend">
            <li><strong>1. UPC-A Quiet Zones:</strong> Requires at least 9 times the narrowest bar width (9X) on both sides (2.97 mm at nominal 0.330 mm).</li>
            <li><strong>2. EAN-13 Quiet Zones:</strong> Asymmetric layout requiring 11X on the left (3.63 mm) and 7X on the right (2.31 mm) to protect the floating prefix digit.</li>
            <li><strong>3. Identical Symbol Footprint:</strong> Both barcodes share the exact same total width (37.29 mm) and bar height (22.85 mm) at nominal 100% scale.</li>
            <li><strong>4. Leading Zero Conversion:</strong> Retail inventory databases convert a 12-digit UPC-A into a 13-digit GTIN-13 by prepending a 0. The check digit is unchanged.</li>
          </ol>
          <figcaption>Schematic illustration, not a scan sample. Dimensions source: <a href="https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications" target="_blank" rel="noopener noreferrer">GS1 General Specifications</a> (Sections 5.2.1.1 &amp; 5.2.1.4).</figcaption>
        </figure>`
      },
      {
        id: 'ean-in-the-us',
        h2: 'Can I use EAN-13 in the US, or UPC-A outside it?',
        html: `
        <p>Yes, in both directions. Before 2005, products sold in the US and Canada had to carry a 12-digit UPC, so foreign makers relabelled their goods. GS1 US then set <strong>1 January 2005</strong> (the "Sunrise" date) as the day retailers and their partners that scan UPCs should handle 13-digit EAN-13 codes too.</p>
        <ul>
          <li>GS1 Greece: "Since that date most retailers have been able to handle products marked with EAN-13 symbols."</li>
          <li><a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-started-guide" target="_blank" rel="noopener noreferrer">GS1 US guidance</a> confirms: "your EAN code works in the U.S. and … your UPC is functional in Europe."</li>
          <li>Amazon accepts UPC, EAN, JAN and ISBN product numbers per <a href="https://sellercentral.amazon.com/help/hub/reference/external/G200317470" target="_blank" rel="noopener noreferrer">Amazon GTIN requirements</a> (see also our guide: <a href="./do-i-need-a-barcode-to-sell-on-amazon.html">Do I need a barcode to sell on Amazon?</a>).</li>
        </ul>
        <p>One caution from GS1 Greece: if you're exporting to the US or Canada, check with your buyer. If a retailer insists on a 12-digit UPC, your GS1 office can arrange a UPC company prefix.</p>`
      },
      {
        id: 'converting',
        h2: 'Converting between UPC-A and EAN-13',
        html: `
        <p>Because point-of-sale systems operate internationally, modern retail databases store product identifiers in standardized 13-digit (GTIN-13) or 14-digit (GTIN-14) data fields. Here is how numbers convert mathematically:</p>

        <ul>
          <li><strong>UPC-A to EAN-13 (Add a leading 0):</strong> To represent a 12-digit UPC-A in a 13-digit EAN system, place a single <code>0</code> at the beginning. The check digit does not change.
            <br><em>Example:</em> UPC-A <code>036000291452</code> becomes EAN-13 <code>0036000291452</code>.
            <br><small>Why? In the <a href="https://www.gs1uk.org/knowledge-hub/standards/what-is-a-check-digit" target="_blank" rel="noopener noreferrer">GS1 Modulo-10 checksum calculation</a>, the added 0 adds 0 to the weighted sum. The final check digit remains identical.</small>
          </li>
          <li><strong>EAN-13 to UPC-A (Only if starting with 0):</strong> An EAN-13 can only be converted to a UPC-A if its first digit is <code>0</code>. If an EAN-13 begins with any other digit (such as <code>590...</code> or <code>890...</code>), it represents an international GS1 prefix and <strong>cannot</strong> be shortened to a 12-digit UPC. Do not truncate the first digit to force a foreign EAN into a UPC barcode.</li>
          <li><strong>14-Digit Database Padding (GTIN-14):</strong> In warehouse logistics and EDI systems, both codes are padded with leading zeros to fill 14 characters:
            <br>UPC-A: <code>00036000291452</code>
            <br>EAN-13: <code>005901234123457</code>
          </li>
        </ul>
        <p>UniversalCodeMaker lets you create and verify both formats: enter 11 data digits in the <a href="./upc-a-barcode-generator.html">UPC-A generator</a> to calculate the 12th check digit, or 12 data digits in the <a href="./ean-13-barcode-generator.html">EAN-13 generator</a> for the 13th.</p>`
      },
      {
        id: 'barcode-costs',
        h2: 'Where to get barcodes and what they cost',
        html: `
        <p>UniversalCodeMaker generates barcode graphic files (SVG, EPS, PNG) from numbers you provide for free. However, if your product is sold in retail stores or online marketplaces, the <strong>product identifier itself must be licensed from GS1</strong> so it is registered to your company in the <a href="https://www.gs1.org/" target="_blank" rel="noopener noreferrer">official global GS1 registry</a>.</p>

        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead>
              <tr>
                <th scope="col">Licensing option</th>
                <th scope="col">Initial cost</th>
                <th scope="col">Annual renewal</th>
                <th scope="col">Best suited for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-a-barcode" target="_blank" rel="noopener noreferrer">GS1 US</a>: Single GTIN-12</strong></th>
                <td>USD $30</td>
                <td><strong>$0 (No renewal fee)</strong></td>
                <td>Small businesses selling 1 to 9 products or variants in North America / Amazon</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1us.org/upcs-barcodes-prefixes/get-started-guide" target="_blank" rel="noopener noreferrer">GS1 US</a>: Company Prefix (1–10 items)</strong></th>
                <td>USD $250</td>
                <td>USD $50 / year</td>
                <td>Growing businesses planning larger catalogues under their own brand prefix</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1uk.org/" target="_blank" rel="noopener noreferrer">GS1 UK</a>: Small Business Band</strong></th>
                <td>£50 + VAT</td>
                <td>£50 + VAT / year</td>
                <td>UK / European sellers with up to 10 product lines</td>
              </tr>
              <tr>
                <th scope="row"><strong><a href="https://www.gs1.org/" target="_blank" rel="noopener noreferrer">National GS1 Offices (Global)</a></strong></th>
                <td>Varies by country</td>
                <td>Country-dependent</td>
                <td>Local national currency pricing (e.g. GS1 India, GS1 Australia, GS1 Germany)</td>
              </tr>
              <tr>
                <th scope="row"><strong>Third-Party Resellers (brokers)</strong></th>
                <td>$5 – $10</td>
                <td>$0</td>
                <td><strong>High risk:</strong> Numbers were previously licensed to older companies. GS1 database will not show your brand name. Amazon and major chains reject unverified barcodes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ean-callout">
          <strong>Why cheap reseller barcodes fail on Amazon and retail:</strong>
          <p style="margin: 0.5rem 0 0;">Marketplaces such as Amazon automatically verify barcode numbers against the official GS1 database (via <a href="https://www.gs1.org/services/verified-by-gs1" target="_blank" rel="noopener noreferrer">Verified by GS1</a>, formerly GEPIR) under <a href="https://sellercentral.amazon.com/help/hub/reference/external/G200317470" target="_blank" rel="noopener noreferrer">Amazon's Product ID policy</a>. When a reseller sells you a recycled UPC, the database lists the original licensee—not your brand. If the company name does not match, Amazon flags the listing as invalid and can suspend or remove the product.</p>
        </div>
        <p style="margin-top: 1rem;">Need step-by-step guidance on licensing your company prefix from GS1, assigning unique variant numbers per SKU, and testing printed proofs before manufacturing? Read our complete seller walkthrough: <a href="./how-to-get-a-barcode-for-your-product.html">How to Get a Barcode for Your Product (GTIN Guide)</a>.</p>`
      },
      {
        id: 'choose-generator',
        h2: 'Choose your generator',
        html: `
        <p>Once you have your GS1-assigned number, select the generator below to create print-ready vector artwork or label sheets:</p>
        <div class="content-grid" style="margin: 1.5rem 0 2rem;">
          <div class="info-card" style="border-top: 4px solid var(--accent);">
            <h3 class="info-card-title">Make a UPC-A Barcode</h3>
            <p>For products sold in the United States or Canada. Enter 11 data digits to calculate the 12th check digit, or all 12 digits to verify.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>12 digits (GTIN-12)</li>
              <li>Vector SVG &amp; EPS for packaging</li>
              <li>Avery label sheet layouts</li>
            </ul>
            <a href="./upc-a-barcode-generator.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Open UPC-A Generator
            </a>
          </div>

          <div class="info-card" style="border-top: 4px solid var(--optic-blue);">
            <h3 class="info-card-title">Make an EAN-13 Barcode</h3>
            <p>For products sold internationally, outside North America, or on global Amazon stores. Generate directly on the page or open in the studio.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>13 digits (GTIN-13)</li>
              <li>On-page generator &amp; preview</li>
              <li>Quiet-zone &amp; packaging guide</li>
            </ul>
            <a href="./ean-13-barcode-generator.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Open EAN-13 Generator
            </a>
          </div>

          <div class="info-card" style="border-top: 4px solid var(--sensor-green);">
            <h3 class="info-card-title">How to Get a Barcode for Your Product</h3>
            <p>Step-by-step walkthrough: licensing your GTIN, assigning variant numbers per SKU, and testing proofs before printing.</p>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.75rem 0 1.25rem 1.2rem;">
              <li>4-step packaging pipeline</li>
              <li>Official national fee comparison</li>
              <li>Amazon &amp; retailer verification rules</li>
            </ul>
            <a href="./how-to-get-a-barcode-for-your-product.html" class="cta-launch-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
              Read Product Barcode Guide
            </a>
          </div>
        </div>`
      },
      {
        id: 'related-codes',
        h2: 'Smaller and related barcodes',
        html: `
        <ul>
          <li><strong>EAN-8 and UPC-E</strong>: short versions for very small packs (8 digits). UniversalCodeMaker does not generate these.</li>
          <li><strong>ISBN</strong>: books use an EAN-13 whose number starts with 978 or 979, from your national ISBN agency rather than GS1. <a href="./isbn-book-barcode-generator.html">ISBN barcode generator</a>.</li>
          <li><strong>ITF-14</strong>: outer cartons and cases use a 14-digit number in an ITF-14 barcode, not EAN-13 or UPC-A. <a href="./itf-14-barcode-generator.html">ITF-14 generator</a>.</li>
        </ul>`
      },
      {
        id: 'mistakes',
        h2: 'Common mistakes to avoid',
        html: `
        <ul>
          <li><strong>Buying recycled barcodes from brokers.</strong> GS1 US warns that numbers associated with another company risk rejection, and Amazon removes listings whose UPCs don't match GS1's database.</li>
          <li><strong>Buying separate UPC and EAN numbers for the same item.</strong> Unnecessary expense: scanners worldwide read both; an EAN-13 scans in the US, and a UPC-A scans in Europe.</li>
          <li><strong>Truncating the first digit of an EAN-13.</strong> Only EAN-13s starting with 0 have a UPC-A counterpart. International prefixes 1–9 cannot be shortened.</li>
          <li><strong>Encroaching on quiet zones.</strong> UPC-A needs 9X margins each side; EAN-13 needs 11X on the left. Placing artwork, text or box edges too close causes register read errors.</li>
          <li><strong>Confusing SKU with UPC or EAN.</strong> A SKU is your internal warehouse inventory code. A GTIN is the universal retail identifier recognized across the supply chain.</li>
        </ul>`
      }
    ],
    faqs: [
      {
        q: 'Is a UPC the same as an EAN?',
        a: 'They are part of the same GS1 barcode family. A UPC-A carries a 12-digit number (GTIN-12) primarily used in North America, while an EAN-13 carries a 13-digit number (GTIN-13) used worldwide. Adding a leading 0 to a UPC-A converts it into a valid 13-digit GTIN without changing the check digit.'
      },
      {
        q: 'Can I use an EAN-13 barcode in the United States?',
        a: 'Yes. Since the 2005 Sunrise date, point-of-sale barcode scanners across North America have been equipped to decode 13-digit EAN-13 symbols alongside 12-digit UPCs. If supplying a US retailer, confirm whether their inventory system accepts GTIN-13 or requires GTIN-12.'
      },
      {
        q: 'What is the cheapest way to get a legitimate UPC or EAN barcode?',
        a: 'For small businesses needing 1 to 9 codes, GS1 US offers single GTIN-12 identifiers for $30 with no annual renewal fees. In the UK, GS1 UK offers small business memberships for £50 + VAT per year. Avoid cheap third-party brokers, as unverified reseller barcodes risk rejection on Amazon and retail stores. For a complete breakdown of licensing options, see our guide: <a href="./how-to-get-a-barcode-for-your-product.html">How to get a barcode for your product</a>.'
      },
      {
        q: 'How do I convert a UPC-A to an EAN-13?',
        a: 'Add a 0 in front of the 12 digits. The check digit does not change because multiplying the added 0 by 3 adds nothing to the checksum calculation. For example, UPC-A 036000291452 becomes EAN-13 0036000291452.'
      },
      {
        q: 'Are UPC-A and EAN-13 barcodes the same physical size?',
        a: 'Yes. At the nominal 100% scale, both barcodes share the identical overall width of 37.29 mm (including blank margins) and bar height of 22.85 mm at X = 0.330 mm, per GS1 General Specifications.'
      },
      {
        q: 'Do I need both a UPC and an EAN for my product?',
        a: 'No. One universal GS1 product identifier functions globally. Scanners in Europe can read UPC-A barcodes, and modern scanners in the US can read EAN-13 barcodes. Marketplaces such as Amazon accept both formats.'
      }
    ]
  }
];

function generateArticleHtml(article) {
  const pageUrl = `${SITE_URL}/pages/${article.slug}.html`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.h1,
    "description": article.metaDescription,
    "url": pageUrl,
    "mainEntityOfPage": pageUrl,
    "datePublished": article.datePublished,
    ...(article.dateModified ? { "dateModified": article.dateModified } : {}),
    "author": { "@type": "Organization", "name": "UniversalCodeMaker", "url": `${SITE_URL}/` },
    "publisher": { "@type": "Organization", "name": "UniversalCodeMaker", "url": `${SITE_URL}/` },
    "image": `${SITE_URL}/assets/og-preview.png`
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": article.name, "item": pageUrl }
    ]
  };

  const ctasHtml = article.ctas.map(c => `
        <a href="${c.href}" class="cta-launch-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          ${c.label}
        </a>`).join('');

  const tocHtml = article.sections.map(s => `
          <li><a href="#${s.id}">${s.h2}</a></li>`).join('');

  const sectionsHtml = article.sections.map(s => `
    <section class="article-section" id="${s.id}" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title">${s.h2}</h2>
      ${s.html.trim()}
    </section>`).join('\n');

  const faqItemsHtml = article.faqs.map((f, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">▼</span>
      </summary>
      <div class="faq-answer">
        <p>${f.a}</p>
      </div>
    </details>
  `).join('');

  return `${headTopHtml(article, pageUrl)}
${PAGE_STYLES}

  <!-- Structured Data JSON-LD Schemas -->
  <script type="application/ld+json">
    ${JSON.stringify(articleJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(faqJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(breadcrumbJsonLd, null, 2)}
  </script>
</head>
<body>

${siteHeaderHtml(article.queryParam)}

  <main class="seo-page-container">

    <section class="hero-banner">
      <div class="hero-badge">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
        ${article.badge}
      </div>
      <h1 class="hero-title">${article.h1}</h1>
      <p class="hero-lead">${article.lead}</p>
      <div class="article-ctas">${ctasHtml}
      </div>${hasEanWorkflow(article.slug) ? identifierNoticeHtml(false) : ''}
    </section>

    <div class="article-layout">
      <nav class="article-toc" aria-label="On this page">
        <h2>On this page</h2>
        <ol>${tocHtml}
          <li><a href="#faq">Frequently asked questions</a></li>
        </ol>
      </nav>

      <article class="article-body">
${sectionsHtml}
      </article>
    </div>

    <section class="faq-section" id="faq">
      <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary);">Frequently Asked Questions</h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

    <!-- Related Guides & Barcode Tools -->
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Related Guides &amp; Barcode Tools
      </h2>
      <div class="related-grid">
        ${((article.relatedSlugs && article.relatedSlugs.length > 0)
          ? article.relatedSlugs.map(s => [...SEO_PAGES, ...ARTICLES].find(x => x.slug === s)).filter(Boolean)
          : SEO_PAGES.filter(p => p.slug !== article.slug).slice(0, 6)
        ).map(p => `
          <a href="./${p.slug}.html" class="related-card">
            <span class="related-tag">${p.category || p.badge || 'Seller Guide'}</span>
            <span class="related-title">
              <span>${p.name}</span>
              <span class="related-arrow"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </span>
          </a>
        `).join('')}
      </div>
    </section>

  </main>

${SITE_FOOTER_HTML}
</body>
</html>`;
}

// Shared page chrome: the same <head> start, styles, header and footer for landing pages and guide pages.
// `meta` needs metaTitle and metaDescription; `pageUrl` is the canonical URL.
function headTopHtml(meta, pageUrl) {
  const page = meta;
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <!-- Google Analytics: loads only after consent (js/core/consent-analytics.js) -->
  <script src="/js/core/consent-analytics.js?v=1.1" defer></script>
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3988564922048072" crossorigin="anonymous"></script>


  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.metaTitle}</title>
  <meta name="description" content="${page.metaDescription}">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

  <meta name="theme-color" content="#06b6d4">

  <!-- Favicons & App Icons (Google Search & Multi-Platform Compliant) -->
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/icon-192.png">
  <link rel="alternate icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
  <link rel="shortcut icon" href="../favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">

  <!-- Open Graph & Social -->
  <meta property="og:title" content="${page.metaTitle}">
  <meta property="og:description" content="${page.metaDescription}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE_URL}/assets/og-preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.metaTitle}">
  <meta name="twitter:description" content="${page.metaDescription}">
  <meta name="twitter:image" content="${SITE_URL}/assets/og-preview.png">

  <!-- Self-hosted fonts (declared in ../css/v2-theme.css); preload visible above the fold -->
  <link rel="preload" href="../assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin>

  <link rel="stylesheet" href="../css/v2-theme.css?v=${ASSET_VERSION}">
  <link rel="stylesheet" href="../css/v2-pages.css?v=${ASSET_VERSION}">${page.slug === 'ean-13-barcode-generator' ? '\n  <link rel="stylesheet" href="../css/ean-onpage.css?v=1.0">' : ''}${eanWorkflowStyles(page.slug)}

  <script>
    (function () {
      const savedTheme = localStorage.getItem('ucm_theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const savedAccent = localStorage.getItem('ucm_accent') || 'crimson';
      document.documentElement.setAttribute('data-accent', savedAccent);
    })();
  </script>
`;
}

const PAGE_STYLES = `  <style>
    .seo-page-container {
      max-width: 1080px;
      margin: 2.25rem auto 4rem;
      padding: 0 1.5rem;
    }
    .hero-banner {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-ink);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: var(--optic-blue-tint);
      border: 1.5px solid var(--optic-blue);
      border-radius: var(--radius-full);
      color: var(--accent-text); /* text-safe on the tint in both themes */
      font-size: 0.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    .hero-lead {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 820px;
      margin-bottom: 1.75rem;
    }
    .cta-launch-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--accent-fill);
      color: #ffffff;
      padding: 0.85rem 1.6rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: var(--shadow-ink);
      transition: all var(--transition-fast);
    }
    .cta-launch-btn:hover {
      background: var(--accent-fill-hover);
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-laser);
      color: #ffffff;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
    }
    .info-card {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-ink);
      padding: 1.5rem;
    }
    .info-card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .spec-table {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.85rem;
    }
    .spec-key {
      color: var(--text-secondary);
      font-weight: 600;
    }
    .spec-val {
      font-family: var(--font-mono);
      color: var(--text-primary);
      font-weight: 600;
      text-align: right;
    }
    .use-cases-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 0;
      margin: 0;
    }
    .use-case-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }
    .use-case-check {
      color: var(--optic-blue);
      font-weight: 700;
    }
    .faq-section {
      margin-bottom: 3rem;
    }
    .faq-item {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-ink);
      margin-bottom: 0.75rem;
      overflow: hidden;
      transition: all var(--transition-fast);
    }
    .faq-item[open] {
      border-color: var(--border-color);
    }
    .faq-question {
      padding: 1rem 1.25rem;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-primary);
      user-select: none;
    }
    .faq-answer {
      padding: 0 1.25rem 1.1rem 1.25rem;
      color: var(--text-secondary);
      font-size: 0.88rem;
      line-height: 1.6;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .related-card {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-ink);
      padding: 1rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all var(--transition-fast);
    }
    .related-card:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-blue);
      border-color: var(--optic-blue);
    }
    .related-tag {
      font-size: 0.72rem;
      color: var(--optic-blue);
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .related-title {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .related-arrow {
      color: var(--optic-blue);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
    }
    .hardware-box {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-ink);
      padding: 1.25rem 1.5rem;
      margin: 2.25rem 0 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .hardware-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .hardware-box-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .hardware-box-disclosure {
      font-size: 0.74rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .hardware-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }
    .hardware-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      box-shadow: 2px 2px 0 var(--border-color);
      transition: all var(--transition-fast);
    }
    .hardware-pill:hover {
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 var(--scanner-laser);
      border-color: var(--scanner-laser);
      color: var(--laser-text);
    }
  </style>`;

// `queryParam` sets which format/QR type the "Launch Studio" button opens.
function siteHeaderHtml(queryParam) {
  const page = { queryParam };
  return `  <!-- Site Header -->
  <header class="v2-header">
    <div class="wrap">
      <div class="v2-header-container">
        <a href="../index.html" class="v2-brand">
          <div class="v2-brand-badge" style="background: var(--surface);">
            <img src="../assets/logo-icon.png" alt="UniversalCodeMaker Logo" width="34" height="34" style="display: block; object-fit: contain;">
          </div>
          <div>
            <div class="v2-brand-title">
              UniversalCodeMaker
              <span class="v2-version-tag">FREE</span>
            </div>
            <span class="v2-brand-tagline">Precision Optical Barcode &amp; Custom QR Suite</span>
          </div>
        </a>

        <div class="v2-nav-links">
          <a href="../index.html?${page.queryParam}" class="btn btn-laser btn-sm" style="text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Launch Studio
          </a>
          <a href="../about.html" class="v2-nav-link">About</a>
          <a href="../symbology-docs.html" class="v2-nav-link">Docs</a>
          <a href="../barcode-scanner.html" class="v2-nav-link">Scanner</a>
          <div class="v2-accent-picker" title="Tactical Optics Accent Palette" aria-label="Tactical Optics Accent Palette">
            <button type="button" class="accent-dot active" data-accent="crimson" title="Laser Crimson"></button>
            <button type="button" class="accent-dot" data-accent="cobalt" title="Signal Cobalt"></button>
            <button type="button" class="accent-dot" data-accent="amber" title="Cyber Amber"></button>
            <button type="button" class="accent-dot" data-accent="emerald" title="Matrix Emerald"></button>
          </div>
          <button type="button" class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Toggle Optical Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span>Obsidian Laser</span>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

const SITE_FOOTER_HTML = `  <!-- Site Footer -->
  <footer class="v2-footer">
    <div class="wrap">
      <!-- Same footer as the studio and root pages (keep in sync with index.html) -->
      <div class="footer-top">
        <div class="footer-brand">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div class="v2-brand-badge" style="width: 38px; height: 38px; background: var(--surface);">
              <img src="../assets/logo-icon.png" alt="UniversalCodeMaker Logo" width="30" height="30" style="display: block; object-fit: contain;">
            </div>
            <div class="v2-brand-title">
              UniversalCodeMaker <span class="v2-version-tag">V2</span>
            </div>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
            Browser-based QR &amp; barcode tools with local payload generation, practical export options, and print-testing guidance.
          </p>
        </div>

        <div class="footer-links-group">
          <div class="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="../index.html">Optical Studio</a></li>
              <li><a href="../index.html#symbologies">Symbologies Directory</a></li>
              <li><a href="../barcode-scanner.html">Barcode &amp; QR Scanner</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Standards &amp; Docs</h4>
            <ul>
              <li><a href="../symbology-docs.html">Symbology Documentation</a></li>
              <li><a href="../about.html">About &amp; Mission</a></li>
              <li><a href="../privacy-policy.html">Your codes stay in your browser</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Ecosystem</h4>
            <ul>
              <li><a href="https://primordialparadigm.com" target="_blank" rel="noopener">Primordial Paradigm ↗</a></li>
              <li><a href="../contact.html">Report Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 5-Column Programmatic SEO & Symbology Directory Matrix -->
      <div class="v2-footer-matrix">
        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Retail &amp; Publishing
          </h4>
          <ul>
            <li><a href="./ean-13-barcode-generator.html">EAN-13 Barcode Generator</a></li>
            <li><a href="./upc-a-barcode-generator.html">UPC-A Barcode Generator</a></li>
            <li><a href="./isbn-book-barcode-generator.html">ISBN Bookland Barcode</a></li>
            <li><a href="./shopify-barcode-generator.html">Shopify Product Barcode</a></li>
            <li><a href="./amazon-fba-fnsku-barcode-generator.html">Amazon FBA / FNSKU Barcode</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Logistics, Sheets &amp; Bulk
          </h4>
          <ul>
            <li><a href="./avery-5160-barcode-generator.html">Avery 5160 Label Generator</a></li>
            <li><a href="./bulk-barcode-generator-excel.html">Bulk Excel Barcode Generator</a></li>
            <li><a href="./code-128-barcode-generator.html">Code 128 Shipping Barcode</a></li>
            <li><a href="./code-39-barcode-generator.html">Code 39 Asset Barcode</a></li>
            <li><a href="./itf-14-barcode-generator.html">ITF-14 Carton Barcode</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            2D Industrial &amp; Density
          </h4>
          <ul>
            <li><a href="./data-matrix-generator.html">Data Matrix 2D Generator</a></li>
            <li><a href="./aztec-code-generator.html">Aztec Code Generator</a></li>
            <li><a href="./pdf417-barcode-generator.html">PDF417 Barcode Generator</a></li>
            <li><a href="../symbology-docs.html">Barcode &amp; QR Symbology Guides</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sensor-green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Smart QR Generators
          </h4>
          <ul>
            <li><a href="./google-reviews-qr-code-generator.html">Google Review QR</a></li>
            <li><a href="./upi-qr-code-generator.html">UPI Scan-to-Pay QR</a></li>
            <li><a href="./wifi-qr-code-generator.html">Wi-Fi Network QR Code</a></li>
            <li><a href="./vcard-qr-code-generator.html">vCard Digital Contact QR</a></li>
            <li><a href="./google-maps-location-qr-code-generator.html">Google Maps Location QR</a></li>
            <li><a href="./crypto-qr-code-generator.html">Crypto Wallet QR Code</a></li>
            <li><a href="./calendar-event-qr-code-generator.html">Calendar Event (iCal) QR</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messaging &amp; Text QR
          </h4>
          <ul>
            <li><a href="./whatsapp-qr-code-generator.html">WhatsApp Direct Chat QR</a></li>
            <li><a href="./email-qr-code-generator.html">Email Message QR Code</a></li>
            <li><a href="./sms-qr-code-generator.html">SMS Direct Message QR</a></li>
            <li><a href="./phone-call-qr-code-generator.html">Phone Call Dialer QR</a></li>
            <li><a href="./plain-text-qr-code-generator.html">Plain Text QR Code</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 UniversalCodeMaker.com. Free, Client-Side Code Generator.</p>
        <ul class="v2-footer-legal-links">
          <li><a href="../terms.html">Terms of Service</a></li>
          <li><a href="../privacy-policy.html">Privacy Policy</a></li>
          <li class="js-consent-settings" hidden><a href="../privacy-policy.html#consent">Privacy and cookie settings</a></li>
          <li><a href="../symbology-docs.html">Symbology Docs</a></li>
          <li><a href="../about.html">About Us</a></li>
          <li><a href="../contact.html">Contact Us</a></li>
        </ul>
        <div class="v2-trademark-notice">
          QR Code is a registered trademark of DENSO WAVE INCORPORATED. Avery&reg; and Avery template numbers are registered trademarks of Avery Products Corporation / CCL Industries Inc. GS1, EAN, and UPC are registered trademarks of GS1 AISBL. Amazon is a trademark of Amazon.com, Inc. or its affiliates. Google and Google Reviews are trademarks of Google LLC. WhatsApp is a registered trademark of Meta Platforms, Inc. UPI is a registered trademark of NPCI. All product and company names are trademarks&trade; or registered&reg; trademarks of their respective holders; use does not imply any affiliation or endorsement.
        </div>
      </div>
    </div>
  </footer>

  <!-- Navigation & Theme Sync Script -->
  <script src="../js/v2-nav.js?v=2.4"></script>
  <script src="../js/core/header-offset.js?v=1.0"></script>
`;

function generatePageHtml(page) {
  const pageUrl = `${SITE_URL}/pages/${page.slug}.html`;
  const enrichment = ENRICHMENTS[page.slug] || {};
  const benefits = enrichment.benefits || [];
  const decisionGuide = enrichment.decisionGuide || [];
  const legalCaution = enrichment.legalCaution || null;
  const authorityLinks = enrichment.authorityLinks || [];
  const guide = GUIDES[page.slug] || null;
  const faqs = [...page.faqs, ...((guide && guide.moreFaqs) || [])];

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${page.name} - UniversalCodeMaker.com`,
    "url": pageUrl,
    "description": page.metaDescription,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Works in all modern browsers.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": page.name,
        "item": pageUrl
      }
    ]
  };

  const faqItemsHtml = faqs.map((f, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">▼</span>
      </summary>
      <div class="faq-answer">
        <p>${f.a}</p>
      </div>
    </details>
  `).join('');

  const specsListHtml = page.technicalSpec ? Object.entries(page.technicalSpec).map(([k, v]) => `
    <div class="spec-row">
      <dt class="spec-key">${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</dt>
      <dd class="spec-val">${v}</dd>
    </div>
  `).join('') : '';

  const useCasesHtml = page.useCases ? page.useCases.map(u => `
    <li class="use-case-item">
      <span class="use-case-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <span>${u}</span>
    </li>
  `).join('') : '';

  const allItems = [...SEO_PAGES, ...ARTICLES];
  const relatedItems = (page.relatedSlugs && page.relatedSlugs.length > 0)
    ? page.relatedSlugs.map(s => allItems.find(x => x.slug === s)).filter(Boolean)
    : SEO_PAGES.filter(p => p.slug !== page.slug).slice(0, 6);

  const relatedPagesHtml = relatedItems.map(p => `
    <a href="./${p.slug}.html" class="related-card">
      <span class="related-tag">${p.category || p.badge || 'Seller Guide'}</span>
      <span class="related-title">
        <span>${p.name}</span>
        <span class="related-arrow"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </span>
    </a>
  `).join('');

  const benefitsHtml = benefits.map(b => `
    <div class="benefit-card">
      <div class="benefit-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <${page.slug === 'ean-13-barcode-generator' ? 'h3' : 'h4'}>${b.title}</${page.slug === 'ean-13-barcode-generator' ? 'h3' : 'h4'}>
      </div>
      <p>${b.desc}</p>
    </div>
  `).join('');

  const decisionGuideHtml = decisionGuide.map(d => `
    <div class="decision-item">
      <h3 style="display: flex; align-items: center; gap: 0.45rem;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>${d.q}</span>
      </h3>
      <p>${d.a}</p>
    </div>
  `).join('');

  const cautionPointsHtml = legalCaution ? legalCaution.points.map(p => `
    <li>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 0.15rem;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>${p}</span>
    </li>
  `).join('') : '';

  const authorityLinksHtml = authorityLinks.map(a => `
    <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="authority-link-item">
      <div class="authority-link-title">
        <span>${a.name}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </div>
      <div class="authority-link-desc">${a.desc}</div>
    </a>
  `).join('');

  const isQrPage = page.category === 'Smart QR' || page.category === 'Smart QR Codes' || page.slug.includes('qr');
  let hardwareItemsHtml = '';
  if (page.slug.includes('avery-5160')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=avery+5160+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M6 8h12M6 12h12M6 16h8"/></svg>
        <span>Avery 5160 Labels (3,000 pk)</span>
      </a>
      <a href="https://www.amazon.com/s?k=hp+laserjet+pro+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>HP LaserJet Pro Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Wireless Barcode Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=avery+5163+shipping+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Avery 5163 Shipping Labels</span>
      </a>
    `;
  } else if (page.slug.includes('isbn')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=postal+shipping+scale&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 12v3"/><circle cx="12" cy="12" r="1"/></svg>
        <span>Postal Shipping Scale</span>
      </a>
      <a href="https://www.amazon.com/s?k=brother+monochrome+laser+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Brother Laser Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=bubble+mailer+envelopes+book&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Padded Book Mailers</span>
      </a>
      <a href="https://www.amazon.com/s?k=usb+handheld+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>USB Barcode Reader</span>
      </a>
    `;
  } else if (page.slug.includes('code-39')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=industrial+barcode+scanner+heavy+duty&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Industrial Laser Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=weatherproof+asset+tags+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <span>Weatherproof Asset Labels</span>
      </a>
      <a href="https://www.amazon.com/s?k=zebra+thermal+desktop+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Zebra Desktop Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Bluetooth Handheld Scanner</span>
      </a>
    `;
  } else if (page.slug.includes('bulk-barcode')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=munbyn+thermal+label+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>MUNBYN Commercial Thermal Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels+4x6&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Fanfold Thermal Labels (4\" × 6\")</span>
      </a>
      <a href="https://www.amazon.com/s?k=zebra+zd421+thermal+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Zebra ZD421 Industrial Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>High-Speed Desktop Scanner</span>
      </a>
    `;
  } else if (page.slug.includes('shopify')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=bluetooth+thermal+barcode+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Bluetooth Thermal Label Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=wireless+pos+barcode+scanner+ipad&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Shopify POS Wireless Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels+2.25x1.25&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>2.25\" × 1.25\" Price Tag Rolls</span>
      </a>
      <a href="https://www.amazon.com/s?k=acrylic+pos+countertop+sign+holder&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>Acrylic POS Display Stands</span>
      </a>
    `;
  } else if (isQrPage) {
    // QR pages: no affiliate block (owner decision 2026-11-16, supplies only where printing labels is the task).
    hardwareItemsHtml = '';
  } else {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=thermal+barcode+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Thermal Label Printers</span>
      </a>
      <a href="https://www.amazon.com/s?k=avery+5160+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M6 8h12M6 12h12M6 16h8"/></svg>
        <span>Avery 5160 Labels (30-Up)</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>2D Bluetooth Scanners</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Thermal Shipping Rolls</span>
      </a>
    `;
  }

  return `${headTopHtml(page, pageUrl)}
${PAGE_STYLES}

  <!-- Structured Data JSON-LD Schemas -->
  <script type="application/ld+json">
    ${JSON.stringify(webAppJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(faqJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(breadcrumbJsonLd, null, 2)}
  </script>
</head>
<body>

${siteHeaderHtml(page.queryParam)}

  <main class="seo-page-container">

    <!-- Hero Section -->
    <section class="hero-banner">
      <div class="hero-badge">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
        ${page.category}
      </div>
      <h1 class="hero-title">${page.h1}</h1>
      <p class="hero-lead">${page.lead}</p>${page.slug === 'ean-13-barcode-generator' ? '\n      ' + eanOnpageHtml() : ''}
      
      <a href="../index.html?${page.queryParam}" class="${page.slug === 'ean-13-barcode-generator' ? 'ean-full-studio' : 'cta-launch-btn'}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        ${page.slug === 'ean-13-barcode-generator' ? 'Launch studio for full customization' : `Open the ${page.shortName} generator`}
      </a>${hasEanWorkflow(page.slug) ? identifierNoticeHtml() : ''}
    </section>${page.slug === 'ean-13-barcode-generator' ? '\n' + eanPackagingHtml() : ''}

    <!-- Technical Specs & Use Cases Grid -->
    <section class="content-grid">
      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
          Specs at a glance
        </h2>
        <dl class="spec-table">
          ${specsListHtml}
        </dl>
      </div>

      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
          Where it gets used
        </h2>
        <ul class="use-cases-list">
          ${useCasesHtml}
        </ul>
      </div>
    </section>

    ${guide && page.slug !== 'ean-13-barcode-generator' ? `<!-- Practical guide: how to make it, print it, and what to avoid -->
    <section class="guide-card" aria-labelledby="guide-title">
      <h2 id="guide-title" class="guide-title">${guide.title || `How to make, print and test a ${page.shortName} code`}</h2>
      <div class="guide-grid">
        <div class="guide-block guide-steps">
          <h3>Step by step</h3>
          <ol>
            ${guide.howTo.map(step => `<li>${step}</li>`).join('\n            ')}
          </ol>
          <a href="../index.html?${page.queryParam}" class="guide-cta">Open the ${page.shortName} generator &rarr;</a>
        </div>
        <div class="guide-block">
          <h3>Printing &amp; size</h3>
          <ul>
            ${guide.print.map(tip => `<li>${tip}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="guide-block guide-mistakes">
          <h3>Common mistakes</h3>
          <ul>
            ${guide.mistakes.map(m => `<li>${m}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </section>
    ` : ''}
    ${hardwareItemsHtml ? `<!-- Printing supplies (Amazon Associates); barcode and label pages only -->
    <section class="hardware-box">
      <div class="hardware-box-header">
        <div class="hardware-box-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          Printers, labels and scanners
        </div>
        <div class="hardware-box-disclosure">
          UniversalCodeMaker is an Amazon Associate. As an Amazon Associate, we earn from qualifying purchases.
        </div>
      </div>
      <div class="hardware-pills-row">
        ${hardwareItemsHtml}
      </div>
    </section>
    ` : ''}

    <!-- Why Choose This Format / Key Benefits -->
    ${benefits.length > 0 ? `
    <section style="margin: 2.5rem 0 2rem;">
      <h2 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Why use ${page.shortName}
      </h2>
      <div class="benefits-grid">
        ${benefitsHtml}
      </div>
    </section>
    ` : ''}

    <!-- Customer Logistics & Product Decision Guide -->
    ${decisionGuide.length > 0 ? `
    <section class="decision-card">
      <div class="decision-header">
        <h2 style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          ${isQrPage ? `Is ${/^([AEIO]|SMS)/i.test(page.shortName) ? 'an' : 'a'} ${page.shortName} code the right fit?` : 'Which barcode do you need?'}
        </h2>
      </div>${isQrPage ? '' : `
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
        The right format depends on where the product is sold, what it is printed on, and which scanners will read it.
      </p>`}
      <div class="decision-grid">
        ${decisionGuideHtml}
      </div>
    </section>
    ` : ''}

    <!-- Legal Compliance, Registration Rules & Cautions -->
    ${legalCaution ? `
    <section class="caution-card ${page.category === 'Retail & POS' ? 'laser-alert' : ''}">
      <div class="caution-header">
        <span class="caution-badge ${page.category === 'Retail & POS' ? 'red' : ''}" style="display: inline-flex; align-items: center; gap: 0.4rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
          Rules to know
        </span>
        <h3>${legalCaution.title}</h3>
      </div>
      <ul class="caution-list">
        ${cautionPointsHtml}
      </ul>
    </section>
    ` : ''}

    <!-- Official Standards & Authoritative Documentation -->
    ${authorityLinks.length > 0 ? `
    <section class="authority-card">
      <div class="authority-header">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sensor-green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Sources
        </h3>
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">STANDARDS AND OFFICIAL HELP PAGES</span>
      </div>
      <div class="authority-links-grid">
        ${authorityLinksHtml}
      </div>
    </section>
    ` : ''}

    <!-- Interactive FAQ Section -->
    <section class="faq-section">
      <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Common questions
      </h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

    <!-- Related Tools Cross-Links -->
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Related tools
      </h2>
      <div class="related-grid">
        ${relatedPagesHtml}
      </div>
    </section>

  </main>

${SITE_FOOTER_HTML}
</body>
</html>`;
}

// Helper to avoid unnecessary file rewrites and line-ending churn on unchanged pages
function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing.replace(/\r\n/g, '\n') === content.replace(/\r\n/g, '\n')) {
      return false;
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// Generate pages
console.log('Generating Programmatic SEO pages...');
let generatedCount = 0;

SEO_PAGES.forEach(page => {
  const filePath = path.join(PAGES_DIR, `${page.slug}.html`);
  const html = generatePageHtml(page);
  if (writeIfChanged(filePath, html)) {
    generatedCount++;
    console.log(`Generated: pages/${page.slug}.html`);
  }
});

ARTICLES.forEach(article => {
  const filePath = path.join(PAGES_DIR, `${article.slug}.html`);
  if (writeIfChanged(filePath, generateArticleHtml(article))) {
    generatedCount++;
    console.log(`Generated: pages/${article.slug}.html (guide)`);
  }
});

// Generate sitemap.xml
console.log('Generating sitemap.xml...');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

// <lastmod> = the date the page's content really last changed: today if it has uncommitted
// content edits, otherwise the newest commit that changed its content. Changes that only bump
// a cache-busting ?v= don't count. Stamping every URL with today's date on each run teaches
// Google to ignore our lastmod values.
const SITE_ROOT = path.join(__dirname, '..');
const GIT_OPTS = { cwd: SITE_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 };

function isContentChange(diff) {
  const changed = (sign) => diff.split('\n')
    .filter(l => l.startsWith(sign) && !l.startsWith(sign.repeat(3)))
    .map(l => l.slice(1).replace(/\?v=[0-9.]+/g, '?v=').trim())
    .sort()
    .join('\n');
  return changed('-') !== changed('+');
}

function lastmodOf(relPath) {
  try {
    if (isContentChange(execSync(`git diff HEAD -- "${relPath}"`, GIT_OPTS))) return today;
    const isTracked = execSync(`git ls-files -- "${relPath}"`, GIT_OPTS).trim();
    if (!isTracked) return today;
    const commits = execSync(`git log --format="%H %cs" -- "${relPath}"`, GIT_OPTS).trim().split('\n').filter(Boolean);
    for (const line of commits) {
      const [hash, date] = line.split(' ');
      if (isContentChange(execSync(`git show --format= ${hash} -- "${relPath}"`, GIT_OPTS))) return date;
    }
    return today;
  } catch (e) {
    return today;
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmodOf('index.html')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/symbology-docs.html</loc>
    <lastmod>${lastmodOf('symbology-docs.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/barcode-scanner.html</loc>
    <lastmod>${lastmodOf('barcode-scanner.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about.html</loc>
    <lastmod>${lastmodOf('about.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact.html</loc>
    <lastmod>${lastmodOf('contact.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms.html</loc>
    <lastmod>${lastmodOf('terms.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy.html</loc>
    <lastmod>${lastmodOf('privacy-policy.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
${SEO_PAGES.map(p => `  <url>
    <loc>${SITE_URL}/pages/${p.slug}.html</loc>
    <lastmod>${lastmodOf(`pages/${p.slug}.html`)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${ARTICLES.map(a => `  <url>
    <loc>${SITE_URL}/pages/${a.slug}.html</loc>
    <lastmod>${lastmodOf(`pages/${a.slug}.html`)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;

if (writeIfChanged(sitemapPath, sitemapXml)) {
  console.log(`Saved sitemap.xml with ${(sitemapXml.match(/<loc>/g) || []).length} URLs.`);
} else {
  console.log(`sitemap.xml unchanged.`);
}

console.log(`All ${generatedCount} pages (landing pages + guides) generated successfully!`);
