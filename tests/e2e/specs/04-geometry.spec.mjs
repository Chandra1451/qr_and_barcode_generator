// GEOMETRY & LAYOUT — the preview keeps the right shape and the stage does not jump.
//
// Includes the PDF417 "Data Columns" case: 0 (auto) and 2 look normal, 1 looks much taller.
// PDF417 geometry is fixed by ISO/IEC 15438:
//   symbol width  = (69 + 17 × columns) modules   (start 17, 2 row indicators 34, stop 18)
//   symbol height = rows × 3 modules              (bwip-js default row height = 3X)
//   rows          = ceil(codewords / columns), between 3 and 90
// With ONE data column, every codeword needs its own row, so a tall, narrow symbol is the
// correct output. These tests prove the symbol follows those formulas exactly (so it scans),
// and separately check the page layout: no distortion, no overflow, no big stage jumps.
// If the tall 1-column symbol is a UX problem, fix the presentation (fit-to-stage preview,
// a hint, or min = 2), never by squashing the symbol.

import { test, expect } from '../support/fixtures.mjs';
import { sameImage } from '../support/studio.mjs';
import { decodeFirst } from '../support/decode.mjs';
import { BARCODE_GENERATORS, GENERATORS, SQUARE_2D, getGeneratorMeta } from '../support/catalog.mjs';
import { relDiff } from '../support/images.mjs';

const MAX_STAGE_JUMP_PX = Number(process.env.UCM_MAX_STAGE_JUMP_PX || 120);
const MAX_STAGE_HEIGHT_PX = Number(process.env.UCM_MAX_STAGE_HEIGHT_PX || 640);

const pdf417 = getGeneratorMeta('pdf417');
const pdfColumns = pdf417.controls.find((c) => c.id === 'columns');

test.describe('GEO-PDF417 · data columns', () => {
  test('GEO-PDF-01 columns 1…max follow the ISO 15438 width/height formulas exactly', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    await studio.setControl('padding', 0);
    await studio.page.waitForTimeout(300);
    const scale = Number(await studio.control('scale').inputValue());

    const rows = {};
    const report = [];
    for (let c = 1; c <= pdfColumns.max; c++) {
      const before = await studio.fingerprint();
      await studio.setControl('columns', c);
      const fp = await studio.waitForChange(before, { what: `columns → ${c}` });
      await studio.expectNoRenderError();

      const modulesWide = fp.width / scale;
      const rowsHere = Math.round(fp.height / (3 * scale));
      rows[c] = rowsHere;
      report.push(`columns=${c}: ${fp.width}x${fp.height}px → ${modulesWide} modules wide, ${rowsHere} rows`);

      expect(modulesWide, `columns=${c}: width must be 69 + 17×${c} modules`).toBeCloseTo(69 + 17 * c, 0);
      expect(rowsHere, `columns=${c}: rows must be between 3 and 90`).toBeGreaterThanOrEqual(3);
      expect(rowsHere).toBeLessThanOrEqual(90);
      expect(await decodeFirst(await studio.previewPng()), `columns=${c} must scan back to the payload`).toBe(pdf417.defaultPayload);
    }
    await test.info().attach('pdf417-geometry', { body: report.join('\n'), contentType: 'text/plain' });

    // Rows never increase as columns increase.
    for (let c = 2; c <= pdfColumns.max; c++) {
      expect(rows[c], `rows(columns=${c}) must be ≤ rows(columns=${c - 1})`).toBeLessThanOrEqual(rows[c - 1]);
    }
    // One consistent codeword count N explains every row count: rows = max(3, ceil(N / c)).
    let lo = 0;
    let hi = Infinity;
    for (let c = 1; c <= pdfColumns.max; c++) {
      if (rows[c] > 3) {
        lo = Math.max(lo, (rows[c] - 1) * c + 1);
        hi = Math.min(hi, rows[c] * c);
      }
    }
    expect(lo, `row counts are inconsistent with a single codeword count (${JSON.stringify(rows)})`).toBeLessThanOrEqual(hi);
  });

  test('GEO-PDF-02 auto (0) picks a wide symbol, and every value scans', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const auto = await studio.fingerprint();
    expect(auto.width / auto.height, 'auto columns should produce a wider-than-tall symbol').toBeGreaterThan(1.5);
    expect(await studio.decodePreview()).toBe(pdf417.defaultPayload);
  });

  test('GEO-PDF-03 stepping 0 → 1 → 2 → 0 is reversible and never distorts the preview', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const start = await studio.fingerprint();
    const seen = [];
    for (const c of [1, 2, 0]) {
      const before = await studio.fingerprint();
      await studio.setControl('columns', c);
      const fp = await studio.waitForChange(before, { what: `columns → ${c}` });
      seen.push(`columns=${c}: canvas ${fp.width}x${fp.height}, shown ${Math.round(fp.displayWidth)}x${Math.round(fp.displayHeight)}, stage ${Math.round(fp.stageHeight)}px`);
      expect(relDiff(fp.displayWidth / fp.displayHeight, fp.width / fp.height), `columns=${c}: preview is stretched`).toBeLessThan(0.02);
      expect(fp.overflowsStage, `columns=${c}: preview spills outside the stage`).toBe(false);
    }
    await test.info().attach('pdf417-steps', { body: seen.join('\n'), contentType: 'text/plain' });
    expect(sameImage((await studio.fingerprint()), start), 'columns back to 0 should give the original image').toBe(true);
  });

  test('GEO-PDF-04 stage height stays within limits for every columns × scale combination', async ({ studio }) => {
    await studio.open('?symbology=pdf417');
    const baseline = (await studio.fingerprint()).stageHeight;
    const scaleCtrl = pdf417.controls.find((c) => c.id === 'scale');
    const rows = [];
    for (const scale of [scaleCtrl.default, scaleCtrl.max]) {
      await studio.setControl('scale', scale);
      for (const c of [0, 1, 2, pdfColumns.max]) {
        await studio.setControl('columns', c);
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
