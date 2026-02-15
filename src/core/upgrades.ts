import { Entity } from '@/core/ecs';

export type UpgradeDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const UPGRADE_POOL: UpgradeDef[] = [
  {
    id: 'damageUp',
    name: 'Урон+',
    description: '+5 к урону снарядов',
    icon: '🗡️',
  },
  {
    id: 'fireRate',
    name: 'Скорострельность',
    description: 'стрельба на 20% быстрее',
    icon: '⚡',
  },
  {
    id: 'maxHpUp',
    name: 'Здоровье+',
    description: '+25 макс. HP и лечение',
    icon: '💚',
  },
  {
    id: 'speedUp',
    name: 'Скорость+',
    description: '+0.5 к скорости',
    icon: '👟',
  },
  {
    id: 'xpBoost',
    name: 'Опыт+',
    description: '+25% к получаемому опыту',
    icon: '⭐',
  },
  {
    id: 'shield',
    name: 'Защита+',
    description: '+0.5с неуязвимости',
    icon: '🛡️',
  },
];

export function pickRandomUpgrades(count: number): UpgradeDef[] {
  const shuffled = [...UPGRADE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function applyUpgrade(player: Entity, upgradeId: string): void {
  switch (upgradeId) {
    case 'damageUp':
      player.weaponDamage = (player.weaponDamage ?? 15) + 5;
      break;
    case 'fireRate':
      player.fireInterval = (player.fireInterval ?? 0.5) * 0.8;
      break;
    case 'maxHpUp':
      player.maxHp = (player.maxHp ?? 100) + 25;
      player.hp = (player.hp ?? 0) + 25;
      break;
    case 'speedUp':
      player.speed = (player.speed ?? 3) + 0.5;
      break;
    case 'xpBoost':
      player.xpMultiplier = (player.xpMultiplier ?? 1) + 0.25;
      break;
    case 'shield':
      player.iframeDuration = (player.iframeDuration ?? 1) + 0.5;
      break;
  }
}
