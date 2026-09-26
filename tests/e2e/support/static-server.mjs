// Zero-dependency static server for the test suite.
// Serves the site root (three folders up) with correct MIME types and no caching,
// and mirrors the production rule that /tools/ and /tests/ return 404.
// Exception: the existing in-browser unit runner (/tests/test-runner.html and
// /tests/unit/) stays reachable locally so the suite can run it too.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PORT = Number(process.env.UCM_PORT || 8099);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

function send404(res, urlPath) {
  const page404 = path.join(SITE_ROOT, '404.html');
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  if (fs.existsSync(page404)) fs.createReadStream(page404).pipe(res);
  else res.end(`404 Not Found: ${urlPath}`);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  // Production parity: .htaccess blocks these folders.
  const isUnitRunner = urlPath === '/tests/test-runner.html' || urlPath.startsWith('/tests/unit/');
  if (/^\/(tools|tests)(\/|$)/.test(urlPath) && !isUnitRunner) return send404(res, urlPath);

  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.normalize(path.join(SITE_ROOT, urlPath));
  if (!filePath.startsWith(SITE_ROOT)) return send404(res, urlPath);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send404(res, urlPath);
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`UCM test server: http://127.0.0.1:${PORT}/  (root: ${SITE_ROOT})`);
});
