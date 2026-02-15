import { World } from 'miniplex';
import { Scene } from 'three';
import { Entity } from '@/core/ecs';
import { DeathPosition } from '@/core/combat';
import { createXpCrystal, createHealDrop } from '@/entities/drop';
import {
  DROP_XP_CHANCE,
  DROP_HEAL_CHANCE,
  DROP_MAGNET_SPEED,
  DROP_BASE_PICKUP_RADIUS,
  DROP_COLLECT_RADIUS,
} from '@/config';

export function spawnDrops(
  world: World<Entity>,
  scene: Scene,
  deathPositions: DeathPosition[]
) {
  for (const pos of deathPositions) {
    if (Math.random() < DROP_XP_CHANCE) {
      world.add(createXpCrystal(scene, pos));
    }
    if (Math.random() < DROP_HEAL_CHANCE) {
      world.add(createHealDrop(scene, pos));
    }
  }
}

const COLLECT_SQ = DROP_COLLECT_RADIUS * DROP_COLLECT_RADIUS;

export function runPickupSystem(
  world: World<Entity>,
  player: Entity,
  dt: number
): { xpGained: number; hpGained: number } {
  const pos = player.position;
  if (!pos) return { xpGained: 0, hpGained: 0 };

  const pickups = world.with('pickup', 'position', 'view');
  const magnetRadius = DROP_BASE_PICKUP_RADIUS * (player.pickupRadius ?? 1);
  const magnetSq = magnetRadius * magnetRadius;
  let xpGained = 0;
  let hpGained = 0;

  for (const drop of pickups) {
    const dx = pos.x - drop.position.x;
    const dy = pos.y - drop.position.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < COLLECT_SQ) {
      if (drop.pickup === 'xp') {
        xpGained += drop.pickupValue ?? 0;
      } else {
        hpGained += drop.pickupValue ?? 0;
      }
      world.addComponent(drop, 'dead', true);
      continue;
    }

    if (distSq < magnetSq) {
      const dist = Math.sqrt(distSq);
      const speed = DROP_MAGNET_SPEED * dt;
      const move = Math.min(speed, dist);
      drop.position.x += (dx / dist) * move;
      drop.position.y += (dy / dist) * move;
    }
  }

  return { xpGained, hpGained };
}
