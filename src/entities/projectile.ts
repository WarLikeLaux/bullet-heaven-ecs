import { CircleGeometry, MeshBasicMaterial, Mesh, Vector3, Scene } from 'three';
import { Entity } from '@/core/ecs';
import {
  PROJECTILE_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_RADIUS,
  PROJECTILE_COLOR,
  PROJECTILE_LIFETIME,
} from '@/config';

let nextProjectileId = 0;

export function createProjectile(
  scene: Scene,
  origin: Vector3,
  direction: Vector3,
  damage = PROJECTILE_DAMAGE,
  speed = PROJECTILE_SPEED
): Entity {
  const geometry = new CircleGeometry(PROJECTILE_RADIUS, 8);
  const material = new MeshBasicMaterial({ color: PROJECTILE_COLOR });
  const mesh = new Mesh(geometry, material);
  mesh.position.copy(origin);
  scene.add(mesh);

  const id = `proj-${nextProjectileId}`;
  nextProjectileId += 1;

  const velocity = direction.clone().normalize().multiplyScalar(speed);

  return {
    id,
    position: origin.clone(),
    velocity,
    view: mesh,
    projectile: true,
    damage,
    lifetime: PROJECTILE_LIFETIME,
  };
}
