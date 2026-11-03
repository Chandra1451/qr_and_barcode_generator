# UniversalCodeMaker

UniversalCodeMaker is a browser-based QR code and barcode generator. It's free to use, with no account required and no watermark on downloads.

[Open the studio](https://universalcodemaker.com/) to choose a format, enter your data and download a code. For product packaging, the [EAN-13 page](https://universalcodemaker.com/pages/ean-13-barcode-generator.html) has its own generator alongside the printing guide.

## What it does

- Generates 10 barcode formats and 13 QR code types.
- Lets you change colours, padding and text, and style QR codes with gradients, dot patterns and logos.
- Downloads SVG and PNG images, with EPS export for non-QR barcodes.
- Makes PDF label sheets for Avery 5160, 5163 and L7160, plus individual label layouts.
- Generates batches from a list or number sequence, saved as a ZIP or a PDF sheet with a different code on each label.
- Reads codes from an image or camera using the [scanner](https://universalcodemaker.com/barcode-scanner.html).

## Supported codes

The 10 formats are grouped in the studio:

- Retail: EAN-13, UPC-A and ISBN-13.
- Inventory and shipping: Code 128, Code 39 and ITF-14.
- QR and other 2D codes: QR Code, Data Matrix, Aztec and PDF417.

The 13 QR types cover website links, Wi-Fi, vCard contacts, email, SMS, phone calls, cryptocurrency payment links, calendar events, map locations, plain text, Google Reviews, WhatsApp and UPI payments.

## Printing and product numbers

The generator draws a barcode from the number you supply. It does not issue GS1 identifiers or establish retailer acceptance. See the [product-barcode guide](https://universalcodemaker.com/pages/how-to-get-a-barcode-for-your-product.html) if you need help deciding which number to use.

SVG and EPS are useful when you need to resize artwork. PNG resolution depends on the export scale and the size you place it at. Print and scan a sample before using a batch of labels. The [format reference](https://universalcodemaker.com/symbology-docs.html) covers check digits, sizing and quiet zones.

## Privacy

Code generation and scanning run in your browser. The generator and scanner do not upload your code data, logos, scan images or camera frames. The website still uses analytics and hosting infrastructure; the [privacy policy](https://universalcodemaker.com/privacy-policy.html) explains those separately.

QR codes contain the data you enter, without a redirect service managed by UniversalCodeMaker. A website linked by a code can still move or stop working.

## Run locally

There is no frontend build step. From the repository root, start a local server with Python:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Open <http://127.0.0.1:8080/>. Use a server rather than opening the HTML file directly, since the JavaScript uses ES modules.

## Code and tests

The frontend uses plain HTML, CSS and JavaScript. Barcode rendering uses bwip-js, styled QR codes use qr-code-styling, and exports use jsPDF and JSZip. The scanner uses ZXing WASM. These libraries are bundled in `js/vendor/`.

The main files are:

- `index.html` and `js/v2-studio.js`: the studio interface and controls.
- `js/generators/`: format plugins and their registry.
- `js/wizards/qr-wizards.js`: QR input forms and payload builders.
- `js/core/`: rendering, check digits, print sizing and library loading.
- `js/export/`: image, EPS, PDF, label and batch exports.
- `js/reader/scanner.js`: image and camera scanning.
- `js/ean-onpage.js`: the EAN-13 landing-page tool.
- `tools/generate-seo-pages.js`: generated tool pages, guides and sitemap.

With the local server running, open <http://127.0.0.1:8080/tests/test-runner.html> for the browser unit tests. Playwright setup and commands are in [tests/e2e/README.md](tests/e2e/README.md). That suite checks rendering, independently decoded outputs, downloads, layout, accessibility and privacy behaviour.

The live site deploys from `main`, so changes need release checks before merging.

## License

This repository does not currently include a `LICENSE` file. Third-party libraries and fonts have their own notices in [js/vendor/THIRD_PARTY_NOTICES.txt](js/vendor/THIRD_PARTY_NOTICES.txt), the [scanner notices](js/vendor/zxing-wasm-3.1.4/THIRD_PARTY_NOTICES.txt) and [assets/fonts/README.txt](assets/fonts/README.txt).
