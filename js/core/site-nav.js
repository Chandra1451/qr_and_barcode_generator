// Site menu (UCM-NAV-01): opens the category panel as a modal <dialog>. Without JavaScript, or in a browser without
// <dialog>, the Menu button stays a plain link to the footer directory (#site-directory).
const button = document.getElementById('site-nav-btn');
const dialog = document.getElementById('site-nav');

if (button && dialog && typeof dialog.showModal === 'function') {
  button.setAttribute('role', 'button');
  const wide = window.matchMedia('(min-width: 769px)');

  const open = (event) => {
    event.preventDefault();
    // Desktop: every group open. Phone: groups closed, except the one holding the current page.
    for (const group of dialog.querySelectorAll('details')) {
      group.open = wide.matches || Boolean(group.querySelector('[aria-current="page"]'));
    }
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
  };

  button.addEventListener('click', open);
  // The button is a link (for the no-JavaScript fallback), so Space must open it like a button too.
  button.addEventListener('keydown', (event) => { if (event.key === ' ') open(event); });

  dialog.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  });
  dialog.querySelector('.site-nav-close')?.addEventListener('click', () => dialog.close());
  // A click on the dimmed area outside the panel lands on the <dialog> element itself.
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}
