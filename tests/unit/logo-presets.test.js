/**
 * Logo Presets Unit Tests
 * Verifies that built-in brand and utility presets provide valid, crisp SVG Data URLs.
 */

import { LOGO_PRESETS } from '../../js/core/logo-presets.js';

export async function runLogoPresetTests(assert) {
  // Test 1: Total presets count
  assert.equal(LOGO_PRESETS.length, 9, 'Contains exactly 9 logo presets');

  // Test 2: 'none' preset is empty
  const nonePreset = LOGO_PRESETS.find(p => p.id === 'none');
  assert.isTrue(!!nonePreset, 'None preset exists');
  assert.equal(nonePreset.dataUrl, '', 'None preset dataUrl is empty string');

  // Test 3: Wi-Fi preset validation
  const wifiPreset = LOGO_PRESETS.find(p => p.id === 'wifi');
  assert.isTrue(!!wifiPreset, 'Wi-Fi preset exists');
  assert.isTrue(wifiPreset.dataUrl.startsWith('data:image/svg+xml;utf8,'), 'Wi-Fi has SVG data URL');
  const wifiSvg = decodeURIComponent(wifiPreset.dataUrl.replace('data:image/svg+xml;utf8,', ''));
  assert.isTrue(wifiSvg.includes('viewBox="0 0 48 48"'), 'Wi-Fi has 48x48 viewBox');
  assert.isTrue(wifiSvg.includes('fill="#0284c7"'), 'Wi-Fi has official blue circle');
  assert.isTrue(wifiSvg.includes('stroke-linecap="round"'), 'Wi-Fi has rounded arc caps');
  assert.isTrue(wifiSvg.includes('<circle cx="24" cy="34" r="2.6" fill="#ffffff"/>'), 'Wi-Fi has solid filled center dot');

  // Test 4: WhatsApp preset validation
  const whatsappPreset = LOGO_PRESETS.find(p => p.id === 'whatsapp');
  assert.isTrue(!!whatsappPreset, 'WhatsApp preset exists');
  const whatsappSvg = decodeURIComponent(whatsappPreset.dataUrl.replace('data:image/svg+xml;utf8,', ''));
  assert.isTrue(whatsappSvg.includes('fill="#25D366"'), 'WhatsApp uses official green brand color');
  assert.isTrue(whatsappSvg.includes('fill="#ffffff"'), 'WhatsApp handset and bubble outline are white');
  assert.isTrue(!whatsappSvg.includes('<path d="M34 14a14 14 0'), 'Old inverted WhatsApp path is replaced');

  // Test 5: LinkedIn preset validation
  const linkedinPreset = LOGO_PRESETS.find(p => p.id === 'linkedin');
  assert.isTrue(!!linkedinPreset, 'LinkedIn preset exists');
  const linkedinSvg = decodeURIComponent(linkedinPreset.dataUrl.replace('data:image/svg+xml;utf8,', ''));
  assert.isTrue(linkedinSvg.includes('fill="#0A66C2"'), 'LinkedIn uses official brand blue');
  assert.isTrue(linkedinSvg.includes('rx="10"'), 'LinkedIn uses modern squircle badge');
  assert.isTrue(!linkedinSvg.includes('r="2.8"'), 'Old bulbous dot on i is replaced');

  // Test 6: Bitcoin preset validation
  const bitcoinPreset = LOGO_PRESETS.find(p => p.id === 'bitcoin');
  assert.isTrue(!!bitcoinPreset, 'Bitcoin preset exists');
  const bitcoinSvg = decodeURIComponent(bitcoinPreset.dataUrl.replace('data:image/svg+xml;utf8,', ''));
  assert.isTrue(bitcoinSvg.includes('fill="#F7931A"'), 'Bitcoin uses official gold/orange color');
  assert.isTrue(bitcoinSvg.includes('M23.189 14.02c.314-2.096'), 'Bitcoin uses official cryptocurrency-icons vector geometry');
  assert.isTrue(!bitcoinSvg.includes('M31.2 21.6c.4-2.5'), 'Old deformed Bitcoin trace is replaced');

  // Test 7: PayPal preset validation
  const paypalPreset = LOGO_PRESETS.find(p => p.id === 'paypal');
  assert.isTrue(!!paypalPreset, 'PayPal preset exists');
  const paypalSvg = decodeURIComponent(paypalPreset.dataUrl.replace('data:image/svg+xml;utf8,', ''));
  assert.isTrue(paypalSvg.includes('fill="#003087"'), 'PayPal uses official deep blue #003087');
  assert.isTrue(paypalSvg.includes('fill="#0079C1"'), 'PayPal uses official light blue #0079C1');
  assert.isTrue(paypalSvg.includes('fill="#00457C"'), 'PayPal uses official overlap blue #00457C');
  assert.isTrue(!paypalSvg.includes('<path d="M21 13h7c4 0'), 'Old muddy PayPal path is replaced');

  // Test 8: All presets have valid names, icons, and non-empty IDs
  LOGO_PRESETS.forEach(p => {
    assert.isTrue(typeof p.id === 'string' && p.id.length > 0, `Preset ${p.name} has valid id`);
    assert.isTrue(typeof p.name === 'string' && p.name.length > 0, `Preset ${p.id} has valid name`);
    assert.isTrue(typeof p.icon === 'string' && p.icon.length > 0, `Preset ${p.id} has icon`);
  });
}
