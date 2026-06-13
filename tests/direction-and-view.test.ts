import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  createWorld,
  Entity,
  DIRECTION_DOWN,
  DIRECTION_UP,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
} from '@/core/ecs';
import { runInputSystem, runMovementSystem } from '@/core/systems';
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';

function createPlayerEntity(
  input: { up: boolean; down: boolean; left: boolean; right: boolean },
  withAnimation = false
): Entity {
  const entity: Entity = {
    id: 'player',
    velocity: new Vector3(0, 0, 0),
    speed: 5,
    playerInput: input,
  };

  if (withAnimation) {
    entity.spriteAnimation = {
      frameIndex: 0,
      frameCount: 3,
      frameDuration: 0.125,
      elapsed: 0,
      direction: DIRECTION_DOWN,
      isMoving: false,
    };
  }

  return entity;
}

describe('Input System — direction resolution', () => {
  it('resolves down direction', () => {
    const world = createWorld();
    const entity = createPlayerEntity(
      { up: false, down: true, left: false, right: false },
      true
    );
    world.add(entity);
    runInputSystem(world);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_DOWN);
  });

  it('resolves up direction', () => {
    const world = createWorld();
    const entity = createPlayerEntity(
      { up: true, down: false, left: false, right: false },
      true
    );
    world.add(entity);
    runInputSystem(world);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_UP);
  });

  it('resolves left direction', () => {
    const world = createWorld();
    const entity = createPlayerEntity(
      { up: false, down: false, left: true, right: false },
      true
    );
    world.add(entity);
    runInputSystem(world);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_LEFT);
  });

  it('resolves right direction', () => {
    const world = createWorld();
    const entity = createPlayerEntity(
      { up: false, down: false, left: false, right: true },
      true
    );
    world.add(entity);
    runInputSystem(world);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_RIGHT);
  });

  it('prioritizes down over up when both pressed', () => {
    const world = createWorld();
    const entity = createPlayerEntity(
      { up: true, down: true, left: false, right: false },
      true
    );
    world.add(entity);
    runInputSystem(world);
    expect(entity.spriteAnimation?.direction).toBe(DIRECTION_DOWN);
  });
});

describe('Movement System — view sync', () => {
  it('syncs mesh position with entity position', () => {
    const world = createWorld();
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());

    const entity: Entity = {
      id: 'test',
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(4, 3, 0),
      view: mesh,
    };

    world.add(entity);
    runMovementSystem(world, 1.0);

    expect(mesh.position.x).toBe(4);
    expect(mesh.position.y).toBe(3);
  });
});
