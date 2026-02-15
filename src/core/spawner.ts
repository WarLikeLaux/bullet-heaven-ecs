import { Vector3 } from 'three';
import {
  SPAWN_INTERVAL,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_DECAY,
  SPAWN_RADIUS,
} from '@/config';

export type SpawnerState = {
  elapsed: number;
  interval: number;
  enemyCount: number;
};

export function createSpawnerState(): SpawnerState {
  return {
    elapsed: 0,
    interval: SPAWN_INTERVAL,
    enemyCount: 0,
  };
}

export function updateSpawner(state: SpawnerState, dt: number): number {
  state.elapsed += dt;

  let spawnCount = 0;

  while (state.elapsed >= state.interval) {
    state.elapsed -= state.interval;
    state.interval = Math.max(
      SPAWN_INTERVAL_MIN,
      state.interval * SPAWN_INTERVAL_DECAY
    );
    spawnCount += 1;
  }

  return spawnCount;
}

const SPAWN_OFFSET = new Vector3();

export function getSpawnPosition(center: Vector3): Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const radius = SPAWN_RADIUS + Math.random() * 5;
  SPAWN_OFFSET.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  return new Vector3().addVectors(center, SPAWN_OFFSET);
}
