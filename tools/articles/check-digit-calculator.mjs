// Check digit calculator page (UCM-KW-02). Facts: projects/universalcodemaker/80_growth/sources/check-digit-calculator.md
// The worked example is computed from js/core/checksums.js at build time, so the page and the tool can't disagree.
import { calculateMod10 } from '../../js/core/checksums.js';

const GENSPECS = 'https://ref.gs1.org/standards/genspecs/';
const GS1US_CALC = 'https://www.gs1us.org/tools/check-digit-calculator';
const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

// 952 is GS1's prefix for demonstrations and examples (GS1 General Specifications 26.0, p. 26).
const EXAMPLE = '952012345678';

function exampleTableHtml(digits) {
  const cells = [...digits].map((d, i) => {
    const weight = (digits.length - i) % 2 === 1 ? 3 : 1; // the digit next to the check digit gets 3
    return { d: Number(d), weight, product: Number(d) * weight };
  });
  const sum = cells.reduce((s, c) => s + c.product, 0);
  const next = Math.ceil(sum / 10) * 10;
  const check = calculateMod10(digits);
  if ((next - sum) % 10 !== check) throw new Error('check digit example disagrees with checksums.js');
  // One row per digit (reads cleanly on a phone), then the total.
  const rows = cells.map((c) => `<tr><td>${c.d}</td><td>×${c.weight}</td><td>${c.product}</td></tr>`).join('');
  return {
    sum, next, check,
    html: `<div class="table-scroll"><table class="spec-table cd-example">
          <caption>Working out the check digit of ${digits}</caption>
          <thead><tr><th scope="col">Digit</th><th scope="col">Multiply by</th><th scope="col">Result</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><th scope="row" colspan="2">Total</th><td>${sum}</td></tr></tfoot>
        </table></div>`,
  };
}

const ex = exampleTableHtml(EXAMPLE);

export default {
  slug: 'check-digit-calculator',
  name: 'GTIN Check Digit Calculator',
  badge: 'Calculator',
  queryParam: 'symbology=ean-13',
  metaTitle: 'GTIN Check Digit Calculator: EAN-13, UPC-A, GTIN-14',
  metaDescription: 'Calculate or check the last digit of an EAN-13, UPC-A, GTIN-14 or ISBN-13 number, one at a time or a whole list, using the GS1 method.',
  dateModified: '2026-11-23',
  datePublished: '2026-11-23',
  h1: 'GTIN Check Digit Calculator',
  lead: 'Type a barcode number without its last digit to get the check digit, or the whole number to check it. Works for EAN-13, UPC-A, GTIN-14 and ISBN-13 numbers, one at a time or a pasted list.',
  sources: [
    { name: 'GS1 General Specifications Standard, Release 26.0 (section 7.9.1)', url: GENSPECS, checked: '2026-11-23' },
    { name: 'GS1 US Check Digit Calculator', url: GS1US_CALC, checked: '2026-11-23' },
  ],
  onpageTool: 'check-digit',
  relatedSlugs: ['ean-13-barcode-generator', 'upc-a-barcode-generator', 'itf-14-barcode-generator', 'isbn-book-barcode-generator', 'how-to-get-a-barcode-for-your-product', 'barcode-for-products-in-india'],
  ctas: [
    { href: '../index.html?symbology=ean-13', label: 'Open the barcode studio' },
  ],
  sections: [
    { id: 'what', h2: 'What the check digit is for', html: `
        <p>The last digit of an EAN, UPC or other GTIN is a check digit. It is calculated from all the other digits, so a scanner or a system can tell when a number has been misread or mistyped. GS1 US puts it this way: the check digit "helps to confirm the integrity of your barcode number" (${ext(GS1US_CALC, 'GS1 US check digit calculator')}).</p>` },
    { id: 'how', h2: 'How the check digit is worked out', html: `
        <p>GS1 uses one method for every fixed-length numeric number it defines, including GTIN-8, GTIN-12, GTIN-13 and GTIN-14 (${ext(GENSPECS, 'GS1 General Specifications')}, section 7.9.1):</p>
        <ol>
          <li>Starting with the digit next to where the check digit goes, multiply the digits by 3, 1, 3, 1 and so on, moving left.</li>
          <li>Add up the results.</li>
          <li>Subtract the total from the nearest equal or higher multiple of ten. The answer is the check digit (0 if the total is already a multiple of ten).</li>
        </ol>
        <p><strong>Worked example.</strong> ${EXAMPLE} uses the 952 prefix, which GS1 keeps for examples, so it isn't anyone's product.</p>
        ${ex.html}
        <p>The results add up to ${ex.sum}. The nearest multiple of ten at or above it is ${ex.next}, and ${ex.next} − ${ex.sum} = ${ex.check}. So the check digit is <strong>${ex.check}</strong> and the full GTIN-13 is <strong>${EXAMPLE}${ex.check}</strong>. You can try it in the calculator above.</p>` },
    { id: 'formats', h2: 'Which numbers this works for', html: `
        <ul>
          <li><strong>GTIN-13</strong>: EAN-13 barcodes, and ISBN-13 book numbers, which use the same check digit.</li>
          <li><strong>GTIN-12</strong>: UPC-A barcodes.</li>
          <li><strong>GTIN-14</strong>: numbers for cases and cartons, usually printed as ITF-14.</li>
        </ul>
        <p>Adding zeros in front of a number doesn't change its check digit, because the method works from the right. A UPC-A with a 0 in front gives the same check digit as a 13-digit number.</p>
        <p>Not covered here: GTIN-8 and SSCC numbers use the same method but have no matching barcode in our studio yet, and old 10-digit ISBNs use a different calculation.</p>` },
    { id: 'not-a-licence', h2: 'A correct check digit does not make a number yours', html: `
        <p>Any string of digits can be given a correct check digit, so a correct check digit only shows that the number is well formed. It does not mean the number was issued to you, or to anyone.</p>
        <p>That is why this page has no "generate a GTIN" button. Barcode numbers for products sold in shops and on marketplaces come from GS1. Our guides explain how to get them: <a href="./how-to-get-a-barcode-for-your-product.html">how to get a barcode for your product</a> and <a href="./barcode-for-products-in-india.html">how to get a barcode for products in India</a>.</p>` },
    { id: 'make', h2: 'Make the barcode', html: `
        <p>Once the number is right, the button in the calculator opens the studio with the format and number filled in. Or use a dedicated page: <a href="./ean-13-barcode-generator.html">EAN-13</a>, <a href="./upc-a-barcode-generator.html">UPC-A</a>, <a href="./itf-14-barcode-generator.html">ITF-14</a> or <a href="./isbn-book-barcode-generator.html">ISBN</a>.</p>` },
  ],
  faqs: [
    { q: 'Can this calculator give me a barcode number for my product?', a: 'No. It only works out or checks the last digit of a number you already have. Barcode numbers for products sold in shops come from GS1.' },
    { q: 'Why does my number fail the check?', a: 'Usually a digit is wrong, missing or in the wrong order, or the wrong format is selected. A 12-digit UPC-A entered with GTIN-13 selected is treated as 12 digits to calculate from, not a number to check: choose GTIN-12, or add a 0 in front.' },
    { q: 'What is the check digit of a UPC-A?', a: 'It is the 12th digit. Enter the first 11 digits with GTIN-12 selected to work it out.' },
    { q: 'Are the numbers I type sent anywhere?', a: 'No. The calculation runs in your browser, and the numbers you type or paste are not sent to us.' },
    { q: 'Does it work for 10-digit ISBNs?', a: 'No. ISBN-10 uses a different calculation. ISBN-13 numbers, which start with 978 or 979, work with GTIN-13.' },
  ],
};
