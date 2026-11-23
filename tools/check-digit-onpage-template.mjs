// Canonical, scoped markup for the check digit calculator page tool (UCM-KW-02).
// The calculation runs in js/check-digit-onpage.js with the same Mod-10 routine the studio uses.
export function checkDigitOnpageHtml() {
  return `<section id="check-digit-tool" class="cd-tool" aria-labelledby="cd-title">
        <h2 id="cd-title">Calculate or check a GTIN check digit</h2>
        <div class="cd-grid">
          <form id="cd-form" novalidate>
            <label for="cd-format">Format</label>
            <select id="cd-format">
              <option value="13" data-symbology="ean-13" selected>GTIN-13 (EAN-13, ISBN-13)</option>
              <option value="12" data-symbology="upc-a">GTIN-12 (UPC-A)</option>
              <option value="14" data-symbology="itf-14">GTIN-14 (ITF-14, cases and cartons)</option>
            </select>
            <label for="cd-number">Number</label>
            <input id="cd-number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="e.g. 952012345678" aria-describedby="cd-help cd-result">
            <p id="cd-help" class="cd-help">Type 12 digits to get the 13th, or all 13 to check the last one. Spaces and dashes are ignored.</p>
          </form>
          <div class="cd-output">
            <p id="cd-result" role="status" aria-live="polite" aria-atomic="true">Enter a number to begin.</p>
            <p id="cd-full" class="cd-full" hidden></p>
            <div class="cd-actions">
              <button type="button" id="cd-copy" disabled>Copy full number</button>
              <a id="cd-make" class="cd-make" href="../index.html?symbology=ean-13">Make this barcode in the studio</a>
            </div>
          </div>
        </div>
        <details id="cd-bulk" class="cd-bulk">
          <summary>Check a list of numbers</summary>
          <label for="cd-list">Paste one number per line (up to 1,000 lines). Uses the format chosen above.</label>
          <textarea id="cd-list" rows="6" spellcheck="false" autocomplete="off"></textarea>
          <div class="cd-actions">
            <button type="button" id="cd-run">Work out the list</button>
            <button type="button" id="cd-copy-list" disabled>Copy results</button>
            <button type="button" id="cd-csv" disabled>Download CSV</button>
          </div>
          <p id="cd-list-status" role="status" aria-live="polite"></p>
          <div class="cd-table-wrap">
            <table id="cd-table" hidden>
              <thead><tr><th scope="col">You entered</th><th scope="col">Result</th><th scope="col">Full number</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </details>
        <p id="cd-startup">This calculator needs JavaScript. If it does not start, enable JavaScript and reload.</p>
      </section>
      <script type="module" src="../js/check-digit-onpage.js?v=1.0"></script>`;
}
