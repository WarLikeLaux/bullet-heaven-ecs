import styles from './fps-counter.module.css';

const FPS_UPDATE_INTERVAL = 0.5;

export type FpsState = {
  frames: number;
  elapsed: number;
  lastFps: number;
};

export function createFpsState(): FpsState {
  return { frames: 0, elapsed: 0, lastFps: 0 };
}

export function updateFps(state: FpsState, dt: number): number {
  state.frames += 1;
  state.elapsed += dt;

  if (state.elapsed >= FPS_UPDATE_INTERVAL) {
    state.lastFps = Math.round(state.frames / state.elapsed);
    state.frames = 0;
    state.elapsed = 0;
  }

  return state.lastFps;
}

export function createFpsCounter(): HTMLElement {
  const el = document.createElement('div');
  el.className = styles.fpsCounter;
  el.textContent = '0 FPS';
  document.body.appendChild(el);
  return el;
}
