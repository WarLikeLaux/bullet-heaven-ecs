import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Scene,
  Texture,
} from 'three';
import { Entity, DIRECTION_DOWN } from '@/core/ecs';
import { configureSpritesheet, FRAME_COUNT } from '@/rendering/spritesheet';
import {
  ENEMY_SPEED,
  ENEMY_SCALE,
  ANIMATION_FPS,
  ENEMY_HP,
  ENEMY_HP_PER_MINUTE,
  ENEMY_DAMAGE,
} from '@/config';

let nextEnemyId = 0;

export function createEnemy(
  scene: Scene,
  spawnPosition: Vector3,
  chaseTarget: Vector3,
  baseTexture: Texture,
  elapsed = 0
): Entity {
  const texture = baseTexture.clone();
  configureSpritesheet(texture);

  const geometry = new PlaneGeometry(ENEMY_SCALE, ENEMY_SCALE);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.copy(spawnPosition);
  scene.add(mesh);

  const id = `enemy-${nextEnemyId}`;
  nextEnemyId += 1;

  return {
    id,
    position: spawnPosition.clone(),
    velocity: new Vector3(0, 0, 0),
    speed: ENEMY_SPEED,
    view: mesh,
    enemy: true,
    chaseTarget,
    spriteTexture: texture,
    hp: ENEMY_HP + Math.floor(elapsed / 60) * ENEMY_HP_PER_MINUTE,
    damage: ENEMY_DAMAGE,
    spriteAnimation: {
      frameIndex: 0,
      frameCount: FRAME_COUNT,
      frameDuration: 1 / ANIMATION_FPS,
      elapsed: 0,
      direction: DIRECTION_DOWN,
      isMoving: true,
    },
  };
}
