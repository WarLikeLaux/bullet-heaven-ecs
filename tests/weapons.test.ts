import { describe, it, expect, vi } from 'vitest';
import { Vector3, Scene } from 'three';
import { createWorld, Entity } from '@/core/ecs';
import {
  findNearestEnemy,
  runAutoFireSystem,
  runProjectileHitSystem,
  runLifetimeSystem,
} from '@/core/weapons';
import { FIRE_RANGE, FIRE_INTERVAL } from '@/config';

vi.mock('@/entities/projectile', () => ({
  createProjectile: (_scene: Scene, origin: Vector3, dir: Vector3) => ({
    id: `proj-mock`,
    position: origin.clone(),
    velocity: dir.clone().normalize().multiplyScalar(10),
    projectile: true as const,
    damage: 15,
    lifetime: 3,
  }),
}));

function makePlayer(x = 0, y = 0): Entity {
  return {
    id: 'player',
    position: new Vector3(x, y, 0),
    velocity: new Vector3(),
    playerInput: { up: false, down: false, left: false, right: false },
    fireTimer: 0,
  };
}

function makeEnemy(x = 0, y = 0, hp = 30): Entity {
  return {
    id: 'enemy-0',
    position: new Vector3(x, y, 0),
    velocity: new Vector3(),
    enemy: true,
    hp,
  };
}

describe('findNearestEnemy', () => {
  it('finds closest enemy in range', () => {
    const playerPos = new Vector3(0, 0, 0);
    const enemies: Entity[] = [
      { id: 'e1', position: new Vector3(5, 0, 0), hp: 30 },
      { id: 'e2', position: new Vector3(2, 0, 0), hp: 30 },
      { id: 'e3', position: new Vector3(8, 0, 0), hp: 30 },
    ];

    const nearest = findNearestEnemy(playerPos, enemies);
    expect(nearest?.position?.x).toBe(2);
  });

  it('returns null if no enemies in range', () => {
    const playerPos = new Vector3(0, 0, 0);
    const enemies: Entity[] = [
      { id: 'far', position: new Vector3(FIRE_RANGE + 1, 0, 0), hp: 30 },
    ];

    expect(findNearestEnemy(playerPos, enemies)).toBeNull();
  });

  it('returns null for empty list', () => {
    expect(findNearestEnemy(new Vector3(), [])).toBeNull();
  });
});

describe('runAutoFireSystem', () => {
  it('fires when timer expired and enemy in range', () => {
    const world = createWorld();
    const scene = { add: vi.fn() } as unknown as Scene;
    const player = makePlayer();
    const enemy = makeEnemy(3, 0);
    world.add(player);
    world.add(enemy);

    runAutoFireSystem(world, scene, 0.1);

    expect(world.entities.length).toBe(3);
  });

  it('does not fire during cooldown', () => {
    const world = createWorld();
    const scene = { add: vi.fn() } as unknown as Scene;
    const player = makePlayer();
    player.fireTimer = FIRE_INTERVAL;
    const enemy = makeEnemy(3, 0);
    world.add(player);
    world.add(enemy);

    runAutoFireSystem(world, scene, 0.1);

    expect(world.entities.length).toBe(2);
  });

  it('does not fire without enemies', () => {
    const world = createWorld();
    const scene = { add: vi.fn() } as unknown as Scene;
    const player = makePlayer();
    world.add(player);

    runAutoFireSystem(world, scene, 0.1);

    expect(world.entities.length).toBe(1);
  });
});

describe('runProjectileHitSystem', () => {
  it('damages enemy on hit', () => {
    const world = createWorld();
    const proj: Entity = {
      id: 'proj',
      position: new Vector3(0, 0, 0),
      projectile: true,
      damage: 15,
    };
    const enemy = makeEnemy(0, 0, 30);
    world.add(proj);
    world.add(enemy);

    runProjectileHitSystem(world, 0);

    expect(enemy.hp).toBe(15);
    expect(proj.dead).toBe(true);
  });

  it('sets hitFlashUntil when hp reaches 0 (death deferred to flash)', () => {
    const world = createWorld();
    const proj: Entity = {
      id: 'proj',
      position: new Vector3(0, 0, 0),
      projectile: true,
      damage: 30,
    };
    const enemy = makeEnemy(0, 0, 30);
    world.add(proj);
    world.add(enemy);

    runProjectileHitSystem(world, 1);

    expect(enemy.hp).toBe(0);
    expect(enemy.dead).toBeUndefined();
    expect(enemy.hitFlashUntil).toBeGreaterThan(1);
  });

  it('does not hit enemy out of range', () => {
    const world = createWorld();
    const proj: Entity = {
      id: 'proj',
      position: new Vector3(0, 0, 0),
      projectile: true,
      damage: 15,
    };
    const enemy = makeEnemy(10, 10, 30);
    world.add(proj);
    world.add(enemy);

    runProjectileHitSystem(world, 0);

    expect(enemy.hp).toBe(30);
    expect(proj.dead).toBeUndefined();
  });
});

describe('runLifetimeSystem', () => {
  it('decrements lifetime', () => {
    const world = createWorld();
    const entity: Entity = { id: 'e', lifetime: 3 };
    world.add(entity);

    runLifetimeSystem(world, 1);

    expect(entity.lifetime).toBe(2);
  });

  it('marks dead when lifetime expires', () => {
    const world = createWorld();
    const entity: Entity = { id: 'e', lifetime: 0.5 };
    world.add(entity);

    runLifetimeSystem(world, 1);

    expect(entity.dead).toBe(true);
  });

  it('does not mark dead with remaining lifetime', () => {
    const world = createWorld();
    const entity: Entity = { id: 'e', lifetime: 5 };
    world.add(entity);

    runLifetimeSystem(world, 1);

    expect(entity.dead).toBeUndefined();
  });
});
