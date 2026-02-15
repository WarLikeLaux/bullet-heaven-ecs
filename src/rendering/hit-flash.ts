import { World } from 'miniplex';
import { Mesh, MeshBasicMaterial } from 'three';
import { Entity } from '@/core/ecs';

const FLASH_BRIGHT = 5;

export function runHitFlashSystem(world: World<Entity>, elapsed: number) {
  const query = world.with('enemy', 'view', 'hitFlashUntil');

  for (const entity of query) {
    const mesh = entity.view as Mesh;
    const mat = mesh.material as MeshBasicMaterial;

    if (elapsed < entity.hitFlashUntil) {
      mat.color.setRGB(FLASH_BRIGHT, FLASH_BRIGHT, FLASH_BRIGHT);
    } else {
      mat.color.setRGB(1, 1, 1);
      world.removeComponent(entity, 'hitFlashUntil');
      if ((entity.hp ?? 0) <= 0) {
        world.addComponent(entity, 'dead', true);
      }
    }
  }
}
