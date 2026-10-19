#!/usr/bin/env node

import { runChecksumTests } from '../tests/unit/checksums.test.js';

let assertions = 0;
const fail = (message, actual, expected) => {
  throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};
const assert = {
  equal(actual, expected, message) {
    assertions++;
    if (actual !== expected) fail(message, actual, expected);
  },
  isTrue(actual, message) {
    assertions++;
    if (actual !== true) fail(message, actual, true);
  },
  isFalse(actual, message) {
    assertions++;
    if (actual !== false) fail(message, actual, false);
  },
};

try {
  await runChecksumTests(assert);
  if (assertions !== 19) throw new Error(`checksum assertion count changed: expected 19, got ${assertions}`);
  console.log(`CHECKSUM TESTS: ${assertions}/${assertions} passed`);
} catch (error) {
  console.error(`CHECKSUM TESTS: FAIL - ${error.message}`);
  process.exitCode = 1;
}
