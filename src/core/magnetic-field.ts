import { World } from 'miniplex';
import { Entity } from '@/core/ecs';
import { HIT_FLASH_DURATION, ENEMY_SCALE } from '@/config';

export function runMagneticFieldSystem(
  world: World<Entity>,
  dt: number,
  elapsed: number
) {
  const players = world.with('position', 'playerInput');
  const enemies = world.with('enemy', 'position', 'hp');

  for (const player of players) {
    const dmg = player.magneticDamage ?? 0;
    const radius = player.magneticRadius ?? 0;
    if (dmg <= 0 || radius <= 0) continue;

    const radiusSq = (radius + ENEMY_SCALE / 2) ** 2;
    const frameDmg = dmg * dt;

    for (const enemy of enemies) {
      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;
      if (dx * dx + dy * dy >= radiusSq) continue;

      enemy.hp -= frameDmg;
      if (enemy.hp <= 0) enemy.hp = 0;
      world.addComponent(enemy, 'hitFlashUntil', elapsed + HIT_FLASH_DURATION);
    }
  }
}
