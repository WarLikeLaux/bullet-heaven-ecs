import { Vector3, Scene, Mesh } from 'three';
import { Entity } from '@/core/ecs';
import { VfxSheet } from '@/rendering/vfx-sprite';
import {
  createVfxMesh,
  setVfxFrame,
  animateVfxFrame,
} from '@/rendering/vfx-sprite';
import {
  PROJECTILE_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_LIFETIME,
} from '@/config';

let nextProjectileId = 0;

export function createProjectile(
  scene: Scene,
  origin: Vector3,
  direction: Vector3,
  damage = PROJECTILE_DAMAGE,
  speed = PROJECTILE_SPEED,
  vfxSheet?: VfxSheet
): Entity {
  const dir = direction.clone().normalize();
  const velocity = dir.multiplyScalar(speed);
  let view: Mesh | undefined;

  if (vfxSheet) {
    view = createVfxMesh(scene, vfxSheet, 1.2, 0.5);
    view.position.copy(origin);
  }

  const id = `proj-${nextProjectileId}`;
  nextProjectileId += 1;

  return {
    id,
    position: view ? view.position : origin.clone(),
    velocity,
    view,
    projectile: true,
    damage,
    lifetime: PROJECTILE_LIFETIME,
  };
}

export function updateProjectileVfx(
  entity: Entity,
  sheet: VfxSheet,
  elapsed: number
) {
  if (!entity.view) return;
  const frame = animateVfxFrame(sheet, elapsed);
  setVfxFrame(entity.view as Mesh, sheet, frame);
}
