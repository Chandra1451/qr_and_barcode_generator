// Playwright configuration for the UniversalCodeMaker E2E suite.
//
// Runs against a local static server by default (started automatically).
// Set UCM_BASE_URL to run against another host, e.g. the live site:
//   PowerShell:  $env:UCM_BASE_URL = "https://universalcodemaker.com"; npx playwright test --project=desktop
//
// Uses the installed Microsoft Edge (channel "msedge"), so no browser download is
// needed. Set UCM_BROWSER_CHANNEL=chromium (after `npx playwright install chromium`)
// or UCM_BROWSER_CHANNEL=chrome to switch.

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.UCM_PORT || 8099);
const externalBaseUrl = process.env.UCM_BASE_URL?.replace(/\/$/, '');
const baseURL = externalBaseUrl || `http://127.0.0.1:${PORT}`;
const channel = process.env.UCM_BROWSER_CHANNEL === 'chromium' ? undefined : (process.env.UCM_BROWSER_CHANNEL || 'msedge');

const browserUse = {
  channel,
  baseURL,
  acceptDownloads: true,
  serviceWorkers: 'block',
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
};

export default defineConfig({
  testDir: './specs',
  outputDir: './reports/artifacts',
  snapshotPathTemplate: '{testDir}/../baselines/{testFileName}/{arg}-{projectName}{ext}',

  timeout: 90_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries on purpose: a test that passes only on retry is a flaky site behaviour
  // (for example the "controls do nothing after load" bug), and we want to see it.
  retries: 0,
  workers: process.env.UCM_WORKERS ? Number(process.env.UCM_WORKERS) : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  projects: [
    {
      // Pure file-system checks. No browser is launched.
      name: 'static',
      testMatch: /00-static\.spec\.mjs/,
    },
    {
      name: 'desktop',
      testIgnore: [/00-static\.spec\.mjs/, /12-visual\.spec\.mjs/],
      use: { ...devices['Desktop Chrome'], ...browserUse, viewport: { width: 1366, height: 900 } },
    },
    {
      // Real phone emulation (touch, DPR, 412px). Layout/consistency specs, plus the scanner (mostly used on phones).
      name: 'phone',
      testMatch: [/01-smoke\.spec\.mjs/, /10-consistency\.spec\.mjs/, /14-scanner\.spec\.mjs/],
      use: { ...devices['Pixel 7'], ...browserUse },
    },
    {
      name: 'visual',
      testMatch: /12-visual\.spec\.mjs/,
      use: { ...devices['Desktop Chrome'], ...browserUse, viewport: { width: 1366, height: 900 } },
    },
  ],

  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'node support/static-server.mjs',
        url: `http://127.0.0.1:${PORT}/index.html`,
        reuseExistingServer: true,
        timeout: 20_000,
        env: { UCM_PORT: String(PORT) },
      },
});
