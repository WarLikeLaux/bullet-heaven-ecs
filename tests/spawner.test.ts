import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  createSpawnerState,
  updateSpawner,
  getSpawnPosition,
} from '@/core/spawner';
import { SPAWN_INTERVAL, SPAWN_INTERVAL_DECAY, SPAWN_RADIUS } from '@/config';

describe('Spawner State', () => {
  it('creates initial state with default interval', () => {
    const state = createSpawnerState();
    expect(state.elapsed).toBe(0);
    expect(state.interval).toBe(SPAWN_INTERVAL);
    expect(state.enemyCount).toBe(0);
  });
});

describe('updateSpawner', () => {
  it('returns 0 when interval has not elapsed', () => {
    const state = createSpawnerState();
    const count = updateSpawner(state, 0.5);
    expect(count).toBe(0);
  });

  it('returns 1 when interval elapses', () => {
    const state = createSpawnerState();
    const count = updateSpawner(state, SPAWN_INTERVAL + 0.01);
    expect(count).toBe(1);
  });

  it('decays interval after spawn', () => {
    const state = createSpawnerState();
    updateSpawner(state, SPAWN_INTERVAL + 0.01);
    expect(state.interval).toBeCloseTo(SPAWN_INTERVAL * SPAWN_INTERVAL_DECAY);
  });

  it('accumulates elapsed time across ticks', () => {
    const state = createSpawnerState();
    updateSpawner(state, 1.0);
    expect(state.elapsed).toBeCloseTo(1.0);
    updateSpawner(state, 0.5);
    expect(state.elapsed).toBeCloseTo(1.5);
  });

  it('spawns multiple when enough time passed', () => {
    const state = createSpawnerState();
    const count = updateSpawner(state, SPAWN_INTERVAL * 3);
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('does not decay below minimum', () => {
    const state = createSpawnerState();

    for (let i = 0; i < 200; i++) {
      updateSpawner(state, state.interval + 0.001);
    }

    expect(state.interval).toBeGreaterThanOrEqual(0.3);
  });
});

describe('getSpawnPosition', () => {
  it('returns position at least spawn radius from center', () => {
    const center = new Vector3(5, 5, 0);
    const pos = getSpawnPosition(center);

    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    expect(dist).toBeGreaterThanOrEqual(SPAWN_RADIUS);
    expect(dist).toBeLessThanOrEqual(SPAWN_RADIUS + 5);
  });

  it('spawns at z=0', () => {
    const center = new Vector3(0, 0, 0);
    const pos = getSpawnPosition(center);
    expect(pos.z).toBe(0);
  });
});
