export default {
  testRunner: 'command',
  commandRunner: {
    command: 'node tools/run-checksum-tests.mjs',
  },
  mutate: ['js/core/checksums.js'],
  coverageAnalysis: 'off',
  concurrency: 1,
  timeoutMS: 10_000,
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: {
    fileName: 'tests/mutation/reports/index.html',
  },
  jsonReporter: {
    fileName: 'tests/mutation/reports/mutation.json',
  },
};
