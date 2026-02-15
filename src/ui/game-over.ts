import styles from './game-over.module.css';
import { formatTime } from '@/ui/hud';

export function showGameOver(elapsed: number, kills: number): void {
  const overlay = document.createElement('div');
  overlay.className = styles.overlay;

  const title = document.createElement('div');
  title.className = styles.title;
  title.textContent = 'GAME OVER';

  const stats = document.createElement('div');
  stats.className = styles.stats;
  stats.textContent = `${formatTime(elapsed)}  ☠ ${kills}`;

  const button = document.createElement('button');
  button.className = styles.button;
  button.textContent = 'RESTART';
  button.addEventListener('click', () => location.reload());

  overlay.appendChild(title);
  overlay.appendChild(stats);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}
