// LAYOUT — nothing slides under the sticky top bar (owner report 2026-10-12; breakdown in
// projects/universalcodemaker/30_design/sticky-header-overlap.md). Every page at desktop, tablet and phone widths.

import { test, expect } from '../support/fixtures.mjs';
import { ALL_PAGES } from '../support/catalog.mjs';

const WIDTHS = [{ width: 1366, height: 900 }, { width: 1024, height: 800 }, { width: 375, height: 812 }];

/** Measures, in the page: the sticky top bar's height, other sticky boxes, and where in-page link targets land. */
async function measure(page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    await document.fonts.ready;
    const header = [...document.querySelectorAll('.v2-header, .app-header, header')]
      .find((h) => ['sticky', 'fixed'].includes(getComputedStyle(h).position));
    const headerH = header ? header.getBoundingClientRect().height : 0;

    const sticky = [];
    window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2);
    await frame();
    for (const el of document.querySelectorAll('body *')) {
      if (el === header || header?.contains(el) || getComputedStyle(el).position !== 'sticky') continue;
      if (el.offsetParent === null) continue;
      sticky.push({ el: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, top: parseFloat(getComputedStyle(el).top) });
    }

    const anchors = [];
    const ids = [...new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)).filter(Boolean))];
    for (const id of ids) {
      const t = document.getElementById(id);
      if (!t || t.offsetParent === null) continue;
      t.scrollIntoView({ block: 'start', behavior: 'instant' });
      await frame();
      const atBottom = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      if (!atBottom) anchors.push({ id, top: Math.round(t.getBoundingClientRect().top) });
    }
    window.scrollTo(0, 0);
    return { headerH: Math.round(headerH), sticky, anchors };
  });
}

// Short screens, e.g. 1366×768 and 1536×864 laptops at 125% zoom (browser bars taken off), and 1366×900.
const SHORT = [{ width: 1093, height: 520 }, { width: 1229, height: 600 }, { width: 1366, height: 900 }];

// LAYOUT-FIT-01: a pinned box never runs off the bottom of the screen (owner report 2026-10-12: docs sidebar
// cut off at 125% zoom; the studio panel hid its download buttons). Long boxes scroll inside instead.
for (const p of ALL_PAGES) {
  test(`LAYOUT-FIT-01 ${p}: pinned boxes fit the screen on short laptops`, async ({ page }) => {
    await page.goto(`/${p}`);
    for (const size of SHORT) {
      await page.setViewportSize(size);
      await page.waitForTimeout(150);
      const boxes = await page.evaluate(async () => {
        await document.fonts.ready;
        const header = document.querySelector('.v2-header');
        const out = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el === header || header?.contains(el) || el.offsetParent === null) continue;
          const cs = getComputedStyle(el);
          if (cs.position !== 'sticky') continue;
          out.push({ el: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, bottomWhenPinned: Math.round(parseFloat(cs.top) + el.offsetHeight), screen: innerHeight });
        }
        return out;
      });
      for (const b of boxes) {
        expect(b.bottomWhenPinned, `${size.width}×${size.height}: ${b.el} runs ${b.bottomWhenPinned - b.screen}px off the bottom of the screen when pinned`).toBeLessThanOrEqual(b.screen + 1);
      }
    }
  });
}

for (const p of ALL_PAGES) {
  test(`LAYOUT-STICKY-01 / LAYOUT-ANCHOR-01 ${p}: sticky boxes and link targets stay below the top bar`, async ({ page }) => {
    await page.goto(`/${p}`);
    for (const size of WIDTHS) {
      await page.setViewportSize(size);
      await page.waitForTimeout(150);
      const m = await measure(page);
      for (const s of m.sticky) {
        expect(s.top, `${size.width}px: ${s.el} sticks at ${s.top}px, under the ${m.headerH}px top bar`).toBeGreaterThanOrEqual(m.headerH - 1);
      }
      for (const a of m.anchors) {
        expect(a.top, `${size.width}px: #${a.id} lands at ${a.top}px, under the ${m.headerH}px top bar`).toBeGreaterThanOrEqual(m.headerH - 1);
      }
    }
  });
}
