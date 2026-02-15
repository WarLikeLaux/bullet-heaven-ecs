import { World } from 'miniplex';
import { Entity } from '@/core/ecs';
import { HIT_FLASH_DURATION, ENEMY_SCALE } from '@/config';

export function runChainExplosionSystem(
  world: World<Entity>,
  deathPositions: { x: number; y: number }[],
  player: Entity,
  elapsed: number
) {
  const dmg = player.chainExplosionDamage ?? 0;
  const radius = player.chainExplosionRadius ?? 0;
  if (dmg <= 0 || radius <= 0) return;
  if (deathPositions.length === 0) return;

  const enemies = world.with('enemy', 'position', 'hp');
  const radiusSq = (radius + ENEMY_SCALE / 2) ** 2;

  for (const pos of deathPositions) {
    for (const enemy of enemies) {
      const dx = pos.x - enemy.position.x;
      const dy = pos.y - enemy.position.y;
      if (dx * dx + dy * dy >= radiusSq) continue;

      enemy.hp -= dmg;
      if (enemy.hp <= 0) enemy.hp = 0;
      world.addComponent(enemy, 'hitFlashUntil', elapsed + HIT_FLASH_DURATION);
    }
  }
}
