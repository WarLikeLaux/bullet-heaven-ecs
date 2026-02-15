import { World } from 'miniplex';
import { Vector3, Scene } from 'three';
import { Entity } from '@/core/ecs';
import { createProjectile } from '@/entities/projectile';
import {
  FIRE_INTERVAL,
  FIRE_RANGE,
  PROJECTILE_RADIUS,
  ENEMY_SCALE,
} from '@/config';

const AIM_VECTOR = new Vector3();
const FIRE_RANGE_SQ = FIRE_RANGE * FIRE_RANGE;

export function findNearestEnemy(
  playerPos: Vector3,
  enemies: Iterable<{ position: Vector3 }>
): { position: Vector3 } | null {
  let nearest: { position: Vector3 } | null = null;
  let nearestDistSq = FIRE_RANGE_SQ;

  for (const enemy of enemies) {
    const dx = enemy.position.x - playerPos.x;
    const dy = enemy.position.y - playerPos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = enemy;
    }
  }

  return nearest;
}

export function runAutoFireSystem(
  world: World<Entity>,
  scene: Scene,
  dt: number
) {
  const players = world.with('position', 'playerInput', 'fireTimer');
  const enemies = world.with('enemy', 'position', 'hp');

  for (const player of players) {
    player.fireTimer -= dt;
    if (player.fireTimer > 0) continue;

    const target = findNearestEnemy(player.position, enemies);
    if (!target) continue;

    player.fireTimer = player.fireInterval ?? FIRE_INTERVAL;

    AIM_VECTOR.subVectors(target.position, player.position);
    const dmg = player.weaponDamage ?? undefined;
    const projectile = createProjectile(
      scene,
      player.position,
      AIM_VECTOR,
      dmg
    );
    world.add(projectile);
  }
}

const HIT_RADIUS = ENEMY_SCALE / 2 + PROJECTILE_RADIUS;
const HIT_RADIUS_SQ = HIT_RADIUS * HIT_RADIUS;

export function runProjectileHitSystem(world: World<Entity>) {
  const projectiles = world.with('projectile', 'position', 'damage');
  const enemies = world.with('enemy', 'position', 'hp');

  for (const proj of projectiles) {
    for (const enemy of enemies) {
      const dx = proj.position.x - enemy.position.x;
      const dy = proj.position.y - enemy.position.y;

      if (dx * dx + dy * dy >= HIT_RADIUS_SQ) continue;

      enemy.hp -= proj.damage;
      world.addComponent(proj, 'dead', true);

      if (enemy.hp <= 0) {
        enemy.hp = 0;
        world.addComponent(enemy, 'dead', true);
      }

      break;
    }
  }
}

export function runLifetimeSystem(world: World<Entity>, dt: number) {
  const query = world.with('lifetime');

  for (const entity of query) {
    entity.lifetime -= dt;

    if (entity.lifetime <= 0) {
      world.addComponent(entity, 'dead', true);
    }
  }
}
