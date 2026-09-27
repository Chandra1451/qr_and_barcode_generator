// GEOMETRY & LAYOUT — the preview keeps the right shape and the stage does not jump.
//
// Includes the PDF417 "Data Columns" control. PDF417 geometry is fixed by ISO/IEC 15438:
//   symbol width  = (69 + 17 × columns) modules   (start 17, 2 row indicators 34, stop 18)
//   symbol height = rows × 3 modules              (bwip-js default row height = 3X)
//   rows          = ceil(codewords / columns), between 3 and 90
// Fewer columns means more rows, so 1 column made a short payload a tall block. The studio
// now fits the slider to the payload (generator.controlHints): it starts on the count Auto
// picked, never goes below the fewest columns that keep the symbol at least as wide as it
// is tall, and stops where extra columns no longer remove rows. These tests prove every
// offered value follows the formulas exactly (so it scans), the range rule holds, and the
// page layout doesn't distort or jump. Never "fix" the shape by squashing the symbol.

import { test, expect } from '../support/fixtures.mjs';
import { sameImage } from '../support/studio.mjs';
import { decodeFirst } from '../support/decode.mjs';
import { BARCODE_GENERATORS, GENERATORS, SQUARE_2D, getGeneratorMeta } from '../support/catalog.mjs';
import { relDiff } from '../support/images.mjs';

const MAX_STAGE_JUMP_PX = Number(process.env.UCM_MAX_STAGE_JUMP_PX || 120);
const MAX_STAGE_HEIGHT_PX = Number(process.env.UCM_MAX_STAGE_HEIGHT_PX || 640);

const pdf417 = getGeneratorMeta('pdf417');

test.describe('GEO-PDF417 · data columns', () => {
  test('GEO-PDF-01 every offered column count follows the ISO 15438 width/height formulas exactly', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    await studio.setControl('padding', 0);
    await studio.waitForStableRender();
    const scale = Number(await studio.control('scale').inputValue());
    const live = await studio.sliderRange('columns');

    const rows = {};
    const report = [`live range ${live.min}…${live.max}, auto ${live.value}`];
    for (let c = live.min; c <= live.max; c++) {
      await studio.setControl('columns', c);
      await studio.page.waitForTimeout(250);
      const fp = await studio.waitForStableRender();
      await studio.expectNoRenderError();

      const modulesWide = fp.width / scale;
      const modulesTall = fp.height / scale;
      const rowsHere = Math.round(modulesTall / 3);
      rows[c] = rowsHere;
      report.push(`columns=${c}: ${fp.width}x${fp.height}px → ${modulesWide} modules wide, ${rowsHere} rows`);

      expect(modulesWide, `columns=${c}: width must be 69 + 17×${c} modules`).toBeCloseTo(69 + 17 * c, 0);
      expect(rowsHere, `columns=${c}: rows must be between 3 and 90`).toBeGreaterThanOrEqual(3);
      expect(rowsHere).toBeLessThanOrEqual(90);
      expect(modulesTall, `columns=${c}: offered counts keep the symbol at least as wide as tall`).toBeLessThanOrEqual(modulesWide);
      expect(await decodeFirst(await studio.previewPng()), `columns=${c} must scan back to the payload`).toBe(pdf417.defaultPayload);
    }
    await test.info().attach('pdf417-geometry', { body: report.join('\n'), contentType: 'text/plain' });

    // Rows never increase as columns increase, and the widest offered count still removes a row.
    for (let c = live.min + 1; c <= live.max; c++) {
      expect(rows[c], `rows(columns=${c}) must be ≤ rows(columns=${c - 1})`).toBeLessThanOrEqual(rows[c - 1]);
    }
    if (live.max > live.min) {
      expect(rows[live.max - 1], 'the widest offered count must still remove a row').toBeGreaterThan(rows[live.max]);
    }
    // One consistent codeword count N explains every row count: rows = max(3, ceil(N / c)).
    let lo = 0;
    let hi = Infinity;
    for (let c = live.min; c <= live.max; c++) {
      if (rows[c] > 3) {
        lo = Math.max(lo, (rows[c] - 1) * c + 1);
        hi = Math.min(hi, rows[c] * c);
      }
    }
    expect(lo, `row counts are inconsistent with a single codeword count (${JSON.stringify(rows)})`).toBeLessThanOrEqual(hi);

    // One column fewer than the minimum would be taller than wide (that's why it isn't offered).
    if (live.min > 1) {
      const below = await studio.page.evaluate(async ([text, cols]) => {
        const { loadBwip } = await import('/js/core/dynamic-loader.js');
        const bw = await loadBwip();
        try { const sym = bw.raw({ bcid: 'pdf417', text, columns: cols })[0]; return { w: sym.pixx, h: sym.pixy }; } catch (e) { return null; }
      }, [pdf417.defaultPayload, live.min - 1]);
      if (below) expect(below.h, `columns=${live.min - 1} should be taller than wide`).toBeGreaterThan(below.w);
    }
  });

  test('GEO-PDF-02 Auto picks a wide symbol, the thumb and badge show its column count, and it scans', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const auto = await studio.waitForStableRender();
    expect(auto.width / auto.height, 'auto columns should produce a wider-than-tall symbol').toBeGreaterThan(1.5);
    const live = await studio.sliderRange('columns');
    const scale = Number(await studio.control('scale').inputValue());
    const padding = Number(await studio.control('padding').inputValue());
    expect((auto.width / scale - 2 * padding - 69) / 17, 'thumb sits on the column count Auto drew').toBeCloseTo(live.value, 0);
    expect(await studio.badgeText('columns')).toBe(`Auto · ${live.value}`);
    expect(await studio.decodePreview()).toBe(pdf417.defaultPayload);
  });

  test('GEO-PDF-03 stepping from Auto to the narrowest and back with Auto is reversible and never distorts', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const start = await studio.waitForStableRender();
    const live = await studio.sliderRange('columns');
    const seen = [];
    const steps = [...new Set([live.min, Math.min(live.min + 1, live.max)])].filter((c) => c !== live.value);
    for (const c of steps) {
      const before = await studio.fingerprint();
      await studio.setControl('columns', c);
      const fp = await studio.waitForChange(before, { what: `columns → ${c}` });
      seen.push(`columns=${c}: canvas ${fp.width}x${fp.height}, shown ${Math.round(fp.displayWidth)}x${Math.round(fp.displayHeight)}, stage ${Math.round(fp.stageHeight)}px`);
      expect(relDiff(fp.displayWidth / fp.displayHeight, fp.width / fp.height), `columns=${c}: preview is stretched`).toBeLessThan(0.02);
      expect(fp.overflowsStage, `columns=${c}: preview spills outside the stage`).toBe(false);
      expect(fp.height, `columns=${c}: never taller than wide`).toBeLessThanOrEqual(fp.width);
    }
    await expect(studio.page.locator('[data-auto-for="columns"]'), 'Auto button appears after a manual choice').toBeVisible();
    await studio.clickAuto('columns');
    await studio.page.waitForTimeout(300);
    await test.info().attach('pdf417-steps', { body: seen.join('\n'), contentType: 'text/plain' });
    expect(sameImage((await studio.waitForStableRender()), start), 'Auto should give the original image').toBe(true);
    expect(await studio.badgeText('columns')).toBe(`Auto · ${live.value}`);
  });

  test('GEO-PDF-05 the slider range follows the payload length', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const ranges = [];
    for (const len of [10, 300, 1000]) {
      await studio.page.fill('#payload-input', 'ABCDEFGHIJ'.repeat(len / 10));
      await studio.page.waitForTimeout(400);
      await studio.waitForStableRender();
      const live = await studio.sliderRange('columns');
      ranges.push({ len, ...live });
      await studio.setControl('columns', live.min);
      await studio.page.waitForTimeout(400);
      const fp = await studio.waitForStableRender();
      await studio.expectNoRenderError();
      expect(fp.height, `${len} chars at the narrowest offered count: never taller than wide`).toBeLessThanOrEqual(fp.width);
      await studio.clickAuto('columns');
    }
    await test.info().attach('pdf417-ranges', { body: JSON.stringify(ranges, null, 2), contentType: 'application/json' });
    expect(ranges[2].min, 'longer text needs more columns to stay wide').toBeGreaterThan(ranges[0].min);
    expect(ranges[2].value, 'Auto uses more columns for longer text').toBeGreaterThan(ranges[0].value);
  });

  test('GEO-PDF-04 stage height stays within limits for every columns × scale combination', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const baseline = (await studio.fingerprint()).stageHeight;
    const scaleCtrl = pdf417.controls.find((c) => c.id === 'scale');
    const rows = [];
    for (const scale of [scaleCtrl.default, scaleCtrl.max]) {
      await studio.setControl('scale', scale);
      const live = await studio.sliderRange('columns');
      for (const c of ['auto', live.min, live.max]) {
        if (c === 'auto') {
          if (await studio.page.locator('[data-auto-for="columns"]').isVisible()) await studio.clickAuto('columns');
        } else {
          await studio.setControl('columns', c);
        }
        await studio.page.waitForTimeout(350);
        const fp = await studio.waitForStableRender();
        rows.push({ scale, columns: c, stage: Math.round(fp.stageHeight), shown: `${Math.round(fp.displayWidth)}x${Math.round(fp.displayHeight)}` });
      }
    }
    await test.info().attach('pdf417-stage-heights', { body: JSON.stringify({ baseline, rows }, null, 2), contentType: 'application/json' });
    const tooTall = rows.filter((r) => r.stage > MAX_STAGE_HEIGHT_PX);
    expect(tooTall, `stage taller than ${MAX_STAGE_HEIGHT_PX}px (UCM_MAX_STAGE_HEIGHT_PX)`).toEqual([]);
    const jumps = rows.filter((r) => r.scale === scaleCtrl.default && Math.abs(r.stage - baseline) > MAX_STAGE_JUMP_PX);
    expect(jumps, `at default scale the stage moved more than ${MAX_STAGE_JUMP_PX}px from ${baseline}px (UCM_MAX_STAGE_JUMP_PX)`).toEqual([]);
  });
});

test.describe('GEO · every generator keeps its shape and fits the stage', () => {
  for (const g of BARCODE_GENERATORS) {
    const sliders = g.controls.filter((c) => c.type === 'slider');
    test(`GEO-01 ${g.id}: no stretching, no overflow, no big stage jumps at slider extremes`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      const baseline = await studio.fingerprint();
      const log = [];
      for (const s of sliders) {
        for (const v of [s.min, s.max]) {
          await studio.setControl(s.id, v);
          await studio.page.waitForTimeout(350);
          const fp = await studio.waitForStableRender();
          log.push(`${s.id}=${v}: canvas ${fp.width}x${fp.height} shown ${Math.round(fp.displayWidth)}x${Math.round(fp.displayHeight)} stage ${Math.round(fp.stageWidth)}x${Math.round(fp.stageHeight)}`);
          expect(relDiff(fp.displayWidth / fp.displayHeight, fp.width / fp.height), `${s.id}=${v}: preview stretched`).toBeLessThan(0.02);
          expect(fp.overflowsStage, `${s.id}=${v}: preview spills outside the stage`).toBe(false);
          expect(fp.displayWidth, `${s.id}=${v}: preview too small to see`).toBeGreaterThan(60);
          expect(fp.stageHeight, `${s.id}=${v}: stage taller than ${MAX_STAGE_HEIGHT_PX}px`).toBeLessThanOrEqual(MAX_STAGE_HEIGHT_PX);
          if (s.id !== 'scale') {
            expect(Math.abs(fp.stageHeight - baseline.stageHeight), `${s.id}=${v}: stage jumped`).toBeLessThanOrEqual(MAX_STAGE_JUMP_PX);
          }
        }
        await studio.setControl(s.id, s.default);
      }
      await test.info().attach(`${g.id}-geometry`, { body: log.join('\n'), contentType: 'text/plain' });
    });
  }

  for (const id of [...SQUARE_2D, 'qr-code']) {
    test(`GEO-02 ${id}: square matrix code renders exactly 1:1`, async ({ studio }) => {
      await studio.open(`?symbology=${id}`);
      const fp = await studio.fingerprint();
      expect(fp.width, `${id} canvas ${fp.width}x${fp.height} is not square`).toBe(fp.height);
    });
  }

  test('GEO-03 stage width is identical for every generator (no layout shift when switching)', async ({ studio }) => {
    await studio.open();
    const widths = {};
    for (const g of GENERATORS) {
      await studio.selectGenerator(g.id);
      widths[g.id] = Math.round((await studio.fingerprint()).stageWidth);
    }
    expect(new Set(Object.values(widths)).size, `stage widths differ: ${JSON.stringify(widths)}`).toBe(1);
  });

  test('GEO-04 at defaults, stage heights are consistent across generators', async ({ studio }) => {
    await studio.open();
    const heights = {};
    for (const g of GENERATORS) {
      await studio.selectGenerator(g.id);
      heights[g.id] = Math.round((await studio.fingerprint()).stageHeight);
    }
    const min = Math.min(...Object.values(heights));
    const max = Math.max(...Object.values(heights));
    expect(max - min, `default stage heights vary by ${max - min}px: ${JSON.stringify(heights)}`).toBeLessThanOrEqual(MAX_STAGE_JUMP_PX);
  });

  test('GEO-05 phone width: every generator at maximum scale still fits without sideways scrolling', async ({ studio, page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const g of BARCODE_GENERATORS) {
      await studio.open(`?symbology=${g.id}`);
      const scale = g.controls.find((c) => c.id === 'scale');
      if (scale) await studio.setControl('scale', scale.max);
      await page.waitForTimeout(350);
      const fp = await studio.waitForStableRender();
      expect(fp.overflowsStage, `${g.id}: preview spills out of the stage on a phone`).toBe(false);
      const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      expect(overflow, `${g.id}: page scrolls sideways on a phone`).toBeLessThanOrEqual(1);
    }
  });
});
