# Universal QR & Barcode Generator Suite

> **100% Client-Side, Privacy-First, High-Resolution Barcode & QR Code Production Studio**

A blazingly fast, zero-dependency, static web application that generates 50+ universal 1D and 2D barcode standards, branded dynamic QR codes with logos and gradients, print-ready Avery label sheets, and serialized batch ZIP archives—all executed **100% in client-side browser memory**.

---

## 🚀 Key Features

### 1. 100% Client-Side & Zero-State Privacy
- **Zero Server Compute**: All encoding, rendering, canvas scaling, and PDF/ZIP generation occur strictly in the user's browser.
- **Zero-Storage Privacy**: No payload data, Wi-Fi credentials, contact details, or uploaded logos are ever transmitted to a backend, logged, or stored in any database.
- **Permanent Static Codes**: Generated QR codes are encoded directly with the target data—no expiring redirects or third-party tracking URLs.

### 2. 50+ Symbologies Supported
- **2D Matrix Codes**: Standard QR Code, Data Matrix (ECC 200, 1:1 square), Aztec Code, PDF417 (stacked 2D, 2.5:1 ratio).
- **Retail & Point-of-Sale**: EAN-13, EAN-8, UPC-A, UPC-E, GS1 DataBar.
- **Industrial & Logistics**: Code 128 (Auto/A/B/C), Code 39 (Extended), ITF-14, Interleaved 2 of 5, Codabar, MSI Plessey.
- **Postal Codes**: USPS Intelligent Mail (IMb), POSTNET, Royal Mail (RM4SCC), KIX, Japan Post.

### 3. 10 Smart QR Payload Wizards
Dynamic form compilers with real-time payload generation for:
- 🌐 **Website URL**
- 📶 **Wi-Fi Network** (WPA/WPA2/WPA3, WEP, Open, Hidden SSID)
- 👤 **vCard 3.0** (Full contact card with phone, email, address, org, title)
- ✉️ **Email** (mailto: with subject and body)
- 💬 **SMS** (smsto: with phone and pre-filled message)
- 📞 **Phone Call** (tel: formatted dialing)
- 💰 **Cryptocurrency** (Bitcoin, Ethereum, Solana, USDT BIP-21 URI schemes)
- 📅 **Calendar Event** (iCalendar VEVENT format with timestamps and description)
- 📍 **Geolocation** (geo: coordinates with latitude and longitude)
- 📝 **Plain Text** (Multi-line raw string payloads)

### 4. Advanced QR Visual Customizer
- **Color Gradients**: Linear and radial gradients with customizable start and end stops.
- **Dot Styles**: Square, rounded, dots, classy, classy-rounded, extra-rounded.
- **Corner Styles**: Square, dot, extra-rounded eye shapes.
- **Brand Logo Presets**: 1-click vector SVG brand logos (Wi-Fi, WhatsApp, Instagram, YouTube, X/Twitter, LinkedIn, GitHub, Bitcoin, Ethereum) or custom image dropzone.
- **Auto-Lock Error Correction**: Center logo embedding automatically engages Level H error correction (30% recovery capability) with clean background dot clearing.

### 5. Multi-Resolution & Vector Export
- **Multi-Resolution PNG**: 1x Web standard, 2x Retina, 4x Ultra-High 300+ DPI print-ready.
- **Vector SVG**: Infinite-resolution scalable vector graphics for professional laser engraving, die-cutting, and packaging.
- **1-Click Clipboard**: Instant image copy via modern Clipboard API.

### 6. Print-Ready Avery PDF Label Sheets
Generates client-side vector PDF sheets ready to print on standard laser/inkjet label paper:
- **Avery 5160**: 30 address labels per sheet (3 columns × 10 rows, Letter).
- **Avery 5163**: 10 shipping labels per sheet (2 columns × 5 rows, Letter).
- **Avery L7160**: 21 European standard labels per sheet (3 columns × 7 rows, A4).
- **Single Display Sign**: Centered presentation page for storefronts and event signage.

### 7. Batch Serialization & ZIP Archiver
- **Sequential Range Generation**: Specify prefix, start index, end index, and zero-padding (e.g., `LOT-001` through `LOT-100`).
- **Multi-Line / CSV Paste**: Bulk input with line-by-line custom text encoding.
- **In-Memory ZIP Packaging**: Generates and compresses high-resolution PNGs into a single `.zip` file in browser memory without freezing the UI.

### 8. Programmatic SEO & Deep-Linking
- 16+ dedicated keyword-targeted landing pages with technical specifications, industry use cases, and FAQ accordions.
- Schema.org JSON-LD structured data (`WebApplication`, `FAQPage`, `BreadcrumbList`).
- Deep-linking URL routing (`?symbology=datamatrix`, `?wizard=wifi`) for instant transitions from search landing pages into the live studio.

---

## 🛠️ Architecture & Tech Stack

| Layer | Implementation | Details |
|---|---|---|
| **Core Structure** | HTML5 Semantic SPA | Pure static markup with accessible ARIA semantics |
| **Styling** | Modern CSS3 | CSS Custom Properties, Dark Mode, Flexbox, Responsive Grid |
| **Logic** | Modular ES6+ JavaScript | Zero-framework Vanilla JS; clean separation of concerns |
| **1D/2D Engine** | `bwip-js` | Barcode Writer in Pure JavaScript (100+ symbologies) |
| **Styled QR Engine** | `qr-code-styling` | Branded QR rendering with SVG/Canvas outputs |
| **PDF Generation** | `jspdf` | Client-side print-ready vector PDF document compiler |
| **ZIP Compression** | `jszip` | In-memory asynchronous archive packaging |
| **Hosting Target** | Static / LiteSpeed | Apache `.htaccess` with aggressive browser caching & Gzip |

---

## 📂 Directory Structure

```
qr_and_barcode_generator/
├── index.html                      # Main Live Reactive Studio
├── .htaccess                       # LiteSpeed caching, compression & security headers
├── robots.txt                      # 2026 search crawler directives
├── llms.txt                        # AI agent capability summary
├── llms-full.txt                   # Complete technical knowledge spec for LLMs
├── sitemap.xml                     # Search engine sitemap index
├── css/
│   ├── theme.css                   # Color tokens, typography, glassmorphism variables
│   ├── main.css                    # Responsive layout & utility classes
│   └── components.css              # Panels, tabs, preview box, buttons & alerts
├── js/
│   ├── app.js                      # Application coordinator & state controller
│   ├── core/
│   │   ├── dynamic-loader.js       # CDN dynamic lazy-loader with memoization
│   │   ├── engine.js               # Unified BarcodeEngine rendering orchestrator
│   │   ├── checksums.js            # Mod-10, EAN, UPC, ITF-14 & Luhn algorithms
│   │   ├── logo-presets.js         # Embedded vector SVG brand presets
│   │   └── cookie-banner.js        # Zero-dependency GDPR/ePrivacy consent banner
│   ├── generators/
│   │   ├── registry.js             # Symbology catalog & metadata registry
│   │   ├── qr-code.js              # Standard & styled QR plugin
│   │   ├── data-matrix.js          # Square 1:1 ECC 200 plugin
│   │   ├── aztec.js                # Square 1:1 high-density 2D plugin
│   │   ├── pdf417.js               # Stacked 2D (2.5:1 ratio) plugin
│   │   ├── ean-13.js               # Retail POS plugin with auto-checksum
│   │   ├── upc-a.js                # North American retail plugin
│   │   ├── code-128.js             # High-density alphanumeric logistics plugin
│   │   └── itf-14.js               # Outer carton shipping container plugin
│   ├── wizards/
│   │   └── qr-wizards.js           # 10 Smart QR payload compilers & UI forms
│   └── export/
│       ├── image-exporter.js       # PNG (1x/2x/4x) and SVG vector exporter
│       ├── pdf-exporter.js         # Avery label sheet PDF compiler
│       └── batch-exporter.js       # Batch sequential & CSV ZIP archiver
├── pages/                          # 16 Programmatic SEO landing pages
│   ├── ean-13-barcode-generator.html
│   ├── qr-code-wifi-generator.html
│   ├── upc-a-barcode-generator.html
│   └── ...
├── tests/
│   ├── test-runner.html            # In-browser test runner (193/193 assertions passing)
│   └── unit/                       # Unit test suites (checksums, wizards, exports, batch)
└── tools/
    └── generate-seo-pages.js       # Static SEO page generator script
```

---

## 💻 Local Development

Because the project is 100% client-side with ES modules, it can be served using any local static web server:

```powershell
# Using Python
python -m http.server 8080

# Using Node.js http-server or npx serve
npx serve . -p 8080
```

Open `http://localhost:8080` in your browser.

---

## 🧪 Testing & Verification

Run the comprehensive in-browser test suite:
1. Start your local static server.
2. Navigate to `http://localhost:8080/tests/test-runner.html`.
3. View real-time test execution:
   - **Checksum Suite**: GS1 Mod-10, EAN-13, UPC-A, ITF-14, Luhn calculations.
   - **QR Wizard Suite**: Wi-Fi formatting, vCard 3.0 escaping, Crypto URI schemes, iCalendar dates.
   - **Export Suite**: Canvas scaling, SVG conformance, Avery label grid math.
   - **Batch Suite**: Sequential pad numbering, delimiter parsing, payload chunking.
   - **Result**: **193 / 193 Assertions Passing**.

---

## 📜 Production Deployment

Deploy the files directly to any static web hosting provider (e.g., Hostinger Business Hosting, Cloudflare Pages, Netlify, Vercel, or Apache/LiteSpeed web root):

1. Upload the project files to `public_html/`.
2. Ensure `.htaccess` is present for LiteSpeed/Apache caching and Gzip compression.
3. Verify that `robots.txt` and `sitemap.xml` are accessible at the root domain.

---

## 📄 License

MIT License. Designed for open-source utility and commercial deployment.
