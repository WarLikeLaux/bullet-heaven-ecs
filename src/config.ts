export const PLAYER_SPEED = 3;
export const SPRITE_SCALE = 2;
export const CAMERA_ZOOM = 10;
export const ANIMATION_FPS = 8;
export const PLAYER_SPRITE = 'assets/characters/pipo-nekonin008.png';
export const CHARACTER_COUNT = 32;
export const CHARACTER_PATH_PREFIX = 'assets/characters/pipo-nekonin';
export const WORLD_SIZE = 200;
export const TILE_REPEAT = 100;
export const GROUND_TILE = 'assets/tiles/grass.png';
export const MIN_LOADING_MS = 1000;
export const LOADING_FADE_MS = 500;
export const ENEMY_SPEED = 1.5;
export const ENEMY_SCALE = 1.5;
export const ENEMY_SPAWN_DISTANCE = 8;
export const SPAWN_INTERVAL = 2;
export const SPAWN_INTERVAL_MIN = 0.3;
export const SPAWN_INTERVAL_DECAY = 0.95;
export const SPAWN_RADIUS = 15;

export function generateEnemySpritePaths(): string[] {
  return Array.from({ length: CHARACTER_COUNT }, (_, i) => {
    const index = String(i + 1).padStart(3, '0');
    return `${CHARACTER_PATH_PREFIX}${index}.png`;
  });
}
