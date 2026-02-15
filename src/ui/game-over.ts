import styles from './game-over.module.css';
import { formatTime } from '@/ui/hud';
import { playGameOver } from '@/core/audio';

type GameStats = {
  elapsed: number;
  kills: number;
  level: number;
};

const BEST_KEY = 'bh_best';

function loadBest(): GameStats {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return { elapsed: 0, kills: 0, level: 1 };
    return JSON.parse(raw) as GameStats;
  } catch {
    return { elapsed: 0, kills: 0, level: 1 };
  }
}

function saveBest(current: GameStats): boolean {
  const prev = loadBest();
  const isBest = current.elapsed > prev.elapsed;
  if (isBest) localStorage.setItem(BEST_KEY, JSON.stringify(current));
  return isBest;
}

function createStatRow(
  icon: string,
  label: string,
  value: string
): HTMLElement {
  const row = document.createElement('div');
  row.className = styles.statRow;
  row.innerHTML = `<span>${icon}</span><span class="${styles.statLabel}">${label}</span><span class="${styles.statValue}">${value}</span>`;
  return row;
}

export function showGameOver(stats: GameStats): void {
  const isNewBest = saveBest(stats);

  playGameOver();
  const overlay = document.createElement('div');
  overlay.className = styles.overlay;

  const title = document.createElement('div');
  title.className = styles.title;
  title.textContent = 'ПОРАЖЕНИЕ';

  const statsBox = document.createElement('div');
  statsBox.className = styles.statsBox;
  statsBox.appendChild(createStatRow('⏱', 'Время', formatTime(stats.elapsed)));
  statsBox.appendChild(createStatRow('⭐', 'Уровень', String(stats.level)));
  statsBox.appendChild(createStatRow('☠', 'Убийства', String(stats.kills)));

  if (isNewBest) {
    const badge = document.createElement('div');
    badge.className = styles.best;
    badge.textContent = '🏆 НОВЫЙ РЕКОРД!';
    statsBox.appendChild(badge);
  } else {
    const best = loadBest();
    const prevRow = document.createElement('div');
    prevRow.className = styles.prevBest;
    prevRow.textContent = `рекорд: ${formatTime(best.elapsed)}`;
    statsBox.appendChild(prevRow);
  }

  const button = document.createElement('button');
  button.className = styles.button;
  button.textContent = 'ЕЩЁ РАЗ';
  button.addEventListener('click', () => location.reload());

  overlay.appendChild(title);
  overlay.appendChild(statsBox);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}
