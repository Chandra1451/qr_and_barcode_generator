/**
 * Checksum Algorithm Unit Tests
 * Verifies GS1 Mod-10, EAN-13, UPC-A, ITF-14, and Luhn algorithms against international test vectors.
 */

import {
  calculateMod10,
  validateMod10,
  computeEan13,
  computeUpcA,
  computeItf14,
  calculateLuhn
} from '../../js/core/checksums.js';

export async function runChecksumTests(assert) {
  // Test 1: GS1 Mod-10 standard vectors
  assert.equal(calculateMod10('590123412345'), 7, 'EAN-13 12-digit base computes check digit 7');
  assert.equal(calculateMod10('01234567890'), 5, 'UPC-A 11-digit base computes check digit 5');
  assert.equal(calculateMod10('1001234567890'), 2, 'ITF-14 13-digit base computes check digit 2');
  assert.equal(calculateMod10('9638507'), 4, 'EAN-8 7-digit base computes check digit 4');
  assert.equal(calculateMod10('400638133393'), 1, 'German product code computes check digit 1');
  assert.equal(calculateMod10('735005385001'), 9, 'Swedish product code computes check digit 9');
  assert.equal(calculateMod10('00000000000'), 0, 'All-zero base computes check digit 0');

  // Test 2: Validation of complete barcode strings
  assert.isTrue(validateMod10('5901234123457'), 'Validates correct EAN-13 string 5901234123457');
  assert.isFalse(validateMod10('5901234123458'), 'Rejects corrupted EAN-13 check digit');
  assert.isTrue(validateMod10('012345678905'), 'Validates correct UPC-A string 012345678905');
  assert.isFalse(validateMod10('012345678909'), 'Rejects corrupted UPC-A check digit');
  assert.isTrue(validateMod10('10012345678902'), 'Validates correct ITF-14 string 10012345678902');
  assert.isFalse(validateMod10('invalid-string'), 'Rejects non-numeric strings');

  // Test 3: Auto-completion helper routines
  assert.equal(computeEan13('590123412345'), '5901234123457', 'Appends 13th digit to 12-digit EAN');
  assert.equal(computeEan13('5901234123459'), '5901234123457', 'Corrects 13th digit on 13-digit EAN');
  assert.equal(computeUpcA('01234567890'), '012345678905', 'Appends 12th digit to 11-digit UPC');
  assert.equal(computeItf14('1001234567890'), '10012345678902', 'Appends 14th digit to 13-digit ITF-14');

  // Test 4: Luhn algorithm test vectors
  assert.equal(calculateLuhn('7992739871'), 3, 'Luhn check digit for 7992739871 is 3');
  assert.equal(calculateLuhn('4992739871'), 6, 'Luhn check digit for 4992739871 is 6');
}
