/**
 * Smart QR Code Payload Input Wizards & Formatters
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Compiles user-friendly form inputs into industry-standard QR payload strings:
 * - URL, Wi-Fi (WPA/WPA2/WEP/Open), vCard 3.0, Email (mailto), SMS (smsto),
 *   Phone (tel), Crypto (BTC/ETH/SOL/USDT), Calendar Event (iCal), Geolocation, Plain Text.
 */

/**
 * Escapes special characters for Wi-Fi and vCard strings (; , : " \)
 */
function escapeField(str = '') {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

export const QR_WIZARDS = {
  url: {
    id: 'url',
    name: 'Website URL',
    icon: '🌐',
    description: 'Direct link to any website, portfolio, or landing page.',
    fields: [
      {
        id: 'url',
        label: 'Website URL',
        type: 'url',
        placeholder: 'https://example.com',
        default: 'https://github.com',
        required: true
      }
    ],
    compile(data) {
      let url = (data.url || '').trim();
      if (url && !/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      return url || 'https://example.com';
    }
  },

  wifi: {
    id: 'wifi',
    name: 'Wi-Fi Network',
    icon: '📶',
    description: 'Instant zero-password scan-to-connect for iOS and Android devices.',
    fields: [
      {
        id: 'ssid',
        label: 'Network Name (SSID)',
        type: 'text',
        placeholder: 'e.g. Office_Guest_5G',
        default: 'CoffeeShop_Wi-Fi',
        required: true
      },
      {
        id: 'password',
        label: 'Wi-Fi Password',
        type: 'text',
        placeholder: 'Enter network password',
        default: 'SecretPassword123'
      },
      {
        id: 'encryption',
        label: 'Security / Encryption',
        type: 'select',
        options: [
          { label: 'WPA / WPA2 / WPA3 (Default)', value: 'WPA' },
          { label: 'WEP (Legacy)', value: 'WEP' },
          { label: 'None / Open Network', value: 'nopass' }
        ],
        default: 'WPA'
      },
      {
        id: 'hidden',
        label: 'Hidden Network',
        type: 'checkbox',
        default: false
      }
    ],
    compile(data) {
      const ssid = escapeField(data.ssid || 'Wi-Fi');
      const type = data.encryption || 'WPA';
      const pass = type === 'nopass' ? '' : escapeField(data.password || '');
      const hidden = data.hidden ? 'true' : 'false';
      return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
    }
  },

  vcard: {
    id: 'vcard',
    name: 'vCard Contact',
    icon: '👤',
    description: 'Digital business card that adds contacts directly to address books.',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Jane', default: 'Jane' },
      { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe', default: 'Doe' },
      { id: 'organization', label: 'Company / Organization', type: 'text', placeholder: 'Acme Corp', default: 'Acme Inc' },
      { id: 'title', label: 'Job Title', type: 'text', placeholder: 'Product Director', default: 'Director of Design' },
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 019-2834', default: '+1-555-019-2834' },
      { id: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com', default: 'jane.doe@example.com' },
      { id: 'website', label: 'Website', type: 'url', placeholder: 'https://janedoe.me', default: 'https://janedoe.me' },
      { id: 'address', label: 'Street Address & City', type: 'text', placeholder: '123 Market St, San Francisco, CA', default: '742 Evergreen Terrace, Springfield' }
    ],
    compile(data) {
      const fn = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Contact';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeField(data.lastName || '')};${escapeField(data.firstName || '')};;;`,
        `FN:${fn}`
      ];

      if (data.organization) lines.push(`ORG:${escapeField(data.organization)}`);
      if (data.title) lines.push(`TITLE:${escapeField(data.title)}`);
      if (data.phone) lines.push(`TEL;TYPE=WORK,VOICE:${data.phone}`);
      if (data.email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${data.email}`);
      if (data.website) lines.push(`URL:${data.website}`);
      if (data.address) lines.push(`ADR;TYPE=WORK:;;${escapeField(data.address)};;;;`);

      lines.push('END:VCARD');
      return lines.join('\n');
    }
  },

  email: {
    id: 'email',
    name: 'Email (mailto)',
    icon: '✉️',
    description: 'Pre-addressed email draft with subject line and body text.',
    fields: [
      { id: 'email', label: 'Recipient Email', type: 'email', placeholder: 'support@example.com', default: 'hello@company.com', required: true },
      { id: 'subject', label: 'Subject Line', type: 'text', placeholder: 'Project Inquiry', default: 'Inquiry from QR Code' },
      { id: 'body', label: 'Message Body', type: 'textarea', placeholder: 'Write message...', default: 'Hello,\n\nI scanned your QR code and would like to learn more.' }
    ],
    compile(data) {
      const to = (data.email || '').trim();
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
    }
  },

  sms: {
    id: 'sms',
    name: 'SMS Message',
    icon: '💬',
    description: 'Pre-filled text message to a specific mobile number.',
    fields: [
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 234-5678', default: '+15552345678', required: true },
      { id: 'message', label: 'Text Message', type: 'textarea', placeholder: 'Pre-filled message...', default: 'YES RSVP' }
    ],
    compile(data) {
      const phone = (data.phone || '').replace(/[^0-9+]/g, '');
      const msg = data.message || '';
      return `smsto:${phone}:${msg}`;
    }
  },

  phone: {
    id: 'phone',
    name: 'Phone Call',
    icon: '📞',
    description: 'One-tap direct dial telephone number.',
    fields: [
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 800 555 0199', default: '+18005550199', required: true }
    ],
    compile(data) {
      const phone = (data.phone || '').replace(/[^0-9+]/g, '');
      return `tel:${phone}`;
    }
  },

  crypto: {
    id: 'crypto',
    name: 'Crypto Payment',
    icon: '🪙',
    description: 'Scan-to-pay wallet address for Bitcoin, Ethereum, Solana, and USDT.',
    fields: [
      {
        id: 'currency',
        label: 'Cryptocurrency',
        type: 'select',
        options: [
          { label: 'Bitcoin (BTC)', value: 'bitcoin' },
          { label: 'Ethereum (ETH)', value: 'ethereum' },
          { label: 'Solana (SOL)', value: 'solana' },
          { label: 'USDT (Tether)', value: 'usdt' }
        ],
        default: 'bitcoin'
      },
      { id: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Enter public wallet address...', default: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', required: true },
      { id: 'amount', label: 'Requested Amount (Optional)', type: 'number', placeholder: 'e.g. 0.05', default: '' }
    ],
    compile(data) {
      const curr = data.currency || 'bitcoin';
      const addr = (data.address || '').trim();
      const amt = data.amount ? String(data.amount).trim() : '';

      if (curr === 'bitcoin') {
        return `bitcoin:${addr}${amt ? `?amount=${amt}` : ''}`;
      } else if (curr === 'ethereum') {
        return `ethereum:${addr}${amt ? `?value=${amt}` : ''}`;
      } else if (curr === 'solana') {
        return `solana:${addr}${amt ? `?amount=${amt}` : ''}`;
      } else {
        return `usdt:${addr}${amt ? `?amount=${amt}` : ''}`;
      }
    }
  },

  event: {
    id: 'event',
    name: 'Calendar Event',
    icon: '📅',
    description: 'Add an event with date, time, and location to phone calendars.',
    fields: [
      { id: 'title', label: 'Event Title', type: 'text', placeholder: 'Annual Tech Conference', default: 'Global AI & Web Summit 2026', required: true },
      { id: 'location', label: 'Event Location', type: 'text', placeholder: 'Convention Center, Room 101', default: 'Moscone Center, San Francisco' },
      { id: 'startDate', label: 'Start Date & Time', type: 'datetime-local', default: '2026-10-15T09:00' },
      { id: 'endDate', label: 'End Date & Time', type: 'datetime-local', default: '2026-10-15T17:00' },
      { id: 'description', label: 'Notes / Description', type: 'textarea', placeholder: 'Details about the event...', default: 'Keynote sessions and workshops.' }
    ],
    compile(data) {
      const formatDT = (dtStr) => {
        if (!dtStr) return '20261015T090000Z';
        return dtStr.replace(/[-:]/g, '') + '00Z';
      };

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${data.title || 'Event'}`,
        data.location ? `LOCATION:${data.location}` : '',
        `DTSTART:${formatDT(data.startDate)}`,
        `DTEND:${formatDT(data.endDate)}`,
        data.description ? `DESCRIPTION:${data.description}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(Boolean).join('\n');
    }
  },

  location: {
    id: 'location',
    name: 'Geolocation & Maps',
    icon: '📍',
    description: 'Direct pinpoint on Google Maps or Apple Maps.',
    fields: [
      { id: 'latitude', label: 'Latitude', type: 'text', placeholder: '37.774929', default: '37.774929', required: true },
      { id: 'longitude', label: 'Longitude', type: 'text', placeholder: '-122.419416', default: '-122.419416', required: true },
      { id: 'query', label: 'Location Name / Label', type: 'text', placeholder: 'San Francisco City Hall', default: 'San Francisco Landmark' }
    ],
    compile(data) {
      const lat = (data.latitude || '0').trim();
      const lng = (data.longitude || '0').trim();
      const q = encodeURIComponent(data.query || '');
      return `https://maps.google.com/?q=${lat},${lng}${q ? `(${q})` : ''}`;
    }
  },

  text: {
    id: 'text',
    name: 'Plain Text',
    icon: '📝',
    description: 'Raw unformatted text, notes, serial numbers, or code snippets.',
    fields: [
      { id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Type or paste any text here...', default: 'Scan verified: Universal Barcode Suite 2026', required: true }
    ],
    compile(data) {
      return data.text || '';
    }
  },

  google_review: {
    id: 'google_review',
    name: 'Google Review',
    icon: '⭐',
    description: 'Direct link opening Google Maps rating dialog to collect 5-star customer reviews.',
    fields: [
      {
        id: 'reviewUrl',
        label: 'Google Review Link or Place ID',
        type: 'text',
        placeholder: 'https://g.page/r/.../review or Place ID (ChIJ...)',
        default: 'https://g.page/r/CbG9Z_test_review/review',
        required: true
      }
    ],
    compile(data) {
      let input = (data.reviewUrl || '').trim();
      if (!input) return 'https://search.google.com';
      if (/^https?:\/\//i.test(input)) {
        return input;
      }
      if (/^ChIJ/i.test(input)) {
        return `https://search.google.com/local/writereview?placeid=${input}`;
      }
      return `https://${input}`;
    }
  },

  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    description: 'Instant click-to-chat QR code with pre-filled greeting message for orders & support.',
    fields: [
      {
        id: 'phone',
        label: 'Phone Number (with Country Code)',
        type: 'tel',
        placeholder: 'e.g. 15551234567 or 919876543210 (digits only)',
        default: '15551234567',
        required: true
      },
      {
        id: 'message',
        label: 'Pre-filled Greeting Message (Optional)',
        type: 'textarea',
        placeholder: 'e.g. Hello! I would like more information on your services.',
        default: 'Hello! I scanned your QR code.'
      }
    ],
    compile(data) {
      const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
      const msg = (data.message || '').trim();
      if (!cleanPhone) return 'https://wa.me/';
      return msg 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/${cleanPhone}`;
    }
  },

  upi: {
    id: 'upi',
    name: 'UPI Pay',
    icon: '₹',
    description: 'Scan-to-pay QR code for Google Pay, PhonePe, Paytm & BHIM with preset amount.',
    fields: [
      {
        id: 'vpa',
        label: 'Merchant / Payee UPI ID (VPA)',
        type: 'text',
        placeholder: 'e.g. merchant@okhdfcbank or yourname@upi',
        default: 'store@upi',
        required: true
      },
      {
        id: 'payeeName',
        label: 'Payee / Business Name',
        type: 'text',
        placeholder: 'e.g. Corner Grocery & Bakery',
        default: 'Merchant Store'
      },
      {
        id: 'amount',
        label: 'Preset Amount (Optional, INR ₹)',
        type: 'text',
        placeholder: 'e.g. 150.00 (leave blank for any amount)',
        default: ''
      },
      {
        id: 'note',
        label: 'Payment Note / Reference',
        type: 'text',
        placeholder: 'e.g. Table 4 Order',
        default: 'UniversalCodeMaker Payment'
      }
    ],
    compile(data) {
      const vpa = (data.vpa || '').trim();
      if (!vpa) return 'upi://pay';
      const name = encodeURIComponent((data.payeeName || '').trim());
      const amount = (data.amount || '').trim().replace(/[^0-9.]/g, '');
      const note = encodeURIComponent((data.note || '').trim());
      let uri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${name || 'Merchant'}&cu=INR`;
      if (amount) uri += `&am=${amount}`;
      if (note) uri += `&tn=${note}`;
      return uri;
    }
  }
};

/**
 * Returns array of all wizard definitions
 */
export function getAllWizards() {
  return Object.values(QR_WIZARDS);
}

/**
 * Retrieves a wizard by id
 */
export function getWizard(id) {
  return QR_WIZARDS[id] || QR_WIZARDS.url;
}
