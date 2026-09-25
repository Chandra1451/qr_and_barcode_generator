// Shared Playwright fixtures:
//  - blocks ads/analytics/Google Fonts so runs are deterministic and private
//  - pre-acknowledges the cookie banner so it never covers buttons
//  - fails any test that produced a console error, page error or failed same-origin request
//  - exposes `studio` (page object for index.html) and `netLog` (every request made)

import { test as base, expect } from '@playwright/test';
import { Studio } from './studio.mjs';

export { expect };

const THIRD_PARTY_STUBS = [
  { pattern: /googlesyndication\.com|doubleclick\.net|adservice\.google|googletagmanager\.com|google-analytics\.com/, type: 'text/javascript', body: '' },
  { pattern: /fonts\.googleapis\.com/, type: 'text/css', body: '' },
  { pattern: /fonts\.gstatic\.com/, type: 'font/woff2', body: '' },
];

/** Console messages that are never the site's fault. */
const GLOBAL_CONSOLE_ALLOWLIST = [
  /Download the React DevTools/i,
  /\[Violation\]/i,
];

export const test = base.extend({
  /** Extra console-error patterns a test may tolerate: test.use({ allowConsoleErrors: [/.../] }) */
  allowConsoleErrors: [[], { option: true }],

  /** localStorage values seeded before any site script runs (only if the key is not already set). */
  seedStorage: [{ ucs_cookie_consent: 'acknowledged' }, { option: true }],

  netLog: async ({}, use) => {
    await use([]);
  },

  // Context-level so pages opened later with context.newPage() get the same setup.
  context: async ({ context, seedStorage }, use) => {
    for (const stub of THIRD_PARTY_STUBS) {
      await context.route(stub.pattern, (route) =>
        route.fulfill({ status: 200, contentType: stub.type, body: stub.body }),
      );
    }
    await context.addInitScript((seed) => {
      try {
        for (const [k, v] of Object.entries(seed)) {
          if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
        }
      } catch {
        /* storage may be unavailable (e.g. about:blank) */
      }
    }, seedStorage);
    await use(context);
  },

  page: async ({ page, netLog }, use) => {
    page.on('request', (req) => {
      netLog.push({ url: req.url(), method: req.method(), postData: req.postData() || '' });
    });

    await use(page);
  },

  // Automatic guard: runs for every test that uses `page`.
  consoleGuard: [
    async ({ page, allowConsoleErrors, baseURL }, use, testInfo) => {
      const problems = [];
      const allow = [...GLOBAL_CONSOLE_ALLOWLIST, ...allowConsoleErrors];
      const isAllowed = (text) => allow.some((re) => re.test(text));

      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isAllowed(msg.text())) {
          problems.push(`console.error: ${msg.text()}`);
        }
      });
      page.on('pageerror', (err) => {
        if (!isAllowed(err.message)) problems.push(`uncaught exception: ${err.message}`);
      });
      page.on('response', (res) => {
        const url = res.url();
        if (baseURL && url.startsWith(baseURL) && res.status() >= 400 && !isAllowed(url)) {
          problems.push(`HTTP ${res.status()} for ${url}`);
        }
      });
      page.on('requestfailed', (req) => {
        const url = req.url();
        const reason = req.failure()?.errorText || '';
        // Downloads and aborted navigations are not failures.
        if (/ERR_ABORTED|net::ERR_BLOCKED_BY_CLIENT/.test(reason)) return;
        if (baseURL && url.startsWith(baseURL) && !isAllowed(url)) problems.push(`request failed: ${url} (${reason})`);
      });

      await use();

      if (problems.length) {
        await testInfo.attach('console-and-network-problems', { body: problems.join('\n'), contentType: 'text/plain' });
      }
      expect(problems, 'The page logged errors or had failing requests during this test').toEqual([]);
    },
    { auto: true },
  ],

  studio: async ({ page }, use) => {
    await use(new Studio(page));
  },
});
