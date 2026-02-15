import { World } from 'miniplex';
import { Scene } from 'three';
import { Entity } from '@/core/ecs';
import { COLLISION_RADIUS, IFRAME_DURATION } from '@/config';

const COLLISION_RADIUS_SQ = COLLISION_RADIUS * COLLISION_RADIUS;

export function runContactDamageSystem(world: World<Entity>, elapsed: number) {
  const players = world.with('hp', 'position', 'playerInput');
  const enemies = world.with('damage', 'position', 'enemy');

  for (const player of players) {
    const invUntil = player.invulnerableUntil ?? 0;
    if (elapsed < invUntil) continue;

    for (const enemy of enemies) {
      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;

      if (dx * dx + dy * dy >= COLLISION_RADIUS_SQ) continue;

      player.hp -= enemy.damage;
      player.invulnerableUntil = elapsed + IFRAME_DURATION;

      if (player.hp <= 0) {
        player.hp = 0;
        world.addComponent(player, 'dead', true);
      }

      break;
    }
  }
}

export function runDeathSystem(world: World<Entity>, scene: Scene) {
  const query = world.with('dead');

  for (const entity of query) {
    if (entity.view) {
      scene.remove(entity.view);
    }
    world.remove(entity);
  }
}
