// Read-only diagnostic for Google's live Funding Choices consent message.
// This is intentionally separate from CI: the result depends on Google's serving,
// the AdSense account state, geography and the live site's current configuration.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const input = process.argv[2] || 'https://universalcodemaker.com/';
const target = new URL(input);
if (!['http:', 'https:'].includes(target.protocol)) {
  throw new Error('The CMP check URL must use http or https.');
}
target.search = '';
target.searchParams.set('fc', 'alwaysshow');
target.searchParams.set('fctype', 'gdpr');

const reportDir = path.resolve('reports', 'cmp');
const screenshotPath = path.join(reportDir, 'cmp-live.png');
const jsonPath = path.join(reportDir, 'cmp-live.json');
fs.mkdirSync(reportDir, { recursive: true });

const channel = process.env.UCM_BROWSER_CHANNEL;
const browser = await chromium.launch(channel && channel !== 'chromium' ? { channel } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const googleRequests = new Set();

page.on('request', (request) => {
  if (!/fundingchoices|googlefc|googlesyndication/i.test(request.url())) return;
  const url = new URL(request.url());
  googleRequests.add(`${url.origin}${url.pathname}`);
});

let result;
try {
  let response = await page.goto(target.href, { waitUntil: 'load', timeout: 60_000 });
  if (response?.status() === 403) {
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    response = await page.reload({ waitUntil: 'load', timeout: 60_000 });
  }

  await page.waitForTimeout(10_000);
  const selector = '.fc-consent-root, .fc-dialog-container, [class*="fc-consent"]';
  const cmpFrames = [];
  let dialogText = '';
  for (const frame of page.frames()) {
    const evidence = await frame.locator(selector).evaluateAll((nodes) => {
      const visible = nodes.find((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      return visible?.innerText?.replace(/\s+/g, ' ').trim().slice(0, 500) || '';
    }).catch(() => '');
    if (!evidence) continue;
    const frameUrl = new URL(frame.url());
    frameUrl.search = '';
    cmpFrames.push(frameUrl.href);
    if (!dialogText) dialogText = evidence;
  }
  const apis = await page.evaluate(() => ({
    tcfApiAvailable: typeof window.__tcfapi === 'function',
    googlefcAvailable: typeof window.googlefc === 'object',
  }));

  await page.screenshot({ path: screenshotPath });
  result = {
    verdict: cmpFrames.length > 0 ? 'PASS' : 'FAIL',
    checkedAt: new Date().toISOString(),
    url: target.href,
    httpStatus: response?.status() ?? null,
    consentDialogFound: cmpFrames.length > 0,
    dialogText,
    cmpFrames,
    ...apis,
    googleRequests: [...googleRequests].sort(),
    screenshot: path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
} finally {
  await browser.close();
}

console.log(`CMP CHECK: ${result.verdict}`);
console.log(`URL: ${result.url}`);
console.log(`HTTP: ${result.httpStatus}`);
console.log(`Dialog: ${result.consentDialogFound ? 'found' : 'not found'}`);
console.log(`APIs: __tcfapi=${result.tcfApiAvailable}, googlefc=${result.googlefcAvailable}`);
console.log(`Google requests: ${result.googleRequests.length}`);
console.log(`Report: ${path.relative(process.cwd(), jsonPath)}`);
console.log(`Screenshot: ${result.screenshot}`);
if (result.dialogText) console.log(`Dialog text: ${result.dialogText}`);

if (result.httpStatus === null || result.httpStatus >= 400) process.exitCode = 2;
else if (!result.consentDialogFound) process.exitCode = 1;
