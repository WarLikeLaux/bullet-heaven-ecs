import { World } from 'miniplex';
import { Scene } from 'three';
import { Entity } from '@/core/ecs';
import { VfxSheet } from '@/rendering/vfx-sprite';

export type WeaponContext = {
  world: World<Entity>;
  scene: Scene;
  player: Entity;
  dt: number;
  elapsed: number;
  vfxSheets: Record<string, VfxSheet>;
};

export type WeaponInstance = {
  id: string;
  update: (ctx: WeaponContext) => void;
};

export type WeaponFactory = (ctx: WeaponContext) => WeaponInstance;

export function runWeapons(weapons: WeaponInstance[], ctx: WeaponContext) {
  for (const w of weapons) {
    w.update(ctx);
  }
}
