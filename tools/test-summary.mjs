#!/usr/bin/env node
// test-summary.mjs: turns a Playwright JSON report into a summary the AI pastes verbatim (kit core 05, defence D9).
// The AI never writes test results in its own words; it runs this and copies the output.
//
// Usage:
//   node test-summary.mjs <report.json> [--repo <git dir>] [--expect-projects static,desktop]
//                                       [--min-passed N] [--allow-skips N] [--save <dir>]
//
// Verdict is PASS only when: the report has no global errors, 0 failed, 0 flaky, 0 interrupted,
// passed > 0 (and >= --min-passed), skipped <= --allow-skips (default 0; list the allowed ones in the
// test inventory instead of raising this), every --expect-projects project ran at least one test,
// and the report is not older than the last commit. Exit code 0 = PASS, 1 = FAIL, 2 = bad input.
// --save copies the report plus this summary into <dir>/<date>_<commit>/ as evidence.
// No dependencies; Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const reportPath = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!reportPath || !fs.existsSync(reportPath)) {
  console.error('usage: node test-summary.mjs <report.json> [--repo dir] [--expect-projects a,b] [--min-passed N] [--allow-skips N] [--save dir]');
  process.exit(2);
}
const repo = opt('--repo', path.dirname(path.resolve(reportPath)));
const expectProjects = (opt('--expect-projects', '') || '').split(',').filter(Boolean);
const minPassed = Number(opt('--min-passed', 1));
const allowSkips = Number(opt('--allow-skips', 0));
const saveDir = opt('--save', null);

const raw = fs.readFileSync(reportPath);
let report;
try { report = JSON.parse(raw.toString('utf8')); } catch (e) { console.error(`not JSON: ${e.message}`); process.exit(2); }
if (!report.suites || !report.stats) { console.error('not a Playwright JSON report (no suites/stats)'); process.exit(2); }

const git = (...a) => { try { return execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const head = git('rev-parse', '--short', 'HEAD');
const headTime = git('log', '-1', '--format=%cI');
const dirty = git('status', '--porcelain');

// Walk every test result. Playwright test status: expected | unexpected | flaky | skipped.
const tests = [];
const walk = (suite, trail) => {
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const last = (t.results || []).at(-1) || {};
      const skipNote = (t.annotations || []).concat(last.annotations || []).find((a) => a.type === 'skip' || a.type === 'fixme');
      tests.push({
        project: t.projectName || t.projectId || '(none)',
        title: [...trail, spec.title].filter(Boolean).join(' › '),
        file: spec.file,
        line: spec.line,
        status: t.status,
        resultStatus: last.status,
        error: (last.error && (last.error.message || '').split('\n')[0]) || '',
        skipReason: skipNote ? (skipNote.description || skipNote.type) : '',
      });
    }
  }
  for (const s of suite.suites || []) walk(s, s.file && s.title === s.file ? trail : [...trail, s.title]);
};
for (const s of report.suites) walk(s, []);

const count = (fn) => tests.filter(fn).length;
const passed = count((t) => t.status === 'expected');
const failed = count((t) => t.status === 'unexpected');
const flaky = count((t) => t.status === 'flaky');
const skipped = count((t) => t.status === 'skipped');
const interrupted = count((t) => t.resultStatus === 'interrupted');
const globalErrors = (report.errors || []).length;

const byProject = {};
for (const t of tests) {
  const p = (byProject[t.project] ||= { passed: 0, failed: 0, flaky: 0, skipped: 0 });
  p[{ expected: 'passed', unexpected: 'failed', flaky: 'flaky', skipped: 'skipped' }[t.status] || 'failed']++;
}

const started = report.stats.startTime ? new Date(report.stats.startTime) : null;
const stale = started && headTime && started < new Date(headTime);
const metaCommit = report.config?.metadata?.commit || report.config?.metadata?.['revision.id'] || null;

const problems = [];
if (globalErrors) problems.push(`${globalErrors} global error(s) (setup, config or web server)`);
if (failed) problems.push(`${failed} failed`);
if (flaky) problems.push(`${flaky} flaky (passed only on retry)`);
if (interrupted) problems.push(`${interrupted} interrupted`);
if (passed === 0) problems.push('nothing passed (an all-skipped or empty run is not a pass)');
else if (passed < minPassed) problems.push(`only ${passed} passed, expected at least ${minPassed}`);
if (skipped > allowSkips) problems.push(`${skipped} skipped, allowed ${allowSkips}`);
for (const p of expectProjects) if (!byProject[p] || byProject[p].passed + byProject[p].failed + byProject[p].flaky === 0) problems.push(`project "${p}" did not run`);
if (stale) problems.push(`report started ${started.toISOString()}, before the last commit (${headTime}): it does not test HEAD`);
if (metaCommit && head && !String(metaCommit).startsWith(head) && !head.startsWith(String(metaCommit).slice(0, 7))) problems.push(`report is for commit ${metaCommit}, HEAD is ${head}`);

const verdict = problems.length ? 'FAIL' : 'PASS';
const sha = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
const lines = [];
lines.push(`TEST SUMMARY (written by test-summary.mjs; paste verbatim)`);
lines.push(`Verdict:   ${verdict}${problems.length ? ' - ' + problems.join('; ') : ''}`);
lines.push(`Report:    ${path.resolve(reportPath)} (sha256 ${sha})`);
lines.push(`Run:       started ${started ? started.toISOString() : '?'}, ${((report.stats.duration || 0) / 1000).toFixed(0)} s, Playwright ${report.config?.version || '?'}`);
const dirtyLines = dirty ? dirty.split(/\r?\n/) : [];
const untracked = dirtyLines.filter((l) => l.startsWith('??')).length;
const changed = dirtyLines.length - untracked;
lines.push(`Code:      HEAD ${head || '?'} (${headTime || 'no git'})${changed ? `, ${changed} UNCOMMITTED CHANGE(S) to tracked files: results may not match HEAD` : ''}${untracked ? `, ${untracked} untracked file(s)` : ''}${metaCommit ? `, report says ${metaCommit}` : ''}`);
lines.push(`Totals:    ${tests.length} = ${passed} passed + ${failed} failed + ${flaky} flaky + ${skipped} skipped`);
lines.push(`Stats:     Playwright says expected ${report.stats.expected}, unexpected ${report.stats.unexpected}, flaky ${report.stats.flaky}, skipped ${report.stats.skipped}`);
if (report.stats.expected !== passed || report.stats.unexpected !== failed || report.stats.flaky !== flaky || report.stats.skipped !== skipped) {
  lines.push(`WARNING:   recount differs from Playwright's own stats; read the report by hand`);
}
lines.push(`Projects:  ${Object.entries(byProject).map(([p, c]) => `${p} ${c.passed}/${c.failed}/${c.flaky}/${c.skipped}`).join(' · ') || '(none)'}  (passed/failed/flaky/skipped)`);
const list = (label, arr, fmt) => { if (arr.length) { lines.push(`${label} (${arr.length}):`); for (const t of arr.slice(0, 50)) lines.push(`  - ${fmt(t)}`); if (arr.length > 50) lines.push(`  … ${arr.length - 50} more in the report`); } };
list('Failed', tests.filter((t) => t.status === 'unexpected'), (t) => `[${t.project}] ${t.file}:${t.line} ${t.title}${t.error ? ' :: ' + t.error.slice(0, 160) : ''}`);
list('Flaky', tests.filter((t) => t.status === 'flaky'), (t) => `[${t.project}] ${t.file}:${t.line} ${t.title}`);
list('Skipped', tests.filter((t) => t.status === 'skipped'), (t) => `[${t.project}] ${t.file}:${t.line} ${t.title}${t.skipReason ? ' :: ' + t.skipReason : ''}`);
for (const e of (report.errors || []).slice(0, 5)) lines.push(`Global error: ${(e.message || JSON.stringify(e)).split('\n')[0].slice(0, 200)}`);
const out = lines.join('\n');
console.log(out);

if (saveDir) {
  const stamp = (started || new Date()).toISOString().replace(/[:T]/g, '-').slice(0, 16);
  const dir = path.join(saveDir, `${stamp}_${head || 'nogit'}${dirtyLines.length - untracked ? '-dirty' : ''}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(reportPath, path.join(dir, 'results.json'));
  fs.writeFileSync(path.join(dir, 'summary.txt'), out + '\n', 'utf8');
  console.log(`Saved:     ${dir}`);
}
process.exit(verdict === 'PASS' ? 0 : 1);
