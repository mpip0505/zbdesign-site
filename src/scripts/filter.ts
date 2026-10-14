// Client-side project filter. The markup renders every project, so the full
// list stays visible when JS is unavailable. Changes fade out and back in
// rather than snapping the grid into its new layout.
const root = document.querySelector<HTMLElement>('[data-filter-root]');

if (root) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-type]'));
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const grid = root.querySelector<HTMLElement>('.grid');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  let active = 'all';
  let fadeOut: Animation | null = null;

  const apply = (key: string): void => {
    let shown = 0;
    for (const item of items) {
      const match = key === 'all' || item.dataset.type === key;
      item.hidden = !match;
      if (match) shown++;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === key));
    }
    if (count) count.textContent = `${shown} ${shown === 1 ? 'project' : 'projects'}`;
  };

  const choose = async (key: string): Promise<void> => {
    if (key === active) return;
    active = key;
    // The pressed state responds immediately; only the grid waits for the fade.
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === key));
    }
    if (!grid || reducedMotion.matches) {
      apply(key);
      return;
    }
    fadeOut?.cancel();
    fadeOut = grid.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
    try {
      await fadeOut.finished;
    } catch {
      return; // A newer choice interrupted this one.
    }
    apply(key);
    fadeOut.cancel();
    grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
    items
      .filter((item) => !item.hidden)
      .forEach((item, i) =>
        item.animate([{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }], {
          duration: 280,
          delay: Math.min(i, 6) * 25,
          easing,
          fill: 'backwards',
        }),
      );
  };

  for (const button of buttons) {
    button.addEventListener('click', () => void choose(button.dataset.filter ?? 'all'));
  }
}
