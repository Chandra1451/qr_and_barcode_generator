/**
 * Dynamic Client-Side Dependency Loader
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Lazily loads bwip-js and qr-code-styling on demand without blocking initial render.
 * Uses promise memoization to prevent duplicate downloads and race conditions.
 */

// Cache promises for single-flight execution
const loadPromises = new Map();

/**
 * Injects a script tag into the document head and returns a Promise
 * @param {string} src - Primary CDN URL
 * @param {string} fallbackSrc - Fallback CDN URL if primary fails
 * @param {number} timeoutMs - Timeout in milliseconds (default 12000ms)
 * @returns {Promise<void>}
 */
function injectScript(src, fallbackSrc = null, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    // Check if script is already present
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';

    let timer = setTimeout(() => {
      script.onerror = null;
      script.onload = null;
      if (fallbackSrc) {
        console.warn(`[DynamicLoader] Primary source ${src} timed out. Attempting fallback ${fallbackSrc}...`);
        injectScript(fallbackSrc, null, timeoutMs).then(resolve).catch(reject);
      } else {
        reject(new Error(`Timed out loading ${src}`));
      }
    }, timeoutMs);

    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };

    script.onerror = (err) => {
      clearTimeout(timer);
      if (fallbackSrc) {
        console.warn(`[DynamicLoader] Failed loading ${src}. Switching to fallback ${fallbackSrc}...`);
        injectScript(fallbackSrc, null, timeoutMs).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to load script: ${src}`));
      }
    };

    document.head.appendChild(script);
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
      const primaryUrl = 'https://cdn.jsdelivr.net/npm/bwip-js@latest/dist/bwip-js-min.js';
      const fallbackUrl = 'https://unpkg.com/bwip-js@latest/dist/bwip-js-min.js';
      await injectScript(primaryUrl, fallbackUrl);
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
      const primaryUrl = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
      const fallbackUrl = 'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
      await injectScript(primaryUrl, fallbackUrl);
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
      const primaryUrl = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
      const fallbackUrl = 'https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js';
      await injectScript(primaryUrl, fallbackUrl);
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
      const primaryUrl = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      const fallbackUrl = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
      await injectScript(primaryUrl, fallbackUrl);
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
 * Pre-fetches core engines in the background without blocking
 */
export function prefetchEngines() {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadBwip().catch(() => {});
      loadQRCodeStyling().catch(() => {});
    });
  } else {
    setTimeout(() => {
      loadBwip().catch(() => {});
      loadQRCodeStyling().catch(() => {});
    }, 1000);
  }
}
