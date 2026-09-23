/**
 * UniversalCodeMaker V2 — Navigation & Theme Controller
 * Shared across satellite pages (SEO landing pages, Docs, Legal, Contact)
 */

(function () {
  'use strict';

  // 1. Initialize Theme
  const savedTheme = localStorage.getItem('ucm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Initialize Tactical Accent
  const savedAccent = localStorage.getItem('ucm_accent') || 'crimson';
  document.documentElement.setAttribute('data-accent', savedAccent);

  function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> <span>Light Studio</span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> <span>Obsidian Laser</span>`;
  }

  function setAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('ucm_accent', accent);
    document.querySelectorAll('.accent-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.accent === accent);
    });
  }

  function init() {
    updateThemeButton(document.documentElement.getAttribute('data-theme') || 'light');
    setAccent(document.documentElement.getAttribute('data-accent') || 'crimson');

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const curr = document.documentElement.getAttribute('data-theme') || 'light';
        const next = curr === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ucm_theme', next);
        updateThemeButton(next);
      });
    }

    document.querySelectorAll('.accent-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const accent = e.currentTarget.dataset.accent;
        if (accent) setAccent(accent);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
