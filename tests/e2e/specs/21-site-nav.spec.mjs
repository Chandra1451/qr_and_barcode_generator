// Site menu (UCM-NAV-01, 2026-11-23): the header Menu button opens a category panel on every page.
import { test, expect } from '../support/fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';

const btn = (page) => page.locator('#site-nav-btn');
const panel = (page) => page.locator('#site-nav');
const isOpen = (page) => page.evaluate(() => document.getElementById('site-nav').open);

for (const url of ['/index.html', '/pages/upi-qr-code-generator.html', '/about.html']) {
  test(`NAV-02 ${url}: opens from the button, closes by ✕, Esc and outside click, and hands focus back`, async ({ page }) => {
    await page.goto(url);
    await expect(btn(page)).toHaveAttribute('aria-expanded', 'false');
    await btn(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(btn(page)).toHaveAttribute('aria-expanded', 'true');
    expect(page.url(), 'opening must not jump to the footer').not.toContain('#site-directory');

    await page.locator('#site-nav .site-nav-close').click();
    expect(await isOpen(page)).toBe(false);
    await expect(btn(page)).toBeFocused();
    await expect(btn(page)).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press(' ');
    expect(await isOpen(page), 'Space on the focused button opens it').toBe(true);
    await page.keyboard.press('Escape');
    expect(await isOpen(page)).toBe(false);
    await expect(btn(page)).toBeFocused();

    await btn(page).click();
    const box = await panel(page).boundingBox();
    // On phones the panel is full width (no outside area); ✕ and Esc above cover closing there.
    if (box.x > 40) {
      await page.mouse.click(box.x - 20, 200);
      expect(await isOpen(page), 'a click outside the panel closes it').toBe(false);
    } else {
      expect(box.width, 'phone panel covers the screen width').toBeGreaterThanOrEqual(page.viewportSize().width - 1);
    }
  });
}

test('NAV-03 groups: all open on a wide screen; on a phone closed except the group holding the current page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/pages/upi-qr-code-generator.html');
  await btn(page).click();
  const states = () => page.locator('#site-nav details').evaluateAll((ds) => ds.map((d) => [d.querySelector('summary').textContent.trim(), d.open]));
  expect((await states()).every(([, open]) => open)).toBe(true);
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await btn(page).click();
  const phone = await states();
  expect(phone.filter(([, open]) => open).map(([t]) => t)).toEqual([expect.stringContaining('QR codes')]);
  await expect(page.locator('#site-nav a[aria-current="page"]')).toHaveText('UPI payments');
});

test('NAV-04 a menu link takes you to that page', async ({ page }) => {
  await page.goto('/about.html');
  await btn(page).click();
  const link = page.locator('#site-nav a', { hasText: 'Check digit calculator' });
  await link.click();
  await page.waitForURL(/\/pages\/check-digit-calculator\.html$/);
  await expect(page.locator('h1')).toHaveText('GTIN Check Digit Calculator');
});

test('NAV-05 without JavaScript the Menu button jumps to the footer directory', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${test.info().project.use.baseURL}/pages/ean-13-barcode-generator.html`);
  await page.locator('#site-nav-btn').click();
  await expect(page).toHaveURL(/#site-directory$/);
  await expect(page.locator('#site-directory')).toBeInViewport();
  await ctx.close();
});

for (const theme of ['light', 'dark']) {
  test(`NAV-06 ${theme}: the open menu has no serious accessibility or contrast problems`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('ucm_theme', t), theme);
    await page.goto('/pages/ean-13-barcode-generator.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await btn(page).click();
    await expect(panel(page)).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#site-nav').withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations
      .filter((v) => ['serious', 'critical'].includes(v.impact))
      .map((v) => `${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(serious).toEqual([]);
  });
}

test('NAV-07 studio: opening and closing the menu leaves the studio working', async ({ page, studio }) => {
  await studio.open('?symbology=ean-13');
  const before = await studio.waitForStableRender();
  await btn(page).click();
  await page.keyboard.press('Escape');
  await studio.setPayload('4006381333931');
  await studio.waitForChange(before, { what: 'payload after closing the menu' });
  await studio.expectNoRenderError();
  expect(await studio.decodePreview()).toBe('4006381333931');
});
