import { describe, it, expect } from 'vitest';
import { createWorld, Entity } from '@/core/ecs';
import { runSpriteAnimationSystem } from '@/core/systems';

describe('Sprite Animation System', () => {
  it('resets frame when not moving', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      spriteAnimation: {
        frameIndex: 2,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0.1,
        direction: 0,
        isMoving: false,
      },
    };

    world.add(entity);
    runSpriteAnimationSystem(world, 0.1);

    expect(entity.spriteAnimation?.frameIndex).toBe(0);
    expect(entity.spriteAnimation?.elapsed).toBe(0);
  });

  it('advances frame when elapsed exceeds duration', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      spriteAnimation: {
        frameIndex: 0,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0.1,
        direction: 0,
        isMoving: true,
      },
    };

    world.add(entity);
    runSpriteAnimationSystem(world, 0.05);

    expect(entity.spriteAnimation?.frameIndex).toBe(1);
  });

  it('wraps frame index at frameCount boundary', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      spriteAnimation: {
        frameIndex: 2,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0.12,
        direction: 0,
        isMoving: true,
      },
    };

    world.add(entity);
    runSpriteAnimationSystem(world, 0.01);

    expect(entity.spriteAnimation?.frameIndex).toBe(0);
  });

  it('does not advance frame before duration', () => {
    const world = createWorld();

    const entity: Entity = {
      id: 'player',
      spriteAnimation: {
        frameIndex: 1,
        frameCount: 3,
        frameDuration: 0.125,
        elapsed: 0,
        direction: 0,
        isMoving: true,
      },
    };

    world.add(entity);
    runSpriteAnimationSystem(world, 0.05);

    expect(entity.spriteAnimation?.frameIndex).toBe(1);
    expect(entity.spriteAnimation?.elapsed).toBeCloseTo(0.05);
  });
});
