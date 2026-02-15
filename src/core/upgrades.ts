import { Entity } from '@/core/ecs';
import { WeaponFactory } from '@/core/weapon-registry';

export type UpgradeDef = {
  id: string;
  name: string;
  icon: string;
  maxLevel: number;
  descriptionPerLevel: string[];
  unique?: true;
  apply?: (player: Entity, level: number) => void;
  weaponFactory?: WeaponFactory;
};

const UPGRADE_POOL: UpgradeDef[] = [
  {
    id: 'damageUp',
    name: 'Урон+',
    icon: '🗡️',
    maxLevel: 5,
    descriptionPerLevel: [
      '+5 к урону',
      '+10 к урону',
      '+15 к урону',
      '+20 к урону',
      '+25 к урону',
    ],
    apply: (p) => {
      p.weaponDamage = (p.weaponDamage ?? 15) + 5;
    },
  },
  {
    id: 'fireRate',
    name: 'Скорострельность',
    icon: '⚡',
    maxLevel: 5,
    descriptionPerLevel: [
      'стрельба на 20% быстрее',
      'стрельба на 36% быстрее',
      'стрельба на 49% быстрее',
      'стрельба на 59% быстрее',
      'стрельба на 67% быстрее',
    ],
    apply: (p) => {
      p.fireInterval = (p.fireInterval ?? 0.5) * 0.8;
    },
  },
  {
    id: 'maxHpUp',
    name: 'Здоровье+',
    icon: '💚',
    maxLevel: 5,
    descriptionPerLevel: [
      '+25 макс. HP',
      '+50 макс. HP',
      '+75 макс. HP',
      '+100 макс. HP',
      '+125 макс. HP',
    ],
    apply: (p) => {
      p.maxHp = (p.maxHp ?? 100) + 25;
      p.hp = (p.hp ?? 0) + 25;
    },
  },
  {
    id: 'speedUp',
    name: 'Скорость+',
    icon: '👟',
    maxLevel: 5,
    descriptionPerLevel: [
      '+0.5 к скорости',
      '+1.0 к скорости',
      '+1.5 к скорости',
      '+2.0 к скорости',
      '+2.5 к скорости',
    ],
    apply: (p) => {
      p.speed = (p.speed ?? 3) + 0.5;
    },
  },
  {
    id: 'xpBoost',
    name: 'Опыт+',
    icon: '⭐',
    maxLevel: 5,
    descriptionPerLevel: [
      '+25% к опыту',
      '+50% к опыту',
      '+75% к опыту',
      '+100% к опыту',
      '+125% к опыту',
    ],
    apply: (p) => {
      p.xpMultiplier = (p.xpMultiplier ?? 1) + 0.25;
    },
  },
  {
    id: 'shield',
    name: 'Защита+',
    icon: '🛡️',
    maxLevel: 5,
    descriptionPerLevel: [
      '+0.5с неуязвимости',
      '+1.0с неуязвимости',
      '+1.5с неуязвимости',
      '+2.0с неуязвимости',
      '+2.5с неуязвимости',
    ],
    apply: (p) => {
      p.iframeDuration = (p.iframeDuration ?? 1) + 0.5;
    },
  },
  {
    id: 'armor',
    name: 'Броня',
    icon: '🪖',
    maxLevel: 5,
    descriptionPerLevel: [
      '-1 входящий урон',
      '-2 входящий урон',
      '-3 входящий урон',
      '-4 входящий урон',
      '-5 входящий урон',
    ],
    apply: (p, lvl) => {
      p.armor = lvl;
    },
  },
  {
    id: 'regen',
    name: 'Регенерация',
    icon: '💗',
    maxLevel: 5,
    descriptionPerLevel: [
      '1 HP/сек',
      '2 HP/сек',
      '3 HP/сек',
      '4 HP/сек',
      '5 HP/сек',
    ],
    apply: (p, lvl) => {
      p.regen = lvl;
    },
  },
  {
    id: 'multishot',
    name: 'Мультивыстрел',
    icon: '🔫',
    maxLevel: 3,
    descriptionPerLevel: ['+1 снаряд', '+2 снаряда', '+3 снаряда'],
    apply: (p, lvl) => {
      p.multishotCount = lvl;
    },
  },
  {
    id: 'deflect',
    name: 'Отражение',
    icon: '🪞',
    maxLevel: 5,
    descriptionPerLevel: [
      '10% шанс отразить',
      '20% шанс отразить',
      '30% шанс отразить',
      '40% шанс отразить',
      '50% шанс отразить',
    ],
    apply: (p, lvl) => {
      p.deflectChance = 0.1 * lvl;
    },
  },
  {
    id: 'magneticField',
    name: 'Магнетизм',
    icon: '🧲',
    maxLevel: 5,
    descriptionPerLevel: [
      '3 урон/с рядом',
      '6 урон/с рядом',
      '9 урон/с рядом',
      '12 урон/с рядом',
      '15 урон/с рядом',
    ],
    apply: (p, lvl) => {
      p.magneticDamage = 3 * lvl;
      p.magneticRadius = 2 + lvl * 0.3;
    },
  },
  {
    id: 'pickupRadius',
    name: 'Магнит XP',
    icon: '🌀',
    maxLevel: 5,
    descriptionPerLevel: [
      '+20% радиус подбора',
      '+40% радиус подбора',
      '+60% радиус подбора',
      '+80% радиус подбора',
      '+100% радиус подбора',
    ],
    apply: (p, lvl) => {
      p.pickupRadius = 1 + 0.2 * lvl;
    },
  },
  {
    id: 'luck',
    name: 'Удача',
    icon: '🍀',
    maxLevel: 5,
    descriptionPerLevel: [
      '10% шанс крита ×2',
      '20% шанс крита ×2',
      '30% шанс крита ×2',
      '40% шанс крита ×2',
      '50% шанс крита ×2',
    ],
    apply: (p, lvl) => {
      p.critChance = 0.1 * lvl;
    },
  },
];

export function getUpgradePool(): readonly UpgradeDef[] {
  return UPGRADE_POOL;
}

export function registerWeaponUpgrade(def: UpgradeDef) {
  UPGRADE_POOL.push(def);
}

function getUpgradeLevel(player: Entity, upgradeId: string): number {
  return player.upgradeLevels?.[upgradeId] ?? 0;
}

function setUpgradeLevel(player: Entity, upgradeId: string, level: number) {
  if (!player.upgradeLevels) player.upgradeLevels = {};
  player.upgradeLevels[upgradeId] = level;
}

export function pickRandomUpgrades(
  count: number,
  player: Entity
): UpgradeDef[] {
  const ownedWeaponIds = (player.weapons ?? []).map((w) => w.id);
  const available = UPGRADE_POOL.filter((u) => {
    if (u.unique && ownedWeaponIds.includes(u.id)) return false;
    if (u.weaponFactory) return !ownedWeaponIds.includes(u.id);
    return getUpgradeLevel(player, u.id) < u.maxLevel;
  });
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function applyUpgrade(player: Entity, upgradeId: string): void {
  const upgrade = UPGRADE_POOL.find((u) => u.id === upgradeId);
  if (!upgrade?.apply) return;
  const currentLevel = getUpgradeLevel(player, upgradeId);
  const newLevel = Math.min(currentLevel + 1, upgrade.maxLevel);
  setUpgradeLevel(player, upgradeId, newLevel);
  upgrade.apply(player, newLevel);
}

export function getUpgradeDescription(def: UpgradeDef, player: Entity): string {
  const level = getUpgradeLevel(player, def.id);
  const displayLevel = Math.min(level, def.maxLevel - 1);
  return def.descriptionPerLevel[displayLevel] ?? def.descriptionPerLevel[0];
}
