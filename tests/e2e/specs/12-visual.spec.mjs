// VISUAL REGRESSION — screenshot baselines for every page (both themes, desktop + phone)
// and for the studio with every generator. First run: `npm run baselines:update`, look at
// the images in baselines/, then commit to them. Later runs fail on any unapproved change.

import { test, expect } from '../support/fixtures.mjs';
import { ALL_PAGES, GENERATORS } from '../support/catalog.mjs';

test.use({ seedStorage: { ucs_cookie_consent: 'acknowledged', ucm_laser_fx: 'false', ucm_accent: 'crimson' } });

const VIEWPORTS = { desktop: { width: 1366, height: 900 }, phone: { width: 375, height: 812 } };

async function prepare(page) {
  // Freeze anything that moves or changes between runs.
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} .adsbygoogle,#toast-container,#recent-history-container{visibility:hidden!important}' });
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
          await expect(page).toHaveScreenshot(`${p.replace(/[/.]/g, '_')}-${vpName}-${theme}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
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
