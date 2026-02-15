import { Entity } from '@/core/ecs';

export type UpgradeDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (player: Entity) => void;
};

export const UPGRADE_POOL: UpgradeDef[] = [
  {
    id: 'damageUp',
    name: 'Урон+',
    description: '+5 к урону снарядов',
    icon: '🗡️',
    apply: (p) => {
      p.weaponDamage = (p.weaponDamage ?? 15) + 5;
    },
  },
  {
    id: 'fireRate',
    name: 'Скорострельность',
    description: 'стрельба на 20% быстрее',
    icon: '⚡',
    apply: (p) => {
      p.fireInterval = (p.fireInterval ?? 0.5) * 0.8;
    },
  },
  {
    id: 'maxHpUp',
    name: 'Здоровье+',
    description: '+25 макс. HP и лечение',
    icon: '💚',
    apply: (p) => {
      p.maxHp = (p.maxHp ?? 100) + 25;
      p.hp = (p.hp ?? 0) + 25;
    },
  },
  {
    id: 'speedUp',
    name: 'Скорость+',
    description: '+0.5 к скорости',
    icon: '👟',
    apply: (p) => {
      p.speed = (p.speed ?? 3) + 0.5;
    },
  },
  {
    id: 'xpBoost',
    name: 'Опыт+',
    description: '+25% к получаемому опыту',
    icon: '⭐',
    apply: (p) => {
      p.xpMultiplier = (p.xpMultiplier ?? 1) + 0.25;
    },
  },
  {
    id: 'shield',
    name: 'Защита+',
    description: '+0.5с неуязвимости',
    icon: '🛡️',
    apply: (p) => {
      p.iframeDuration = (p.iframeDuration ?? 1) + 0.5;
    },
  },
];

export function pickRandomUpgrades(count: number): UpgradeDef[] {
  const shuffled = [...UPGRADE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function applyUpgrade(player: Entity, upgradeId: string): void {
  const upgrade = UPGRADE_POOL.find((u) => u.id === upgradeId);
  if (upgrade) upgrade.apply(player);
}
