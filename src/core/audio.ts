let ctx: AudioContext | null = null;
let muted = false;
let musicGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (musicGain) musicGain.gain.value = value ? 0 : 0.06;
}

function sweep(
  c: AudioContext,
  start: number,
  end: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine'
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(start, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(end, c.currentTime + dur);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export function playShoot(): void {
  if (muted) return;
  const c = getCtx();
  if (c) sweep(c, 900, 200, 0.07, 0.12);
}

export function playHit(): void {
  if (muted) return;
  const c = getCtx();
  if (c) sweep(c, 400, 80, 0.1, 0.15);
}

const DEATH_MAX = 3;
const DEATH_WINDOW = 0.1;
let deathCount = 0;
let deathResetTime = 0;

export function playEnemyDeath(): void {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  if (now - deathResetTime > DEATH_WINDOW) {
    deathCount = 0;
    deathResetTime = now;
  }
  if (deathCount >= DEATH_MAX) return;
  deathCount += 1;
  sweep(c, 600, 40, 0.2, 0.12);
}

export function playGameOver(): void {
  if (muted) return;
  const c = getCtx();
  if (c) sweep(c, 400, 60, 0.8, 0.25, 'triangle');
}

export function playLevelUp(): void {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i++) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[i];
    const t = c.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

const BASS_NOTES = [130.8, 146.8, 164.8, 146.8];
const BASS_STEP = 0.4;

export function startMusic(): void {
  const c = getCtx();
  if (!c) return;
  const ac: AudioContext = c;
  musicGain = ac.createGain();
  musicGain.gain.value = muted ? 0 : 0.06;
  musicGain.connect(ac.destination);
  const mg = musicGain;

  function scheduleBar(startTime: number) {
    for (let i = 0; i < BASS_NOTES.length; i++) {
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = BASS_NOTES[i];
      const t = startTime + i * BASS_STEP;
      env.gain.setValueAtTime(1, t);
      env.gain.exponentialRampToValueAtTime(0.01, t + BASS_STEP * 0.9);
      osc.connect(env).connect(mg);
      osc.start(t);
      osc.stop(t + BASS_STEP);
    }
  }

  const barLen = BASS_NOTES.length * BASS_STEP;
  let nextBar = ac.currentTime;

  function loop() {
    while (nextBar < ac.currentTime + 2) {
      scheduleBar(nextBar);
      nextBar += barLen;
    }
    setTimeout(loop, 1000);
  }

  loop();
}
