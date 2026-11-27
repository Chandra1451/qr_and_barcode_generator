// Writes the "What changed" entries (tools/changes-data.mjs) into changes.html between marker comments.
// Run by the page generator; safe to run again.
import fs from 'node:fs';
import path from 'node:path';
import { changesListHtml } from './changes-data.mjs';

export function syncChangesPage(siteRoot) {
  const file = path.join(siteRoot, 'changes.html');
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  const s = raw.replace(/\r\n/g, '\n');
  const re = /<!-- changes:list -->[\s\S]*?<!-- \/changes:list -->/;
  if ((s.match(new RegExp(re.source, 'g')) || []).length !== 1) throw new Error('changes.html: expected one changes:list block');
  const next = s.replace(re, () => `<!-- changes:list -->${changesListHtml()}\n      <!-- /changes:list -->`);
  const out = crlf ? next.replace(/\n/g, '\r\n') : next;
  if (out !== raw) { fs.writeFileSync(file, out); return true; }
  return false;
}
