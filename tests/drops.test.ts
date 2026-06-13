import { describe, it, expect } from 'vitest';
import { World } from 'miniplex';
import { Vector3 } from 'three';
import { Entity } from '@/core/ecs';
import { runPickupSystem } from '@/core/drops';
import { addRawXp } from '@/core/progression';

function makeWorld() {
  return new World<Entity>();
}

function pos(e: Entity): Vector3 {
  if (!e.position) throw new Error('no position');
  return e.position;
}

function makePlayer(x = 0, y = 0): Entity {
  return {
    id: 'player',
    position: new Vector3(x, y, 0),
    playerInput: { up: false, down: false, left: false, right: false },
    hp: 50,
    maxHp: 100,
    xp: 0,
    xpToNext: 50,
    level: 1,
    pickupRadius: 1,
  };
}

describe('runPickupSystem', () => {
  it('collects xp crystals within collect radius', () => {
    const world = makeWorld();
    const player = makePlayer();
    world.add(player);
    const drop: Entity = {
      id: 'drop-0',
      position: new Vector3(0.1, 0, 0),
      view: { position: new Vector3() } as Entity['view'],
      pickup: 'xp',
      pickupValue: 10,
    };
    world.add(drop);

    const result = runPickupSystem(world, player, 0.016);
    expect(result.xpGained).toBe(10);
    expect(drop.dead).toBe(true);
  });

  it('collects heal drops and returns hpGained', () => {
    const world = makeWorld();
    const player = makePlayer();
    world.add(player);
    const drop: Entity = {
      id: 'drop-1',
      position: new Vector3(0.1, 0, 0),
      view: { position: new Vector3() } as Entity['view'],
      pickup: 'heal',
      pickupValue: 15,
    };
    world.add(drop);

    const result = runPickupSystem(world, player, 0.016);
    expect(result.hpGained).toBe(15);
  });

  it('pulls drops within magnet radius', () => {
    const world = makeWorld();
    const player = makePlayer();
    world.add(player);
    const drop: Entity = {
      id: 'drop-2',
      position: new Vector3(1.2, 0, 0),
      view: { position: new Vector3() } as Entity['view'],
      pickup: 'xp',
      pickupValue: 5,
    };
    world.add(drop);

    const startX = pos(drop).x;
    runPickupSystem(world, player, 0.016);
    expect(pos(drop).x).toBeLessThan(startX);
  });

  it('does not pull drops outside magnet radius', () => {
    const world = makeWorld();
    const player = makePlayer();
    world.add(player);
    const drop: Entity = {
      id: 'drop-3',
      position: new Vector3(20, 0, 0),
      view: { position: new Vector3() } as Entity['view'],
      pickup: 'xp',
      pickupValue: 5,
    };
    world.add(drop);

    runPickupSystem(world, player, 0.016);
    expect(pos(drop).x).toBe(20);
  });

  it('larger pickupRadius attracts from further', () => {
    const world = makeWorld();
    const player = makePlayer();
    player.pickupRadius = 3;
    world.add(player);
    const drop: Entity = {
      id: 'drop-4',
      position: new Vector3(3, 0, 0),
      view: { position: new Vector3() } as Entity['view'],
      pickup: 'xp',
      pickupValue: 5,
    };
    world.add(drop);

    const startX = pos(drop).x;
    runPickupSystem(world, player, 0.016);
    expect(pos(drop).x).toBeLessThan(startX);
  });
});

describe('addRawXp', () => {
  it('adds xp with multiplier', () => {
    const player = makePlayer();
    player.xpMultiplier = 2;
    addRawXp(player, 10);
    expect(player.xp).toBe(20);
  });

  it('triggers level up', () => {
    const player = makePlayer();
    player.xp = 45;
    const levels = addRawXp(player, 10);
    expect(levels).toBe(1);
    expect(player.level).toBe(2);
  });
});
