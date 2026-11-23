// Canonical, scoped markup for the UPI landing-page tool (easy mode for shopkeepers, UCM-IN-03).
export function upiOnpageHtml() {
  return `<section id="upi-onpage" class="upi-onpage" aria-labelledby="upi-tool-title">
        <h2 id="upi-tool-title">Make your shop's UPI QR code in 1 minute</h2>
        <div class="upi-onpage-grid">
          <form id="upi-form" novalidate>
            <p class="upi-step">Step 1: fill in</p>
            <label for="upi-vpa">Your UPI ID</label>
            <input id="upi-vpa" type="text" inputmode="email" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="yourname@bank" aria-describedby="upi-vpa-help upi-status">
            <p id="upi-vpa-help" class="upi-help">Find it in your UPI app's profile. It has an @ in it.</p>
            <label for="upi-name">Shop name</label>
            <input id="upi-name" type="text" autocomplete="organization" placeholder="e.g. Sharma General Store" aria-describedby="upi-name-help">
            <p id="upi-name-help" class="upi-help">Customers see this name when they pay.</p>
            <label for="upi-amount">Amount in ₹ (optional)</label>
            <input id="upi-amount" type="text" inputmode="decimal" autocomplete="off" placeholder="Leave empty for your shop counter" aria-describedby="upi-amount-help">
            <p id="upi-amount-help" class="upi-help">Fill this only for one fixed bill. For a shop counter, leave it empty.</p>
          </form>
          <div class="upi-result">
            <p class="upi-step">Step 2: check</p>
            <div id="upi-preview" class="upi-preview" aria-label="UPI QR code preview"><p>Your QR code will appear here.</p></div>
            <p id="upi-status" role="status" aria-live="polite" aria-atomic="true">Enter your UPI ID and shop name to begin.</p>
            <p class="upi-step">Step 3: download or print</p>
            <div class="upi-actions">
              <button type="button" id="upi-download" disabled>Download QR image</button>
              <button type="button" id="upi-poster" disabled>Print shop poster (PDF)</button>
              <button type="button" id="upi-share" hidden disabled>Share on WhatsApp or other apps</button>
            </div>
            <label class="upi-size" for="upi-poster-size">Poster size
              <select id="upi-poster-size"><option value="a5" selected>A5 (counter stand)</option><option value="a4">A4 (wall)</option></select>
            </label>
            <ul class="upi-checklist">
              <li>Scan the QR with your own phone and check your shop name appears.</li>
              <li>Ask someone to pay you ₹1 and check it reaches your bank.</li>
              <li>We only check that the UPI ID looks right. We can't check that the account exists.</li>
            </ul>
            <p class="upi-more">Want colours or a logo? <a href="../index.html?symbology=qr-code&amp;wizard=upi">Open the full studio</a>.</p>
          </div>
        </div>
        <p id="upi-startup">This tool needs JavaScript. If it does not start, enable JavaScript and reload, or <a href="../index.html?symbology=qr-code&amp;wizard=upi">open the full studio</a>.</p>
      </section>
      <script type="module" src="../js/upi-onpage.js?v=1.1"></script>`;
}
