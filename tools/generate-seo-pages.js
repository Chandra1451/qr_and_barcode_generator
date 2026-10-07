/**
 * Programmatic SEO Landing Page Generator
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Generates 18+ high-intent, keyword-targeted landing pages with:
 * - Direct deep-links to pre-configured generator in index.html
 * - Full WebApplication, FAQPage, and BreadcrumbList JSON-LD schemas
 * - Comprehensive technical specifications and industry guidelines
 * - Accessible FAQ accordions
 * - Generates root sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://universalcodemaker.com';
// Cache-busting version for shared CSS (served with a 1-year immutable cache).
// Keep in sync with the ?v= used on the root pages; bump whenever the CSS changes.
const ASSET_VERSION = '3.3';
const PAGES_DIR = path.join(__dirname, '..', 'pages');

if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

// Matrix of programmatic pages
const SEO_PAGES = [
  // 1D Retail & Logistics
  {
    slug: 'ean-13-barcode-generator',
    name: 'EAN-13 Barcode Generator',
    shortName: 'EAN-13',
    queryParam: 'symbology=ean-13',
    category: 'Retail & POS',
    metaTitle: 'Free EAN-13 Barcode Generator (300 DPI) - Vector SVG & Avery Print',
    metaDescription: 'Generate 100% free GS1-compliant EAN-13 retail barcodes online. Features automatic Mod-10 check digit calculation, high-resolution 300 DPI PNG, and vector SVG download.',
    h1: 'Free GS1 EAN-13 Retail Barcode Generator',
    lead: 'Create standards-compliant International Article Number (EAN-13) barcodes for global retail packaging, supermarkets, and POS checkout systems with instant vector SVG and 300 DPI PNG export.',
    technicalSpec: {
      standard: 'ISO/IEC 15420 / GS1 General Specifications',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '12 data digits + 1 Mod-10 check digit (total 13 digits)',
      size: 'Bar width (X-dimension) 0.264–0.660 mm, target 0.330 mm: 37.29 mm wide incl. quiet zones, bars 22.85 mm high',
      quietZones: 'Left: 3.63mm (11X), Right: 2.31mm (7X)'
    },
    useCases: [
      'Global retail packaging (Europe, Asia, Latin America, Australia)',
      'Supermarket Point of Sale (POS) laser scanning checkouts',
      'Amazon, eBay, and Google Shopping product identifier listings',
      'Inventory control and consumer packaged goods (CPG)'
    ],
    faqs: [
      {
        q: 'How is the 13th check digit of an EAN-13 barcode calculated?',
        a: 'The 13th digit is a GS1 Modulo-10 checksum calculated by multiplying odd-positioned digits by 1 and even-positioned digits by 3, summing them, and determining the remainder needed to round up to the nearest multiple of 10. Our generator calculates this automatically.'
      },
      {
        q: 'Do I need to buy official EAN-13 numbers from GS1?',
        a: 'If you are selling products in commercial supermarkets or retail chains, you must get your numbers from GS1 (a company prefix, or in some countries single GTINs). For internal inventory, internal POS systems, or private cataloging, you can freely assign numbers using prefixes 200–299.'
      },
      {
        q: 'Can I download an EAN-13 barcode in vector SVG for packaging design?',
        a: 'Yes. Our generator produces infinitely scalable vector SVG files that can be imported directly into Adobe Illustrator, CorelDRAW, or InDesign for prepress commercial packaging.'
      }
    ]
  },
  {
    slug: 'upc-a-barcode-generator',
    name: 'UPC-A Barcode Generator',
    shortName: 'UPC-A',
    queryParam: 'symbology=upc-a',
    category: 'Retail & POS',
    metaTitle: 'Free UPC-A Barcode Generator (300 DPI) - US & Canadian Retail Ready',
    metaDescription: 'Generate authentic 12-digit UPC-A barcodes for North American retail. Automatic Mod-10 check digit calculation, vector SVG, and high-DPI raster downloads.',
    h1: 'Free UPC-A Retail Barcode Generator',
    lead: 'Generate official Universal Product Code (UPC-A) barcodes for US and Canadian retail products. Features automatic check digit calculation, crisp vector SVG, and 300+ DPI print export.',
    technicalSpec: {
      standard: 'ISO/IEC 15420 / GS1 US Standards',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '11 data digits + 1 Mod-10 check digit (total 12 digits)',
      size: 'Bar width (X-dimension) 0.264–0.660 mm, target 0.330 mm: 1.468" wide incl. quiet zones, bars 0.900" high',
      quietZones: 'Left and Right: 9X module width minimum'
    },
    useCases: [
      'United States and Canada retail store checkout',
      'Amazon North America FBA product labeling',
      'Wholesale packaging and consumer goods',
      'Inventory tracking in big-box retail (Walmart, Target)'
    ],
    faqs: [
      {
        q: 'What is the difference between UPC-A and EAN-13?',
        a: 'UPC-A is a 12-digit standard primarily used in the USA and Canada, while EAN-13 is a 13-digit standard used across the rest of the world. In fact, a UPC-A code is simply an EAN-13 code with a leading zero.'
      },
      {
        q: 'Does this generator check my UPC-A check digit?',
        a: 'Yes. Enter either 11 digits to have the check digit automatically appended, or enter all 12 digits to have the check digit mathematically verified against GS1 Mod-10 specifications.'
      },
      {
        q: 'Can I print UPC-A barcodes on Avery sticky labels?',
        a: 'Yes. Open the generator, click "Print Avery PDF Label Sheet", and choose Avery 5160 (30 address labels) or Avery 5163 (10 shipping labels). For a title or price next to the barcode, use the label maker instead.'
      }
    ]
  },
  {
    slug: 'code-128-barcode-generator',
    name: 'Code 128 Barcode Generator',
    shortName: 'Code 128',
    queryParam: 'symbology=code-128',
    category: 'Logistics & Shipping',
    metaTitle: 'Free Code 128 Barcode Generator - High Density Logistics & Inventory',
    metaDescription: 'Generate high-density Code 128 barcodes online. Supports full ASCII 128 character set, automatic subset switching (A/B/C), vector SVG, and 300 DPI PNG.',
    h1: 'Free Code 128 Logistics Barcode Generator',
    lead: 'Create compact, high-density Code 128 barcodes supporting the complete 128 ASCII character set with automatic subset optimization for warehouse, logistics, and asset tracking.',
    technicalSpec: {
      standard: 'ISO/IEC 15417',
      characterSet: 'Full ASCII 128 (Letters, numbers, punctuation, control chars)',
      subsets: 'Code 128A (Caps/Control), Code 128B (ASCII), Code 128C (Double-density numeric pairs)',
      checksum: 'Modulo 103 check character (calculated automatically)',
      quietZones: '10X minimum on both ends'
    },
    useCases: [
      'Warehouse bin and pallet rack labeling',
      'Shipping container and carton tracking (UCC/EAN-128)',
      'Enterprise asset tags and equipment serial numbers',
      'Medical laboratory specimen tube labeling'
    ],
    faqs: [
      {
        q: 'What characters can I encode into a Code 128 barcode?',
        a: 'Code 128 can encode all 128 standard ASCII characters, including uppercase letters, lowercase letters, numbers, punctuation symbols, and control codes.'
      },
      {
        q: 'Does your engine use Code 128 subset C for numeric data?',
        a: 'Yes. Our engine uses automatic optimization to switch into Code 128C whenever strings of digits appear, compressing two numeric digits into a single barcode character for maximum compactness.'
      }
    ]
  },
  {
    slug: 'itf-14-barcode-generator',
    name: 'ITF-14 Barcode Generator',
    shortName: 'ITF-14',
    queryParam: 'symbology=itf-14',
    category: 'Logistics & Shipping',
    metaTitle: 'Free ITF-14 Barcode Generator - Corrugated Shipping Carton Ready',
    metaDescription: 'Create GS1-compliant ITF-14 shipping carton barcodes with protective bearer bars. Automatic Mod-10 check digit, vector SVG, and high-DPI export.',
    h1: 'Free ITF-14 Shipping Carton Barcode Generator',
    lead: 'Generate GS1-standard ITF-14 (Interleaved 2 of 5) barcodes with thick protective bearer bars engineered specifically for direct printing onto corrugated cardboard shipping master cases.',
    technicalSpec: {
      standard: 'ISO/IEC 16390 / GS1 General Specifications',
      characterSet: 'Numeric digits only (0–9)',
      payloadLength: '13 data digits + 1 Mod-10 check digit (14 digits total)',
      bearerBars: 'Top and bottom bars or full surrounding frame (typically 4.8mm thick)',
      aspectRatio: 'Wide linear ratio (typically 3:1 to 4:1)'
    },
    useCases: [
      'Corrugated cardboard outer shipping cartons and master cases',
      'Wholesale pallet distribution and receiving scanning',
      'Cross-docking logistics tracking in automated distribution centers'
    ],
    faqs: [
      {
        q: 'Why does an ITF-14 barcode have thick bearer bars?',
        a: 'Bearer bars equalize printing plate pressure when printing directly onto rough, undulating corrugated cardboard, and prevent barcode laser scanners from misreading a partial slice of the code.'
      },
      {
        q: 'Can an ITF-14 barcode be scanned at retail cash registers?',
        a: 'No. ITF-14 barcodes are strictly meant for master cases and wholesale shipping cartons, not consumer-facing retail checkouts.'
      }
    ]
  },
  // 2D Matrix Codes
  {
    slug: 'data-matrix-generator',
    name: 'Data Matrix Barcode Generator',
    shortName: 'Data Matrix',
    queryParam: 'symbology=data-matrix',
    category: '2D Matrix',
    metaTitle: 'Free Data Matrix Generator (ECC 200) - 2D Square Vector & Print',
    metaDescription: 'Generate high-density Data Matrix ECC 200 2D barcodes online. Compliant with ISO/IEC 16022, GS1 DataMatrix, and healthcare UDI standards with vector SVG export.',
    h1: 'Free Data Matrix (ECC 200) 2D Barcode Generator',
    lead: 'Create compact, high-capacity Data Matrix 2D square matrix barcodes engineered for electronic component marking, healthcare pharmaceutical packaging, and aerospace direct part marking (DPM).',
    technicalSpec: {
      standard: 'ISO/IEC 16022 (ECC 200 standard with Reed-Solomon error correction)',
      characterSet: 'Full ASCII, binary, and GS1 Application Identifiers',
      capacity: 'Up to 3,116 numeric digits or 2,335 alphanumeric characters',
      finderPattern: 'Solid "L" shaped finder pattern on bottom and left borders',
      aspectRatio: 'Square (rectangular sizes are also part of the standard)'
    },
    useCases: [
      'FDA Unique Device Identification (UDI) for medical instruments',
      'Direct Part Marking (DPM) on aerospace and automotive steel components',
      'Printed circuit board (PCB) micro-labeling',
      'European Falsified Medicines Directive (FMD) serial packs'
    ],
    faqs: [
      {
        q: 'What is the finder pattern on a Data Matrix code?',
        a: 'A Data Matrix code features an "L" shaped solid line on two adjacent sides, which cameras use to determine the orientation and module size of the symbol.'
      },
      {
        q: 'Can Data Matrix codes be read if partially scratched or damaged?',
        a: 'Yes! The ECC 200 specification utilizes Reed-Solomon error correction algorithms capable of recovering up to 30% of obscured or scratched modules.'
      }
    ]
  },
  {
    slug: 'aztec-code-generator',
    name: 'Aztec Code Generator',
    shortName: 'Aztec Code',
    queryParam: 'symbology=aztec',
    category: '2D Matrix',
    metaTitle: 'Free Aztec Code Generator - Transit, Airline & Railway 2D Barcode',
    metaDescription: 'Generate high-density Aztec 2D barcodes with central bullseye finder. Ideal for mobile airline boarding passes, electronic train tickets, and vehicle registration.',
    h1: 'Free Aztec Code 2D Barcode Generator',
    lead: 'Generate square Aztec 2D barcodes featuring a distinctive central bullseye target finder pattern. Standard format for airline mobile boarding passes and European railway ticketing.',
    technicalSpec: {
      standard: 'ISO/IEC 24778',
      finderPattern: 'Central concentric square bullseye target pattern',
      quietZone: 'Zero required quiet zone (scans right up to graphic edges)',
      capacity: 'Up to 3,832 numeric digits or 3,067 alphanumeric characters'
    },
    useCases: [
      'Airline IATA mobile boarding passes on smartphones',
      'European rail and transit e-tickets (Eurostar, Deutsche Bahn, SNCF)',
      'Vehicle registration documents and tax discs',
      'Hospital patient wristband tracking'
    ],
    faqs: [
      {
        q: 'Why do transit authorities prefer Aztec codes over QR codes?',
        a: 'Aztec codes require zero quiet zone (margin) around the code, meaning they can be printed right up to the edge of paper tickets or mobile display viewports without read failures.'
      }
    ]
  },
  {
    slug: 'pdf417-barcode-generator',
    name: 'PDF417 Barcode Generator',
    shortName: 'PDF417',
    queryParam: 'symbology=pdf417',
    category: '2D Stacked',
    metaTitle: 'Free PDF417 Barcode Generator - Driver License & ID Card Standard',
    metaDescription: 'Generate authentic PDF417 stacked 2D barcodes online. Fully compliant with AAMVA driver license, airline boarding pass, and postal standards.',
    h1: 'Free PDF417 Stacked 2D Barcode Generator',
    lead: 'Create high-capacity PDF417 stacked 2D barcodes compliant with North American AAMVA driver license specifications, paper airline boarding passes, and government customs forms.',
    technicalSpec: {
      standard: 'ISO/IEC 15438',
      structure: 'Stacked linear rows (each codeword contains 4 bars and 4 spaces across 17 modules)',
      aspectRatio: 'Rectangular format (standard ~2.5:1 ratio)',
      capacity: 'Over 1.1 kilobytes of machine-readable data per symbol'
    },
    useCases: [
      'State DMV and provincial driver licenses (AAMVA standard)',
      'Paper airline boarding passes (IATA BCBP standard)',
      'USPS and FedEx package shipping documents',
      'Government tax filing and customs declaration forms'
    ],
    faqs: [
      {
        q: 'What does PDF417 stand for?',
        a: 'PDF stands for "Portable Data File". The "417" signifies that each pattern is 17 modules wide and consists of 4 bars and 4 spaces.'
      }
    ]
  },
  // Smart QR Wizards
  {
    slug: 'wifi-qr-code-generator',
    name: 'Wi-Fi QR Code Generator',
    shortName: 'Wi-Fi QR',
    queryParam: 'wizard=wifi',
    category: 'Smart QR',
    metaTitle: 'Free Wi-Fi QR Code Generator - Connect Guests Without Typing Passwords',
    metaDescription: 'Generate instant Wi-Fi connect QR codes for home, cafe, and office networks. Supports WPA/WPA2/WPA3, WEP, and hidden networks. Vector SVG and high-res print.',
    h1: 'Free Wi-Fi Auto-Connect QR Code Generator',
    lead: 'Create custom branded Wi-Fi QR codes that allow customers, hotel guests, and friends to instantly join your wireless network simply by scanning with their smartphone camera.',
    technicalSpec: {
      payloadFormat: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;',
      encryptionProtocols: 'WPA/WPA2/WPA3, WEP, Open (None)',
      compatibility: 'Native iOS Camera and Android Quick Settings QR Scanner'
    },
    useCases: [
      'Restaurant, coffee shop, and bar table stands',
      'Hotel rooms and Airbnb guest welcome books',
      'Office conference rooms and visitor lobbies',
      'Home living room guest Wi-Fi sharing signs'
    ],
    faqs: [
      {
        q: 'Do guests need to install an app to scan the Wi-Fi QR code?',
        a: 'No! Both modern iPhones (iOS 11+) and Android devices natively recognize Wi-Fi QR codes directly inside the built-in Camera app and display an instant "Join Network" button.'
      },
      {
        q: 'Is my Wi-Fi password sent to your servers?',
        a: 'Never. Our application runs 100% in your browser. Your network name and password never leave your device.'
      }
    ]
  },
  {
    slug: 'vcard-qr-code-generator',
    name: 'vCard QR Code Generator',
    shortName: 'vCard QR',
    queryParam: 'wizard=vcard',
    category: 'Smart QR',
    metaTitle: 'Free vCard QR Code Generator - Digital Business Card for Instant Save',
    metaDescription: 'Create digital business card vCard QR codes. Encodes name, phone, email, company, job title, and website directly into smartphone contacts with zero typing.',
    h1: 'Free vCard Digital Business Card QR Code Generator',
    lead: 'Generate contactless digital business card QR codes conforming to the universal vCard standard. When scanned, smartphones immediately prompt the user to save your contact card.',
    technicalSpec: {
      standard: 'vCard 3.0 (IETF RFC 2426)',
      fields: 'Full Name, Phone, Email, Company, Job Title, Website URL',
      compatibility: 'Apple Contacts, Google Contacts, Microsoft Outlook'
    },
    useCases: [
      'Paper business cards and trade show conference badges',
      'Email signature image badges and LinkedIn profile banners',
      'Real estate agent yard signs and sales brochures',
      'Speaker slides and presentation closing decks'
    ],
    faqs: [
      {
        q: 'What happens when someone scans a vCard QR code?',
        a: 'Their phone automatically launches the Contacts app with all your details pre-filled and a single "Save Contact" button.'
      }
    ]
  },
  {
    slug: 'crypto-qr-code-generator',
    name: 'Crypto QR Code Generator',
    shortName: 'Crypto QR',
    queryParam: 'wizard=crypto',
    category: 'Smart QR',
    metaTitle: 'Free Crypto QR Code Generator - Bitcoin, Ethereum, Solana Wallet Pay',
    metaDescription: 'Generate secure cryptocurrency payment QR codes for Bitcoin, Ethereum, and Solana. Add optional payment amounts and branded coin logos with zero tracking.',
    h1: 'Free Crypto Payment & Wallet QR Code Generator',
    lead: 'Generate clean, scannable cryptocurrency wallet QR codes for Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) with optional payment request amounts.',
    technicalSpec: {
      supportedChains: 'Bitcoin (BIP-21), Ethereum (EIP-681), Solana',
      uriSchemes: 'bitcoin:, ethereum:, solana:',
      styling: 'Add built-in Bitcoin or Ethereum brand center logos'
    },
    useCases: [
      'Merchant point-of-sale cryptocurrency checkout',
      'Content creator tip jars on YouTube, Twitch, and blogs',
      'Invoicing freelance clients in digital currency',
      'Non-profit cryptocurrency donation banners'
    ],
    faqs: [
      {
        q: 'Are these QR codes compatible with mobile crypto wallets?',
        a: 'Yes. The generated codes use official cryptocurrency URI standards (such as BIP-21 for Bitcoin) recognized by Coinbase, Trust Wallet, MetaMask, Phantom, and Ledger.'
      }
    ]
  },
  {
    slug: 'email-qr-code-generator',
    name: 'Email QR Code Generator',
    shortName: 'Email QR',
    queryParam: 'wizard=email',
    category: 'Smart QR',
    metaTitle: 'Free Email QR Code Generator - Pre-filled Subject and Body mailto',
    metaDescription: 'Generate instant mailto QR codes with pre-filled recipient email, subject line, and body text. 100% free with vector SVG and 300 DPI PNG export.',
    h1: 'Free Pre-Filled Email (mailto) QR Code Generator',
    lead: 'Create interactive email QR codes that automatically open the user’s default mail app (Apple Mail, Gmail, Outlook) with your recipient email, subject line, and body message pre-populated.',
    technicalSpec: {
      protocol: 'mailto: URI scheme (RFC 6068)',
      parameters: 'subject, body, cc, bcc',
      encoding: 'Standard URL percentage-encoding for special characters'
    },
    useCases: [
      'Customer support feedback signs and product warranty cards',
      'RSVP registration for private events and conferences',
      'Lead capture on flyers, posters, and billboard ads'
    ],
    faqs: [
      {
        q: 'What happens when someone scans an email QR code?',
        a: 'Their smartphone opens their primary email app with the To:, Subject:, and Body: fields already filled in, ready to send with one tap.'
      }
    ]
  },
  {
    slug: 'sms-qr-code-generator',
    name: 'SMS Text QR Code Generator',
    shortName: 'SMS QR',
    queryParam: 'wizard=sms',
    category: 'Smart QR',
    metaTitle: 'Free SMS Text Message QR Code Generator - Scan to Send SMS',
    metaDescription: 'Generate scan-to-text SMS QR codes with pre-written message body and recipient phone number. Zero tracking, permanent free codes.',
    h1: 'Free SMS Text Message QR Code Generator',
    lead: 'Create scan-to-text QR codes that immediately launch the native SMS/Messaging application with a pre-written text message ready to send to your target phone number.',
    technicalSpec: {
      protocol: 'smsto: and sms: URI schemes (RFC 5724)',
      parameters: 'Recipient phone number, message text',
      compatibility: 'Universal iOS Messages and Android Messages support'
    },
    useCases: [
      'Keyword opt-in SMS marketing campaigns (e.g. "Send VIP to 555-1234")',
      'Emergency roadside assistance or maintenance dispatch',
      'Text-to-win contests and promotional sweepstakes'
    ],
    faqs: [
      {
        q: 'Does the user get charged automatically when scanning?',
        a: 'No. The user still has to tap "Send" in their messaging app. It simply pre-fills the message and phone number.'
      }
    ]
  },
  {
    slug: 'phone-call-qr-code-generator',
    name: 'Phone Call QR Code Generator',
    shortName: 'Phone QR',
    queryParam: 'wizard=phone',
    category: 'Smart QR',
    metaTitle: 'Free Click-to-Call Phone QR Code Generator - One-Tap Dialing',
    metaDescription: 'Generate click-to-dial telephone QR codes. Customers tap once to call your business without dialing or saving numbers manually.',
    h1: 'Free Click-to-Call Phone QR Code Generator',
    lead: 'Create direct telephone dialing QR codes using the RFC 3966 `tel:` URI standard. Scanning automatically prompts the phone dialer to call your customer service or sales line.',
    technicalSpec: {
      protocol: 'tel: URI scheme (RFC 3966)',
      format: 'International E.164 format (+1234567890)',
      compatibility: 'All cellular smartphones and VoIP dialers'
    },
    useCases: [
      'Restaurant takeout ordering signs and menu boards',
      'Real estate yard signs and contractor vehicle decals',
      'Emergency hotlines and 24/7 technical support numbers'
    ],
    faqs: [
      {
        q: 'Should I include the country code in the phone number?',
        a: 'Yes, always format phone numbers with a leading "+" and country code (e.g., +1 for USA/Canada, +44 for UK) to ensure international callers dial successfully.'
      }
    ]
  },
  {
    slug: 'calendar-event-qr-code-generator',
    name: 'Calendar Event QR Code Generator',
    shortName: 'Event QR',
    queryParam: 'wizard=event',
    category: 'Smart QR',
    metaTitle: 'Free Calendar Event (iCal) QR Code Generator - Add Event in 1-Tap',
    metaDescription: 'Create iCal calendar event QR codes with event title, start/end dates, location, and description. Instant add to Google Calendar and Apple Calendar.',
    h1: 'Free iCal Calendar Event QR Code Generator',
    lead: 'Generate universal vEvent / iCalendar QR codes. When scanned, smartphones prompt users to add your webinar, concert, party, or conference directly to their personal calendar.',
    technicalSpec: {
      standard: 'iCalendar VEVENT Specification (RFC 5545)',
      fields: 'SUMMARY, LOCATION, DESCRIPTION, DTSTART, DTEND',
      timestamps: 'ISO 8601 formatted UTC/Local timestamps'
    },
    useCases: [
      'Concert, theater, and sports match tickets',
      'Wedding invitations and birthday party save-the-dates',
      'Corporate webinars, seminars, and product launch invitations'
    ],
    faqs: [
      {
        q: 'Does it work with both Apple Calendar and Google Calendar?',
        a: 'Yes! All modern smartphones natively recognize VEVENT data blocks and open the user’s default calendar application.'
      }
    ]
  },
  {
    slug: 'google-maps-location-qr-code-generator',
    name: 'Google Maps Location QR Code Generator',
    shortName: 'Maps QR',
    queryParam: 'wizard=location',
    category: 'Smart QR',
    metaTitle: 'Free Google Maps QR Code Generator for Any Address or Location',
    metaDescription: 'Make a QR code that opens a place in Google Maps: type an address, a place name or GPS coordinates. Free, static and never expires.',
    h1: 'Free Google Maps Location QR Code Generator',
    lead: 'Create a QR code that opens your shop, venue or meeting point in Google Maps. Type an address or place name, or use exact GPS coordinates for spots without an address. It opens in the Google Maps app if installed, otherwise in the browser.',
    technicalSpec: {
      uriFormat: 'https://www.google.com/maps/search/?api=1&query=… (Google Maps URLs)',
      compatibility: 'Google Maps app on Android and iPhone, or any web browser'
    },
    useCases: [
      'Storefront window decals and retail shopping center directories',
      'Wedding venues, conference hall entrances, and festival grounds',
      'Real estate open house directional signs'
    ],
    faqs: [
      {
        q: 'Can I use latitude and longitude coordinates instead of an address?',
        a: 'Yes. Coordinates pin an exact spot even where there is no street address, such as a car park entrance or a field gate. If you fill them in, they are used instead of the place name.'
      }
    ]
  },
  {
    slug: 'plain-text-qr-code-generator',
    name: 'Plain Text QR Code Generator',
    shortName: 'Text QR',
    queryParam: 'wizard=text',
    category: 'Smart QR',
    metaTitle: 'Free Plain Text QR Code Generator - Encode Any Message or Serial',
    metaDescription: 'Generate unformatted plain text QR codes for notes, secrets, serial codes, and quotes. Supports up to 4,296 alphanumeric characters.',
    h1: 'Free Plain Text Multi-Line QR Code Generator',
    lead: 'Encode raw, unformatted text messages, alphanumeric serials, cryptographic keys, or quotes into a high-capacity QR code with up to 4,296 characters.',
    technicalSpec: {
      characterCapacity: 'Up to 7,089 numeric, 4,296 alphanumeric, or 2,953 byte characters',
      errorCorrection: 'Level L (7%), M (15%), Q (25%), H (30%)',
      encoding: 'UTF-8 multi-byte character support'
    },
    useCases: [
      'Cryptographic recovery phrases and secure offline backups',
      'Asset serial numbers and production line batch tokens',
      'Scavenger hunt clues and educational classroom quizzes'
    ],
    faqs: [
      {
        q: 'What is the maximum amount of text I can encode?',
        a: 'A Version 40 QR code can store up to 4,296 alphanumeric characters or 7,089 numbers. For optimal scan speed, keep text under 300 characters.'
      }
    ]
  },
  {
    slug: 'amazon-fba-fnsku-barcode-generator',
    name: 'Amazon FBA / FNSKU Barcode Generator',
    shortName: 'Amazon FBA / FNSKU',
    queryParam: 'symbology=code-128&preset=amazon-fnsku-5160&label=1',
    category: 'Retail & POS',
    metaTitle: 'Free Amazon FBA Barcode Generator (FNSKU) - Avery 5160 & Thermal Roll',
    metaDescription: 'Make Amazon FBA FNSKU labels (Code 128) for free, on Avery 5160 sheets or thermal rolls, with title and condition. Check Seller Central for Amazon\'s latest label rules.',
    h1: 'Free Amazon FBA FNSKU Barcode & Label Generator',
    lead: 'Create standards-compliant Amazon Fulfillment Network Stock Keeping Unit (FNSKU) item labels for Seller Central inventory. Formatted in high-density Code 128 with instant 30-up Avery sheet and thermal roll export.',
    technicalSpec: {
      standard: 'Amazon Seller Central FNSKU / Code 128 Subset A/B',
      payloadFormat: 'X00-prefix alphanumeric identifier (typically 10 characters)',
      labelDimensions: '1.0" × 2.625" (Avery 5160 / 30-up) or 2.25" × 1.25" Direct Thermal Roll',
      mandatoryElements: 'Scannable Barcode, FNSKU Code Text, Product Title (max 2 lines), Condition Note (e.g. "New")',
      quietZones: 'Minimum 0.25" (6.35mm) side margins and 0.125" top/bottom margin'
    },
    useCases: [
      'Amazon FBA private label product prep and fulfillment compliance',
      'Avery 5160 / 30-up laser and inkjet label sheets for bulk batch preparation',
      'Direct thermal roll printing (MUNBYN, Rollo, Zebra) for fast on-demand tagging',
      'Covering existing manufacturer UPC/EAN barcodes to prevent co-mingled inventory errors'
    ],
    faqs: [
      {
        q: 'What barcode symbology does Amazon require for FNSKU labels?',
        a: 'Amazon FNSKU labels use Code 128 barcodes. UniversalCodeMaker draws them with exact bar widths and full quiet zones, which help them scan first time. Print at 100% scale and test-scan one label before labelling your stock.'
      },
      {
        q: 'What information must appear on an Amazon FBA item label?',
        a: 'Amazon packaging guidelines require four mandatory elements on every unit label: 1) The scannable Code 128 barcode, 2) The human-readable FNSKU alphanumeric string (e.g., X003B7TEST), 3) The product title (shortened if necessary), and 4) The condition of the item (e.g., "New" or "Used - Like New").'
      },
      {
        q: 'Can I print FNSKU labels on Avery 5160 sheets or thermal roll printers?',
        a: 'Yes. Our physical label studio includes dedicated presets for standard 30-up sheets (Avery 5160 / 1.0" × 2.625") and 1-click thermal roll printing for Rollo, MUNBYN, and Zebra thermal printers with zero margin clipping.'
      },
      {
        q: 'How do I avoid Amazon inventory placement rejection fees?',
        a: 'Ensure your barcodes maintain high print contrast (pure black on crisp white background), observe the minimum 0.25" quiet zones, do not place transparent tape over the barcode, and completely cover any existing manufacturer UPC/EAN barcodes so only the FNSKU is visible to warehouse scanners.'
      }
    ]
  },
  {
    slug: 'google-reviews-qr-code-generator',
    name: 'Google Reviews QR Code Generator',
    shortName: 'Google Review QR',
    queryParam: 'symbology=qr-code&wizard=google_review',
    category: 'Smart QR',
    metaTitle: 'Free Google Review QR Code Generator - Instant 5-Star Customer Feedback',
    metaDescription: 'Generate a free Google Review QR code for your business. Opens directly into the 5-star review dialog on mobile. High-resolution 300 DPI vector print files, zero scan limits.',
    h1: 'Free Google Reviews QR Code Generator',
    lead: 'Turn in-person customers into verified 5-star Google reviews effortlessly. Generate custom QR codes that launch directly into your Google Business review box with one quick scan.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      destinationType: 'Direct review dialog URL (https://search.google.com/local/writereview?placeid={ID} or g.page shortlink)',
      supportedInputs: 'Google Review Share Link, Google Maps Profile URL, or Google Place ID',
      errorCorrection: 'Level M (15% redundancy) or Level Q (25% redundancy with custom center icon)',
      exportFormats: 'SVG Vector (lossless packaging), 300 DPI PNG, PDF Countertop Stand Sign'
    },
    useCases: [
      'Restaurant table tents, bill presenters, and payment receipt footers',
      'Retail counter checkout displays, window decals, and exit doors',
      'Field service invoices, technician business cards, and leave-behind cards',
      'Product packaging inserts, delivery boxes, and customer thank-you notes'
    ],
    faqs: [
      {
        q: 'How does a Google Review QR code take customers directly to the review form?',
        a: 'By linking to Google\'s specialized review URL or compiling your Google Place ID into "https://search.google.com/local/writereview?placeid=...", smartphones immediately open the Google Maps app or browser directly into the 5-star rating and comment submission dialog.'
      },
      {
        q: 'How do I find my business Google Review link or Place ID?',
        a: 'Open Google Search, search for your business name (while logged into your Google Business Profile account), click "Ask for reviews", and copy the review link. Alternatively, paste your Google Maps business link into our wizard and we format it automatically.'
      },
      {
        q: 'Will this QR code ever expire or require a monthly payment?',
        a: 'No. UniversalCodeMaker creates 100% static, client-side QR codes. There are zero redirect intermediaries, zero subscription paywalls, and zero scan limits. Your code functions permanently.'
      }
    ]
  },
  {
    slug: 'whatsapp-qr-code-generator',
    name: 'WhatsApp QR Code Generator',
    shortName: 'WhatsApp QR',
    queryParam: 'symbology=qr-code&wizard=whatsapp',
    category: 'Smart QR',
    metaTitle: 'Free WhatsApp QR Code Generator (Chat & Message Link) - No Sign-up',
    metaDescription: 'Create free WhatsApp QR codes with pre-filled greeting messages. Instant wa.me direct chat links, vector SVG and 300 DPI print ready. No subscription fees or tracking redirects.',
    h1: 'Free WhatsApp Direct Chat QR Code Generator',
    lead: 'Allow customers, clients, and guests to initiate a WhatsApp conversation with your business in one scan. Supports international numbers and pre-filled introductory messages.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      protocol: 'Official WhatsApp Web & App Intent (https://wa.me/{phone}?text={message})',
      phoneFormat: 'E.164 International Format (Country Code + Phone Number, digits only)',
      messageEncoding: 'RFC 3986 URI component encoding with automated line break normalization',
      errorCorrection: 'Level M (15% recovery) or Level H (30% recovery with custom WhatsApp logo)'
    },
    useCases: [
      'Customer support kiosks and service desks for instant messaging',
      'Restaurant and café table menus for WhatsApp order placement',
      'Real estate "For Sale" yard signs and flyers for quick agent inquiries',
      'Ecommerce delivery packaging inserts for direct customer care'
    ],
    faqs: [
      {
        q: 'How does a customer start a WhatsApp chat from scanning a QR code?',
        a: 'When a smartphone camera scans the QR code, it detects the wa.me protocol and prompts the user to open WhatsApp directly with your number in the chat window, ready to send your pre-filled inquiry.'
      },
      {
        q: 'Do customers need to save my phone number in their contacts first?',
        a: 'No. The wa.me intent opens a conversation immediately without requiring the user to add your contact details to their address book first.'
      },
      {
        q: 'Can I include a pre-filled greeting or order template?',
        a: 'Yes. Enter your custom text (e.g. "Hi, I would like to inquire about...") in our wizard and it will be pre-populated in the user\'s chat input box when they scan.'
      }
    ]
  },
  {
    slug: 'upi-qr-code-generator',
    name: 'UPI QR Code Generator',
    shortName: 'UPI Payment QR',
    queryParam: 'symbology=qr-code&wizard=upi',
    category: 'Smart QR',
    metaTitle: 'Free UPI Payment QR Code Generator (GPay, PhonePe, Paytm, BHIM)',
    metaDescription: 'Generate zero-fee UPI QR codes for your shop or business. Supports Google Pay, PhonePe, Paytm, and BHIM. Instant client-side generation, vector SVG, and print-ready tent cards.',
    h1: 'Free UPI Scan-to-Pay QR Code Generator',
    lead: 'Create instant UPI scan-to-pay QR codes for merchant stores, freelancers, and billing invoices. Fully compatible with Google Pay, PhonePe, Paytm, CRED, and BHIM.',
    technicalSpec: {
      standard: 'ISO/IEC 18004 QR Code Model 2',
      protocol: 'NPCI UPI Deep Link Specification (upi://pay?pa={VPA}&pn={Name}&am={Amount}&cu=INR)',
      compatibility: 'UPI apps such as Google Pay, PhonePe, Paytm and BHIM (Android and iOS)',
      security: 'Client-side compilation with zero intermediary payment gateways or commissions'
    },
    useCases: [
      'Retail checkout counter stands, acrylic tents, and cash registers',
      'Freelance digital invoices and client billing receipts',
      'Food delivery boxes, restaurant table bills, and street market stalls',
      'Non-profit charity donations and event registration ticketing'
    ],
    faqs: [
      {
        q: 'Which UPI apps can scan and pay with this QR code?',
        a: 'All standard payment apps supporting NPCI specifications can scan this code, including Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and all Indian banking apps.'
      },
      {
        q: 'Is there any transaction fee or intermediary involved?',
        a: 'None. UniversalCodeMaker does not process payments or handle funds. The QR code points directly to your Virtual Payment Address (VPA / UPI ID) so 100% of funds go straight into your bank account.'
      },
      {
        q: 'Can I specify a fixed amount or let customers enter their own?',
        a: 'Both options are supported. Leave the amount blank to let the customer enter any amount, or specify a fixed amount to lock the payment to an exact invoice figure.'
      }
    ]
  }
,
  {
    slug: 'avery-5160-barcode-generator',
    name: 'Avery 5160 Barcode & QR Code Label Generator',
    shortName: 'Avery 5160',
    queryParam: 'label=open&preset=avery-5160',
    category: 'Retail & POS',
    metaTitle: 'Free Avery 5160 Barcode & QR Code Label Generator (30 per Sheet PDF)',
    metaDescription: 'Print QR codes and barcodes on Avery 5160 labels (30 per Letter sheet) for free. Make the code, add a title, price or SKU, and download a print-ready PDF.',
    h1: 'Free Avery 5160 Barcode & QR Code Label Generator',
    lead: 'Print QR codes and barcodes on Avery 5160 address labels (30 per US Letter sheet), or on 5163 shipping labels. Add a title, price or SKU beside the code and download a ready-to-print PDF, free and with nothing to install.',
    technicalSpec: {
      templateFormat: 'Avery 5160 / 5960 / 8160 (1.0\" × 2.625\", 30-up per Letter sheet)',
      gridDimensions: '3 columns × 10 rows per sheet (8.5\" × 11\" US Letter)',
      margins: 'Top/Bottom: 0.5\", Left/Right: 0.1875\" (3/16\"), Column gap: 0.125\", no row gap',
      symbologySupport: 'All 10 formats, including QR Code, Code 128, UPC-A, EAN-13 and Data Matrix',
      printerCompatibility: '5160: laser printers. 8160 (same size, same template): inkjet printers'
    },
    useCases: [
      'Product SKU and inventory tagging on standard US Letter printer paper',
      'Amazon FBA FNSKU 30-up shipment prep without special label printer hardware',
      'Mailing, return shipping, and package barcode routing labels',
      'Classroom, library, and office asset barcode tagging'
    ],
    faqs: [
      {
        q: 'How many barcodes fit on an Avery 5160 label sheet?',
        a: 'An Avery 5160 sheet has 30 labels, each 1\" × 2-5/8\", in 3 columns of 10 rows on 8.5\" × 11\" US Letter paper. Avery products such as 5260, 5960, 8160 and 8460 share the same template, so they print the same way.'
      },
      {
        q: 'Do I need a special printer for Avery 5160 labels?',
        a: 'No, a normal office printer works. Avery 5160 is made for laser printers; Avery 8160 is the same size for inkjet printers. Both use the same template, so pick the one that matches your printer.'
      },
      {
        q: 'How do I avoid printing alignment issues on Avery label sheets?',
        a: 'In your browser or PDF reader print dialog, set Scale to 100% or Actual Size and uncheck Fit to Page or Shrink to Printable Area. Printing at Actual Size keeps the labels lined up with the die-cut grid. Print one test page on plain paper first, because printers can shift the page slightly.'
      },
      {
        q: 'Can each label on the sheet have a different code?',
        a: 'Not on one sheet yet: the PDF repeats one design on every label, which suits product labels, address labels and QR codes you hand out. For different codes, such as serial numbers, the batch generator downloads each code as a separate image in a ZIP file that you can place with a label design program.'
      }
    ]
  },
  {
    slug: 'isbn-book-barcode-generator',
    name: 'ISBN Book Barcode Generator',
    shortName: 'ISBN-13 Bookland',
    queryParam: 'symbology=isbn',
    category: 'Retail & POS',
    metaTitle: 'Free ISBN Barcode Generator (Bookland EAN-13) - 300 DPI Vector SVG',
    metaDescription: 'Make ISBN-13 (Bookland EAN-13) barcodes for book covers, including Amazon KDP and IngramSpark uploads. Automatic check digit and optional 5-digit price add-on.',
    h1: 'Free ISBN-13 Bookland Barcode Generator',
    lead: 'Generate high-contrast Bookland EAN-13 barcodes for paperback, hardcover, and print-on-demand books. Designed to meet strict IngramSpark, Amazon KDP, and Barnes & Noble publishing specifications with vector SVG and 300 DPI print exports.',
    technicalSpec: {
      standard: 'ISO 2108 / Bookland EAN-13 (GS1 General Specifications)',
      prefixStructure: '978 or 979 International Book Industry Prefix',
      checkDigitMath: 'Automated GS1 Modulo-10 checksum calculation',
      supplementalAddon: 'Optional EAN-5 supplemental price code (e.g. 51999 for $19.99 USD / 90000 for no price)',
      outputFormats: 'Scalable Vector SVG, High-Res 300 DPI PNG, Direct Print'
    },
    useCases: [
      'Amazon KDP (Kindle Direct Publishing) paperback and hardcover back covers',
      'IngramSpark and Lightning Source global retail distribution',
      'Bookstore Point-of-Sale (POS) cash register laser scanning',
      'Independent publishing, literary journals, and self-published textbooks'
    ],
    faqs: [
      {
        q: 'Where do I obtain an official ISBN for my book?',
        a: 'In the United States, official ISBNs are issued by Bowker (myidentifiers.com). In Canada, they are issued free by Library and Archives Canada. In the UK, Nielsen Book is the official agency. In India, Raja Rammohun Roy National Agency issues ISBNs. Amazon KDP also provides free ISBNs for platform-exclusive publishing.'
      },
      {
        q: 'What is the 5-digit add-on code next to the ISBN barcode?',
        a: 'The 5-digit supplemental code is an EAN-5 price extension. For books sold in the US, the first digit is 5 (denoting USD), followed by the price without decimals. For example, 51999 represents $19.99 USD. If no price is set, 90000 is used.'
      },
      {
        q: 'Does Amazon KDP accept vector SVG barcodes generated here?',
        a: 'Yes. UniversalCodeMaker exports clean, vector SVG and high-DPI 300+ PPI PNG files with exact quiet zones, ensuring razor-sharp reproduction that will pass KDP and IngramSpark automated pre-flight checks.'
      },
      {
        q: 'Can I convert an old 10-digit ISBN to the modern 13-digit format?',
        a: 'Yes. Simply prefix the 9-digit core with 978 and calculate the new 13th Mod-10 check digit. Our generator handles this math automatically.'
      }
    ]
  },
  {
    slug: 'code-39-barcode-generator',
    name: 'Code 39 Barcode Generator',
    shortName: 'Code 39 Asset',
    queryParam: 'symbology=code-39',
    category: 'Logistics & 1D',
    metaTitle: 'Free Code 39 Barcode Generator - Vector SVG & 300 DPI Asset Tags',
    metaDescription: 'Create free Code 39 (USD-3 / LOGMARS) barcodes online. Ideal for IT asset tracking, government MIL-STD-129 compliance, and internal warehouse inventory.',
    h1: 'Free Code 39 (USD-3) Barcode Generator',
    lead: 'Generate industrial-grade Code 39 alphanumeric barcodes for enterprise asset management, Department of Defense LOGMARS compliance, and internal inventory numbering with instant vector SVG and PNG downloads.',
    technicalSpec: {
      standard: 'ANSI/AIM BC1 / ISO/IEC 16388 / MIL-STD-129',
      characterSet: '43 characters: 0–9, uppercase A–Z, and symbols (- . $ / + % space)',
      checkDigit: 'Optional Modulo-43 checksum calculation',
      densityType: 'Variable-length discrete symbology with start/stop asterisk (*) characters',
      exportOptions: 'Crisp Vector SVG, 300 DPI Thermal Print, Avery Label Sheets'
    },
    useCases: [
      'IT hardware asset tags (laptops, monitors, networking gear)',
      'US Department of Defense (DoD) military supply shipments under MIL-STD-129',
      'Hospital and clinical laboratory specimen tube tracking',
      'Automotive manufacturing sub-assemblies (AIAG standard)'
    ],
    faqs: [
      {
        q: 'What is the difference between Code 39 and Code 128?',
        a: 'Code 39 is a simpler, self-checking symbology widely adopted by government, defense, and healthcare due to its reliability on older scanners. Code 128 is more compact (encodes data in less physical bar space) and supports the full 128 ASCII character set.'
      },
      {
        q: 'Do Code 39 barcodes require a check digit?',
        a: 'Code 39 includes inherent self-checking architecture, making a check digit optional in most commercial uses. However, high-integrity environments (such as DoD LOGMARS or healthcare) often enable the Modulo-43 checksum for maximum error prevention.'
      },
      {
        q: 'Can Code 39 encode lowercase letters or symbols?',
        a: 'Standard Code 39 natively encodes uppercase A–Z, numbers 0–9, and seven special symbols (- . $ / + % and space). Extended Code 39 uses two-character pairs to encode the full ASCII table.'
      },
      {
        q: 'Why do I see asterisks (*) at the beginning and end of Code 39 data?',
        a: 'The asterisk (*) serves as the start/stop pattern that tells the optical barcode scanner which direction the barcode is being read. Our generator automatically renders the start/stop bars.'
      }
    ]
  },
  {
    slug: 'bulk-barcode-generator-excel',
    name: 'Bulk Barcode Generator from Excel',
    shortName: 'Bulk Excel / CSV',
    queryParam: 'batch=open',
    category: 'Logistics & 1D',
    metaTitle: 'Free Bulk Barcode Generator from Excel (CSV) - Batch Print & ZIP Export',
    metaDescription: 'Import CSV or Excel spreadsheets to generate hundreds of barcodes in bulk. Export high-resolution PNG batches in ZIP files or print directly to multi-page label sheets.',
    h1: 'Free Bulk Barcode Generator from Excel & CSV',
    lead: 'Batch-generate hundreds of sequential or spreadsheet-imported barcodes in seconds. Upload your CSV from Excel, Google Sheets, or ERP inventory systems and download all barcodes in a consolidated ZIP file or Avery PDF sheet.',
    technicalSpec: {
      inputDataSources: 'CSV files, Tab-separated text, or Automated sequential numeric ranges',
      supportedSymbologies: 'Code 128, UPC-A, EAN-13, QR Code, Data Matrix, Code 39',
      batchCapacity: 'Up to 1,000 barcodes per batch executed 100% client-side in browser memory',
      exportFormats: 'Consolidated ZIP of 300 DPI PNGs or multi-page Avery PDF label sheets',
      privacyStandard: '100% Zero-Knowledge; proprietary inventory data is never uploaded to any server'
    },
    useCases: [
      'Warehouse inventory counting and annual stock audit tagging',
      'Batch product labeling from Shopify, WooCommerce, or Amazon inventory CSV exports',
      'Sequential serial number generation (e.g. SN-0001 through SN-0500)',
      'Event badge and trade show attendee registration credentials'
    ],
    faqs: [
      {
        q: 'How do I prepare an Excel file for bulk barcode generation?',
        a: 'In Excel or Google Sheets, create a single column with your SKU, part number, or barcode values. Go to File > Save As and select CSV (Comma delimited) (*.csv). Then upload that file into our Batch Import tab.'
      },
      {
        q: 'How fast does the bulk generator create hundreds of barcodes?',
        a: 'Because UniversalCodeMaker processes everything directly in your browser using multi-threaded web workers and local Canvas rendering, 500 barcodes typically generate in under 3 seconds.'
      },
      {
        q: 'Is my proprietary inventory or pricing data sent to a cloud server?',
        a: 'Never. UniversalCodeMaker operates under a strict zero-knowledge architecture. Your CSV spreadsheet data is parsed entirely in your computer RAM and never transmitted across the network.'
      },
      {
        q: 'Can I print bulk barcodes directly onto Avery label sheets?',
        a: 'Yes. Once your batch is imported, select your target Avery template (such as 5160 30-up) to export a multi-page PDF formatted with exact label boundaries ready for your office printer.'
      }
    ]
  },
  {
    slug: 'shopify-barcode-generator',
    name: 'Shopify Product Barcode Generator',
    shortName: 'Shopify Barcode',
    queryParam: 'symbology=upc-a&preset=retail-225-125',
    category: 'Retail & POS',
    metaTitle: 'Free Shopify Barcode Generator - Product Labels & POS Scanners',
    metaDescription: 'Generate retail-ready UPC-A and EAN-13 barcodes for Shopify products, inventory SKUs, and Shopify POS scanner hardware. Free instant vector SVG & Avery label sheets.',
    h1: 'Free Shopify Product Barcode & SKU Generator',
    lead: 'Create scannable UPC, EAN, and Code 128 barcode labels for your Shopify product catalog and physical retail checkout counters. Easily import your product SKUs, design thermal price tags, and print without expensive third-party Shopify apps.',
    technicalSpec: {
      retailStandards: 'UPC-A (12 digits for US/CA) and EAN-13 (13 digits for International)',
      internalSkuFormat: 'Code 128 alphanumeric symbology for internal variant SKUs',
      posHardwareCompatibility: '100% compatible with Shopify POS barcode scanners (Socket Mobile, Zebra, Honeywell)',
      labelDimensions: 'Standard 2.25\" × 1.25\" direct thermal price tags and Avery 5160 multi-pack sheets'
    },
    useCases: [
      'Shopify POS retail boutique and pop-up shop cash register checkouts',
      'Printing thermal shelf price tags with Product Title, SKU, Price, and Barcode',
      'Inventory receiving and warehouse stock fulfillment',
      'Tagging multi-variant apparel and consumer goods'
    ],
    faqs: [
      {
        q: 'Does Shopify require official UPC or EAN barcodes?',
        a: 'If you are only selling in your own Shopify online store or physical retail location using Shopify POS, you can use any internal SKU or Code 128 barcode. However, if you sync products with Google Shopping, Amazon, or Facebook/Instagram commerce, you must provide authentic GS1 UPC or EAN numbers.'
      },
      {
        q: 'How do I print barcodes for my Shopify products without paying for an app?',
        a: 'Export your product list from Shopify admin (Products > Export > All products as CSV). Open UniversalCodeMaker, upload the CSV into our Batch Generator, and print directly to Avery sheets or thermal rolls without recurring monthly app subscriptions.'
      },
      {
        q: 'Which barcode scanner works best with Shopify POS on iPad or iPhone?',
        a: 'Shopify POS officially recommends Bluetooth 1D/2D barcode scanners (such as Socket Mobile S700 or Tera Wireless Handheld Scanners) that pair via Bluetooth HID keyboard emulation.'
      },
      {
        q: 'What label size is standard for Shopify retail clothing and shelf tags?',
        a: 'The most popular size for retail boutiques and apparel is 2.25\" × 1.25\" (or 2\" × 1\") direct thermal sticker rolls, which comfortably fit the product name, price, SKU, and barcode.'
      }
    ]
  }
];

const ENRICHMENTS = {
  "ean-13-barcode-generator": {
    "benefits": [
      {
        "title": "Global Omnidirectional POS Scanning",
        "desc": "Read instantaneously by laser checkout scanners across Europe, UK, Asia, Australia, and Latin America."
      },
      {
        "title": "Built-in Mod-10 Parity Check",
        "desc": "The 13th digit prevents misreads, data corruption, or manual cashier entry errors."
      },
      {
        "title": "Prepress Vector Accuracy",
        "desc": "Export scalable SVGs with calibrated quiet zones ready for offset and flexographic commercial packaging print runs."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling packaged retail goods outside the US?",
        "a": "EAN-13 is the standard checkout barcode for consumer products in supermarkets and retail chains in most countries outside the US and Canada."
      },
      {
        "q": "Selling on Amazon or Google Shopping globally?",
        "a": "EAN-13 numbers function as standard 13-digit Global Trade Item Numbers (GTIN-13) accepted on all major e-commerce marketplaces."
      },
      {
        "q": "Need barcodes for internal warehouse or asset tracking?",
        "a": "Do not buy EAN-13! Use Code 128 (free, no license required) or assign private internal EAN-13 numbers using prefixes 200–299."
      }
    ],
    "legalCaution": {
      "title": "GS1 Registration Rules & Retail Pre-Print Requirements",
      "points": [
        "Open-market commercial retail requires an authorized Company Prefix issued by your national GS1 organization (e.g., GS1 US, GS1 UK, GS1 India). You cannot invent random numbers for commercial retail.",
        "Always keep the quiet zones clear (3.63 mm on the left, 2.31 mm on the right at the target size). Text or artwork inside them, or shortened (truncated) bars, make the barcode harder to scan; GS1 advises against both.",
        "Never print in colour combinations that look low-contrast under red light (e.g., red bars on white, or black bars on green). Checkout scanners use red light, so bars must be dark and the background light. Retailers that test print quality grade it under ISO/IEC 15416."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: International Article Number (EAN)",
        "desc": "Full encyclopedic history, mathematical Mod-10 checksum algorithm, and country prefix table.",
        "url": "https://en.wikipedia.org/wiki/International_Article_Number"
      },
      {
        "name": "GS1 Official EAN/UPC Standard",
        "desc": "Official GS1 General Specifications for point-of-sale retail article identification.",
        "url": "https://www.gs1.org/standards/barcodes/ean-upc"
      },
      {
        "name": "ISO/IEC 15420 International Standard",
        "desc": "ISO standard specification for EAN/UPC bar code symbology.",
        "url": "https://www.iso.org/standard/84892.html"
      }
    ]
  },
  "upc-a-barcode-generator": {
    "benefits": [
      {
        "title": "US & Canadian Retail Standard",
        "desc": "The standard 12-digit point-of-sale barcode recognized by every checkout scanner in North America."
      },
      {
        "title": "Zero Latency Point of Sale",
        "desc": "Fixed 12-digit numeric length allows POS cash registers to verify items in milliseconds."
      },
      {
        "title": "International Compatibility",
        "desc": "Scanners worldwide can read UPC-A by simply prepending a leading zero to form a 13-digit GTIN."
      }
    ],
    "decisionGuide": [
      {
        "q": "Selling in Walmart, Target, Kroger, or Canadian retail?",
        "a": "UPC-A is the usual retail barcode in the United States and Canada, and many US retailers ask suppliers for it. Checkout scanners there also read EAN-13."
      },
      {
        "q": "Listing on Amazon North America (FBA)?",
        "a": "Amazon checks UPC and EAN numbers against the GS1 database, so use numbers licensed to your own company, or apply for a GTIN exemption if your product has no barcode."
      },
      {
        "q": "Need barcodes for shipping cartons or pallets?",
        "a": "Do not use UPC-A on corrugated outer shipping boxes. Use ITF-14 or GS1-128 for wholesale logistics."
      }
    ],
    "legalCaution": {
      "title": "GS1 US Registration & Legal Retail Requirements",
      "points": [
        "Selling through North American retailers and marketplaces requires numbers licensed from GS1 US (a company prefix or single GTINs) or GS1 Canada. Resold or recycled UPCs registered to another company may be rejected by Amazon and major retail chains.",
        "Maintain a minimum 9X module quiet zone on both sides of the barcode to prevent scanner beam clipping.",
        "Use high contrast: black or dark blue bars on a white or light background. Red, orange and yellow bars don't scan under red-light checkout scanners."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Universal Product Code (UPC)",
        "desc": "History, 12-digit encoding structure, and parity check details.",
        "url": "https://en.wikipedia.org/wiki/Universal_Product_Code"
      },
      {
        "name": "GS1 US Official Barcode Portal",
        "desc": "Official guide for obtaining genuine US retail barcode prefixes.",
        "url": "https://www.gs1us.org/upcs-barcodes-prefixes/get-a-barcode"
      },
      {
        "name": "ISO/IEC 15420 International Standard",
        "desc": "ISO barcode symbology specification for EAN/UPC linear barcodes.",
        "url": "https://www.iso.org/standard/84892.html"
      }
    ]
  },
  "code-128-barcode-generator": {
    "benefits": [
      {
        "title": "100% Free & Open (No GS1 Fees)",
        "desc": "Requires no licensing, fees, or registration. Anyone can generate and print Code 128 barcodes freely forever."
      },
      {
        "title": "Full 128 ASCII Alphanumeric Range",
        "desc": "Encodes letters (A–Z, a–z), numbers (0–9), punctuation, and control characters."
      },
      {
        "title": "Auto-Switching High Density",
        "desc": "Automatically switches between subsets A, B, and C to compress paired digits into compact spaces."
      }
    ],
    "decisionGuide": [
      {
        "q": "Labeling warehouse shelves, bins, and pallets?",
        "a": "Code 128 is the industry gold standard for warehouse management systems (WMS) and internal logistics."
      },
      {
        "q": "Tracking company IT assets, tools, or serialized parts?",
        "a": "Use Code 128 to encode alphanumeric serial numbers (e.g. LAPTOP-2026-X8) onto durable sticker labels."
      },
      {
        "q": "Can I use Code 128 at a grocery store checkout?",
        "a": "Standard supermarket cash registers expect 12-digit UPC or 13-digit EAN; use Code 128 for logistics, shipping, and internal operations."
      }
    ],
    "legalCaution": {
      "title": "Code 128 Usage Guidelines & Quiet Zone Rules",
      "points": [
        "Code 128 is an open public-domain standard (ISO/IEC 15417). No royalties or company prefix registrations are required for private or internal use.",
        "When using GS1-128 (formerly UCC/EAN-128) in commercial freight, you must format data with official GS1 Application Identifiers (AIs) and start with an FNC1 character.",
        "Ensure a minimum quiet zone of 10 times the module width (10X) on both ends of the barcode to allow laser scanners to synchronize timing."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Code 128 Barcode",
        "desc": "Complete encoding table, subset A/B/C definitions, and Modulo 103 checksum calculation.",
        "url": "https://en.wikipedia.org/wiki/Code_128"
      },
      {
        "name": "GS1-128 Logistics Standard",
        "desc": "Official GS1 specifications for supply chain logistics identification.",
        "url": "https://www.gs1.org/standards/barcodes/gs1-128"
      },
      {
        "name": "ISO/IEC 15417 Standard",
        "desc": "International standard for Code 128 symbology format.",
        "url": "https://www.iso.org/standard/43896.html"
      }
    ]
  },
  "itf-14-barcode-generator": {
    "benefits": [
      {
        "title": "Engineered for Rough Corrugated Boxes",
        "desc": "Large bar widths and high tolerances allow reliable scanning directly on brown cardboard."
      },
      {
        "title": "Thick Protective Bearer Bars",
        "desc": "Surrounding black bearer bars equalize plate pressure and prevent partial scanner slice misreads."
      },
      {
        "title": "Long-Range Forklift Scanning",
        "desc": "Warehouse operators can scan ITF-14 barcodes from several meters away without dismounting."
      }
    ],
    "decisionGuide": [
      {
        "q": "Packing master cartons containing multiple retail units?",
        "a": "ITF-14 is the global standard barcode printed on outer shipping cases containing 6, 12, or 24 individual retail products."
      },
      {
        "q": "Can ITF-14 be scanned at point-of-sale retail checkouts?",
        "a": "No. ITF-14 is strictly for non-retail logistics, wholesale distribution, and warehouse cross-docking."
      },
      {
        "q": "How does ITF-14 link to the retail item inside?",
        "a": "The 14-digit number incorporates an Packaging Indicator digit (1–8) followed by the 12-digit GTIN of the enclosed retail unit and a final check digit."
      }
    ],
    "legalCaution": {
      "title": "ITF-14 Printing Standards & Bearer Bar Guidelines",
      "points": [
        "Always include bearer bars (minimum 4.8mm thick) when printing directly onto corrugated cartons to prevent uneven flexographic plate impression.",
        "Ensure the barcode is placed at least 32mm from the bottom edge of the box and at least 19mm from vertical edges to prevent corner folding distortion.",
        "The final 14th digit is a mandatory GS1 Modulo-10 checksum calculated across the first 13 digits."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: ITF-14 Barcode",
        "desc": "Overview of Interleaved 2 of 5 shipping carton symbology and bearer bar rules.",
        "url": "https://en.wikipedia.org/wiki/ITF-14"
      },
      {
        "name": "GS1 Official ITF-14 Standard",
        "desc": "GS1 general specifications for outer carton trade item identification.",
        "url": "https://www.gs1.org/standards/barcodes/itf-14"
      },
      {
        "name": "ISO/IEC 16390 Standard",
        "desc": "International standard for Interleaved 2 of 5 barcode specifications.",
        "url": "https://www.iso.org/standard/43898.html"
      }
    ]
  },
  "data-matrix-generator": {
    "benefits": [
      {
        "title": "Ultra-Compact Micro Footprint",
        "desc": "Can encode dozens of characters into a tiny 2mm × 2mm square symbol."
      },
      {
        "title": "ECC 200 Reed-Solomon Error Correction",
        "desc": "Can be read even when up to 30% of the symbol is scratched, torn, or occluded."
      },
      {
        "title": "Direct Part Marking (DPM) Ready",
        "desc": "Engineered for direct laser engraving and dot-peening onto metal, glass, and silicon."
      }
    ],
    "decisionGuide": [
      {
        "q": "Marking electronic components, PCBs, or surgical tools?",
        "a": "Data Matrix is the mandated standard for micro-electronics, aerospace parts, and FDA Unique Device Identification (UDI)."
      },
      {
        "q": "Packaging pharmaceuticals (prescription medicine)?",
        "a": "GS1 DataMatrix is legally required on medicine packaging under the US DSCSA and EU Falsified Medicines Directive (FMD)."
      },
      {
        "q": "Should I use Data Matrix or QR Code for consumer advertising?",
        "a": "Use QR Code for consumers (native smartphone camera apps recognize QR faster); use Data Matrix for industrial, medical, and compact component labeling."
      }
    ],
    "legalCaution": {
      "title": "Data Matrix Specifications & Healthcare Compliance",
      "points": [
        "Data Matrix is an open ISO standard (ISO/IEC 16022). It requires an area-imaging scanner (cannot be scanned with older single-line 1D laser scanners).",
        "When used for FDA UDI or GS1 healthcare, data must include Application Identifiers (e.g. (01) GTIN, (17) Expiry Date, (10) Batch/Lot, (21) Serial Number).",
        "Ensure the \"L\" shaped finder pattern on the bottom and left borders remains completely unobstructed."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Data Matrix",
        "desc": "Details on ECC 200 error correction, symbol sizes, and encoding modes.",
        "url": "https://en.wikipedia.org/wiki/Data_Matrix"
      },
      {
        "name": "GS1 DataMatrix Healthcare Guide",
        "desc": "Official GS1 implementation guidelines for pharmaceuticals and medical devices.",
        "url": "https://www.gs1.org/standards/barcodes/datamatrix"
      },
      {
        "name": "ISO/IEC 16022 Standard",
        "desc": "International standard for Data Matrix 2D barcode symbology.",
        "url": "https://www.iso.org/standard/80926.html"
      }
    ]
  },
  "aztec-code-generator": {
    "benefits": [
      {
        "title": "Zero Quiet Zone Requirement",
        "desc": "Can be printed right up to the edge of tickets or screen borders without read failures."
      },
      {
        "title": "Fast Center-Out Bullseye Lock",
        "desc": "Area imager scanners locate the central concentric square instantly regardless of orientation."
      },
      {
        "title": "Scalable Error Correction",
        "desc": "User-selectable Reed-Solomon recovery from 5% up to 95% damaged data area."
      }
    ],
    "decisionGuide": [
      {
        "q": "Issuing airline boarding passes or train tickets?",
        "a": "Aztec Code is the official standard chosen by the International Air Transport Association (IATA) and European rail systems (UIC)."
      },
      {
        "q": "Displaying codes on compact smartphone screens?",
        "a": "Because Aztec requires no quiet zone margin around its perimeter, it maximizes scannable area on small smartphone displays."
      }
    ],
    "legalCaution": {
      "title": "Aztec Code Implementation Rules",
      "points": [
        "Aztec Code is in the public domain (ISO/IEC 24778) and free of all patent restrictions.",
        "Requires 2D camera imagers; 1D laser scanners cannot read Aztec symbols.",
        "Avoid placing graphic borders or icons over the central bullseye finder pattern."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: Aztec Code",
        "desc": "Detailed explanation of core bullseye structure, error correction, and transit ticketing.",
        "url": "https://en.wikipedia.org/wiki/Aztec_Code"
      },
      {
        "name": "ISO/IEC 24778 Standard",
        "desc": "Official ISO specification for Aztec Code 2D symbology.",
        "url": "https://www.iso.org/standard/82441.html"
      }
    ]
  },
  "pdf417-barcode-generator": {
    "benefits": [
      {
        "title": "Massive Data Storage (>1 Kilobyte)",
        "desc": "Can store full driver license profiles, digital signatures, and biometric records completely offline."
      },
      {
        "title": "Stacked Linear Robustness",
        "desc": "Can be read by both area-imaging cameras and rastering linear laser scanners."
      },
      {
        "title": "Government & Legal Standard",
        "desc": "Official standard for North American driver licenses (AAMVA) and customs forms."
      }
    ],
    "decisionGuide": [
      {
        "q": "Encoding driver license or state identification data?",
        "a": "PDF417 is mandated by the American Association of Motor Vehicle Administrators (AAMVA) for all US and Canadian driver licenses."
      },
      {
        "q": "Printing postal shipping documents or freight manifests?",
        "a": "USPS, FedEx, and international customs authorities use PDF417 to encode full multi-line package manifests."
      }
    ],
    "legalCaution": {
      "title": "PDF417 Capacity & Aspect Ratio Guidelines",
      "points": [
        "PDF417 is an open standard (ISO/IEC 15438) with no licensing fees for private or commercial use.",
        "When encoding AAMVA driver license data, strictly follow the AAMVA DL/ID Card Design Standard data structure.",
        "Keep the symbol aspect ratio between 2:1 and 4:1 to ensure easy scanning with standard handheld scanners."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: PDF417",
        "desc": "Complete breakdown of codewords, error correction levels (0–8), and AAMVA usage.",
        "url": "https://en.wikipedia.org/wiki/PDF417"
      },
      {
        "name": "ISO/IEC 15438 Standard",
        "desc": "International standard specification for PDF417 stacked linear symbology.",
        "url": "https://www.iso.org/standard/65502.html"
      }
    ]
  },
  "wifi-qr-code-generator": {
    "benefits": [
      {
        "title": "1-Tap Zero-Typing Wi-Fi Access",
        "desc": "Guests connect instantly without mistyping complex WPA2/WPA3 passwords."
      },
      {
        "title": "Native iOS & Android Integration",
        "desc": "Built-in camera apps prompt \"Join Network\" without installing any third-party app."
      },
      {
        "title": "100% Client-Side Privacy Guarantee",
        "desc": "Your network credentials are never sent across the internet or stored on external servers."
      }
    ],
    "decisionGuide": [
      {
        "q": "Running a restaurant, cafe, boutique hotel, or Airbnb?",
        "a": "Place a Wi-Fi QR code on table stands or guest welcome books to eliminate repetitive password requests."
      },
      {
        "q": "Setting up meeting rooms in a corporate office?",
        "a": "Provide temporary guest Wi-Fi access in conference lobbies with one quick camera scan."
      }
    ],
    "legalCaution": {
      "title": "Wi-Fi Security & Warning Against Dynamic QR Services",
      "points": [
        "Beware of third-party \"dynamic QR code\" generators! Many commercial sites route your Wi-Fi credentials through remote redirect servers that log user IPs and break when monthly subscriptions expire.",
        "Our studio generates 100% direct, static Wi-Fi payloads following the official Wi-Fi Alliance format. They work offline and will never expire.",
        "For high-security enterprise environments, use a dedicated Guest VLAN to isolate visitors from internal office hardware."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: QR Code",
        "desc": "Comprehensive guide to QR code history, error correction, and mobile device scanning.",
        "url": "https://en.wikipedia.org/wiki/QR_code"
      },
      {
        "name": "Wi-Fi Alliance QR Standards",
        "desc": "Official Wi-Fi Easy Connect (DPP) and network setup guidelines.",
        "url": "https://www.wi-fi.org/"
      },
      {
        "name": "ISO/IEC 18004 Standard",
        "desc": "International standard for the QR Code symbology (2024 edition).",
        "url": "https://www.iso.org/standard/83389.html"
      }
    ]
  },
  "vcard-qr-code-generator": {
    "benefits": [
      {
        "title": "Instant Address Book Save",
        "desc": "Prompts smartphones to save contact details directly with zero typing errors."
      },
      {
        "title": "Zero Paper Business Card Waste",
        "desc": "Share comprehensive digital cards including phone, email, website, and job title."
      },
      {
        "title": "Cross-Platform vCard 3.0 Standard",
        "desc": "Works seamlessly across Apple Contacts, Google Contacts, and Microsoft Outlook."
      }
    ],
    "decisionGuide": [
      {
        "q": "Attending conferences, networking mixers, or trade shows?",
        "a": "Display your vCard QR code on your badge, phone lock screen, or physical card for instant contact sharing."
      },
      {
        "q": "Real estate agents and independent consultants?",
        "a": "Print on yard signs, presentation slides, and vehicle decals so prospects can save your number in 2 seconds."
      }
    ],
    "legalCaution": {
      "title": "vCard Best Practices & Payload Optimization",
      "points": [
        "Keep the vCard payload compact (under 350 characters) to ensure the QR code remains clean, low-density, and scannable even from a distance or in low light.",
        "Avoid embedding raw image photos directly in the vCard payload, as this creates dense codes that can be difficult for older smartphone cameras to resolve.",
        "Written as vCard 3.0 (IETF RFC 2426), the version the iPhone and Android contacts apps read directly."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: vCard Standard",
        "desc": "Complete history, syntax, and field properties of the vCard standard format.",
        "url": "https://en.wikipedia.org/wiki/VCard"
      },
      {
        "name": "IETF RFC 6350 (vCard 4.0)",
        "desc": "Official Internet Engineering Task Force RFC specification for electronic business cards.",
        "url": "https://datatracker.ietf.org/doc/html/rfc6350"
      }
    ]
  },
  "crypto-qr-code-generator": {
    "benefits": [
      {
        "title": "Zero Address Typing Mistakes",
        "desc": "Eliminates mistyped 42-character public keys and prevents irreversible fund transfers."
      },
      {
        "title": "BIP-21 Universal Payment URI",
        "desc": "Compatible with all major crypto wallets (Metamask, Phantom, Trust Wallet, Ledger)."
      },
      {
        "title": "Built-in Crypto Coin Badges",
        "desc": "Embeds official Bitcoin, Ethereum, or Solana logos directly in the center of the QR code."
      }
    ],
    "decisionGuide": [
      {
        "q": "Accepting crypto payments in a retail store or online invoice?",
        "a": "Pre-configure cryptocurrency QR codes with your recipient address and optional requested payment amounts."
      },
      {
        "q": "Setting up creator tip jars or non-profit donations?",
        "a": "Print durable crypto payment QR stickers for live streams, blogs, and fundraising stands."
      }
    ],
    "legalCaution": {
      "title": "Cryptocurrency Address Safety & Testing Recommendations",
      "points": [
        "Cryptocurrency transactions are mathematically irreversible on the blockchain. Always perform a test micro-transaction before printing codes on physical signage.",
        "Verify that your clipboard or browser has not been altered by malicious browser extensions before generating payment addresses.",
        "Compliant with official Bitcoin Improvement Proposal 21 (BIP-21) and Ethereum EIP-681."
      ]
    },
    "authorityLinks": [
      {
        "name": "Bitcoin BIP-0021 URI Standard",
        "desc": "Official Bitcoin Improvement Proposal for payment request URI formatting.",
        "url": "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"
      },
      {
        "name": "Ethereum EIP-681 Standard",
        "desc": "Ethereum standard for URL format for transaction requests.",
        "url": "https://eips.ethereum.org/EIPS/eip-681"
      }
    ]
  },
  "email-qr-code-generator": {
    "benefits": [
      {
        "title": "Pre-Populated Support Messages",
        "desc": "Automatically fills recipient, subject line, and body template when scanned."
      },
      {
        "title": "Direct Native Mail Client Launch",
        "desc": "Launches default mail app (Apple Mail, Gmail, Outlook) with one camera scan."
      },
      {
        "title": "Zero Server Tracking",
        "desc": "Uses standard mailto URI; no user emails or contents pass through any third-party server."
      }
    ],
    "decisionGuide": [
      {
        "q": "Customer warranty claims and technical support tickets?",
        "a": "Print on equipment labels with pre-filled product model numbers and return instructions."
      },
      {
        "q": "Event RSVP and private club registration?",
        "a": "Include pre-written event RSVP responses on printed invitation flyers."
      }
    ],
    "legalCaution": {
      "title": "Email QR Standards & Compliance",
      "points": [
        "Compliant with IETF RFC 6068 (The mailto URI scheme).",
        "The email is sent from the person's own mail app, and only after they tap Send; this site sends nothing. Whether your use follows anti-spam rules such as CAN-SPAM or GDPR depends on who you ask to email and why.",
        "Special characters (spaces, ampersands, question marks) are automatically percent-encoded for universal email client compatibility."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 6068 (mailto URI Scheme)",
        "desc": "Official Internet standard specifying mailto uniform resource identifiers.",
        "url": "https://datatracker.ietf.org/doc/html/rfc6068"
      },
      {
        "name": "Wikipedia: Mailto",
        "desc": "Overview of mailto protocol, syntax parameters, and client handling.",
        "url": "https://en.wikipedia.org/wiki/Mailto"
      }
    ]
  },
  "sms-qr-code-generator": {
    "benefits": [
      {
        "title": "1-Tap Text Message Compose",
        "desc": "Opens default SMS app with pre-filled message text and recipient phone number."
      },
      {
        "title": "Works Without Internet / Wi-Fi",
        "desc": "Cellular SMS works even in low-reception areas where mobile data is unavailable."
      },
      {
        "title": "High Consumer Engagement",
        "desc": "SMS response rates are over 5x higher than traditional paper forms or email signups."
      }
    ],
    "decisionGuide": [
      {
        "q": "Running billboard or transit ads for lead capture?",
        "a": "Allow commuters to scan and send a pre-filled keyword (e.g. \"QUOTE\") in 2 seconds."
      },
      {
        "q": "Dispatching maintenance or roadside assistance?",
        "a": "Print stickers on rental vehicles with pre-filled emergency dispatch codes."
      }
    ],
    "legalCaution": {
      "title": "SMS Marketing Regulations & Opt-In Rules",
      "points": [
        "Ensure compliance with local telecommunications laws (TCPA in the US, GDPR in the EU). Users must explicitly tap \"Send\" in their SMS app to transmit the message.",
        "Clearly state in your promotional signage that standard message and data rates may apply according to the user’s mobile carrier plan.",
        "Compliant with standard RFC 5724 (URI Scheme for Global System for Mobile Communications Short Message Service)."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 5724 (SMS URI Standard)",
        "desc": "Official RFC standard specification for SMS URI schemes.",
        "url": "https://datatracker.ietf.org/doc/html/rfc5724"
      }
    ]
  },
  "phone-call-qr-code-generator": {
    "benefits": [
      {
        "title": "Instant 1-Tap Telephone Dialing",
        "desc": "Launches phone dialer with telephone number pre-loaded; zero misdialed digits."
      },
      {
        "title": "Universal Cellular Compatibility",
        "desc": "Supported natively on every iOS and Android device with zero app requirements."
      },
      {
        "title": "Emergency Speed",
        "desc": "Enables immediate voice connection in urgent situations."
      }
    ],
    "decisionGuide": [
      {
        "q": "Real estate yard signs, contractor trucks, and restaurant storefronts?",
        "a": "Allow passersby to call your sales office with a single camera tap."
      },
      {
        "q": "Equipment breakdown or security hotline signage?",
        "a": "Ensure facility operators can connect directly to security or maintenance personnel."
      }
    ],
    "legalCaution": {
      "title": "Phone QR Formatting & International Roaming",
      "points": [
        "Always format telephone numbers in international E.164 format (+[country code][number]) so international travelers can connect without dialing errors.",
        "Smartphones will always prompt the user to confirm the call before dialing, preventing accidental or phantom outgoing calls.",
        "Compliant with IETF RFC 3966 (tel URI scheme)."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 3966 (tel: URI Scheme)",
        "desc": "Official RFC specifying the telephone subscriber URI format.",
        "url": "https://datatracker.ietf.org/doc/html/rfc3966"
      }
    ]
  },
  "calendar-event-qr-code-generator": {
    "benefits": [
      {
        "title": "1-Tap Calendar Synchronization",
        "desc": "Prompts users to add events directly into Apple Calendar, Google Calendar, or Outlook."
      },
      {
        "title": "Zero Event Misses & Automatic Reminders",
        "desc": "Pre-configures start time, end time, location address, and reminder notifications."
      },
      {
        "title": "Universal iCalendar VEVENT Standard",
        "desc": "Fully compliant with RFC 5545 specifications supported across all modern smartphones."
      }
    ],
    "decisionGuide": [
      {
        "q": "Organizing conferences, product launches, or webinars?",
        "a": "Print calendar event QR codes on tickets and promo posters so attendees save the exact date instantly."
      },
      {
        "q": "Wedding invitations and birthday party save-the-dates?",
        "a": "Ensure guests never forget the date, venue address, and start time."
      }
    ],
    "legalCaution": {
      "title": "iCalendar Timezone & Daylight Saving Best Practices",
      "points": [
        "Always specify UTC timestamps or explicit timezone identifiers (TZID) to ensure event times do not shift when imported by attendees traveling across time zones.",
        "Keep event descriptions concise to maintain high QR code scannability on printed paper invitations.",
        "Compliant with IETF RFC 5545 (Internet Calendaring and Scheduling Core Object Specification)."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 5545 (iCalendar Standard)",
        "desc": "Official RFC standard specification for electronic calendaring and scheduling.",
        "url": "https://datatracker.ietf.org/doc/html/rfc5545"
      },
      {
        "name": "Wikipedia: iCalendar",
        "desc": "Overview of iCalendar structure, recurrence rules, and client compatibility.",
        "url": "https://en.wikipedia.org/wiki/ICalendar"
      }
    ]
  },
  "google-maps-location-qr-code-generator": {
    "benefits": [
      {
        "title": "Opens Straight in Google Maps",
        "desc": "One scan opens the place in the Google Maps app (or the browser), where visitors tap Directions to get there."
      },
      {
        "title": "Exact Geographic Coordinates",
        "desc": "Pinpoint precise GPS latitude and longitude coordinates even in remote or rural locations."
      },
      {
        "title": "Zero Navigation Address Typos",
        "desc": "Prevents visitors from getting lost due to similar street names or postal code ambiguities."
      }
    ],
    "decisionGuide": [
      {
        "q": "Retail storefronts, restaurants, and tourist attractions?",
        "a": "Place location QR codes on flyers, business cards, and brochures to guide visitors directly to your door."
      },
      {
        "q": "Festivals, outdoor weddings, and remote trade show venues?",
        "a": "Use exact latitude/longitude coordinates to pin event entrances without registered street addresses."
      }
    ],
    "legalCaution": {
      "title": "Location QR Accuracy & Navigation Guidelines",
      "points": [
        "Scan the printed code on an iPhone and an Android phone before printing in volume, and check it opens the right place.",
        "Point coordinates at the public visitor entrance rather than a private loading dock or the middle of a large building.",
        "Uses Google's documented Maps URL format, which needs no API key and opens in the Google Maps app or any web browser."
      ]
    },
    "authorityLinks": [
      {
        "name": "Google Maps URL Scheme Documentation",
        "desc": "Official developer documentation for universal cross-platform map links.",
        "url": "https://developers.google.com/maps/documentation/urls/get-started"
      }
    ]
  },
  "plain-text-qr-code-generator": {
    "benefits": [
      {
        "title": "100% Universal Raw Text Storage",
        "desc": "Contains raw unformatted strings requiring no specific browser or application handlers."
      },
      {
        "title": "Completely Offline Data Retrieval",
        "desc": "Readable by any smartphone, barcode scanner, or optical camera with zero network connection."
      },
      {
        "title": "High Density (Up to 4,296 Characters)",
        "desc": "Store extensive serial lists, cryptographic public keys, or instruction manuals."
      }
    ],
    "decisionGuide": [
      {
        "q": "Industrial machinery serial numbers and calibration logs?",
        "a": "Encode permanent equipment metadata directly onto durable metal or vinyl asset tags."
      },
      {
        "q": "Cryptographic public keys or recovery backup phrases?",
        "a": "Store offline cryptographic text strings on paper cold wallets without relying on third-party servers."
      }
    ],
    "legalCaution": {
      "title": "Plain Text Security & Visibility Warnings",
      "points": [
        "Plain text QR codes are completely unencrypted and can be read by anyone with a smartphone camera. Never encode sensitive passwords or personal health data in plaintext.",
        "For high-density text (>500 characters), select Error Correction Level L or M to prevent the QR matrix from becoming excessively dense.",
        "Compliant with international standard ISO/IEC 18004."
      ]
    },
    "authorityLinks": [
      {
        "name": "Wikipedia: QR Code",
        "desc": "Technical specifications, version matrices (1–40), and character capacities.",
        "url": "https://en.wikipedia.org/wiki/QR_code"
      },
      {
        "name": "ISO/IEC 18004 Standard",
        "desc": "Official ISO standard for QR Code symbology.",
        "url": "https://www.iso.org/standard/83389.html"
      }
    ]
  },
  "amazon-fba-fnsku-barcode-generator": {
    "benefits": [
      {
        "title": "Built to Amazon's Label Format",
        "desc": "Code 128 FNSKU with exact bar widths and quiet zones, plus title and condition, as Amazon's label instructions describe. Check Seller Central for the latest rules."
      },
      {
        "title": "Avery 5160 & Thermal Roll Ready",
        "desc": "Print 30-up letter sheets on standard office printers or stream continuous labels to MUNBYN, Rollo, and Zebra thermal printers."
      },
      {
        "title": "Automatic FNSKU Layout Composition",
        "desc": "Instantly composes scannable barcode, human-readable code text, product title, and condition indicator into standard 1.0\" × 2.625\" dimensions."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I use manufacturer UPC or Amazon FNSKU barcode?",
        "a": "Amazon requires FNSKUs (starting with X00) for products that are private-label or not eligible for commingling. Using FNSKUs ensures your inventory is tracked exclusively to your seller account and never mixed with competing sellers."
      },
      {
        "q": "Which label printer type is best for FBA shipments?",
        "a": "Direct thermal roll printers (e.g. Rollo, Zebra, MUNBYN) are fastest for on-demand tagging because they require no ink or toner. Standard laser printers using Avery 5160 30-up sheets are ideal for high-volume batch prep."
      }
    ],
    "legalCaution": {
      "title": "Amazon FBA Shipment Compliance & Policy Guidelines",
      "points": [
        "Each unit must have a single scannable barcode. Any existing manufacturer UPC, EAN, or ISBN barcodes must be fully covered by the FNSKU label.",
        "Labels must measure between 1.0\" × 2.0\" and 2.0\" × 3.0\". UniversalCodeMaker uses the standard 1.0\" × 2.625\" template (Avery 5160 / 30-up).",
        "Do not place transparent tape, shrink-wrap seams, or shipping labels over the FNSKU barcode, as reflective glare causes scanner misreads.",
        "FNSKU barcodes must strictly use Code 128 symbology with pure black print on white non-reflective label paper."
      ]
    },
    "authorityLinks": [
      {
        "name": "Amazon Seller Central: FBA Product Barcode Requirements",
        "desc": "Official Amazon documentation for FNSKU label specifications and packaging standards.",
        "url": "https://sellercentral.amazon.com/help/hub/reference/external/200141490"
      },
      {
        "name": "GS1 US: Code 128 Guidelines",
        "desc": "General specifications for high-density alphanumeric linear barcodes.",
        "url": "https://www.gs1us.org/"
      }
    ]
  },
  "google-reviews-qr-code-generator": {
    "benefits": [
      {
        "title": "Direct 1-Tap Review Form Launch",
        "desc": "Bypasses search results and business listings, opening straight into Google's rating dialog on mobile devices."
      },
      {
        "title": "Permanent & Zero Subscription Fees",
        "desc": "100% static client-side QR generation. No monthly bills, no scan caps, and no middleman URL redirects that can break."
      },
      {
        "title": "Print-Ready Countertop & Table Tents",
        "desc": "Export 300 DPI high-resolution PNG or vector SVG files designed for acrylic tabletop stands and payment receipts."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I use a shortlink or Google Place ID?",
        "a": "Both work seamlessly. If you have your 'g.page' review link from Google Business Profile, paste it directly. If you have a Google Place ID (ChIJ...), our compiler formats it into the direct 'writereview' endpoint automatically."
      },
      {
        "q": "Where is the best physical location to place review QR codes?",
        "a": "Counter checkout areas, receipt footers, dining table tents, and exit doors achieve the highest review conversion rates immediately after a positive service experience."
      }
    ],
    "legalCaution": {
      "title": "Google Business Profile Review Policy Compliance",
      "points": [
        "Google strictly prohibits 'review gating' (filtering negative reviews by sending dissatisfied customers to a private form while directing positive customers to Google).",
        "Do not offer monetary incentives, discounts, or gifts in exchange for reviews, as this violates Google Maps Contributor guidelines and FTC endorsement guides.",
        "Ensure all reviews are genuine and left by authentic customers using their personal Google accounts."
      ]
    },
    "authorityLinks": [
      {
        "name": "Google Business Profile: Customer Reviews Policy",
        "desc": "Official rules and best practices for requesting Google customer reviews.",
        "url": "https://support.google.com/business/answer/3474122"
      },
      {
        "name": "FTC: Guides Concerning the Use of Endorsements and Testimonials",
        "desc": "Federal Trade Commission compliance guidelines for honest customer feedback and reviews.",
        "url": "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking"
      }
    ]
  },
  "whatsapp-qr-code-generator": {
    "benefits": [
      {
        "title": "Instant Chat Without Saving Number",
        "desc": "Customers connect immediately via wa.me protocol without needing to create a phone contact first."
      },
      {
        "title": "Pre-Filled Inquiries & Order Messages",
        "desc": "Pre-populate introductory text so customers can send product inquiries or reservations in one tap."
      },
      {
        "title": "Privacy-Safe Direct Communication",
        "desc": "No server logs or phone data collection. Compiled 100% locally in your browser memory."
      }
    ],
    "decisionGuide": [
      {
        "q": "Can I use this for personal and WhatsApp Business accounts?",
        "a": "Yes. The standard wa.me protocol operates universally across personal WhatsApp, WhatsApp Business, and WhatsApp Web on both Android and iOS devices."
      },
      {
        "q": "How should international phone numbers be formatted?",
        "a": "Include the country code followed by the full mobile number with digits only (e.g. 15550192834 for US or 447911123456 for UK). Do not include plus signs, spaces, or brackets."
      }
    ],
    "legalCaution": {
      "title": "WhatsApp Business Policy & Messaging Guidelines",
      "points": [
        "Ensure your customer outreach complies with WhatsApp Business Messaging Policies and applicable telecommunications regulations.",
        "Do not send unsolicited bulk promotional messages to users who scan your code without explicit opt-in consent.",
        "WhatsApp and its logos are registered trademarks of Meta Platforms, Inc."
      ]
    },
    "authorityLinks": [
      {
        "name": "WhatsApp Official: How to Use Click to Chat",
        "desc": "Official documentation for the wa.me protocol and URL-encoded messaging parameters.",
        "url": "https://faq.whatsapp.com/5913398998672934"
      },
      {
        "name": "WhatsApp Business Policy",
        "desc": "Terms and compliance guidelines for commercial communication on WhatsApp.",
        "url": "https://www.whatsapp.com/legal/business-policy/"
      }
    ]
  },
  "upi-qr-code-generator": {
    "benefits": [
      {
        "title": "Universal NPCI App Compatibility",
        "desc": "Scannable across Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and all Indian banking apps."
      },
      {
        "title": "Zero Commission & Direct Bank Settlement",
        "desc": "No payment gateway cut or transaction charges. 100% of customer funds transfer directly to your registered UPI VPA."
      },
      {
        "title": "Flexible Static or Preset Amount",
        "desc": "Generate open-amount QR codes for store counters or locked-amount codes for specific invoices and menu items."
      }
    ],
    "decisionGuide": [
      {
        "q": "What is the difference between static and dynamic amount UPI QR codes?",
        "a": "Static codes leave the amount blank, allowing customers to key in their own total at checkout. Dynamic amount codes embed a fixed rupee figure (e.g. am=450.00) so the amount is locked when scanned."
      },
      {
        "q": "Can I print UPI QR codes on tabletop acrylic tent stands?",
        "a": "Yes! UniversalCodeMaker exports high-resolution 300 DPI vector SVGs and PNGs that can be printed on durable vinyl or cardboard standees for checkout counters."
      }
    ],
    "legalCaution": {
      "title": "NPCI Unified Payments Interface Guidelines",
      "points": [
        "UniversalCodeMaker is an offline static code generator and is never in the flow of funds. All financial settlement occurs through NPCI member banks.",
        "Always test-scan your generated QR code with a ₹1 test transaction before printing physical shop signage to verify your VPA spelling.",
        "Ensure your merchant name matches the official registration on your bank account to avoid customer confusion during payment verification."
      ]
    },
    "authorityLinks": [
      {
        "name": "NPCI: Unified Payments Interface (UPI)",
        "desc": "National Payments Corporation of India official technical architecture and linking specifications.",
        "url": "https://www.npci.org.in/what-we-do/upi/product-overview"
      },
      {
        "name": "Reserve Bank of India: Digital Payment Guidelines",
        "desc": "RBI regulatory frameworks for electronic payments and QR-based merchant acceptance.",
        "url": "https://www.rbi.org.in/"
      }
    ]
  },
  "avery-5160-barcode-generator": {
    "benefits": [
      {
        "title": "Avery's Published 5160 Layout",
        "desc": "Labels are placed on Avery's 5160 grid: 3 columns × 10 rows of 1\" × 2-5/8\" labels, 0.5\" top margin, 3/16\" side margins and a 1/8\" gap between columns."
      },
      {
        "title": "Any Office Printer",
        "desc": "No thermal printer needed: print on a normal laser printer (5160 labels) or inkjet printer (8160 labels)."
      },
      {
        "title": "Code Plus Text",
        "desc": "Put a QR code or barcode beside a title, price or SKU with the label maker, or print just the code on up to 300 labels (10 sheets) in one PDF."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I print on Avery 5160 sheets or a direct thermal roll printer?",
        "a": "Avery 5160 sheets are ideal if you already own a standard office laser/inkjet printer and need to prepare 30 to 300 labels per batch. Thermal roll printers are faster and more economical for continuous, high-volume shipping stations."
      },
      {
        "q": "What printer settings prevent label misalignment?",
        "a": "Always select Actual Size or Scale: 100% in your print dialog, and turn off Fit to Page or Shrink to Printable Area. Otherwise the labels shift further out of line down the sheet."
      }
    ],
    "legalCaution": {
      "title": "Avery Template Compatibility & Trademark Notice",
      "points": [
        "Avery and Avery template numbers (5160, 5163, etc.) are registered trademarks of Avery Products Corporation / CCL Industries Inc.",
        "UniversalCodeMaker is an independent utility not affiliated with or endorsed by Avery Products Corporation. Template names are referenced strictly under nominative fair use for sizing compatibility.",
        "Always test print on plain paper first and hold against an Avery sheet to verify printer roller alignment before printing onto label stock."
      ]
    },
    "authorityLinks": [
      {
        "name": "Avery 5160 Template",
        "desc": "Avery's official template page for 1\" × 2-5/8\" address labels (30 per sheet).",
        "url": "https://www.avery.com/templates/5160"
      },
      {
        "name": "USPS Barcode Printing Standards",
        "desc": "Postal service contrast and barcode readability guidelines for mailers.",
        "url": "https://postalpro.usps.com/"
      }
    ]
  },
  "isbn-book-barcode-generator": {
    "benefits": [
      {
        "title": "Standard Bookland EAN-13",
        "desc": "The 978/979 EAN-13 book barcode with correct quiet zones, the format used on covers for Amazon KDP, IngramSpark and bookshops. Check your distributor's current cover specs before uploading."
      },
      {
        "title": "Optional EAN-5 Price Extension",
        "desc": "Seamlessly append standard 5-digit price codes (e.g. 51999 for $19.99 USD or 90000 for no price) required by US bookstores."
      },
      {
        "title": "Vector SVG & 300+ DPI Print Files",
        "desc": "Download crisp vector graphics to embed into Adobe InDesign, Illustrator, Canva, or Photoshop book cover templates."
      }
    ],
    "decisionGuide": [
      {
        "q": "Do I need the 5-digit price add-on code on my book?",
        "a": "Major US bookstore chains (such as Barnes & Noble) strongly prefer the 5-digit price extension code to automatically populate the retail price at the cash register. For international or online-only sales, standard 13-digit ISBN is sufficient."
      },
      {
        "q": "Can I use the same ISBN for paperback and hardcover editions?",
        "a": "No. Under international publishing standards, every format (paperback, hardcover, audiobook, e-book) requires its own unique ISBN number."
      }
    ],
    "legalCaution": {
      "title": "International ISBN Agency Regulatory Compliance",
      "points": [
        "ISBN barcodes must be derived from genuine ISBN numbers issued by authorized national agencies (Bowker in the US, Nielsen in the UK, etc.).",
        "Inventing arbitrary 13-digit numbers will result in immediate rejection by book wholesalers, libraries, and Amazon KDP.",
        "Ensure the barcode is printed on an opaque white background on the lower right quadrant of the back cover."
      ]
    },
    "authorityLinks": [
      {
        "name": "International ISBN Agency Official Portal",
        "desc": "Global standard administrator for book numbering and publisher prefixes.",
        "url": "https://www.isbn-international.org/"
      },
      {
        "name": "Bowker Identifier Services (US ISBN Agency)",
        "desc": "Official US provider for book ISBN registration and publisher barcodes.",
        "url": "https://www.myidentifiers.com/"
      }
    ]
  },
  "code-39-barcode-generator": {
    "benefits": [
      {
        "title": "Full Alphanumeric Character Support",
        "desc": "Encodes capital letters A–Z, numbers 0–9, and key operational symbols (- . $ / + % space) for intuitive asset naming."
      },
      {
        "title": "Defense & Military (MIL-STD-129) Ready",
        "desc": "Fully compliant with US Department of Defense LOGMARS logistics standards for military supply contracts."
      },
      {
        "title": "Self-Checking Robust Architecture",
        "desc": "Inherent parity check pattern minimizes misread risks, with optional Modulo-43 check digit support for mission-critical tracking."
      }
    ],
    "decisionGuide": [
      {
        "q": "When should I choose Code 39 over Code 128?",
        "a": "Choose Code 39 when encoding shorter alphanumeric IDs (like ASSET-104) where legacy scanners or government contracts (MIL-STD-129) require it. Choose Code 128 if you have longer strings or space constraints on small labels."
      },
      {
        "q": "Should I enable the Modulo-43 check digit?",
        "a": "Enable Mod-43 if you are tracking high-value assets, medical specimens, or defense shipments. For casual office inventory, standard Code 39 without check digit is scannable on all hardware."
      }
    ],
    "legalCaution": {
      "title": "Code 39 Technical Standards & Quiet Zone Rules",
      "points": [
        "Code 39 requires a minimum quiet zone (blank white margin) of 10 times the narrow bar width on both the left and right sides.",
        "Standard Code 39 is not case-sensitive; lowercase letters are automatically capitalized upon encoding.",
        "Ensure start and stop asterisks (*) are preserved in the optical pattern to allow bi-directional scanning."
      ]
    },
    "authorityLinks": [
      {
        "name": "AIM Global: Code 39 Symbology Specification",
        "desc": "Official standards body documentation for ANSI/AIM BC1 Uniform Symbology Specification Code 39.",
        "url": "https://www.aimglobal.org/"
      },
      {
        "name": "US DoD MIL-STD-129 Marking for Shipment",
        "desc": "Military standard for shipment and packaging asset identification.",
        "url": "https://quicksearch.dla.mil/"
      }
    ]
  },
  "bulk-barcode-generator-excel": {
    "benefits": [
      {
        "title": "1,000 Barcodes in Under 3 Seconds",
        "desc": "High-throughput browser-based batch processing with zero server upload latency or cloud queuing."
      },
      {
        "title": "Single-Click Consolidated ZIP Export",
        "desc": "Downloads all generated high-DPI 300+ PPI PNGs cleanly organized with original filenames in a single ZIP file."
      },
      {
        "title": "100% Zero-Knowledge Privacy",
        "desc": "Your confidential inventory SKUs, customer lists, and pricing spreadsheets never leave your device."
      }
    ],
    "decisionGuide": [
      {
        "q": "How do I format my Excel sheet before uploading?",
        "a": "Place your barcode data in a single column without empty rows or complex formulas, then click File > Save As > CSV (Comma delimited). Our tool will parse each row into an individual barcode."
      },
      {
        "q": "Can I batch generate sequential numbers without an Excel file?",
        "a": "Yes! Switch to the 'Sequential Range' tab, specify your prefix (e.g. SKU-), start number (e.g. 1001), count (e.g. 200), and padding digits to generate an instant sequence."
      }
    ],
    "legalCaution": {
      "title": "Batch Inventory Compliance & Data Protection",
      "points": [
        "UniversalCodeMaker does not store, log, or cache batch data on any server. Be sure to download your generated ZIP file or PDF before closing the browser window.",
        "When generating retail EAN-13 or UPC-A batches, ensure all numbers correspond to legitimate GS1 Company Prefixes registered to your organization.",
        "Always perform a sample test scan of at least 3 random barcodes from your batch before committing to large print runs."
      ]
    },
    "authorityLinks": [
      {
        "name": "IETF RFC 4180: Common Format for CSV Files",
        "desc": "Standard specification for Comma-Separated Values MIME type.",
        "url": "https://www.ietf.org/rfc/rfc4180.txt"
      },
      {
        "name": "GS1 General Specifications for Automated Identification",
        "desc": "Global retail guidelines for sequential inventory and serial number assignment.",
        "url": "https://www.gs1.org/"
      }
    ]
  },
  "shopify-barcode-generator": {
    "benefits": [
      {
        "title": "Zero Monthly App Subscription Fees",
        "desc": "Create unlimited retail barcodes for your Shopify store without paying $10–$25/month for third-party Shopify apps."
      },
      {
        "title": "Direct Shopify POS Scanner Compatibility",
        "desc": "Encoded with precision quiet zones that work instantly with Socket Mobile, Tera, and Zebra Shopify POS Bluetooth scanners."
      },
      {
        "title": "Avery & Thermal Price Tag Presets",
        "desc": "Formatted for 2.25\" × 1.25\" shelf tags and Avery 5160 sheets with Product Title, SKU, Price, and Barcode."
      }
    ],
    "decisionGuide": [
      {
        "q": "Should I use UPC-A or Code 128 for my Shopify store?",
        "a": "If you are selling products in external retail marketplaces (like Amazon or Google Shopping), use official GS1 UPC-A barcodes. If you only sell on your own Shopify store and physical boutique, Code 128 using your internal SKUs is fast and free."
      },
      {
        "q": "How do I add barcodes to my Shopify products?",
        "a": "In your Shopify Admin, navigate to Products > Select Product > Inventory section, and paste the barcode number into the 'Barcode (ISBN, UPC, GTIN, etc.)' field."
      }
    ],
    "legalCaution": {
      "title": "Shopify POS & Google Shopping Barcode Policy",
      "points": [
        "Shopify and Shopify POS are registered trademarks of Shopify Inc. UniversalCodeMaker is an independent software tool not endorsed by Shopify.",
        "Google Shopping and marketplace integrations require authentic GS1 GTINs. Do not enter fabricated UPC numbers into Shopify if syncing with Google Merchant Center.",
        "Ensure thermal labels use high-density thermal paper to prevent barcode fading under retail store lighting."
      ]
    },
    "authorityLinks": [
      {
        "name": "Shopify Help Center: Barcodes and Shopify POS",
        "desc": "Official Shopify guide for setting up product barcodes and scanner hardware.",
        "url": "https://help.shopify.com/en/manual/products/details/barcodes"
      },
      {
        "name": "Google Merchant Center: Unique Product Identifiers (GTIN)",
        "desc": "Google requirements for retail barcodes when listing e-commerce products.",
        "url": "https://support.google.com/merchants/answer/160161"
      }
    ]
  },
};

/**
 * Practical guide sections per landing page: how-to steps, printing/size advice, common
 * mistakes and extra FAQs. Optional; pages without an entry simply skip these sections.
 * HTML is allowed in the strings (links, <strong>); keep claims true to what the studio does.
 */
const GUIDES = {
  "google-maps-location-qr-code-generator": {
    "howTo": [
      "Type your <strong>place name or address</strong>, for example <em>\"Blue Door Café, 12 High Street, Leeds\"</em>. Search for it in Google Maps first and copy the wording that finds the right result.",
      "For a spot with no address (an event entrance, a car park, a trailhead), fill in <strong>latitude and longitude</strong> instead. In Google Maps, long-press the exact spot (right-click on a computer) and copy the numbers shown.",
      "Coordinates are used if both are filled in; otherwise the place name or address is searched.",
      "Scan the preview with your phone and check that Google Maps opens the right place.",
      "Download <strong>SVG</strong> or <strong>PNG</strong> for flyers, signs and business cards."
    ],
    "print": [
      "<strong>Size:</strong> at least <strong>2 cm (0.8 in)</strong> wide for flyers and cards read up close; for a door or window sign read from 1–2 metres away, about 10–20 cm (4–8 in). This follows a common rule of thumb, not part of the QR standard: make the code at least a tenth of the scanning distance. Test-scan at the real distance before printing.",
      "<strong>Add a line of text</strong> such as <em>\"Scan for directions\"</em> and the address, so people know what the code does and can still find you without scanning.",
      "<strong>Keep the white border</strong> around the code, and print dark on light."
    ],
    "mistakes": [
      "<strong>A vague place name</strong> that matches several places (\"Main Street Café\"). Add the street and town, or use coordinates.",
      "<strong>Coordinates in the wrong order.</strong> Latitude comes first (north–south, −90 to 90), then longitude (east–west, −180 to 180).",
      "<strong>Pinning the middle of a big site</strong> instead of the visitor entrance.",
      "<strong>Not test-scanning on both iPhone and Android</strong> before printing."
    ],
    "moreFaqs": [
      {
        "q": "Does the QR code open Google Maps or Apple Maps?",
        "a": "Google Maps. If the Google Maps app is installed it opens there; otherwise the place opens in the phone's web browser on Google Maps. It does not open Apple Maps or Waze."
      },
      {
        "q": "I already have a Google Maps share link. Can I use that?",
        "a": "Yes. In Google Maps, tap Share and copy the link, then make a Website link QR code with it. That opens the exact place you shared, including its name and reviews."
      },
      {
        "q": "Will the QR code still work if my business moves?",
        "a": "It keeps pointing to the old place, because the location is stored in the code itself. Make and print a new code after a move."
      }
    ]
  },
  "avery-5160-barcode-generator": {
    "title": "How to Print QR Codes &amp; Barcodes on Avery 5160 Labels",
    "howTo": [
      "Make your code in the studio: any of the 10 formats, including <strong>QR codes</strong> for links, Wi-Fi, contact cards or Google reviews. For QR codes, keep the content short (a short link rather than a long one) so the dots stay big enough for a small label.",
      "Open the <strong>Physical Label Maker</strong> and choose <strong>Avery® 5160 — 30 Labels / Sheet</strong>. The button above opens it with this preset.",
      "Pick the <strong>Split</strong> layout to put a QR code on the left and your title, price or SKU on the right. Barcodes work in the other layouts too.",
      "Click <strong>Avery Sheet (PDF)</strong>. Every label on the sheet gets the same design. To print only the code, without text, use <strong>Print Avery PDF Label Sheet</strong> in the studio instead (1 to 300 labels).",
      "Print one page on plain paper at <strong>Actual size / 100%</strong>, hold it against a label sheet to check the alignment, then print on the labels and scan one with your phone."
    ],
    "print": [
      "<strong>QR size:</strong> on a 1-inch-tall 5160 label, the Split layout prints the QR code about <strong>22 mm (0.88 in)</strong> square, including the white border it needs. By the common rule of thumb (code at least a tenth of the scanning distance; not part of the QR standard) that suits a phone held up to about 20 cm (8 in) away. It's too small for posters or signs; test-scan a printed label.",
      "<strong>No logo on tiny QR codes:</strong> a centre logo switches the code to the highest error correction, which makes the pattern denser. Leave it out on labels this small.",
      "<strong>Retail barcodes:</strong> a 1-inch label is shorter than an EAN-13 or UPC-A at GS1's target size (bars 22.85 mm plus the digits). Use a smaller size within GS1's range, or a taller label such as Avery 5163.",
      "<strong>Printer:</strong> 5160 labels are made for laser printers and 8160 for inkjet printers. Both are the same size and use the same template.",
      "<strong>Scale:</strong> print at Actual size (100%). \"Fit to page\" shrinks the page, and the labels drift out of line further down the sheet."
    ],
    "mistakes": [
      "<strong>Printing with \"Fit to page\" or \"Shrink to printable area\"</strong> switched on.",
      "<strong>Long QR content on a small label</strong>, such as a long tracking link or Wi-Fi password. The dots get too small to scan reliably; use a shorter link.",
      "<strong>Inkjet labels in a laser printer, or the other way round.</strong> Toner may not fuse to inkjet stock, and inkjet ink can smear on laser labels.",
      "<strong>Printing a full pack before test-scanning</strong> one printed label."
    ],
    "moreFaqs": [
      {
        "q": "Can I put a QR code on Avery 5160 labels?",
        "a": "Yes. Make the QR code in the studio, open the label maker with the Avery 5160 preset and choose the Split layout. The QR code prints about 22 mm (0.88 in) square with your text beside it, on all 30 labels of the sheet."
      },
      {
        "q": "Which QR code types work on small labels?",
        "a": "Short ones scan best at this size: a website or Google review link, a phone number, or a short text. Wi-Fi codes with long passwords and full contact cards hold more data, so their dots get smaller; test-scan a printed label before printing a whole pack."
      }
    ]
  },
  "upc-a-barcode-generator": {
    "howTo": [
      "Get your 12-digit product number (GTIN-12) from <strong>GS1 US</strong> (or GS1 Canada). Depending on how many products you have, you can license a company prefix or, in the US, buy single GTINs. Our guide <a href=\"./how-to-get-a-barcode-for-your-product.html\">How to get a barcode for your product</a> walks through it.",
      "Open the studio with <strong>UPC-A</strong> selected (the button above does this) and type the first <strong>11 digits</strong>. The 12th check digit is calculated for you. If you enter all 12, the studio checks the last one.",
      "Keep the human-readable digits under the bars switched on, as retail packaging needs them.",
      "Scan the preview with the built-in <a href=\"../barcode-scanner.html\">barcode scanner</a> or a phone to confirm it reads back the right 12 digits.",
      "Download <strong>SVG</strong> for packaging artwork, or print label sheets with the Avery label maker."
    ],
    "print": [
      "<strong>Size:</strong> GS1 sets the size by the width of the narrowest bar (the X-dimension). At the target of <strong>0.330 mm</strong>, a UPC-A is <strong>37.29 mm (1.468 in) wide</strong> including its margins, with bars <strong>22.85 mm (0.900 in) high</strong>. You can scale it between 0.264 mm and 0.660 mm (often called 80% to 200%); don't go below the minimum for retail checkout.",
      "<strong>Margins:</strong> keep a blank quiet zone of 9 bar-widths on each side (about 3 mm at 100%). Don't let text, borders or artwork touch the bars.",
      "<strong>Height:</strong> don't cut the bars shorter to save space. GS1 US advises against this (\"truncating\") because it makes the barcode harder to scan at the checkout.",
      "<strong>Colours:</strong> black or dark blue bars on white work best. Red bars don't scan, because red-light checkout scanners see red as white.",
      "<strong>Resize the SVG, not a small PNG.</strong> Stretching a low-resolution image makes the bar widths uneven."
    ],
    "mistakes": [
      "<strong>Buying cheap UPCs from resellers</strong> for products sold on Amazon or in US retail chains. These platforms check numbers against the GS1 database, and a number licensed to another company can get listings blocked.",
      "<strong>Using one UPC for several variants.</strong> Each size, colour, flavour or pack count needs its own number.",
      "<strong>Putting UPC-A on outer shipping cartons.</strong> Cartons use ITF-14 or GS1-128 instead.",
      "<strong>Not test-scanning a printed proof</strong> before a full print run."
    ],
    "moreFaqs": [
      {
        "q": "How do I get a UPC code for my product?",
        "a": "Get the number from GS1 US (or GS1 Canada), the organisations that run the UPC system. They license company prefixes, and GS1 US also sells single GTINs, with no yearly renewal fee, for sellers with only a few products. Once you have the number, making the barcode image here is free."
      },
      {
        "q": "Do I need a different UPC for each size or colour?",
        "a": "Yes. Every product variant that is sold separately, such as each size, colour, flavour or pack count, needs its own number, so stores and marketplaces can tell them apart."
      },
      {
        "q": "Is a UPC-A number the same as a GTIN-12?",
        "a": "Yes. UPC-A encodes a GTIN-12. Systems that expect 13 digits store it with a leading zero, and systems that expect 14 digits add two leading zeros. It is still the same product number."
      },
      {
        "q": "Can I make a UPC-E barcode here?",
        "a": "Not yet. This generator makes full-size UPC-A. UPC-E is a shortened 8-digit form for very small packs, and only some UPC-A numbers can be compressed into it."
      }
    ]
  },
  "wifi-qr-code-generator": {
    "howTo": [
      "Open the studio with the <strong>Wi-Fi</strong> QR type selected (the button above does this).",
      "Type the <strong>network name (SSID)</strong> exactly as your phone shows it. Names are case-sensitive, and spaces count.",
      "Choose the <strong>security type</strong>: <em>WPA / WPA2 / WPA3</em> for almost every home and business router, <em>WEP</em> only for very old routers, or <em>None</em> for an open network.",
      "Enter the <strong>password</strong>, and tick <strong>Hidden Network</strong> if your router doesn't broadcast its name.",
      "Scan the preview with your phone camera (or the built-in <a href=\"../barcode-scanner.html\">barcode scanner</a>) and join the network once, before you print anything.",
      "Download <strong>SVG</strong> for print shops and signs, or <strong>PNG</strong> at 2× or 4× for documents, then print."
    ],
    "print": [
      "<strong>Size:</strong> print the code at least <strong>2.5 cm (1 in)</strong> wide for a table card read up close. A common rule of thumb (not part of the QR standard) is a scanning distance of up to about 10× the code's width, so a 3 cm code suits roughly 30 cm. Test-scan at the real distance.",
      "<strong>Margin:</strong> keep the white border (quiet zone) around the code. Cropping it off is the most common reason a printed code won't scan.",
      "<strong>Contrast:</strong> dark code on a light background. Light-on-dark (inverted) codes fail on some Android phones.",
      "<strong>Surface:</strong> matte paper or a matte laminate. Glossy lamination causes glare under ceiling lights.",
      "Add a short line of text such as <em>\"Scan to join our Wi-Fi\"</em> and the network name, so guests know what the code is for and can still type it if needed."
    ],
    "mistakes": [
      "<strong>Changing the password later.</strong> The password is inside the code, so the old code stops working. Make and print a new one whenever you change it.",
      "<strong>A typo in the network name</strong>, or the wrong capitalisation. The phone looks for exactly what's in the code.",
      "<strong>Company networks that ask for a username and password</strong> (WPA2/WPA3-Enterprise). Standard Wi-Fi QR codes are made for a single shared password, so use a guest network instead.",
      "<strong>Printing before testing.</strong> Scan the final file on at least one iPhone and one Android phone first."
    ],
    "moreFaqs": [
      {
        "q": "What happens to the QR code if I change my Wi-Fi password?",
        "a": "It stops working, because the password is stored inside the code itself (there's no server in between). Create a new code with the new password and replace the printed one."
      },
      {
        "q": "Does a Wi-Fi QR code work for 5 GHz and 6 GHz networks?",
        "a": "Yes. The code contains the network name, security type and password, not a frequency band. The phone joins that network the same way it would if you typed the details."
      },
      {
        "q": "Can I test the code before printing it?",
        "a": "Yes. Point your phone camera at the preview on screen, or upload the downloaded image to our free in-browser barcode scanner, which shows exactly what the code contains."
      }
    ]
  },
  "vcard-qr-code-generator": {
    "howTo": [
      "Open the studio with the <strong>vCard</strong> QR type selected (the button above does this).",
      "Fill in the fields you want to share: first and last name, company, job title, phone, email, website and address. Leave out anything you don't want on the card.",
      "Write the phone number in <strong>international format</strong> with the country code, for example <em>+1 555 019 2834</em> or <em>+44 20 7946 0000</em>.",
      "Scan the preview with your phone and check that <strong>Add to Contacts</strong> shows every field correctly.",
      "Download <strong>SVG</strong> for business cards and print design, or <strong>PNG</strong> for email signatures and slides."
    ],
    "print": [
      "<strong>Business cards:</strong> a standard card is 85 × 55 mm (3.5 × 2 in). Print the code at least <strong>2.5 cm (1 in)</strong> wide, with a clear white margin around it.",
      "<strong>Fewer fields scan faster.</strong> A vCard is plain text inside the code, so every extra field makes the pattern denser. Name, phone, email and website are usually enough.",
      "<strong>Contrast:</strong> keep the code dark on a light background, even if your card design is dark. Put the code on a white panel.",
      "<strong>Logo:</strong> if you add a logo in the centre, the studio switches to the highest error correction level automatically. Keep the logo small and test the final print."
    ],
    "mistakes": [
      "<strong>Phone numbers without the country code.</strong> They may dial the wrong number, or none, when scanned abroad.",
      "<strong>Testing on screen only.</strong> Always scan the printed proof at its final size, especially on small cards.",
      "<strong>Expecting to edit it later.</strong> The contact details are stored in the code itself, so a new job title or phone number needs a new code.",
      "<strong>Adding a photo.</strong> Photos are far too large for a QR code. Share them through your website or LinkedIn link instead."
    ],
    "moreFaqs": [
      {
        "q": "Will a vCard QR code work on both iPhone and Android?",
        "a": "Yes. The iPhone Camera app and Android camera or Google Lens recognise vCard codes and offer to add the contact. We write vCard 3.0, the version contact apps read most reliably."
      },
      {
        "q": "Can I change the details after printing?",
        "a": "No. The details are stored inside the code, which is what makes it private, free and permanent. If something changes, generate a new code. It takes a few seconds."
      },
      {
        "q": "Can I put my photo or logo in the contact card?",
        "a": "A photo can't fit inside a QR code. You can place a small logo in the centre of the code itself as decoration; it isn't added to the saved contact."
      }
    ]
  },
  "ean-13-barcode-generator": {
    "howTo": [
      "Get your product number (GTIN-13) from <strong>GS1</strong>, or from your retailer if it assigns numbers. Don't make up numbers for products sold in shops or on marketplaces. Our guide <a href=\"./how-to-get-a-barcode-for-your-product.html\">How to get a barcode for your product</a> explains how.",
      "Open the studio with <strong>EAN-13</strong> selected (the button above does this) and type the first <strong>12 digits</strong>. The 13th check digit is calculated for you. If you enter all 13, the studio checks the last one.",
      "Keep the human-readable digits under the bars switched on, as retail packaging needs them.",
      "Scan the preview with the built-in <a href=\"../barcode-scanner.html\">barcode scanner</a> or a phone to confirm it reads back the right 13 digits.",
      "Download <strong>SVG</strong> for packaging artwork (vector, so bars stay exact at any size), or print sheets with the Avery label maker."
    ],
    "print": [
      "<strong>Size:</strong> GS1 sets the size by the width of the narrowest bar (the X-dimension). At the target of <strong>0.330 mm</strong>, an EAN-13 is <strong>37.29 mm wide</strong> including its margins, with bars <strong>22.85 mm high</strong>. You can scale it between 0.264 mm and 0.660 mm (often called 80% to 200%); don't go below the minimum for retail checkout.",
      "<strong>Margins:</strong> keep the blank quiet zones, 11 bar-widths on the left and 7 on the right. Don't let text, borders or artwork touch the bars.",
      "<strong>Height:</strong> don't cut the bars shorter to save space. Truncated barcodes are harder to scan from different angles.",
      "<strong>Colours:</strong> black or dark blue bars on white work best. Red bars don't scan, because red-light checkout scanners see red as white.",
      "<strong>Resize the SVG, not a small PNG.</strong> Stretching a low-resolution image in Word or Canva makes bar widths uneven."
    ],
    "mistakes": [
      "<strong>Buying cheap numbers from resellers</strong> for products sold on Amazon or in retail chains. These platforms check barcodes against the GS1 database, and numbers registered to another company can get listings blocked.",
      "<strong>Printing too small or too short</strong> to fit a small pack. Use a smaller size within GS1's allowed range, or ask your GS1 office about EAN-8 for very small items.",
      "<strong>Low contrast</strong>, such as grey on kraft paper or bars on a busy background.",
      "<strong>Not test-scanning a printed proof</strong> before a full print run."
    ],
    "moreFaqs": [
      {
        "q": "What size should I print an EAN-13 barcode?",
        "a": "At GS1's target size (narrowest bar 0.330 mm) it is 37.29 mm wide including the margins, with bars 22.85 mm high. The smallest allowed for retail checkout (0.264 mm bars) is 29.83 mm wide with 18.28 mm bars; the largest is twice the target. Always keep the margins and the full bar height."
      },
      {
        "q": "Can a US store scan an EAN-13 barcode?",
        "a": "Yes. Scanners in the US and Canada read EAN-13 as well as UPC-A, and a UPC-A number is simply an EAN-13 with a leading zero. Some US retailers still ask suppliers for UPC-A, so check your retailer's requirements."
      },
      {
        "q": "Can I use EAN-13 barcodes for my own stock or inventory without GS1?",
        "a": "Yes, for internal use such as your own shelves or warehouse. GS1 numbers are only required when the product is sold through retailers or marketplaces that expect a globally unique product number."
      }
    ]
  }
};

// Long-form guide pages (pages/<slug>.html). They answer the questions people search before they
// need a tool, then link into the matching generators. Same chrome as the landing pages.
const ARTICLES = [
  {
    slug: 'how-to-get-a-barcode-for-your-product',
    name: 'How to Get a Barcode for Your Product',
    badge: 'Seller Guide',
    queryParam: 'symbology=ean-13',
    metaTitle: 'How to Get a Barcode for Your Product: EAN-13, UPC-A & GTIN Explained',
    metaDescription: 'Where product barcode numbers come from, EAN-13 vs UPC-A vs GTIN, how the check digit works, the right print size, and how to make the barcode free.',
    h1: 'How to Get a Barcode for Your Product',
    lead: 'A retail barcode is two things: a product number that nobody else uses, and the bars that encode it. The number comes from GS1. The barcode image you can make yourself, free. This guide covers both, step by step.',
    datePublished: '2026-10-07',
    ctas: [
      { href: '../index.html?symbology=ean-13', label: 'Make an EAN-13 barcode' },
      { href: '../index.html?symbology=upc-a', label: 'Make a UPC-A barcode' }
    ],
    sections: [
      {
        id: 'short-answer',
        h2: 'The short answer',
        html: `
        <ol>
          <li><strong>Get a product number (GTIN) from GS1</strong>, the not-for-profit organisation that runs the barcode numbering system, through the GS1 office in your country.</li>
          <li><strong>Give each product variant its own number</strong>: every size, colour, flavour and pack count.</li>
          <li><strong>Make the barcode</strong>: EAN-13 for a 13-digit number, UPC-A for a 12-digit number (US and Canada). Our generator adds the check digit for you.</li>
          <li><strong>Print it at the right size</strong> and <strong>test-scan a printed proof</strong> before a full print run.</li>
        </ol>
        <p>If the barcode is only for your own stock room or shelves, you don't need GS1 at all. See <a href="#internal-use">barcodes for internal use</a>.</p>`
      },
      {
        id: 'gtin-ean-upc',
        h2: 'GTIN, EAN-13 and UPC-A: what\'s the difference?',
        html: `
        <p><strong>GTIN</strong> (Global Trade Item Number) is the product number. <strong>EAN-13</strong> and <strong>UPC-A</strong> are the barcodes that carry it at the checkout.</p>
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th>Number</th><th>Digits</th><th>Barcode</th><th>Where it's used</th></tr></thead>
            <tbody>
              <tr><td>GTIN-13</td><td>13</td><td><a href="./ean-13-barcode-generator.html">EAN-13</a></td><td>Retail almost everywhere outside the US and Canada</td></tr>
              <tr><td>GTIN-12</td><td>12</td><td><a href="./upc-a-barcode-generator.html">UPC-A</a></td><td>Retail in the US and Canada</td></tr>
              <tr><td>GTIN-14</td><td>14</td><td><a href="./itf-14-barcode-generator.html">ITF-14</a></td><td>Outer cartons and cases, not consumer packs</td></tr>
              <tr><td>ISBN-13</td><td>13</td><td><a href="./isbn-book-barcode-generator.html">EAN-13 (Bookland)</a></td><td>Books, from your national ISBN agency, not GS1</td></tr>
            </tbody>
          </table>
        </div>
        <p>Put a 0 in front of a 12-digit UPC-A number and you have the same product's 13-digit number. Checkout scanners around the world read both barcodes, so a UPC-A product can be sold in Europe and an EAN-13 product in the US. Some US retailers still ask suppliers for UPC-A, so check what your buyer wants.</p>`
      },
      {
        id: 'do-you-need-gs1',
        h2: 'Step 1: Decide whether you need a GS1 number',
        html: `
        <p><strong>You need a GS1 number</strong> if the product will be sold through someone else's system: supermarkets and chain stores, Amazon, Walmart and most other marketplaces, and distributors. They look the number up in the GS1 database to see which company owns it.</p>
        <p><strong>Amazon</strong> checks product UPCs against the GS1 database and recommends getting them directly from GS1. If your product has no GTIN at all (for example a private-label or handmade item), you can apply for a <em>GTIN exemption</em> in Seller Central; it isn't available for products that already carry a GS1 barcode. The <a href="./amazon-fba-fnsku-barcode-generator.html">FNSKU label</a> Amazon asks for on FBA stock is a separate, Amazon-only code.</p>
        <p id="internal-use"><strong>You don't need GS1</strong> for barcodes that never leave your business: stock-room bins, asset tags, your own shop's shelf labels. GS1 reserves number ranges for this kind of use (EAN-13 numbers starting 20–29, UPC-A numbers starting 2 or 4; your local GS1 office sets how they are used), or you can simply use <a href="./code-128-barcode-generator.html">Code 128</a> with your own SKUs.</p>`
      },
      {
        id: 'get-numbers',
        h2: 'Step 2: Get your numbers from GS1',
        html: `
        <ul>
          <li>Go to <a href="https://www.gs1.org/" target="_blank" rel="noopener noreferrer">gs1.org</a> and choose your country, or go straight to your national office, for example <a href="https://www.gs1us.org/" target="_blank" rel="noopener noreferrer">GS1 US</a>, <a href="https://www.gs1uk.org/" target="_blank" rel="noopener noreferrer">GS1 UK</a> or <a href="https://www.gs1india.org/" target="_blank" rel="noopener noreferrer">GS1 India</a>.</li>
          <li>Most offices license a <strong>company prefix</strong>: a block of numbers sized to how many products you plan to sell. GS1 US also sells <strong>single GTINs</strong> for sellers with only a few products.</li>
          <li>Fees depend on the country and the number of products. A company prefix usually has a yearly renewal fee; GS1 US single GTINs are a one-time purchase. Check your office's current price list.</li>
        </ul>
        <div class="article-callout">
          <strong>Avoid cheap numbers from resellers.</strong> Those numbers were licensed to another company, and the GS1 database still shows that company as the owner. Marketplaces and retailers that check the database can reject or remove your listings.
        </div>`
      },
      {
        id: 'assign',
        h2: 'Step 3: Give every product variant its own number',
        html: `
        <ul>
          <li>Each item sold separately needs its own GTIN: 250 ml and 500 ml are two numbers; red and blue are two numbers; a single bar and a 6-pack are two numbers.</li>
          <li>Keep a simple spreadsheet: number, product name, size or variant, and the date you assigned it.</li>
          <li>Never reuse a number for a different product. Shops and marketplaces may still have the old product on file.</li>
        </ul>`
      },
      {
        id: 'check-digit',
        h2: 'Step 4: The check digit (done for you)',
        html: `
        <p>The last digit of every EAN-13 and UPC-A is a <strong>check digit</strong>. It lets the scanner catch a misread. Our generator calculates it when you type 12 digits (EAN-13) or 11 digits (UPC-A), and checks it if you type the full number. Here is how it works, using the example number <code>590123412345</code>:</p>
        <ol>
          <li>Starting from the <strong>rightmost</strong> digit, multiply the digits alternately by 3 and 1: 5×3, 4×1, 3×3, 2×1, 1×3, 4×1, 3×3, 2×1, 1×3, 0×1, 9×3, 5×1.</li>
          <li>Add the results: 15 + 4 + 9 + 2 + 3 + 4 + 9 + 2 + 3 + 0 + 27 + 5 = <strong>83</strong>.</li>
          <li>The check digit is what you add to reach the next multiple of 10: 90 − 83 = <strong>7</strong>.</li>
        </ol>
        <p>So the full EAN-13 is <code>5901234123457</code>. The same rule works for UPC-A: <code>03600029145</code> gets check digit <strong>2</strong>.</p>`
      },
      {
        id: 'make',
        h2: 'Step 5: Make the barcode',
        html: `
        <ol>
          <li>Open the <a href="./ean-13-barcode-generator.html">EAN-13 generator</a> for a 13-digit number or the <a href="./upc-a-barcode-generator.html">UPC-A generator</a> for a 12-digit number.</li>
          <li>Type your number. Leave the human-readable digits under the bars switched on; retail packaging needs them.</li>
          <li>Download <strong>SVG</strong> for packaging artwork, since it stays sharp at any size and your designer can place it exactly. Use <strong>PNG at 4×</strong> for documents and labels.</li>
          <li>For sticker labels, use the label maker with <a href="./avery-5160-barcode-generator.html">Avery 5160</a> and similar sheets, or a thermal roll. To make many at once, use the <a href="./bulk-barcode-generator-excel.html">batch generator</a>.</li>
        </ol>
        <p>Everything runs in your browser, and your product numbers are never uploaded.</p>`
      },
      {
        id: 'size',
        h2: 'Step 6: Print it at the right size',
        html: `
        <div class="article-table-wrap" tabindex="0">
          <table class="article-table">
            <thead><tr><th></th><th>EAN-13</th><th>UPC-A</th></tr></thead>
            <tbody>
              <tr><td>Target size (narrowest bar 0.330 mm)</td><td colspan="2">37.29 mm (1.468 in) wide including margins, bars 22.85 mm (0.900 in) high</td></tr>
              <tr><td>Smallest for retail checkout (bar 0.264 mm, "80%")</td><td colspan="2">29.83 mm wide, bars 18.28 mm high</td></tr>
              <tr><td>Largest (bar 0.660 mm, "200%")</td><td colspan="2">74.58 mm wide, bars 45.70 mm high</td></tr>
              <tr><td>Blank margin (quiet zone)</td><td>11 bar-widths left, 7 right</td><td>9 bar-widths each side</td></tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li><strong>Don't shorten the bars</strong> to fit a small pack. Use a smaller size within the allowed range instead.</li>
          <li><strong>Dark bars on a light background.</strong> Black on white is best. Red bars don't scan, because checkout scanners use red light.</li>
          <li><strong>Matte surfaces</strong> scan better than glossy ones, and the barcode shouldn't wrap around a tight curve.</li>
        </ul>`
      },
      {
        id: 'test',
        h2: 'Step 7: Test before you print in volume',
        html: `
        <ul>
          <li>Print one proof at the final size and scan it with a phone, a handheld scanner, or our free <a href="../barcode-scanner.html">barcode scanner</a> (upload a photo of the proof).</li>
          <li>Check that it reads back exactly your number, including the check digit.</li>
          <li>Some large retailers ask for a <strong>verification report</strong> (print quality grading under ISO/IEC 15416). Your printer or GS1 office can arrange one.</li>
        </ul>`
      },
      {
        id: 'sunrise-2027',
        h2: 'What about 2D barcodes? (GS1 Sunrise 2027)',
        html: `
        <p>EAN-13 and UPC-A are still the checkout standard. Under GS1's <strong>Sunrise 2027</strong> goal, retailers are preparing their tills to also read 2D codes (QR codes that use <strong>GS1 Digital Link</strong>, and <strong>GS1 DataMatrix</strong>) by the end of 2027.</p>
        <ul>
          <li>It's a voluntary industry target, not a law.</li>
          <li>Your EAN-13 or UPC-A barcode stays on the pack. Brands that add a 2D code put it alongside, carrying the same GTIN.</li>
          <li>If you're designing new packaging, ask your GS1 office whether your retailers want a 2D code yet.</li>
        </ul>`
      }
    ],
    faqs: [
      {
        q: 'Can I just make up my own barcode number?',
        a: 'Only for internal use, such as your own stock room or shelves. Products sold through retailers or marketplaces need a number licensed from GS1, because these systems check who owns each number.'
      },
      {
        q: 'How much does a product barcode cost?',
        a: 'The number costs whatever your national GS1 office charges, which depends on the country and how many products you have, usually with a yearly fee. Making the barcode image is free: you can do it in our generator.'
      },
      {
        q: 'Should I use EAN-13 or UPC-A?',
        a: 'Use the barcode that matches your number: EAN-13 for a 13-digit GTIN, UPC-A for a 12-digit GTIN. GS1 US issues 12-digit numbers; most other GS1 offices issue 13-digit numbers. If you are not sure, ask your GS1 office.'
      },
      {
        q: 'Can I use the same barcode on Amazon and in shops?',
        a: 'Yes. A GTIN identifies the product itself, so the same number works on Amazon, in stores and with distributors. Amazon may also ask for an FNSKU label on FBA stock, which is a separate Amazon-only code.'
      },
      {
        q: 'Do I need a new barcode if I change the packaging?',
        a: 'Usually not for a small design change. A new number is needed when the product changes in a way buyers or stores need to tell apart, such as a different size, quantity or variant. GS1 publishes detailed rules for when a new GTIN is required.'
      }
    ]
  }
];

function generateArticleHtml(article) {
  const pageUrl = `${SITE_URL}/pages/${article.slug}.html`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.h1,
    "description": article.metaDescription,
    "url": pageUrl,
    "mainEntityOfPage": pageUrl,
    "datePublished": article.datePublished,
    "author": { "@type": "Organization", "name": "UniversalCodeMaker", "url": `${SITE_URL}/` },
    "publisher": { "@type": "Organization", "name": "UniversalCodeMaker", "url": `${SITE_URL}/` },
    "image": `${SITE_URL}/assets/og-preview.png`
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": article.name, "item": pageUrl }
    ]
  };

  const ctasHtml = article.ctas.map(c => `
        <a href="${c.href}" class="cta-launch-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          ${c.label}
        </a>`).join('');

  const tocHtml = article.sections.map(s => `
          <li><a href="#${s.id}">${s.h2}</a></li>`).join('');

  const sectionsHtml = article.sections.map(s => `
    <section class="article-section" id="${s.id}" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title">${s.h2}</h2>
      ${s.html.trim()}
    </section>`).join('\n');

  const faqItemsHtml = article.faqs.map((f, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">▼</span>
      </summary>
      <div class="faq-answer">
        <p>${f.a}</p>
      </div>
    </details>
  `).join('');

  return `${headTopHtml(article, pageUrl)}
${PAGE_STYLES}

  <!-- Structured Data JSON-LD Schemas -->
  <script type="application/ld+json">
    ${JSON.stringify(articleJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(faqJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(breadcrumbJsonLd, null, 2)}
  </script>
</head>
<body>

${siteHeaderHtml(article.queryParam)}

  <main class="seo-page-container">

    <section class="hero-banner">
      <div class="hero-badge">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
        ${article.badge}
      </div>
      <h1 class="hero-title">${article.h1}</h1>
      <p class="hero-lead">${article.lead}</p>
      <div class="article-ctas">${ctasHtml}
      </div>
    </section>

    <div class="article-layout">
      <nav class="article-toc" aria-label="On this page">
        <h2>On this page</h2>
        <ol>${tocHtml}
          <li><a href="#faq">Frequently asked questions</a></li>
        </ol>
      </nav>

      <article class="article-body">
${sectionsHtml}
      </article>
    </div>

    <section class="faq-section" id="faq">
      <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary);">Frequently Asked Questions</h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

  </main>

${SITE_FOOTER_HTML}
</body>
</html>`;
}

// Shared page chrome: the same <head> start, styles, header and footer for landing pages and guide pages.
// `meta` needs metaTitle and metaDescription; `pageUrl` is the canonical URL.
function headTopHtml(meta, pageUrl) {
  const page = meta;
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <!-- Google tag (gtag.js) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-0MD85STYZT');
    // gtag.js loads after the page has rendered so it doesn't compete with CSS/fonts on slow mobile connections
    window.addEventListener('load', function () {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-0MD85STYZT';
      document.head.appendChild(s);
    });
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.metaTitle}</title>
  <meta name="description" content="${page.metaDescription}">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

  <meta name="theme-color" content="#06b6d4">

  <!-- Favicons & App Icons (Google Search & Multi-Platform Compliant) -->
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/icon-192.png">
  <link rel="alternate icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
  <link rel="shortcut icon" href="../favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">

  <!-- Open Graph & Social -->
  <meta property="og:title" content="${page.metaTitle}">
  <meta property="og:description" content="${page.metaDescription}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE_URL}/assets/og-preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.metaTitle}">
  <meta name="twitter:description" content="${page.metaDescription}">
  <meta name="twitter:image" content="${SITE_URL}/assets/og-preview.png">

  <!-- Self-hosted fonts (declared in ../css/v2-theme.css); preload visible above the fold -->
  <link rel="preload" href="../assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin>

  <link rel="stylesheet" href="../css/v2-theme.css?v=${ASSET_VERSION}">
  <link rel="stylesheet" href="../css/v2-pages.css?v=${ASSET_VERSION}">

  <script>
    (function () {
      const savedTheme = localStorage.getItem('ucm_theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const savedAccent = localStorage.getItem('ucm_accent') || 'crimson';
      document.documentElement.setAttribute('data-accent', savedAccent);
    })();
  </script>
`;
}

const PAGE_STYLES = `  <style>
    .seo-page-container {
      max-width: 1080px;
      margin: 2.25rem auto 4rem;
      padding: 0 1.5rem;
    }
    .hero-banner {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-ink);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: var(--optic-blue-tint);
      border: 1.5px solid var(--optic-blue);
      border-radius: var(--radius-full);
      color: var(--accent-text); /* text-safe on the tint in both themes */
      font-size: 0.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    .hero-lead {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 820px;
      margin-bottom: 1.75rem;
    }
    .cta-launch-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--accent-fill);
      color: #ffffff;
      padding: 0.85rem 1.6rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: var(--shadow-ink);
      transition: all var(--transition-fast);
    }
    .cta-launch-btn:hover {
      background: var(--accent-fill-hover);
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-laser);
      color: #ffffff;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
    }
    .info-card {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-ink);
      padding: 1.5rem;
    }
    .info-card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .spec-table {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.85rem;
    }
    .spec-key {
      color: var(--text-secondary);
      font-weight: 600;
    }
    .spec-val {
      font-family: var(--font-mono);
      color: var(--text-primary);
      font-weight: 600;
      text-align: right;
    }
    .use-cases-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 0;
      margin: 0;
    }
    .use-case-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }
    .use-case-check {
      color: var(--optic-blue);
      font-weight: 700;
    }
    .faq-section {
      margin-bottom: 3rem;
    }
    .faq-item {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-ink);
      margin-bottom: 0.75rem;
      overflow: hidden;
      transition: all var(--transition-fast);
    }
    .faq-item[open] {
      border-color: var(--border-color);
    }
    .faq-question {
      padding: 1rem 1.25rem;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-primary);
      user-select: none;
    }
    .faq-answer {
      padding: 0 1.25rem 1.1rem 1.25rem;
      color: var(--text-secondary);
      font-size: 0.88rem;
      line-height: 1.6;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .related-card {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-ink);
      padding: 1rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all var(--transition-fast);
    }
    .related-card:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-blue);
      border-color: var(--optic-blue);
    }
    .related-tag {
      font-size: 0.72rem;
      color: var(--optic-blue);
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .related-title {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .related-arrow {
      color: var(--optic-blue);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
    }
    .hardware-box {
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-ink);
      padding: 1.25rem 1.5rem;
      margin: 2.25rem 0 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .hardware-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .hardware-box-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .hardware-box-disclosure {
      font-size: 0.74rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .hardware-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }
    .hardware-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      background: var(--surface);
      border: var(--border-ink);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      box-shadow: 2px 2px 0 var(--border-color);
      transition: all var(--transition-fast);
    }
    .hardware-pill:hover {
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 var(--scanner-laser);
      border-color: var(--scanner-laser);
      color: var(--laser-text);
    }
  </style>`;

// `queryParam` sets which format/QR type the "Launch Studio" button opens.
function siteHeaderHtml(queryParam) {
  const page = { queryParam };
  return `  <!-- Site Header -->
  <header class="v2-header">
    <div class="wrap">
      <div class="v2-header-container">
        <a href="../index.html" class="v2-brand">
          <div class="v2-brand-badge" style="background: var(--surface);">
            <img src="../assets/logo-icon.png" alt="UniversalCodeMaker Logo" width="34" height="34" style="display: block; object-fit: contain;">
          </div>
          <div>
            <div class="v2-brand-title">
              UniversalCodeMaker
              <span class="v2-version-tag">FREE</span>
            </div>
            <span class="v2-brand-tagline">Precision Optical Barcode &amp; Custom QR Suite</span>
          </div>
        </a>

        <div class="v2-nav-links">
          <a href="../index.html?${page.queryParam}" class="btn btn-laser btn-sm" style="text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Launch Studio
          </a>
          <a href="../about.html" class="v2-nav-link">About</a>
          <a href="../symbology-docs.html" class="v2-nav-link">Docs</a>
          <a href="../barcode-scanner.html" class="v2-nav-link">Scanner</a>
          <div class="v2-accent-picker" title="Tactical Optics Accent Palette" aria-label="Tactical Optics Accent Palette">
            <button type="button" class="accent-dot active" data-accent="crimson" title="Laser Crimson"></button>
            <button type="button" class="accent-dot" data-accent="cobalt" title="Signal Cobalt"></button>
            <button type="button" class="accent-dot" data-accent="amber" title="Cyber Amber"></button>
            <button type="button" class="accent-dot" data-accent="emerald" title="Matrix Emerald"></button>
          </div>
          <button type="button" class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Toggle Optical Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span>Obsidian Laser</span>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

const SITE_FOOTER_HTML = `  <!-- Site Footer -->
  <footer class="v2-footer">
    <div class="wrap">
      <!-- Same footer as the studio and root pages (keep in sync with index.html) -->
      <div class="footer-top">
        <div class="footer-brand">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div class="v2-brand-badge" style="width: 38px; height: 38px; background: var(--surface);">
              <img src="../assets/logo-icon.png" alt="UniversalCodeMaker Logo" width="30" height="30" style="display: block; object-fit: contain;">
            </div>
            <div class="v2-brand-title">
              UniversalCodeMaker <span class="v2-version-tag">V2</span>
            </div>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
            100% Client-Side QR &amp; Barcode Engineering Studio. Built with zero tracking redirects, zero paywalls, and uncompromising optical precision.
          </p>
        </div>

        <div class="footer-links-group">
          <div class="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="../index.html">Optical Studio</a></li>
              <li><a href="../index.html#symbologies">Symbologies Directory</a></li>
              <li><a href="../barcode-scanner.html">Barcode &amp; QR Scanner</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Standards &amp; Docs</h4>
            <ul>
              <li><a href="../symbology-docs.html">Symbology Documentation</a></li>
              <li><a href="../about.html">About &amp; Mission</a></li>
              <li><a href="../privacy-policy.html">Zero-Knowledge Privacy</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Ecosystem</h4>
            <ul>
              <li><a href="https://primordialparadigm.com" target="_blank" rel="noopener">Primordial Paradigm ↗</a></li>
              <li><a href="../contact.html">Report Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 5-Column Programmatic SEO & Symbology Directory Matrix -->
      <div class="v2-footer-matrix">
        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Retail &amp; Publishing
          </h4>
          <ul>
            <li><a href="./ean-13-barcode-generator.html">EAN-13 Barcode Generator</a></li>
            <li><a href="./upc-a-barcode-generator.html">UPC-A Barcode Generator</a></li>
            <li><a href="./isbn-book-barcode-generator.html">ISBN Bookland Barcode</a></li>
            <li><a href="./shopify-barcode-generator.html">Shopify Product Barcode</a></li>
            <li><a href="./amazon-fba-fnsku-barcode-generator.html">Amazon FBA / FNSKU Barcode</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Logistics, Sheets &amp; Bulk
          </h4>
          <ul>
            <li><a href="./avery-5160-barcode-generator.html">Avery 5160 Label Generator</a></li>
            <li><a href="./bulk-barcode-generator-excel.html">Bulk Excel Barcode Generator</a></li>
            <li><a href="./code-128-barcode-generator.html">Code 128 Shipping Barcode</a></li>
            <li><a href="./code-39-barcode-generator.html">Code 39 Asset Barcode</a></li>
            <li><a href="./itf-14-barcode-generator.html">ITF-14 Carton Barcode</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            2D Industrial &amp; Density
          </h4>
          <ul>
            <li><a href="./data-matrix-generator.html">Data Matrix 2D Generator</a></li>
            <li><a href="./aztec-code-generator.html">Aztec Code Generator</a></li>
            <li><a href="./pdf417-barcode-generator.html">PDF417 Barcode Generator</a></li>
            <li><a href="../symbology-docs.html">Barcode &amp; QR Symbology Guides</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sensor-green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Smart QR Generators
          </h4>
          <ul>
            <li><a href="./google-reviews-qr-code-generator.html">Google Reviews 5-Star QR</a></li>
            <li><a href="./upi-qr-code-generator.html">UPI Scan-to-Pay QR</a></li>
            <li><a href="./wifi-qr-code-generator.html">Wi-Fi Network QR Code</a></li>
            <li><a href="./vcard-qr-code-generator.html">vCard Digital Contact QR</a></li>
            <li><a href="./google-maps-location-qr-code-generator.html">Google Maps Location QR</a></li>
            <li><a href="./crypto-qr-code-generator.html">Crypto Wallet QR Code</a></li>
            <li><a href="./calendar-event-qr-code-generator.html">Calendar Event (iCal) QR</a></li>
          </ul>
        </div>

        <div class="v2-dir-col">
          <h4 style="display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messaging &amp; Text QR
          </h4>
          <ul>
            <li><a href="./whatsapp-qr-code-generator.html">WhatsApp Direct Chat QR</a></li>
            <li><a href="./email-qr-code-generator.html">Email Message QR Code</a></li>
            <li><a href="./sms-qr-code-generator.html">SMS Direct Message QR</a></li>
            <li><a href="./phone-call-qr-code-generator.html">Phone Call Dialer QR</a></li>
            <li><a href="./plain-text-qr-code-generator.html">Plain Text QR Code</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 UniversalCodeMaker.com. Client-Side Code Generator. 100% Free Forever.</p>
        <ul class="v2-footer-legal-links">
          <li><a href="../terms.html">Terms of Service</a></li>
          <li><a href="../privacy-policy.html">Privacy Policy</a></li>
          <li><a href="../symbology-docs.html">Symbology Docs</a></li>
          <li><a href="../about.html">About Us</a></li>
          <li><a href="../contact.html">Contact Us</a></li>
        </ul>
        <div class="v2-trademark-notice">
          QR Code is a registered trademark of DENSO WAVE INCORPORATED. Avery&reg; and Avery template numbers are registered trademarks of Avery Products Corporation / CCL Industries Inc. GS1, EAN, and UPC are registered trademarks of GS1 AISBL. Amazon, Amazon FBA, and FNSKU are registered trademarks of Amazon.com, Inc. or its affiliates. Google and Google Reviews are trademarks of Google LLC. WhatsApp is a registered trademark of Meta Platforms, Inc. UPI is a registered trademark of NPCI. All product and company names are trademarks&trade; or registered&reg; trademarks of their respective holders; use does not imply any affiliation or endorsement.
        </div>
      </div>
    </div>
  </footer>

  <!-- Navigation & Theme Sync Script -->
  <script src="../js/v2-nav.js?v=2.4"></script>

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3988564922048072" crossorigin="anonymous"></script>
`;

function generatePageHtml(page) {
  const pageUrl = `${SITE_URL}/pages/${page.slug}.html`;
  const enrichment = ENRICHMENTS[page.slug] || {};
  const benefits = enrichment.benefits || [];
  const decisionGuide = enrichment.decisionGuide || [];
  const legalCaution = enrichment.legalCaution || null;
  const authorityLinks = enrichment.authorityLinks || [];
  const guide = GUIDES[page.slug] || null;
  const faqs = [...page.faqs, ...((guide && guide.moreFaqs) || [])];

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${page.name} - UniversalCodeMaker.com`,
    "url": pageUrl,
    "description": page.metaDescription,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Works in all modern browsers.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": page.name,
        "item": pageUrl
      }
    ]
  };

  const faqItemsHtml = faqs.map((f, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">▼</span>
      </summary>
      <div class="faq-answer">
        <p>${f.a}</p>
      </div>
    </details>
  `).join('');

  const specsListHtml = page.technicalSpec ? Object.entries(page.technicalSpec).map(([k, v]) => `
    <div class="spec-row">
      <dt class="spec-key">${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</dt>
      <dd class="spec-val">${v}</dd>
    </div>
  `).join('') : '';

  const useCasesHtml = page.useCases ? page.useCases.map(u => `
    <li class="use-case-item">
      <span class="use-case-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <span>${u}</span>
    </li>
  `).join('') : '';

  const relatedPagesHtml = SEO_PAGES.filter(p => p.slug !== page.slug).slice(0, 6).map(p => `
    <a href="./${p.slug}.html" class="related-card">
      <span class="related-tag">${p.category}</span>
      <span class="related-title">
        <span>${p.name}</span>
        <span class="related-arrow"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </span>
    </a>
  `).join('');

  const benefitsHtml = benefits.map(b => `
    <div class="benefit-card">
      <div class="benefit-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <h4>${b.title}</h4>
      </div>
      <p>${b.desc}</p>
    </div>
  `).join('');

  const decisionGuideHtml = decisionGuide.map(d => `
    <div class="decision-item">
      <h3 style="display: flex; align-items: center; gap: 0.45rem;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>${d.q}</span>
      </h3>
      <p>${d.a}</p>
    </div>
  `).join('');

  const cautionPointsHtml = legalCaution ? legalCaution.points.map(p => `
    <li>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 0.15rem;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>${p}</span>
    </li>
  `).join('') : '';

  const authorityLinksHtml = authorityLinks.map(a => `
    <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="authority-link-item">
      <div class="authority-link-title">
        <span>${a.name}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </div>
      <div class="authority-link-desc">${a.desc}</div>
    </a>
  `).join('');

  const isQrPage = page.category === 'Smart QR' || page.category === 'Smart QR Codes' || page.slug.includes('qr');
  let hardwareItemsHtml = '';
  if (page.slug.includes('avery-5160')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=avery+5160+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M6 8h12M6 12h12M6 16h8"/></svg>
        <span>Avery 5160 Labels (3,000 pk)</span>
      </a>
      <a href="https://www.amazon.com/s?k=hp+laserjet+pro+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>HP LaserJet Pro Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Wireless Barcode Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=avery+5163+shipping+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Avery 5163 Shipping Labels</span>
      </a>
    `;
  } else if (page.slug.includes('isbn')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=postal+shipping+scale&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 12v3"/><circle cx="12" cy="12" r="1"/></svg>
        <span>Postal Shipping Scale</span>
      </a>
      <a href="https://www.amazon.com/s?k=brother+monochrome+laser+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Brother Laser Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=bubble+mailer+envelopes+book&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Padded Book Mailers</span>
      </a>
      <a href="https://www.amazon.com/s?k=usb+handheld+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>USB Barcode Reader</span>
      </a>
    `;
  } else if (page.slug.includes('code-39')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=industrial+barcode+scanner+heavy+duty&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Industrial Laser Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=weatherproof+asset+tags+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <span>Weatherproof Asset Labels</span>
      </a>
      <a href="https://www.amazon.com/s?k=zebra+thermal+desktop+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Zebra Desktop Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Bluetooth Handheld Scanner</span>
      </a>
    `;
  } else if (page.slug.includes('bulk-barcode')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=munbyn+thermal+label+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>MUNBYN Commercial Thermal Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels+4x6&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Fanfold Thermal Labels (4\" × 6\")</span>
      </a>
      <a href="https://www.amazon.com/s?k=zebra+zd421+thermal+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Zebra ZD421 Industrial Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>High-Speed Desktop Scanner</span>
      </a>
    `;
  } else if (page.slug.includes('shopify')) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=bluetooth+thermal+barcode+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Bluetooth Thermal Label Printer</span>
      </a>
      <a href="https://www.amazon.com/s?k=wireless+pos+barcode+scanner+ipad&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>Shopify POS Wireless Scanner</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels+2.25x1.25&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>2.25\" × 1.25\" Price Tag Rolls</span>
      </a>
      <a href="https://www.amazon.com/s?k=acrylic+pos+countertop+sign+holder&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>Acrylic POS Display Stands</span>
      </a>
    `;
  } else if (isQrPage) {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=acrylic+qr+code+sign+holder&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>Acrylic QR Countertop Stands</span>
      </a>
      <a href="https://www.amazon.com/s?k=thermal+receipt+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Thermal Receipt Printers</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>2D QR Scanners</span>
      </a>
      <a href="https://www.amazon.com/s?k=printable+vinyl+sticker+paper&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <span>Weatherproof Sticker Paper</span>
      </a>
    `;
  } else {
    hardwareItemsHtml = `
      <a href="https://www.amazon.com/s?k=thermal+barcode+printer&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Thermal Label Printers</span>
      </a>
      <a href="https://www.amazon.com/s?k=avery+5160+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M6 8h12M6 12h12M6 16h8"/></svg>
        <span>Avery 5160 Labels (30-Up)</span>
      </a>
      <a href="https://www.amazon.com/s?k=2D+bluetooth+barcode+scanner&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
        <span>2D Bluetooth Scanners</span>
      </a>
      <a href="https://www.amazon.com/s?k=direct+thermal+labels&tag=universal0d96-20" target="_blank" rel="noopener noreferrer sponsored" class="hardware-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Thermal Shipping Rolls</span>
      </a>
    `;
  }

  return `${headTopHtml(page, pageUrl)}
${PAGE_STYLES}

  <!-- Structured Data JSON-LD Schemas -->
  <script type="application/ld+json">
    ${JSON.stringify(webAppJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(faqJsonLd, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(breadcrumbJsonLd, null, 2)}
  </script>
</head>
<body>

${siteHeaderHtml(page.queryParam)}

  <main class="seo-page-container">

    <!-- Hero Section -->
    <section class="hero-banner">
      <div class="hero-badge">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
        ${page.category} Standard
      </div>
      <h1 class="hero-title">${page.h1}</h1>
      <p class="hero-lead">${page.lead}</p>
      
      <a href="../index.html?${page.queryParam}" class="cta-launch-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Generate ${page.shortName} Now (Instant & Free)
      </a>
    </section>

    <!-- Technical Specs & Use Cases Grid -->
    <section class="content-grid">
      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
          Technical Specifications
        </h2>
        <dl class="spec-table">
          ${specsListHtml}
        </dl>
      </div>

      <div class="info-card">
        <h2 class="info-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
          Standard Industry Use Cases
        </h2>
        <ul class="use-cases-list">
          ${useCasesHtml}
        </ul>
      </div>
    </section>

    ${guide ? `<!-- Practical guide: how to make it, print it, and what to avoid -->
    <section class="guide-card" aria-labelledby="guide-title">
      <h2 id="guide-title" class="guide-title">${guide.title || `How to Make, Print &amp; Test Your ${page.shortName} Code`}</h2>
      <div class="guide-grid">
        <div class="guide-block guide-steps">
          <h3>Step by step</h3>
          <ol>
            ${guide.howTo.map(step => `<li>${step}</li>`).join('\n            ')}
          </ol>
          <a href="../index.html?${page.queryParam}" class="guide-cta">Open the ${page.shortName} generator &rarr;</a>
        </div>
        <div class="guide-block">
          <h3>Printing &amp; size</h3>
          <ul>
            ${guide.print.map(tip => `<li>${tip}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="guide-block guide-mistakes">
          <h3>Common mistakes</h3>
          <ul>
            ${guide.mistakes.map(m => `<li>${m}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </section>
    ` : ''}
    <!-- Recommended Hardware & Supplies Banner (Amazon Associates) -->
    <section class="hardware-box">
      <div class="hardware-box-header">
        <div class="hardware-box-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          Recommended Hardware &amp; Supplies
        </div>
        <div class="hardware-box-disclosure">
          UniversalCodeMaker is an Amazon Associate. As an Amazon Associate, we earn from qualifying purchases.
        </div>
      </div>
      <div class="hardware-pills-row">
        ${hardwareItemsHtml}
      </div>
    </section>

    <!-- Why Choose This Format / Key Benefits -->
    ${benefits.length > 0 ? `
    <section style="margin: 2.5rem 0 2rem;">
      <h2 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Key Benefits of ${page.shortName}
      </h2>
      <div class="benefits-grid">
        ${benefitsHtml}
      </div>
    </section>
    ` : ''}

    <!-- Customer Logistics & Product Decision Guide -->
    ${decisionGuide.length > 0 ? `
    <section class="decision-card">
      <div class="decision-header">
        <h2 style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          What Code Do I Need for My Product? (Customer Decision Guide)
        </h2>
      </div>
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
        Choosing the right barcode format depends on where your product is sold, the packaging substrate, and scanner infrastructure:
      </p>
      <div class="decision-grid">
        ${decisionGuideHtml}
      </div>
    </section>
    ` : ''}

    <!-- Legal Compliance, Registration Rules & Cautions -->
    ${legalCaution ? `
    <section class="caution-card ${page.category === 'Retail & POS' ? 'laser-alert' : ''}">
      <div class="caution-header">
        <span class="caution-badge ${page.category === 'Retail & POS' ? 'red' : ''}" style="display: inline-flex; align-items: center; gap: 0.4rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
          Legal &amp; Compliance Guide
        </span>
        <h3>${legalCaution.title}</h3>
      </div>
      <ul class="caution-list">
        ${cautionPointsHtml}
      </ul>
    </section>
    ` : ''}

    <!-- Official Standards & Authoritative Documentation -->
    ${authorityLinks.length > 0 ? `
    <section class="authority-card">
      <div class="authority-header">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sensor-green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Official Specifications &amp; Authoritative References
        </h3>
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">PUBLIC CITATIONS</span>
      </div>
      <div class="authority-links-grid">
        ${authorityLinksHtml}
      </div>
    </section>
    ` : ''}

    <!-- Interactive FAQ Section -->
    <section class="faq-section">
      <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--optic-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Frequently Asked Questions
      </h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

    <!-- Related Tools Cross-Links -->
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--scanner-laser)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Related Barcode &amp; QR Tools
      </h2>
      <div class="related-grid">
        ${relatedPagesHtml}
      </div>
    </section>

  </main>

${SITE_FOOTER_HTML}
</body>
</html>`;
}

// Generate pages
console.log('Generating Programmatic SEO pages...');
let generatedCount = 0;

SEO_PAGES.forEach(page => {
  const filePath = path.join(PAGES_DIR, `${page.slug}.html`);
  const html = generatePageHtml(page);
  fs.writeFileSync(filePath, html, 'utf8');
  generatedCount++;
  console.log(`Generated: pages/${page.slug}.html`);
});

ARTICLES.forEach(article => {
  fs.writeFileSync(path.join(PAGES_DIR, `${article.slug}.html`), generateArticleHtml(article), 'utf8');
  generatedCount++;
  console.log(`Generated: pages/${article.slug}.html (guide)`);
});

// Generate sitemap.xml
console.log('Generating sitemap.xml...');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

// <lastmod> = the date the page's content really last changed: today if it has uncommitted
// content edits, otherwise the newest commit that changed its content. Changes that only bump
// a cache-busting ?v= don't count. Stamping every URL with today's date on each run teaches
// Google to ignore our lastmod values.
const { execSync } = require('child_process');
const SITE_ROOT = path.join(__dirname, '..');
const GIT_OPTS = { cwd: SITE_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 };

function isContentChange(diff) {
  const changed = (sign) => diff.split('\n')
    .filter(l => l.startsWith(sign) && !l.startsWith(sign.repeat(3)))
    .map(l => l.slice(1).replace(/\?v=[0-9.]+/g, '?v=').trim())
    .sort()
    .join('\n');
  return changed('-') !== changed('+');
}

function lastmodOf(relPath) {
  try {
    if (isContentChange(execSync(`git diff HEAD -- "${relPath}"`, GIT_OPTS))) return today;
    const isTracked = execSync(`git ls-files -- "${relPath}"`, GIT_OPTS).trim();
    if (!isTracked) return today;
    const commits = execSync(`git log --format="%H %cs" -- "${relPath}"`, GIT_OPTS).trim().split('\n').filter(Boolean);
    for (const line of commits) {
      const [hash, date] = line.split(' ');
      if (isContentChange(execSync(`git show --format= ${hash} -- "${relPath}"`, GIT_OPTS))) return date;
    }
    return today;
  } catch (e) {
    return today;
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmodOf('index.html')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/symbology-docs.html</loc>
    <lastmod>${lastmodOf('symbology-docs.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/barcode-scanner.html</loc>
    <lastmod>${lastmodOf('barcode-scanner.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about.html</loc>
    <lastmod>${lastmodOf('about.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact.html</loc>
    <lastmod>${lastmodOf('contact.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms.html</loc>
    <lastmod>${lastmodOf('terms.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy.html</loc>
    <lastmod>${lastmodOf('privacy-policy.html')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
${SEO_PAGES.map(p => `  <url>
    <loc>${SITE_URL}/pages/${p.slug}.html</loc>
    <lastmod>${lastmodOf(`pages/${p.slug}.html`)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${ARTICLES.map(a => `  <url>
    <loc>${SITE_URL}/pages/${a.slug}.html</loc>
    <lastmod>${lastmodOf(`pages/${a.slug}.html`)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Saved sitemap.xml with ${(sitemapXml.match(/<loc>/g) || []).length} URLs.`);

console.log(`All ${generatedCount} pages (landing pages + guides) generated successfully!`);
