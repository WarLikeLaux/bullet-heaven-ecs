import { World } from 'miniplex';
import { Vector3 } from 'three';
import {
  Entity,
  DIRECTION_DOWN,
  DIRECTION_UP,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
} from '@/core/ecs';

const MOVEMENT_VECTOR = new Vector3();

export function runInputSystem(world: World<Entity>) {
  const query = world.with('playerInput', 'velocity', 'speed');

  for (const entity of query) {
    const { playerInput, speed } = entity;

    MOVEMENT_VECTOR.set(0, 0, 0);

    if (playerInput.up) MOVEMENT_VECTOR.y += 1;
    if (playerInput.down) MOVEMENT_VECTOR.y -= 1;
    if (playerInput.left) MOVEMENT_VECTOR.x -= 1;
    if (playerInput.right) MOVEMENT_VECTOR.x += 1;

    const isMoving = MOVEMENT_VECTOR.lengthSq() > 0;

    if (isMoving) {
      MOVEMENT_VECTOR.normalize().multiplyScalar(speed);
    }

    entity.velocity.copy(MOVEMENT_VECTOR);

    if (entity.spriteAnimation) {
      entity.spriteAnimation.isMoving = isMoving;
      if (isMoving) {
        entity.spriteAnimation.direction = resolveDirection(playerInput);
      }
    }
  }
}

function resolveDirection(input: {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}): number {
  if (input.down) return DIRECTION_DOWN;
  if (input.up) return DIRECTION_UP;
  if (input.left) return DIRECTION_LEFT;
  if (input.right) return DIRECTION_RIGHT;
  return DIRECTION_DOWN;
}

export function runMovementSystem(world: World<Entity>, dt: number) {
  const query = world.with('position', 'velocity');

  for (const entity of query) {
    const { position, velocity } = entity;

    if (velocity.lengthSq() === 0) continue;

    position.x += velocity.x * dt;
    position.y += velocity.y * dt;

    if (entity.view) {
      entity.view.position.copy(position);
    }
  }
}

export function runSpriteAnimationSystem(world: World<Entity>, dt: number) {
  const query = world.with('spriteAnimation');

  for (const entity of query) {
    const anim = entity.spriteAnimation;

    if (!anim.isMoving) {
      anim.frameIndex = 0;
      anim.elapsed = 0;
      continue;
    }

    anim.elapsed += dt;

    if (anim.elapsed >= anim.frameDuration) {
      anim.elapsed -= anim.frameDuration;
      anim.frameIndex = (anim.frameIndex + 1) % anim.frameCount;
    }
  }
}
