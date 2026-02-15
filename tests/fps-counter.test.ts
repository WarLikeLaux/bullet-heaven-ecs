import { describe, it, expect } from 'vitest';
import { createFpsState, updateFps } from '@/ui/fps-counter';

describe('FPS calculation', () => {
  it('returns 0 before first interval completes', () => {
    const state = createFpsState();
    const fps = updateFps(state, 0.016);
    expect(fps).toBe(0);
  });

  it('calculates fps after interval elapses', () => {
    const state = createFpsState();

    for (let i = 0; i < 31; i++) {
      updateFps(state, 1 / 60);
    }

    expect(state.lastFps).toBe(60);
  });

  it('resets counters after interval', () => {
    const state = createFpsState();

    for (let i = 0; i < 31; i++) {
      updateFps(state, 1 / 60);
    }

    expect(state.frames).toBe(0);
    expect(state.elapsed).toBe(0);
  });

  it('recalculates on next interval', () => {
    const state = createFpsState();

    for (let i = 0; i < 31; i++) {
      updateFps(state, 1 / 60);
    }
    expect(state.lastFps).toBe(60);

    for (let i = 0; i < 16; i++) {
      updateFps(state, 1 / 30);
    }
    expect(state.lastFps).toBe(30);
  });

  it('accumulates frames within interval', () => {
    const state = createFpsState();

    updateFps(state, 0.1);
    updateFps(state, 0.1);
    updateFps(state, 0.1);

    expect(state.frames).toBe(3);
    expect(state.elapsed).toBeCloseTo(0.3);
    expect(state.lastFps).toBe(0);
  });
});
