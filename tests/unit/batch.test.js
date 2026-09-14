/**
 * Batch Exporter Unit Tests
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Verifies sequence mathematics, CSV parsing, filename sanitization,
 * and dynamic JSZip loading.
 */

import { generateSequenceList, parseCsvOrLines, sanitizeZipFilename } from '../../js/export/batch-exporter.js';
import { loadJsZip } from '../../js/core/dynamic-loader.js';

export async function runBatchTests(assert) {
  // Test 1: Sequence List Generation
  const seq1 = generateSequenceList({ prefix: 'INV-', start: 1, count: 5, padLength: 3 });
  assert.equal(seq1.length, 5, 'Generates exactly 5 items');
  assert.equal(seq1[0], 'INV-001', 'First item is INV-001');
  assert.equal(seq1[4], 'INV-005', 'Last item is INV-005');

  // Test 2: Sequence with Suffix and Different Start
  const seq2 = generateSequenceList({ prefix: 'BOX-', start: 100, count: 3, padLength: 4, suffix: '-US' });
  assert.equal(seq2[0], 'BOX-0100-US', 'Respects 4-digit padding and suffix');
  assert.equal(seq2[1], 'BOX-0101-US', 'Increments properly');
  assert.equal(seq2[2], 'BOX-0102-US', 'Third item correct');

  // Test 3: Clamping limits
  const seqClamped = generateSequenceList({ count: 999 });
  assert.equal(seqClamped.length, 200, 'Clamps batch sequence to 200 items maximum');

  // Test 4: CSV & Multi-line Parsing
  const rawInput = `
    https://github.com
    https://google.com,Search Engine,Active
    "ITEM-0099",Retail Box,29.99
    
    SKU-8821
  `;
  const parsed = parseCsvOrLines(rawInput);
  assert.equal(parsed.length, 4, 'Ignores empty lines and parses 4 items');
  assert.equal(parsed[0], 'https://github.com', 'Parses plain URL');
  assert.equal(parsed[1], 'https://google.com', 'Extracts first column from comma-separated line');
  assert.equal(parsed[2], 'ITEM-0099', 'Strips quotes from CSV cell');
  assert.equal(parsed[3], 'SKU-8821', 'Parses simple text code');

  // Test 5: Filename Sanitization
  const fn1 = sanitizeZipFilename('https://example.com/item/1', 0, 'png');
  assert.equal(fn1, '001_example.com_item_1.png', 'Sanitizes URL into safe filename');

  const fn2 = sanitizeZipFilename('SKU#99-A/B', 9, 'svg');
  assert.equal(fn2, '010_SKU_99-A_B.svg', 'Replaces invalid characters and formats 2-digit index');

  // Test 6: Dynamic JSZip Loading
  const JSZip = await loadJsZip();
  assert.isTrue(typeof JSZip === 'function', 'loadJsZip() resolves JSZip constructor');
  const zip = new JSZip();
  zip.file('test.txt', 'Hello Universal Code Studio');
  const files = Object.keys(zip.files);
  assert.equal(files.length, 1, 'JSZip instance successfully stores in-memory files');
  assert.equal(files[0], 'test.txt', 'Stored filename matches');
}
