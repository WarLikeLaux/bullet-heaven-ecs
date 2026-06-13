import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Scene,
  Texture,
} from 'three';
import { Entity, DIRECTION_DOWN } from '@/core/ecs';
import { createInputState, bindInput, bindMouseInput } from '@/core/input';
import { configureSpritesheet, FRAME_COUNT } from '@/rendering/spritesheet';
import {
  PLAYER_SPEED,
  SPRITE_SCALE,
  ANIMATION_FPS,
  PLAYER_HP,
  BASE_XP_TO_LEVEL,
  FIRE_INTERVAL,
  PROJECTILE_DAMAGE,
  IFRAME_DURATION,
} from '@/config';

type PlayerResult = {
  entity: Entity;
  material: MeshBasicMaterial;
};

export function createPlayer(scene: Scene, texture: Texture): PlayerResult {
  configureSpritesheet(texture);

  const geometry = new PlaneGeometry(SPRITE_SCALE, SPRITE_SCALE);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  const inputState = createInputState();
  bindInput(inputState);
  bindMouseInput(inputState);

  const entity: Entity = {
    id: 'player',
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    speed: PLAYER_SPEED,
    view: mesh,
    playerInput: inputState,
    spriteTexture: texture,
    hp: PLAYER_HP,
    maxHp: PLAYER_HP,
    invulnerableUntil: 0,
    fireTimer: 0,
    fireInterval: FIRE_INTERVAL,
    weaponDamage: PROJECTILE_DAMAGE,
    xpMultiplier: 1,
    iframeDuration: IFRAME_DURATION,
    xp: 0,
    xpToNext: BASE_XP_TO_LEVEL,
    level: 1,
    spriteAnimation: {
      frameIndex: 0,
      frameCount: FRAME_COUNT,
      frameDuration: 1 / ANIMATION_FPS,
      elapsed: 0,
      direction: DIRECTION_DOWN,
      isMoving: false,
    },
  };

  return { entity, material };
}
