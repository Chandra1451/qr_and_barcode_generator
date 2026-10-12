/**
 * Publishes the sticky top bar's height as --header-h on <html>, so pinned boxes ("On this page",
 * docs sidebar, studio preview) and in-page link targets sit just below it. The bar is 81 px on
 * desktop but wraps to ~107–114 px on phones and changes when fonts load, so it is measured rather
 * than hard-coded. CSS falls back to 5.25rem without this script.
 * Why: projects/universalcodemaker/30_design/sticky-header-overlap.md. Tests: specs/17-layout.spec.mjs.
 */
(function () {
  'use strict';
  const header = document.querySelector('.v2-header');
  if (!header) return;
  const root = document.documentElement;
  const update = () => root.style.setProperty('--header-h', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(header);
  else window.addEventListener('resize', update);
})();
