// Full-screen mobile menu: toggles aria-expanded, locks page scroll, traps
// focus inside the header while open, and closes on Escape or link click.
// It fades and slides down from the header, and can be reversed mid-animation.
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const label = document.querySelector<HTMLElement>('[data-menu-label]');
const desktop = window.matchMedia('(min-width: 768px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (toggle && menu) {
  const links = (): HTMLAnchorElement[] => Array.from(menu.querySelectorAll('a'));
  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';

  let motion: Animation | null = null;

  const animateMenu = (open: boolean): void => {
    motion?.cancel();
    if (open) menu.hidden = false;
    if (reducedMotion.matches) {
      menu.hidden = !open;
      return;
    }
    const shown = { opacity: 1, transform: 'translateY(0)' };
    const hidden = { opacity: 0, transform: 'translateY(-8px)' };
    motion = menu.animate(open ? [hidden, shown] : [shown, hidden], {
      duration: open ? 240 : 180,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    if (!open) {
      motion.finished.then(() => (menu.hidden = true)).catch(() => {});
    }
  };

  const setOpen = (open: boolean, restoreFocus = true): void => {
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    animateMenu(open);
    document.body.classList.toggle('scroll-locked', open);
    if (open) links()[0]?.focus();
    else if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable: HTMLElement[] = [toggle, ...links()];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false, false);
  });
}
