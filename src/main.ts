import { MeshBasicMaterial } from 'three';
import { createWorld, Entity, DIRECTION_DOWN } from '@/core/ecs';
import { loadTexture, preloadAll } from '@/core/assets';
import { createPlayer } from '@/entities/player';
import { configureSpritesheet, updateSpriteUV } from '@/rendering/spritesheet';
import {
  createRenderer,
  createCamera,
  createScene,
  bindResize,
} from '@/rendering/setup';
import { createBackground, scatterDecor } from '@/rendering/background';
import { createVfxSheet, VfxSheet } from '@/rendering/vfx-sprite';
import { hideLoadingScreen } from '@/ui/loading';
import { createCharacterSelect } from '@/ui/character-select';
import { createFpsCounter } from '@/ui/fps-counter';
import { startMusic } from '@/core/audio';
import { createMuteButton } from '@/ui/mute-button';
import { createJoystick, isTouchDevice } from '@/ui/joystick';
import { startGameLoop } from '@/core/game-loop';
import { registerAllWeapons } from '@/weapons/index';
import {
  CAMERA_ZOOM,
  PLAYER_SPRITE,
  GROUND_TILE,
  DECOR_SPRITES,
  MIN_LOADING_MS,
  generateEnemySpritePaths,
  VFX_FIREBALL,
  VFX_FIREBALL_COLS,
  VFX_FIREBALL_ROWS,
  VFX_ORB,
  VFX_ORB_COLS,
  VFX_ORB_ROWS,
  VFX_STARBURST,
  VFX_STARBURST_COLS,
  VFX_STARBURST_ROWS,
  VFX_LIGHTNING,
  VFX_LIGHTNING_COLS,
  VFX_LIGHTNING_ROWS,
  VFX_FPS,
} from '@/config';

const VFX_PATHS = [VFX_FIREBALL, VFX_ORB, VFX_STARBURST, VFX_LIGHTNING];

const world = createWorld();
const scene = createScene();
const renderer = createRenderer();
const camera = createCamera(CAMERA_ZOOM);
bindResize(camera, renderer, CAMERA_ZOOM);
let activeMaterial: MeshBasicMaterial;
let playerEntity: Entity;

async function handleCharacterChange(path: string) {
  const texture = await loadTexture(path);
  configureSpritesheet(texture);
  activeMaterial.map = texture;
  activeMaterial.needsUpdate = true;
  playerEntity.spriteTexture = texture;
  updateSpriteUV(texture, 0, DIRECTION_DOWN);
}

function buildVfxSheets(
  vfxTextures: ReturnType<typeof preloadAll> extends Promise<infer T>
    ? T
    : never
): Record<string, VfxSheet> {
  const [fireball, orb, starburst, lightning] = vfxTextures;
  return {
    fireball: createVfxSheet(
      fireball,
      VFX_FIREBALL_COLS,
      VFX_FIREBALL_ROWS,
      VFX_FPS
    ),
    orb: createVfxSheet(orb, VFX_ORB_COLS, VFX_ORB_ROWS, VFX_FPS),
    starburst: createVfxSheet(
      starburst,
      VFX_STARBURST_COLS,
      VFX_STARBURST_ROWS,
      VFX_FPS
    ),
    lightning: createVfxSheet(
      lightning,
      VFX_LIGHTNING_COLS,
      VFX_LIGHTNING_ROWS,
      VFX_FPS
    ),
  };
}

async function boot() {
  registerAllWeapons();
  const gamePaths = [
    PLAYER_SPRITE,
    GROUND_TILE,
    ...DECOR_SPRITES,
    ...generateEnemySpritePaths(),
  ];
  const minWait = new Promise<void>((r) => setTimeout(r, MIN_LOADING_MS));
  const [textures, vfxTextures] = await Promise.all([
    preloadAll(gamePaths),
    preloadAll(VFX_PATHS),
    minWait,
  ]);
  const [playerTex, groundTex, ...rest] = textures;
  const decorTex = rest.slice(0, DECOR_SPRITES.length);
  const enemyTex = rest.slice(DECOR_SPRITES.length);
  const vfxSheets = buildVfxSheets(vfxTextures);

  await hideLoadingScreen();
  createBackground(scene, groundTex);
  scatterDecor(scene, decorTex);

  const { entity: player, material } = createPlayer(scene, playerTex);
  activeMaterial = material;
  playerEntity = player;
  world.add(player);
  updateSpriteUV(playerTex, 0, DIRECTION_DOWN);
  createCharacterSelect(PLAYER_SPRITE, handleCharacterChange);
  createMuteButton();
  if (isTouchDevice() && player.playerInput) createJoystick(player.playerInput);
  startMusic();
  startGameLoop({
    world,
    scene,
    camera,
    renderer,
    player,
    fpsEl: createFpsCounter(),
    enemyTextures: enemyTex,
    vfxSheets,
  });
}

function showFatalError(err: unknown) {
  const msg =
    err instanceof Error ? err.message + '\n' + err.stack : String(err);
  const el = document.createElement('pre');
  el.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:#1a0000;color:#ff4444;' +
    'padding:2rem;font:14px monospace;white-space:pre-wrap;overflow:auto';
  el.textContent = 'BOOT ERROR:\n\n' + msg;
  document.body.appendChild(el);
}

boot().catch(showFatalError);
