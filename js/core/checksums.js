/**
 * Pure Mathematical Checksum Routines for GS1 and Standard Barcodes
 * Universal QR, Barcode & Code Generator Suite
 * Zero-dependency pure ES module
 */

/**
 * Calculates GS1 standard Modulo-10 check digit (used in EAN-13, EAN-8, UPC-A, ITF-14)
 * Multiplies alternating digits from right to left by 3 and 1, sums them, and finds mod 10 complement.
 * 
 * @param {string} digits - String of numeric digits (without the check digit)
 * @returns {number} Calculated check digit (0-9)
 */
export function calculateMod10(digits) {
  if (typeof digits !== 'string' || !/^\d+$/.test(digits)) {
    throw new Error('Input must be a numeric string');
  }

  let sum = 0;
  // Starting from the digit immediately before the check digit (rightmost),
  // odd positions from right are multiplied by 3, even by 1.
  for (let i = digits.length - 1, weight = 3; i >= 0; i--, weight = (weight === 3 ? 1 : 3)) {
    sum += parseInt(digits[i], 10) * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates a complete barcode string with its check digit using GS1 Mod-10
 * 
 * @param {string} fullCode - Complete code including check digit
 * @returns {boolean} True if check digit matches
 */
export function validateMod10(fullCode) {
  if (typeof fullCode !== 'string' || !/^\d+$/.test(fullCode) || fullCode.length < 2) {
    return false;
  }
  const payload = fullCode.slice(0, -1);
  const expectedCheckDigit = parseInt(fullCode.slice(-1), 10);
  return calculateMod10(payload) === expectedCheckDigit;
}

/**
 * Automatically appends or corrects the 13th check digit for EAN-13
 * If 12 digits provided, appends the 13th check digit.
 * If 13 digits provided, verifies/corrects the 13th digit.
 * 
 * @param {string} eanInput - 12 or 13 numeric digits
 * @returns {string} 13-digit valid EAN-13 string
 */
export function computeEan13(eanInput) {
  const clean = (eanInput || '').replace(/\D/g, '');
  if (clean.length === 12) {
    return clean + calculateMod10(clean);
  }
  if (clean.length === 13) {
    const base = clean.slice(0, 12);
    return base + calculateMod10(base);
  }
  throw new Error('EAN-13 requires exactly 12 or 13 digits');
}

/**
 * Automatically appends or corrects the 12th check digit for UPC-A
 * If 11 digits provided, appends the 12th check digit.
 * If 12 digits provided, verifies/corrects the 12th digit.
 * 
 * @param {string} upcInput - 11 or 12 numeric digits
 * @returns {string} 12-digit valid UPC-A string
 */
export function computeUpcA(upcInput) {
  const clean = (upcInput || '').replace(/\D/g, '');
  if (clean.length === 11) {
    return clean + calculateMod10(clean);
  }
  if (clean.length === 12) {
    const base = clean.slice(0, 11);
    return base + calculateMod10(base);
  }
  throw new Error('UPC-A requires exactly 11 or 12 digits');
}

/**
 * Automatically appends or corrects the 14th check digit for ITF-14
 * 
 * @param {string} itfInput - 13 or 14 numeric digits
 * @returns {string} 14-digit valid ITF-14 string
 */
export function computeItf14(itfInput) {
  const clean = (itfInput || '').replace(/\D/g, '');
  if (clean.length === 13) {
    return clean + calculateMod10(clean);
  }
  if (clean.length === 14) {
    const base = clean.slice(0, 13);
    return base + calculateMod10(base);
  }
  throw new Error('ITF-14 requires exactly 13 or 14 digits');
}

/**
 * Luhn Algorithm (Mod-10) for Credit Cards and IMEI
 * Multiplies alternating digits by 2, subtracts 9 if > 9.
 * 
 * @param {string} digits - Numeric string
 * @returns {number} Calculated Luhn check digit
 */
export function calculateLuhn(digits) {
  if (typeof digits !== 'string' || !/^\d+$/.test(digits)) {
    throw new Error('Input must be a numeric string');
  }

  let sum = 0;
  for (let i = digits.length - 1, doubleIt = true; i >= 0; i--, doubleIt = !doubleIt) {
    let d = parseInt(digits[i], 10);
    if (doubleIt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}
