// Project viewer: any element with data-open-project="<id>" opens that
// project's images in a <dialog>. A Design stage | Completion toggle switches
// sets (hidden when a project has only one), arrow keys and swipes step
// through images, Escape closes, Tab stays inside, and focus returns to the
// opener. The viewer grows out of the element that opened it and shrinks back
// into it on close.
import type { Stage, ViewerProject } from '../data/projects';

const dialog = document.querySelector<HTMLDialogElement>('[data-viewer]');
const dataEl = document.getElementById('viewer-data');

// Approximates a critically damped spring: fast start, no overshoot.
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Where a flick would come to rest (Apple's scroll-deceleration projection). */
function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past an edge instead of a hard stop. */
function rubberband(offset: number, dimension: number, constant = 0.55): number {
  return (offset * dimension * constant) / (dimension + constant * Math.abs(offset));
}

/** Current on-screen translateX of an element, including mid-animation. */
function liveX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
}

if (dialog && dataEl?.textContent) {
  const projects = JSON.parse(dataEl.textContent) as Record<string, ViewerProject>;
  const q = <T extends Element>(sel: string) => dialog.querySelector<T>(sel);
  const img = q<HTMLImageElement>('[data-viewer-img]');
  const track = q<HTMLElement>('[data-viewer-track]');
  const caption = q<HTMLElement>('[data-viewer-caption]');
  const count = q<HTMLElement>('[data-viewer-count]');
  const stages = q<HTMLElement>('[data-viewer-stages]');
  const chrome = Array.from(dialog.querySelectorAll<HTMLElement>('[data-viewer-chrome]'));
  const stageButtons = Array.from(
    dialog.querySelectorAll<HTMLButtonElement>('[data-viewer-stage]'),
  );
  const closeBtn = q<HTMLButtonElement>('[data-viewer-close]');
  const prevBtn = q<HTMLButtonElement>('[data-viewer-prev]');
  const nextBtn = q<HTMLButtonElement>('[data-viewer-next]');

  let current: ViewerProject | undefined;
  let stage: Stage = 'completion';
  let index = 0;
  let opener: HTMLElement | null = null;
  let closing = false;
  let motion: Animation | null = null;

  const isStage = (value: string | undefined): value is Stage =>
    value === 'design' || value === 'completion';
  const total = (): number => current?.[stage].length ?? 0;

  /** The on-page element the viewer grows from and returns to. */
  const sourceOf = (el: HTMLElement | null): HTMLElement | null =>
    el?.closest<HTMLElement>('.card')?.querySelector<HTMLElement>('.frame') ?? el;

  const showImage = (): void => {
    const image = current?.[stage][index];
    if (!img || !image) return;
    img.srcset = image.srcset;
    img.src = image.src;
    img.width = image.width;
    img.height = image.height;
    img.alt = image.alt;
  };

  const render = (): void => {
    if (!current) return;
    showImage();
    for (const button of stageButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.viewerStage === stage));
    }
    const single = total() < 2;
    if (prevBtn) prevBtn.hidden = single;
    if (nextBtn) nextBtn.hidden = single;
    if (count) {
      const label = stageButtons.find((b) => b.dataset.viewerStage === stage)?.textContent?.trim();
      count.textContent = `${label ?? ''} · ${index + 1} / ${total()}`;
    }
  };

  const play = (keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null => {
    if (!img) return null;
    motion?.cancel();
    motion = img.animate(keyframes, { easing: EASE, fill: 'forwards', ...options });
    return motion;
  };

  /** Swap to another image or stage: slide in the direction of travel, or crossfade. */
  const change = async (update: () => void, direction = 0, fromX = 0, velocity = 0) => {
    if (!img || !track) return;
    if (reducedMotion.matches || direction === 0) {
      await play([{ opacity: 1 }, { opacity: 0 }], { duration: 120 })?.finished.catch(() => {});
      update();
      play([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
      return;
    }
    const width = track.clientWidth;
    const exitX = -direction * width * 0.6;
    // Carry the swipe's speed into the exit so there is no seam at release.
    const speed = Math.max(Math.abs(velocity), 1.2); // px per ms
    const duration = Math.min(260, Math.max(120, Math.abs(exitX - fromX) / speed));
    await play(
      [
        { transform: `translateX(${fromX}px)`, opacity: 1 },
        { transform: `translateX(${exitX}px)`, opacity: 0 },
      ],
      { duration, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    )?.finished.catch(() => {});
    update();
    play(
      [
        { transform: `translateX(${direction * width * 0.25}px)`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: 320 },
    );
  };

  const step = (delta: number, fromX = 0, velocity = 0): void => {
    const n = total();
    if (n < 2) return;
    void change(
      () => {
        index = (index + delta + n) % n;
        render();
      },
      Math.sign(delta),
      fromX,
      velocity,
    );
  };

  const setStage = (next: Stage): void => {
    if (!current || current[next].length === 0 || next === stage) return;
    void change(() => {
      stage = next;
      index = 0;
      render();
    });
  };

  /** Transform that maps the viewer image onto the source element's box. */
  const fromSource = (source: HTMLElement | null): string | null => {
    if (!img || !source) return null;
    const from = source.getBoundingClientRect();
    const to = img.getBoundingClientRect();
    if (!from.width || !to.width || from.bottom < 0 || from.top > window.innerHeight) return null;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    // Uniform scale so the photo never distorts, fitted inside the source box.
    const scale = Math.min(from.width / to.width, from.height / to.height);
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  };

  const fadeChrome = (show: boolean, duration: number): void => {
    const frames = show ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];
    for (const el of chrome) el.animate(frames, { duration, easing: EASE, fill: 'both' });
    dialog.animate(
      [{ backgroundColor: 'rgba(17, 18, 24, 0)' }, { backgroundColor: 'rgba(17, 18, 24, 0.97)' }],
      { duration, easing: EASE, direction: show ? 'normal' : 'reverse', fill: 'both' },
    );
  };

  const open = (id: string, from: HTMLElement): void => {
    current = projects[id];
    if (!current || !img) return;
    opener = from;
    closing = false;
    stage = current.completion.length > 0 ? 'completion' : 'design';
    index = 0;
    if (stages) stages.hidden = current.design.length === 0 || current.completion.length === 0;
    if (caption) caption.textContent = current.caption;

    // Show the already-loaded card image underneath while the full size loads.
    const preview = sourceOf(from)?.querySelector('img')?.currentSrc;
    img.style.backgroundImage = preview && stage === 'completion' ? `url("${preview}")` : '';
    img.addEventListener('load', () => (img.style.backgroundImage = ''), { once: true });

    render();
    dialog.showModal();
    document.body.classList.add('scroll-locked');

    if (!reducedMotion.matches) {
      const transform = fromSource(sourceOf(from));
      fadeChrome(true, 300);
      if (transform) play([{ transform }, { transform: 'none' }], { duration: 420 });
    }

    const focusTarget =
      stages && !stages.hidden
        ? stageButtons.find((b) => b.dataset.viewerStage === stage)
        : closeBtn;
    focusTarget?.focus();
  };

  const close = async (): Promise<void> => {
    if (!dialog.open || closing) return;
    closing = true;
    if (!reducedMotion.matches) {
      const transform = fromSource(sourceOf(opener));
      fadeChrome(false, 260);
      const exit = transform
        ? play([{ transform: 'none' }, { transform }], { duration: 300 })
        : play([{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
      await exit?.finished.catch(() => {});
    }
    dialog.close();
  };

  document.addEventListener('click', (event) => {
    const trigger =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-open-project]')
        : null;
    if (trigger?.dataset.openProject) open(trigger.dataset.openProject, trigger);
  });

  for (const button of stageButtons) {
    button.addEventListener('click', () => {
      if (isStage(button.dataset.viewerStage)) setStage(button.dataset.viewerStage);
    });
  }
  closeBtn?.addEventListener('click', () => void close());
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  // Escape: run the animated close instead of the instant native one.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    void close();
  });

  dialog.addEventListener('close', () => {
    motion?.cancel();
    motion = null;
    for (const el of chrome) el.getAnimations().forEach((a) => a.cancel());
    dialog.getAnimations().forEach((a) => a.cancel());
    document.body.classList.remove('scroll-locked');
    opener?.focus();
    opener = null;
    closing = false;
  });

  // Swipe: the photo follows the finger 1:1, then a flick's projected
  // landing point decides whether to change image or settle back.
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let dragging = false;
  let suppressClick = false;
  let history: { x: number; t: number }[] = [];

  track?.addEventListener('pointerdown', (event) => {
    if (!img || !track || pointerId !== null || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragging = false;
    history = [{ x: event.clientX, t: event.timeStamp }];
  });

  track?.addEventListener('pointermove', (event) => {
    if (!img || !track || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragging) {
      // Small threshold so taps stay taps and vertical moves stay scrolls.
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      dragging = true;
      track.setPointerCapture(event.pointerId);
      // Grab the photo wherever it currently is, even mid-animation.
      baseX = liveX(img) - dx;
      motion?.cancel();
      motion = null;
    }
    history.push({ x: event.clientX, t: event.timeStamp });
    if (history.length > 6) history.shift();
    const raw = baseX + dx;
    const x = total() < 2 ? rubberband(raw, track.clientWidth) : raw;
    img.style.transform = `translateX(${x}px)`;
    img.style.opacity = '1';
  });

  const release = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging || !img || !track) return;
    dragging = false;
    suppressClick = true;

    const x = liveX(img);
    img.style.transform = '';
    const first = history[0];
    const last = history[history.length - 1];
    const elapsed = first && last ? last.t - first.t : 0;
    const velocity = first && last && elapsed > 0 ? (last.x - first.x) / elapsed : 0; // px/ms
    const landing = x + project(velocity * 1000);

    if (total() > 1 && Math.abs(landing) > track.clientWidth * 0.35) {
      step(landing < 0 ? 1 : -1, x, velocity);
    } else {
      play([{ transform: `translateX(${x}px)` }, { transform: 'translateX(0)' }], {
        duration: 360,
      });
    }
  };

  track?.addEventListener('pointerup', release);
  track?.addEventListener('pointercancel', release);

  // Clicking the dark area around the photo closes the viewer (but not the
  // click that ends a swipe).
  dialog.addEventListener('click', (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const target = event.target;
    if (target === dialog || (target instanceof Element && target.matches('.viewer-stage'))) {
      void close();
    }
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button')).filter(
        (b) => !b.hidden && !b.closest('[hidden]'),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
}
