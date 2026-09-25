// Page object for the studio (index.html).
// Reads the preview straight from the canvas pixels, so "did the preview change?"
// is answered by the actual image, not by DOM state.

import { expect } from '@playwright/test';
import { decodeFirst } from './decode.mjs';

const RENDER_TIMEOUT = 8_000;

/**
 * Render a known state in a separate, fresh tab and return its fingerprint.
 * Used as the "correct answer" when checking that UI interaction produced the right image.
 * @param {import('@playwright/test').BrowserContext} context
 */
export async function referenceFingerprint(context, { query = '', payload, controls = {} } = {}) {
  const page = await context.newPage();
  try {
    const s = new Studio(page);
    await s.open(query);
    if (payload !== undefined) await s.setPayload(payload);
    for (const [id, value] of Object.entries(controls)) await s.setControl(id, value);
    await page.waitForTimeout(400);
    return await s.waitForStableRender();
  } finally {
    await page.close();
  }
}

/**
 * True when two fingerprints show the same picture: identical size, and no 32x32 grid cell
 * whose average colour moved by more than 12 (of 255) in any channel on more than 2 cells.
 * Exact pixel hashes are too strict for anti-aliased QR shapes (edge pixels vary with load).
 */
export function sameImage(a, b) {
  if (!a || !b) return false;
  if (a.hash === b.hash) return true;
  if (a.width !== b.width || a.height !== b.height || !a.grid || !b.grid) return false;
  let changedCells = 0;
  for (let c = 0; c < a.grid.length; c += 3) {
    if (Math.abs(a.grid[c] - b.grid[c]) > 12 || Math.abs(a.grid[c + 1] - b.grid[c + 1]) > 12 || Math.abs(a.grid[c + 2] - b.grid[c + 2]) > 12) changedCells++;
  }
  return changedCells <= 2;
}

export class Studio {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.payloadInput = page.locator('#payload-input');
    this.symbologySelect = page.locator('#symbology-select');
    this.stage = page.locator('#preview-stage');
    this.errorBox = page.locator('#preview-error-box');
    this.errorText = page.locator('#preview-error-text');
    this.validationStatus = page.locator('#validation-status');
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  async open(query = '', { waitForRender = true } = {}) {
    await this.page.goto(`/index.html${query}`);
    if (waitForRender) await this.waitForStableRender();
  }

  // -------------------------------------------------------------------------
  // Preview inspection
  // -------------------------------------------------------------------------

  /**
   * Fingerprint of the visible preview: pixel hash, intrinsic and displayed size,
   * stage size, ink ratio and transparency ratio. Returns null when nothing is drawn.
   */
  async fingerprint() {
    return this.page.evaluate(() => {
      const qrBox = document.querySelector('#qr-styled-container');
      const bwipCanvas = document.querySelector('#preview-canvas');
      const qrVisible = qrBox && getComputedStyle(qrBox).display !== 'none';
      const canvas = qrVisible ? qrBox.querySelector('canvas') : bwipCanvas;
      if (!canvas || !canvas.width || !canvas.height || getComputedStyle(canvas).display === 'none') return null;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let hash = 0x811c9dc5;
      let ink = 0;
      let transparent = 0;
      for (let i = 0; i < data.length; i += 4) {
        for (let k = 0; k < 4; k++) {
          hash ^= data[i + k];
          hash = Math.imul(hash, 16777619);
        }
        if (data[i + 3] === 0) transparent++;
        else if (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2] < 128) ink++;
      }
      const pixels = canvas.width * canvas.height;
      // 32x32 grid of average RGB (alpha-composited on magenta, so transparency counts): noise averages
      // out, real visual changes do not.
      const G = 32;
      const sums = new Float64Array(G * G * 3);
      const counts = new Uint32Array(G * G);
      for (let y = 0; y < canvas.height; y++) {
        const gy = Math.min(G - 1, Math.floor((y * G) / canvas.height));
        for (let x = 0; x < canvas.width; x++) {
          const gx = Math.min(G - 1, Math.floor((x * G) / canvas.width));
          const i = (y * canvas.width + x) * 4;
          const a = data[i + 3] / 255;
          const cell = gy * G + gx;
          sums[cell * 3] += data[i] * a + 255 * (1 - a);
          sums[cell * 3 + 1] += data[i + 1] * a;
          sums[cell * 3 + 2] += data[i + 2] * a + 255 * (1 - a);
          counts[cell]++;
        }
      }
      const grid = Array.from(sums, (v, k) => Math.round(v / Math.max(1, counts[Math.floor(k / 3)])));
      const box = canvas.getBoundingClientRect();
      const stage = document.querySelector('#preview-stage').getBoundingClientRect();
      const errorBox = document.querySelector('#preview-error-box');
      return {
        kind: qrVisible ? 'qr' : 'bwip',
        grid,
        hash: (hash >>> 0).toString(16),
        width: canvas.width,
        height: canvas.height,
        displayWidth: box.width,
        displayHeight: box.height,
        stageWidth: stage.width,
        stageHeight: stage.height,
        overflowsStage: box.left < stage.left - 1 || box.right > stage.right + 1 || box.top < stage.top - 1 || box.bottom > stage.bottom + 1,
        inkRatio: ink / pixels,
        transparentRatio: transparent / pixels,
        errorVisible: !!errorBox && getComputedStyle(errorBox).display !== 'none',
      };
    });
  }

  /** Let qr-code-styling finish its asynchronous canvas drawing, then two frames. */
  async drawingSettled() {
    await this.page.evaluate(async () => {
      const q = window.v2StudioApp?.engine?.currentQrInstance;
      if (q && q._canvasDrawingPromise) await q._canvasDrawingPromise.catch(() => {});
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }).catch(() => {});
  }

  /** Wait until a non-blank preview exists and is unchanged across three polls. */
  async waitForStableRender({ timeout = RENDER_TIMEOUT } = {}) {
    const deadline = Date.now() + timeout;
    let last = null;
    let same = 0;
    while (Date.now() < deadline) {
      await this.drawingSettled();
      const fp = await this.fingerprint();
      same = fp && last && sameImage(fp, last) ? same + 1 : 0;
      if (fp && fp.inkRatio > 0.001 && same >= 2) return fp;
      last = fp;
      await this.page.waitForTimeout(200);
    }
    throw new Error(`Preview did not settle within ${timeout}ms. Last fingerprint: ${JSON.stringify(last)}`);
  }

  /**
   * Wait until the preview differs from `before`, then until it settles.
   * Fails with a clear message when a control had no visible effect.
   */
  async waitForChange(before, { timeout = RENDER_TIMEOUT, what = 'the change' } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const fp = await this.fingerprint();
      if (fp && !sameImage(fp, before)) return this.waitForStableRender({ timeout });
      await this.page.waitForTimeout(120);
    }
    throw new Error(`Preview did not change after ${what} (still hash ${before.hash}, ${before.width}x${before.height}).`);
  }

  /** Assert the preview stays identical for `ms` milliseconds (for no-op actions). */
  async expectNoChange(before, ms = 600) {
    await this.page.waitForTimeout(ms);
    const fp = await this.fingerprint();
    expect(sameImage(fp, before), 'preview should not have changed').toBe(true);
    return fp;
  }

  /** PNG of the current preview, composited on a solid background with an extra quiet zone. */
  async previewPng({ margin = 32, background = '#ffffff' } = {}) {
    const dataUrl = await this.page.evaluate(({ margin, background }) => {
      const qrBox = document.querySelector('#qr-styled-container');
      const qrVisible = qrBox && getComputedStyle(qrBox).display !== 'none';
      const src = qrVisible ? qrBox.querySelector('canvas') : document.querySelector('#preview-canvas');
      const out = document.createElement('canvas');
      out.width = src.width + margin * 2;
      out.height = src.height + margin * 2;
      const ctx = out.getContext('2d');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(src, margin, margin);
      return out.toDataURL('image/png');
    }, { margin, background });
    return Buffer.from(dataUrl.split(',')[1], 'base64');
  }

  /** Decode the visible preview with the reference decoder. */
  async decodePreview(opts) {
    return decodeFirst(await this.previewPng(opts));
  }

  async expectNoRenderError() {
    await expect(this.errorBox, `render error shown: ${await this.errorText.textContent().catch(() => '')}`).toBeHidden();
  }

  // -------------------------------------------------------------------------
  // Internal state (read-only, used for clearer failure messages)
  // -------------------------------------------------------------------------

  async appState() {
    return this.page.evaluate(() => {
      const app = window.v2StudioApp;
      if (!app) return null;
      return {
        generatorId: app.currentGenerator?.id ?? null,
        wizardId: app.activeWizardId,
        options: { ...app.currentOptions },
        qrOptions: { ...app.qrOptions },
        barcodeOptions: { ...app.barcodeOptions },
        cornerRadius: app.cornerRadius,
      };
    });
  }

  // -------------------------------------------------------------------------
  // Inputs
  // -------------------------------------------------------------------------

  async selectGenerator(id) {
    const hasOption = await this.symbologySelect.locator(`option[value="${id}"]`).count();
    if (!hasOption) await this.page.locator('.cat-pill[data-category="all"]').click();
    await this.symbologySelect.selectOption(id);
    await expect(this.symbologySelect).toHaveValue(id);
    await this.waitForStableRender();
  }

  async setPayload(text) {
    await this.payloadInput.fill(text);
  }

  async selectWizard(id) {
    await this.page.locator(`.wiz-tab-btn[data-wizard="${id}"]`).click();
    await expect(this.page.locator(`.wiz-tab-btn[data-wizard="${id}"]`)).toHaveClass(/active/);
  }

  /** Fill wizard fields: { fieldId: value } (booleans for checkboxes). */
  async fillWizard(values) {
    for (const [field, value] of Object.entries(values)) {
      const input = this.page.locator(`#wizard-form-container .wizard-input[data-field="${field}"]`);
      const tag = await input.evaluate((el) => `${el.tagName.toLowerCase()}:${el.type}`);
      if (tag.startsWith('select')) await input.selectOption(String(value));
      else if (tag.endsWith(':checkbox')) {
        await input.evaluate((e, v) => {
          if (e.checked !== v) {
            e.checked = v;
            e.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, Boolean(value));
      }
      else await input.fill(String(value));
    }
  }

  /** Dynamic generator control (#ctrl-<id>) — works for range, checkbox, select, color, text. */
  control(id) {
    return this.page.locator(`#ctrl-${id}`);
  }

  async setControl(id, value) {
    const el = this.control(id);
    await expect(el, `control #ctrl-${id} should exist`).toHaveCount(1);
    const kind = await el.evaluate((e) => (e.tagName === 'SELECT' ? 'select' : e.type));
    if (kind === 'select') {
      await el.selectOption(String(value));
    } else if (kind === 'checkbox') {
      // The real checkbox is visually hidden behind a custom switch; toggle it like a click would.
      await el.evaluate((e, v) => {
        if (e.checked !== v) {
          e.checked = v;
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, Boolean(value));
    } else {
      // Range/color inputs: set the value like a browser does, then fire input + change.
      await el.evaluate((e, v) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(e, String(v));
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }
  }

  /** Move a slider with real key presses (the way a keyboard user or a fast drag does). */
  async nudgeSlider(id, key = 'ArrowRight', times = 1) {
    const el = this.control(id);
    await el.focus();
    for (let i = 0; i < times; i++) await this.page.keyboard.press(key);
  }

  async badgeText(id) {
    return (await this.page.locator(`#val-${id}`).textContent())?.trim();
  }

  // -------------------------------------------------------------------------
  // Downloads
  // -------------------------------------------------------------------------

  /** Click something that triggers a download; returns { filename, buffer }. */
  async download(trigger) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 20_000 }),
      typeof trigger === 'function' ? trigger() : trigger.click(),
    ]);
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { filename: download.suggestedFilename(), buffer: Buffer.concat(chunks) };
  }

  async toastTexts() {
    return this.page.locator('#toast-container .tactile-toast').allTextContents();
  }
}
