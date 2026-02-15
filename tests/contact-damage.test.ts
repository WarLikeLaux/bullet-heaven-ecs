import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { createWorld, Entity } from '@/core/ecs';
import { runContactDamageSystem } from '@/core/combat';
import { IFRAME_DURATION, COLLISION_RADIUS } from '@/config';

function makePlayer(x = 0, y = 0, hp = 100): Entity {
  return {
    id: 'player',
    position: new Vector3(x, y, 0),
    velocity: new Vector3(),
    hp,
    maxHp: 100,
    invulnerableUntil: 0,
    playerInput: { up: false, down: false, left: false, right: false },
  };
}

function makeEnemy(x = 0, y = 0, damage = 10): Entity {
  return {
    id: 'enemy-0',
    position: new Vector3(x, y, 0),
    velocity: new Vector3(),
    enemy: true,
    damage,
  };
}

describe('Contact Damage System', () => {
  it('damages player on contact', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(90);
  });

  it('does not damage when out of range', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(10, 10, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(100);
  });

  it('respects iframes', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);
    expect(player.hp).toBe(90);

    runContactDamageSystem(world, 0.5);
    expect(player.hp).toBe(90);
  });

  it('allows damage after iframes expire', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);
    expect(player.hp).toBe(90);

    runContactDamageSystem(world, IFRAME_DURATION + 0.01);
    expect(player.hp).toBe(80);
  });

  it('sets dead when hp reaches 0', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 10);
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(0);
    expect(player.dead).toBe(true);
  });

  it('clamps hp to 0', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 5);
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(0);
  });

  it('damages at collision radius boundary', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(COLLISION_RADIUS - 0.01, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(90);
  });

  it('does not damage at exactly collision radius', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    const enemy = makeEnemy(COLLISION_RADIUS, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(100);
  });

  it('only takes damage from one enemy per iframe cycle', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    world.add(player);
    world.add(makeEnemy(0, 0, 10));
    world.add(makeEnemy(0.1, 0, 10));

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(90);
  });

  it('armor reduces incoming damage', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    player.armor = 3;
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(93);
  });

  it('armor does not reduce damage below 1', () => {
    const world = createWorld();
    const player = makePlayer(0, 0, 100);
    player.armor = 50;
    const enemy = makeEnemy(0, 0, 10);
    world.add(player);
    world.add(enemy);

    runContactDamageSystem(world, 0);

    expect(player.hp).toBe(99);
  });
});
