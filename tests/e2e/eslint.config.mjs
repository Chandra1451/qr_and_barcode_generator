// eslint.config.tests.mjs: lint rules for Playwright test code (kit core 05, defence D3).
// Copy next to the tests' package.json as eslint.config.mjs; install: npm i -D eslint eslint-plugin-playwright
// (checked 2026-10-14: eslint 10.12.0, eslint-plugin-playwright 2.12.1, both MIT). Run: npx eslint .
// Every rule below exists in the plugin's README (checked 2026-10-14). A rule is switched off for a line only
// with an eslint-disable comment that says why; those comments are reviewed like skips.
import playwright from 'eslint-plugin-playwright';

const recommended = playwright.configs['flat/recommended'];

export default [
  { ignores: ['node_modules/**', 'reports/**', 'baselines/**', 'test-results/**', 'playwright-report/**'] },
  {
    ...recommended,
    files: ['**/*.spec.{js,mjs,ts}', 'support/**/*.{js,mjs,ts}'],
    rules: {
      ...recommended.rules,
      'playwright/expect-expect': ['error', {
        // These helpers contain the assertions for reliability/security tests.
        assertFunctionNames: ['expectMatchesReference', 'expectNoXss', 'waitForChange'],
      }],
      // Conditional skips are protected by test-integrity.mjs and require an inventory reason.
      'playwright/no-skipped-test': 'off',
      'playwright/no-focused-test': 'error', // .only silently drops every other test
      // Registry-driven tests intentionally branch by format; keep these visible for review without
      // treating every product-specific path as a weak test.
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-conditional-expect': 'warn',
      'playwright/missing-playwright-await': 'error', // an un-awaited expect can't fail the test
      // Existing waits cover debounces, history persistence and deliberate loading races.
      'playwright/no-wait-for-timeout': 'warn',
      // Page-wide smoke/visual audits currently use network quiescence, and two state comparisons
      // intentionally read values after an explicit interaction. Keep both visible for later cleanup.
      'playwright/no-networkidle': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/no-force-option': 'error', // force-clicking hides elements a user couldn't click
    },
  },
];
