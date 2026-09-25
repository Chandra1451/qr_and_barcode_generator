// OUTPUT CORRECTNESS — what the studio draws scans back to exactly what the user meant.
//
// Every preview is decoded with an independent reference decoder (ZXing). Expected values
// come from the standards (GS1 check digits, Wi-Fi/mailto/tel/EIP-681/iCalendar formats),
// not from the site's own code, so a bug in the site cannot hide itself.

import { test, expect } from '../support/fixtures.mjs';
import {
  BARCODE_GENERATORS, WIZARDS, wizardDefaults, expectedScanText, normaliseScan, getGeneratorMeta,
} from '../support/catalog.mjs';

async function scan(studio, generatorId, opts) {
  const text = await studio.decodePreview(opts);
  expect(text, `${generatorId}: the reference decoder could not read the preview`).not.toBeNull();
  return normaliseScan(generatorId, text);
}

test.describe('DEC · barcodes scan back to the payload', () => {
  for (const g of BARCODE_GENERATORS) {
    test(`DEC-01 ${g.id}: default payload scans correctly`, async ({ studio }) => {
      await studio.open(`?symbology=${g.id}`);
      expect(await scan(studio, g.id)).toBe(normaliseScan(g.id, expectedScanText(g.id, g.defaultPayload)));
    });
  }

  const EDGE_CASES = {
    'code-128': ['ABC-123 abc_!@#', '0123456789012345', 'a', 'X003B7TEST', 'The quick brown fox jumps over the lazy dog 1234567890'],
    'code-39': ['ABC-123 $/+%', 'HELLO WORLD', '0'],
    'ean-13': ['4006381333931', '400638133393', '000000000000'],
    'upc-a': ['03600029145', '036000291452', '12345678901'],
    'itf-14': ['1540014128876', '00012345678905'],
    isbn: ['9780306406157', '978-0-306-40615-7', '9791234567896'],
    'data-matrix': ['https://example.com/p?id=42&x=y', 'A'.repeat(300), 'LOT:2026-09;EXP:2027-01'],
    aztec: ['M1DOE/JOHN            EABC123 LHRJFKBA 0117 280Y012A0001 100', 'x'],
    pdf417: ['ANSI 636014080002DL00410278ZC03190024DLDAQD1234567', 'B'.repeat(600)],
  };

  test('DEC-08 generators whose schema asks for a textarea get a multi-line input', async ({ studio, page }) => {
    // PDF417 (driver licences, AAMVA) and 2D codes often carry line breaks; a single-line
    // <input> silently strips them, which changes the encoded data.
    const problems = [];
    for (const g of BARCODE_GENERATORS.filter((x) => x.inputType === 'textarea')) {
      await studio.open(`?symbology=${g.id}`);
      const tag = await page.locator('#payload-input').evaluate((e) => e.tagName.toLowerCase());
      if (tag !== 'textarea') problems.push(`${g.id}: schema.inputType is "textarea" but the studio shows <${tag}>`);
    }
    expect(problems).toEqual([]);
  });

  for (const [id, payloads] of Object.entries(EDGE_CASES)) {
    if (!getGeneratorMeta(id)) continue;
    for (const payload of payloads) {
      test(`DEC-02 ${id}: "${payload.length > 32 ? payload.slice(0, 29) + '…' : payload.replace(/[\n\r\u001e]/g, '·')}" scans correctly`, async ({ studio }) => {
        await studio.open(`?symbology=${id}`);
        const before = await studio.fingerprint();
        await studio.setPayload(payload);
        await studio.waitForChange(before, { what: 'typing a new payload' }).catch(() => studio.waitForStableRender());
        await studio.expectNoRenderError();
        expect(await scan(studio, id)).toBe(normaliseScan(id, expectedScanText(id, payload)));
      });
    }
  }

  for (const id of ['data-matrix', 'aztec', 'pdf417']) {
    test(`DEC-03 ${id}: non-ASCII text (accents, CJK, emoji) scans back unchanged`, async ({ studio }) => {
      const payload = 'Grüße · 東京 · café ✓';
      await studio.open(`?symbology=${id}`);
      await studio.setPayload(payload);
      await studio.page.waitForTimeout(400);
      await studio.waitForStableRender();
      await studio.expectNoRenderError();
      expect(await scan(studio, id), 'non-ASCII must be encoded as UTF-8 with an ECI marker, or rejected with a clear message').toBe(payload);
    });
  }

  const INVALID = {
    'ean-13': ['ABCDEFGHIJKL', '12345', '12345678901234'],
    'upc-a': ['12', 'ABCDEFGHIJK'],
    'itf-14': ['123', '15400141288769'],
    'code-39': ['lowercase', 'TAB\tCHAR'],
    'code-128': ['emoji 😀', 'tab\tchar'],
    isbn: ['1234567890123', 'abc'],
  };
  for (const [id, payloads] of Object.entries(INVALID)) {
    for (const payload of payloads) {
      test(`DEC-04 ${id}: invalid "${payload.replace(/\t/g, '\\t')}" is rejected visibly, never drawn as a wrong code`, async ({ studio }) => {
        await studio.open(`?symbology=${id}`);
        await studio.setPayload(payload);
        await studio.page.waitForTimeout(500);
        await expect(studio.validationStatus.locator('.status-invalid')).toBeVisible();
        await expect(studio.errorBox, 'an error must be shown for invalid input').toBeVisible();
        await expect(studio.errorText).not.toBeEmpty();
      });
    }
  }

  test('DEC-06 after invalid input, the old barcode is not left on screen looking valid', async ({ studio, page }) => {
    await studio.open('?symbology=ean-13');
    await studio.setPayload('ABC');
    await page.waitForTimeout(500);
    await expect(studio.errorBox).toBeVisible();
    // The previous (valid) EAN-13 is still drawn. It should be hidden, greyed out or cleared
    // so nobody screenshots/prints a code that does not match the input box.
    const staleLooksLive = await page.evaluate(() => {
      const c = document.querySelector('#preview-canvas');
      const s = getComputedStyle(c);
      return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0.5 && !/grayscale|blur/.test(s.filter);
    });
    expect(staleLooksLive, 'stale barcode still displayed at full strength next to the error').toBe(false);
  });

  test('DEC-07 PNG download is refused for invalid input (no file with the old code)', async ({ studio, page }) => {
    await studio.open('?symbology=upc-a');
    await studio.setPayload('12');
    await page.waitForTimeout(400);
    let downloaded = false;
    page.on('download', () => { downloaded = true; });
    await page.locator('#btn-download-png').click();
    await page.waitForTimeout(1500);
    expect(downloaded, 'a PNG was downloaded for invalid input').toBe(false);
    expect((await studio.toastTexts()).join(' ')).toMatch(/fail|invalid|require/i);
  });

  test('DEC-05 EAN-13: a wrong 13th check digit is rejected or corrected, never encoded as typed', async ({ studio }) => {
    await studio.open('?symbology=ean-13');
    await studio.setPayload('4006381333932'); // correct check digit is 1
    await studio.page.waitForTimeout(500);
    const text = await studio.decodePreview().catch(() => null);
    const shownError = await studio.errorBox.isVisible();
    expect(shownError || text === null || normaliseScan('ean-13', text) === '4006381333931',
      `wrong check digit produced "${text}" without a warning`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// QR wizards
// ---------------------------------------------------------------------------

test.describe('DEC-QR · every QR wizard encodes the right payload', () => {
  for (const w of WIZARDS) {
    test(`DEC-QR-01 ${w.id}: default form scans to the compiled payload`, async ({ studio }) => {
      await studio.open();
      await studio.selectWizard(w.id);
      await studio.page.waitForTimeout(400);
      await studio.waitForStableRender();
      expect(await studio.decodePreview()).toBe(w.compile(wizardDefaults(w)));
    });
  }

  // Standards-based golden values (independent of the site's compile functions).
  const GOLDEN = [
    { id: 'url', values: { url: 'example.com/path?a=1' }, expect: 'https://example.com/path?a=1' },
    { id: 'url', values: { url: 'HTTP://Example.com' }, expect: 'HTTP://Example.com' },
    {
      id: 'wifi', values: { ssid: 'Cafe;Guest', password: 'p:ss\\w,rd"', encryption: 'WPA', hidden: true },
      expect: 'WIFI:S:Cafe\\;Guest;T:WPA;P:p\\:ss\\\\w\\,rd\\";H:true;;',
    },
    { id: 'wifi', values: { ssid: 'OpenNet', password: 'ignored', encryption: 'nopass', hidden: false }, match: /^WIFI:S:OpenNet;T:nopass;P:;(H:false;)?;$/ },
    { id: 'email', values: { email: 'sales@example.com', subject: 'Hi & bye', body: 'Line 1\nLine 2' }, expect: 'mailto:sales@example.com?subject=Hi%20%26%20bye&body=Line%201%0ALine%202' },
    { id: 'sms', values: { phone: '+1 (555) 234-5678', message: 'YES' }, expect: 'smsto:+15552345678:YES' },
    { id: 'phone', values: { phone: '+44 20 7946 0958' }, expect: 'tel:+442079460958' },
    { id: 'whatsapp', values: { phone: '+1 555-123-4567', message: 'Hi there' }, expect: 'https://wa.me/15551234567?text=Hi%20there' },
    { id: 'location', values: { latitude: '40.7128', longitude: '-74.0060', query: 'Times Sq' }, expect: 'https://maps.google.com/?q=40.7128,-74.0060(Times%20Sq)' },
    { id: 'crypto', values: { currency: 'bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', amount: '0.05' }, expect: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.05' },
    { id: 'google_review', values: { reviewUrl: 'ChIJN1t_tDeuEmsRUsoyG83frY4' }, expect: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4' },
    { id: 'text', values: { text: 'Line one\nLine two — ümlaut' }, expect: 'Line one\nLine two — ümlaut' },
  ];

  for (const [i, gcase] of GOLDEN.entries()) {
    test(`DEC-QR-02 ${gcase.id} #${i + 1}: encodes the standard format`, async ({ studio }) => {
      await studio.open();
      await studio.selectWizard(gcase.id);
      const before = await studio.waitForStableRender();
      await studio.fillWizard(gcase.values);
      await studio.waitForChange(before, { what: 'filling the wizard' }).catch(() => studio.waitForStableRender());
      const text = await studio.decodePreview();
      if (gcase.expect) expect(text).toBe(gcase.expect);
      if (gcase.match) expect(text).toMatch(gcase.match);
    });
  }

  test('DEC-QR-03 crypto: Ethereum amount follows EIP-681 (value is in wei)', async ({ studio }) => {
    await studio.open();
    await studio.selectWizard('crypto');
    await studio.fillWizard({ currency: 'ethereum', address: '0xfb6916095ca1df60bb79Ce92ce3ea74c37c5d359', amount: '0.05' });
    await studio.page.waitForTimeout(400);
    await studio.waitForStableRender();
    const text = await studio.decodePreview();
    // 0.05 ETH = 5e16 wei. "value=0.05" would request 0.05 wei.
    expect(text).toMatch(/^ethereum:0xfb6916095ca1df60bb79Ce92ce3ea74c37c5d359\?value=(5e16|50000000000000000)$/);
  });

  test.describe('calendar time zone', () => {
    test.use({ timezoneId: 'America/New_York' });
    test('DEC-QR-04 calendar: a local start time is not mislabelled as UTC', async ({ studio }) => {
      await studio.open();
      await studio.selectWizard('event');
      await studio.fillWizard({ title: 'Launch', startDate: '2026-10-15T09:00', endDate: '2026-10-15T10:00' });
      await studio.page.waitForTimeout(400);
      await studio.waitForStableRender();
      const text = await studio.decodePreview();
      expect(text).toContain('BEGIN:VEVENT');
      // 09:00 in New York must be either floating local time or correctly converted to 13:00Z.
      expect(text).toMatch(/DTSTART:(20261015T090000(?!Z)|20261015T130000Z)/);
    });
  });

  test('DEC-QR-05 vCard 3.0: commas/semicolons escaped, colons left alone', async ({ studio }) => {
    await studio.open();
    await studio.selectWizard('vcard');
    await studio.fillWizard({ firstName: 'Ann', lastName: 'Lee, Jr.', organization: 'A;B Co', title: 'Head: Design' });
    await studio.page.waitForTimeout(400);
    await studio.waitForStableRender();
    const text = await studio.decodePreview();
    expect(text).toContain('N:Lee\\, Jr.;Ann;;;');
    expect(text).toContain('ORG:A\\;B Co');
    expect(text, 'RFC 2426 does not escape ":" in values').toContain('TITLE:Head: Design');
  });
});

// ---------------------------------------------------------------------------
// Styled QR codes must still scan
// ---------------------------------------------------------------------------

test.describe('DEC-QRS · styled QR codes stay scannable', () => {
  const payload = 'https://github.com';
  const STYLES = [
    ...['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'].map((v) => ({ name: `dots=${v}`, controls: { dotsType: v } })),
    ...['L', 'M', 'Q', 'H'].map((v) => ({ name: `ecc=${v}`, controls: { errorCorrectionLevel: v } })),
    ...['extra-rounded', 'square', 'dot'].map((v) => ({ name: `corner=${v}`, controls: { cornerType: v } })),
    { name: 'gradient on', controls: { gradientEnabled: true } },
    { name: 'padding 0', controls: { qrPadding: 0 } },
    { name: 'padding max', controls: { qrPadding: 40 } },
    { name: 'transparent background', controls: { transparentBg: true } },
    { name: 'navy on cream', controls: { dotsColor: '#1e3a8a', cornerColor: '#1e3a8a', backgroundColor: '#fffbeb' } },
  ];

  for (const s of STYLES) {
    test(`DEC-QRS-01 ${s.name}: still scans`, async ({ studio }) => {
      await studio.open();
      for (const [id, v] of Object.entries(s.controls)) await studio.setControl(id, v);
      await studio.page.waitForTimeout(400);
      await studio.waitForStableRender();
      expect(await studio.decodePreview()).toBe(payload);
    });
  }

  test('DEC-QRS-02 every logo preset keeps the code scannable and locks ECC to H', async ({ studio, page }) => {
    await studio.open();
    const presetIds = await page.locator('.preset-icon-chip').evaluateAll((els) => els.map((e) => e.dataset.presetId).filter((id) => id !== 'none'));
    expect(presetIds.length).toBeGreaterThan(0);
    for (const id of presetIds) {
      const before = await studio.fingerprint();
      await page.locator(`.preset-icon-chip[data-preset-id="${id}"]`).click();
      await studio.waitForChange(before, { what: `logo preset ${id}` });
      await expect(studio.control('errorCorrectionLevel')).toHaveValue('H');
      await expect(studio.control('errorCorrectionLevel')).toBeDisabled();
      expect(await studio.decodePreview(), `logo "${id}" breaks scanning`).toBe(payload);
    }
    await page.locator('.preset-icon-chip[data-preset-id="none"]').click();
    await expect(studio.control('errorCorrectionLevel')).toBeEnabled();
  });

  test('DEC-QRS-03 scanability grade matches the real WCAG contrast of the chosen colours', async ({ studio, page }) => {
    const lum = (hex) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    await studio.open();
    for (const [fg, bg] of [['#000000', '#ffffff'], ['#6b7280', '#ffffff'], ['#d1d5db', '#ffffff']]) {
      await studio.setControl('dotsColor', fg);
      await studio.setControl('backgroundColor', bg);
      await page.waitForTimeout(400);
      const r = ratio(fg, bg);
      const grade = r >= 7 ? 'Grade A' : r >= 4.5 ? 'Grade B' : 'Grade D';
      await expect(page.locator('#spec-scanability')).toContainText(grade);
      await expect(page.locator('#spec-scanability')).toContainText(`${r.toFixed(1)}:1`);
    }
  });

  test('DEC-QRS-04 barcode palette presets keep every barcode scannable', async ({ studio, page }) => {
    for (const g of BARCODE_GENERATORS) {
      await studio.open(`?symbology=${g.id}`);
      const chips = await page.locator('.barcode-preset-chip').evaluateAll((els) => els.map((e) => ({ bar: e.dataset.bar, bg: e.dataset.bg })));
      for (const [i, chip] of chips.entries()) {
        const before = await studio.fingerprint();
        await page.locator('.barcode-preset-chip').nth(i).click();
        await studio.waitForChange(before, { what: `palette ${chip.bar}/${chip.bg}` }).catch(() => studio.waitForStableRender());
        const text = await studio.decodePreview({ background: chip.bg === 'transparent' ? '#ffffff' : chip.bg });
        expect(text, `${g.id} with palette ${chip.bar} on ${chip.bg} does not scan`).not.toBeNull();
        expect(normaliseScan(g.id, text)).toBe(normaliseScan(g.id, expectedScanText(g.id, g.defaultPayload)));
      }
    }
  });
});
