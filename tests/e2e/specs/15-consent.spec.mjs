// CONSENT — Google Analytics loads only after consent (basic consent mode).
//
// js/core/consent-analytics.js waits for Google's consent message (delivered by the AdSense
// tag) to run its CONSENT_MODE_DATA_READY callbacks, then loads gtag.js only when the
// analytics-storage status is GRANTED (1) or NOT_APPLICABLE (3). Here the AdSense tag is
// replaced by a fake that implements the documented googlefc API with a chosen status
// (https://developers.google.com/funding-choices/fc-api-docs). The real message is checked
// on the live site with ?fc=alwaysshow&fctype=gdpr.

import { test, expect } from '../support/fixtures.mjs';

const ADSENSE = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/;
const GTAG = /googletagmanager\.com\/gtag\/js/;

const STATUS = { UNKNOWN: 0, GRANTED: 1, DENIED: 2, NOT_APPLICABLE: 3, NOT_CONFIGURED: 4 };

/** A stand-in for Google's consent script: answers every queued callback with `status`. */
function fakeConsentScript(status, gdprApplies) {
  return `(function () {
    var fc = window.googlefc = window.googlefc || {};
    fc.ConsentModePurposeStatusEnum = ${JSON.stringify(STATUS)};
    fc.getGoogleConsentModeValues = function () {
      return { adStoragePurposeConsentStatus: ${status}, adUserDataPurposeConsentStatus: ${status},
               adPersonalizationPurposeConsentStatus: ${status}, analyticsStoragePurposeConsentStatus: ${status} };
    };
    fc.showRevocationMessage = function () { window.__revocationShown = (window.__revocationShown || 0) + 1; };
    window.__tcfapi = function (cmd, version, cb) {
      if (cmd === 'addEventListener') cb({ gdprApplies: ${gdprApplies}, listenerId: 1 }, true);
    };
    function run(item) {
      if (typeof item === 'function') { item(); return; }
      for (var key in item) item[key]();
    }
    var queued = fc.callbackQueue || [];
    fc.callbackQueue = { push: function () { for (var i = 0; i < arguments.length; i++) run(arguments[i]); } };
    for (var i = 0; i < queued.length; i++) run(queued[i]);
  })();`;
}

async function useFakeConsent(page, status, gdprApplies = false) {
  await page.route(ADSENSE, (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fakeConsentScript(status, gdprApplies) }),
  );
}

/** Loads the page and reports whether gtag.js was requested (it loads after window 'load'). */
async function analyticsRequested(page, url, netLog) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  return netLog.some((r) => GTAG.test(r.url));
}

const PAGES = ['/', '/privacy-policy.html', '/pages/ean-13-barcode-generator.html'];
const CASES = [
  { name: 'GRANTED', status: STATUS.GRANTED, loads: true },
  { name: 'NOT_APPLICABLE (EU rules do not apply)', status: STATUS.NOT_APPLICABLE, loads: true },
  { name: 'DENIED', status: STATUS.DENIED, loads: false },
  { name: 'UNKNOWN', status: STATUS.UNKNOWN, loads: false },
  { name: 'NOT_CONFIGURED', status: STATUS.NOT_CONFIGURED, loads: false },
];

test.describe('CONSENT · Analytics load rule', () => {
  for (const url of PAGES) {
    for (const c of CASES) {
      test(`CON-01 ${url}: ${c.name} → Analytics ${c.loads ? 'loads' : 'never loads'}`, async ({ page, netLog }) => {
        await useFakeConsent(page, c.status);
        expect(await analyticsRequested(page, url, netLog)).toBe(c.loads);
      });
    }

    test(`CON-02 ${url}: no answer from Google's consent script → Analytics never loads`, async ({ page, netLog }) => {
      // The fixtures serve an empty AdSense script: the message is blocked or not served.
      expect(await analyticsRequested(page, url, netLog)).toBe(false);
    });
  }
});

test.describe('CONSENT · what Analytics receives', () => {
  test('CON-03 code content in a deep link (?data=, ?payload=) is removed from the page address', async ({ page, netLog }) => {
    await useFakeConsent(page, STATUS.GRANTED);
    expect(await analyticsRequested(page, '/?symbology=code128&data=SECRET-SKU-1&payload=SECRET-2', netLog)).toBe(true);
    const entries = await page.evaluate(() => Array.from(window.dataLayer, (args) => Array.from(args)));
    const config = entries.find((a) => a[0] === 'config');
    expect(config[1]).toBe('G-0MD85STYZT');
    expect(config[2].page_location).toMatch(/\?symbology=code128$/);
    expect(JSON.stringify(entries)).not.toContain('SECRET');
    expect(netLog.filter((r) => GTAG.test(r.url)).map((r) => r.url).join(' ')).not.toContain('SECRET');
  });

  test('CON-04 Analytics is configured once, after the page has loaded', async ({ page, netLog }) => {
    await useFakeConsent(page, STATUS.GRANTED);
    await analyticsRequested(page, '/about.html', netLog);
    const configs = await page.evaluate(() =>
      Array.from(window.dataLayer, (args) => Array.from(args)).filter((a) => a[0] === 'config').length);
    expect(configs).toBe(1);
    expect(netLog.filter((r) => GTAG.test(r.url))).toHaveLength(1);
  });
});

test.describe('CONSENT · "Privacy and cookie settings" link', () => {
  test('CON-05 shown where EU rules apply; re-opens Google\'s message without leaving the page', async ({ page }) => {
    await useFakeConsent(page, STATUS.DENIED, true);
    await page.goto('/terms.html');
    const link = page.locator('.js-consent-settings a');
    await expect(link).toBeVisible();
    await link.click();
    expect(await page.evaluate(() => window.__revocationShown)).toBe(1);
    expect(new URL(page.url()).pathname).toBe('/terms.html');
  });

  test('CON-06 the privacy policy has its own settings button where EU rules apply', async ({ page }) => {
    await useFakeConsent(page, STATUS.GRANTED, true);
    await page.goto('/privacy-policy.html#consent');
    const button = page.locator('#consent .js-consent-settings button');
    await expect(button).toBeVisible();
    await button.click();
    expect(await page.evaluate(() => window.__revocationShown)).toBe(1);
  });

  test('CON-07 hidden where EU rules do not apply, and when Google\'s script never answers', async ({ page }) => {
    await useFakeConsent(page, STATUS.NOT_APPLICABLE, false);
    await page.goto('/pages/wifi-qr-code-generator.html');
    await expect(page.locator('.js-consent-settings')).toHaveCount(1);
    await expect(page.locator('.js-consent-settings')).toBeHidden();
    await page.unroute(ADSENSE);
    await page.goto('/');
    await expect(page.locator('.js-consent-settings').first()).toBeHidden();
  });

  test('CON-08 our old "I Understand" notice is gone', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await expect(page.locator('#cookie-consent-banner')).toHaveCount(0);
  });
});
