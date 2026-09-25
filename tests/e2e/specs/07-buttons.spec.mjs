// BUTTONS & BARS — every clickable thing in the studio is wired up and does its job.

import { test, expect } from '../support/fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { GENERATORS, WIZARDS, gs1CheckDigit, getGeneratorMeta, SITE_ROOT } from '../support/catalog.mjs';

/** Returns labels of visible buttons that have no click/key handler on themselves or a close ancestor. */
async function deadButtons(page) {
  const cdp = await page.context().newCDPSession(page);
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'))
      .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; })`,
  });
  const { result: props } = await cdp.send('Runtime.getProperties', { objectId: result.objectId, ownProperties: true });
  const dead = [];
  for (const p of props.filter((x) => /^\d+$/.test(x.name))) {
    let objectId = p.value.objectId;
    const label = (await cdp.send('Runtime.callFunctionOn', {
      objectId,
      functionDeclaration: 'function(){return (this.id ? "#" + this.id + " " : "") + (this.className ? "." + String(this.className).split(" ")[0] + " " : "") + (this.getAttribute("aria-label") || this.title || this.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40)}',
      returnByValue: true,
    })).result.value;
    let wired = false;
    for (let depth = 0; depth < 5 && objectId && !wired; depth++) {
      const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId });
      wired = listeners.some((l) => ['click', 'pointerdown', 'pointerup', 'mousedown', 'keydown'].includes(l.type));
      if (!wired) {
        const parent = await cdp.send('Runtime.callFunctionOn', {
          objectId,
          functionDeclaration: 'function(){const p = this.parentElement; return p && p !== document.body ? p : null}',
        });
        objectId = parent.result.objectId;
      }
    }
    if (!wired) dead.push(label);
  }
  await cdp.detach();
  return dead;
}

test.describe('BTN · nothing on the page is a dead button', () => {
  test('BTN-01 studio: every visible button has a handler', async ({ studio, page }) => {
    await studio.open();
    expect(await deadButtons(page)).toEqual([]);
  });

  for (const modal of [
    { open: '#btn-open-pdf-modal', id: '#pdf-modal' },
    { open: '#btn-open-batch-modal', id: '#batch-modal' },
    { open: '#btn-open-label-modal', id: '#label-maker-modal' },
  ]) {
    test(`BTN-02 ${modal.id}: every button inside the open modal has a handler`, async ({ studio, page }) => {
      await studio.open();
      await page.locator(modal.open).click();
      await expect(page.locator(modal.id)).toHaveClass(/open/);
      expect(await deadButtons(page)).toEqual([]);
    });
  }

  test('BTN-03 every button has an accessible name', async ({ studio, page }) => {
    await studio.open();
    const unnamed = await page.locator('button').evaluateAll((els) =>
      els.filter((e) => e.offsetParent !== null && !(e.getAttribute('aria-label') || e.title || e.textContent.trim())).map((e) => e.outerHTML.slice(0, 100)));
    expect(unnamed).toEqual([]);
  });
});

test.describe('BTN · header', () => {
  test('BTN-10 theme toggle flips the theme, updates its label, and persists across pages', async ({ studio, page }) => {
    await studio.open();
    const html = page.locator('html');
    const start = await html.getAttribute('data-theme');
    const btn = page.locator('#theme-toggle-btn');
    const labelBefore = await btn.textContent();
    await btn.click();
    const next = start === 'dark' ? 'light' : 'dark';
    await expect(html).toHaveAttribute('data-theme', next);
    expect(await btn.textContent()).not.toBe(labelBefore);
    expect(await page.evaluate(() => localStorage.getItem('ucm_theme'))).toBe(next);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', next);
    await page.goto('/about.html');
    await expect(html).toHaveAttribute('data-theme', next);
    await page.locator('#theme-toggle-btn').click();
    await expect(html).toHaveAttribute('data-theme', start);
  });

  test('BTN-11 accent dots switch the accent, mark the active dot, and persist', async ({ studio, page }) => {
    await studio.open();
    const dots = page.locator('.accent-dot');
    const accents = await dots.evaluateAll((els) => els.map((e) => e.dataset.accent));
    expect(accents.length).toBeGreaterThan(1);
    for (const a of accents) {
      await page.locator(`.accent-dot[data-accent="${a}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('data-accent', a);
      await expect(page.locator(`.accent-dot[data-accent="${a}"]`)).toHaveClass(/active/);
      await expect(page.locator('.accent-dot.active')).toHaveCount(1);
    }
    await page.goto('/pages/ean-13-barcode-generator.html');
    await expect(page.locator('html')).toHaveAttribute('data-accent', accents[accents.length - 1]);
  });

  test('BTN-12 header navigation links open real pages', async ({ studio, page, request, baseURL }) => {
    await studio.open();
    const hrefs = await page.locator('header a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    for (const href of hrefs.filter((h) => !/^(https?:|mailto:|#)/.test(h))) {
      const res = await request.get(new URL(href, `${baseURL}/`).href);
      expect(res.status(), `header link ${href}`).toBe(200);
    }
  });
});

test.describe('BTN · format selection', () => {
  test('BTN-20 category pills filter the dropdown to exactly that category', async ({ studio, page }) => {
    await studio.open();
    for (const cat of ['2d', 'retail', 'logistics', 'all']) {
      await page.locator(`.cat-pill[data-category="${cat}"]`).click();
      await expect(page.locator(`.cat-pill[data-category="${cat}"]`)).toHaveClass(/active/);
      const options = await studio.symbologySelect.locator('option').evaluateAll((els) => els.map((e) => e.value));
      const expected = GENERATORS.filter((g) => cat === 'all' || g.category === cat).map((g) => g.id);
      expect(options.sort()).toEqual(expected.sort());
      const current = (await studio.appState()).generatorId;
      if (cat !== 'all') expect(getGeneratorMeta(current).category, 'current generator must belong to the chosen category').toBe(cat);
      await studio.waitForStableRender();
    }
  });

  for (const g of GENERATORS) {
    test(`BTN-21 dropdown → ${g.id}: dossier, panels and preview all switch`, async ({ studio, page }) => {
      await studio.open(g.id === 'qr-code' ? '?symbology=code-128' : '');
      await studio.selectGenerator(g.id);
      await studio.expectNoRenderError();
      await expect(page.locator('#spec-format')).toHaveText(g.name);
      await expect(page.locator('#symbology-desc')).toHaveText(g.description);
      await expect(page.locator('#spec-iso')).not.toBeEmpty();
      const isQR = g.id === 'qr-code';
      await expect(page.locator('#qr-wizard-section')).toBeVisible({ visible: isQR });
      await expect(page.locator('#standard-payload-group')).toBeVisible({ visible: !isQR });
      await expect(page.locator('#qr-styling-panel')).toBeVisible({ visible: isQR });
      await expect(page.locator('#barcode-styling-panel')).toBeVisible({ visible: !isQR });
      await expect(page.locator('#auto-checksum-btn')).toBeVisible({ visible: ['ean-13', 'upc-a', 'itf-14'].includes(g.id) });
      if (!isQR) await expect(studio.payloadInput).toHaveValue(g.defaultPayload);
      expect((await studio.fingerprint()).kind).toBe(isQR ? 'qr' : 'bwip');
    });
  }

  test('BTN-22 quick-launch buttons open the promised format / wizard', async ({ studio, page }) => {
    await studio.open();
    const buttons = await page.locator('.v2-quick-btn').evaluateAll((els) => els.map((e, i) => ({ i, symbology: e.dataset.symbology, wizard: e.dataset.wizard, fnsku: e.dataset.fnsku, preset: e.dataset.preset, text: e.textContent.trim() })));
    expect(buttons.length).toBeGreaterThan(0);
    for (const b of buttons) {
      await page.locator('.v2-quick-btn').nth(b.i).click();
      await expect(page.locator('.v2-quick-btn').nth(b.i)).toHaveClass(/active/);
      const state = await studio.appState();
      expect(state.generatorId, `quick button "${b.text}"`).toBe(b.symbology);
      if (b.wizard) expect(state.wizardId, `quick button "${b.text}"`).toBe(b.wizard);
      if (b.fnsku === 'true') {
        await expect(studio.payloadInput).toHaveValue(/^X00/);
        if (b.preset) await expect(page.locator('#label-preset-select')).toHaveValue(b.preset);
      }
      await studio.waitForStableRender();
      await studio.expectNoRenderError();
      await expect(page.locator('#studio')).toBeInViewport({ ratio: 0.2 });
    }
  });

  test('BTN-23 "Load in Studio" cards load their format and scroll to the studio', async ({ studio, page }) => {
    await studio.open();
    const ids = await page.locator('.matrix-load-btn').evaluateAll((els) => els.map((e) => e.dataset.id));
    expect(ids.sort()).toEqual(GENERATORS.map((g) => g.id).sort());
    for (const id of ids) {
      await page.locator(`.matrix-load-btn[data-id="${id}"]`).click();
      await expect(studio.symbologySelect).toHaveValue(id);
      await expect(page.locator('#studio')).toBeInViewport({ ratio: 0.2 });
    }
  });

  test('BTN-24 wizard tabs: one per wizard, each selects its form', async ({ studio, page }) => {
    await studio.open();
    const tabs = await page.locator('.wiz-tab-btn').evaluateAll((els) => els.map((e) => e.dataset.wizard));
    expect(tabs).toEqual(WIZARDS.map((w) => w.id));
    for (const id of tabs) {
      await studio.selectWizard(id);
      await expect(page.locator('.wiz-tab-btn.active')).toHaveCount(1);
      await expect(page.locator(`.wiz-tab-btn[data-wizard="${id}"] svg`), `wizard tab "${id}" has no vector icon`).toHaveCount(1);
    }
  });
});

test.describe('BTN · checksum helper', () => {
  const CASES = [
    { id: 'ean-13', input: '400638133393', expect: '4006381333931' },
    { id: 'upc-a', input: '03600029145', expect: '036000291452' },
    { id: 'itf-14', input: '1540014128876', expect: '1540014128876' + gs1CheckDigit('1540014128876') },
  ];
  for (const c of CASES) {
    test(`BTN-30 ${c.id}: "Auto checksum" appends the correct GS1 check digit`, async ({ studio, page }) => {
      await studio.open(`?symbology=${c.id}`);
      await studio.setPayload(c.input);
      await page.locator('#auto-checksum-btn').click();
      await expect(studio.payloadInput).toHaveValue(c.expect);
      await expect(page.locator('#toast-container')).toContainText(c.expect.slice(-1));
    });

    test(`BTN-31 ${c.id}: wrong-length input gives an error message and leaves the input alone`, async ({ studio, page }) => {
      await studio.open(`?symbology=${c.id}`);
      await studio.setPayload('123');
      await page.locator('#auto-checksum-btn').click();
      await expect(studio.payloadInput).toHaveValue('123');
      await expect(page.locator('#toast-container')).toContainText(/exactly|digits/i);
    });
  }
});

test.describe('BTN · stage toolbar and panels', () => {
  test('BTN-40 "Toggle BG" switches the checkerboard on and off', async ({ studio, page }) => {
    await studio.open();
    const stage = page.locator('#preview-stage');
    const had = await stage.evaluate((e) => e.classList.contains('checkerboard-active'));
    await page.locator('#btn-toggle-bg').click();
    expect(await stage.evaluate((e) => e.classList.contains('checkerboard-active'))).toBe(!had);
    await page.locator('#btn-toggle-bg').click();
    expect(await stage.evaluate((e) => e.classList.contains('checkerboard-active'))).toBe(had);
  });

  test('BTN-41 turning transparent background OFF also removes the checkerboard it added', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await studio.setControl('barcodeTransparentBg', true);
    await expect(page.locator('#preview-stage')).toHaveClass(/checkerboard-active/);
    await studio.setControl('barcodeTransparentBg', false);
    await expect(page.locator('#preview-stage')).not.toHaveClass(/checkerboard-active/);
  });

  test('BTN-42 "Laser FX" toggles state, label and aria-pressed, and persists', async ({ studio, page }) => {
    await studio.open();
    const btn = page.locator('#btn-toggle-laser');
    const on = (await btn.getAttribute('aria-pressed')) === 'true';
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', String(!on));
    await expect(page.locator('#laser-status-text')).toHaveText(on ? 'OFF' : 'ON');
    await page.reload();
    await expect(page.locator('#btn-toggle-laser')).toHaveAttribute('aria-pressed', String(!on));
  });

  test('BTN-43 styling accordion opens and closes', async ({ studio, page }) => {
    await studio.open();
    const box = page.locator('#styling-accordion');
    const wasOpen = await box.evaluate((e) => e.classList.contains('open'));
    await box.locator('.accordion-toggle').click();
    expect(await box.evaluate((e) => e.classList.contains('open'))).toBe(!wasOpen);
    await box.locator('.accordion-toggle').click();
    expect(await box.evaluate((e) => e.classList.contains('open'))).toBe(wasOpen);
  });

  test('BTN-44 barcode palette chips set both colours and mark themselves active', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    const chips = page.locator('.barcode-preset-chip');
    const n = await chips.count();
    for (let i = 0; i < n; i++) {
      const { bar, bg } = await chips.nth(i).evaluate((e) => ({ bar: e.dataset.bar, bg: e.dataset.bg }));
      await chips.nth(i).click();
      await expect(chips.nth(i)).toHaveClass(/active/);
      await expect(page.locator('.barcode-preset-chip.active')).toHaveCount(1);
      await expect(studio.control('barcodeColor')).toHaveValue(bar);
      await expect(studio.control('barcodeBgColor')).toHaveValue(bg);
      await expect(page.locator('#val-barcodeColor')).toHaveText(bar);
    }
  });
});

test.describe('BTN · recent history', () => {
  test('BTN-50 history records codes, restores them on click, and clears', async ({ studio, page }) => {
    await page.addInitScript(() => localStorage.removeItem('ucm_recent_history'));
    await studio.open('?symbology=code-128');
    await studio.setPayload('HISTORY-ONE');
    await page.waitForTimeout(400);
    await studio.selectGenerator('ean-13');
    await page.waitForTimeout(400);

    const chips = page.locator('.recent-chip');
    await expect(page.locator('#recent-history-container')).toBeVisible();
    await expect(chips.first()).toContainText('EAN-13');

    await chips.filter({ hasText: 'HISTORY-ONE' }).click();
    await expect(studio.symbologySelect).toHaveValue('code-128');
    await expect(studio.payloadInput).toHaveValue('HISTORY-ONE');
    await studio.waitForStableRender();
    expect(await studio.decodePreview()).toBe('HISTORY-ONE');

    await page.locator('#btn-clear-history').click();
    await expect(page.locator('#recent-history-container')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('ucm_recent_history'))).toBeNull();
  });

  test('BTN-51 history keeps at most 6 entries and no duplicates', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    for (let i = 1; i <= 8; i++) {
      await studio.setPayload(`ITEM-${i}`);
      await page.waitForTimeout(250);
    }
    await studio.setPayload('ITEM-8');
    await page.waitForTimeout(300);
    const chipTexts = await page.locator('.recent-chip').allTextContents();
    expect(chipTexts.length).toBeLessThanOrEqual(6);
    expect(new Set(chipTexts).size).toBe(chipTexts.length);
  });

  test('BTN-52 typing does not flood history with every keystroke', async ({ studio, page }) => {
    await page.addInitScript(() => localStorage.removeItem('ucm_recent_history'));
    await studio.open('?symbology=code-128');
    await studio.payloadInput.fill('');
    await studio.payloadInput.pressSequentially('SLOWTYPING', { delay: 150 });
    await page.waitForTimeout(500);
    const texts = await page.locator('.recent-chip').allTextContents();
    const partials = texts.filter((t) => /SLOW/.test(t) && !/SLOWTYPING/.test(t));
    expect(partials, 'half-typed values were saved as history entries').toEqual([]);
  });
});

test.describe('BTN · modals', () => {
  const MODALS = [
    { name: 'PDF', open: '#btn-open-pdf-modal', modal: '#pdf-modal', closers: ['#btn-close-pdf-modal', '#btn-cancel-pdf'] },
    { name: 'Batch', open: '#btn-open-batch-modal', modal: '#batch-modal', closers: ['#btn-close-batch-modal', '#btn-cancel-batch'] },
    { name: 'Label maker', open: '#btn-open-label-modal', modal: '#label-maker-modal', closers: ['#btn-close-label-modal', '#btn-close-label-modal-footer'] },
  ];
  for (const m of MODALS) {
    for (const closer of m.closers) {
      test(`BTN-60 ${m.name}: opens, and ${closer} closes it`, async ({ studio, page }) => {
        await studio.open();
        await page.locator(m.open).click();
        await expect(page.locator(m.modal)).toHaveClass(/open/);
        await expect(page.locator(m.modal)).toBeVisible();
        await page.locator(closer).click();
        await expect(page.locator(m.modal)).not.toHaveClass(/open/);
      });
    }
    test(`BTN-61 ${m.name}: Escape closes the modal`, async ({ studio, page }) => {
      await studio.open();
      await page.locator(m.open).click();
      await expect(page.locator(m.modal)).toHaveClass(/open/);
      await page.keyboard.press('Escape');
      await expect(page.locator(m.modal)).not.toHaveClass(/open/);
    });
  }

  test('BTN-62 batch tabs switch panels; sequence preview and CSV counter update live', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#tab-batch-seq').click();
    await expect(page.locator('#batch-seq-panel')).toBeVisible();
    await expect(page.locator('#batch-csv-panel')).toBeHidden();
    await page.locator('#batch-prefix').fill('INV-');
    await page.locator('#batch-start').fill('7');
    await page.locator('#batch-count').fill('5');
    await page.locator('#batch-pad').fill('4');
    await page.locator('#batch-suffix').fill('-A');
    await expect(page.locator('#batch-seq-preview')).toHaveText('INV-0007-A ... INV-0011-A (5 codes)');

    await page.locator('#tab-batch-csv').click();
    await expect(page.locator('#batch-csv-panel')).toBeVisible();
    await expect(page.locator('#batch-seq-panel')).toBeHidden();
    await page.locator('#batch-csv-input').fill('A1\nB2\n\nC3');
    await expect(page.locator('#val-batch-csv-count')).toHaveText('3 items');
  });

  test('BTN-63 batch count is clamped to 1…100 and the preview says so', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-batch-modal').click();
    await page.locator('#batch-count').fill('500');
    await expect(page.locator('#batch-seq-preview')).toContainText('(100 codes)');
    await page.locator('#batch-count').fill('0');
    await expect(page.locator('#batch-seq-preview')).toContainText(/\((1|10) codes?\)/);
  });

  test('BTN-64 PDF quantity slider updates its badge', async ({ studio, page }) => {
    await studio.open();
    await page.locator('#btn-open-pdf-modal').click();
    await page.locator('#pdf-quantity-input').evaluate((e) => {
      e.value = '12';
      e.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('#val-pdf-quantity')).toHaveText('12');
  });
});

test.describe('BTN · label maker', () => {
  test('BTN-70 each preset updates the size badge and the preview keeps the label proportions', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    const presets = await page.locator('#label-preset-select option').evaluateAll((els) => els.map((e) => e.value));
    for (const p of presets) {
      await page.locator('#label-preset-select').selectOption(p);
      const badge = await page.locator('#label-dimension-badge').textContent();
      const m = badge.match(/([\d.]+)"\s*×\s*([\d.]+)"/);
      expect(m, `badge for ${p}: "${badge}"`).toBeTruthy();
      await page.waitForTimeout(300);
      const { w, h } = await page.locator('#label-preview-canvas').evaluate((c) => ({ w: c.width, h: c.height }));
      expect(Math.abs(w / h - Number(m[1]) / Number(m[2])) / (Number(m[1]) / Number(m[2])), `${p}: canvas ${w}x${h} vs ${m[1]}"×${m[2]}"`).toBeLessThan(0.02);
    }
  });

  test('BTN-71 layout buttons and text fields all change the label preview', async ({ studio, page }) => {
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    const hash = () => page.locator('#label-preview-canvas').evaluate((c) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let h = 0x811c9dc5;
      for (let i = 0; i < d.length; i += 7) { h ^= d[i]; h = Math.imul(h, 16777619); }
      return (h >>> 0).toString(16);
    });
    let last = await hash();
    const changed = async (what) => {
      await expect.poll(hash, { message: `${what} did not change the label preview`, timeout: 4000 }).not.toBe(last);
      last = await hash();
    };
    for (const layout of await page.locator('.label-layout-btn').evaluateAll((els) => els.map((e) => e.dataset.layout))) {
      if (await page.locator(`.label-layout-btn[data-layout="${layout}"]`).evaluate((e) => e.classList.contains('active'))) continue;
      await page.locator(`.label-layout-btn[data-layout="${layout}"]`).click();
      await expect(page.locator(`.label-layout-btn[data-layout="${layout}"]`)).toHaveClass(/active/);
      await changed(`layout ${layout}`);
    }
    await page.locator('.label-layout-btn[data-layout="vertical-stack"]').click();
    await changed('layout vertical-stack');
    for (const [sel, value] of [['#label-field-title', 'QA Title'], ['#label-field-price', '42.00'], ['#label-field-sku', 'SKU-QA-1'], ['#label-field-footnote', 'QA note']]) {
      await page.locator(sel).fill(value);
      await changed(sel);
    }
    await page.locator('#label-field-currency').selectOption('€');
    await changed('currency');
    await page.locator('#label-toggle-cutline').evaluate((e) => { e.checked = !e.checked; e.dispatchEvent(new Event('change', { bubbles: true })); });
    await changed('cutline toggle');
  });

  test('BTN-72 print button prepares the page and calls the browser print dialog', async ({ studio, page }) => {
    await page.addInitScript(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });
    await studio.open('?symbology=code-128');
    await page.locator('#btn-open-label-modal').click();
    await page.locator('#btn-print-thermal').click();
    await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
    await expect(page.locator('#label-dynamic-print-style')).toHaveCount(1);
  });
});

test('BTN-80 footer links on the studio all point to pages that exist', async ({ studio, page }) => {
  await studio.open();
  const hrefs = await page.locator('footer a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  const internal = hrefs.filter((h) => !/^(https?:|mailto:|tel:|#)/.test(h)).map((h) => h.split(/[?#]/)[0]);
  const missing = internal.filter((h) => {
    const rel = h.replace(/^\.?\//, '');
    return !fs.existsSync(path.join(SITE_ROOT, rel.endsWith('/') || rel === '' ? `${rel}index.html` : rel));
  });
  expect(missing).toEqual([]);
});
