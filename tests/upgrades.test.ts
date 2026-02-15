import { describe, it, expect } from 'vitest';
import { Entity } from '@/core/ecs';
import {
  UPGRADE_POOL,
  pickRandomUpgrades,
  applyUpgrade,
} from '@/core/upgrades';
import { PROJECTILE_DAMAGE, FIRE_INTERVAL, IFRAME_DURATION } from '@/config';

function makePlayer(): Entity {
  return {
    id: 'player',
    hp: 100,
    maxHp: 100,
    speed: 3,
    weaponDamage: PROJECTILE_DAMAGE,
    fireInterval: FIRE_INTERVAL,
    xpMultiplier: 1,
    iframeDuration: IFRAME_DURATION,
  };
}

describe('pickRandomUpgrades', () => {
  it('returns requested count', () => {
    const upgrades = pickRandomUpgrades(3);
    expect(upgrades).toHaveLength(3);
  });

  it('returns unique upgrades', () => {
    const upgrades = pickRandomUpgrades(3);
    const ids = upgrades.map((u) => u.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('never returns more than pool size', () => {
    const upgrades = pickRandomUpgrades(UPGRADE_POOL.length + 5);
    expect(upgrades.length).toBeLessThanOrEqual(UPGRADE_POOL.length);
  });
});

describe('applyUpgrade', () => {
  it('damageUp increases weapon damage', () => {
    const player = makePlayer();
    applyUpgrade(player, 'damageUp');
    expect(player.weaponDamage).toBe(PROJECTILE_DAMAGE + 5);
  });

  it('fireRate decreases fire interval', () => {
    const player = makePlayer();
    applyUpgrade(player, 'fireRate');
    expect(player.fireInterval).toBeCloseTo(FIRE_INTERVAL * 0.8);
  });

  it('maxHpUp increases max HP and heals', () => {
    const player = makePlayer();
    player.hp = 50;
    applyUpgrade(player, 'maxHpUp');
    expect(player.maxHp).toBe(125);
    expect(player.hp).toBe(75);
  });

  it('speedUp increases movement speed', () => {
    const player = makePlayer();
    applyUpgrade(player, 'speedUp');
    expect(player.speed).toBe(3.5);
  });

  it('xpBoost increases xp multiplier', () => {
    const player = makePlayer();
    applyUpgrade(player, 'xpBoost');
    expect(player.xpMultiplier).toBe(1.25);
  });

  it('shield increases iframe duration', () => {
    const player = makePlayer();
    applyUpgrade(player, 'shield');
    expect(player.iframeDuration).toBe(IFRAME_DURATION + 0.5);
  });

  it('stacks multiple upgrades', () => {
    const player = makePlayer();
    applyUpgrade(player, 'damageUp');
    applyUpgrade(player, 'damageUp');
    expect(player.weaponDamage).toBe(PROJECTILE_DAMAGE + 10);
  });

  it('stacks xpBoost', () => {
    const player = makePlayer();
    applyUpgrade(player, 'xpBoost');
    applyUpgrade(player, 'xpBoost');
    expect(player.xpMultiplier).toBeCloseTo(1.5);
  });
});
