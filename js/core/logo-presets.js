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
        <path d="M12 18c6.6-6 17.4-6 24 0M16 23c4.4-4 11.6-4 16 0M20 28c2.2-2 5.8-2 8 0M24 34a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
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
        <path d="M34 14a14 14 0 0 0-24 14l-2 8 8-2a14 14 0 0 0 18-20z" fill="#ffffff"/>
        <path d="M30 25c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.7.1-1 .5-.4.4-1.4 1.4-1.4 3.4 0 2 1.5 4 1.7 4.2.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9 1 .3 1.9.3 2.6.2.8-.1 2.5-1 2.8-2 .4-.9.4-1.8.3-2-.1-.2-.3-.3-.6-.4z" fill="#25D366"/>
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
        <circle cx="24" cy="24" r="23" fill="#0A66C2"/>
        <path fill="#ffffff" d="M14 19h5v15h-5zM16.5 12a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM22 19h4.8v2.1h.1c.7-1.3 2.4-2.6 4.9-2.6 5.2 0 6.2 3.4 6.2 7.9V34h-5v-6.7c0-1.6 0-3.6-2.2-3.6-2.2 0-2.6 1.7-2.6 3.5V34h-5z"/>
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
        <path d="M31.2 21.6c.4-2.5-1.5-3.8-4.1-4.7l.8-3.3-2-.5-.8 3.2c-.5-.1-1.1-.2-1.6-.4l.8-3.2-2-.5-.8 3.3c-.4-.1-.9-.2-1.3-.3l-2.8-.7-.6 2.2s1.5.3 1.5.4c.8.2 1 .7.9 1.2l-1 4.1c.1 0 .2.1.3.1l-.3-.1-1.4 5.7c-.1.3-.4.7-1 .6 0 .1-1.5-.4-1.5-.4l-1 2.4 2.6.7c.5.1 1 .3 1.5.4l-.8 3.4 2 .5.8-3.3c.6.2 1.1.3 1.6.4l-.8 3.3 2 .5.8-3.4c3.4.6 6 0 7-2.7.9-2.1 0-3.3-1.5-4.1 1.1-.6 1.9-1.5 2.1-3.1zm-3.8 6.8c-.6 2.5-4.8 1.1-6.1.8l1.1-4.4c1.3.3 5.6 1 5 3.6zm.6-6.9c-.6 2.3-4.1 1.1-5.2.8l1-4c1.1.3 4.8.8 4.2 3.2z" fill="#ffffff"/>
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
