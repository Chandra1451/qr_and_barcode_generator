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

function generatePageHtml(page) {
  const pageUrl = `${SITE_URL}/pages/${page.slug}.html`;

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
