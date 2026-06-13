import { Mesh } from 'three';
import { World } from 'miniplex';
import { Entity } from '@/core/ecs';
import { WeaponContext, WeaponInstance } from '@/core/weapon-registry';
import {
  createVfxMesh,
  setVfxFrame,
  animateVfxFrame,
  VfxSheet,
} from '@/rendering/vfx-sprite';
import {
  ORBITER_COUNT,
  ORBITER_RADIUS,
  ORBITER_SPEED,
  ORBITER_DAMAGE,
  ORBITER_SIZE,
  HIT_FLASH_DURATION,
  ENEMY_SCALE,
} from '@/config';

const HIT_DIST_SQ = (ENEMY_SCALE / 2 + ORBITER_SIZE) ** 2;

function createOrb(ctx: WeaponContext, angle: number, sheet: VfxSheet): Entity {
  const mesh = createVfxMesh(ctx.scene, sheet, ORBITER_SIZE * 3, 0.6);
  const entity: Entity = {
    id: `orb-${Math.random().toString(36).slice(2, 8)}`,
    position: mesh.position,
    view: mesh,
    damage: ORBITER_DAMAGE,
    orbiterOwner: ctx.player,
    orbiterAngle: angle,
  };
  ctx.world.add(entity);
  return entity;
}

function updateOrbs(world: World<Entity>, elapsed: number, sheet: VfxSheet) {
  const orbs = world.with('orbiterOwner', 'orbiterAngle', 'position', 'view');
  const enemies = world.with('enemy', 'position', 'hp');
  const frame = animateVfxFrame(sheet, elapsed);

  for (const orb of orbs) {
    const ownerPos = orb.orbiterOwner.position;
    if (!ownerPos) continue;
    const angle = orb.orbiterAngle + elapsed * ORBITER_SPEED;
    orb.position.x = ownerPos.x + Math.cos(angle) * ORBITER_RADIUS;
    orb.position.y = ownerPos.y + Math.sin(angle) * ORBITER_RADIUS;
    setVfxFrame(orb.view as Mesh, sheet, frame);

    for (const enemy of enemies) {
      if (enemy.hitFlashUntil && elapsed < enemy.hitFlashUntil) continue;
      const dx = orb.position.x - enemy.position.x;
      const dy = orb.position.y - enemy.position.y;
      if (dx * dx + dy * dy >= HIT_DIST_SQ) continue;
      enemy.hp -= orb.damage ?? ORBITER_DAMAGE;
      if (enemy.hp <= 0) enemy.hp = 0;
      world.addComponent(enemy, 'hitFlashUntil', elapsed + HIT_FLASH_DURATION);
      break;
    }
  }
}

export function createOrbiterWeapon(ctx: WeaponContext): WeaponInstance {
  const sheet = ctx.vfxSheets.orb;
  const step = (Math.PI * 2) / ORBITER_COUNT;
  for (let i = 0; i < ORBITER_COUNT; i++) {
    createOrb(ctx, step * i, sheet);
  }
  return {
    id: 'orbiter',
    update: (c: WeaponContext) => updateOrbs(c.world, c.elapsed, sheet),
  };
}
