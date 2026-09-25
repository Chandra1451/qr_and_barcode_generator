// BOOT RELIABILITY — "sometimes after the site loads, the settings bars don't change the preview".
//
// Every scenario loads the studio in a way real visitors do (cold, warm cache, slow engine
// download, slow CPU, early interaction, back/forward, returning visitor), moves a control,
// and checks that the preview (a) changes and (b) ends up identical to a clean render of
// the same settings. Each scenario repeats UCM_BOOT_ITERATIONS times (default 5), because
// the bug is intermittent. Retries are disabled in the config so a flaky pass is a fail.

import { test, expect } from '../support/fixtures.mjs';
import { Studio, referenceFingerprint, sameImage } from '../support/studio.mjs';
import { BARCODE_GENERATORS } from '../support/catalog.mjs';

const ITERATIONS = Number(process.env.UCM_BOOT_ITERATIONS || 5);
const iterations = Array.from({ length: ITERATIONS }, (_, i) => i + 1);

/** Load early (DOM ready only), grab the padding slider as soon as it exists, and move it. */
async function interactEarly(studio, query, sliderId = 'padding', presses = 4) {
  await studio.page.goto(`/index.html${query}`, { waitUntil: 'domcontentloaded' });
  await studio.control(sliderId).waitFor({ state: 'attached' });
  await studio.nudgeSlider(sliderId, 'ArrowRight', presses);
  const value = await studio.control(sliderId).inputValue();
  await studio.page.waitForTimeout(400);
  return value;
}

async function expectMatchesReference(studio, context, query, controls, label) {
  const actual = await studio.waitForStableRender();
  const expected = await referenceFingerprint(context, { query, controls });
  expect(sameImage(actual, expected),
    `${label}: preview does not match a clean render of ${JSON.stringify(controls)} ` +
      `(got ${actual.width}x${actual.height}, expected ${expected.width}x${expected.height}). ` +
      `The control moved but the preview kept older settings.`,
  ).toBe(true);
}

test.describe('BOOT · controls work immediately after page load', () => {
  for (const i of iterations) {
    test(`BOOT-01 [run ${i}] cold load → move slider → preview updates`, async ({ studio, context }) => {
      await studio.open('?symbology=pdf417');
      const before = await studio.fingerprint();
      await studio.nudgeSlider('padding', 'ArrowRight', 5);
      await studio.waitForChange(before, { what: 'moving Quiet Zone Padding with the keyboard' });
      const value = Number(await studio.control('padding').inputValue());
      expect(await studio.badgeText('padding')).toBe(`${value}px`);
      await expectMatchesReference(studio, context, '?symbology=pdf417', { padding: value }, 'cold load');
    });

    test(`BOOT-02 [run ${i}] interaction before the first render finishes`, async ({ studio, context }) => {
      const value = await interactEarly(studio, '?symbology=code-128');
      expect((await studio.appState()).options.padding, 'app state did not receive the slider value').toBe(Number(value));
      await expectMatchesReference(studio, context, '?symbology=code-128', { padding: Number(value) }, 'early interaction');
    });

    test(`BOOT-03 [run ${i}] slow engine download (vendor scripts delayed 2.5 s)`, async ({ studio, context, page }) => {
      await page.route(/\/js\/vendor\/(bwip-js-min|qr-code-styling)\.js/, async (route) => {
        await new Promise((r) => setTimeout(r, 2500));
        await route.continue();
      });
      const value = await interactEarly(studio, '?symbology=ean-13');
      await expectMatchesReference(studio, context, '?symbology=ean-13', { padding: Number(value) }, 'slow engine');
    });

    test(`BOOT-04 [run ${i}] slow CPU (6x throttling)`, async ({ studio, context, page }) => {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
      const value = await interactEarly(studio, '?symbology=data-matrix', 'scale', 2);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await expectMatchesReference(studio, context, '?symbology=data-matrix', { scale: Number(value) }, 'slow CPU');
    });
  }
});

test.describe('BOOT · reloads, cache and navigation', () => {
  test('BOOT-05 warm-cache reload and hard reload both keep controls working', async ({ studio, page }) => {
    await studio.open('?symbology=upc-a');
    for (const mode of ['reload', 'hard-reload']) {
      if (mode === 'hard-reload') {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      }
      await page.reload();
      await studio.waitForStableRender();
      const before = await studio.fingerprint();
      await studio.nudgeSlider('height', 'ArrowRight', 5);
      await studio.waitForChange(before, { what: `moving Bar Height after ${mode}` });
    }
  });

  test('BOOT-06 back/forward cache: controls still work after returning to the studio', async ({ studio, page }) => {
    await studio.open('?symbology=code-39');
    await page.locator('a[href="about.html"], a[href="./about.html"]').first().click();
    await page.waitForURL(/about\.html/);
    await page.goBack();
    await page.waitForURL(/index\.html/);
    const before = await studio.waitForStableRender();
    await studio.nudgeSlider('padding', 'ArrowLeft', 5);
    await studio.waitForChange(before, { what: 'moving padding after browser Back' });
  });

  test('BOOT-07 returning visitor (dark theme, accent, history saved) — controls work', async ({ context, page }) => {
    await context.addInitScript(() => {
      localStorage.setItem('ucm_theme', 'dark');
      localStorage.setItem('ucm_accent', 'emerald');
      localStorage.setItem('ucm_laser_fx', 'false');
      localStorage.setItem('ucm_recent_history', JSON.stringify([
        { generatorId: 'ean-13', name: 'EAN-13', payload: '590123412345', timestamp: 1 },
        { generatorId: 'qr-code', name: 'QR Code', payload: 'https://example.com', timestamp: 2 },
      ]));
    });
    const studio = new Studio(page);
    await studio.open('?symbology=itf-14');
    const before = await studio.fingerprint();
    await studio.nudgeSlider('scale', 'ArrowLeft', 1);
    await studio.waitForChange(before, { what: 'moving Scale for a returning visitor' });
  });

  test('BOOT-08 corrupted localStorage does not break the studio', async ({ context, page }) => {
    await context.addInitScript(() => {
      localStorage.setItem('ucm_recent_history', '{not json');
      localStorage.setItem('ucm_accent', 'no-such-accent');
      localStorage.setItem('ucm_theme', 'purple');
    });
    const studio = new Studio(page);
    await studio.open();
    const before = await studio.fingerprint();
    await studio.setControl('qrPadding', 30);
    await studio.waitForChange(before, { what: 'QR padding with corrupted storage' });
  });
});

test.describe('BOOT · QR styling bars work right after load', () => {
  for (const i of iterations) {
    test(`BOOT-09 [run ${i}] QR padding slider, dot style and colour react on first use`, async ({ studio }) => {
      await studio.page.goto('/index.html', { waitUntil: 'domcontentloaded' });
      await studio.control('qrPadding').waitFor({ state: 'attached' });
      const first = await studio.waitForStableRender();

      await studio.setControl('qrPadding', 0);
      const afterPadding = await studio.waitForChange(first, { what: 'QR padding → 0' });

      await studio.setControl('dotsType', 'square');
      const afterDots = await studio.waitForChange(afterPadding, { what: 'dot style → square' });

      await studio.setControl('dotsColor', '#b91c1c');
      await studio.waitForChange(afterDots, { what: 'dot colour → red' });
    });
  }
});

test.describe('BOOT · every generator reacts to its first slider on a fresh load', () => {
  for (const g of BARCODE_GENERATORS) {
    const slider = g.controls.find((c) => c.type === 'slider');
    if (!slider) continue;
    test(`BOOT-10 ${g.id}: "${slider.label}" changes the preview on first use`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      const before = await studio.fingerprint();
      const target = slider.default === slider.max ? slider.min : slider.max;
      await studio.setControl(slider.id, target);
      await studio.waitForChange(before, { what: `${slider.id} ${slider.default} → ${target}` });
    });
  }
});

test('BOOT-11 rapid generator switching leaves controls bound to the current generator', async ({ studio, context }) => {
  await studio.open();
  for (const id of ['ean-13', 'pdf417', 'code-128', 'aztec', 'upc-a']) {
    await studio.symbologySelect.selectOption(id); // no waiting between switches on purpose
  }
  await expect(studio.symbologySelect).toHaveValue('upc-a');
  await studio.waitForStableRender();
  await studio.setControl('padding', 0);
  await studio.page.waitForTimeout(400);
  expect((await studio.appState()).generatorId).toBe('upc-a');
  await expectMatchesReference(studio, context, '?symbology=upc-a', { padding: 0 }, 'after rapid switching');
});
