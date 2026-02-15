import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  createWorld,
  Entity,
  DIRECTION_DOWN,
  DIRECTION_RIGHT,
} from '@/core/ecs';
import { runChaseSystem } from '@/core/systems';

describe('Chase System', () => {
  it('sets velocity toward chase target', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(0, 0, 0),
      speed: 2,
      chaseTarget: new Vector3(10, 0, 0),
    };

    world.add(entity);
    runChaseSystem(world);

    expect(entity.velocity?.x).toBeCloseTo(2);
    expect(entity.velocity?.y).toBeCloseTo(0);
  });

  it('normalizes diagonal chase direction', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(0, 0, 0),
      speed: 4,
      chaseTarget: new Vector3(5, 5, 0),
    };

    world.add(entity);
    runChaseSystem(world);

    const expected = 4 / Math.sqrt(2);
    expect(entity.velocity?.x).toBeCloseTo(expected);
    expect(entity.velocity?.y).toBeCloseTo(expected);
  });

  it('stops when very close to target', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(5, 5, 0),
      velocity: new Vector3(1, 1, 0),
      speed: 3,
      chaseTarget: new Vector3(5, 5, 0),
    };

    world.add(entity);
    runChaseSystem(world);

    expect(entity.velocity?.x).toBe(0);
    expect(entity.velocity?.y).toBe(0);
  });

  it('ignores entities without chaseTarget', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(3, 0, 0),
      speed: 5,
    };

    world.add(entity);
    runChaseSystem(world);

    expect(entity.velocity?.x).toBe(3);
  });

  it('tracks moving target reference', () => {
    const world = createWorld();
    const targetPos = new Vector3(10, 0, 0);

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(0, 0, 0),
      speed: 2,
      chaseTarget: targetPos,
    };

    world.add(entity);
    runChaseSystem(world);
    expect(entity.velocity?.x).toBeCloseTo(2);

    targetPos.set(0, 10, 0);
    runChaseSystem(world);
    expect(entity.velocity?.y).toBeCloseTo(2);
    expect(entity.velocity?.x).toBeCloseTo(0);
  });

  it('sets sprite direction when chasing right', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(0, 0, 0),
      speed: 2,
      chaseTarget: new Vector3(10, 0, 0),
      spriteAnimation: {
        frameIndex: 0,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0,
        direction: DIRECTION_DOWN,
        isMoving: false,
      },
    };

    world.add(entity);
    runChaseSystem(world);

    expect(entity.spriteAnimation?.isMoving).toBe(true);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_RIGHT);
  });

  it('stops sprite animation when at target', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'enemy',
      position: new Vector3(5, 5, 0),
      velocity: new Vector3(1, 1, 0),
      speed: 3,
      chaseTarget: new Vector3(5, 5, 0),
      spriteAnimation: {
        frameIndex: 1,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0.05,
        direction: DIRECTION_RIGHT,
        isMoving: true,
      },
    };

    world.add(entity);
    runChaseSystem(world);

    expect(entity.spriteAnimation?.isMoving).toBe(false);
  });
});
