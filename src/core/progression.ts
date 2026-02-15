import { Entity } from '@/core/ecs';
import { XP_PER_KILL, XP_SCALE_FACTOR } from '@/config';

export function applyKillXp(player: Entity, kills: number): number {
  if (kills <= 0) return 0;
  if (player.xp === undefined || player.xpToNext === undefined) return 0;

  const multiplier = player.xpMultiplier ?? 1;
  player.xp += Math.floor(kills * XP_PER_KILL * multiplier);
  let levelsGained = 0;

  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.xpToNext = Math.floor(player.xpToNext * XP_SCALE_FACTOR);
    player.level = (player.level ?? 1) + 1;
    levelsGained += 1;
  }

  return levelsGained;
}
