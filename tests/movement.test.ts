import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { createWorld, Entity } from '@/core/ecs';
import { runMovementSystem, runInputSystem } from '@/core/systems';

describe('Movement System', () => {
  it('applies velocity to position over one tick', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'test',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(10, 0, 0),
    };

    world.add(entity);

    runMovementSystem(world, 1.0);

    expect(entity.position?.x).toBe(10);
    expect(entity.position?.y).toBe(0);
    expect(entity.position?.z).toBe(0);
  });

  it('does not move when velocity is zero', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'static',
      position: new Vector3(5, 5, 0),
      velocity: new Vector3(0, 0, 0),
    };

    world.add(entity);

    runMovementSystem(world, 1.0);

    expect(entity.position?.x).toBe(5);
    expect(entity.position?.y).toBe(5);
  });
});

describe('Input System', () => {
  it('sets velocity from player input', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      velocity: new Vector3(0, 0, 0),
      speed: 5,
      playerInput: { up: true, down: false, left: false, right: false },
    };

    world.add(entity);

    runInputSystem(world);

    expect(entity.velocity?.y).toBeCloseTo(5);
    expect(entity.velocity?.x).toBeCloseTo(0);
  });

  it('normalizes diagonal movement', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      velocity: new Vector3(0, 0, 0),
      speed: 10,
      playerInput: { up: true, down: false, left: false, right: true },
    };

    world.add(entity);

    runInputSystem(world);

    const expectedComponent = 10 / Math.sqrt(2);
    expect(entity.velocity?.x).toBeCloseTo(expectedComponent);
    expect(entity.velocity?.y).toBeCloseTo(expectedComponent);
  });

  it('sets velocity to zero when no input', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      velocity: new Vector3(5, 5, 0),
      speed: 10,
      playerInput: { up: false, down: false, left: false, right: false },
    };

    world.add(entity);

    runInputSystem(world);

    expect(entity.velocity?.x).toBe(0);
    expect(entity.velocity?.y).toBe(0);
  });
});
