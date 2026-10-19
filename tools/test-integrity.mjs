#!/usr/bin/env node
// test-integrity.mjs: catches tests that disappear, get skipped or lose assertions, and product code that
// special-cases tests (kit core 05, defence D2). Run it as a static check on every change and in CI.
//
// Usage (or replace --list with --run-list <playwright dir> to let the script list the tests itself):
//   1. List the tests (no run):  npx playwright test --list --reporter=json  > list.json
//        PowerShell: $env:PLAYWRIGHT_JSON_OUTPUT_NAME="list.json"; npx playwright test --list --reporter=json
//   2. Check:   node test-integrity.mjs --list list.json --inventory tests/test-inventory.json --specs tests/e2e/specs,tests/unit
//   3. After an intended change (new tests, a removed feature):  add --update, then review the inventory diff;
//      every new skip gets reason "NEEDS REASON" and the check fails until a real reason (and the owner's OK) is written.
//
// FAILS when: a listed test disappeared or is new and not in the inventory; any .only; a skip/fixme/fail marker
// not in allowedSkips (or still "NEEDS REASON"); a spec file's assertion count dropped; product code contains a
// test-environment check or a test-data literal that is not in allowedHits. Exit 0 = OK, 1 = problems, 2 = bad input.
// No dependencies; Node 18+.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
let listPath = opt('--list');
const runListDir = opt('--run-list'); // or let the script list the tests itself (same command on every shell)
const invPath = opt('--inventory');
const specDirs = (opt('--specs', '') || '').split(',').filter(Boolean);
const update = args.includes('--update');
if ((!listPath && !runListDir) || !invPath || !specDirs.length) {
  console.error('usage: node test-integrity.mjs (--list list.json | --run-list <playwright dir>) --inventory test-inventory.json --specs dir1,dir2 [--update]');
  process.exit(2);
}
if (runListDir) {
  const { execSync } = await import('node:child_process');
  const os = await import('node:os');
  listPath = path.join(os.tmpdir(), `pw-list-${process.pid}.json`);
  try {
    execSync('npx playwright test --list --reporter=json', {
      cwd: runListDir, stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: listPath },
    });
  } catch (e) { console.error(`listing tests failed: ${String(e.stderr || e.message).slice(0, 500)}`); process.exit(2); }
}

const NEEDS = 'NEEDS REASON';
const inv = fs.existsSync(invPath) ? JSON.parse(fs.readFileSync(invPath, 'utf8')) : {};
inv.tests ||= {};
inv.assertions ||= {};
inv.allowedSkips ||= [];
inv.productScan ||= { paths: [], literalMinLength: 8, allowedHits: [] };
inv.productScan.allowedHits ||= [];
const problems = [];
const notes = [];

// ---- 1. Test inventory (from the --list report: what Playwright would actually run) ----
const report = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const listed = {};
const walk = (suite, trail) => {
  for (const spec of suite.specs || []) for (const t of spec.tests || []) {
    (listed[t.projectName || t.projectId || '(none)'] ||= []).push(`${spec.file} › ${[...trail, spec.title].join(' › ')}`);
  }
  for (const s of suite.suites || []) walk(s, s.title === s.file ? trail : [...trail, s.title]);
};
for (const s of report.suites || []) walk(s, []);
if (!Object.keys(listed).length) { console.error('the list report contains no tests'); process.exit(2); }

for (const project of new Set([...Object.keys(listed), ...Object.keys(inv.tests)])) {
  const now = new Set(listed[project] || []);
  const before = new Set(inv.tests[project] || []);
  const removed = [...before].filter((k) => !now.has(k));
  const added = [...now].filter((k) => !before.has(k));
  const line = `${project}: ${before.size} in inventory, ${now.size} listed`;
  if (removed.length) problems.push(`${line}; ${removed.length} DISAPPEARED:\n    ${removed.slice(0, 20).join('\n    ')}${removed.length > 20 ? `\n    … ${removed.length - 20} more` : ''}`);
  if (added.length) (update ? notes : problems).push(`${line}; ${added.length} new${update ? ' (added to inventory)' : ' (not in inventory; run with --update and review)'}:\n    ${added.slice(0, 10).join('\n    ')}${added.length > 10 ? `\n    … ${added.length - 10} more` : ''}`);
  if (!removed.length && !added.length) notes.push(`${line}: unchanged`);
}
if (update) inv.tests = Object.fromEntries(Object.entries(listed).map(([p, k]) => [p, [...k].sort()]));

// ---- 2. Skip / only / fixme markers and assertion counts in the test source ----
const files = [];
const collect = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) { if (e.name !== 'node_modules') collect(p); }
  else if (/\.(m?js|ts)$/.test(e.name)) files.push(p);
} };
for (const d of specDirs) collect(d);
const rel = (p) => path.relative(path.dirname(path.resolve(invPath)), path.resolve(p)).split(path.sep).join('/');
const MARKER = /\b(?:test|it|describe)(?:\.\w+)*\.(skip|only|fixme|fail)\s*\(/;
const ASSERT = /\bexpect(?:\.soft)?\s*\(|\bassert(?:\.\w+)?\s*\(/g;
const found = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  let asserts = 0;
  lines.forEach((l, i) => {
    asserts += (l.match(ASSERT) || []).length;
    const m = l.match(MARKER);
    if (m && !/^\s*(\/\/|\*)/.test(l)) found.push({ file: rel(f), line: i + 1, kind: m[1], code: l.trim().replace(/\s+/g, ' ') });
  });
  const key = rel(f);
  const was = inv.assertions[key];
  if (was !== undefined && asserts < was) problems.push(`${key}: assertion calls dropped ${was} → ${asserts} (a weakened or deleted test?)`);
  if (was === undefined && !update) problems.push(`${key}: not in the inventory's assertion counts (run with --update)`);
  if (update) inv.assertions[key] = asserts;
}
for (const k of Object.keys(inv.assertions)) if (!files.some((f) => rel(f) === k)) {
  if (update) delete inv.assertions[k]; else problems.push(`${k}: test file in inventory no longer exists`);
}
// Identical marker lines in one file are counted, so a copied skip line can't hide behind an allowed one.
const groups = new Map();
for (const s of found) {
  if (s.kind === 'only') { problems.push(`${s.file}:${s.line} .only would skip every other test: ${s.code}`); continue; }
  const k = `${s.file}\u0000${s.code}`;
  if (!groups.has(k)) groups.set(k, { ...s, lines: [] });
  groups.get(k).lines.push(s.line);
}
for (const g of groups.values()) {
  const where = `${g.file}:${g.lines.join(',')}`;
  const allow = inv.allowedSkips.find((a) => a.file === g.file && a.code === g.code);
  if (!allow) {
    if (update) inv.allowedSkips.push({ file: g.file, code: g.code, count: g.lines.length, reason: NEEDS });
    problems.push(`${where} new .${g.kind} marker${update ? ' (added with reason "NEEDS REASON")' : ''}: ${g.code}`);
  } else {
    if ((allow.count || 1) !== g.lines.length) {
      if (update) allow.count = g.lines.length;
      problems.push(`${where} .${g.kind} marker appears ${g.lines.length}×, inventory allows ${allow.count || 1}×: ${g.code}`);
    }
    if (!allow.reason || allow.reason === NEEDS) problems.push(`${where} .${g.kind} has no reason yet: ${g.code}`);
  }
}
for (const a of inv.allowedSkips) if (!found.some((s) => s.file === a.file && s.code === a.code)) notes.push(`allowed skip no longer present (remove it): ${a.file}: ${a.code}`);
notes.push(`markers: ${found.length} (${found.filter((s) => s.kind === 'skip').length} skip, ${found.filter((s) => s.kind === 'fixme').length} fixme, ${found.filter((s) => s.kind === 'fail').length} fail, ${found.filter((s) => s.kind === 'only').length} only); assertion calls: ${Object.values(inv.assertions).reduce((a, b) => a + b, 0)} in ${Object.keys(inv.assertions).length} files`);

// ---- 3. Product code that special-cases tests ----
const ENV_CHECKS = [/navigator\.webdriver/, /HeadlessChrome/, /\bplaywright\b/i, /process\.env\.CI\b/, /__TEST(?:S|_|\b)/, /\bisTest(?:ing|Env|Mode)?\b/];
const scanPaths = inv.productScan.paths || [];
if (!scanPaths.length) notes.push('product scan: no productScan.paths in the inventory, skipped');
const minLen = inv.productScan.literalMinLength || 8;
// Data-like literals from the tests (GTINs, codes, dates, check strings), not ids or selectors:
// at least 6 digits, or upper case + digits (3+). Lower-case kebab ids ("code-128", "avery-5160"),
// selectors, file names, URLs, CSS sizes and plain numbers are ignored: product and tests legitimately share them.
const literals = new Set();
const digits = (v) => (v.match(/\d/g) || []).length;
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/(['"`])([^'"`\s${}]{1,200})\1/g)) {
  const v = m[2];
  if (v.length < minLen) continue;
  if (/^[a-z][a-z0-9-]*$/.test(v) || /^[.#\[]/.test(v) || /^https?:|^data:/.test(v)) continue;
  // Skip sizes and decimals ("1366px", "0.0125"), but keep all-digit values: GTINs are exactly what this looks for.
  if (/\.(m?js|html|css|json|png|svg|pdf|zip|txt)$/i.test(v) || /^[\d.]+(px|ms|s|%)$/.test(v) || /^\d*\.\d+$/.test(v)) continue;
  if (digits(v) >= 6 || (/[A-Z]/.test(v) && digits(v) >= 3)) literals.add(v);
}
const productFiles = [];
const collectProduct = (p) => {
  if (!fs.existsSync(p)) { problems.push(`product scan path missing: ${p}`); return; }
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const e of fs.readdirSync(p)) if (e !== 'node_modules' && e !== 'vendor') collectProduct(path.join(p, e)); }
  else if (/\.(m?js|ts|html)$/.test(p)) productFiles.push(p);
};
const base = path.dirname(path.resolve(invPath));
for (const p of scanPaths) collectProduct(path.resolve(base, p));
let hits = 0;
for (const f of productFiles) {
  const text = fs.readFileSync(f, 'utf8');
  const fr = rel(f);
  const report1 = (match, what) => {
    hits++;
    if (inv.productScan.allowedHits.some((a) => a.file === fr && a.match === match && a.reason && a.reason !== NEEDS)) return;
    if (update && !inv.productScan.allowedHits.some((a) => a.file === fr && a.match === match)) inv.productScan.allowedHits.push({ file: fr, match, reason: NEEDS });
    problems.push(`${fr}: ${what} "${match}"${update ? ' (added with reason "NEEDS REASON")' : ''}`);
  };
  // Comment lines are skipped (explanations, not behaviour); a literal must match as a whole value,
  // so "00000000000" inside "50000000000000000" doesn't count.
  const code = text.split(/\r?\n/).filter((l) => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l)).join('\n');
  for (const re of ENV_CHECKS) { const m = code.match(re); if (m) report1(m[0], 'test-environment check'); }
  for (const v of literals) {
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?<![A-Za-z0-9])${esc}(?![A-Za-z0-9])`).test(code)) report1(v, 'test-data literal in product code');
  }
}
notes.push(`product scan: ${productFiles.length} files, ${literals.size} test-data literals checked, ${hits} hit(s)`);

if (update) {
  inv._about ||= 'Test inventory for test-integrity.mjs (kit core 05, D2). Every change to this file is shown to the owner: removed tests, new skips and allowed hits need a reason.';
  inv.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(invPath, JSON.stringify(inv, null, 1) + '\n', 'utf8');
  notes.push(`inventory written: ${invPath}`);
}

console.log('TEST INTEGRITY (written by test-integrity.mjs; paste verbatim)');
console.log(`Verdict: ${problems.length ? `FAIL (${problems.length} problem(s))` : 'OK'}`);
for (const p of problems) console.log(`  ✗ ${p}`);
for (const n of notes) console.log(`  · ${n}`);
process.exit(problems.length ? 1 : 0);
