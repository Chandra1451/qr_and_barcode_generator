// Check digit calculator page (UCM-KW-02, 2026-11-23).
// Expected values come from an independent implementation of GS1 General Specifications 26.0, Table 7-8,
// checked against GS1's own worked example (Table 7-9), not from the site's checksum code.
import { test, expect } from '../support/fixtures.mjs';
import fs from 'node:fs/promises';

const url = '/pages/check-digit-calculator.html';

/** GS1 Table 7-8: from the digit next to the check digit, multiply by 3,1,3,1...; check = next multiple of ten − sum. */
function gs1CheckDigit(body) {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) sum += Number(body[i]) * ((body.length - i) % 2 === 1 ? 3 : 1);
  return (Math.ceil(sum / 10) * 10) - sum;
}

/** Deterministic pseudo-random digit strings, so failures reproduce. */
function bodies(length, count, seed) {
  let x = seed;
  const out = [];
  for (let n = 0; n < count; n += 1) {
    let s = '';
    for (let i = 0; i < length; i += 1) { x = (x * 1103515245 + 12345) % 2147483648; s += String(x % 10); }
    out.push(s);
  }
  return out;
}

async function tableRows(page) {
  return page.locator('#cd-table tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent)));
}

test('CD-01 the reference check digit matches GS1\'s own worked example (Table 7-9)', () => {
  expect(gs1CheckDigit('37610425002123456')).toBe(9);
});

test('CD-02 one number: calculates, confirms a correct number, corrects a wrong one, and links to the studio', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('#cd-startup')).toBeHidden();
  const body = '952012345678';
  const full = body + gs1CheckDigit(body);
  await page.locator('#cd-number').fill(body);
  await expect(page.locator('#cd-result')).toHaveText(`Check digit: ${gs1CheckDigit(body)}`);
  await expect(page.locator('#cd-full')).toHaveText(full);
  await expect(page.locator('#cd-make')).toHaveAttribute('href', `../index.html?symbology=ean-13&data=${full}`);

  await page.locator('#cd-number').fill(full);
  await expect(page.locator('#cd-result')).toHaveText('Correct: the check digit matches.');

  const wrongDigit = (gs1CheckDigit(body) + 3) % 10;
  await page.locator('#cd-number').fill(`${body}${wrongDigit}`);
  await expect(page.locator('#cd-result')).toHaveText(`Wrong check digit: the last digit should be ${gs1CheckDigit(body)}, not ${wrongDigit}.`);

  await page.locator('#cd-number').fill('12345');
  await expect(page.locator('#cd-result')).toHaveText('GTIN-13 needs 12 digits to calculate, or 13 to check (you have 5).');
  await expect(page.locator('#cd-copy')).toBeDisabled();
});

for (const [length, symbology] of [[12, 'upc-a'], [13, 'ean-13'], [14, 'itf-14']]) {
  test(`CD-03 GTIN-${length}: a list of 40 numbers matches GS1's method, in both calculate and check modes`, async ({ page }) => {
    await page.goto(url);
    await page.locator('#cd-format').selectOption(String(length));
    await expect(page.locator('#cd-help')).toContainText(`Type ${length - 1} digits`);
    const list = bodies(length - 1, 40, length * 7919);
    const fulls = list.map((b) => b + gs1CheckDigit(b));
    await page.locator('#cd-bulk summary').click();
    await page.locator('#cd-list').fill([...list, ...fulls].join('\n'));
    await page.locator('#cd-run').click();
    const rows = await tableRows(page);
    expect(rows).toHaveLength(80);
    rows.slice(0, 40).forEach(([input, result, full], i) => {
      expect(input).toBe(list[i]);
      expect(result).toBe(`Check digit: ${gs1CheckDigit(list[i])}`);
      expect(full).toBe(fulls[i]);
    });
    rows.slice(40).forEach(([, result, full], i) => {
      expect(result).toBe('Correct: the check digit matches.');
      expect(full).toBe(fulls[i]);
    });
    await page.locator('#cd-number').fill(list[0]);
    await expect(page.locator('#cd-make')).toHaveAttribute('href', `../index.html?symbology=${symbology}&data=${fulls[0]}`);
  });
}

test('CD-04 CSV download has every row and cannot run as a spreadsheet formula', async ({ page }) => {
  await page.goto(url);
  await page.locator('#cd-bulk summary').click();
  await page.locator('#cd-list').fill('952012345678\n=1+1\n@SUM(A1)');
  await page.locator('#cd-run').click();
  const ready = page.waitForEvent('download');
  await page.locator('#cd-csv').click();
  const dl = await ready;
  expect(dl.suggestedFilename()).toBe('check-digits-gtin-13.csv');
  const text = (await fs.readFile(await dl.path(), 'utf8')).replace(/^﻿/, '');
  const lines = text.split('\r\n');
  expect(lines[0]).toBe('"You entered","Result","Full number"');
  expect(lines[1]).toBe(`"952012345678","Check digit: ${gs1CheckDigit('952012345678')}","9520123456788"`);
  expect(lines[2]).toBe('"\'=1+1","Use digits only (spaces and dashes are fine).",""');
  expect(lines[3]).toBe('"\'@SUM(A1)","Use digits only (spaces and dashes are fine).",""');
});

test('CD-05 "Make this barcode" opens the studio with the format and full number, and it scans back', async ({ page, studio }) => {
  await page.goto(url);
  await page.locator('#cd-number').fill('952012345678');
  await page.locator('#cd-make').click();
  await page.waitForURL(/index\.html\?symbology=ean-13&data=9520123456788/);
  await expect(studio.symbologySelect).toHaveValue('ean-13');
  await studio.waitForStableRender();
  await studio.expectNoRenderError();
  expect(await studio.decodePreview()).toBe('9520123456788');
});

test('CD-06 lists over 1,000 lines use the first 1,000 and say so', async ({ page }) => {
  await page.goto(url);
  await page.locator('#cd-bulk summary').click();
  await page.locator('#cd-list').fill(bodies(12, 1001, 42).join('\n'));
  await page.locator('#cd-run').click();
  await expect(page.locator('#cd-list-status')).toContainText('Only the first 1000 of 1001 lines were used.');
  expect(await page.locator('#cd-table tbody tr').count()).toBe(1000);
});

test('CD-07 the worked example on the page matches GS1\'s method', async ({ page }) => {
  await page.goto(url);
  const rows = await page.locator('table.cd-example tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent)));
  const digits = rows.map(([d]) => d).join('');
  expect(digits).toBe('952012345678');
  rows.forEach(([d, w, r], i) => {
    const weight = (digits.length - i) % 2 === 1 ? 3 : 1;
    expect(w).toBe(`×${weight}`);
    expect(Number(r)).toBe(Number(d) * weight);
  });
  const total = rows.reduce((s, [, , r]) => s + Number(r), 0);
  await expect(page.locator('table.cd-example tfoot td')).toHaveText(String(total));
  await expect(page.locator('#how')).toContainText(`the full GTIN-13 is ${digits}${gs1CheckDigit(digits)}`);
});

test('CD-08 numbers typed or pasted are not sent anywhere (the FAQ says so)', async ({ page }) => {
  const marker = '9520987654321';
  const leaks = [];
  page.on('request', (req) => {
    if (req.url().includes(marker.slice(0, 12)) || (req.postData() || '').includes(marker.slice(0, 12))) leaks.push(req.url());
  });
  await page.goto(url);
  await page.locator('#cd-number').fill(marker.slice(0, 12));
  await page.locator('#cd-bulk summary').click();
  await page.locator('#cd-list').fill(`${marker.slice(0, 12)}\n${marker}`);
  await page.locator('#cd-run').click();
  await page.waitForTimeout(500);
  expect(leaks).toEqual([]);
});
