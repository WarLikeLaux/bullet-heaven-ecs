import { registerWeaponUpgrade } from '@/core/upgrades';
import { createOrbiterWeapon } from '@/weapons/orbiter';
import { createAreaBlastWeapon } from '@/weapons/area-blast';
import { createChainLightningWeapon } from '@/weapons/chain-lightning';

export function registerAllWeapons() {
  registerWeaponUpgrade({
    id: 'orbiter',
    name: 'Орбита',
    description: 'шары вращаются вокруг тебя',
    icon: '🔵',
    unique: true,
    weaponFactory: createOrbiterWeapon,
  });
  registerWeaponUpgrade({
    id: 'areaBlast',
    name: 'Взрыв',
    description: 'AoE урон вокруг каждые 4с',
    icon: '💥',
    unique: true,
    weaponFactory: createAreaBlastWeapon,
  });
  registerWeaponUpgrade({
    id: 'chainLightning',
    name: 'Молния',
    description: 'цепь между 4 врагами каждые 3с',
    icon: '⚡',
    unique: true,
    weaponFactory: createChainLightningWeapon,
  });
}
