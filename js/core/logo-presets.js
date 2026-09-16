/**
 * Built-in Brand & Utility Logo Presets for Center QR Overlay
 * Universal QR, Barcode & Code Generator Suite
 * 
 * Provides lightweight, crisp, vector SVG Data URLs.
 */

function svgToDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const LOGO_PRESETS = [
  {
    id: 'none',
    name: 'None',
    icon: '🚫',
    dataUrl: ''
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    icon: '📶',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#0284c7"/>
        <path d="M 18.8 28.8 A 7.5 7.5 0 0 1 29.2 28.8 M 14.6 24.3 A 13.5 13.5 0 0 1 33.4 24.3 M 10.4 20.0 A 19.5 19.5 0 0 1 37.6 20.0" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="24" cy="34" r="2.6" fill="#ffffff"/>
      </svg>
    `)
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#25D366"/>
        <path fill="#ffffff" transform="translate(8.4, 8.4) scale(1.3)" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `)
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <defs>
          <radialGradient id="ig" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stop-color="#fdf497"/>
            <stop offset="5%" stop-color="#fdf497"/>
            <stop offset="45%" stop-color="#fd5949"/>
            <stop offset="60%" stop-color="#d6249f"/>
            <stop offset="90%" stop-color="#285AEB"/>
          </radialGradient>
        </defs>
        <rect width="46" height="46" x="1" y="1" rx="12" fill="url(#ig)"/>
        <rect width="26" height="26" x="11" y="11" rx="7" fill="none" stroke="#ffffff" stroke-width="3"/>
        <circle cx="24" cy="24" r="6.5" fill="none" stroke="#ffffff" stroke-width="3"/>
        <circle cx="31.5" cy="16.5" r="1.5" fill="#ffffff"/>
      </svg>
    `)
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="46" height="46" x="1" y="1" rx="10" fill="#0A66C2"/>
        <path fill="#ffffff" transform="translate(7.8, 7.8) scale(1.35)" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
      </svg>
    `)
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#FF0000"/>
        <path d="M34.5 19.2c-.3-1.2-1.3-2.1-2.5-2.4C29.8 16.2 24 16.2 24 16.2s-5.8 0-8 .6c-1.2.3-2.2 1.2-2.5 2.4C13 21.4 13 24 13 24s0 2.6.5 4.8c.3 1.2 1.3 2.1 2.5 2.4 2.2.6 8 .6 8 .6s5.8 0 8-.6c1.2-.3 2.2-1.2 2.5-2.4.5-2.2.5-4.8.5-4.8s0-2.6-.5-4.8z" fill="#ffffff"/>
        <polygon points="21,20.5 28.5,24 21,27.5" fill="#FF0000"/>
      </svg>
    `)
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: '₿',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#F7931A"/>
        <path fill="#ffffff" transform="translate(4.8, 4.8) scale(1.2)" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
      </svg>
    `)
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#003087"/>
        <path d="M21 13h7c4 0 6.5 2 5.8 5.7-.8 4.2-3.8 6.3-7.5 6.3h-2l-1.6 8H17L21 13z" fill="#0079C1"/>
        <path d="M19.5 19h5.5c3.2 0 5.2 1.6 4.6 4.6-.6 3.4-3 5.1-6 5.1h-1.6l-1.3 6.3h-4.3l3.1-16z" fill="#00457C" opacity=".6"/>
        <path d="M18 21h5.5c3.2 0 5.2 1.6 4.6 4.6-.6 3.4-3 5.1-6 5.1h-1.6l-1.3 6.3h-4.3l3.1-16z" fill="#0079C1"/>
      </svg>
    `)
  },
  {
    id: 'location',
    name: 'Location Pin',
    icon: '📍',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="23" fill="#EA4335"/>
        <path d="M24 11c-5.5 0-10 4.5-10 10 0 7.5 10 17 10 17s10-9.5 10-17c0-5.5-4.5-10-10-10zm0 13.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" fill="#ffffff"/>
      </svg>
    `)
  }
];
