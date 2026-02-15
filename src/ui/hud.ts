import styles from './hud.module.css';

type HudElements = {
  hpFill: HTMLElement;
  xpFill: HTMLElement;
  levelEl: HTMLElement;
  timerEl: HTMLElement;
  killsEl: HTMLElement;
};

function createBar(
  parent: HTMLElement,
  label: string,
  barClass: string,
  fillClass: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = styles.barContainer;
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  const bar = document.createElement('div');
  bar.className = barClass;
  const fill = document.createElement('div');
  fill.className = fillClass;
  fill.style.width = label === 'HP' ? '100%' : '0%';
  bar.appendChild(fill);
  container.appendChild(labelEl);
  container.appendChild(bar);
  parent.appendChild(container);
  return fill;
}

export function createHud(): HudElements {
  const hud = document.createElement('div');
  hud.className = styles.hud;

  const hpFill = createBar(hud, 'HP', styles.hpBar, styles.hpFill);
  const xpFill = createBar(hud, 'XP', styles.xpBar, styles.xpFill);

  const levelEl = document.createElement('span');
  levelEl.className = styles.stat;
  levelEl.textContent = 'Lv 1';

  const timerEl = document.createElement('span');
  timerEl.className = styles.stat;

  const killsEl = document.createElement('span');
  killsEl.className = styles.stat;

  hud.appendChild(levelEl);
  hud.appendChild(timerEl);
  hud.appendChild(killsEl);
  document.body.appendChild(hud);

  return { hpFill, xpFill, levelEl, timerEl, killsEl };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type HudData = {
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  level: number;
  elapsed: number;
  kills: number;
};

export function updateHud(hud: HudElements, d: HudData) {
  const hpPct = Math.max(0, (d.hp / d.maxHp) * 100);
  hud.hpFill.style.width = `${hpPct}%`;
  hud.hpFill.dataset.low = hpPct <= 30 ? 'true' : 'false';
  const xpPct = Math.max(0, (d.xp / d.xpToNext) * 100);
  hud.xpFill.style.width = `${xpPct}%`;
  hud.levelEl.textContent = `Lv ${d.level}`;
  hud.timerEl.textContent = formatTime(d.elapsed);
  hud.killsEl.textContent = `☠ ${d.kills}`;
}
