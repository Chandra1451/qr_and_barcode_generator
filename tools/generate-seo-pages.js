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
    metaTitle: 'Free UPC-A Barcode Generator: SVG, EPS & PNG',
    metaDescription: 'Generate authentic 12-digit UPC-A barcodes for North American retail. Automatic Mod-10 check digit calculation, vector SVG, and high-DPI raster downloads.',
    h1: 'Free UPC-A Retail Barcode Generator',
    lead: 'Generate Universal Product Code (UPC-A) barcodes for US and Canadian retail products. Features automatic check digit calculation, crisp vector SVG, and 300+ DPI print export.',
    technicalSpec: {
      standard: 'ISO/IEC 15420 / GS1 US Standards',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '11 data digits + 1 Mod-10 check digit (total 12 digits)',
      size: 'Bar width (X-dimension) 0.264–0.660 mm, target 0.330 mm: 1.468" wide incl. quiet zones, bars 0.900" high',
      quietZones: 'Left and Right: 9X module width minimum'
    },
    useCases: [
      'United States and Canada retail store checkout',
      'Amazon North America FBA product labeling',
      'Wholesale packaging and consumer goods',
      'Inventory tracking in big-box retail (Walmart, Target)'
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
        a: 'UPC-A is a 12-digit standard primarily used in the USA and Canada, while EAN-13 is a 13-digit standard used across the rest of the world. In fact, a UPC-A code is simply an EAN-13 code with a leading zero. Read our detailed technical breakdown: <a href="./upc-vs-ean-13-barcode.html">UPC vs EAN-13: Which Barcode Do You Need?</a>.'
      },
      {
        q: 'Does this generator check my UPC-A check digit?',
        a: 'Yes. Enter either 11 digits to have the check digit automatically appended, or enter all 12 digits to have the check digit mathematically verified against GS1 Mod-10 specifications.'
      },
      {
        q: 'Can I print UPC-A barcodes on Avery sticky labels?',
        a: 'Yes. Open the generator, click "Print Avery PDF Label Sheet", and choose Avery 5160 (30 address labels) or Avery 5163 (10 shipping labels). For a title or price next to the barcode, use the label maker instead.'
      }
    ]
  },
  {
    slug: 'code-128-barcode-generator',
    name: 'Code 128 Barcode Generator',
    shortName: 'Code 128',
    queryParam: 'symbology=code-128',
    category: 'Logistics & Shipping',
    metaTitle: 'Free Code 128 Barcode Generator: SVG, EPS & PNG',
    metaDescription: 'Generate high-density Code 128 barcodes online. Supports full ASCII 128 character set, automatic subset switching (A/B/C), vector SVG, and 300 DPI PNG.',
    h1: 'Free Code 128 Logistics Barcode Generator',
    lead: 'Create compact, high-density Code 128 barcodes supporting the complete 128 ASCII character set with automatic subset optimization for warehouse, logistics, and asset tracking.',
    technicalSpec: {
      standard: 'ISO/IEC 15417',
      characterSet: 'Full ASCII 128 (Letters, numbers, punctuation, control chars)',
      subsets: 'Code 128A (Caps/Control), Code 128B (ASCII), Code 128C (Double-density numeric pairs)',
      checksum: 'Modulo 103 check character (calculated automatically)',
      quietZones: '10X minimum on both ends'
    },
    useCases: [
      'Warehouse bin and pallet rack labeling',
      'Shipping container and carton tracking (UCC/EAN-128)',
      'Enterprise asset tags and equipment serial numbers',
      'Medical laboratory specimen tube labeling'
    ],
    faqs: [
      {
        q: 'What characters can I encode into a Code 128 barcode?',
        a: 'Code 128 can encode all 128 standard ASCII characters, including uppercase letters, lowercase letters, numbers, punctuation symbols, and control codes.'
      },
      {
        q: 'Does your engine use Code 128 subset C for numeric data?',
        a: 'Yes. Our engine uses automatic optimization to switch into Code 128C whenever strings of digits appear, compressing two numeric digits into a single barcode character for maximum compactness.'
      }
    ]
  },
  {
    slug: 'itf-14-barcode-generator',
    name: 'ITF-14 Barcode Generator',
    shortName: 'ITF-14',
    queryParam: 'symbology=itf-14',
    category: 'Logistics & Shipping',
    metaTitle: 'Free ITF-14 Barcode Generator for Shipping Cartons',
    metaDescription: 'Create ITF-14 shipping carton barcodes with protective bearer bars. Automatic GS1 check digit, vector SVG, and high-DPI export.',
    h1: 'Free ITF-14 Shipping Carton Barcode Generator',
    lead: 'Generate GS1-standard ITF-14 (Interleaved 2 of 5) barcodes with thick protective bearer bars engineered specifically for direct printing onto corrugated cardboard shipping master cases.',
    technicalSpec: {
      standard: 'ISO/IEC 16390 / GS1 General Specifications',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '13 data digits + 1 Mod-10 check digit (14 digits total)',
      bearerBars: 'Top and bottom bars or full surrounding frame (typically 4.8mm thick)',
      aspectRatio: 'Wide linear ratio (typically 3:1 to 4:1)'
    },
    useCases: [
      'Corrugated cardboard outer shipping cartons and master cases',
      'Wholesale pallet distribution and receiving scanning',
      'Cross-docking logistics tracking in automated distribution centers'
    ],
    faqs: [
      {
        q: 'Why does an ITF-14 barcode have thick bearer bars?',
        a: 'Bearer bars equalize printing plate pressure when printing directly onto rough, undulating corrugated cardboard, and prevent barcode laser scanners from misreading a partial slice of the code.'
      },
      {
        q: 'Can an ITF-14 barcode be scanned at retail cash registers?',
        a: 'No. ITF-14 barcodes are strictly meant for master cases and wholesale shipping cartons, not consumer-facing retail checkouts.'
      }
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
    metaDescription: 'Generate ISO/IEC 16022 Data Matrix ECC 200 2D barcodes for parts marking, GS1 serialization and electronics. Free vector SVG and PNG export with zero sign-up.',
    h1: 'Free Data Matrix (ECC 200) 2D Barcode Generator',
    lead: 'Create compact, high-capacity Data Matrix 2D square matrix barcodes engineered for electronic component marking, healthcare pharmaceutical packaging, and aerospace direct part marking (DPM).',
    technicalSpec: {
      standard: 'ISO/IEC 16022 (ECC 200 standard with Reed-Solomon error correction)',
      characterSet: 'Full ASCII, binary, and GS1 Application Identifiers',
      capacity: 'Up to 3,116 numeric digits or 2,335 alphanumeric characters',
      finderPattern: 'Solid "L" shaped finder pattern on bottom and left borders',
      aspectRatio: 'Square (rectangular sizes are also part of the standard)'
    },
    useCases: [
      'Direct Part Marking (DPM) on aerospace, automotive, and defense hardware (MIL-STD-130)',
      'FDA Unique Device Identification (UDI) for surgical instruments and medical devices',
      'Pharmaceutical serialization under US DSCSA and EU Falsified Medicines Directive (FMD)',
      'Printed circuit board (PCB) micro-labeling and electronic component traceability'
    ],
    faqs: [
      {
        q: 'What is the finder pattern on a Data Matrix code?',
        a: 'A Data Matrix code features an "L" shaped solid line on two adjacent sides, which cameras use to determine the orientation and module size of the symbol.'
      },
      {
        q: 'Can Data Matrix codes be read if partially scratched or damaged?',
        a: 'Yes! The ECC 200 specification utilizes Reed-Solomon error correction algorithms capable of recovering up to 30% of obscured or scratched modules.'
      },
      {
        q: 'Why is ECC 200 the only Data Matrix version used in modern manufacturing?',
        a: 'Legacy Data Matrix versions (ECC 000 through 140) used older convolution error correction. The ISO/IEC 16022 standard established ECC 200 using advanced Reed-Solomon error correction and an even number of rows and columns. Today, all industrial scanners, automotive specs, and GS1 standards exclusively mandate ECC 200.'
      },
      {
        q: 'What is the difference between Data Matrix and QR Code?',
        a: 'While both are 2D matrix symbologies, Data Matrix can encode high-density alphanumeric data in a footprint up to 30 times smaller than a standard barcode and requires smaller quiet zones (1 module vs 4 modules for QR codes). This makes Data Matrix the global standard for micro-electronics, surgical tools, and direct part marking, whereas QR codes are favored for consumer-facing smartphone scanning.'
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
    metaTitle: 'Free Aztec Code Generator: 2D Barcode, SVG & PNG',
    metaDescription: 'Make Aztec 2D codes online, the format used on mobile boarding passes and rail tickets. Download vector SVG or PNG, free and without sign-up.',
    h1: 'Free Aztec Code 2D Barcode Generator',
    lead: 'Generate square Aztec 2D barcodes featuring a distinctive central bullseye target finder pattern. Standard format for airline mobile boarding passes and European railway ticketing.',
    technicalSpec: {
      standard: 'ISO/IEC 24778',
      finderPattern: 'Central concentric square bullseye target pattern',
      quietZone: 'The standard permits a 0-module quiet zone; leave practical separation where possible and test the final layout',
      capacity: 'Up to 3,832 numeric digits or 3,067 alphanumeric characters'
    },
    useCases: [
      'Airline IATA mobile boarding passes on smartphones',
      'European rail and transit e-tickets (Eurostar, Deutsche Bahn, SNCF)',
      'Vehicle registration documents and tax discs',
      'Hospital patient wristband tracking'
    ],
    faqs: [
      {
        q: 'Why do transit authorities prefer Aztec codes over QR codes?',
        a: 'The Aztec standard permits a zero-module quiet zone, which can help in tight layouts. Leave practical separation where possible and test the final printed or on-screen symbol with the scanners you expect to use.'
      }
    ]
  },
  {
    slug: 'pdf417-barcode-generator',
    name: 'PDF417 Barcode Generator',
    shortName: 'PDF417',
    queryParam: 'symbology=pdf417',
    category: '2D Stacked',
    metaTitle: 'Free PDF417 Barcode Generator: ID Badges, Cards & SVG',
    metaDescription: 'Create ISO/IEC 15438 PDF417 stacked 2D barcodes for ID badges, shipping papers and documents. Free client-side vector SVG and PNG download with zero sign-up.',
    h1: 'Free PDF417 Stacked 2D Barcode Generator',
    lead: 'Create PDF417 stacked 2D barcodes for multi-line text, inventory records, document references, and other structured data. The studio encodes exactly the text you enter; it does not build industry-specific data formats.',
    technicalSpec: {
      standard: 'ISO/IEC 15438',
      structure: 'Stacked linear rows (each codeword contains 4 bars and 4 spaces across 17 modules)',
      aspectRatio: 'Rectangular format (standard ~2.5:1 ratio)',
      capacity: 'Over 1.1 kilobytes of machine-readable data per symbol'
    },
    useCases: [
      'Personnel identification badges, access cards, and visitor passes',
      'Commercial transport & airline boarding passes (BCBP standard)',
      'USPS parcel shipping papers and logistics records',
      'Multi-line technical text and high-density document archiving'
    ],
    faqs: [
      {
        q: 'What does PDF417 stand for?',
        a: 'PDF stands for "Portable Data File". The "417" signifies that each pattern is 17 modules wide and consists of 4 bars and 4 spaces.'
      },
      {
        q: 'Can I generate employee ID cards and personnel badges with PDF417?',
        a: 'Yes. PDF417 is widely used for employee identification cards, facility access badges, and event credentials because its high data density allows encoding names, employee numbers, and security hashes directly within the symbol without requiring an active database lookup at the scanner.'
      },
      {
        q: 'What error correction level should I choose for PDF417?',
        a: 'PDF417 supports error correction levels 0 through 8 using Reed-Solomon algorithms. For standard identification cards, shipping labels, and documents, level 4 or 5 provides robust protection against surface scratches, print distortion, and ink smudges.'
      },
      {
        q: 'Can I export PDF417 as vector SVG for high-resolution printing?',
        a: 'Yes! UniversalCodeMaker produces crisp mathematical vector SVG exports that scale infinitely without pixelation, making them ideal for high-DPI badge printers, offset commercial printing, and technical documentation.'
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
    metaDescription: 'Generate free Wi-Fi QR codes to connect guests instantly without typing passwords. Supports WPA3, WPA2, WEP & hidden SSIDs. 100% private in-browser generation.',
    h1: 'Free Wi-Fi Auto-Connect QR Code Generator',
    lead: 'Create custom branded Wi-Fi QR codes that allow customers, hotel guests, and friends to instantly join your wireless network simply by scanning with their smartphone camera.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      protocol: 'ZXing Wi-Fi URI Scheme (WIFI:T:{Auth};S:{SSID};P:{Password};H:{Hidden};;)',
      encryption: 'WPA/WPA2/WPA3 (Personal), WEP, or Open (nopass)',
      hiddenSsid: 'H:true parameter for unbroadcast / closed network SSIDs',
      compatibility: 'Native iOS Camera (iOS 11+), Android Camera & Quick Settings, iPadOS',
      security: '100% client-side execution; network SSIDs and passwords never leave your device'
    },
    useCases: [
      'Cafe, coffee shop, and restaurant dining table acrylic stands',
      'Hotel guest rooms, Airbnb welcome binders, and vacation rental desks',
      'Office conference rooms, co-working spaces, and visitor reception lobbies',
      'Event venues, trade show booths, and tech conference registration desks',
      'Home living rooms and guest bedroom auto-connect wall cards'
    ],
    faqs: [
      {
        q: 'Do guests need a special app to scan and connect to Wi-Fi?',
        a: 'No. Both modern iPhones (iOS 11 and later) and Android smartphones (Android 10 and later) natively recognize Wi-Fi QR codes directly inside their default Camera apps. Pointing the camera at the QR code displays a one-tap "Join Network" notification that automatically negotiates credentials and connects the device without opening settings.'
      },
      {
        q: 'Is my Wi-Fi network name or password ever transmitted to a server?',
        a: 'Never. UniversalCodeMaker executes 100% client-side in your web browser using pure JavaScript and WebAssembly. Your network SSID, security encryption type, and Wi-Fi password are never uploaded, logged, or transmitted across the network. Disconnecting your internet connection before generating will verify complete local execution.'
      },
      {
        q: 'Can I generate a Wi-Fi QR code for an open network without a password?',
        a: 'Yes. If you operate an open public network or guest portal without pre-shared encryption keys, select "Open (No Password)" in the generator. It formats the standard payload as WIFI:T:nopass;S:YourNetwork;;;, allowing visitors to authenticate and join your broadcast network with a single camera tap.'
      },
      {
        q: 'How do I create a QR code for a hidden Wi-Fi network?',
        a: 'For networks that do not broadcast their SSID, check the "Hidden Network" option in the Wi-Fi wizard. The generator appends the H:true; flag to the standardized string (WIFI:T:WPA;S:SecretNet;P:SecretPass;H:true;;). Mobile operating systems will recognize the hidden flag and probe for the hidden beacon during the handshake.'
      },
      {
        q: 'What happens if I change my Wi-Fi router password later?',
        a: 'Wi-Fi QR codes are static codes that store the SSID and password directly in the optical matrix. They do not rely on external redirect servers or account subscriptions. If you change your router\'s Wi-Fi password, prior printed codes will no longer connect devices; you simply generate and print an updated QR code with the new password.'
      },
      {
        q: 'What size should I print Wi-Fi QR codes for tables and counters?',
        a: 'For restaurant table tents, cafe counter stands, and hotel bedside cards scanned from 8–12 inches away, print the QR code at least 1.5 × 1.5 inches (38 × 38 mm). For wall-mounted plaques or conference room displays scanned from 2–3 feet away, print at least 3 × 3 inches (75 × 75 mm). Always download vector SVG for crisp printing at any resolution.'
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
    metaTitle: 'Free vCard QR Code Generator: Digital Business Card',
    metaDescription: 'Create digital business card vCard QR codes. Encodes name, phone, email, company, job title, and website directly into smartphone contacts with zero typing.',
    h1: 'Free vCard Digital Business Card QR Code Generator',
    lead: 'Generate contactless digital business card QR codes conforming to the universal vCard standard. When scanned, smartphones immediately prompt the user to save your contact card.',
    technicalSpec: {
      standard: 'vCard 3.0 (IETF RFC 2426)',
      fields: 'Full Name, Phone, Email, Company, Job Title, Website URL',
      compatibility: 'Apple Contacts, Google Contacts, Microsoft Outlook'
    },
    useCases: [
      'Paper business cards and trade show conference badges',
      'Email signature image badges and LinkedIn profile banners',
      'Real estate agent yard signs and sales brochures',
      'Speaker slides and presentation closing decks'
    ],
    faqs: [
      {
        q: 'What happens when someone scans a vCard QR code?',
        a: 'Their phone automatically launches the Contacts app with all your details pre-filled and a single "Save Contact" button.'
      }
    ]
  },
  {
    slug: 'crypto-qr-code-generator',
    name: 'Crypto QR Code Generator',
    shortName: 'Crypto QR',
    queryParam: 'wizard=crypto',
    category: 'Smart QR',
    metaTitle: 'Free Crypto QR Code Generator: Bitcoin, Ethereum, Solana',
    metaDescription: 'Make a payment QR code for a Bitcoin, Ethereum or Solana address, with an optional amount and a Bitcoin logo. Made in your browser, no tracking.',
    h1: 'Free Crypto Payment & Wallet QR Code Generator',
    lead: 'Generate clean, scannable cryptocurrency wallet QR codes for Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) with optional payment request amounts.',
    technicalSpec: {
      supportedChains: 'Bitcoin (BIP-21), Ethereum (EIP-681), Solana',
      uriSchemes: 'bitcoin:, ethereum:, solana:',
      styling: 'Add built-in Bitcoin or Ethereum brand center logos'
    },
    useCases: [
      'Merchant point-of-sale cryptocurrency checkout',
      'Content creator tip jars on YouTube, Twitch, and blogs',
      'Invoicing freelance clients in digital currency',
      'Non-profit cryptocurrency donation banners'
    ],
    faqs: [
      {
        q: 'Are these QR codes compatible with mobile crypto wallets?',
        a: 'Yes. The generated codes use official cryptocurrency URI standards (such as BIP-21 for Bitcoin) recognized by Coinbase, Trust Wallet, MetaMask, Phantom, and Ledger.'
      }
    ]
  },
  {
    slug: 'email-qr-code-generator',
    name: 'Email QR Code Generator',
    shortName: 'Email QR',
    queryParam: 'wizard=email',
    category: 'Smart QR',
    metaTitle: 'Free Email QR Code Generator (mailto)',
    metaDescription: 'Generate mailto QR codes with a recipient, subject line and body text. Free to use, with vector SVG and high-resolution PNG export.',
    h1: 'Free Pre-Filled Email (mailto) QR Code Generator',
    lead: 'Create interactive email QR codes that automatically open the user’s default mail app (Apple Mail, Gmail, Outlook) with your recipient email, subject line, and body message pre-populated.',
    technicalSpec: {
      protocol: 'mailto: URI scheme (RFC 6068)',
      parameters: 'subject, body, cc, bcc',
      encoding: 'Standard URL percentage-encoding for special characters'
    },
    useCases: [
      'Customer support feedback signs and product warranty cards',
      'RSVP registration for private events and conferences',
      'Lead capture on flyers, posters, and billboard ads'
    ],
    faqs: [
      {
        q: 'What happens when someone scans an email QR code?',
        a: 'Their smartphone opens their primary email app with the To:, Subject:, and Body: fields already filled in, ready to send with one tap.'
      }
    ]
  },
  {
    slug: 'sms-qr-code-generator',
    name: 'SMS Text QR Code Generator',
    shortName: 'SMS QR',
    queryParam: 'wizard=sms',
    category: 'Smart QR',
    metaTitle: 'Free SMS Text Message QR Code Generator - Scan to Send SMS',
    metaDescription: 'Generate a static SMS QR code with a recipient and pre-written message. The payload is created in your browser for free PNG or SVG export.',
    h1: 'Free SMS Text Message QR Code Generator',
    lead: 'Create scan-to-text QR codes that immediately launch the native SMS/Messaging application with a pre-written text message ready to send to your target phone number.',
    technicalSpec: {
      protocol: 'smsto: and sms: URI schemes (RFC 5724)',
      parameters: 'Recipient phone number, message text',
      compatibility: 'Universal iOS Messages and Android Messages support'
    },
    useCases: [
      'Keyword opt-in SMS marketing campaigns (e.g. "Send VIP to 555-1234")',
      'Emergency roadside assistance or maintenance dispatch',
      'Text-to-win contests and promotional sweepstakes'
    ],
    faqs: [
      {
        q: 'Does the user get charged automatically when scanning?',
        a: 'No. The user still has to tap "Send" in their messaging app. It simply pre-fills the message and phone number.'
      }
    ]
  },
  {
    slug: 'phone-call-qr-code-generator',
    name: 'Phone Call QR Code Generator',
    shortName: 'Phone QR',
    queryParam: 'wizard=phone',
    category: 'Smart QR',
    metaTitle: 'Free Click-to-Call Phone QR Code Generator - One-Tap Dialing',
    metaDescription: 'Generate click-to-dial telephone QR codes. Customers tap once to call your business without dialing or saving numbers manually.',
    h1: 'Free Click-to-Call Phone QR Code Generator',
    lead: 'Create direct telephone dialing QR codes using the RFC 3966 `tel:` URI standard. Scanning automatically prompts the phone dialer to call your customer service or sales line.',
    technicalSpec: {
      protocol: 'tel: URI scheme (RFC 3966)',
      format: 'International E.164 format (+1234567890)',
      compatibility: 'All cellular smartphones and VoIP dialers'
    },
    useCases: [
      'Restaurant takeout ordering signs and menu boards',
      'Real estate yard signs and contractor vehicle decals',
      'Emergency hotlines and 24/7 technical support numbers'
    ],
    faqs: [
      {
        q: 'Should I include the country code in the phone number?',
        a: 'Yes, always format phone numbers with a leading "+" and country code (e.g., +1 for USA/Canada, +44 for UK) to ensure international callers dial successfully.'
      }
    ]
  },
  {
    slug: 'calendar-event-qr-code-generator',
    name: 'Calendar Event QR Code Generator',
    shortName: 'Event QR',
    queryParam: 'wizard=event',
    category: 'Smart QR',
    metaTitle: 'Free Calendar Event QR Code Generator (iCal)',
    metaDescription: 'Create iCal calendar event QR codes with event title, start/end dates, location, and description. Instant add to Google Calendar and Apple Calendar.',
    h1: 'Free iCal Calendar Event QR Code Generator',
    lead: 'Generate universal vEvent / iCalendar QR codes. When scanned, smartphones prompt users to add your webinar, concert, party, or conference directly to their personal calendar.',
    technicalSpec: {
      standard: 'iCalendar VEVENT Specification (RFC 5545)',
      fields: 'SUMMARY, LOCATION, DESCRIPTION, DTSTART, DTEND',
      timestamps: 'ISO 8601 formatted UTC/Local timestamps'
    },
    useCases: [
      'Concert, theater, and sports match tickets',
      'Wedding invitations and birthday party save-the-dates',
      'Corporate webinars, seminars, and product launch invitations'
    ],
    faqs: [
      {
        q: 'Does it work with both Apple Calendar and Google Calendar?',
        a: 'Yes! All modern smartphones natively recognize VEVENT data blocks and open the user’s default calendar application.'
      }
    ]
  },
  {
    slug: 'google-maps-location-qr-code-generator',
    name: 'Google Maps Location QR Code Generator',
    shortName: 'Maps QR',
    queryParam: 'wizard=location',
    category: 'Smart QR',
    metaTitle: 'Free Google Maps Location QR Code Generator (GPS & Address)',
    metaDescription: 'Generate free Google Maps QR codes from addresses, place names, or GPS coordinates. Opens instant turn-by-turn directions in Google Maps on iOS & Android.',
    h1: 'Free Google Maps Location QR Code Generator',
    lead: 'Create a static QR code that opens your storefront, event venue, or meeting point in Google Maps. Type an address or place name, or enter exact GPS coordinates for locations without a street address. Recipient devices open Google Maps instantly for turn-by-turn navigation.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      uriFormat: 'https://www.google.com/maps/search/?api=1&query={Address or Lat,Lng}',
      directGpsUri: 'geo:{Latitude},{Longitude}?q={Latitude},{Longitude} (RFC 5870)',
      plusCodeFormat: 'https://www.google.com/maps/dir/?api=1&destination={PlusCode}',
      compatibility: 'Google Maps app on Android & iOS, Apple Maps fallback, or any web browser',
      privacy: '100% in-browser generation; location coordinates and place names are never uploaded or stored'
    },
    useCases: [
      'Retail storefront window decals, business cards, and promotional flyers',
      'Wedding invitations, party RSVP cards, and event venue directional signs',
      'Real estate open house lawn signs and property brochure map links',
      'Hotel front-desk check-in cards, tourist guides, and city landmark markers',
      'Parking lot entrances, warehouse loading docks, and remote GPS hiking trailheads'
    ],
    faqs: [
      {
        q: 'Can I use latitude and longitude GPS coordinates instead of a street address?',
        a: 'Yes. If your destination lacks a standard postal street address—such as a rural wedding venue, festival campsite, park entrance, or warehouse loading dock—you can enter decimal latitude and longitude coordinates (e.g., 37.7749, -122.4194). When scanned, the QR code drops a precise Google Maps pin directly onto those exact geographic coordinates.'
      },
      {
        q: 'Does this QR code open turn-by-turn navigation or just a map pin?',
        a: 'When scanned with a smartphone camera, the standard Google Maps link (https://www.google.com/maps/search/?api=1&query=...) opens the Google Maps native app on Android and iOS (or web browser if the app is absent). The recipient sees the exact pinned location and can immediately tap "Directions" or "Start" to launch instant turn-by-turn voice navigation from their current GPS position.'
      },
      {
        q: 'How do I find the decimal GPS coordinates of a location in Google Maps?',
        a: 'On a desktop browser, open Google Maps, right-click any point on the map, and click the top coordinate numbers (e.g., 40.7128, -74.0060) to automatically copy them to your clipboard. On mobile, touch and hold any point on the map until a red pin drops, then look at the search bar at the top to copy the decimal latitude and longitude numbers.'
      },
      {
        q: 'Will this Google Maps QR code ever expire or stop working?',
        a: 'No. The generated QR code is a static QR code that encodes the destination URL or geographic coordinates directly into the black-and-white module matrix. UniversalCodeMaker does not use intermediate tracking redirects, account logins, or recurring subscription fees. As long as Google Maps services the encoded URL or coordinates, your printed QR code remains functional indefinitely.'
      },
      {
        q: 'Can I use a Google Plus Code (digital location code) in the generator?',
        a: 'Yes. Google Plus Codes (Open Location Codes, such as 7FG8+H2 Paris, France) represent street-less locations globally. You can enter a full Plus Code along with its locality into the address field. Google Maps resolves Plus Codes directly to drop the pin at the designated parcel or entrance.'
      },
      {
        q: 'What size should I print a Google Maps QR code on invitations or signs?',
        a: 'For handheld printed materials like wedding invitations, RSVP cards, or business flyers scanned from 8–12 inches away, print the QR code at least 0.8 × 0.8 inches (20 × 20 mm). For roadside signs, shop windows, or real estate lawn signs scanned from 3–5 feet away, scale the QR code to at least 4 × 4 inches (100 × 100 mm). Export in vector SVG format to ensure razor-sharp edges at any print scale.'
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
    metaTitle: 'Free Plain Text QR Code Generator',
    metaDescription: 'Generate unformatted plain text QR codes for notes, secrets, serial codes, and quotes. Supports up to 4,296 alphanumeric characters.',
    h1: 'Free Plain Text Multi-Line QR Code Generator',
    lead: 'Encode raw, unformatted text messages, alphanumeric serials, cryptographic keys, or quotes into a high-capacity QR code with up to 4,296 characters.',
    technicalSpec: {
      characterCapacity: 'Up to 7,089 numeric, 4,296 alphanumeric, or 2,953 byte characters',
      errorCorrection: 'Level L (7%), M (15%), Q (25%), H (30%)',
      encoding: 'UTF-8 multi-byte character support'
    },
    useCases: [
      'Cryptographic recovery phrases and secure offline backups',
      'Asset serial numbers and production line batch tokens',
      'Scavenger hunt clues and educational classroom quizzes'
    ],
    faqs: [
      {
        q: 'What is the maximum amount of text I can encode?',
        a: 'A Version 40 QR code can store up to 4,296 alphanumeric characters or 7,089 numbers. For optimal scan speed, keep text under 300 characters.'
      }
    ]
  },
  {
    slug: 'amazon-fba-fnsku-barcode-generator',
    name: 'Amazon FBA / FNSKU Barcode Generator',
    shortName: 'Amazon FBA / FNSKU',
    queryParam: 'symbology=code-128&preset=amazon-fnsku-5160&label=1',
    category: 'Retail & POS',
    metaTitle: 'Free Amazon FBA FNSKU Label Generator (Avery 5160)',
    metaDescription: 'Make Amazon FBA FNSKU labels (Code 128) free on Avery 5160 sheets or thermal rolls, with product name, condition and the white space Amazon requires.',
    h1: 'Free Amazon FBA FNSKU Barcode & Label Generator',
    lead: 'Make FNSKU item labels for Fulfillment by Amazon: a Code 128 barcode with its FNSKU, your product name and the condition, laid out with the white space Amazon asks for, on Avery 5160 sheets or thermal rolls.',
    technicalSpec: {
      standard: 'Code 128 carrying your FNSKU (Amazon barcodes start with an X)',
      payloadFormat: 'The FNSKU shown for the product in Seller Central',
      labelDimensions: '1" × 2⅝" (Avery 5160, 30 per US Letter sheet, or a thermal roll of that size). Amazon accepts 1" × 2" to 2" × 3".',
      labelContents: 'FNSKU barcode and its text, product name, condition (e.g. "New")',
      whiteSpace: '0.25" (6.35 mm) on the sides and 0.125" (3.18 mm) at the top and bottom, as Amazon requires; built into our Amazon layout',
      printer: 'Thermal or laser, 300 dpi or more. Amazon says not to use inkjet printers.'
    },
    useCases: [
      'Labelling units for Fulfillment by Amazon (FBA) shipments',
      'Avery 5160 / 30-up sheets on a laser printer (Amazon says not inkjet)',
      'Thermal label printers (MUNBYN, Rollo, Zebra) for one label at a time',
      'US resellers: an FNSKU label on every unit since 31 March 2026, covering the manufacturer barcode'
    ],
    faqs: [
      {
        q: 'What barcode does Amazon use for FNSKU labels?',
        a: 'Code 128, carrying just the FNSKU with no extra digits. Our generator encodes exactly the FNSKU you enter, and the text printed under the bars is always that same value. Print at 100% scale and test-scan one label before labelling your stock.'
      },
      {
        q: 'What has to be on an Amazon FBA item label?',
        a: 'Amazon lists the barcode with the FNSKU (or ASIN), the product name and the item condition, with white space of 0.25 inch on the sides and 0.125 inch at the top and bottom. Our Amazon layout prints all of these inside those margins.'
      },
      {
        q: 'Can I print FNSKU labels on Avery 5160 sheets?',
        a: 'Yes, on a laser printer. Amazon supports 30-up 1" × 2⅝" US Letter sheets (the Avery 5160 size) and says not to use inkjet printers, because inkjet labels smear more easily. Thermal printers work too. Set printer scaling to 100% or "Actual size".'
      },
      {
        q: 'Do I still need FNSKU labels after the 2026 changes?',
        a: 'In the US, since 31 March 2026, resellers (including authorised resellers) must put an Amazon barcode on every unit, even if it has a UPC. Brand owners with the Brand Representative role in Amazon Brand Registry can use the manufacturer barcode instead. Products with no manufacturer barcode always need an Amazon barcode. On Amazon.in, units are labelled with FNSKUs by default. Check Seller Central for your marketplace.'
      },
      {
        q: 'Will Amazon put the labels on for me?',
        a: 'Not in the US: Amazon ended its prep and item-labelling service on 1 January 2026, so sellers apply their own labels. Units that arrive without a required label are marked as defective. Amazon India\'s help still describes an FBA Label Service.'
      }
    ]
  },
  {
    slug: 'google-reviews-qr-code-generator',
    name: 'Google Reviews QR Code Generator',
    shortName: 'Google Review QR',
    queryParam: 'symbology=qr-code&wizard=google_review',
    category: 'Smart QR',
    metaTitle: 'Free Google Review QR Code Generator',
    metaDescription: 'Make a QR code that opens your business\'s Google review form. Paste your review link or Place ID, then download SVG or PNG for print. Free, no scan limits.',
    h1: 'Free Google Reviews QR Code Generator',
    lead: 'Turn in-person customers into verified 5-star Google reviews effortlessly. Generate custom QR codes that launch directly into your Google Business review box with one quick scan.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      destinationType: 'Direct review dialog URL (https://search.google.com/local/writereview?placeid={ID} or g.page shortlink)',
      supportedInputs: 'Google Review Share Link, Google Maps Profile URL, or Google Place ID',
      errorCorrection: 'Level M (15% redundancy) or Level Q (25% redundancy with custom center icon)',
      exportFormats: 'SVG Vector (lossless packaging), 300 DPI PNG, PDF Countertop Stand Sign'
    },
    useCases: [
      'Restaurant table tents, bill presenters, and payment receipt footers',
      'Retail counter checkout displays, window decals, and exit doors',
      'Field service invoices, technician business cards, and leave-behind cards',
      'Product packaging inserts, delivery boxes, and customer thank-you notes'
    ],
    faqs: [
      {
        q: 'How does a Google Review QR code take customers directly to the review form?',
        a: 'By linking to Google\'s specialized review URL or compiling your Google Place ID into "https://search.google.com/local/writereview?placeid=...", smartphones immediately open the Google Maps app or browser directly into the 5-star rating and comment submission dialog.'
      },
      {
        q: 'How do I find my business Google Review link or Place ID?',
        a: 'Open Google Search, search for your business name (while logged into your Google Business Profile account), click "Ask for reviews", and copy the review link. Alternatively, paste your Google Maps business link into our wizard and we format it automatically.'
      },
      {
        q: 'Will this QR code ever expire or require a monthly payment?',
        a: 'UniversalCodeMaker stores the review URL directly in a static QR code and does not control a redirect or expiry for it. The destination remains subject to Google, the business profile and the encoded URL, so test it before printing.'
      }
    ]
  },
  {
    slug: 'whatsapp-qr-code-generator',
    name: 'WhatsApp QR Code Generator',
    shortName: 'WhatsApp QR',
    queryParam: 'symbology=qr-code&wizard=whatsapp',
    category: 'Smart QR',
    metaTitle: 'Free WhatsApp QR Code Generator (wa.me Link)',
    metaDescription: 'Make a WhatsApp QR code that opens a chat with your number and an optional pre-filled message (wa.me link). SVG or PNG for print, free, no sign-up.',
    h1: 'Free WhatsApp Direct Chat QR Code Generator',
    lead: 'Allow customers, clients, and guests to initiate a WhatsApp conversation with your business in one scan. Supports international numbers and pre-filled introductory messages.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      protocol: 'Official WhatsApp Web & App Intent (https://wa.me/{phone}?text={message})',
      phoneFormat: 'E.164 International Format (Country Code + Phone Number, digits only)',
      messageEncoding: 'RFC 3986 URI component encoding with automated line break normalization',
      errorCorrection: 'Level M (15% recovery) or Level H (30% recovery with custom WhatsApp logo)'
    },
    useCases: [
      'Customer support kiosks and service desks for instant messaging',
      'Restaurant and café table menus for WhatsApp order placement',
      'Real estate "For Sale" yard signs and flyers for quick agent inquiries',
      'Ecommerce delivery packaging inserts for direct customer care'
    ],
    faqs: [
      {
        q: 'How does a customer start a WhatsApp chat from scanning a QR code?',
        a: 'When a smartphone camera scans the QR code, it detects the wa.me protocol and prompts the user to open WhatsApp directly with your number in the chat window, ready to send your pre-filled inquiry.'
      },
      {
        q: 'Do customers need to save my phone number in their contacts first?',
        a: 'No. The wa.me intent opens a conversation immediately without requiring the user to add your contact details to their address book first.'
      },
      {
        q: 'Can I include a pre-filled greeting or order template?',
        a: 'Yes. Enter your custom text (e.g. "Hi, I would like to inquire about...") in our wizard and it will be pre-populated in the user\'s chat input box when they scan.'
      }
    ]
  },
  {
    slug: 'upi-qr-code-generator',
    name: 'UPI QR Code Generator',
    shortName: 'UPI Payment QR',
    queryParam: 'symbology=qr-code&wizard=upi',
    category: 'Smart QR',
    metaTitle: 'Free UPI QR Code Generator: PhonePe, GPay, Paytm & Amount',
    metaDescription: 'Generate free UPI payment QR codes for Google Pay, PhonePe, and Paytm. Support custom VPA, fixed amount, merchant name, and zero fees in vector SVG.',
    h1: 'Free UPI Scan-to-Pay QR Code Generator',
    lead: 'Create UPI scan-to-pay QR codes for merchant stores, freelancers, and invoices. Receiving-app support can vary, so verify the VPA and test the code in the apps your customers use.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      protocol: 'NPCI UPI Deep Link Specification (upi://pay?pa={VPA}&pn={Name}&am={Amount}&cu=INR)',
      parameters: 'pa (UPI ID / VPA), pn (Merchant Name), am (Preset Amount), cu (Currency INR), tn (Note)',
      compatibility: 'Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay & 300+ Indian banking apps',
      security: '100% in-browser generation with zero payment intermediaries, tracking, or fees'
    },
    useCases: [
      'Retail checkout counters, acrylic billing stands, and point-of-sale displays',
      'Freelance digital invoices, consulting receipts, and client payment links',
      'Restaurant table billing, food delivery packaging, and cafe ordering menus',
      'Direct non-profit charity donations and event entry registration desks',
      'Immediate scan-and-pay across all Indian bank accounts with zero commission'
    ],
    faqs: [
      {
        q: 'Which UPI apps can scan and pay with this QR code?',
        a: 'All standard payment apps supporting NPCI specifications can scan this code, including Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and all Indian banking apps.'
      },
      {
        q: 'Is there any transaction fee or intermediary involved?',
        a: 'None. UniversalCodeMaker does not process payments or handle funds. The QR code points directly to your Virtual Payment Address (VPA / UPI ID) so 100% of funds go straight into your bank account.'
      },
      {
        q: 'Can I specify a fixed amount or let customers enter their own?',
        a: 'Both options are supported. Leave the amount blank to let the customer enter any amount, or specify a fixed amount to lock the payment to an exact invoice figure.'
      },
      {
        q: 'How do I generate a UPI QR code with a fixed payment amount?',
        a: 'In the generator wizard, enter your UPI ID (VPA), your merchant or personal name, and the exact rupee amount in the Amount field. The generator appends the &am= parameter to the open NPCI URI (for example, upi://pay?pa=store@bank&pn=MyStore&am=250.00&cu=INR). When scanned, the customer\'s payment app pre-fills and locks the amount to prevent payment discrepancies.'
      },
      {
        q: 'What is a universal UPI QR code and does it work across all payment apps?',
        a: 'A universal UPI QR code follows the National Payments Corporation of India (NPCI) interoperable deep-linking standard. It is not locked to any single vendor like PhonePe or Google Pay. Any UPI-compliant app installed on an Android or iOS smartphone can decode the URI and initiate a secure, immediate payment directly from the payer\'s linked bank account.'
      },
      {
        q: 'What is the best format to print a UPI payment QR code for a store counter?',
        a: 'Download the code in scalable vector SVG format for professional graphic design, or high-resolution PNG for direct desktop printing. For retail checkout stands and acrylic holders, print at a minimum size of 2" × 2" (50 mm × 50 mm) at 300 DPI or higher. Use a matte finish or non-reflective acrylic stand to eliminate harsh overhead lighting glare that can hinder camera autofocus.'
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
    metaTitle: 'Free Avery 5160 Barcode & QR Code Label Generator',
    metaDescription: 'Print QR codes and barcodes on Avery 5160 labels (30 per Letter sheet) for free. Make the code, add a title, price or SKU, and download a print-ready PDF.',
    h1: 'Free Avery 5160 Barcode & QR Code Label Generator',
    lead: 'Print QR codes and barcodes on Avery 5160 address labels (30 per US Letter sheet), or on 5163 shipping labels. Add a title, price or SKU beside the code and download a ready-to-print PDF, free and with nothing to install.',
    technicalSpec: {
      templateFormat: 'Avery 5160 / 5960 / 8160 (1.0\" × 2.625\", 30-up per Letter sheet)',
      gridDimensions: '3 columns × 10 rows per sheet (8.5\" × 11\" US Letter)',
      margins: 'Top/Bottom: 0.5\", Left/Right: 0.1875\" (3/16\"), Column gap: 0.125\", no row gap',
      symbologySupport: 'All 10 formats, including QR Code, Code 128, UPC-A, EAN-13 and Data Matrix',
      printerCompatibility: '5160: laser printers. 8160 (same size, same template): inkjet printers'
    },
    useCases: [
      'Product SKU and inventory tagging on standard US Letter printer paper',
      'Amazon FBA FNSKU 30-up shipment prep without special label printer hardware',
      'Mailing, return shipping, and package barcode routing labels',
      'Classroom, library, and office asset barcode tagging'
    ],
    faqs: [
      {
        q: 'How many barcodes fit on an Avery 5160 label sheet?',
        a: 'An Avery 5160 sheet has 30 labels, each 1\" × 2-5/8\", in 3 columns of 10 rows on 8.5\" × 11\" US Letter paper. Avery products such as 5260, 5960, 8160 and 8460 share the same template, so they print the same way.'
      },
      {
        q: 'Do I need a special printer for Avery 5160 labels?',
        a: 'No, a normal office printer works. Avery 5160 is made for laser printers; Avery 8160 is the same size for inkjet printers. Both use the same template, so pick the one that matches your printer.'
      },
      {
        q: 'How do I avoid printing alignment issues on Avery label sheets?',
        a: 'In your browser or PDF reader print dialog, set Scale to 100% or Actual Size and uncheck Fit to Page or Shrink to Printable Area. Printing at Actual Size keeps the labels lined up with the die-cut grid. Print one test page on plain paper first, because printers can shift the page slightly.'
      },
      {
        q: 'Can each label on the sheet have a different code?',
        a: 'Yes. In Batch Mode, paste your list (or make a numbered sequence), set Export Format to Avery PDF sheet and choose Avery 5160. Each label gets the next value, with the value printed underneath if you want. The label maker and the Print Avery PDF Label Sheet button repeat one design on every label.'
      }
    ]
  },
  {
    slug: 'isbn-book-barcode-generator',
    name: 'ISBN Book Barcode Generator',
    shortName: 'ISBN-13 Bookland',
    queryParam: 'symbology=isbn',
    category: 'Retail & POS',
    metaTitle: 'Free ISBN Book Barcode Generator: Bookland EAN-13 & SVG',
    metaDescription: 'Generate ISBN-13 and Bookland EAN barcodes for book covers, Amazon KDP and IngramSpark. Includes automatic check digit and 5-digit price add-on in vector SVG.',
    h1: 'Free ISBN-13 Bookland Barcode Generator',
    lead: 'Generate high-contrast Bookland EAN-13 barcodes for paperback, hardcover, and print-on-demand books. Designed to meet strict IngramSpark, Amazon KDP, and Barnes & Noble publishing specifications with vector SVG and 300 DPI print exports.',
    technicalSpec: {
      standard: 'ISO 2108 / Bookland EAN-13 (GS1 General Specifications)',
      prefixStructure: '978 or 979 International Book Industry Prefix',
      checkDigitMath: 'Automated GS1 Modulo-10 checksum calculation',
      supplementalAddon: 'Optional EAN-5 supplemental price code (e.g. 51999 for $19.99 USD / 90000 for no price)',
      outputFormats: 'Scalable Vector SVG, High-Res 300 DPI PNG, Direct Print'
    },
    useCases: [
      'Amazon KDP (Kindle Direct Publishing) paperback and hardcover back covers',
      'IngramSpark and Lightning Source global retail distribution',
      'Bookstore Point-of-Sale (POS) cash register laser scanning',
      'Independent publishing, literary journals, and self-published textbooks'
    ],
    faqs: [
      {
        q: 'How do I get a barcode for my book?',
        a: 'To put a barcode on your book cover, follow four steps: 1) Obtain an official 13-digit ISBN from your national agency (such as Bowker in the US, Nielsen in the UK, Library and Archives Canada) or choose a free ISBN directly in Amazon KDP; 2) Enter your 13-digit ISBN (beginning with 978 or 979) into UniversalCodeMaker\'s Bookland generator; 3) Optionally configure an EAN-5 supplemental price code (e.g. 51999 for $19.99 USD or 90000 for unpriced books); 4) Download the vector SVG or high-resolution PNG and place it in the lower-right area of your back cover design.'
      },
      {
        q: 'Where do I obtain an official ISBN for my book?',
        a: 'In the United States, official ISBNs are issued by Bowker (myidentifiers.com). In Canada, they are issued free by Library and Archives Canada. In the UK, Nielsen Book is the official agency. In India, Raja Rammohun Roy National Agency issues ISBNs. Amazon KDP also provides free ISBNs for platform-exclusive publishing.'
      },
      {
        q: 'What is the 5-digit add-on code next to the ISBN barcode?',
        a: 'The 5-digit supplemental code is an EAN-5 price extension. For books sold in the US, the first digit is 5 (denoting USD), followed by the price without decimals. For example, 51999 represents $19.99 USD. If no price is set, 90000 is used.'
      },
      {
        q: 'Does Amazon KDP accept vector SVG barcodes generated here?',
        a: 'Yes. UniversalCodeMaker exports clean, vector SVG and high-DPI 300+ PPI PNG files with exact quiet zones, ensuring razor-sharp reproduction that will pass KDP and IngramSpark automated pre-flight checks.'
      },
      {
        q: 'Where should the ISBN barcode be placed on a book cover?',
        a: 'Book industry standards (BISG) specify placing the barcode in the lower-right quadrant of the back cover, at least 0.25 to 0.5 inches (6 to 13 mm) away from the trim edge and spine. Ensure the light quiet-zone margins on both sides of the barcode remain completely unobstructed by cover artwork or dark backgrounds.'
      },
      {
        q: 'Can I convert an old 10-digit ISBN to the modern 13-digit format?',
        a: 'Yes. Simply prefix the 9-digit core with 978 and calculate the new 13th Mod-10 check digit. Our generator handles this math automatically.'
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
    metaTitle: 'Free Code 39 Barcode Generator for Asset Tags',
    metaDescription: 'Create free Code 39 (USD-3 / LOGMARS) barcodes online. Ideal for IT asset tracking, equipment labels, and internal warehouse inventory.',
    h1: 'Free Code 39 (USD-3) Barcode Generator',
    lead: 'Generate industrial-grade Code 39 alphanumeric barcodes for enterprise asset management, equipment labels, and internal inventory numbering with instant vector SVG and PNG downloads.',
    technicalSpec: {
      standard: 'ANSI/AIM BC1 / ISO/IEC 16388 / MIL-STD-129',
      characterSet: '43 characters: 0–9, uppercase A–Z, and symbols (- . $ / + % space)',
      checkDigit: 'Optional Modulo-43 checksum calculation',
      densityType: 'Variable-length discrete symbology with start/stop asterisk (*) characters',
      exportOptions: 'Crisp Vector SVG, 300 DPI Thermal Print, Avery Label Sheets'
    },
    useCases: [
      'IT hardware asset tags (laptops, monitors, networking gear)',
      'US Department of Defense (DoD) military supply shipments under MIL-STD-129',
      'Hospital and clinical laboratory specimen tube tracking',
      'Automotive manufacturing sub-assemblies (AIAG standard)'
    ],
    faqs: [
      {
        q: 'What is the difference between Code 39 and Code 128?',
        a: 'Code 39 is a simpler, self-checking symbology widely adopted by government, defense, and healthcare due to its reliability on older scanners. Code 128 is more compact (encodes data in less physical bar space) and supports the full 128 ASCII character set.'
      },
      {
        q: 'Do Code 39 barcodes require a check digit?',
        a: 'Code 39 includes inherent self-checking architecture, making a check digit optional in most commercial uses. However, high-integrity environments (such as DoD LOGMARS or healthcare) often enable the Modulo-43 checksum for maximum error prevention.'
      },
      {
        q: 'Can Code 39 encode lowercase letters or symbols?',
        a: 'Standard Code 39 natively encodes uppercase A–Z, numbers 0–9, and seven special symbols (- . $ / + % and space). Extended Code 39 uses two-character pairs to encode the full ASCII table.'
      },
      {
        q: 'Why do I see asterisks (*) at the beginning and end of Code 39 data?',
        a: 'The asterisk (*) serves as the start/stop pattern that tells the optical barcode scanner which direction the barcode is being read. Our generator automatically renders the start/stop bars.'
      }
    ]
  },
  {
    slug: 'bulk-barcode-generator-excel',
    name: 'Bulk Barcode Generator from Excel',
    shortName: 'Bulk Excel / CSV',
    queryParam: 'batch=open',
    category: 'Logistics & 1D',
    metaTitle: 'Free Bulk Barcode Generator from Excel or CSV',
    metaDescription: 'Paste a column from Excel, Google Sheets or CSV to make up to 200 barcodes or QR codes at once: a ZIP of PNG/SVG files or an Avery PDF, one code per label.',
    h1: 'Free Bulk Barcode Generator from Excel & CSV',
    lead: 'Make up to 200 barcodes or QR codes at once from a numbered sequence or a pasted list. Copy a column from Excel, Google Sheets or your inventory system, paste it in, and download a ZIP of images or an Avery PDF sheet with one code per label.',
    technicalSpec: {
      inputDataSources: 'Pasted lines or CSV text (first column), or a numbered sequence (up to 100)',
      supportedSymbologies: 'All 10 formats, including Code 128, EAN-13, UPC-A, Code 39 and QR Code',
      batchCapacity: 'Up to 200 values per batch, made in your browser; you are told if more were pasted',
      exportFormats: 'ZIP of PNG or SVG images, or Avery PDF sheets (5160, 5163, L7160) with one code per label',
      privacyStandard: 'Your codes stay in your browser; inventory data is never uploaded to any server'
    },
    useCases: [
      'Warehouse inventory counting and annual stock audit tagging',
      'Batch product labeling from Shopify, WooCommerce, or Amazon inventory CSV exports',
      'Sequential serial numbers and asset tags (e.g. SN-0001 to SN-0100) on Avery labels',
      'Event badge and trade show attendee registration credentials'
    ],
    faqs: [
      {
        q: 'How do I make barcodes from an Excel or Google Sheets column?',
        a: 'Put one value per row in a single column (SKU, part number or barcode number). Copy the column, open Batch Mode in the studio, choose the Paste List / CSV tab and paste. For CSV text, the first column is used. Up to 200 values per batch.'
      },
      {
        q: 'How many barcodes can I make at once?',
        a: 'Up to 200 values per batch. If you paste more, the tool tells you how many were left out, so you can run the rest as a second batch. Everything is made in your browser, so the speed depends on your device.'
      },
      {
        q: 'Is my proprietary inventory or pricing data sent to a cloud server?',
        a: 'Never. The data you paste is processed entirely in your browser and is never sent over the network.'
      },
      {
        q: 'Can I print bulk barcodes directly onto Avery label sheets?',
        a: 'Yes. In Batch Mode, set Export Format to Avery PDF sheet, choose 5160, 5163 or L7160, and download a PDF with a different code on each label, in the order of your list. Tick the option to print each value as text under its code.'
      }
    ]
  },
  {
    slug: 'shopify-barcode-generator',
    name: 'Shopify Product Barcode Generator',
    shortName: 'Shopify Barcode',
    queryParam: 'symbology=upc-a&preset=retail-225-125',
    category: 'Retail & POS',
    metaTitle: 'Free Shopify Barcode Generator (UPC-A & EAN-13)',
    metaDescription: 'Make UPC-A and EAN-13 barcodes for Shopify products and POS scanners. Check digit included; vector SVG, PNG and Avery label sheets, free.',
    h1: 'Free Shopify Product Barcode & SKU Generator',
    lead: 'Create scannable UPC, EAN, and Code 128 barcode labels for your Shopify product catalog and physical retail checkout counters. Easily import your product SKUs, design thermal price tags, and print without expensive third-party Shopify apps.',
    technicalSpec: {
      retailStandards: 'UPC-A (12 digits for US/CA) and EAN-13 (13 digits for International)',
      internalSkuFormat: 'Code 128 alphanumeric symbology for internal variant SKUs',
      posHardwareCompatibility: 'Compatibility depends on the selected symbology, scanner model, Shopify setup, label size and print quality; test before rollout',
      labelDimensions: 'Standard 2.25\" × 1.25\" direct thermal price tags and Avery 5160 multi-pack sheets'
    },
    useCases: [
      'Shopify POS retail boutique and pop-up shop cash register checkouts',
      'Printing thermal shelf price tags with Product Title, SKU, Price, and Barcode',
      'Inventory receiving and warehouse stock fulfillment',
      'Tagging multi-variant apparel and consumer goods'
    ],
    faqs: [
      {
        q: 'Does Shopify require official UPC or EAN barcodes?',
        a: 'If you are only selling in your own Shopify online store or physical retail location using Shopify POS, you can use any internal SKU or Code 128 barcode. However, if you sync products with Google Shopping, Amazon, or Facebook/Instagram commerce, you must provide authentic GS1 UPC or EAN numbers.'
      },
      {
        q: 'How do I print barcodes for my Shopify products without paying for an app?',
        a: 'Export your product list from Shopify admin (Products > Export > All products as CSV). Open UniversalCodeMaker, upload the CSV into our Batch Generator, and print directly to Avery sheets or thermal rolls without recurring monthly app subscriptions.'
      },
      {
        q: 'Which barcode scanner works best with Shopify POS on iPad or iPhone?',
        a: 'Shopify POS officially recommends Bluetooth 1D/2D barcode scanners (such as Socket Mobile S700 or Tera Wireless Handheld Scanners) that pair via Bluetooth HID keyboard emulation.'
      },
      {
        q: 'What label size is standard for Shopify retail clothing and shelf tags?',
        a: 'The most popular size for retail boutiques and apparel is 2.25\" × 1.25\" (or 2\" × 1\") direct thermal sticker rolls, which comfortably fit the product name, price, SKU, and barcode.'
      }
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
        "title": "US & Canadian Retail Standard",
        "desc": "The standard 12-digit point-of-sale barcode recognized by every checkout scanner in North America."
      },
      {
        "title": "Zero Latency Point of Sale",
        "desc": "Fixed 12-digit numeric length allows POS cash registers to verify items in milliseconds."
      },
      {
        "title": "International Compatibility",
        "desc": "Scanners worldwide can read UPC-A by simply prepending a leading zero to form a 13-digit GTIN."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling in Walmart, Target, Kroger, or Canadian retail?",
        "a": "UPC-A is the usual retail barcode in the United States and Canada, and many US retailers ask suppliers for it. Checkout scanners there also read EAN-13."
      },
      {
        "q": "Listing on Amazon North America (FBA)?",
        "a": "Amazon checks UPC and EAN numbers against the GS1 database, so use numbers licensed to your own company, or apply for a GTIN exemption if your product has no barcode."
      },
      {
        "q": "Need barcodes for shipping cartons or pallets?",
        "a": "Do not use UPC-A on corrugated outer shipping boxes. Use ITF-14 or GS1-128 for wholesale logistics."
      }
    ],
    "legalCaution": {
      "title": "GS1 US Registration & Legal Retail Requirements",
      "points": [
        "Selling through North American retailers and marketplaces requires numbers licensed from GS1 US (a company prefix or single GTINs) or GS1 Canada. Resold or recycled UPCs registered to another company may be rejected by Amazon and major retail chains.",
        "Maintain a minimum 9X module quiet zone on both sides of the barcode to prevent scanner beam clipping.",
        "Use high contrast: black or dark blue bars on a white or light background. Red, orange and yellow bars don't scan under red-light checkout scanners."
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
        "title": "Useful for Internal Identifiers",
        "desc": "Create Code 128 graphics for identifiers you control. Confirm any customer, carrier, or platform requirements before production use."
      },
      {
        "title": "Full 128 ASCII Alphanumeric Range",
        "desc": "Encodes letters (A–Z, a–z), numbers (0–9), punctuation, and control characters."
      },
      {
        "title": "Auto-Switching High Density",
        "desc": "Automatically switches between subsets A, B, and C to compress paired digits into compact spaces."
      }
    ],
    "decisionGuide": [
      {
        "q": "Labeling warehouse shelves, bins, and pallets?",
        "a": "Code 128 is the industry gold standard for warehouse management systems (WMS) and internal logistics."
      },
      {
        "q": "Tracking company IT assets, tools, or serialized parts?",
        "a": "Use Code 128 to encode alphanumeric serial numbers (e.g. LAPTOP-2026-X8) onto durable sticker labels."
      },
      {
        "q": "Can I use Code 128 at a grocery store checkout?",
        "a": "Standard supermarket cash registers expect 12-digit UPC or 13-digit EAN; use Code 128 for logistics, shipping, and internal operations."
      }
    ],
    "legalCaution": {
      "title": "Code 128 Usage Guidelines & Quiet Zone Rules",
      "points": [
        "Code 128 is an open public-domain standard (ISO/IEC 15417). No royalties or company prefix registrations are required for private or internal use.",
        "When using GS1-128 (formerly UCC/EAN-128) in commercial freight, you must format data with official GS1 Application Identifiers (AIs) and start with an FNC1 character.",
        "Ensure a minimum quiet zone of 10 times the module width (10X) on both ends of the barcode to allow laser scanners to synchronize timing."
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
        "title": "Engineered for Rough Corrugated Boxes",
        "desc": "Large bar widths and high tolerances allow reliable scanning directly on brown cardboard."
      },
      {
        "title": "Thick Protective Bearer Bars",
        "desc": "Surrounding black bearer bars equalize plate pressure and prevent partial scanner slice misreads."
      },
      {
        "title": "Long-Range Forklift Scanning",
        "desc": "Warehouse operators can scan ITF-14 barcodes from several meters away without dismounting."
      }
    ],
    "decisionGuide": [
      {
        "q": "Packing master cartons containing multiple retail units?",
        "a": "ITF-14 is the global standard barcode printed on outer shipping cases containing 6, 12, or 24 individual retail products."
      },
      {
        "q": "Can ITF-14 be scanned at point-of-sale retail checkouts?",
        "a": "No. ITF-14 is strictly for non-retail logistics, wholesale distribution, and warehouse cross-docking."
      },
      {
        "q": "How does ITF-14 link to the retail item inside?",
        "a": "The 14-digit number incorporates an Packaging Indicator digit (1–8) followed by the 12-digit GTIN of the enclosed retail unit and a final check digit."
      }
    ],
    "legalCaution": {
      "title": "ITF-14 Printing Standards & Bearer Bar Guidelines",
      "points": [
        "Always include bearer bars (minimum 4.8mm thick) when printing directly onto corrugated cartons to prevent uneven flexographic plate impression.",
        "Ensure the barcode is placed at least 32mm from the bottom edge of the box and at least 19mm from vertical edges to prevent corner folding distortion.",
        "The final 14th digit is a mandatory GS1 Modulo-10 checksum calculated across the first 13 digits."
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
        "title": "Ultra-Compact Micro Footprint",
        "desc": "Can encode dozens of characters into a tiny 2mm × 2mm square symbol."
      },
      {
        "title": "ECC 200 Reed-Solomon Error Correction",
        "desc": "Can be read even when up to 30% of the symbol is scratched, torn, or occluded."
      },
      {
        "title": "Direct Part Marking (DPM) Ready",
        "desc": "Engineered for direct laser engraving and dot-peening onto metal, glass, and silicon."
      }
    ],
    "decisionGuide": [
      {
        "q": "Marking electronic components, PCBs, or surgical tools?",
        "a": "Data Matrix is used in electronics, aerospace and UDI workflows. The required carrier, encoded data and verification rules depend on the applicable programme and receiving organisation."
      },
      {
        "q": "Packaging pharmaceuticals (prescription medicine)?",
        "a": "GS1 DataMatrix is used in regulated pharmaceutical traceability workflows. Exact marking and data requirements depend on the product, role and jurisdiction, so verify the current official rules before use."
      },
      {
        "q": "Should I use Data Matrix or QR Code for consumer advertising?",
        "a": "Use QR Code for consumers (native smartphone camera apps recognize QR faster); use Data Matrix for industrial, medical, and compact component labeling."
      }
    ],
    "legalCaution": {
      "title": "Data Matrix Specifications & Healthcare Use",
      "points": [
        "Data Matrix is an open ISO standard (ISO/IEC 16022). It requires an area-imaging scanner (cannot be scanned with older single-line 1D laser scanners).",
        "FDA UDI and GS1 healthcare labels need GS1 DataMatrix: it starts with a special FNC1 character and uses Application Identifiers (e.g. (01) GTIN, (17) Expiry Date, (10) Batch/Lot, (21) Serial Number). This studio makes plain ECC 200 Data Matrix, so it is not suitable for those labels.",
        "Ensure the \"L\" shaped finder pattern on the bottom and left borders remains completely unobstructed."
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
        "title": "Compact Layout Option",
        "desc": "The standard permits a zero-module quiet zone, but practical layouts should leave separation where possible and be tested with the intended scanners."
      },
      {
        "title": "Fast Center-Out Bullseye Lock",
        "desc": "Area imager scanners locate the central concentric square instantly regardless of orientation."
      },
      {
        "title": "Scalable Error Correction",
        "desc": "User-selectable Reed-Solomon recovery from 5% up to 95% damaged data area."
      }
    ],
    "decisionGuide": [
      {
        "q": "Issuing airline boarding passes or train tickets?",
        "a": "Aztec Code is one of the three 2D codes IATA's boarding-pass standard allows on mobile boarding passes, alongside Data Matrix and QR Code."
      },
      {
        "q": "Displaying codes on compact smartphone screens?",
        "a": "Because Aztec requires no quiet zone margin around its perimeter, it maximizes scannable area on small smartphone displays."
      }
    ],
    "legalCaution": {
      "title": "Aztec Code Implementation Rules",
      "points": [
        "Aztec Code is in the public domain (ISO/IEC 24778) and free of all patent restrictions.",
        "Requires 2D camera imagers; 1D laser scanners cannot read Aztec symbols.",
        "Avoid placing graphic borders or icons over the central bullseye finder pattern."
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
        "title": "Multi-Line Data Capacity",
        "desc": "Can encode more text than typical 1D barcodes, making it useful for structured records and document references."
      },
      {
        "title": "Stacked Linear Robustness",
        "desc": "Can be read by both area-imaging cameras and rastering linear laser scanners."
      },
      {
        "title": "Document-Friendly Format",
        "desc": "Its stacked rows and configurable error correction suit records that need more capacity than a typical linear barcode."
      }
    ],
    "decisionGuide": [
      {
        "q": "Encoding a multi-line inventory or document record?",
        "a": "PDF417 can encode the text as supplied. Define and validate the record structure required by your own workflow before printing."
      },
      {
        "q": "Printing postal shipping documents or freight manifests?",
        "a": "PDF417 can hold multi-line shipping or freight references, but carrier formats vary. Use the carrier's current specification and test the finished label."
      }
    ],
    "legalCaution": {
      "title": "PDF417 Capacity & Aspect Ratio Guidelines",
      "points": [
        "PDF417 is specified by ISO/IEC 15438; this page does not certify a symbol for a particular workflow.",
        "Use only data you are authorized to encode, and follow the receiving system's current data specification.",
        "Choose an aspect ratio that fits the layout, then test the final output with the intended scanner and print process."
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
        "title": "1-Tap Zero-Typing Wi-Fi Access",
        "desc": "Guests connect instantly without mistyping complex WPA2/WPA3 passwords."
      },
      {
        "title": "Native iOS & Android Integration",
        "desc": "Built-in camera apps prompt \"Join Network\" without installing any third-party app."
      },
      {
        "title": "Browser-Based Payload Generation",
        "desc": "The Wi-Fi fields used to build the code are processed in your browser rather than submitted to UniversalCodeMaker's server. See the Privacy Policy for site analytics and advertising details."
      }
    ],
    "decisionGuide": [
      {
        "q": "Running a restaurant, cafe, boutique hotel, or Airbnb?",
        "a": "Place a Wi-Fi QR code on table stands or guest welcome books to eliminate repetitive password requests."
      },
      {
        "q": "Setting up meeting rooms in a corporate office?",
        "a": "Provide temporary guest Wi-Fi access in conference lobbies with one quick camera scan."
      }
    ],
    "legalCaution": {
      "title": "Wi-Fi Security & Warning Against Dynamic QR Services",
      "points": [
        "Beware of third-party \"dynamic QR code\" generators! Many commercial sites route your Wi-Fi credentials through remote redirect servers that log user IPs and break when monthly subscriptions expire.",
        "Our studio generates direct, static Wi-Fi payloads in the widely used WIFI: format. UniversalCodeMaker does not control a redirect or expiry, but credentials, device support and network settings can change.",
        "For high-security enterprise environments, use a dedicated Guest VLAN to isolate visitors from internal office hardware."
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
        "title": "Instant Address Book Save",
        "desc": "Prompts smartphones to save contact details directly with zero typing errors."
      },
      {
        "title": "Zero Paper Business Card Waste",
        "desc": "Share comprehensive digital cards including phone, email, website, and job title."
      },
      {
        "title": "Cross-Platform vCard 3.0 Standard",
        "desc": "Works seamlessly across Apple Contacts, Google Contacts, and Microsoft Outlook."
      }
    ],
    "decisionGuide": [
      {
        "q": "Attending conferences, networking mixers, or trade shows?",
        "a": "Display your vCard QR code on your badge, phone lock screen, or physical card for instant contact sharing."
      },
      {
        "q": "Real estate agents and independent consultants?",
        "a": "Print on yard signs, presentation slides, and vehicle decals so prospects can save your number in 2 seconds."
      }
    ],
    "legalCaution": {
      "title": "vCard Best Practices & Payload Optimization",
      "points": [
        "Keep the vCard payload compact (under 350 characters) to ensure the QR code remains clean, low-density, and scannable even from a distance or in low light.",
        "Avoid embedding raw image photos directly in the vCard payload, as this creates dense codes that can be difficult for older smartphone cameras to resolve.",
        "Written as vCard 3.0 (IETF RFC 2426), the version the iPhone and Android contacts apps read directly."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: vCard Standard",
        "desc": "Complete history, syntax, and field properties of the vCard standard format.",
        "url": "https://en.wikipedia.org/wiki/VCard"
      },
      {
        "name": "IETF RFC 6350 (vCard 4.0)",
        "desc": "Official Internet Engineering Task Force RFC specification for electronic business cards.",
        "url": "https://datatracker.ietf.org/doc/html/rfc6350"
      }
    ]
  },
  "crypto-qr-code-generator": {
    "benefits": [
      {
        "title": "Zero Address Typing Mistakes",
        "desc": "Eliminates mistyped 42-character public keys and prevents irreversible fund transfers."
      },
      {
        "title": "BIP-21 Universal Payment URI",
        "desc": "Compatible with all major crypto wallets (Metamask, Phantom, Trust Wallet, Ledger)."
      },
      {
        "title": "Built-in Crypto Coin Badges",
        "desc": "Embeds official Bitcoin, Ethereum, or Solana logos directly in the center of the QR code."
      }
    ],
    "decisionGuide": [
      {
        "q": "Accepting crypto payments in a retail store or online invoice?",
        "a": "Pre-configure cryptocurrency QR codes with your recipient address and optional requested payment amounts."
      },
      {
        "q": "Setting up creator tip jars or non-profit donations?",
        "a": "Print durable crypto payment QR stickers for live streams, blogs, and fundraising stands."
      }
    ],
    "legalCaution": {
      "title": "Cryptocurrency Address Safety & Testing Recommendations",
      "points": [
        "Cryptocurrency transactions are mathematically irreversible on the blockchain. Always perform a test micro-transaction before printing codes on physical signage.",
        "Verify that your clipboard or browser has not been altered by malicious browser extensions before generating payment addresses.",
        "Bitcoin links follow BIP-21, Ethereum links follow EIP-681 (the amount is converted to wei), and Solana uses the solana: link format."
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
      }
    ]
  },
  "email-qr-code-generator": {
    "benefits": [
      {
        "title": "Pre-Populated Support Messages",
        "desc": "Automatically fills recipient, subject line, and body template when scanned."
      },
      {
        "title": "Direct Native Mail Client Launch",
        "desc": "Launches default mail app (Apple Mail, Gmail, Outlook) with one camera scan."
      },
      {
        "title": "Zero Server Tracking",
        "desc": "Uses standard mailto URI; no user emails or contents pass through any third-party server."
      }
    ],
    "decisionGuide": [
      {
        "q": "Customer warranty claims and technical support tickets?",
        "a": "Print on equipment labels with pre-filled product model numbers and return instructions."
      },
      {
        "q": "Event RSVP and private club registration?",
        "a": "Include pre-written event RSVP responses on printed invitation flyers."
      }
    ],
    "legalCaution": {
      "title": "Email QR Standards",
      "points": [
        "Uses the mailto: link format (IETF RFC 6068) with the subject and body filled in.",
        "The email is sent from the person's own mail app, and only after they tap Send; this site sends nothing. Whether your use follows anti-spam rules such as CAN-SPAM or GDPR depends on who you ask to email and why.",
        "Special characters (spaces, ampersands, question marks) are automatically percent-encoded for universal email client compatibility."
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
        "title": "1-Tap Text Message Compose",
        "desc": "Opens default SMS app with pre-filled message text and recipient phone number."
      },
      {
        "title": "Works Without Internet / Wi-Fi",
        "desc": "Cellular SMS works even in low-reception areas where mobile data is unavailable."
      },
      {
        "title": "High Consumer Engagement",
        "desc": "SMS response rates are over 5x higher than traditional paper forms or email signups."
      }
    ],
    "decisionGuide": [
      {
        "q": "Running billboard or transit ads for lead capture?",
        "a": "Allow commuters to scan and send a pre-filled keyword (e.g. \"QUOTE\") in 2 seconds."
      },
      {
        "q": "Dispatching maintenance or roadside assistance?",
        "a": "Print stickers on rental vehicles with pre-filled emergency dispatch codes."
      }
    ],
    "legalCaution": {
      "title": "SMS Marketing Regulations & Opt-In Rules",
      "points": [
        "Ensure compliance with local telecommunications laws (TCPA in the US, GDPR in the EU). Users must explicitly tap \"Send\" in their SMS app to transmit the message.",
        "Clearly state in your promotional signage that standard message and data rates may apply according to the user’s mobile carrier plan.",
        "Uses the widely supported SMSTO: format (smsto:number:message), not the sms: link defined in RFC 5724."
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
        "title": "Instant 1-Tap Telephone Dialing",
        "desc": "Launches phone dialer with telephone number pre-loaded; zero misdialed digits."
      },
      {
        "title": "Universal Cellular Compatibility",
        "desc": "Supported natively on every iOS and Android device with zero app requirements."
      },
      {
        "title": "Emergency Speed",
        "desc": "Enables immediate voice connection in urgent situations."
      }
    ],
    "decisionGuide": [
      {
        "q": "Real estate yard signs, contractor trucks, and restaurant storefronts?",
        "a": "Allow passersby to call your sales office with a single camera tap."
      },
      {
        "q": "Equipment breakdown or security hotline signage?",
        "a": "Ensure facility operators can connect directly to security or maintenance personnel."
      }
    ],
    "legalCaution": {
      "title": "Phone QR Formatting & International Roaming",
      "points": [
        "Always format telephone numbers in international E.164 format (+[country code][number]) so international travelers can connect without dialing errors.",
        "Smartphones will always prompt the user to confirm the call before dialing, preventing accidental or phantom outgoing calls.",
        "Uses the tel: link format (IETF RFC 3966)."
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
        "title": "1-Tap Calendar Synchronization",
        "desc": "Prompts users to add events directly into Apple Calendar, Google Calendar, or Outlook."
      },
      {
        "title": "Zero Event Misses & Automatic Reminders",
        "desc": "Pre-configures start time, end time, location address, and reminder notifications."
      },
      {
        "title": "Universal iCalendar VEVENT Standard",
        "desc": "Encodes the event as iCalendar (VEVENT) text, the format defined by RFC 5545."
      }
    ],
    "decisionGuide": [
      {
        "q": "Organizing conferences, product launches, or webinars?",
        "a": "Print calendar event QR codes on tickets and promo posters so attendees save the exact date instantly."
      },
      {
        "q": "Wedding invitations and birthday party save-the-dates?",
        "a": "Ensure guests never forget the date, venue address, and start time."
      }
    ],
    "legalCaution": {
      "title": "iCalendar Timezone & Daylight Saving Best Practices",
      "points": [
        "Always specify UTC timestamps or explicit timezone identifiers (TZID) to ensure event times do not shift when imported by attendees traveling across time zones.",
        "Keep event descriptions concise to maintain high QR code scannability on printed paper invitations.",
        "Event text uses the iCalendar VEVENT structure from IETF RFC 5545, simplified (no UID or timestamp fields); test-scan with the phones your guests use."
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
        "title": "Opens Straight in Google Maps",
        "desc": "One scan opens the place in the Google Maps app (or the browser), where visitors tap Directions to get there."
      },
      {
        "title": "Exact Geographic Coordinates",
        "desc": "Pinpoint precise GPS latitude and longitude coordinates even in remote or rural locations."
      },
      {
        "title": "Zero Navigation Address Typos",
        "desc": "Prevents visitors from getting lost due to similar street names or postal code ambiguities."
      }
    ],
    "decisionGuide": [
      {
        "q": "Retail storefronts, restaurants, and tourist attractions?",
        "a": "Place location QR codes on flyers, business cards, and brochures to guide visitors directly to your door."
      },
      {
        "q": "Festivals, outdoor weddings, and remote trade show venues?",
        "a": "Use exact latitude/longitude coordinates to pin event entrances without registered street addresses."
      }
    ],
    "legalCaution": {
      "title": "Location QR Accuracy & Navigation Guidelines",
      "points": [
        "Scan the printed code on an iPhone and an Android phone before printing in volume, and check it opens the right place.",
        "Point coordinates at the public visitor entrance rather than a private loading dock or the middle of a large building.",
        "Uses Google's documented Maps URL format, which needs no API key and opens in the Google Maps app or any web browser."
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
        "title": "100% Universal Raw Text Storage",
        "desc": "Contains raw unformatted strings requiring no specific browser or application handlers."
      },
      {
        "title": "Completely Offline Data Retrieval",
        "desc": "Readable by any smartphone, barcode scanner, or optical camera with zero network connection."
      },
      {
        "title": "High Density (Up to 4,296 Characters)",
        "desc": "Store extensive serial lists, cryptographic public keys, or instruction manuals."
      }
    ],
    "decisionGuide": [
      {
        "q": "Industrial machinery serial numbers and calibration logs?",
        "a": "Encode permanent equipment metadata directly onto durable metal or vinyl asset tags."
      },
      {
        "q": "Cryptographic public keys or recovery backup phrases?",
        "a": "Store offline cryptographic text strings on paper cold wallets without relying on third-party servers."
      }
    ],
    "legalCaution": {
      "title": "Plain Text Security & Visibility Warnings",
      "points": [
        "Plain text QR codes are completely unencrypted and can be read by anyone with a smartphone camera. Never encode sensitive passwords or personal health data in plaintext.",
        "For high-density text (>500 characters), select Error Correction Level L or M to prevent the QR matrix from becoming excessively dense.",
        "Standard QR Code symbols (ISO/IEC 18004). Dot styles and logos rely on the code's error correction, so test-scan styled codes before printing."
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
        "title": "Amazon's White Space Built In",
        "desc": "The Amazon layout keeps 0.25\" clear on the sides and 0.125\" at the top and bottom, the margins Amazon asks for around the barcode and text."
      },
      {
        "title": "Avery 5160 & Thermal Roll Ready",
        "desc": "Print 30-up US Letter sheets on a laser printer, or single labels on MUNBYN, Rollo and Zebra thermal printers."
      },
      {
        "title": "Text Always Matches the Bars",
        "desc": "The FNSKU printed under the barcode is the value the barcode encodes, so a typo can't leave the text and the bars saying different things."
      }
    ],
    "decisionGuide": [
      {
        "q": "Manufacturer barcode or Amazon barcode (FNSKU)?",
        "a": "US, since 31 March 2026: if you are the brand owner with the Brand Representative role in Amazon Brand Registry, and the product has one scannable UPC, EAN or ISBN matching one ASIN, you can send it with the manufacturer barcode. Resellers must use Amazon barcodes. Products without a manufacturer barcode, or with a GTIN exemption, need Amazon barcodes. Amazon.in: Amazon barcodes by default; only books can go stickerless. More: <a href=\"./do-i-need-a-barcode-to-sell-on-amazon.html\">Do I need a barcode to sell on Amazon?</a>"
      },
      {
        "q": "Which printer for FBA labels?",
        "a": "A thermal printer (Amazon's own fulfilment centres use direct thermal Zebra GX430t printers) or a laser printer with Avery 5160 sheets. Not inkjet: Amazon says not to use it. Either way, 300 dpi or more."
      }
    ],
    "legalCaution": {
      "title": "Amazon's Label Rules (Seller Central help, checked 12 Oct 2026)",
      "points": [
        "Cover every other barcode on the unit (UPC, EAN, ISBN) with the FNSKU label, except serial-number and Transparency codes.",
        "Labels must be 1\" × 2\" to 2\" × 3\", black on white, non-reflective, with removable adhesive. Our template is 1\" × 2⅝\" (Avery 5160 size).",
        "Don't put the label on a curve or corner, keep 0.25\" between the label and the edge of the package, and make sure it still scans after poly-bagging or other prep.",
        "Use a thermal or laser printer at 300 dpi or more, never inkjet. Labels must stay scannable for 24 months.",
        "Amazon India adds: don't tape over labels, and don't use QR codes on them."
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
        "title": "Direct 1-Tap Review Form Launch",
        "desc": "Bypasses search results and business listings, opening straight into Google's rating dialog on mobile devices."
      },
      {
        "title": "Permanent & Zero Subscription Fees",
        "desc": "100% static client-side QR generation. No monthly bills, no scan caps, and no middleman URL redirects that can break."
      },
      {
        "title": "Print Files for Counters & Table Stands",
        "desc": "Download a vector SVG or 300 DPI PNG to print on counter cards, table stands or receipts."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I use a shortlink or Google Place ID?",
        "a": "Both work seamlessly. If you have your 'g.page' review link from Google Business Profile, paste it directly. If you have a Google Place ID (ChIJ...), our compiler formats it into the direct 'writereview' endpoint automatically."
      },
      {
        "q": "Where is the best physical location to place review QR codes?",
        "a": "Where customers finish their visit: the checkout counter, receipts, dining tables or the exit. Asking right after a good experience makes leaving a review easy."
      }
    ],
    "legalCaution": {
      "title": "Google Business Profile Review Policy Compliance",
      "points": [
        "Google strictly prohibits 'review gating' (filtering negative reviews by sending dissatisfied customers to a private form while directing positive customers to Google).",
        "Do not offer monetary incentives, discounts, or gifts in exchange for reviews, as this violates Google Maps Contributor guidelines and FTC endorsement guides.",
        "Ensure all reviews are genuine and left by authentic customers using their personal Google accounts."
      ]
    },
    "authorityLinks": [
      {
        "name": "Google Business Profile: Customer Reviews Policy",
        "desc": "Official rules and best practices for requesting Google customer reviews.",
        "url": "https://support.google.com/business/answer/3474122"
      },
      {
        "name": "FTC: Guides Concerning the Use of Endorsements and Testimonials",
        "desc": "Federal Trade Commission compliance guidelines for honest customer feedback and reviews.",
        "url": "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking"
      }
    ]
  },
  "whatsapp-qr-code-generator": {
    "benefits": [
      {
        "title": "Instant Chat Without Saving Number",
        "desc": "Customers connect immediately via wa.me protocol without needing to create a phone contact first."
      },
      {
        "title": "Pre-Filled Inquiries & Order Messages",
        "desc": "Pre-populate introductory text so customers can send product inquiries or reservations in one tap."
      },
      {
        "title": "Privacy-Safe Direct Communication",
        "desc": "The phone number and message fields are compiled into the QR payload in your browser rather than submitted to UniversalCodeMaker's server."
      }
    ],
    "decisionGuide": [
      {
        "q": "Can I use this for personal and WhatsApp Business accounts?",
        "a": "Yes. The standard wa.me protocol operates universally across personal WhatsApp, WhatsApp Business, and WhatsApp Web on both Android and iOS devices."
      },
      {
        "q": "How should international phone numbers be formatted?",
        "a": "Include the country code followed by the full mobile number with digits only (e.g. 15550192834 for US or 447911123456 for UK). Do not include plus signs, spaces, or brackets."
      }
    ],
    "legalCaution": {
      "title": "WhatsApp Business Policy & Messaging Guidelines",
      "points": [
        "Ensure your customer outreach complies with WhatsApp Business Messaging Policies and applicable telecommunications regulations.",
        "Do not send unsolicited bulk promotional messages to users who scan your code without explicit opt-in consent.",
        "WhatsApp and its logos are registered trademarks of Meta Platforms, Inc."
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
        "title": "Universal NPCI App Compatibility",
        "desc": "Scannable across Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and all Indian banking apps."
      },
      {
        "title": "Direct UPI Payment Details",
        "desc": "UniversalCodeMaker does not process or settle payments or set bank, app or merchant fees. Verify the recipient, amount and settlement terms with your payment provider."
      },
      {
        "title": "Flexible Static or Preset Amount",
        "desc": "Generate open-amount QR codes for store counters or locked-amount codes for specific invoices and menu items."
      }
    ],
    "decisionGuide": [
      {
        "q": "What is the difference between static and dynamic amount UPI QR codes?",
        "a": "Static codes leave the amount blank, allowing customers to key in their own total at checkout. Dynamic amount codes embed a fixed rupee figure (e.g. am=450.00) so the amount is locked when scanned."
      },
      {
        "q": "Can I print UPI QR codes on tabletop acrylic tent stands?",
        "a": "Yes! UniversalCodeMaker exports high-resolution 300 DPI vector SVGs and PNGs that can be printed on durable vinyl or cardboard standees for checkout counters."
      }
    ],
    "legalCaution": {
      "title": "NPCI Unified Payments Interface Guidelines",
      "points": [
        "UniversalCodeMaker creates the QR payload but does not process or settle payments. Payment handling, fees and settlement terms are controlled by the payer's and recipient's payment providers.",
        "Always test-scan your generated QR code with a ₹1 test transaction before printing physical shop signage to verify your VPA spelling.",
        "Ensure your merchant name matches the official registration on your bank account to avoid customer confusion during payment verification."
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
        "title": "Avery's Published 5160 Layout",
        "desc": "Labels are placed on Avery's 5160 grid: 3 columns × 10 rows of 1\" × 2-5/8\" labels, 0.5\" top margin, 3/16\" side margins and a 1/8\" gap between columns."
      },
      {
        "title": "Any Office Printer",
        "desc": "No thermal printer needed: print on a normal laser printer (5160 labels) or inkjet printer (8160 labels)."
      },
      {
        "title": "Same Code or a Different One per Label",
        "desc": "Repeat one design (with a title, price or SKU beside it) using the label maker, or print a list of values with a different code on each label from Batch Mode."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I print on Avery 5160 sheets or a direct thermal roll printer?",
        "a": "Avery 5160 sheets are ideal if you already own a standard office laser/inkjet printer and need to prepare 30 to 300 labels per batch. Thermal roll printers are faster and more economical for continuous, high-volume shipping stations."
      },
      {
        "q": "What printer settings prevent label misalignment?",
        "a": "Always select Actual Size or Scale: 100% in your print dialog, and turn off Fit to Page or Shrink to Printable Area. Otherwise the labels shift further out of line down the sheet."
      }
    ],
    "legalCaution": {
      "title": "Avery Template Compatibility & Trademark Notice",
      "points": [
        "Avery and Avery template numbers (5160, 5163, etc.) are registered trademarks of Avery Products Corporation / CCL Industries Inc.",
        "UniversalCodeMaker is an independent utility not affiliated with or endorsed by Avery Products Corporation. Template names are referenced strictly under nominative fair use for sizing compatibility.",
        "Always test print on plain paper first and hold against an Avery sheet to verify printer roller alignment before printing onto label stock."
      ]
    },
    "authorityLinks": [
      {
        "name": "Avery 5160 Template",
        "desc": "Avery's official template page for 1\" × 2-5/8\" address labels (30 per sheet).",
        "url": "https://www.avery.com/templates/5160"
      },
      {
        "name": "USPS Barcode Printing Standards",
        "desc": "Postal service contrast and barcode readability guidelines for mailers.",
        "url": "https://postalpro.usps.com/"
      }
    ]
  },
  "isbn-book-barcode-generator": {
    "benefits": [
      {
        "title": "Standard Bookland EAN-13",
        "desc": "The 978/979 EAN-13 book barcode with correct quiet zones, the format used on covers for Amazon KDP, IngramSpark and bookshops. Check your distributor's current cover specs before uploading."
      },
      {
        "title": "Optional EAN-5 Price Extension",
        "desc": "Seamlessly append standard 5-digit price codes (e.g. 51999 for $19.99 USD or 90000 for no price) required by US bookstores."
      },
      {
        "title": "Vector SVG & 300+ DPI Print Files",
        "desc": "Download crisp vector graphics to embed into Adobe InDesign, Illustrator, Canva, or Photoshop book cover templates."
      }
    ],
    "decisionGuide": [
      {
        "q": "Do I need the 5-digit price add-on code on my book?",
        "a": "Major US bookstore chains (such as Barnes & Noble) strongly prefer the 5-digit price extension code to automatically populate the retail price at the cash register. For international or online-only sales, standard 13-digit ISBN is sufficient."
      },
      {
        "q": "Can I use the same ISBN for paperback and hardcover editions?",
        "a": "No. Under international publishing standards, every format (paperback, hardcover, audiobook, e-book) requires its own unique ISBN number."
      }
    ],
    "legalCaution": {
      "title": "International ISBN Agency Regulatory Compliance",
      "points": [
        "ISBN barcodes must be derived from genuine ISBN numbers issued by authorized national agencies (Bowker in the US, Nielsen in the UK, etc.).",
        "Inventing arbitrary 13-digit numbers will result in immediate rejection by book wholesalers, libraries, and Amazon KDP.",
        "Ensure the barcode is printed on an opaque white background on the lower right quadrant of the back cover."
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
        "title": "Full Alphanumeric Character Support",
        "desc": "Encodes capital letters A–Z, numbers 0–9, and key operational symbols (- . $ / + % space) for intuitive asset naming."
      },
      {
        "title": "Known as LOGMARS in US Defense Logistics",
        "desc": "LOGMARS is the US Department of Defense's use of Code 39 and adds its own size and density rules; check them against your contract before printing."
      },
      {
        "title": "Self-Checking Robust Architecture",
        "desc": "Inherent parity check pattern minimizes misread risks, with optional Modulo-43 check digit support for mission-critical tracking."
      }
    ],
    "decisionGuide": [
      {
        "q": "When should I choose Code 39 over Code 128?",
        "a": "Choose Code 39 when encoding shorter alphanumeric IDs (like ASSET-104) where legacy scanners or government contracts (MIL-STD-129) require it. Choose Code 128 if you have longer strings or space constraints on small labels."
      },
      {
        "q": "Should I enable the Modulo-43 check digit?",
        "a": "Enable Mod-43 if you are tracking high-value assets, medical specimens, or defense shipments. For casual office inventory, standard Code 39 without check digit is scannable on all hardware."
      }
    ],
    "legalCaution": {
      "title": "Code 39 Technical Standards & Quiet Zone Rules",
      "points": [
        "Code 39 requires a minimum quiet zone (blank white margin) of 10 times the narrow bar width on both the left and right sides.",
        "Standard Code 39 is not case-sensitive; lowercase letters are automatically capitalized upon encoding.",
        "Ensure start and stop asterisks (*) are preserved in the optical pattern to allow bi-directional scanning."
      ]
    },
    "authorityLinks": [
      {
        "name": "AIM Global: Code 39 Symbology Specification",
        "desc": "Official standards body documentation for ANSI/AIM BC1 Uniform Symbology Specification Code 39.",
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
        "title": "Checked Before Anything Is Made",
        "desc": "Every value is checked first (format and check digit). If any line is wrong, you see its line number and nothing is made until it is fixed."
      },
      {
        "title": "Single-Click Consolidated ZIP Export",
        "desc": "Downloads every code as a PNG or SVG in one ZIP, each file numbered and named after its value (e.g. 001_SN-0001.png), or as an Avery PDF with one code per label."
      },
      {
        "title": "Your Data Stays in Your Browser",
        "desc": "Your confidential inventory SKUs, customer lists, and pricing spreadsheets never leave your device."
      }
    ],
    "decisionGuide": [
      {
        "q": "How do I format my spreadsheet before pasting?",
        "a": "Put one value per row in a single column, with no formulas in the cells. Blank lines are skipped. If you paste CSV text, only the first column is used."
      },
      {
        "q": "Can I batch generate sequential numbers without an Excel file?",
        "a": "Yes. Use the Sequenced Numbers tab: set a prefix (e.g. SKU-), a start number (e.g. 1001), how many (up to 100) and the number of digits, and the tool makes the sequence."
      }
    ],
    "legalCaution": {
      "title": "Batch Inventory Compliance & Data Protection",
      "points": [
        "UniversalCodeMaker does not store, log, or cache batch data on any server. Be sure to download your generated ZIP file or PDF before closing the browser window.",
        "When generating retail EAN-13 or UPC-A batches, ensure all numbers correspond to legitimate GS1 Company Prefixes registered to your organization.",
        "Always perform a sample test scan of at least 3 random barcodes from your batch before committing to large print runs."
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
        "title": "Zero Monthly App Subscription Fees",
        "desc": "Create unlimited retail barcodes for your Shopify store without paying $10–$25/month for third-party Shopify apps."
      },
      {
        "title": "Direct Shopify POS Scanner Compatibility",
        "desc": "Encoded with precision quiet zones that work instantly with Socket Mobile, Tera, and Zebra Shopify POS Bluetooth scanners."
      },
      {
        "title": "Avery & Thermal Price Tag Presets",
        "desc": "Formatted for 2.25\" × 1.25\" shelf tags and Avery 5160 sheets with Product Title, SKU, Price, and Barcode."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I use UPC-A or Code 128 for my Shopify store?",
        "a": "If you are selling products in external retail marketplaces (like Amazon or Google Shopping), use official GS1 UPC-A barcodes. If you only sell on your own Shopify store and physical boutique, Code 128 using your internal SKUs is fast and free."
      },
      {
        "q": "How do I add barcodes to my Shopify products?",
        "a": "In your Shopify Admin, navigate to Products > Select Product > Inventory section, and paste the barcode number into the 'Barcode (ISBN, UPC, GTIN, etc.)' field."
      }
    ],
    "legalCaution": {
      "title": "Shopify POS & Google Shopping Barcode Policy",
      "points": [
        "Shopify and Shopify POS are registered trademarks of Shopify Inc. UniversalCodeMaker is an independent software tool not endorsed by Shopify.",
        "Google Shopping and marketplace integrations require authentic GS1 GTINs. Do not enter fabricated UPC numbers into Shopify if syncing with Google Merchant Center.",
        "Ensure thermal labels use high-density thermal paper to prevent barcode fading under retail store lighting."
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
    "title": "How to Print QR Codes &amp; Barcodes on Avery 5160 Labels",
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
        "a": "Yes. The iPhone Camera app and Android camera or Google Lens recognise vCard codes and offer to add the contact. We write vCard 3.0, the version contact apps read most reliably."
      },
      {
        "q": "Can I change the details after printing?",
        "a": "No. The details are stored inside the code, which is what makes it private, free and permanent. If something changes, generate a new code. It takes a few seconds."
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
            <li><a href="./google-reviews-qr-code-generator.html">Google Reviews 5-Star QR</a></li>
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

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3988564922048072" crossorigin="anonymous"></script>
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
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=acrylic+qr+code+sign+holder&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>Acrylic QR Countertop Stands</span>
      </a>
      <a href="https://www.amazon.com/s?k=thermal+receipt+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Thermal Receipt Printers</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>2D QR Scanners</span>
      </a>
      <a href="https://www.amazon.com/s?k=printable+vinyl+sticker+paper&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <span>Weatherproof Sticker Paper</span>
      </a>
    `;
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
        ${page.category} Standard
      </div>
      <h1 class="hero-title">${page.h1}</h1>
      <p class="hero-lead">${page.lead}</p>${page.slug === 'ean-13-barcode-generator' ? '\n      ' + eanOnpageHtml() : ''}
      
      <a href="../index.html?${page.queryParam}" class="${page.slug === 'ean-13-barcode-generator' ? 'ean-full-studio' : 'cta-launch-btn'}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        ${page.slug === 'ean-13-barcode-generator' ? 'Launch studio for full customization' : `Generate ${page.shortName} Now (Instant & Free)`}
      </a>${hasEanWorkflow(page.slug) ? identifierNoticeHtml() : ''}
    </section>${page.slug === 'ean-13-barcode-generator' ? '\n' + eanPackagingHtml() : ''}

    <!-- Technical Specs & Use Cases Grid -->
    <section class="content-grid">
      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
          Technical Specifications
        </h2>
        <dl class="spec-table">
          ${specsListHtml}
        </dl>
      </div>

      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
          Standard Industry Use Cases
        </h2>
        <ul class="use-cases-list">
          ${useCasesHtml}
        </ul>
      </div>
    </section>

    ${guide && page.slug !== 'ean-13-barcode-generator' ? `<!-- Practical guide: how to make it, print it, and what to avoid -->
    <section class="guide-card" aria-labelledby="guide-title">
      <h2 id="guide-title" class="guide-title">${guide.title || `How to Make, Print &amp; Test Your ${page.shortName} Code`}</h2>
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
    <!-- Recommended Hardware & Supplies Banner (Amazon Associates) -->
    <section class="hardware-box">
      <div class="hardware-box-header">
        <div class="hardware-box-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          Recommended Hardware &amp; Supplies
        </div>
        <div class="hardware-box-disclosure">
          UniversalCodeMaker is an Amazon Associate. As an Amazon Associate, we earn from qualifying purchases.
        </div>
      </div>
      <div class="hardware-pills-row">
        ${hardwareItemsHtml}
      </div>
    </section>

    <!-- Why Choose This Format / Key Benefits -->
    ${benefits.length > 0 ? `
    <section style="margin: 2.5rem 0 2rem;">
      <h2 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Key Benefits of ${page.shortName}
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
          What Code Do I Need for My Product? (Customer Decision Guide)
        </h2>
      </div>
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
        Choosing the right barcode format depends on where your product is sold, the packaging substrate, and scanner infrastructure:
      </p>
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
          Legal &amp; Compliance Guide
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
          Official Specifications &amp; Authoritative References
        </h3>
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">PUBLIC CITATIONS</span>
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
        Frequently Asked Questions
      </h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

    <!-- Related Tools Cross-Links -->
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Related Barcode &amp; QR Tools
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
const today = new Date().toISOString().split('T')[0];

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
