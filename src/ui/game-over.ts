import styles from './game-over.module.css';

export function showGameOver(): void {
  const overlay = document.createElement('div');
  overlay.className = styles.overlay;

  const title = document.createElement('div');
  title.className = styles.title;
  title.textContent = 'GAME OVER';

  const button = document.createElement('button');
  button.className = styles.button;
  button.textContent = 'RESTART';
  button.addEventListener('click', () => location.reload());

  overlay.appendChild(title);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}
