// Simulates a RETURNING VISITOR whose browser still holds yesterday's JavaScript.
//
// .htaccess caches HTML for 1 hour but .js for 1 day, and ES-module imports use plain
// URLs. After a deploy, a visitor can get the NEW index.html together with OLD cached
// scripts, or a mix of old and new modules. That breaks features ("some settings don't
// work") or stops the studio entirely (a missing named export fails the module link).
//
// How the simulation works:
//  - Baseline = the commit that introduced the current `v2-studio.js?v=` in index.html,
//    i.e. the oldest code a visitor may hold under the URLs the page requests today.
//  - For every JS request, if the exact same URL (path + query) was requested by the
//    baseline site, serve the baseline file (what the browser cache returns).
//    Otherwise serve the current file.
// When every code change bumps the version in the URL, no stale file matches and the
// test passes. When code changes without a version bump, the test reproduces the bug.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { SITE_ROOT } from './catalog.mjs';

function git(args) {
  return execFileSync('git', args, { cwd: SITE_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

export function gitAvailable() {
  try {
    git(['rev-parse', '--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

/** Commit that introduced the current studio script URL (e.g. js/v2-studio.js?v=2.6). */
export function baselineCommit() {
  const html = git(['show', 'HEAD:index.html']);
  const m = html.match(/src="(js\/v2-studio\.js\?v=[^"]+)"/);
  if (!m) return null;
  const commits = git(['log', '--format=%H', '-S', m[1], '--', 'index.html']).trim().split('\n').filter(Boolean);
  return { commit: commits[commits.length - 1], studioUrl: m[1] };
}

function showAt(commit, relPath) {
  try {
    return git(['show', `${commit}:${relPath}`]);
  } catch {
    return null;
  }
}

/** Every JS URL (path?query) the baseline site would request, walking the import graph. */
function baselineUrls(commit) {
  const urls = new Set();
  const queue = [];
  const html = showAt(commit, 'index.html') || '';
  for (const m of html.matchAll(/<script[^>]+src="([^"]+\.js(?:\?[^"]*)?)"/g)) {
    if (!/^https?:/.test(m[1])) queue.push(m[1]);
  }
  while (queue.length) {
    const url = queue.shift();
    if (urls.has(url)) continue;
    urls.add(url);
    const file = url.split('?')[0];
    const src = showAt(commit, file);
    if (!src) continue;
    for (const m of src.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] || m[2];
      if (!spec.startsWith('.')) continue;
      const [p, q] = spec.split('?');
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), p));
      queue.push(q ? `${resolved}?${q}` : resolved);
    }
    // Vendor scripts injected by the dynamic loader.
    for (const m of src.matchAll(/\$\{prefix\}(js\/vendor\/[\w.-]+\.js)/g)) urls.add(m[1]);
  }
  return urls;
}

/**
 * Install the stale-cache simulation on a browser context.
 * @returns {{ commit: string, staleServed: string[] }} info for the report
 */
export async function installStaleCache(context, baseURL) {
  const base = baselineCommit();
  if (!base) throw new Error('Could not find the studio script URL in index.html');
  const urls = baselineUrls(base.commit);
  const info = { commit: base.commit.slice(0, 7), studioUrl: base.studioUrl, staleServed: [] };

  await context.route(/\.js(\?.*)?$/, async (route) => {
    const u = new URL(route.request().url());
    if (!u.href.startsWith(baseURL)) return route.continue();
    const rel = u.pathname.replace(/^\//, '') + u.search;
    if (!urls.has(rel)) return route.continue();
    const body = showAt(base.commit, u.pathname.replace(/^\//, ''));
    if (body === null) return route.continue();
    const current = await route.fetch();
    if ((await current.text()) !== body) info.staleServed.push(rel);
    return route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body });
  });
  return info;
}
