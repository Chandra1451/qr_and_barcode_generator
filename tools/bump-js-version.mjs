#!/usr/bin/env node
/**
 * Stamp one version on the studio script and on every relative ES-module import.
 *
 * Why: browsers cache JS by URL. If a module changes but its URL doesn't, returning
 * visitors can run old modules against new HTML (dead controls) or a mix of old and
 * new modules (failed imports, studio doesn't start). Giving every import the same
 * ?v= means one bump invalidates the whole graph at once.
 *
 * Usage (from the project root):
 *   node tools/bump-js-version.mjs 2.7        # set an explicit version
 *   node tools/bump-js-version.mjs            # increment the current minor (2.7 -> 2.8)
 *
 * Run it in the same commit as any change under js/ (tests/e2e STATIC-CACHE-01 checks this).
 * js/vendor/ is left alone (third-party files loaded by URL, not imported).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');
const STUDIO_TAG = /(src="js\/v2-studio\.js)(?:\?v=([\w.-]+))?(")/;

const indexHtml = fs.readFileSync(INDEX, 'utf8');
const current = indexHtml.match(STUDIO_TAG)?.[2];

let next = process.argv[2];
if (!next) {
  const m = current && current.match(/^(\d+)\.(\d+)$/);
  if (!m) {
    console.error(`Current version "${current}" is not N.N; pass one explicitly, e.g. node tools/bump-js-version.mjs 3.0`);
    process.exit(1);
  }
  next = `${m[1]}.${Number(m[2]) + 1}`;
}
if (!/^[\w.-]+$/.test(next)) {
  console.error(`Invalid version "${next}"`);
  process.exit(1);
}

// 1. index.html studio entry point
fs.writeFileSync(INDEX, indexHtml.replace(STUDIO_TAG, `$1?v=${next}$3`));

// 2. every relative import/export-from/dynamic import in js/ (not vendor)
const IMPORT_SPEC = /((?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"])(\.{1,2}\/[^'"?]+\.js)(?:\?v=[\w.-]+)?(['"])/g;
let files = 0;
let specs = 0;
for (const rel of fs.readdirSync(path.join(ROOT, 'js'), { recursive: true }).map(String)) {
  const norm = rel.replace(/\\/g, '/');
  if (!norm.endsWith('.js') || norm.startsWith('vendor/') || norm.includes('/_template/')) continue;
  const file = path.join(ROOT, 'js', rel);
  const src = fs.readFileSync(file, 'utf8');
  let count = 0;
  const out = src.replace(IMPORT_SPEC, (_, pre, spec, post) => {
    count++;
    return `${pre}${spec}?v=${next}${post}`;
  });
  if (out !== src) {
    fs.writeFileSync(file, out);
    files++;
    specs += count;
  }
}

console.log(`JS version ${current ?? '(none)'} -> ${next}: index.html + ${specs} imports in ${files} files.`);
console.log('Commit these changes together with the JS change they cover.');
