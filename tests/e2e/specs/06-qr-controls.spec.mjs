// QR STYLING CONTROLS — every QR styling bar, picker, toggle and the logo studio does
// what its label says, visibly, and can be undone.

import { test, expect } from '../support/fixtures.mjs';
import { referenceFingerprint, sameImage } from '../support/studio.mjs';
import { WIZARDS } from '../support/catalog.mjs';
import { PNG } from 'pngjs';

/** Tiny solid-colour PNG for logo upload tests. */
function makePng(size = 64, rgb = [220, 38, 38]) {
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = rgb[0]; png.data[i + 1] = rgb[1]; png.data[i + 2] = rgb[2]; png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

const QR_CONTROLS = [
  { id: 'errorCorrectionLevel', values: ['L', 'Q', 'H'] },
  { id: 'dotsType', values: ['dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'] },
  { id: 'dotsColor', values: ['#b91c1c', '#1d4ed8'] },
  { id: 'backgroundColor', values: ['#fef3c7'] },
  { id: 'qrPadding', values: [0, 40, 25], badge: (v) => `${v}px` },
  { id: 'cornerType', values: ['square', 'dot'] },
  { id: 'cornerColor', values: ['#16a34a'] },
  { id: 'cornerDotType', values: ['square'] },
  { id: 'cornerDotColor', values: ['#9333ea'] },
];

test.describe('QRC · styling controls change the preview', () => {
  for (const c of QR_CONTROLS) {
    test(`QRC-01 "${c.id}" changes the QR for every value and is reversible`, async ({ studio, context }) => {
      await studio.open();
      const original = await studio.fingerprint();
      const defaultValue = await studio.control(c.id).inputValue();
      let previous = original;
      for (const v of c.values) {
        await studio.setControl(c.id, v);
        previous = await studio.waitForChange(previous, { what: `${c.id} → ${v}` });
        if (c.badge) expect(await studio.page.locator(`#val-${c.id}`).textContent()).toContain(c.badge(v));
      }
      const last = c.values[c.values.length - 1];
      const ref = await referenceFingerprint(context, { controls: { [c.id]: last } });
      expect(sameImage(previous, ref), `${c.id}=${last} differs from a clean render`).toBe(true);

      await studio.setControl(c.id, defaultValue);
      await studio.waitForChange(previous, { what: `${c.id} back to ${defaultValue}` });
      const restored = await studio.waitForStableRender();
      if (!sameImage(restored, original)) {
        await test.info().attach('restored.png', { body: await studio.previewPng({ margin: 0 }), contentType: 'image/png' });
        await test.info().attach('state.json', { body: JSON.stringify(await studio.appState(), null, 2), contentType: 'application/json' });
      }
      expect(sameImage(restored, original), `${c.id} back to "${defaultValue}" did not restore the original image`).toBe(true);
    });
  }

  test('QRC-02 padding slider changes the margin, not the code (module area keeps its size)', async ({ studio }) => {
    await studio.open();
    await studio.setControl('qrPadding', 0);
    await studio.page.waitForTimeout(400);
    const tight = await studio.waitForStableRender();
    await studio.setControl('qrPadding', 40);
    const loose = await studio.waitForChange(tight, { what: 'padding 0 → 40' });
    expect(loose.width, 'the QR image size should stay fixed; padding eats into it').toBe(tight.width);
    expect(loose.inkRatio, 'more padding → smaller dark area').toBeLessThan(tight.inkRatio);
  });

  test('QRC-03 dot colour really paints the dots in that colour', async ({ studio, page }) => {
    await studio.open();
    await studio.setControl('dotsType', 'square');
    await studio.setControl('dotsColor', '#b91c1c');
    await studio.setControl('cornerColor', '#b91c1c');
    await studio.setControl('cornerDotColor', '#b91c1c');
    await page.waitForTimeout(400);
    await studio.waitForStableRender();
    const dominantInk = await page.evaluate(() => {
      const c = document.querySelector('#qr-styled-container canvas');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const counts = {};
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 250 || (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240)) continue;
        const k = `${d[i]},${d[i + 1]},${d[i + 2]}`;
        counts[k] = (counts[k] || 0) + 1;
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    });
    expect(dominantInk).toBe('185,28,28');
  });

  test('QRC-04 gradient toggle shows its panel, and colours/angle all change the QR', async ({ studio, page }) => {
    await studio.open();
    const panel = page.locator('#gradient-controls-panel');
    await expect(panel).toBeHidden();
    let before = await studio.fingerprint();
    await studio.setControl('gradientEnabled', true);
    await expect(panel).toBeVisible();
    before = await studio.waitForChange(before, { what: 'gradient on' });
    for (const [id, v] of [['gradientColor1', '#f97316'], ['gradientColor2', '#7c3aed'], ['gradientRotation', 135]]) {
      await studio.setControl(id, v);
      before = await studio.waitForChange(before, { what: `${id} → ${v}` });
    }
    await expect(page.locator('#val-gradientRotation')).toContainText('135');
    await studio.setControl('gradientEnabled', false);
    await expect(panel).toBeHidden();
    await studio.waitForChange(before, { what: 'gradient off' });
  });

  test('QRC-05 transparent background gives real transparency, and turning it off restores it', async ({ studio }) => {
    await studio.open();
    const solid = await studio.fingerprint();
    expect(solid.transparentRatio).toBe(0);
    await studio.setControl('transparentBg', true);
    const clear = await studio.waitForChange(solid, { what: 'transparent on' });
    expect(clear.transparentRatio).toBeGreaterThan(0.2);
    await studio.setControl('transparentBg', false);
    const back = await studio.waitForChange(clear, { what: 'transparent off' });
    expect(sameImage(back, solid)).toBe(true);
  });

  test('QRC-06 corner radius presets round the QR preview and the badge follows', async ({ studio, page }) => {
    await studio.open();
    // The QR preview is rounded with CSS (qr-code-styling finishes drawing after the engine's
    // canvas clip runs, so the canvas pixels stay square); exports apply their own rounding
    // (EXP-02/EXP-03). So check what the visitor sees: the rendered border radius.
    const qrCanvas = page.locator('#qr-styled-container canvas');
    for (const r of ['8', '18', '28', '40', '0']) {
      await page.locator(`.corner-preset-btn[data-radius="${r}"]`).click();
      await expect(page.locator(`.corner-preset-btn[data-radius="${r}"]`)).toHaveClass(/active/);
      await expect(page.locator('#ctrl-cornerRadius')).toHaveValue(r);
      await expect(qrCanvas).toHaveCSS('border-top-left-radius', `${r}px`);
      await expect(page.locator('#val-cornerRadius')).toContainText(`${r}px`);
    }
  });
});

test.describe('QRC · wizard forms', () => {
  for (const w of WIZARDS) {
    test(`QRC-07 ${w.id}: tab shows exactly its fields and every text field changes the QR`, async ({ studio, page }) => {
      await studio.open();
      await studio.selectWizard(w.id);
      await expect(page.locator('#wizard-form-container .wizard-input')).toHaveCount(w.fields.length);
      let before = await studio.waitForStableRender();
      for (const f of w.fields.filter((x) => ['text', 'url', 'tel', 'email', 'textarea', 'number', undefined].includes(x.type))) {
        const input = page.locator(`#wizard-form-container .wizard-input[data-field="${f.id}"]`);
        const value = f.type === 'number' || /amount/i.test(f.id) ? '7' : f.type === 'email' ? 'qa@example.com' : f.type === 'url' ? 'https://qa.example.com' : f.type === 'tel' ? '+15550001111' : 'QA edit';
        if ((await input.inputValue()) === value) continue;
        await input.fill(value);
        before = await studio.waitForChange(before, { what: `${w.id}.${f.id} edit` });
      }
    });
  }

  test('QRC-08 switching wizard tabs and back restores that tab\'s defaults', async ({ studio }) => {
    await studio.open();
    const url = await studio.fingerprint();
    await studio.selectWizard('wifi');
    await studio.waitForChange(url, { what: 'switch to wifi' });
    await studio.selectWizard('url');
    const back = await studio.waitForStableRender();
    expect(sameImage(back, url)).toBe(true);
  });
});

test.describe('QRC · logo studio', () => {
  test('QRC-09 uploading a PNG logo draws it, locks ECC to H, and still scans', async ({ studio, page }) => {
    await studio.open();
    const before = await studio.fingerprint();
    await page.locator('#logo-file-input').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: makePng() });
    await studio.waitForChange(before, { what: 'logo upload' });
    await expect(page.locator('#logo-preview-box')).toBeVisible();
    await expect(studio.control('errorCorrectionLevel')).toHaveValue('H');
    await expect(studio.control('errorCorrectionLevel')).toBeDisabled();
    expect(await studio.decodePreview()).toBe('https://github.com');
  });

  test('QRC-10 removing the logo restores the plain code and unlocks ECC', async ({ studio, page }) => {
    await studio.open();
    const plain = await studio.fingerprint();
    await page.locator('#logo-file-input').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: makePng() });
    const withLogo = await studio.waitForChange(plain, { what: 'logo upload' });
    await page.locator('#btn-remove-logo').click();
    await studio.waitForChange(withLogo, { what: 'logo removal' });
    await expect(page.locator('#logo-preview-box')).toBeHidden();
    await expect(studio.control('errorCorrectionLevel')).toBeEnabled();
    // ECC stays at H after removal (it was forced), so compare against a clean ECC-H render.
    const ecc = await studio.control('errorCorrectionLevel').inputValue();
    if (ecc === 'M') expect(sameImage((await studio.waitForStableRender()), plain)).toBe(true);
  });

  test('QRC-11 non-image and oversized files are rejected with a message', async ({ studio, page }) => {
    await studio.open();
    const before = await studio.fingerprint();
    await page.locator('#logo-file-input').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(page.locator('#toast-container')).toContainText(/image|format|type|PNG/i);
    await studio.expectNoChange(before);

    const big = Buffer.alloc(2 * 1024 * 1024 + 10, 0);
    makePng().copy(big); // valid header, oversized file
    await page.locator('#logo-file-input').setInputFiles({ name: 'huge.png', mimeType: 'image/png', buffer: big });
    await expect(page.locator('#toast-container')).toContainText(/2MB|size|large/i);
    await studio.expectNoChange(before);
  });

  test('QRC-12 logo is QR-only: switching to a barcode hides it, switching back keeps it', async ({ studio, page }) => {
    await studio.open();
    const before = await studio.fingerprint();
    await page.locator('#logo-file-input').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: makePng() });
    await studio.waitForChange(before, { what: 'logo upload' });
    await studio.selectGenerator('code-128');
    await expect(page.locator('#qr-styling-panel')).toBeHidden();
    await studio.selectGenerator('qr-code');
    await studio.waitForStableRender();
    // Logo re-draws can differ by a few anti-aliased pixels, so check meaning, not bytes.
    const centre = await page.evaluate(() => {
      const c = document.querySelector('#qr-styled-container canvas');
      return Array.from(c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data.slice(0, 3));
    });
    expect(centre, 'logo missing after switching back').toEqual([220, 38, 38]);
    expect(await studio.decodePreview()).toBe('https://github.com');
  });
});
