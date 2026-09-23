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
 * Uses promise memoization to prevent duplicate downloads and race conditions.
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
 * Injects a script tag into document head trying candidate URLs in sequence
 * @param {string[]} sources - Ordered list of script URLs to try
 * @param {number} [timeoutMs=8000] - Timeout per source
 * @returns {Promise<void>}
 */
function injectScript(sources, timeoutMs = 8000) {
  const urlList = Array.isArray(sources) ? sources : [sources];

  return new Promise((resolve, reject) => {
    let index = 0;

    function tryNext() {
      if (index >= urlList.length) {
        return reject(new Error(`Failed to load script after trying all sources: ${urlList.join(', ')}`));
      }

      const currentSrc = urlList[index++];

      // If already present in DOM
      if (document.querySelector(`script[src="${currentSrc}"]`)) {
        return resolve();
      }

      const script = document.createElement('script');
      script.src = currentSrc;
      script.async = true;
      script.crossOrigin = currentSrc.startsWith('http') ? 'anonymous' : '';

      let timer = setTimeout(() => {
        script.onerror = null;
        script.onload = null;
        console.warn(`[DynamicLoader] Timeout loading ${currentSrc}. Trying next fallback...`);
        script.remove();
        tryNext();
      }, timeoutMs);

      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timer);
        console.warn(`[DynamicLoader] Error loading ${currentSrc}. Trying next fallback...`);
        script.remove();
        tryNext();
      };

      document.head.appendChild(script);
    }

    tryNext();
  });
}

/**
 * Loads and initializes the bwip-js engine
 * @returns {Promise<any>} The global bwipjs object
 */
export async function loadBwip() {
  if (typeof window !== 'undefined' && window.bwipjs) {
    return window.bwipjs;
  }

  if (!loadPromises.has('bwip-js')) {
    const p = (async () => {
      const prefix = getVendorPrefix();
      const sources = [
        `${prefix}js/vendor/bwip-js-min.js`,
        'https://cdn.jsdelivr.net/npm/bwip-js@latest/dist/bwip-js-min.js',
        'https://unpkg.com/bwip-js@latest/dist/bwip-js-min.js'
      ];
      await injectScript(sources);
      if (!window.bwipjs) {
        throw new Error('bwip-js script loaded but window.bwipjs is undefined');
      }
      return window.bwipjs;
    })();
    loadPromises.set('bwip-js', p);
  }

  return loadPromises.get('bwip-js');
}

/**
 * Loads and initializes the qr-code-styling engine
 * @returns {Promise<any>} The QRCodeStyling constructor
 */
export async function loadQRCodeStyling() {
  if (typeof window !== 'undefined' && window.QRCodeStyling) {
    return window.QRCodeStyling;
  }

  if (!loadPromises.has('qr-code-styling')) {
    const p = (async () => {
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
    })();
    loadPromises.set('qr-code-styling', p);
  }

  return loadPromises.get('qr-code-styling');
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

  if (!loadPromises.has('jspdf')) {
    const p = (async () => {
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
    })();
    loadPromises.set('jspdf', p);
  }

  return loadPromises.get('jspdf');
}

/**
 * Loads and initializes the JSZip library
 * @returns {Promise<any>} The JSZip constructor
 */
export async function loadJsZip() {
  if (typeof window !== 'undefined' && window.JSZip) {
    return window.JSZip;
  }

  if (!loadPromises.has('jszip')) {
    const p = (async () => {
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
    })();
    loadPromises.set('jszip', p);
  }

  return loadPromises.get('jszip');
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

