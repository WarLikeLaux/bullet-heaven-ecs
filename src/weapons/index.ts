import { registerWeaponUpgrade } from '@/core/upgrades';
import { createOrbiterWeapon } from '@/weapons/orbiter';
import { createAreaBlastWeapon } from '@/weapons/area-blast';
import { createChainLightningWeapon } from '@/weapons/chain-lightning';

export function registerAllWeapons() {
  registerWeaponUpgrade({
    id: 'orbiter',
    name: 'Орбита',
    icon: '🔵',
    maxLevel: 1,
    descriptionPerLevel: ['шары вращаются вокруг тебя'],
    unique: true,
    weaponFactory: createOrbiterWeapon,
  });
  registerWeaponUpgrade({
    id: 'areaBlast',
    name: 'Взрыв',
    icon: '💥',
    maxLevel: 1,
    descriptionPerLevel: ['AoE урон вокруг каждые 4с'],
    unique: true,
    weaponFactory: createAreaBlastWeapon,
  });
  registerWeaponUpgrade({
    id: 'chainLightning',
    name: 'Молния',
    icon: '⚡',
    maxLevel: 1,
    descriptionPerLevel: ['цепь между 4 врагами каждые 3с'],
    unique: true,
    weaponFactory: createChainLightningWeapon,
  });
}
