import { World } from 'miniplex';
import { Entity } from '@/core/ecs';

export function runMovementSystem(world: World<Entity>, dt: number) {
  const query = world.with('position', 'velocity');

  for (const entity of query) {
    const { position, velocity } = entity;
    const movement = velocity.clone().multiplyScalar(dt);

    position.add(movement);

    if (entity.view) {
      entity.view.position.copy(position);
    }
  }
}
