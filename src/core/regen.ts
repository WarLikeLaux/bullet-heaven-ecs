import { World } from 'miniplex';
import { Entity } from '@/core/ecs';

export function runRegenSystem(world: World<Entity>, dt: number) {
  const players = world.with('hp', 'maxHp', 'playerInput');

  for (const player of players) {
    const rate = player.regen ?? 0;
    if (rate <= 0) continue;
    if (player.hp >= player.maxHp) continue;
    player.hp = Math.min(player.hp + rate * dt, player.maxHp);
  }
}
