import { describe, it, expect } from 'vitest';
import { Entity } from '@/core/ecs';
import { applyKillXp } from '@/core/progression';
import { BASE_XP_TO_LEVEL, XP_PER_KILL, XP_SCALE_FACTOR } from '@/config';

function makePlayer(): Entity {
  return {
    id: 'player',
    xp: 0,
    xpToNext: BASE_XP_TO_LEVEL,
    level: 1,
  };
}

describe('applyKillXp', () => {
  it('adds xp for kills', () => {
    const player = makePlayer();

    applyKillXp(player, 3);

    expect(player.xp).toBe(3 * XP_PER_KILL);
  });

  it('returns 0 for zero kills', () => {
    const player = makePlayer();

    const levels = applyKillXp(player, 0);

    expect(levels).toBe(0);
    expect(player.xp).toBe(0);
  });

  it('levels up when xp reaches threshold', () => {
    const player = makePlayer();
    const killsNeeded = BASE_XP_TO_LEVEL / XP_PER_KILL;

    const levels = applyKillXp(player, killsNeeded);

    expect(levels).toBe(1);
    expect(player.level).toBe(2);
    expect(player.xp).toBe(0);
  });

  it('scales xpToNext after level up', () => {
    const player = makePlayer();
    const killsNeeded = BASE_XP_TO_LEVEL / XP_PER_KILL;

    applyKillXp(player, killsNeeded);

    expect(player.xpToNext).toBe(
      Math.floor(BASE_XP_TO_LEVEL * XP_SCALE_FACTOR)
    );
  });

  it('carries over excess xp', () => {
    const player = makePlayer();
    const killsNeeded = BASE_XP_TO_LEVEL / XP_PER_KILL + 2;

    applyKillXp(player, killsNeeded);

    expect(player.level).toBe(2);
    expect(player.xp).toBe(2 * XP_PER_KILL);
  });

  it('handles multiple level ups', () => {
    const player = makePlayer();
    player.xpToNext = 20;

    const levels = applyKillXp(player, 10);

    expect(levels).toBeGreaterThanOrEqual(2);
    expect(player.level).toBeGreaterThanOrEqual(3);
  });

  it('returns 0 when player has no xp component', () => {
    const player: Entity = { id: 'no-xp' };

    const levels = applyKillXp(player, 5);

    expect(levels).toBe(0);
  });

  it('applies xpMultiplier', () => {
    const player = makePlayer();
    player.xpMultiplier = 1.5;

    applyKillXp(player, 3);

    expect(player.xp).toBe(Math.floor(3 * XP_PER_KILL * 1.5));
  });
});
