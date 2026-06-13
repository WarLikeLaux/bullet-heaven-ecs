import { isMuted, setMuted } from '@/core/audio';
import styles from './mute-button.module.css';

export function createMuteButton(): void {
  const btn = document.createElement('button');
  btn.className = styles.muteBtn;
  btn.textContent = '🔊';

  btn.addEventListener('click', () => {
    const next = !isMuted();
    setMuted(next);
    btn.textContent = next ? '🔇' : '🔊';
  });

  document.body.appendChild(btn);
}
