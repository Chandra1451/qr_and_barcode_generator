/**
 * Lightweight Zero-Dependency Cookie & Privacy Consent Banner
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Complies with GDPR, ePrivacy, and CCPA regulations.
 * Stores decision in localStorage with 0 remote tracking.
 */

export function initCookieBanner() {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'ucs_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) {
    return; // User has already acknowledged
  }

  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.className = 'cookie-consent-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Privacy and Cookies Notice');

  banner.innerHTML = `
    <div class="cookie-banner-content">
      <div class="cookie-banner-text">
        <span class="cookie-banner-icon">🛡️</span>
        <div>
          <strong>100% Client-Side Privacy Notice:</strong>
          <span>
            We do not collect, transmit, or store your barcodes, QR payloads, or personal data. All code generation occurs strictly inside your browser memory.
          </span>
        </div>
      </div>
      <div class="cookie-banner-actions">
        <a href="07_LEGAL_PRIVACY_COMPLIANCE.md" class="cookie-learn-more">Learn More</a>
        <button type="button" id="btn-accept-cookie" class="cookie-accept-btn">I Understand</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  const acceptBtn = document.getElementById('btn-accept-cookie');
  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'acknowledged');
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => banner.remove(), 300);
  });
}
