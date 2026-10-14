// Shows a hairline under the sticky header once the page has scrolled, and
// keeps --header-h in sync so anchors and sticky elements clear the header.
const header = document.querySelector<HTMLElement>('[data-header]');

if (header) {
  const root = document.documentElement;
  const update = (): void => {
    header.classList.toggle('is-scrolled', window.scrollY > 0);
  };

  new ResizeObserver(([entry]) => {
    if (entry) root.style.setProperty('--header-h', `${Math.round(header.offsetHeight)}px`);
  }).observe(header);

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// iOS Safari only applies :active press styles when a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true });
