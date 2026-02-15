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
import { hideLoadingScreen } from '@/ui/loading';
import { createCharacterSelect } from '@/ui/character-select';
import { createFpsCounter } from '@/ui/fps-counter';
import { startMusic } from '@/core/audio';
import { createMuteButton } from '@/ui/mute-button';
import { createJoystick, isTouchDevice } from '@/ui/joystick';
import { startGameLoop } from '@/core/game-loop';
import {
  CAMERA_ZOOM,
  PLAYER_SPRITE,
  GROUND_TILE,
  DECOR_SPRITES,
  MIN_LOADING_MS,
  generateEnemySpritePaths,
} from '@/config';

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

async function boot() {
  const paths = [
    PLAYER_SPRITE,
    GROUND_TILE,
    ...DECOR_SPRITES,
    ...generateEnemySpritePaths(),
  ];
  const minWait = new Promise<void>((r) => setTimeout(r, MIN_LOADING_MS));
  const [textures] = await Promise.all([preloadAll(paths), minWait]);
  const [playerTex, groundTex, ...rest] = textures;
  const decorTex = rest.slice(0, DECOR_SPRITES.length);
  const enemyTex = rest.slice(DECOR_SPRITES.length);

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
  });
}

boot();
