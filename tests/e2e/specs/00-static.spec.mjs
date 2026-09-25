// STATIC CHECKS — no browser. Fast guards against the classic drift bugs:
// inconsistent generator controls, 0-treated-as-default, broken deep links,
// mixed asset versions, dead internal links and sitemap drift.

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  GENERATORS, BARCODE_GENERATORS, WIZARDS, SYMBOLOGY_ALIASES, ALL_PAGES, LANDING_PAGES, ROOT_PAGES,
  SITE_ROOT, E2E_ROOT, readSiteFile, labelPresetIds,
} from '../support/catalog.mjs';

const allowlist = JSON.parse(fs.readFileSync(path.join(E2E_ROOT, 'consistency-allowlist.json'), 'utf8'));
const allowed = (key) => allowlist.allowed.some((a) => a.key === key);

test.describe('STATIC-REG · generator registry schema', () => {
  test('STATIC-REG-01 generator ids are unique and categories are known', () => {
    const ids = GENERATORS.map((g) => g.id);
    expect(new Set(ids).size, `duplicate ids in ${ids}`).toBe(ids.length);
    for (const g of GENERATORS) expect(['2d', 'retail', 'logistics', 'postal']).toContain(g.category);
  });

  for (const g of GENERATORS) {
    test(`STATIC-REG-02 ${g.id}: default payload passes its own validation`, () => {
      expect(g.defaultPayload, 'defaultPayload missing').toBeTruthy();
      if (g.regex) expect(g.regex.test(g.defaultPayload), `default "${g.defaultPayload}" fails ${g.regex}`).toBe(true);
    });

    test(`STATIC-REG-03 ${g.id}: every control is well-formed`, () => {
      const seen = new Set();
      for (const c of g.controls) {
        expect(c.id, 'control id').toBeTruthy();
        expect(seen.has(c.id), `duplicate control ${c.id}`).toBe(false);
        seen.add(c.id);
        expect(c.label, `${c.id} label`).toBeTruthy();
        if (c.type === 'slider') {
          expect(Number.isFinite(c.min) && Number.isFinite(c.max), `${c.id} min/max`).toBe(true);
          expect(c.min).toBeLessThan(c.max);
          expect(c.default, `${c.id} default within range`).toBeGreaterThanOrEqual(c.min);
          expect(c.default, `${c.id} default within range`).toBeLessThanOrEqual(c.max);
        }
        if (c.type === 'select') {
          expect(c.options?.length, `${c.id} options`).toBeGreaterThan(0);
          expect(c.options.map((o) => o.value), `${c.id} default is an option`).toContain(c.default);
        }
      }
    });
  }
});

test.describe('STATIC-CONS · controls are consistent across generators', () => {
  // Reference = the most common definition of that control; outliers get flagged
  // unless allow-listed.
  const reference = (id) => {
    const defs = BARCODE_GENERATORS.map((g) => g.controls.find((c) => c.id === id)).filter(Boolean);
    const key = (c) => JSON.stringify([c.label, c.min, c.max, c.default, c.unit]);
    const counts = new Map();
    defs.forEach((c) => counts.set(key(c), (counts.get(key(c)) || 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? defs.find((c) => key(c) === top[0]) : undefined;
  };

  for (const controlId of ['padding', 'scale', 'height', 'includetext']) {
    test(`STATIC-CONS-01 "${controlId}" has the same label, range and default everywhere`, () => {
      const ref = reference(controlId);
      test.skip(!ref, `no generator defines ${controlId}`);
      const problems = [];
      for (const g of BARCODE_GENERATORS) {
        const c = g.controls.find((x) => x.id === controlId);
        if (!c) continue;
        for (const prop of ['label', 'min', 'max', 'default', 'unit']) {
          const key = `${g.id}.${controlId}.${prop}`;
          if (c[prop] !== ref[prop] && !allowed(key)) problems.push(`${key} = ${JSON.stringify(c[prop])} (reference ${JSON.stringify(ref[prop])})`);
        }
      }
      expect(problems, 'Differences must be fixed or listed with a reason in consistency-allowlist.json').toEqual([]);
    });
  }

  test('STATIC-CONS-02 every barcode generator offers quiet-zone padding and scale', () => {
    const missing = [];
    for (const g of BARCODE_GENERATORS) {
      for (const id of ['padding', 'scale']) {
        if (!g.controls.some((c) => c.id === id) && !allowed(`${g.id}.${id}.missing`)) missing.push(`${g.id} has no "${id}"`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('STATIC-CONS-03 every 1D generator offers height and human-readable text controls', () => {
    const missing = [];
    for (const g of BARCODE_GENERATORS.filter((x) => x.category !== '2d')) {
      for (const id of ['height', 'includetext']) {
        if (!g.controls.some((c) => c.id === id) && !allowed(`${g.id}.${id}.missing`)) missing.push(`${g.id} has no "${id}"`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('STATIC-CONS-04 no plugin turns a legitimate 0 into the default (`options.x || default`)', () => {
    // A slider whose minimum is 0 must never be read with `||`, because 0 is falsy.
    // Example bug: `paddingwidth: options.padding || 10` makes "padding 0" draw 10.
    const offenders = [];
    for (const g of GENERATORS) {
      const file = fs.readdirSync(path.join(SITE_ROOT, 'js/generators'), { recursive: true })
        .map((f) => path.join(SITE_ROOT, 'js/generators', String(f)))
        .find((f) => f.endsWith('.js') && fs.readFileSync(f, 'utf8').includes(`id: "${g.id}"`));
      if (!file) continue;
      const src = fs.readFileSync(file, 'utf8');
      for (const c of g.controls.filter((x) => x.type === 'slider' && x.min <= 0)) {
        const re = new RegExp(`options\\.${c.id}\\s*\\|\\|`, 'g');
        if (re.test(src)) offenders.push(`${path.relative(SITE_ROOT, file)}: options.${c.id} || … (slider min is ${c.min})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

test.describe('STATIC-WIZ · QR wizards', () => {
  test('STATIC-WIZ-01 every wizard tab has a vector icon in the studio', () => {
    // v2-studio.js keeps a wizardSvgMap; a missing key silently falls back to an emoji.
    const src = readSiteFile('js/v2-studio.js');
    const block = src.match(/const wizardSvgMap = \{([\s\S]*?)\n\s*\};/);
    expect(block, 'wizardSvgMap not found in js/v2-studio.js').toBeTruthy();
    const keys = [...block[1].matchAll(/^\s*([a-z_]+):\s*`/gm)].map((m) => m[1]);
    const missing = WIZARDS.map((w) => w.id).filter((id) => !keys.includes(id));
    expect(missing, `wizards without an SVG icon (keys present: ${keys.join(', ')})`).toEqual([]);
  });

  for (const w of WIZARDS) {
    test(`STATIC-WIZ-02 ${w.id}: default values compile to a non-empty payload`, () => {
      const values = Object.fromEntries(w.fields.map((f) => [f.id, f.type === 'checkbox' ? Boolean(f.default) : f.default ?? '']));
      const out = w.compile(values);
      expect(typeof out).toBe('string');
      expect(out.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const htmlOf = Object.fromEntries(ALL_PAGES.map((p) => [p, readSiteFile(p)]));

test.describe('STATIC-PAGE · page structure', () => {
  for (const p of ALL_PAGES) {
    test(`STATIC-PAGE-01 ${p}: one <h1>, a <title>, meta description, lang`, () => {
      const html = htmlOf[p];
      expect((html.match(/<h1[\s>]/g) || []).length, 'exactly one <h1>').toBe(1);
      expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
      expect(html).toMatch(/<html[^>]*\slang="[a-z-]+"/i);
      if (p !== '404.html') expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{50,}"/i);
    });

    if (p !== '404.html') {
      test(`STATIC-PAGE-02 ${p}: canonical URL matches the file`, () => {
        const m = htmlOf[p].match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
        expect(m, 'canonical link').toBeTruthy();
        const expectedPath = p === 'index.html' ? '/' : `/${p}`;
        expect(new URL(m[1]).pathname).toBe(expectedPath);
      });
    }
  }

  test('STATIC-PAGE-03 every page loads the same version of each shared asset', () => {
    // CSS is cached for a year; a page left on an old ?v= shows stale styling.
    const versions = {};
    for (const p of ALL_PAGES) {
      for (const m of htmlOf[p].matchAll(/(?:href|src)="[^"]*?([\w-]+\.(?:css|js))\?v=([\w.]+)"/g)) {
        (versions[m[1]] ||= {})[m[2]] ||= [];
        versions[m[1]][m[2]].push(p);
      }
    }
    const mixed = Object.entries(versions)
      .filter(([file, vs]) => Object.keys(vs).length > 1 && !allowed(`asset-version.${file}`))
      .map(([file, vs]) => `${file}: ${Object.entries(vs).map(([v, ps]) => `v=${v} on ${ps.length} page(s) e.g. ${ps[0]}`).join(' | ')}`);
    expect(mixed).toEqual([]);
  });

  test('STATIC-PAGE-04 shared CSS/JS is always referenced with a ?v= cache-buster', () => {
    const missing = [];
    for (const p of ALL_PAGES) {
      for (const m of htmlOf[p].matchAll(/(?:href|src)="((?!https?:)[^"]*\/(?:v2-[\w-]+|main|theme|components)\.(?:css|js))"/g)) {
        missing.push(`${p}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

test.describe('STATIC-LINK · links, deep links, sitemap', () => {
  test('STATIC-LINK-01 every internal href/src points to an existing file', () => {
    const broken = [];
    for (const p of ALL_PAGES) {
      const dir = path.dirname(path.join(SITE_ROOT, p));
      for (const m of htmlOf[p].matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
        const ref = m[1];
        if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref) || ref === '') continue;
        const target = ref.startsWith('/') ? path.join(SITE_ROOT, ref) : path.join(dir, ref);
        const resolved = target.endsWith(path.sep) || ref.endsWith('/') ? path.join(target, 'index.html') : target;
        if (!fs.existsSync(resolved)) broken.push(`${p} → ${ref}`);
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });

  test('STATIC-LINK-02 same-page #anchors exist', () => {
    const broken = [];
    for (const p of ALL_PAGES) {
      const ids = new Set([...htmlOf[p].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      for (const m of htmlOf[p].matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) broken.push(`${p} → #${m[1]}`);
    }
    expect(broken).toEqual([]);
  });

  test('STATIC-LINK-03 studio deep links use real generator, wizard and preset ids', () => {
    const generatorIds = new Set(GENERATORS.map((g) => g.id));
    const wizardIds = new Set(WIZARDS.map((w) => w.id));
    const presets = new Set(labelPresetIds());
    const problems = [];
    for (const p of ALL_PAGES) {
      for (const m of htmlOf[p].matchAll(/href="[^"]*index\.html\?([^"]+)"/g)) {
        const params = new URLSearchParams(m[1].replace(/&amp;/g, '&'));
        const sym = params.get('symbology') || params.get('format');
        if (sym && !generatorIds.has(SYMBOLOGY_ALIASES[sym.toLowerCase()] || sym)) problems.push(`${p}: unknown symbology "${sym}"`);
        const wiz = params.get('wizard');
        // The studio silently falls back to the URL wizard for unknown ids, so catch typos here.
        if (wiz && !wizardIds.has(wiz)) problems.push(`${p}: unknown wizard "${wiz}" (would silently open the URL wizard)`);
        if (wiz && sym && (SYMBOLOGY_ALIASES[sym] || sym) !== 'qr-code') problems.push(`${p}: wizard "${wiz}" with non-QR symbology "${sym}" is ignored`);
        const preset = params.get('preset');
        if (preset && !presets.has(preset)) problems.push(`${p}: unknown label preset "${preset}"`);
        const data = params.get('data') || params.get('payload');
        if (data && (!sym || (SYMBOLOGY_ALIASES[sym] || sym) === 'qr-code')) problems.push(`${p}: ?data= is ignored for QR codes`);
      }
    }
    expect(problems).toEqual([]);
  });

  test('STATIC-LINK-04 every landing page links to the studio', () => {
    const missing = LANDING_PAGES.filter((p) => !/href="\.\.\/index\.html(\?[^"]*)?"/.test(htmlOf[p]));
    expect(missing).toEqual([]);
  });

  test('STATIC-LINK-05 sitemap lists exactly the indexable pages, and every URL exists', () => {
    const xml = readSiteFile('sitemap.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const missingFiles = locs.filter((l) => {
      const rel = l === '/' ? 'index.html' : l.replace(/^\//, '') + (l.endsWith('/') ? 'index.html' : '');
      return !fs.existsSync(path.join(SITE_ROOT, rel));
    });
    expect(missingFiles, 'sitemap URLs without a file').toEqual([]);

    const indexable = ALL_PAGES.filter((p) => p !== '404.html' && !/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(htmlOf[p]));
    const notListed = indexable.filter((p) => !locs.includes(p === 'index.html' ? '/' : `/${p}`));
    expect(notListed, 'indexable pages missing from sitemap.xml').toEqual([]);
  });

  test('STATIC-LINK-06 external links that open a new tab use rel="noopener"', () => {
    const bad = [];
    for (const p of ALL_PAGES) {
      for (const m of htmlOf[p].matchAll(/<a\s[^>]*target="_blank"[^>]*>/g)) {
        if (!/rel="[^"]*noopener/.test(m[0])) bad.push(`${p}: ${m[0].slice(0, 120)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('STATIC-LINK-07 no placeholder links (href="#" or empty)', () => {
    const bad = [];
    for (const p of ALL_PAGES) {
      for (const m of htmlOf[p].matchAll(/<a\s[^>]*href="(#?)"[^>]*>/g)) bad.push(`${p}: ${m[0].slice(0, 100)}`);
    }
    expect(bad).toEqual([]);
  });
});

test.describe('STATIC-CACHE · returning visitors get matching code', () => {
  // .htaccess caches JS for a day under the same URL. If code changes without a new URL,
  // returning visitors run old scripts against new HTML ("some settings don't work").

  const gitCmd = (args) => execFileSync('git', args, { cwd: SITE_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const inGit = (() => { try { gitCmd(['rev-parse', '--is-inside-work-tree']); return true; } catch { return false; } })();

  test('STATIC-CACHE-01 every JS change since the last studio version bump came with a new ?v=', () => {
    test.skip(!inGit, 'not a git checkout');
    const m = readSiteFile('index.html').match(/src="js\/v2-studio\.js\?v=([^"]+)"/);
    expect(m, 'studio script tag with ?v= not found').toBeTruthy();
    const commits = gitCmd(['log', '--format=%H', '-S', `v2-studio.js?v=${m[1]}`, '--', 'index.html']).split('\n').filter(Boolean);
    // Version not in any commit yet = it was bumped in the working tree alongside the JS change.
    test.skip(!commits.length, `v=${m[1]} is a new, uncommitted bump — commit it together with the JS changes`);
    const bump = commits[commits.length - 1];
    const changedSince = gitCmd(['diff', '--name-only', bump, '--', 'js']).split('\n').filter((f) => f && !f.startsWith('js/vendor/'));
    expect(changedSince, `JS changed after v2-studio.js?v=${m[1]} was introduced (${bump.slice(0, 7)}) but the version was not bumped (run: node tools/bump-js-version.mjs)`).toEqual([]);
  });

  test('STATIC-CACHE-03 every relative import uses the same ?v= as the studio script', () => {
    const version = readSiteFile('index.html').match(/src="js\/v2-studio\.js\?v=([^"]+)"/)?.[1];
    const wrong = [];
    for (const f of fs.readdirSync(path.join(SITE_ROOT, 'js'), { recursive: true }).map(String).filter((x) => x.endsWith('.js') && !x.includes('vendor') && !x.includes('_template'))) {
      const src = fs.readFileSync(path.join(SITE_ROOT, 'js', f), 'utf8');
      for (const mm of src.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.{1,2}\/[^'"]+\.js)(?:\?v=([\w.-]+))?['"]/g)) {
        if (mm[2] !== version) wrong.push(`js/${f.replace(/\\/g, '/')} → ${mm[1]}${mm[2] ? '?v=' + mm[2] : ''}`);
      }
    }
    expect(wrong, `imports must all be ?v=${version} (run: node tools/bump-js-version.mjs ${version})`).toEqual([]);
  });

  test('STATIC-CACHE-02 imported modules cannot go stale independently', () => {
    // Either every relative import carries a version, or JS must be revalidated on each visit.
    const htaccess = readSiteFile('.htaccess');
    const jsBlock = htaccess.match(/<FilesMatch "\\\.\(js\|mjs\)\$">([\s\S]*?)<\/FilesMatch>/);
    const revalidates = !!jsBlock && /no-cache|must-revalidate|max-age=0/.test(jsBlock[1]);
    const unversioned = [];
    for (const f of fs.readdirSync(path.join(SITE_ROOT, 'js'), { recursive: true }).map(String).filter((x) => x.endsWith('.js') && !x.includes('vendor'))) {
      const src = fs.readFileSync(path.join(SITE_ROOT, 'js', f), 'utf8');
      for (const mm of src.matchAll(/from\s*['"](\.[^'"?]+)['"]/g)) unversioned.push(`js/${f.replace(/\\/g, '/')} → ${mm[1]}`);
    }
    expect(revalidates || unversioned.length === 0,
      `JS is cached without revalidation and ${unversioned.length} imports have no ?v=, e.g. ${unversioned.slice(0, 3).join('; ')}`).toBe(true);
  });

  test('STATIC-LOAD-01 CDN fallbacks are pinned to the same versions as the self-hosted copies', () => {
    const src = readSiteFile('js/core/dynamic-loader.js');
    const unpinned = [...src.matchAll(/https:\/\/[^'"]+@latest[^'"]*/g)].map((x) => x[0]);
    expect(unpinned, '"@latest" can load a different major version with a different API').toEqual([]);
  });
});

test('STATIC-ROOT-01 root pages list is complete', () => {
  // Guards the catalogue itself: a new root page must be added to ROOT_PAGES in support/catalog.mjs.
  const rootHtml = fs.readdirSync(SITE_ROOT).filter((f) => f.endsWith('.html'));
  expect(rootHtml.sort()).toEqual([...ROOT_PAGES].sort());
});
