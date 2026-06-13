import { Mesh } from 'three';
import { World } from 'miniplex';
import { Entity } from '@/core/ecs';
import { WeaponContext, WeaponInstance } from '@/core/weapon-registry';
import { createVfxMesh, setVfxFrame } from '@/rendering/vfx-sprite';
import {
  AREA_BLAST_INTERVAL,
  AREA_BLAST_RADIUS,
  AREA_BLAST_DAMAGE,
  HIT_FLASH_DURATION,
} from '@/config';

const BLAST_RADIUS_SQ = AREA_BLAST_RADIUS * AREA_BLAST_RADIUS;
const VISUAL_DURATION = 0.5;

function blastEnemies(world: World<Entity>, player: Entity, elapsed: number) {
  const enemies = world.with('enemy', 'position', 'hp');
  const px = player.position?.x ?? 0;
  const py = player.position?.y ?? 0;

  for (const enemy of enemies) {
    const dx = enemy.position.x - px;
    const dy = enemy.position.y - py;
    if (dx * dx + dy * dy >= BLAST_RADIUS_SQ) continue;
    enemy.hp -= AREA_BLAST_DAMAGE;
    if (enemy.hp <= 0) enemy.hp = 0;
    world.addComponent(enemy, 'hitFlashUntil', elapsed + HIT_FLASH_DURATION);
  }
}

export function createAreaBlastWeapon(ctx: WeaponContext): WeaponInstance {
  const sheet = ctx.vfxSheets.starburst;
  const mesh = createVfxMesh(ctx.scene, sheet, AREA_BLAST_RADIUS * 2, 0.3);
  mesh.visible = false;
  let timer = AREA_BLAST_INTERVAL;
  let visualTimer = 0;
  let startFrame = 0;

  return {
    id: 'areaBlast',
    update(c: WeaponContext) {
      timer -= c.dt;

      if (timer <= 0) {
        timer = AREA_BLAST_INTERVAL;
        blastEnemies(c.world, c.player, c.elapsed);
        visualTimer = VISUAL_DURATION;
        startFrame = Math.floor(c.elapsed * sheet.fps);
        mesh.visible = true;
        mesh.scale.set(0.1, 0.1, 1);
      }

      if (visualTimer > 0) {
        visualTimer -= c.dt;
        const progress = 1 - visualTimer / VISUAL_DURATION;
        const s = 0.2 + progress * 0.8;
        mesh.scale.set(s, s, 1);
        const frameIdx = Math.floor(progress * (sheet.totalFrames - 1));
        setVfxFrame(
          mesh as Mesh,
          sheet,
          (startFrame + frameIdx) % sheet.totalFrames
        );
        const pos = c.player.position;
        if (pos) {
          mesh.position.x = pos.x;
          mesh.position.y = pos.y;
        }
        if (visualTimer <= 0) mesh.visible = false;
      }
    },
  };
}
