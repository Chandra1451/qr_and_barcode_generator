/**
 * Central Generator Registry
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Manages all registered symbology plugins. Supports dynamic discovery and filtering.
 */

// Import 2D Matrix Plugins
import qrCode from './2d/qr-code.js?v=2.8';
import dataMatrix from './2d/data-matrix.js?v=2.8';
import aztec from './2d/aztec.js?v=2.8';
import pdf417 from './2d/pdf417.js?v=2.8';

// Import Retail 1D Plugins
import ean13 from './retail/ean-13.js?v=2.8';
import upcA from './retail/upc-a.js?v=2.8';
import isbn from './retail/isbn.js?v=2.8';

// Import Logistics 1D Plugins
import code128 from './logistics/code-128.js?v=2.8';
import itf14 from './logistics/itf-14.js?v=2.8';
import code39 from './logistics/code-39.js?v=2.8';

const registry = new Map();

/**
 * Registers a generator plugin
 * @param {object} plugin - Generator module
 */
export function registerGenerator(plugin) {
  if (!plugin || !plugin.id) {
    throw new Error('Invalid generator plugin: missing id');
  }
  registry.set(plugin.id, plugin);
}

/**
 * Retrieves a generator by its unique id
 * @param {string} id 
 * @returns {object|undefined}
 */
export function getGenerator(id) {
  return registry.get(id);
}

/**
 * Returns an array of all registered generators
 * @returns {object[]}
 */
export function getAllGenerators() {
  return Array.from(registry.values());
}

/**
 * Filters generators by category
 * @param {string} category - 'all' | '2d' | 'retail' | 'logistics' | 'postal'
 * @returns {object[]}
 */
export function getGeneratorsByCategory(category) {
  if (!category || category === 'all') {
    return getAllGenerators();
  }
  return getAllGenerators().filter(g => g.category === category);
}

/**
 * Returns available categories metadata
 */
export function getCategories() {
  return [
    { id: 'all', name: 'All Formats', count: registry.size },
    { id: '2d', name: '2D Matrix & QR', count: getGeneratorsByCategory('2d').length },
    { id: 'retail', name: 'Retail & POS (1D)', count: getGeneratorsByCategory('retail').length },
    { id: 'logistics', name: 'Logistics & Warehousing', count: getGeneratorsByCategory('logistics').length }
  ];
}

// Initial Registration of Core Plugins
registerGenerator(qrCode);
registerGenerator(dataMatrix);
registerGenerator(aztec);
registerGenerator(pdf417);
registerGenerator(ean13);
registerGenerator(upcA);
registerGenerator(isbn);
registerGenerator(code128);
registerGenerator(itf14);
registerGenerator(code39);
