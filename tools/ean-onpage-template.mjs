// Canonical, scoped markup for the EAN landing-page tool.
export function eanOnpageHtml() {
  return `<section id="ean-onpage" class="ean-onpage" aria-labelledby="ean-tool-title">
        <div class="ean-onpage-heading"><h2 id="ean-tool-title">Make your EAN-13 barcode</h2><span>SVG &amp; PNG downloads</span></div>
        <div class="ean-onpage-grid">
          <form id="ean-form" novalidate>
            <label for="ean-number">Product number</label>
            <p id="ean-help">Enter all 13 digits, or the first 12 digits of an unfinished GTIN-13 to calculate the last digit.</p>
            <input id="ean-number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="ean-help ean-format-help ean-status" placeholder="Your assigned product number">
            <p id="ean-format-help">Already have a complete 12-digit UPC-A? Use the <a href="./upc-a-barcode-generator.html">UPC-A generator</a>.</p>
            <div class="ean-actions"><button id="ean-generate" type="submit" disabled>Generate barcode</button><button id="ean-example" type="button" disabled>Try an example</button></div>
          </form>
          <div class="ean-result">
            <div id="ean-preview" class="ean-preview" aria-label="Barcode preview"><p>Your barcode will appear here.</p></div>
            <p id="ean-status" role="status" aria-live="polite" aria-atomic="true">Enter a product number to begin.</p>
            <div class="ean-downloads" aria-label="Barcode downloads"><button type="button" data-ean-export="svg" disabled>Download SVG</button><button type="button" data-ean-export="png2" disabled>PNG 2×</button><button type="button" data-ean-export="png4" disabled>PNG 4×</button></div>
            <p class="ean-print-help">Black bars on white. Bar height: 22.85 mm. SVG keeps physical dimensions; PNG includes print-resolution metadata. Preview is scaled to fit. Test a printed sample before a production run.</p>
          </div>
        </div>
        <p id="ean-startup">This tool needs JavaScript. If it does not start, enable JavaScript and reload, or <a href="../index.html?symbology=ean-13">open the full studio</a>. The printing guide is below.</p>
      </section>
      <script type="module" src="../js/ean-onpage.js?v=1.0"></script>`;
}
