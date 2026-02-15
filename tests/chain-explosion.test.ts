import { describe, it, expect } from 'vitest';
import { World } from 'miniplex';
import { Vector3 } from 'three';
import { Entity } from '@/core/ecs';
import { runChainExplosionSystem } from '@/core/chain-explosion';

function makeWorld() {
  return new World<Entity>();
}

describe('runChainExplosionSystem', () => {
  it('damages nearby enemies on death', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      chainExplosionDamage: 20,
      chainExplosionRadius: 3,
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(1, 0, 0),
      enemy: true,
      hp: 50,
    };
    world.add(enemy);

    runChainExplosionSystem(world, [{ x: 0, y: 0 }], player, 0);
    expect(enemy.hp).toBe(30);
  });

  it('does not damage enemies out of range', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      chainExplosionDamage: 20,
      chainExplosionRadius: 1,
    };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(10, 10, 0),
      enemy: true,
      hp: 50,
    };
    world.add(enemy);

    runChainExplosionSystem(world, [{ x: 0, y: 0 }], player, 0);
    expect(enemy.hp).toBe(50);
  });

  it('does nothing without chain explosion upgrade', () => {
    const world = makeWorld();
    const player: Entity = { id: 'player' };
    const enemy: Entity = {
      id: 'e1',
      position: new Vector3(0, 0, 0),
      enemy: true,
      hp: 50,
    };
    world.add(enemy);

    runChainExplosionSystem(world, [{ x: 0, y: 0 }], player, 0);
    expect(enemy.hp).toBe(50);
  });
});
