// VISUAL REGRESSION — screenshot baselines for every page (both themes, desktop + phone)
// and for the studio with every generator. First run: `npm run baselines:update`, look at
// the images in baselines/, then commit to them. Later runs fail on any unapproved change.

import { test, expect } from '../support/fixtures.mjs';
import { ALL_PAGES, GENERATORS } from '../support/catalog.mjs';

test.use({ seedStorage: { ucm_laser_fx: 'false', ucm_accent: 'crimson' } });

const VIEWPORTS = { desktop: { width: 1366, height: 900 }, phone: { width: 375, height: 812 } };

async function prepare(page) {
  // Freeze anything that moves or changes between runs.
  // The Recents box fills in ~1.2 s after the first render (history save), adding ~124 px to the page:
  // remove it from the layout (display:none), or the screenshot depends on timing (found 2026-10-11).
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} .adsbygoogle,#toast-container{visibility:hidden!important} #recent-history-container{display:none!important}' });
  await page.evaluate(() => document.fonts.ready);
}

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of ['light', 'dark']) {
    test.describe(`VIS · ${vpName} · ${theme}`, () => {
      test.use({ viewport });
      for (const p of ALL_PAGES) {
        test(`VIS-01 ${p}`, async ({ page }) => {
          await page.addInitScript((t) => localStorage.setItem('ucm_theme', t), theme);
          await page.goto(`/${p}`);
          await page.waitForLoadState('networkidle');
          await prepare(page);
          // Capture exactly the page's height: Chromium's full-page capture of the ~15,000 px docs page
          // sometimes came out 35 px taller (footer background only), so the screenshot never settled.
          const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
          await expect(page).toHaveScreenshot(`${p.replace(/[/.]/g, '_')}-${vpName}-${theme}.png`, { fullPage: true, clip: { x: 0, y: 0, ...size }, maxDiffPixelRatio: 0.01 });
        });
      }
    });
  }
}

test.describe('VIS · studio stage per generator', () => {
  for (const g of GENERATORS) {
    test(`VIS-02 ${g.id} default preview stage`, async ({ page, studio }) => {
      await studio.open(`?symbology=${g.id}`);
      await prepare(page);
      await expect(page.locator('#preview-stage')).toHaveScreenshot(`stage-${g.id}.png`);
      const controls = g.id === 'qr-code' ? '#qr-wizard-section' : '#dynamic-controls-deck';
      await expect(page.locator(controls)).toHaveScreenshot(`controls-${g.id}.png`);
    });
  }
});
