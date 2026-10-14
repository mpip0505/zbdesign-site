// Selected work index: hovering or focusing a row makes it the active row and
// swaps the sticky preview image and caption.
const index = document.querySelector<HTMLElement>('[data-index]');

if (index) {
  const rows = Array.from(index.querySelectorAll<HTMLButtonElement>('[data-row]'));
  const shots = Array.from(index.querySelectorAll<HTMLImageElement>('[data-shot]'));
  const code = index.querySelector<HTMLElement>('[data-preview-code]');
  const caption = index.querySelector<HTMLElement>('[data-preview-caption]');

  const activate = (i: number): void => {
    rows.forEach((row, n) => row.classList.toggle('is-active', n === i));
    shots.forEach((shot) => shot.classList.toggle('is-active', Number(shot.dataset.shot) === i));
    const row = rows[i];
    if (!row) return;
    if (code) code.textContent = `Preview · ${row.firstElementChild?.textContent ?? ''}`;
    if (caption) caption.textContent = row.dataset.caption ?? '';
  };

  rows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => activate(i));
    row.addEventListener('focus', () => activate(i));
  });
}
