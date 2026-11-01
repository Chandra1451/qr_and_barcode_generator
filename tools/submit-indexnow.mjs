#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://universalcodemaker.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "771293dcaf8a42fe9afecefb4ea6351b";
const INDEXNOW_KEY_FILE = `${INDEXNOW_KEY}.txt`;
const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP_FILE = path.join(SITE_ROOT, "sitemap.xml");
const MAX_URLS_PER_RUN = 100;

function usage() {
  return `Usage: node tools/submit-indexnow.mjs [options]

Options:
  --url URL           Added or updated canonical URL. Repeat for more URLs.
  --deleted-url URL   Deleted canonical URL that is no longer in the sitemap.
                      Repeat for more URLs.
  --submit            Verify the live key/deleted URLs, then send the request.
                      Without this flag the command is a network-free dry run.
  --help              Show this help.

Examples:
  node tools/submit-indexnow.mjs --url https://universalcodemaker.com/
  node tools/submit-indexnow.mjs --url https://universalcodemaker.com/pages/ean-13-barcode-generator.html --submit

Only exact HTTPS URLs on universalcodemaker.com are allowed. Added/updated URLs
must already be canonical sitemap entries. Deleted URLs must not be in the
sitemap and must return HTTP 404 or 410 before a live submission is sent.`;
}

function parseArgs(argv) {
  const options = { urls: [], deletedUrls: [], submit: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--submit") options.submit = true;
    else if (argument === "--url" || argument === "--deleted-url") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
      (argument === "--url" ? options.urls : options.deletedUrls).push(value);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return options;
}

function canonicalUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }

  if (url.origin !== SITE_ORIGIN || url.protocol !== "https:") {
    throw new Error(`URL must use the exact production origin ${SITE_ORIGIN}: ${value}`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`URL must not contain credentials, a query, or a fragment: ${value}`);
  }
  if (url.href !== value) {
    throw new Error(`URL must already be in canonical form: ${value} (expected ${url.href})`);
  }
  return url.href;
}

function sitemapUrls() {
  const xml = fs.readFileSync(SITEMAP_FILE, "utf8");
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function validate(options) {
  if (!options.urls.length && !options.deletedUrls.length) {
    throw new Error("Provide at least one --url or --deleted-url.");
  }

  const listed = sitemapUrls();
  const updatedUrls = [...new Set(options.urls.map(canonicalUrl))];
  const deletedUrls = [...new Set(options.deletedUrls.map(canonicalUrl))];
  const overlap = updatedUrls.filter((url) => deletedUrls.includes(url));
  if (overlap.length) throw new Error(`A URL cannot be both updated and deleted: ${overlap.join(", ")}`);

  const notInSitemap = updatedUrls.filter((url) => !listed.has(url));
  if (notInSitemap.length) {
    throw new Error(`Added/updated URLs must be canonical sitemap entries: ${notInSitemap.join(", ")}`);
  }

  const stillInSitemap = deletedUrls.filter((url) => listed.has(url));
  if (stillInSitemap.length) {
    throw new Error(`Deleted URLs must be removed from the sitemap first: ${stillInSitemap.join(", ")}`);
  }

  const urlList = [...updatedUrls, ...deletedUrls];
  if (urlList.length > MAX_URLS_PER_RUN) {
    throw new Error(`This release helper is limited to ${MAX_URLS_PER_RUN} URLs per run.`);
  }
  return { updatedUrls, deletedUrls, urlList };
}

async function verifyLiveKey() {
  const keyLocation = `${SITE_ORIGIN}/${INDEXNOW_KEY_FILE}`;
  const response = await fetch(keyLocation, { redirect: "error" });
  if (response.status !== 200) throw new Error(`Live key returned HTTP ${response.status}: ${keyLocation}`);
  const contents = (await response.text()).trim();
  if (contents !== INDEXNOW_KEY) throw new Error(`Live key contents do not match ${INDEXNOW_KEY_FILE}.`);
}

async function verifyDeletedUrls(urls) {
  for (const url of urls) {
    const response = await fetch(url, { method: "HEAD", redirect: "manual" });
    if (![404, 410].includes(response.status)) {
      throw new Error(`Deleted URL must return HTTP 404 or 410 before submission; received ${response.status}: ${url}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const { updatedUrls, deletedUrls, urlList } = validate(options);
  const keyLocation = `${SITE_ORIGIN}/${INDEXNOW_KEY_FILE}`;
  const summary = {
    mode: options.submit ? "submit" : "dry-run",
    endpoint: INDEXNOW_ENDPOINT,
    host: new URL(SITE_ORIGIN).host,
    keyLocation,
    updatedUrls,
    deletedUrls,
    urlList,
  };

  if (!options.submit) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  await verifyLiveKey();
  await verifyDeletedUrls(deletedUrls);
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_ORIGIN).host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList,
    }),
  });

  if (![200, 202].includes(response.status)) {
    const responseText = (await response.text()).trim();
    throw new Error(`IndexNow returned HTTP ${response.status}${responseText ? `: ${responseText}` : ""}`);
  }

  console.log(JSON.stringify({ ...summary, acceptedStatus: response.status }, null, 2));
}

main().catch((error) => {
  console.error(`IndexNow submission stopped: ${error.message}`);
  process.exitCode = 1;
});
