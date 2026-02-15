import {
  CircleGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Scene,
  Group,
  AdditiveBlending,
} from 'three';
import { Entity } from '@/core/ecs';
import {
  PROJECTILE_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_RADIUS,
  PROJECTILE_COLOR,
  PROJECTILE_LIFETIME,
  TRAIL_LENGTH,
  TRAIL_OPACITY_START,
} from '@/config';

let nextProjectileId = 0;

function createGlowMesh(): Mesh {
  const geo = new CircleGeometry(PROJECTILE_RADIUS * 2.5, 12);
  const mat = new MeshBasicMaterial({
    color: PROJECTILE_COLOR,
    transparent: true,
    opacity: 0.25,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  return new Mesh(geo, mat);
}

function createTrailDot(index: number): Mesh {
  const scale = 1 - (index + 1) / (TRAIL_LENGTH + 1);
  const radius = PROJECTILE_RADIUS * scale;
  const geo = new CircleGeometry(radius, 6);
  const opacity = TRAIL_OPACITY_START * scale;
  const mat = new MeshBasicMaterial({
    color: PROJECTILE_COLOR,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new Mesh(geo, mat);
}

export function createProjectile(
  scene: Scene,
  origin: Vector3,
  direction: Vector3,
  damage = PROJECTILE_DAMAGE,
  speed = PROJECTILE_SPEED
): Entity {
  const group = new Group();

  const coreGeo = new CircleGeometry(PROJECTILE_RADIUS, 8);
  const coreMat = new MeshBasicMaterial({ color: 0xffffff });
  const core = new Mesh(coreGeo, coreMat);
  group.add(core);
  group.add(createGlowMesh());

  const dir = direction.clone().normalize();
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dot = createTrailDot(i);
    dot.position.x = -dir.x * (i + 1) * PROJECTILE_RADIUS * 3;
    dot.position.y = -dir.y * (i + 1) * PROJECTILE_RADIUS * 3;
    group.add(dot);
  }

  group.position.copy(origin);
  scene.add(group);

  const id = `proj-${nextProjectileId}`;
  nextProjectileId += 1;

  const velocity = dir.multiplyScalar(speed);

  return {
    id,
    position: origin.clone(),
    velocity,
    view: group,
    projectile: true,
    damage,
    lifetime: PROJECTILE_LIFETIME,
  };
}
