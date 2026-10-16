// Projects page showcase: one project leads at the top and the rest sit in the grid.
// The lead rotates through every project; when a project moves up, the one it
// replaces takes its place in the grid, so all of them stay on the page once.
// The active dot's fill animation is the timer: when it ends, the next project
// moves up. Rotation pauses while the section is off screen, hovered or holds
// focus, stops for good when the user presses Pause or picks a project, and
// never starts with reduced motion.
const root = document.querySelector<HTMLElement>('[data-showcase]');

if (root) {
  const shots = Array.from(root.querySelectorAll<HTMLImageElement>('[data-shot]'));
  const tiles = Array.from(root.querySelectorAll<HTMLElement>('[data-tile]'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pick]'));
  const openBtn = root.querySelector<HTMLButtonElement>('[data-lead-open]');
  const metaEl = root.querySelector<HTMLElement>('[data-lead-meta]');
  const codeEl = root.querySelector<HTMLElement>('[data-lead-code]');
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-pause]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let lead = 0;
  const holds = new Set<string>(['offscreen']);

  const setHold = (reason: string, on: boolean): void => {
    if (on) holds.add(reason);
    else holds.delete(reason);
    root.classList.toggle('is-paused', holds.size > 0);
  };

  const stop = (): void => {
    root.classList.add('is-stopped');
    pauseBtn?.setAttribute('aria-pressed', 'true');
    if (pauseBtn) pauseBtn.textContent = 'Play';
  };

  const play = (): void => {
    root.classList.remove('is-stopped');
    pauseBtn?.setAttribute('aria-pressed', 'false');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
    restartFill();
  };

  const restartFill = (): void => {
    const fill = dots[lead]?.querySelector<HTMLElement>('.dot-fill');
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  };

  const promote = (next: number): void => {
    if (next === lead || !tiles[next] || !tiles[lead]) return;
    const incoming = tiles[next];
    const outgoing = tiles[lead];

    // The old lead drops into the grid slot the new lead leaves.
    incoming.before(outgoing);
    incoming.hidden = true;
    outgoing.hidden = false;
    // It was hidden when the scroll reveal ran, so show it outright.
    outgoing.classList.add('is-revealed');
    outgoing.classList.remove('is-entering');
    void outgoing.offsetWidth;
    outgoing.classList.add('is-entering');

    shots.forEach((shot) => shot.classList.toggle('is-active', Number(shot.dataset.shot) === next));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === next);
      dot.setAttribute('aria-pressed', String(i === next));
    });

    const dot = dots[next];
    if (dot && openBtn) {
      openBtn.dataset.openProject = dot.dataset.id ?? '';
      openBtn.textContent = dot.dataset.title ?? '';
    }
    if (dot && metaEl) metaEl.textContent = dot.dataset.meta ?? '';
    if (dot && codeEl) codeEl.textContent = `Preview · ${dot.dataset.code ?? ''}`;

    lead = next;
  };

  dots.forEach((dot, i) => {
    dot.querySelector('.dot-fill')?.addEventListener('animationend', () => {
      if (i === lead) promote((lead + 1) % dots.length);
    });
    dot.addEventListener('click', () => {
      stop();
      promote(i);
    });
  });

  pauseBtn?.addEventListener('click', () => {
    if (root.classList.contains('is-stopped')) play();
    else stop();
  });

  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') setHold('hover', true);
  });
  root.addEventListener('pointerleave', () => setHold('hover', false));
  root.addEventListener('focusin', () => setHold('focus', true));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) setHold('focus', false);
  });
  document.addEventListener('visibilitychange', () => setHold('hidden', document.hidden));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => setHold('offscreen', !entry?.isIntersecting), {
      threshold: 0.25,
    }).observe(root);
  } else {
    setHold('offscreen', false);
  }

  root.classList.add('is-paused');
  if (reducedMotion.matches) stop();
}

export {};
