import { CHARACTER_COUNT, CHARACTER_PATH_PREFIX } from '@/config';
import styles from './character-select.module.css';

const THUMB_SIZE = 48;
const SHEET_W = 96;
const SHEET_H = 128;
const SCALE = THUMB_SIZE / (SHEET_W / 3);
const BG_W = SHEET_W * SCALE;
const BG_H = SHEET_H * SCALE;

function getCharacterPath(index: number): string {
  return `${CHARACTER_PATH_PREFIX}${String(index).padStart(3, '0')}.png`;
}

function setSpriteBg(el: HTMLElement, path: string) {
  const url = import.meta.env.BASE_URL + path;
  el.style.backgroundImage = `url(${url})`;
  el.style.backgroundSize = `${BG_W}px ${BG_H}px`;
  el.style.backgroundPosition = '0 0';
}

function buildCharacterGrid(
  panel: HTMLElement,
  button: HTMLElement,
  initialPath: string,
  onChange: (path: string) => void
) {
  let activeOption: HTMLElement | undefined;
  let currentPath = initialPath;

  for (let i = 1; i <= CHARACTER_COUNT; i++) {
    const path = getCharacterPath(i);
    const option = document.createElement('div');
    option.className = styles.option;
    setSpriteBg(option, path);

    if (path === initialPath) {
      option.classList.add(styles.active);
      activeOption = option;
    }

    option.addEventListener('click', () => {
      if (path === currentPath) return;

      if (activeOption) activeOption.classList.remove(styles.active);
      option.classList.add(styles.active);
      activeOption = option;
      currentPath = path;

      setSpriteBg(button, path);
      panel.classList.remove(styles.panelOpen);
      onChange(path);
    });

    panel.appendChild(option);
  }
}

export function createCharacterSelect(
  initialPath: string,
  onChange: (path: string) => void
) {
  const button = document.createElement('div');
  button.className = styles.button;
  setSpriteBg(button, initialPath);

  const panel = document.createElement('div');
  panel.className = styles.panel;

  buildCharacterGrid(panel, button, initialPath, onChange);

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle(styles.panelOpen);
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof Node && !panel.contains(target)) {
      panel.classList.remove(styles.panelOpen);
    }
  });

  document.body.appendChild(button);
  document.body.appendChild(panel);
}
