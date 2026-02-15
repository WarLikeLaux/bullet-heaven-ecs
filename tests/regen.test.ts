import { describe, it, expect } from 'vitest';
import { World } from 'miniplex';
import { Entity } from '@/core/ecs';
import { runRegenSystem } from '@/core/regen';

function makeWorld() {
  return new World<Entity>();
}

describe('runRegenSystem', () => {
  it('regenerates hp over time', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      hp: 50,
      maxHp: 100,
      regen: 2,
      playerInput: { up: false, down: false, left: false, right: false },
    };
    world.add(player);

    runRegenSystem(world, 1);
    expect(player.hp).toBeCloseTo(52);
  });

  it('does not exceed maxHp', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      hp: 99,
      maxHp: 100,
      regen: 5,
      playerInput: { up: false, down: false, left: false, right: false },
    };
    world.add(player);

    runRegenSystem(world, 1);
    expect(player.hp).toBe(100);
  });

  it('skips if no regen', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      hp: 50,
      maxHp: 100,
      playerInput: { up: false, down: false, left: false, right: false },
    };
    world.add(player);

    runRegenSystem(world, 1);
    expect(player.hp).toBe(50);
  });

  it('skips if already full hp', () => {
    const world = makeWorld();
    const player: Entity = {
      id: 'player',
      hp: 100,
      maxHp: 100,
      regen: 3,
      playerInput: { up: false, down: false, left: false, right: false },
    };
    world.add(player);

    runRegenSystem(world, 1);
    expect(player.hp).toBe(100);
  });
});
