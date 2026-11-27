// Writes the site menu (UCM-NAV-01) into the hand-written root pages, between marker comments, so they get the
// same menu as the generated pages from the one list in tools/site-nav.mjs. Safe to run again: marked blocks are
// replaced. Every anchor must appear exactly once; otherwise nothing is written and the build stops.
import fs from 'node:fs';
import path from 'node:path';
import { siteNavHeadHtml, siteNavButtonHtml, siteNavDialogHtml, footerGuidesColumnHtml } from './site-nav.mjs';

export const ROOT_PAGES_WITH_NAV = ['index.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'symbology-docs.html', 'barcode-scanner.html', '404.html', 'changes.html'];

const block = (name, html) => `<!-- site-nav:${name} -->${html}<!-- /site-nav:${name} -->`;
const blockRe = (name) => new RegExp(`<!-- site-nav:${name} -->[\\s\\S]*?<!-- /site-nav:${name} -->`);

/** Insert (first run) or replace (later runs) one marked block. */
function place(s, name, html, anchorRe, where, file) {
  if (blockRe(name).test(s)) return s.replace(blockRe(name), () => block(name, html));
  const hits = s.match(new RegExp(anchorRe.source, 'g')) || [];
  if (hits.length !== 1) throw new Error(`${file}: expected one anchor for ${name}, found ${hits.length}`);
  return s.replace(anchorRe, (m) => (where === 'before' ? block(name, html) + m : m + block(name, html)));
}

export function syncRootPagesSiteNav(siteRoot) {
  const out = [];
  for (const file of ROOT_PAGES_WITH_NAV) {
    const full = path.join(siteRoot, file);
    const raw = fs.readFileSync(full, 'utf8');
    const crlf = raw.includes('\r\n');
    let s = raw.replace(/\r\n/g, '\n');
    // 404.html is served at any missing address, so its menu links are root-absolute.
    const prefix = file === '404.html' ? '/' : '';
    s = place(s, 'head', `\n  ${siteNavHeadHtml(prefix)}\n  `, /<\/head>/, 'before', file);
    // After the header's link group (which ends with the theme button), so phones can move it beside the logo.
    s = place(s, 'button', `\n        ${siteNavButtonHtml()}`, /id="theme-toggle-btn"[\s\S]*?<\/button>\s*<\/div>/, 'after', file);
    s = place(s, 'dialog', `\n  ${siteNavDialogHtml(prefix, file)}`, /<\/header>/, 'after', file);
    s = place(s, 'footer-guides', `\n        ${footerGuidesColumnHtml(prefix)}`,
      /plain-text-qr-code-generator\.html">Plain Text QR Code<\/a><\/li>\n\s*<\/ul>\n\s*<\/div>/, 'after', file);
    if (!/class="v2-footer-matrix" id="site-directory"/.test(s)) {
      const n = (s.match(/<div class="v2-footer-matrix">/g) || []).length;
      if (n !== 1) throw new Error(`${file}: expected one footer directory, found ${n}`);
      s = s.replace('<div class="v2-footer-matrix">', '<div class="v2-footer-matrix" id="site-directory">');
    }
    const next = crlf ? s.replace(/\n/g, '\r\n') : s;
    out.push([full, next, next !== raw]);
  }
  let changed = 0;
  for (const [full, next, isChanged] of out) {
    if (isChanged) { fs.writeFileSync(full, next); changed += 1; }
  }
  return changed;
}
