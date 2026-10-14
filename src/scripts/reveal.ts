// Scroll reveal: elements marked data-reveal fade in and rise slightly the
// first time they enter the viewport. Elements that enter together are
// staggered in document order. Content is only hidden once this script is
// running (html.reveal-ready), so it stays visible if JS fails, and anything
// already on screen at load is shown immediately without animating.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (elements.length > 0 && !reducedMotion.matches && 'IntersectionObserver' in window) {
  const STAGGER_MS = 70;
  const MAX_STAGGER = 6;

  for (const el of elements) {
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) el.classList.add('is-revealed');
  }
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target as HTMLElement)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entering.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
        el.classList.add('is-revealed');
        observer.unobserve(el);
      });
    },
    // Start a little before the element reaches the bottom edge.
    { rootMargin: '0px 0px -8% 0px' },
  );

  for (const el of elements) {
    if (!el.classList.contains('is-revealed')) observer.observe(el);
  }
}

export {};
