import { Entity } from '@/core/ecs';
import { XP_PER_KILL, XP_SCALE_FACTOR } from '@/config';

function processLevelUps(player: Entity): number {
  let levelsGained = 0;
  while ((player.xp ?? 0) >= (player.xpToNext ?? 1)) {
    player.xp = (player.xp ?? 0) - (player.xpToNext ?? 1);
    player.xpToNext = Math.floor((player.xpToNext ?? 1) * XP_SCALE_FACTOR);
    player.level = (player.level ?? 1) + 1;
    levelsGained += 1;
  }
  return levelsGained;
}

export function applyKillXp(player: Entity, kills: number): number {
  if (kills <= 0) return 0;
  if (player.xp === undefined || player.xpToNext === undefined) return 0;

  const multiplier = player.xpMultiplier ?? 1;
  player.xp += Math.floor(kills * XP_PER_KILL * multiplier);
  return processLevelUps(player);
}

export function addRawXp(player: Entity, amount: number): number {
  if (amount <= 0) return 0;
  if (player.xp === undefined || player.xpToNext === undefined) return 0;

  const multiplier = player.xpMultiplier ?? 1;
  player.xp += Math.floor(amount * multiplier);
  return processLevelUps(player);
}
