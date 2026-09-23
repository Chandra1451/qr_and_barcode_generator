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
      magnification: '80% to 200% (Standard nominal size: 37.29mm × 25.93mm)',
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
        a: 'If you are selling products in commercial supermarkets or retail chains, you must obtain authorized company prefixes from GS1. For internal inventory, internal POS systems, or private cataloging, you can freely assign numbers using prefixes 200–299.'
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
      magnification: '80% to 200% (Nominal size: 1.469" × 1.02")',
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
        a: 'Yes! Open the generator, click "PDF Labels", and choose from Avery 5160 (30 address labels) or Avery 5163 (10 shipping labels) to print directly onto standard label sheets.'
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
      aspectRatio: 'Strict 1:1 square matrix'
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
      standard: 'vCard 3.0 / 4.0 Specification',
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
    metaTitle: 'Free Google Maps Location QR Code Generator - Turn-by-Turn Directions',
    metaDescription: 'Generate location GPS QR codes linking directly to Google Maps navigation. Perfect for store locations, events, and real estate properties.',
    h1: 'Free Google Maps Location QR Code Generator',
    lead: 'Create instant navigation QR codes linking directly to your physical address or GPS coordinates in Google Maps or Apple Maps for immediate turn-by-turn directions.',
    technicalSpec: {
      uriFormat: 'https://maps.google.com/?q=latitude,longitude or query label',
      compatibility: 'Google Maps, Apple Maps, Waze'
    },
    useCases: [
      'Storefront window decals and retail shopping center directories',
      'Wedding venues, conference hall entrances, and festival grounds',
      'Real estate open house directional signs'
    ],
    faqs: [
      {
        q: 'Can I use latitude and longitude coordinates instead of an address?',
        a: 'Yes! Entering latitude and longitude coordinates pins the exact spot on satellite maps even if there is no registered street address.'
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
        "a": "EAN-13 is mandatory for selling consumer products in supermarkets and retail chains in over 150 countries."
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
        "Always maintain the mandatory Quiet Zones (3.63mm on the left, 2.31mm on the right). Truncating the barcode height or placing text inside the quiet zone will cause retail scanner rejections.",
        "Never print in low-contrast color combinations (e.g., red bars on white, or black bars on green). Laser scanners use red light and require a dark-on-light contrast ratio of at least 4:1."
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
        "url": "https://www.iso.org/standard/43654.html"
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
        "a": "UPC-A is the required retail barcode for all consumer packaged goods in the United States and Canada."
      },
      {
        "q": "Listing on Amazon North America (FBA)?",
        "a": "Amazon requires a valid 12-digit UPC or 13-digit EAN GTIN linked to your brand in the GS1 database."
      },
      {
        "q": "Need barcodes for shipping cartons or pallets?",
        "a": "Do not use UPC-A on corrugated outer shipping boxes. Use ITF-14 or GS1-128 for wholesale logistics."
      }
    ],
    "legalCaution": {
      "title": "GS1 US Registration & Legal Retail Requirements",
      "points": [
        "Commercial retail sale in North America requires licensing an authentic UPC company prefix from GS1 US. Third-party recycled UPCs may be rejected by Amazon and major retail chains.",
        "Maintain a minimum 9X module quiet zone on both sides of the barcode to prevent scanner beam clipping.",
        "Ensure 100% optical contrast. Barcode bars must be black or dark blue printed on a solid white or light neutral substrate."
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
        "url": "https://www.iso.org/standard/43654.html"
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
        "url": "https://www.iso.org/standard/43655.html"
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
        "url": "https://www.iso.org/standard/44230.html"
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
        "url": "https://www.iso.org/standard/41548.html"
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
        "url": "https://www.iso.org/standard/43897.html"
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
        "desc": "International standard for QR Code 2005 barcode symbology.",
        "url": "https://www.iso.org/standard/62021.html"
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
        "Compliant with IETF RFC 6350 (vCard 4.0) and RFC 2426 (vCard 3.0)."
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
        "Because the email is sent directly from the user’s personal mail client upon explicit confirmation, it is 100% compliant with global anti-spam regulations (CAN-SPAM, GDPR).",
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
        "title": "Instant Turn-by-Turn GPS Directions",
        "desc": "Directs smartphones straight into Google Maps, Apple Maps, or Waze."
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
        "Test your location coordinates in both Google Maps and Apple Maps before printing high-volume promotional signage.",
        "Ensure the location coordinates point to the public visitor entrance rather than private warehouse loading docks.",
        "Uses standard HTTPS Google Maps search URL schemes compliant with all mobile browsers."
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
        "url": "https://www.iso.org/standard/62021.html"
      }
    ]
  }
};

function generatePageHtml(page) {
  const pageUrl = `${SITE_URL}/pages/${page.slug}.html`;
  const enrichment = ENRICHMENTS[page.slug] || {};
  const benefits = enrichment.benefits || [];
  const decisionGuide = enrichment.decisionGuide || [];
  const legalCaution = enrichment.legalCaution || null;
  const authorityLinks = enrichment.authorityLinks || [];

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
    "mainEntity": page.faqs.map(f => ({
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

  const faqItemsHtml = page.faqs.map((f, i) => `
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
      <span class="use-case-check">✓</span>
      <span>${u}</span>
    </li>
  `).join('') : '';

  const relatedPagesHtml = SEO_PAGES.filter(p => p.slug !== page.slug).slice(0, 6).map(p => `
    <a href="./${p.slug}.html" class="related-card">
      <span class="related-tag">${p.category}</span>
      <span class="related-title">${p.name}</span>
      <span class="related-arrow">→</span>
    </a>
  `).join('');

  const benefitsHtml = benefits.map(b => `
    <div class="benefit-card">
      <div class="benefit-card-header">
        <span>⚡</span>
        <h4>${b.title}</h4>
      </div>
      <p>${b.desc}</p>
    </div>
  `).join('');

  const decisionGuideHtml = decisionGuide.map(d => `
    <div class="decision-item">
      <h3><span>👉</span> ${d.q}</h3>
      <p>${d.a}</p>
    </div>
  `).join('');

  const cautionPointsHtml = legalCaution ? legalCaution.points.map(p => `
    <li>
      <span style="color: var(--scanner-laser); font-weight: 800; font-size: 1.1rem; line-height: 1;">⚠</span>
      <span>${p}</span>
    </li>
  `).join('') : '';

  const authorityLinksHtml = authorityLinks.map(a => `
    <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="authority-link-item">
      <div class="authority-link-title">
        <span>${a.name}</span>
        <span>↗</span>
      </div>
      <div class="authority-link-desc">${a.desc}</div>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0MD85STYZT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-0MD85STYZT');
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

  <!-- Google Fonts: Non-blocking Preload -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
  </noscript>

  <link rel="stylesheet" href="../css/theme.css">
  <link rel="stylesheet" href="../css/main.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/v2-theme.css">
  <link rel="stylesheet" href="../css/v2-pages.css">

  <style>
    .seo-page-container {
      max-width: 1040px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .hero-banner {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: var(--radius-full);
      color: var(--accent-cyan);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .hero-title {
      font-size: 2.2rem;
      font-weight: 700;
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
      background: var(--accent-gradient);
      color: #ffffff;
      padding: 0.85rem 1.6rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }
    .cta-launch-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
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
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }
    .info-card-title {
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
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.85rem;
    }
    .spec-key {
      color: var(--text-muted);
      font-weight: 500;
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
      color: var(--accent-cyan);
      font-weight: 700;
    }
    .faq-section {
      margin-bottom: 3rem;
    }
    .faq-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      margin-bottom: 0.75rem;
      overflow: hidden;
      transition: border-color var(--transition-fast);
    }
    .faq-item[open] {
      border-color: var(--border-medium);
    }
    .faq-question {
      padding: 1rem 1.25rem;
      font-weight: 600;
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .related-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all var(--transition-fast);
    }
    .related-card:hover {
      background: var(--bg-surface-elevated);
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
    }
    .related-tag {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .related-title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.92rem;
    }
    .related-arrow {
      align-self: flex-end;
      color: var(--accent-cyan);
      font-weight: 700;
    }
  </style>

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

  <!-- App Header -->
  <header class="app-header">
    <div class="header-container">
      <a href="../index.html" class="brand-group">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">Code Generator</span>
          <span class="brand-tagline">UniversalCodeMaker.com • 100% Free Client-Side Suite</span>
        </div>
      </a>
      <div class="header-actions">
        <a href="../index.html?${page.queryParam}" class="cta-launch-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
          Open in Studio ⚡
        </a>
      </div>
    </div>
  </header>

  <main class="seo-page-container">

    <!-- Hero Section -->
    <section class="hero-banner">
      <div class="hero-badge">
        <span>●</span> ${page.category} Standard
      </div>
      <h1 class="hero-title">${page.h1}</h1>
      <p class="hero-lead">${page.lead}</p>
      
      <a href="../index.html?${page.queryParam}" class="cta-launch-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Generate ${page.shortName} Now (Instant & Free)
      </a>
    </section>

    <!-- Technical Specs & Use Cases Grid -->
    <section class="content-grid">
      <div class="info-card">
        <h2 class="info-card-title">
          <span>📐</span> Technical Specifications
        </h2>
        <dl class="spec-table">
          ${specsListHtml}
        </dl>
      </div>

      <div class="info-card">
        <h2 class="info-card-title">
          <span>🏭</span> Standard Industry Use Cases
        </h2>
        <ul class="use-cases-list">
          ${useCasesHtml}
        </ul>
      </div>
    </section>

    <!-- Why Choose This Format / Key Benefits -->
    ${benefits.length > 0 ? `
    <section style="margin: 2.5rem 0 2rem;">
      <h2 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <span>⚡</span> Key Benefits of ${page.shortName}
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
        <h2><span>🧭</span> What Code Do I Need for My Product? (Customer Decision Guide)</h2>
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
        <span class="caution-badge ${page.category === 'Retail & POS' ? 'red' : ''}">⚖️ Legal &amp; Compliance Guide</span>
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
        <h3><span>📚</span> Official Specifications &amp; Authoritative References</h3>
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">PUBLIC CITATIONS</span>
      </div>
      <div class="authority-links-grid">
        ${authorityLinksHtml}
      </div>
    </section>
    ` : ''}

    <!-- Interactive FAQ Section -->
    <section class="faq-section">
      <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary);">
        Frequently Asked Questions
      </h2>
      <div class="faq-accordion">
        ${faqItemsHtml}
      </div>
    </section>

    <!-- Related Tools Cross-Links -->
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
        Related Barcode & QR Tools
      </h2>
      <div class="related-grid">
        ${relatedPagesHtml}
      </div>
    </section>

  </main>

  <footer class="app-footer">
    <div class="footer-container">
      <p>&copy; 2026 UniversalCodeMaker.com. Client-side Code Generator. 100% Free Forever.</p>
      <ul class="footer-links">
        <li><a href="../">Code Generator</a></li>
        <li><a href="../symbology-docs.html">Symbology Docs</a></li>
        <li><a href="../about.html">About Us</a></li>
        <li><a href="../contact.html">Contact Us</a></li>
        <li><a href="../terms.html">Terms of Service</a></li>
        <li><a href="../privacy-policy.html">Privacy Policy</a></li>
      </ul>
    </div>
  </footer>

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3988564922048072" crossorigin="anonymous"></script>

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

// Generate sitemap.xml
console.log('Generating sitemap.xml...');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/symbology-docs.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
${SEO_PAGES.map(p => `  <url>
    <loc>${SITE_URL}/pages/${p.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Saved sitemap.xml with ${SEO_PAGES.length + 6} URLs.`);

console.log(`All ${generatedCount} SEO landing pages generated successfully!`);
