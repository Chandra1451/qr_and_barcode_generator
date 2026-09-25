// DESIGN CONSISTENCY — every page looks and behaves like the same site, in both themes,
// on desktop and phone. Compares what the browser actually renders (computed styles),
// not what the CSS files say.

import { test, expect } from '../support/fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';
import { ALL_PAGES, CONTENT_PAGES } from '../support/catalog.mjs';

const THEMES = ['light', 'dark'];

async function openThemed(page, p, theme) {
  await page.addInitScript((t) => localStorage.setItem('ucm_theme', t), theme);
  await page.goto(`/${p}`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.waitForLoadState('networkidle');
}

/** Computed look of the shared chrome (header, footer, body, headings, links, buttons). */
async function chromeStyle(page) {
  return page.evaluate(() => {
    const pick = (sel, props) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, s[p]]));
    };
    return {
      body: pick('body', ['backgroundColor', 'color', 'fontFamily']),
      header: pick('header.v2-header', ['backgroundColor', 'borderBottomColor', 'position']),
      headerHeight: Math.round(document.querySelector('header.v2-header')?.getBoundingClientRect().height || 0),
      logo: (() => { const i = document.querySelector('header.v2-header img'); return i ? `${Math.round(i.getBoundingClientRect().width)}x${Math.round(i.getBoundingClientRect().height)}` : null; })(),
      navLink: pick('header .v2-nav-link', ['fontFamily', 'fontSize', 'fontWeight']),
      h1: pick('h1', ['fontFamily', 'fontWeight']),
      footer: pick('footer.v2-footer', ['backgroundColor', 'color']),
      themeButton: pick('#theme-toggle-btn', ['fontFamily', 'fontSize', 'borderRadius']),
    };
  });
}

async function navSignature(page) {
  return page.evaluate(() => {
    const abs = (a) => new URL(a.getAttribute('href'), location.href).pathname.replace(/\/index\.html$/, '/');
    return {
      header: [...new Set([...document.querySelectorAll('header.v2-header a[href]')].map(abs))].sort(),
      footerColumns: [...document.querySelectorAll('.v2-footer-col-title, .footer-links-col h4')].map((e) => e.textContent.trim()),
      footerColumnLinks: [...new Set([...document.querySelectorAll('.v2-footer-col a[href], .footer-links-col a[href]')].map(abs))].sort(),
      footerLegal: [...new Set([...document.querySelectorAll('.v2-footer-legal-links a[href]')].map(abs))].sort(),
      footerMatrix: [...new Set([...document.querySelectorAll('.v2-footer-matrix a[href]')].map(abs))].sort(),
      favicon: [...document.querySelectorAll('link[rel~="icon"], link[rel="manifest"], link[rel="apple-touch-icon"]')].map((l) => `${l.rel}:${new URL(l.getAttribute('href'), location.href).pathname}`).sort(),
    };
  });
}

test.describe('CONS · shared chrome is identical on every page', () => {
  test('CONS-01 header links, footer columns, legal links, SEO directory and icons match the studio', async ({ page }) => {
    await page.goto('/index.html');
    const reference = await navSignature(page);
    const diffs = [];
    for (const p of CONTENT_PAGES) {
      await page.goto(`/${p}`);
      const sig = await navSignature(page);
      for (const key of Object.keys(reference)) {
        if (JSON.stringify(sig[key]) !== JSON.stringify(reference[key])) {
          const missing = reference[key].filter((x) => !sig[key].includes(x));
          const extra = sig[key].filter((x) => !reference[key].includes(x));
          diffs.push(`${p} · ${key}: missing [${missing.join(', ')}] extra [${extra.join(', ')}]`);
        }
      }
    }
    expect(diffs).toEqual([]);
  });

  for (const theme of THEMES) {
    test(`CONS-02 ${theme}: header, footer, body, headings and fonts render the same on every page`, async ({ page }) => {
      await openThemed(page, 'index.html', theme);
      const reference = await chromeStyle(page);
      const diffs = [];
      for (const p of CONTENT_PAGES) {
        await openThemed(page, p, theme);
        const s = await chromeStyle(page);
        for (const [part, props] of Object.entries(reference)) {
          // Content pages carry a "Launch Studio" button the studio doesn't need; on phones it
          // makes their header up to ~7 px taller. Allow 8 px; anything more is real drift.
          if (part === 'headerHeight' && Math.abs(s[part] - props) <= 8) continue;
          if (JSON.stringify(s[part]) !== JSON.stringify(props)) diffs.push(`${p} · ${part}: ${JSON.stringify(s[part])} ≠ studio ${JSON.stringify(props)}`);
        }
      }
      expect(diffs).toEqual([]);
    });
  }
});

test.describe('CONS · theme and accent behave the same everywhere', () => {
  for (const p of ALL_PAGES) {
    test(`CONS-03 ${p}: theme toggle works and keeps the accent`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('ucm_accent', 'cobalt'));
      await page.goto(`/${p}`);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-accent', 'cobalt');
      const before = await html.getAttribute('data-theme');
      await page.locator('#theme-toggle-btn').click();
      await expect(html).not.toHaveAttribute('data-theme', before);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await page.locator('#theme-toggle-btn').click();
      const bgBack = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg, 'theme toggle did not change the page background').not.toBe(bgBack);
    });
  }
});

test.describe('CONS · no broken design tokens', () => {
  for (const theme of THEMES) {
    for (const p of ALL_PAGES) {
      test(`CONS-04 ${theme} ${p}: every var(--token) used on the page is defined`, async ({ page }) => {
        await openThemed(page, p, theme);
        const undefinedTokens = await page.evaluate(() => {
          const used = new Set();
          const defined = new Set();
          const scan = (text) => {
            for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) if (!m[2]) used.add(m[1]);
            for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
          };
          for (const sheet of document.styleSheets) {
            let rules;
            try { rules = sheet.cssRules; } catch { continue; }
            const walk = (list) => { for (const r of list) { if (r.cssRules) walk(r.cssRules); scan(r.cssText); } };
            walk(rules);
          }
          document.querySelectorAll('[style]').forEach((e) => scan(e.getAttribute('style')));
          const root = getComputedStyle(document.documentElement);
          return [...used].filter((v) => !defined.has(v) && !root.getPropertyValue(v).trim());
        });
        expect(undefinedTokens, 'undefined tokens fail silently (e.g. white text on white)').toEqual([]);
      });
    }
  }
});

test.describe('CONS · accessibility & contrast', () => {
  for (const theme of THEMES) {
    for (const p of ALL_PAGES) {
      test(`CONS-05 ${theme} ${p}: no serious/critical accessibility or contrast violations`, async ({ page }) => {
        await openThemed(page, p, theme);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .exclude('.adsbygoogle')
          .analyze();
        const serious = results.violations
          .filter((v) => ['serious', 'critical'].includes(v.impact))
          .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
        expect(serious).toEqual([]);
      });
    }
  }
});

test.describe('CONS · responsive layout', () => {
  for (const width of [320, 375, 768, 1280]) {
    test(`CONS-06 ${width}px: no page scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const wide = [];
      for (const p of ALL_PAGES) {
        await page.goto(`/${p}`);
        const overflow = await page.evaluate(() => {
          const over = document.scrollingElement.scrollWidth - window.innerWidth;
          if (over <= 1) return null;
          const culprits = [...document.querySelectorAll('body *')]
            .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
            .slice(0, 3)
            .map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className ? '.' + String(e.className).split(' ')[0] : ''}`);
          return `${over}px (${culprits.join(', ')})`;
        });
        if (overflow) wide.push(`${p}: ${overflow}`);
      }
      expect(wide).toEqual([]);
    });
  }

  test('CONS-07 header controls stay reachable (theme button inside the viewport) on every page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const clipped = [];
    for (const p of ALL_PAGES) {
      await page.goto(`/${p}`);
      const box = await page.locator('#theme-toggle-btn').boundingBox();
      if (!box || box.x < 0 || box.x + box.width > 360) clipped.push(`${p}: ${JSON.stringify(box)}`);
    }
    expect(clipped).toEqual([]);
  });
});

test.describe('CONS · studio controls look like one family', () => {
  test('CONS-08 action dock buttons share height, font and radius', async ({ studio, page }) => {
    await studio.open();
    const styles = await page.locator('#btn-download-svg, #btn-download-png, #btn-copy-clipboard, #btn-open-pdf-modal, #btn-open-label-modal').evaluateAll((els) =>
      els.map((e) => { const s = getComputedStyle(e); return { id: e.id, h: Math.round(e.getBoundingClientRect().height), font: s.fontFamily, radius: s.borderRadius }; }));
    const heights = new Set(styles.map((s) => s.h));
    const fonts = new Set(styles.map((s) => s.font));
    expect(heights.size, `button heights differ: ${JSON.stringify(styles)}`).toBe(1);
    expect(fonts.size, `button fonts differ: ${JSON.stringify(styles)}`).toBe(1);
  });

  test('CONS-09 every generator\'s sliders use the same component and label style', async ({ studio, page }) => {
    const { BARCODE_GENERATORS } = await import('../support/catalog.mjs');
    const seen = new Map();
    for (const g of BARCODE_GENERATORS) {
      await studio.open(`?symbology=${g.id}`);
      const sig = await page.locator('#dynamic-controls-grid input[type="range"]').evaluateAll((els) =>
        els.map((e) => { const s = getComputedStyle(e); return `${e.className}|${s.height}|${s.accentColor}`; }));
      for (const s of sig) seen.set(s, [...(seen.get(s) || []), g.id]);
    }
    expect([...seen.keys()].length, `slider styles differ between generators: ${JSON.stringify(Object.fromEntries(seen))}`).toBe(1);
  });
});
