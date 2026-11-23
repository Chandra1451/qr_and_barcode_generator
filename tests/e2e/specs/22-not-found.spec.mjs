// "Page not found" (UCM-404-01, 2026-11-23). The server answers any missing address with 404.html, also deep
// inside /pages/, so the page must load its styles and scripts and keep working links from any depth.
import { test, expect } from '../support/fixtures.mjs';

// The page itself is meant to return 404; any other failed request still fails the test.
test.use({ allowConsoleErrors: [/no-such-page|status of 404/] });

for (const missing of ['/no-such-page.html', '/pages/no-such-page.html', '/pages/a/b/no-such-page.html']) {
  test(`NF-01 ${missing}: the 404 page is styled and its links work`, async ({ page }) => {
    const res = await page.goto(missing);
    expect(res.status(), 'a missing page answers 404').toBe(404);
    // Both shared stylesheets loaded and applied (the theme sets the page font).
    const sheets = await page.evaluate(() => [...document.styleSheets].map((s) => s.href || '').filter((h) => /v2-(theme|pages)\.css/.test(h)));
    expect(sheets, 'theme and page stylesheets').toHaveLength(2);
    await expect(page.locator('#site-nav-btn')).toBeVisible();
    // Links resolve to the real page, not to a path below the missing address (on phones the header link is
    // hidden, so read the resolved address rather than clicking it), and that page opens.
    const resolved = await page.locator('a[href$="about.html"]').first().evaluate((a) => new URL(a.href).pathname);
    expect(resolved).toBe('/about.html');
    await page.goto(resolved);
    await expect(page.locator('h1')).toBeVisible();
  });
}
