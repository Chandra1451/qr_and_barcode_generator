# UniversalCodeMaker — E2E & Output-Quality Test Suite

Automated tests that open the real site in Microsoft Edge, click every button, move every slider, and **scan every generated code with an independent decoder** to prove the output is correct. The full list of test cases, with the reason for each one, is in [TEST_PLAN.md](TEST_PLAN.md).

The suite lives in `tests/e2e/`. `.htaccess` already returns 404 for `/tests/`, so it is never public.

---

## 1. One-time setup

Requirements: Node.js **22.12 or newer** (you have 24) and Microsoft Edge (already installed). No browser download is needed.

```powershell
cd D:\websites_with_AI\qr_and_barcode_generator\tests\e2e
npm install
```

This installs Playwright (test runner), zxing-wasm (barcode decoder), axe-core (accessibility), pngjs and jszip (to inspect exported files) into `tests/e2e/node_modules/`. That folder is git-ignored.

> ⚠️ `tools/build-hostinger-package.js` zips every file in the project. If you still use it, delete `tests/e2e/node_modules` first, or the ZIP will include it. Git auto-deploy is not affected.

---

## 2. Running

All commands run from `tests/e2e/`. The local server (port 8099) starts and stops automatically.

| What | Command | Time (approx.) |
|---|---|---|
| Everything except visual baselines | `npx playwright test --project=static --project=desktop --project=phone` | 15–30 min |
| Fast static checks (no browser) | `npm run test:static` | < 10 s |
| Smoke test | `npm run test:smoke` | 1 min |
| "Controls don't update after load" | `npm run test:boot` | 3–5 min |
| All controls + PDF417 geometry | `npm run test:controls` | 5–10 min |
| Output correctness (scans + exports) | `npm run test:outputs` | 5–10 min |
| Buttons | `npm run test:buttons` | 3 min |
| Cross-page design consistency | `npm run test:consistency` | 5 min |
| Security & privacy | `npm run test:security` | 1 min |
| Loading & stale-cache problems | `npm run test:loading` | 2 min |
| Visual screenshots | `npm run test:visual` (after creating baselines, see §4) | 3 min |
| One test by ID | `npx playwright test -g "BOOT-02"` | — |
| Watch it run in a visible browser | add `--headed --workers=1` | — |
| Step through a test | add `--debug` | — |

### Reports

- Terminal: pass/fail per test.
- HTML report: `npm run report` (opens `reports/html`). Each failure has a screenshot, a video, a trace (`npx playwright show-trace <file>`), and attached measurements (for example `pdf417-geometry`, `pdf417-stage-heights`).
- Machine-readable: `reports/results.json`.

### Settings (environment variables)

PowerShell: `$env:NAME = "value"` before the command.

| Variable | Default | Purpose |
|---|---|---|
| `UCM_BASE_URL` | local server | Test another host, e.g. `https://universalcodemaker.com` (the live site). |
| `UCM_BOOT_ITERATIONS` | `5` | How many times each boot scenario repeats. Use 20+ when hunting the intermittent bug. |
| `UCM_MAX_STAGE_JUMP_PX` | `120` | How far the preview stage may grow or shrink when a control changes. |
| `UCM_MAX_STAGE_HEIGHT_PX` | `640` | Maximum preview stage height. |
| `UCM_BROWSER_CHANNEL` | `msedge` | `chrome`, or `chromium` after `npx playwright install chromium`. |
| `UCM_WORKERS` | CPU-based | Parallel workers. Use `1` if the machine struggles. |
| `UCM_PORT` | `8099` | Local server port. |

**Live-site run** (read-only; everything happens in the browser):

```powershell
$env:UCM_BASE_URL = "https://universalcodemaker.com"; npx playwright test --project=desktop --project=phone
```

`SMOKE-05` (private folders return 404) only runs in this mode. `SMOKE-04` (existing unit-test runner) is skipped there because `/tests/` is blocked.

---

## 3. How to read a failure

Every assertion message says what was expected in plain words, for example:

- `Preview did not change after moving Quiet Zone Padding` — the control is not wired, or the render was lost.
- `preview does not match a clean render of {"padding":14}` — the control moved but the preview kept older settings (stale or out-of-order render).
- `code-128 with palette #ffffff on #0f1117 does not scan` — a real scanner would fail too.
- `2x export ... has a different shape than the preview` — the download doesn't match what the user saw.
- `control "Price Addon (EAN-5)" (text) is defined for isbn but not shown in the studio`.

Before "fixing" a test, decide whether the **site** or the **test** is wrong. Intentional differences between generators go in `consistency-allowlist.json`, with a reason.

**Expect failures on the first run.** Reading the code while writing the suite turned up likely problems. They are listed in TEST_PLAN.md §4. Each one is a real finding to fix or a decision to record, not a broken test.

---

## 4. Visual baselines

Screenshots are compared against approved images in `baselines/`.

1. First time: `npm run baselines:update`. This creates the images.
2. Open `baselines/` and **look at every image**. Approve only what looks right.
3. Later runs fail on any unapproved change, and the report shows before/after/diff.
4. After an intended design change, run `npm run baselines:update` again and review the new images.

Baselines depend on the OS, browser and fonts. Create and compare them on the same machine. They are git-ignored (about 70 MB and machine-specific): on a new machine, run `npm run baselines:update` once and review the images before relying on them. First set created and reviewed 2026-09-26 (148 images, stable across two runs).

---

## 5. Keeping the suite useful

- **New generator, control or wizard?** No test changes are needed. The suite reads `js/generators/registry.js` and `js/wizards/qr-wizards.js`, so new items are tested automatically, including decoding.
- **New root page?** Add it to `ROOT_PAGES` in `support/catalog.mjs` (`STATIC-ROOT-01` reminds you). Landing pages in `pages/` are picked up automatically.
- **New button?** `BTN-01` already fails if it has no handler. Add a behaviour test to `specs/07-buttons.spec.mjs`.
- **Fixed a bug?** Add a test that reproduces it before the fix, so it can't come back quietly.
- **Retries are off on purpose.** A test that passes only sometimes is showing a real intermittent bug, like the "controls don't respond after load" issue.

## 6. Layout

```
tests/e2e/
├── package.json, playwright.config.mjs
├── consistency-allowlist.json     intentional differences (with reasons)
├── TEST_PLAN.md                   every test case: ID, purpose, expected result
├── support/
│   ├── static-server.mjs          local server (mirrors the .htaccess 404 rules)
│   ├── catalog.mjs                reads the site's registry/wizards/pages + independent oracles
│   ├── studio.mjs                 page object: controls, pixel fingerprints, downloads
│   ├── decode.mjs                 ZXing reference decoder
│   ├── images.mjs                 PNG/SVG/PDF inspection helpers
│   └── fixtures.mjs               ad/font stubs, console-error guard, network log
├── specs/                         00-static … 12-visual
├── baselines/                     approved screenshots (created by you)
└── reports/                       output (git-ignored)
```
