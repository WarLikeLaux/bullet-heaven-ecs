import { World } from 'miniplex';
import { Scene } from 'three';
import { Entity } from '@/core/ecs';
import { COLLISION_RADIUS, IFRAME_DURATION } from '@/config';
import { playEnemyDeath } from '@/core/audio';

const COLLISION_RADIUS_SQ = COLLISION_RADIUS * COLLISION_RADIUS;
const MIN_DAMAGE = 1;

function applyArmor(raw: number, armor: number): number {
  return Math.max(raw - armor, MIN_DAMAGE);
}

export function runContactDamageSystem(world: World<Entity>, elapsed: number) {
  const players = world.with('hp', 'position', 'playerInput');
  const enemies = world.with('damage', 'position', 'enemy');

  for (const player of players) {
    const invUntil = player.invulnerableUntil ?? 0;
    if (elapsed < invUntil) continue;

    for (const enemy of enemies) {
      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;

      if (dx * dx + dy * dy >= COLLISION_RADIUS_SQ) continue;

      const deflect = player.deflectChance ?? 0;
      if (deflect > 0 && Math.random() < deflect) {
        player.invulnerableUntil =
          elapsed + (player.iframeDuration ?? IFRAME_DURATION);
        break;
      }

      const finalDmg = applyArmor(enemy.damage, player.armor ?? 0);
      player.hp -= finalDmg;
      player.invulnerableUntil =
        elapsed + (player.iframeDuration ?? IFRAME_DURATION);

      if (player.hp <= 0) {
        player.hp = 0;
        world.addComponent(player, 'dead', true);
      }

      break;
    }
  }
}

export type DeathPosition = { x: number; y: number };

export function runDeathSystem(
  world: World<Entity>,
  scene: Scene
): { kills: number; deathPositions: DeathPosition[] } {
  const query = world.with('dead');
  let kills = 0;
  const deathPositions: DeathPosition[] = [];

  for (const entity of query) {
    if (entity.enemy) {
      kills += 1;
      playEnemyDeath();
      if (entity.position) {
        deathPositions.push({ x: entity.position.x, y: entity.position.y });
      }
    }
    if (entity.view) {
      scene.remove(entity.view);
    }
    world.remove(entity);
  }

  return { kills, deathPositions };
}
