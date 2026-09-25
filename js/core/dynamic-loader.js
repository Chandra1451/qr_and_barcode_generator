/**
 * Dynamic Client-Side Dependency Loader
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Lazily loads bwip-js, qr-code-styling, jspdf, and jszip on demand.
 * Strategy:
 * 1. Self-Hosted Vendor copies (/js/vendor/...) for instant sub-20ms loading from Hostinger.
 * 2. Fallback to jsDelivr global CDN.
 * 3. Fallback to unpkg global CDN.
 * 
 * Single-flight loading (shared promise) with retry after failure; slow sources are never abandoned.
 */

// Cache promises for single-flight execution
const loadPromises = new Map();

/**
 * Resolves the relative path prefix depending on current page depth
 * @returns {string} Relative path prefix (e.g. './' or '../')
 */
function getVendorPrefix() {
  if (typeof window !== 'undefined' && window.location && window.location.pathname) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/pages/') || path.includes('/tests/') || path.includes('/v2/') || path.includes('/classic/')) {
      return '../';
    }
  }
  return './';
}

/**
 * Injects a script tag into document head, falling back through candidate URLs.
 *
 * A slow source is never abandoned: when it passes `timeoutMs` the next source starts
 * alongside it, and whichever finishes first wins. (Removing a slow 1.1 MB download on
 * mobile used to leave barcodes permanently broken.) Rejects only when every started
 * source has failed.
 * @param {string[]} sources - Ordered list of script URLs to try
 * @param {number} [timeoutMs=20000] - Time before also trying the next source
 * @returns {Promise<void>}
 */
function injectScript(sources, timeoutMs = 20000) {
  const urlList = Array.isArray(sources) ? sources : [sources];

  return new Promise((resolve, reject) => {
    let index = 0;
    let inFlight = 0;
    let settled = false;

    function failIfExhausted() {
      if (!settled && inFlight === 0 && index >= urlList.length) {
        settled = true;
        reject(new Error(`Failed to load script after trying all sources: ${urlList.join(', ')}`));
      }
    }

    function tryNext() {
      if (settled) return;
      if (index >= urlList.length) return failIfExhausted();

      const currentSrc = urlList[index++];
      const script = document.createElement('script');
      script.src = currentSrc;
      script.async = true;
      script.crossOrigin = currentSrc.startsWith('http') ? 'anonymous' : '';
      inFlight++;

      const timer = setTimeout(() => {
        if (settled) return;
        console.warn(`[DynamicLoader] ${currentSrc} is slow; also trying the next source...`);
        tryNext();
      }, timeoutMs);

      script.onload = () => {
        clearTimeout(timer);
        inFlight--;
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      script.onerror = () => {
        clearTimeout(timer);
        inFlight--;
        script.remove();
        if (settled) return;
        console.warn(`[DynamicLoader] Error loading ${currentSrc}. Trying next fallback...`);
        if (index < urlList.length) tryNext();
        else failIfExhausted();
      };

      document.head.appendChild(script);
    }

    tryNext();
  });
}

/**
 * Single-flight loader: concurrent callers share one promise, but a failure is not
 * remembered, so the next call retries instead of failing until the page is reloaded.
 */
function memoLoad(key, factory) {
  if (!loadPromises.has(key)) {
    const p = factory();
    loadPromises.set(key, p);
    p.catch(() => {
      if (loadPromises.get(key) === p) loadPromises.delete(key);
    });
  }
  return loadPromises.get(key);
}

/**
 * Loads and initializes the bwip-js engine
 * @returns {Promise<any>} The global bwipjs object
 */
export async function loadBwip() {
  if (typeof window !== 'undefined' && window.bwipjs) {
    return window.bwipjs;
  }

  return memoLoad('bwip-js', async () => {
    const prefix = getVendorPrefix();
    // CDN fallbacks pinned to the vendored version (js/vendor/bwip-js-min.js = 4.11.4).
    const sources = [
      `${prefix}js/vendor/bwip-js-min.js`,
      'https://cdn.jsdelivr.net/npm/bwip-js@4.11.4/dist/bwip-js-min.js',
      'https://unpkg.com/bwip-js@4.11.4/dist/bwip-js-min.js'
    ];
    await injectScript(sources, 30000); // 1.1 MB: allow slow mobile connections
    if (!window.bwipjs) {
      throw new Error('bwip-js script loaded but window.bwipjs is undefined');
    }
    return window.bwipjs;
  });
}

/**
 * Loads and initializes the qr-code-styling engine
 * @returns {Promise<any>} The QRCodeStyling constructor
 */
export async function loadQRCodeStyling() {
  if (typeof window !== 'undefined' && window.QRCodeStyling) {
    return window.QRCodeStyling;
  }

  return memoLoad('qr-code-styling', async () => {
    const prefix = getVendorPrefix();
    const sources = [
      `${prefix}js/vendor/qr-code-styling.js`,
      'https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js',
      'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js'
    ];
    await injectScript(sources);
    if (!window.QRCodeStyling) {
      throw new Error('qr-code-styling script loaded but window.QRCodeStyling is undefined');
    }
    return window.QRCodeStyling;
  });
}

/**
 * Loads and initializes the jsPDF document generator
 * @returns {Promise<any>} The jsPDF constructor class
 */
export async function loadJsPdf() {
  if (typeof window !== 'undefined') {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;
  }

  return memoLoad('jspdf', async () => {
    const prefix = getVendorPrefix();
    const sources = [
      `${prefix}js/vendor/jspdf.umd.min.js`,
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js'
    ];
    await injectScript(sources);
    const jsPdfClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPdfClass) {
      throw new Error('jsPDF script loaded but window.jspdf.jsPDF is undefined');
    }
    return jsPdfClass;
  });
}

/**
 * Loads and initializes the JSZip library
 * @returns {Promise<any>} The JSZip constructor
 */
export async function loadJsZip() {
  if (typeof window !== 'undefined' && window.JSZip) {
    return window.JSZip;
  }

  return memoLoad('jszip', async () => {
    const prefix = getVendorPrefix();
    const sources = [
      `${prefix}js/vendor/jszip.min.js`,
      'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
      'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
    ];
    await injectScript(sources);
    if (!window.JSZip) {
      throw new Error('JSZip script loaded but window.JSZip is undefined');
    }
    return window.JSZip;
  });
}

/**
 * Pre-fetches the active QR styling engine in the background without blocking.
 * bwip-js (1.1MB) is strictly deferred until a 1D/2D barcode symbology is selected.
 */
export function prefetchEngines() {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadQRCodeStyling().catch(() => {});
    });
  } else {
    setTimeout(() => {
      loadQRCodeStyling().catch(() => {});
    }, 500);
  }
}

