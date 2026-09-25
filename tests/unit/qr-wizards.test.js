/**
 * Smart QR Code Content Wizards Unit Tests
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Verifies all 10 QR wizards compile correct industry-standard payloads,
 * handle character escaping, and apply parameter encodings.
 */

import { QR_WIZARDS, getAllWizards, getWizard } from '../../js/wizards/qr-wizards.js';

export async function runWizardTests(assert) {
  // Test 1: Registry check
  const allWizards = getAllWizards();
  assert.equal(allWizards.length, 13, 'Registry contains exactly 13 Smart QR wizards');
  assert.isTrue(allWizards.every(w => w.id && w.name && w.icon && typeof w.compile === 'function'), 'All wizards conform to wizard interface');

  // Test 2: URL Wizard
  const urlWz = getWizard('url');
  assert.equal(urlWz.compile({ url: 'https://mysite.org' }), 'https://mysite.org', 'Preserves https URL');
  assert.equal(urlWz.compile({ url: 'http://insecure.site' }), 'http://insecure.site', 'Preserves http URL');
  assert.equal(urlWz.compile({ url: 'google.com' }), 'https://google.com', 'Prepends https:// to bare domains');
  assert.equal(urlWz.compile({ url: '' }), 'https://example.com', 'Provides default URL on empty string');

  // Test 3: Wi-Fi Wizard (WPA, WEP, Open, Hidden, Escaping)
  const wifiWz = getWizard('wifi');
  assert.equal(
    wifiWz.compile({ ssid: 'HomeNet', password: 'SecretPassword', encryption: 'WPA', hidden: false }),
    'WIFI:S:HomeNet;T:WPA;P:SecretPassword;H:false;;',
    'Compiles standard WPA Wi-Fi payload'
  );
  assert.equal(
    wifiWz.compile({ ssid: 'Cafe;Guest:5G', password: 'P@ss;w"o,rd\\', encryption: 'WPA', hidden: true }),
    'WIFI:S:Cafe\\;Guest\\:5G;T:WPA;P:P@ss\\;w\\"o\\,rd\\\\;H:true;;',
    'Escapes special delimiter characters (; , : " \\) in Wi-Fi SSID and password'
  );
  assert.equal(
    wifiWz.compile({ ssid: 'AirportOpen', password: 'ignored', encryption: 'nopass', hidden: false }),
    'WIFI:S:AirportOpen;T:nopass;P:;H:false;;',
    'Leaves password empty for open/nopass Wi-Fi networks'
  );

  // Test 4: vCard 3.0 Wizard
  const vcardWz = getWizard('vcard');
  const vcardPayload = vcardWz.compile({
    firstName: 'Jane',
    lastName: 'Doe',
    organization: 'Acme Corp',
    title: 'Chief Engineer',
    phone: '+1-555-0199',
    email: 'jane@acme.com',
    website: 'https://acme.com',
    address: '100 Market St, San Francisco'
  });
  assert.isTrue(vcardPayload.startsWith('BEGIN:VCARD\nVERSION:3.0'), 'vCard begins with standard 3.0 header');
  assert.isTrue(vcardPayload.includes('N:Doe;Jane;;;'), 'vCard contains structured N field');
  assert.isTrue(vcardPayload.includes('FN:Jane Doe'), 'vCard contains formatted FN field');
  assert.isTrue(vcardPayload.includes('ORG:Acme Corp'), 'vCard contains ORG field');
  assert.isTrue(vcardPayload.includes('TITLE:Chief Engineer'), 'vCard contains TITLE field');
  assert.isTrue(vcardPayload.includes('TEL;TYPE=WORK,VOICE:+1-555-0199'), 'vCard contains TEL field');
  assert.isTrue(vcardPayload.includes('EMAIL;TYPE=PREF,INTERNET:jane@acme.com'), 'vCard contains EMAIL field');
  assert.isTrue(vcardPayload.includes('URL:https://acme.com'), 'vCard contains URL field');
  assert.isTrue(vcardPayload.endsWith('END:VCARD'), 'vCard terminates with END:VCARD');

  // Test 5: Email (mailto) Wizard
  const emailWz = getWizard('email');
  assert.equal(
    emailWz.compile({ email: 'info@domain.com', subject: '', body: '' }),
    'mailto:info@domain.com',
    'Compiles simple mailto address'
  );
  assert.equal(
    emailWz.compile({ email: 'info@domain.com', subject: 'Project Inquiry', body: 'Hello there!' }),
    'mailto:info@domain.com?subject=Project%20Inquiry&body=Hello%20there!',
    'Encodes subject and body parameters in mailto URL'
  );

  // Test 6: SMS Wizard
  const smsWz = getWizard('sms');
  assert.equal(
    smsWz.compile({ phone: '+1 (555) 234-5678', message: 'Hello from QR' }),
    'smsto:+15552345678:Hello from QR',
    'Sanitizes phone digits and compiles smsto payload'
  );

  // Test 7: Phone (tel) Wizard
  const phoneWz = getWizard('phone');
  assert.equal(
    phoneWz.compile({ phone: '+1-800-555-0199' }),
    'tel:+18005550199',
    'Compiles standard tel URI'
  );

  // Test 8: Crypto Payment Wizard
  const cryptoWz = getWizard('crypto');
  assert.equal(
    cryptoWz.compile({ currency: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: '0.05' }),
    'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.05',
    'Compiles Bitcoin URI with amount'
  );
  assert.equal(
    cryptoWz.compile({ currency: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: '' }),
    'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'Compiles Bitcoin URI without amount'
  );
  assert.equal(
    cryptoWz.compile({ currency: 'ethereum', address: '0x00000000219ab540356cbb839cbe05303d7705fa', amount: '1.5' }),
    'ethereum:0x00000000219ab540356cbb839cbe05303d7705fa?value=1.5',
    'Compiles Ethereum URI with value parameter'
  );
  assert.equal(
    cryptoWz.compile({ currency: 'solana', address: 'SolanaWalletAddress123', amount: '10' }),
    'solana:SolanaWalletAddress123?amount=10',
    'Compiles Solana URI with amount parameter'
  );

  // Test 9: Calendar Event Wizard
  const eventWz = getWizard('event');
  const eventPayload = eventWz.compile({
    title: 'Launch Day',
    location: 'Headquarters',
    startDate: '2026-10-15T09:00',
    endDate: '2026-10-15T18:00',
    description: 'All-hands launch celebration'
  });
  assert.isTrue(eventPayload.includes('BEGIN:VCALENDAR'), 'Contains BEGIN:VCALENDAR');
  assert.isTrue(eventPayload.includes('BEGIN:VEVENT'), 'Contains BEGIN:VEVENT');
  assert.isTrue(eventPayload.includes('SUMMARY:Launch Day'), 'Contains event SUMMARY');
  assert.isTrue(eventPayload.includes('LOCATION:Headquarters'), 'Contains event LOCATION');
  assert.isTrue(eventPayload.includes('DTSTART:20261015T090000Z'), 'Formats start timestamp');
  assert.isTrue(eventPayload.includes('DTEND:20261015T180000Z'), 'Formats end timestamp');
  assert.isTrue(eventPayload.includes('END:VEVENT'), 'Contains END:VEVENT');

  // Test 10: Geolocation Wizard
  const geoWz = getWizard('location');
  assert.equal(
    geoWz.compile({ latitude: '37.774929', longitude: '-122.419416', query: 'SF Landmark' }),
    'https://maps.google.com/?q=37.774929,-122.419416(SF%20Landmark)',
    'Compiles Google Maps geolocation URI with query label'
  );

  // Test 11: Plain Text Wizard
  const textWz = getWizard('text');
  assert.equal(
    textWz.compile({ text: 'Simple Plain Text Note 12345' }),
    'Simple Plain Text Note 12345',
    'Compiles plain text verbatim'
  );

  // Test 12: Google Review Wizard
  const grWz = getWizard('google_review');
  assert.equal(
    grWz.compile({ reviewUrl: 'https://g.page/r/CbG9Z_test/review' }),
    'https://g.page/r/CbG9Z_test/review',
    'Preserves direct Google Review link'
  );
  assert.equal(
    grWz.compile({ reviewUrl: 'ChIJN1t_tDeuEmsRUsoyG83frY4' }),
    'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    'Compiles Google Place ID into writereview link'
  );

  // Test 13: WhatsApp Wizard
  const waWz = getWizard('whatsapp');
  assert.equal(
    waWz.compile({ phone: '+1 (555) 019-2834', message: 'Hello World!' }),
    'https://wa.me/15550192834?text=Hello%20World!',
    'Sanitizes phone number and URL-encodes WhatsApp message'
  );
  assert.equal(
    waWz.compile({ phone: '919876543210', message: '' }),
    'https://wa.me/919876543210',
    'Compiles WhatsApp URL without message query'
  );

  // Test 14: UPI Payment Wizard
  const upiWz = getWizard('upi');
  assert.equal(
    upiWz.compile({ vpa: 'shop@upi', payeeName: 'Store Name', amount: '250', note: 'Order #1' }),
    'upi://pay?pa=shop%40upi&pn=Store%20Name&cu=INR&am=250&tn=Order%20%231',
    'Compiles UPI payment link with amount and reference note'
  );
}
