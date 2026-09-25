// CONTROLS — every setting of every generator actually does what it says.
//
// For each generator (read from the site's registry, so new ones are covered automatically)
// and each of its controls, the test:
//   1. checks the control is rendered in the studio with the right range/default/label,
//   2. sweeps it through its values and requires a visible preview change at every step,
//   3. checks the value badge, the app state and the direction of the geometry change,
//   4. checks the end result equals a clean render of the same value (no stale state),
//   5. puts the default back and requires the original image again (reversibility).

import { test, expect } from '../support/fixtures.mjs';
import { referenceFingerprint, sameImage } from '../support/studio.mjs';
import { BARCODE_GENERATORS } from '../support/catalog.mjs';

function sweepValues(c) {
  if (c.type === 'slider') {
    const mid = Math.round((c.min + c.max) / 2);
    return [...new Set([c.min, c.max, mid])].filter((v) => v !== c.default);
  }
  if (c.type === 'toggle') return [!c.default];
  if (c.type === 'select') return c.options.map((o) => o.value).filter((v) => v !== c.default);
  if (c.type === 'color') return ['#b91c1c', '#1d4ed8'];
  if (c.type === 'text') return c.id === 'addon' ? ['51999'] : ['TEST'];
  return [];
}

/** Expected direction of the canvas-size change when a slider goes up. */
const GROWS_WITH = {
  padding: ['width', 'height'],
  scale: ['width', 'height'],
  height: ['height'],
};

for (const g of BARCODE_GENERATORS) {
  test.describe(`CTRL · ${g.id}`, () => {
    test(`CTRL-01 ${g.id}: every registry control is rendered with correct attributes`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      for (const c of g.controls) {
        const el = studio.control(c.id);
        await expect(el, `control "${c.label}" (${c.type}) is defined for ${g.id} but not shown in the studio`).toHaveCount(1);
        // Toggles hide the real checkbox behind a custom switch; the switch is what must be visible.
        const visiblePart = c.type === 'toggle' ? el.locator('xpath=ancestor::label[contains(@class,"tactile-toggle-switch")]') : el;
        await expect(visiblePart).toBeVisible();
        await expect(studio.page.locator(`label[for="ctrl-${c.id}"]`)).toHaveText(c.label);
        if (c.type === 'slider') {
          await expect(el).toHaveAttribute('min', String(c.min));
          await expect(el).toHaveAttribute('max', String(c.max));
          await expect(el).toHaveValue(String(c.default));
          expect(await studio.badgeText(c.id)).toBe(`${c.default}${c.unit || ''}`);
        }
        if (c.type === 'toggle') expect(await el.isChecked()).toBe(Boolean(c.default));
        if (c.type === 'select') await expect(el).toHaveValue(String(c.default));
      }
    });

    for (const c of g.controls) {
      const values = sweepValues(c);
      if (!values.length) continue;

      test(`CTRL-02 ${g.id}: "${c.label}" changes the preview for every value`, async ({ studio, context }) => {
        await studio.open(`?symbology=${g.id}`);
        const original = await studio.fingerprint();
        let previous = original;
        let previousValue = c.default;

        for (const v of values) {
          await studio.setControl(c.id, v);
          const now = await studio.waitForChange(previous, { what: `${c.id}: ${previousValue} → ${v}` });
          await studio.expectNoRenderError();

          // App state and badge follow the control.
          const state = await studio.appState();
          expect(state.options[c.id], `app state for ${c.id}`).toEqual(c.type === 'slider' ? Number(v) : v);
          if (c.type === 'slider') expect(await studio.badgeText(c.id)).toBe(`${v}${c.unit || ''}`);

          // Geometry moves in the documented direction.
          if (c.type === 'slider' && GROWS_WITH[c.id]) {
            for (const dim of GROWS_WITH[c.id]) {
              if (v > previousValue) expect(now[dim], `${dim} should grow when ${c.id} ${previousValue} → ${v}`).toBeGreaterThan(previous[dim]);
              if (v < previousValue) expect(now[dim], `${dim} should shrink when ${c.id} ${previousValue} → ${v}`).toBeLessThan(previous[dim]);
            }
          }
          if (c.id === 'includetext') {
            expect(now.height, 'hiding the human-readable text should make the image shorter').toBeLessThan(previous.height);
          }

          previous = now;
          previousValue = v;
        }

        // No stale state: the result equals a clean render of the final value.
        const last = values[values.length - 1];
        const ref = await referenceFingerprint(context, { query: `?symbology=${g.id}`, controls: { [c.id]: last } });
        expect(sameImage(previous, ref), `UI result for ${c.id}=${last} differs from a clean render`).toBe(true);

        // Reversibility: back to default gives the original image.
        await studio.setControl(c.id, c.default);
        await studio.waitForChange(previous, { what: `${c.id} back to default` });
        expect(sameImage((await studio.waitForStableRender()), original), `${c.id} back to default did not restore the original image`).toBe(true);
      });
    }

    const sliders = g.controls.filter((c) => c.type === 'slider');
    if (sliders.length) {
      test(`CTRL-03 ${g.id}: rapid slider scrubbing ends on the right image (no out-of-order renders)`, async ({ studio, context }) => {
        await studio.open(`?symbology=${g.id}`);
        const s = sliders[0];
        // Fast keyboard scrub: many input events inside one debounce window.
        await studio.nudgeSlider(s.id, 'End', 1);
        await studio.nudgeSlider(s.id, 'ArrowLeft', Math.min(6, s.max - s.min));
        const final = Number(await studio.control(s.id).inputValue());
        await studio.page.waitForTimeout(500);
        const actual = await studio.waitForStableRender();
        const ref = await referenceFingerprint(context, { query: `?symbology=${g.id}`, controls: { [s.id]: final } });
        expect(sameImage(actual, ref), `after scrubbing ${s.id} to ${final}`).toBe(true);
      });

      test(`CTRL-04 ${g.id}: settings survive a payload edit`, async ({ studio }) => {
        await studio.open(`?symbology=${g.id}`);
        const s = sliders[0];
        const target = s.default === s.max ? s.min : s.max;
        await studio.setControl(s.id, target);
        await studio.page.waitForTimeout(300);
        const payload = await studio.payloadInput.inputValue();
        await studio.setPayload(payload + ' ');
        await studio.setPayload(payload);
        await studio.page.waitForTimeout(300);
        expect((await studio.appState()).options[s.id]).toBe(target);
        await expect(studio.control(s.id)).toHaveValue(String(target));
      });
    }

    test(`CTRL-05 ${g.id}: switching away and back resets controls to defaults consistently`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      const original = await studio.fingerprint();
      for (const c of g.controls.filter((x) => x.type === 'slider')) await studio.setControl(c.id, c.max);
      await studio.page.waitForTimeout(300);
      await studio.selectGenerator(g.id === 'code-128' ? 'ean-13' : 'code-128');
      await studio.selectGenerator(g.id);
      for (const c of g.controls.filter((x) => x.type === 'slider')) {
        await expect(studio.control(c.id), `${c.id} after switching back`).toHaveValue(String(c.default));
      }
      expect(sameImage((await studio.waitForStableRender()), original), 'image after switching back differs from the first load').toBe(true);
    });
  });
}

test.describe('CTRL · barcode styling panel (all non-QR generators)', () => {
  for (const g of BARCODE_GENERATORS) {
    test(`CTRL-06 ${g.id}: bar colour, background colour and transparency reach the preview`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      await expect(studio.page.locator('#barcode-styling-panel')).toBeVisible();
      await expect(studio.page.locator('#qr-styling-panel')).toBeHidden();

      let before = await studio.fingerprint();
      await studio.setControl('barcodeColor', '#003366');
      before = await studio.waitForChange(before, { what: 'bar colour' });

      await studio.setControl('barcodeBgColor', '#fef2f2');
      before = await studio.waitForChange(before, { what: 'background colour' });

      await studio.setControl('barcodeTransparentBg', true);
      const transparent = await studio.waitForChange(before, { what: 'transparent background' });
      expect(transparent.transparentRatio, 'transparent background should leave transparent pixels').toBeGreaterThan(0.2);
    });
  }

  test('CTRL-07 corner radius slider and presets change every generator the same way', async ({ studio }) => {
    for (const g of BARCODE_GENERATORS) {
      await studio.open(`?symbology=${g.id}`);
      const sharp = await studio.fingerprint();
      expect(sharp.transparentRatio, `${g.id}: sharp corners should have no transparent pixels`).toBe(0);
      await studio.page.locator('.corner-preset-btn[data-radius="18"]').click();
      const rounded = await studio.waitForChange(sharp, { what: `${g.id}: corner radius 18` });
      expect(rounded.transparentRatio, `${g.id}: rounded corners should cut transparent corners`).toBeGreaterThan(0);
      expect(await studio.page.locator('#val-cornerRadius').textContent()).toContain('18px');
    }
  });
});
