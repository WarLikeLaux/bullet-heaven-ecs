import { describe, it, expect } from 'vitest';
import { World } from 'miniplex';
import { Vector3 } from 'three';
import { Entity } from '@/core/ecs';
import { runMagneticFieldSystem } from '@/core/magnetic-field';

function makeWorld() {
  return new World<Entity>();
}

describe('runMagneticFieldSystem', () => {
  it('damages enemies within range', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      position: new Vector3(0, 0, 0),
      playerInput: { up: false, down: false, left: false, right: false },
      magneticDamage: 10,
      magneticRadius: 3,
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(1, 0, 0),
      enemy: true,
      hp: 50,
    };
    world.add(player);
    world.add(enemy);

    runMagneticFieldSystem(world, 1, 0);
    expect(enemy.hp).toBe(40);
  });

  it('does not damage enemies out of range', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      position: new Vector3(0, 0, 0),
      playerInput: { up: false, down: false, left: false, right: false },
      magneticDamage: 10,
      magneticRadius: 2,
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(10, 10, 0),
      enemy: true,
      hp: 50,
    };
    world.add(player);
    world.add(enemy);

    runMagneticFieldSystem(world, 1, 0);
    expect(enemy.hp).toBe(50);
  });

  it('skips if no magnetic fields', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      position: new Vector3(0, 0, 0),
      playerInput: { up: false, down: false, left: false, right: false },
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(1, 0, 0),
      enemy: true,
      hp: 50,
    };
    world.add(player);
    world.add(enemy);

    runMagneticFieldSystem(world, 1, 0);
    expect(enemy.hp).toBe(50);
  });

  it('scales damage with dt', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      position: new Vector3(0, 0, 0),
      playerInput: { up: false, down: false, left: false, right: false },
      magneticDamage: 10,
      magneticRadius: 3,
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(1, 0, 0),
      enemy: true,
      hp: 50,
    };
    world.add(player);
    world.add(enemy);

    runMagneticFieldSystem(world, 0.5, 0);
    expect(enemy.hp).toBeCloseTo(45);
  });
});
