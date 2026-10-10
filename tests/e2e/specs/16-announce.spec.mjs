// SCREEN-READER ANNOUNCEMENTS — the studio tells assistive technology when the preview changes
// format, when the input is invalid, and when drawing fails, without repeating itself while
// the user types (js/v2-studio.js announce(); #preview-status is a polite live region).

import { test, expect } from '../support/fixtures.mjs';
import { GENERATORS } from '../support/catalog.mjs';

const nameOf = (id) => GENERATORS.find((g) => g.id === id).name;
const status = (page) => page.locator('#preview-status');

test.describe('A11Y-LIVE · preview announcements', () => {
  test('A11Y-LIVE-01 the live region exists, is polite, and is visually hidden', async ({ studio, page }) => {
    await studio.open();
    await expect(status(page)).toHaveAttribute('role', 'status');
    await expect(status(page)).toHaveAttribute('aria-live', 'polite');
    const box = await status(page).boundingBox();
    expect(box.width <= 1 && box.height <= 1, `size ${box.width}x${box.height}`).toBe(true);
  });

  test('A11Y-LIVE-02 opening a format announces it', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await expect(status(page)).toHaveText(`Preview updated: ${nameOf('code-128')}`);
  });

  test('A11Y-LIVE-03 invalid input is announced, and so is the recovery', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    await expect(status(page)).toHaveText(`Preview updated: ${nameOf('ean-13')}`);
    await studio.setPayload('12AB');
    // Invalid EAN-13 input fails to draw, so it is announced as "Preview not updated: <reason>";
    // inputs that are flagged but still draw are announced as "Check the input: <reason>".
    await expect(status(page)).toHaveText(/^(Check the input|Preview not updated): .*12 digits/);
    await studio.setPayload('590123412345');
    await expect(status(page)).toHaveText(`Preview updated: ${nameOf('ean-13')}`);
  });

  test('A11Y-LIVE-04 typing valid text does not repeat the announcement', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await expect(status(page)).toHaveText(`Preview updated: ${nameOf('code-128')}`);
    await page.evaluate(() => {
      window.__changes = 0;
      new MutationObserver(() => { window.__changes++; }).observe(document.getElementById('preview-status'), { childList: true, characterData: true, subtree: true });
    });
    for (const text of ['SKU-1', 'SKU-12', 'SKU-123', 'SKU-1234']) {
      await studio.setPayload(text);
      await studio.waitForStableRender();
    }
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => window.__changes)).toBe(0);
  });
});
