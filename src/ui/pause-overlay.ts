import styles from './pause-overlay.module.css';

let overlay: HTMLElement | null = null;

function ensureOverlay(): HTMLElement {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = styles.overlay;
  overlay.style.display = 'none';
  const text = document.createElement('span');
  text.className = styles.text;
  text.textContent = 'ПАУЗА';
  overlay.appendChild(text);
  document.body.appendChild(overlay);
  return overlay;
}

export function showPause() {
  ensureOverlay().style.display = 'flex';
}

export function hidePause() {
  ensureOverlay().style.display = 'none';
}
