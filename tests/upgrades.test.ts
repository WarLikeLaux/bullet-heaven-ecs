import { describe, it, expect } from 'vitest';
import { Entity } from '@/core/ecs';
import {
  getUpgradePool,
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
    upgradeLevels: {},
  };
}

describe('pickRandomUpgrades', () => {
  it('returns requested count', () => {
    const player = makePlayer();
    const upgrades = pickRandomUpgrades(3, player);
    expect(upgrades).toHaveLength(3);
  });

  it('returns unique upgrades', () => {
    const player = makePlayer();
    const upgrades = pickRandomUpgrades(3, player);
    const ids = upgrades.map((u) => u.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('never returns more than pool size', () => {
    const pool = getUpgradePool();
    const player = makePlayer();
    const upgrades = pickRandomUpgrades(pool.length + 5, player);
    expect(upgrades.length).toBeLessThanOrEqual(pool.length);
  });

  it('excludes maxed out upgrades', () => {
    const player = makePlayer();
    player.upgradeLevels = { damageUp: 5 };
    const upgrades = pickRandomUpgrades(20, player);
    expect(upgrades.find((u) => u.id === 'damageUp')).toBeUndefined();
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

  it('stacks multiple upgrades via levels', () => {
    const player = makePlayer();
    applyUpgrade(player, 'damageUp');
    applyUpgrade(player, 'damageUp');
    expect(player.upgradeLevels?.damageUp).toBe(2);
    expect(player.weaponDamage).toBe(PROJECTILE_DAMAGE + 10);
  });

  it('stacks xpBoost', () => {
    const player = makePlayer();
    applyUpgrade(player, 'xpBoost');
    applyUpgrade(player, 'xpBoost');
    expect(player.xpMultiplier).toBeCloseTo(1.5);
  });

  it('armor reduces damage taken', () => {
    const player = makePlayer();
    applyUpgrade(player, 'armor');
    expect(player.armor).toBe(1);
    applyUpgrade(player, 'armor');
    expect(player.armor).toBe(2);
  });

  it('regen sets hp regen rate', () => {
    const player = makePlayer();
    applyUpgrade(player, 'regen');
    expect(player.regen).toBe(1);
    applyUpgrade(player, 'regen');
    expect(player.regen).toBe(2);
  });

  it('multishot adds extra projectiles', () => {
    const player = makePlayer();
    applyUpgrade(player, 'multishot');
    expect(player.multishotCount).toBe(1);
    applyUpgrade(player, 'multishot');
    expect(player.multishotCount).toBe(2);
  });

  it('deflect sets deflection chance', () => {
    const player = makePlayer();
    applyUpgrade(player, 'deflect');
    expect(player.deflectChance).toBeCloseTo(0.1);
    applyUpgrade(player, 'deflect');
    expect(player.deflectChance).toBeCloseTo(0.2);
  });

  it('magneticField sets magnetic damage and radius', () => {
    const player = makePlayer();
    applyUpgrade(player, 'magneticField');
    expect(player.magneticDamage).toBe(3);
    expect(player.magneticRadius).toBeCloseTo(2.3);
  });

  it('pickupRadius sets pickup multiplier', () => {
    const player = makePlayer();
    applyUpgrade(player, 'pickupRadius');
    expect(player.pickupRadius).toBeCloseTo(1.2);
  });

  it('luck sets crit chance', () => {
    const player = makePlayer();
    applyUpgrade(player, 'luck');
    expect(player.critChance).toBeCloseTo(0.1);
    applyUpgrade(player, 'luck');
    expect(player.critChance).toBeCloseTo(0.2);
  });

  it('does not exceed maxLevel', () => {
    const player = makePlayer();
    for (let i = 0; i < 10; i++) applyUpgrade(player, 'multishot');
    expect(player.upgradeLevels?.multishot).toBe(3);
  });
});
