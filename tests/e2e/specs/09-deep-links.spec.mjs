// DEEP LINKS — every "Open in studio" link on every page lands in the promised state.

import { test, expect } from '../support/fixtures.mjs';
import { ALL_PAGES, LANDING_PAGES, SYMBOLOGY_ALIASES, GENERATORS, WIZARDS, readSiteFile } from '../support/catalog.mjs';

/** All distinct studio links across the site: [{ from, href }] */
function studioLinks() {
  const links = new Map();
  for (const p of ALL_PAGES) {
    for (const m of readSiteFile(p).matchAll(/href="((?:\.\.\/)?index\.html\?[^"]+)"/g)) {
      const query = m[1].replace(/&amp;/g, '&').split('?')[1];
      if (!links.has(query)) links.set(query, p);
    }
  }
  return [...links.entries()].map(([query, from]) => ({ query, from }));
}

function expectedState(query) {
  const params = new URLSearchParams(query);
  const sym = params.get('symbology') || params.get('format');
  const generatorId = sym ? (SYMBOLOGY_ALIASES[sym.toLowerCase()] || sym) : 'qr-code';
  return {
    generatorId: GENERATORS.some((g) => g.id === generatorId) ? generatorId : 'qr-code',
    wizardId: generatorId === 'qr-code' ? params.get('wizard') || 'url' : null,
    payload: params.get('data') || params.get('payload'),
    preset: params.get('preset'),
    label: !!(params.get('label') || params.get('labelmaker') || params.get('preset')),
    batch: ['open', 'true'].includes(params.get('batch')),
  };
}

test.describe('LINK · studio links used on the site', () => {
  for (const { query, from } of studioLinks()) {
    test(`LINK-01 ?${query} (from ${from})`, async ({ studio, page }) => {
      await studio.open(`?${query}`);
      const want = expectedState(query);
      const state = await studio.appState();
      expect(state.generatorId, 'wrong format opened').toBe(want.generatorId);
      await expect(studio.symbologySelect).toHaveValue(want.generatorId);
      if (want.wizardId) {
        expect(state.wizardId, 'wrong QR wizard opened').toBe(want.wizardId);
        await expect(page.locator(`.wiz-tab-btn[data-wizard="${want.wizardId}"]`)).toHaveClass(/active/);
      }
      if (want.payload && want.generatorId !== 'qr-code') await expect(studio.payloadInput).toHaveValue(want.payload);
      if (want.label) await expect(page.locator('#label-maker-modal')).toHaveClass(/open/);
      if (want.preset) await expect(page.locator('#label-preset-select')).toHaveValue(want.preset);
      if (want.batch) await expect(page.locator('#batch-modal')).toHaveClass(/open/);
      await studio.expectNoRenderError();
    });
  }
});

test.describe('LINK · clicking the real CTA on each landing page', () => {
  for (const p of LANDING_PAGES) {
    test(`LINK-02 ${p}: primary CTA opens a working studio`, async ({ page, studio }) => {
      await page.goto(`/${p}`);
      const cta = page.locator('main a[href*="index.html"]').first();
      await expect(cta, 'landing page has no link into the studio').toHaveCount(1);
      await cta.click();
      await page.waitForURL(/index\.html/);
      await studio.waitForStableRender();
      await studio.expectNoRenderError();
    });
  }
});

test.describe('LINK · parameter handling', () => {
  for (const [alias, id] of Object.entries(SYMBOLOGY_ALIASES)) {
    test(`LINK-10 alias ?symbology=${alias} opens ${id}`, async ({ studio }) => {
      await studio.open(`?symbology=${alias}`);
      await expect(studio.symbologySelect).toHaveValue(id);
    });
  }

  for (const w of WIZARDS) {
    test(`LINK-11 ?wizard=${w.id} opens that wizard`, async ({ studio, page }) => {
      await studio.open(`?wizard=${w.id}`);
      await expect(page.locator(`.wiz-tab-btn[data-wizard="${w.id}"]`)).toHaveClass(/active/);
    });
  }

  test('LINK-12 ?data= prefills a barcode payload and renders it', async ({ studio }) => {
    await studio.open('?symbology=code-128&data=DEEP-LINK-42');
    await expect(studio.payloadInput).toHaveValue('DEEP-LINK-42');
    expect(await studio.decodePreview()).toBe('DEEP-LINK-42');
  });

  test('LINK-13 unknown values fall back safely (no error, default studio)', async ({ studio }) => {
    await studio.open('?symbology=not-a-code&wizard=nope&preset=missing');
    expect((await studio.appState()).generatorId).toBe('qr-code');
    // The URL form is shown, so the URL tab must be the highlighted one.
    await expect(studio.page.locator('.wiz-tab-btn.active'), 'no wizard tab is highlighted after an unknown ?wizard=').toHaveCount(1);
    await expect(studio.page.locator('.wiz-tab-btn[data-wizard="url"]')).toHaveClass(/active/);
    await studio.expectNoRenderError();
  });

  test('LINK-14 invalid ?data= for a strict format shows the validation error', async ({ studio }) => {
    await studio.open('?symbology=ean-13&data=NOT-DIGITS', { waitForRender: false });
    await studio.page.waitForTimeout(800);
    await expect(studio.validationStatus.locator('.status-invalid')).toBeVisible();
  });

  test('LINK-15 /v2/ redirects to the studio and keeps the query string', async ({ page }) => {
    await page.goto('/v2/index.html?symbology=aztec');
    await page.waitForURL(/\/index\.html\?symbology=aztec$/);
    await expect(page.locator('#symbology-select')).toHaveValue('aztec');
  });
});
