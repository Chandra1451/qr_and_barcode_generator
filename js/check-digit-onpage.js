// Check digit calculator page tool (UCM-KW-02). Uses the studio's GS1 Mod-10 routine; nothing is sent anywhere.
import { calculateMod10 } from './core/checksums.js?v=3.30';

const MAX_LINES = 1000;
const $ = (id) => document.getElementById(id);

const els = {
  format: $('cd-format'),
  number: $('cd-number'),
  help: $('cd-help'),
  result: $('cd-result'),
  full: $('cd-full'),
  copy: $('cd-copy'),
  make: $('cd-make'),
  list: $('cd-list'),
  run: $('cd-run'),
  copyList: $('cd-copy-list'),
  csv: $('cd-csv'),
  listStatus: $('cd-list-status'),
  table: $('cd-table'),
};

const formatLength = () => Number(els.format.value);
const symbology = () => els.format.selectedOptions[0]?.dataset.symbology || 'ean-13';
const clean = (text) => String(text).replace(/[\s-]/g, '');

/**
 * Works out one entry for a GTIN of `length` digits.
 * n-1 digits: calculates the check digit. n digits: checks it. Anything else: explains what is needed.
 * @returns {{ ok: boolean, full: string, message: string }}
 */
export function evaluate(raw, length) {
  const digits = clean(raw);
  const name = `GTIN-${length}`;
  if (!digits) return { ok: false, full: '', message: 'Enter a number to begin.' };
  if (!/^\d+$/.test(digits)) return { ok: false, full: '', message: 'Use digits only (spaces and dashes are fine).' };
  if (digits.length === length - 1) {
    const check = calculateMod10(digits);
    return { ok: true, full: digits + check, message: `Check digit: ${check}` };
  }
  if (digits.length === length) {
    const check = calculateMod10(digits.slice(0, -1));
    if (String(check) === digits.slice(-1)) return { ok: true, full: digits, message: 'Correct: the check digit matches.' };
    return { ok: false, full: digits.slice(0, -1) + check, message: `Wrong check digit: the last digit should be ${check}, not ${digits.slice(-1)}.` };
  }
  return { ok: false, full: '', message: `${name} needs ${length - 1} digits to calculate, or ${length} to check (you have ${digits.length}).` };
}

function updateHelp() {
  const n = formatLength();
  els.help.textContent = `Type ${n - 1} digits to get the ${n}th, or all ${n} to check the last one. Spaces and dashes are ignored.`;
}

function updateSingle() {
  const n = formatLength();
  const out = evaluate(els.number.value, n);
  els.result.textContent = out.message;
  const hasFull = out.full.length === n;
  els.full.hidden = !hasFull;
  els.full.textContent = hasFull ? (out.ok ? out.full : `Corrected: ${out.full}`) : '';
  els.copy.disabled = !hasFull;
  els.number.setAttribute('aria-invalid', String(Boolean(clean(els.number.value)) && !out.ok && !hasFull));
  els.make.href = `../index.html?symbology=${symbology()}${hasFull ? `&data=${out.full}` : ''}`;
  els.copy.dataset.value = hasFull ? out.full : '';
}

async function copyText(text, statusEl, doneMessage) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = doneMessage;
  } catch {
    statusEl.textContent = 'Copy is blocked in this browser. Select the text and copy it instead.';
  }
}

// CSV cells: quote everything; a leading = + - @ (or tab/CR) gets an apostrophe so spreadsheets don't run it as a formula.
const csvCell = (value) => {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

let lastRows = [];

function runList() {
  const n = formatLength();
  const lines = els.list.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const tbody = els.table.querySelector('tbody');
  tbody.textContent = '';
  if (!lines.length) {
    lastRows = [];
    els.table.hidden = true;
    els.copyList.disabled = true;
    els.csv.disabled = true;
    els.listStatus.textContent = 'Paste at least one number.';
    return;
  }
  const used = lines.slice(0, MAX_LINES);
  lastRows = used.map((line) => {
    const out = evaluate(line, n);
    return { input: line, message: out.message, full: out.full.length === n ? out.full : '' };
  });
  for (const row of lastRows) {
    const tr = document.createElement('tr');
    for (const value of [row.input, row.message, row.full]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    tbody.append(tr);
  }
  els.table.hidden = false;
  els.copyList.disabled = false;
  els.csv.disabled = false;
  const okCount = lastRows.filter((r) => r.full && !r.message.startsWith('Wrong')).length;
  const extra = lines.length > MAX_LINES ? ` Only the first ${MAX_LINES} of ${lines.length} lines were used.` : '';
  els.listStatus.textContent = `${lastRows.length} lines worked out as GTIN-${n}: ${okCount} correct or completed, ${lastRows.length - okCount} need attention.${extra}`;
}

function downloadCsv() {
  const csv = [['You entered', 'Result', 'Full number'], ...lastRows.map((r) => [r.input, r.message, r.full])]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `check-digits-gtin-${formatLength()}.csv`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

if (els.format && els.number) {
  els.format.addEventListener('change', () => { updateHelp(); updateSingle(); if (lastRows.length) runList(); });
  els.number.addEventListener('input', updateSingle);
  els.copy.addEventListener('click', () => copyText(els.copy.dataset.value, els.result, 'Full number copied.'));
  els.run.addEventListener('click', runList);
  els.copyList.addEventListener('click', () => copyText(
    lastRows.map((r) => [r.input, r.message, r.full].join('\t')).join('\n'), els.listStatus, 'Results copied (tab separated, pastes into a spreadsheet).'));
  els.csv.addEventListener('click', downloadCsv);
  updateHelp();
  updateSingle();
  const startup = $('cd-startup');
  if (startup) startup.hidden = true;
}
