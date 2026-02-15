import styles from './level-up.module.css';

const FLASH_DURATION = 1200;

export function showLevelUp(level: number): void {
  const el = document.createElement('div');
  el.className = styles.flash;
  el.textContent = `LEVEL ${level}`;
  document.body.appendChild(el);

  setTimeout(() => el.remove(), FLASH_DURATION);
}
