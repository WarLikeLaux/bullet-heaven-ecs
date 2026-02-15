export const ENEMY_SPEED = 1.5;
export const ENEMY_SCALE = 1.5;
export const ENEMY_SPAWN_DISTANCE = 8;
export const ENEMY_HP = 30;
export const ENEMY_DAMAGE = 10;
export const COLLISION_RADIUS = 0.8;
export const SPAWN_INTERVAL = 2;
export const SPAWN_INTERVAL_MIN = 0.3;
export const SPAWN_INTERVAL_DECAY = 0.95;
export const SPAWN_RADIUS = 22;

export function generateEnemySpritePaths(): string[] {
  return Array.from({ length: 32 }, (_, i) => {
    const index = String(i + 1).padStart(3, '0');
    return `assets/characters/pipo-nekonin${index}.png`;
  });
}
