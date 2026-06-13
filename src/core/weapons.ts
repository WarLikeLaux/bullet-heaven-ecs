import { World } from 'miniplex';
import { Vector3, Scene } from 'three';
import { Entity } from '@/core/ecs';
import { createProjectile } from '@/entities/projectile';
import {
  FIRE_INTERVAL,
  FIRE_RANGE,
  PROJECTILE_RADIUS,
  ENEMY_SCALE,
  HIT_FLASH_DURATION,
} from '@/config';
import { VfxSheet } from '@/rendering/vfx-sprite';
import { playShoot, playHit } from '@/core/audio';

const AIM_VECTOR = new Vector3();
const SPREAD_VECTOR = new Vector3();
const FIRE_RANGE_SQ = FIRE_RANGE * FIRE_RANGE;
const MULTISHOT_SPREAD = 0.15;

function effectiveHp(e: Entity): number {
  return (e.hp ?? 0) - (e.pendingDamage ?? 0);
}

export function findNearestEnemy(
  playerPos: Vector3,
  enemies: Iterable<Entity>
): Entity | null {
  let nearest: Entity | null = null;
  let nearestDistSq = FIRE_RANGE_SQ;

  for (const enemy of enemies) {
    if (!enemy.position) continue;
    if (effectiveHp(enemy) <= 0) continue;
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

function applyCrit(baseDmg: number, critChance: number): number {
  if (critChance <= 0) return baseDmg;
  if (Math.random() < critChance) return baseDmg * 2;
  return baseDmg;
}

function fireMainProjectile(
  world: World<Entity>,
  scene: Scene,
  player: Entity,
  target: Entity,
  direction: Vector3,
  vfxSheet?: VfxSheet
) {
  const baseDmg = player.weaponDamage ?? undefined;
  const pos = player.position;
  if (!pos) return;
  const dmg = baseDmg ? applyCrit(baseDmg, player.critChance ?? 0) : undefined;
  const projectile = createProjectile(
    scene,
    pos,
    direction,
    dmg,
    undefined,
    vfxSheet
  );
  projectile.targetRef = target;
  target.pendingDamage = (target.pendingDamage ?? 0) + (projectile.damage ?? 0);
  world.add(projectile);
}

function fireExtraProjectile(
  world: World<Entity>,
  scene: Scene,
  player: Entity,
  direction: Vector3,
  vfxSheet?: VfxSheet
) {
  const baseDmg = player.weaponDamage ?? undefined;
  const pos = player.position;
  if (!pos) return;
  const dmg = baseDmg ? applyCrit(baseDmg, player.critChance ?? 0) : undefined;
  const projectile = createProjectile(
    scene,
    pos,
    direction,
    dmg,
    undefined,
    vfxSheet
  );
  world.add(projectile);
}

export function runAutoFireSystem(
  world: World<Entity>,
  scene: Scene,
  dt: number,
  vfxSheet?: VfxSheet
) {
  const players = world.with('position', 'playerInput', 'fireTimer');
  const enemies = world.with('enemy', 'position', 'hp');

  for (const player of players) {
    player.fireTimer -= dt;
    if (player.fireTimer > 0) continue;

    const target = findNearestEnemy(player.position, enemies);
    if (!target?.position) continue;

    player.fireTimer = player.fireInterval ?? FIRE_INTERVAL;
    AIM_VECTOR.subVectors(target.position, player.position);

    fireMainProjectile(world, scene, player, target, AIM_VECTOR, vfxSheet);

    const extra = player.multishotCount ?? 0;
    for (let i = 0; i < extra; i++) {
      const angle = (i + 1) * MULTISHOT_SPREAD * (i % 2 === 0 ? 1 : -1);
      SPREAD_VECTOR.copy(AIM_VECTOR);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rx = SPREAD_VECTOR.x * cos - SPREAD_VECTOR.y * sin;
      const ry = SPREAD_VECTOR.x * sin + SPREAD_VECTOR.y * cos;
      SPREAD_VECTOR.set(rx, ry, 0);
      fireExtraProjectile(world, scene, player, SPREAD_VECTOR, vfxSheet);
    }

    playShoot();
  }
}

const HIT_RADIUS = ENEMY_SCALE / 2 + PROJECTILE_RADIUS;
const HIT_RADIUS_SQ = HIT_RADIUS * HIT_RADIUS;

function releasePending(proj: Entity) {
  const t = proj.targetRef;
  if (!t) return;
  t.pendingDamage = Math.max(0, (t.pendingDamage ?? 0) - (proj.damage ?? 0));
  proj.targetRef = undefined;
}

export function runProjectileHitSystem(world: World<Entity>, elapsed: number) {
  const projectiles = world.with('projectile', 'position', 'damage');
  const enemies = world.with('enemy', 'position', 'hp');

  for (const proj of projectiles) {
    for (const enemy of enemies) {
      const dx = proj.position.x - enemy.position.x;
      const dy = proj.position.y - enemy.position.y;
      if (dx * dx + dy * dy >= HIT_RADIUS_SQ) continue;

      releasePending(proj);
      enemy.hp -= proj.damage;
      world.addComponent(proj, 'dead', true);
      world.addComponent(enemy, 'hitFlashUntil', elapsed + HIT_FLASH_DURATION);
      playHit();
      if (enemy.hp <= 0) enemy.hp = 0;
      break;
    }
  }
}

export function runLifetimeSystem(world: World<Entity>, dt: number) {
  const query = world.with('lifetime');

  for (const entity of query) {
    entity.lifetime -= dt;
    if (entity.lifetime <= 0) {
      releasePending(entity);
      world.addComponent(entity, 'dead', true);
    }
  }
}
