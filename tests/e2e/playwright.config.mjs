// Playwright configuration for the UniversalCodeMaker E2E suite.
//
// Runs against a local static server by default (started automatically).
// Set UCM_BASE_URL to run against another host, e.g. the live site:
//   PowerShell:  $env:UCM_BASE_URL = "https://universalcodemaker.com"; npx playwright test --project=desktop
//
// Uses Playwright's bundled Chromium (the engine of Google Chrome) by default (owner decision
// 2026-10-12). Microsoft Edge in automation opens its downloads panel after a page's first
// download and then delays or swallows the next one, which made download tests flaky (kit 14 #27).
// The "edge-smoke" project still runs the smoke tests in the installed Microsoft Edge.
// Set UCM_BROWSER_CHANNEL=msedge or =chrome to run everything in that browser instead.

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.UCM_PORT || 8099);
const externalBaseUrl = process.env.UCM_BASE_URL?.replace(/\/$/, '');
const baseURL = externalBaseUrl || `http://127.0.0.1:${PORT}`;
const channel = !process.env.UCM_BROWSER_CHANNEL || process.env.UCM_BROWSER_CHANNEL === 'chromium' ? undefined : process.env.UCM_BROWSER_CHANNEL;

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
    {
      // A short check in the installed Microsoft Edge on every full run (the main suite runs in Chromium).
      name: 'edge-smoke',
      testMatch: /01-smoke\.spec\.mjs/,
      use: { ...devices['Desktop Edge'], ...browserUse, channel: 'msedge', viewport: { width: 1366, height: 900 } },
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
