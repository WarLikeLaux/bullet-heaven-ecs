import { Vector3, Texture, MeshBasicMaterial } from 'three';
import { createWorld, Entity, DIRECTION_DOWN } from '@/core/ecs';
import { loadTexture, preloadAll } from '@/core/assets';
import {
  runInputSystem,
  runMovementSystem,
  runSpriteAnimationSystem,
  runChaseSystem,
} from '@/core/systems';
import {
  createSpawnerState,
  updateSpawner,
  getSpawnPosition,
} from '@/core/spawner';
import { createEnemy } from '@/entities/enemy';
import { createPlayer } from '@/entities/player';
import { configureSpritesheet, updateSpriteUV } from '@/rendering/spritesheet';
import {
  createRenderer,
  createCamera,
  createScene,
  bindResize,
} from '@/rendering/setup';
import { createBackground } from '@/rendering/background';
import { hideLoadingScreen } from '@/ui/loading';
import { createCharacterSelect } from '@/ui/character-select';
import { createFpsCounter, createFpsState, updateFps } from '@/ui/fps-counter';
import {
  CAMERA_ZOOM,
  PLAYER_SPRITE,
  GROUND_TILE,
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

function startGameLoop(
  player: Entity,
  fpsEl: HTMLElement,
  enemyTextures: Texture[]
) {
  let lastTime = performance.now();
  const fpsState = createFpsState();
  const spawner = createSpawnerState();
  const playerPosition = player.position ?? new Vector3();

  function tick() {
    requestAnimationFrame(tick);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const spawnCount = updateSpawner(spawner, dt);
    for (let i = 0; i < spawnCount; i++) {
      const pos = getSpawnPosition(playerPosition);
      const tex =
        enemyTextures[Math.floor(Math.random() * enemyTextures.length)];
      const enemy = createEnemy(scene, pos, playerPosition, tex);
      world.add(enemy);
    }

    runInputSystem(world);
    runChaseSystem(world);
    runSpriteAnimationSystem(world, dt);
    runMovementSystem(world, dt);

    const fps = updateFps(fpsState, dt);
    fpsEl.textContent = `${fps} FPS`;

    if (player.position) {
      camera.position.x = player.position.x;
      camera.position.y = player.position.y;
    }

    runSpriteRender(world);

    renderer.render(scene, camera);
  }

  tick();
}

function runSpriteRender(w: typeof world) {
  const query = w.with('spriteTexture', 'spriteAnimation');
  for (const entity of query) {
    const { spriteTexture, spriteAnimation } = entity;
    updateSpriteUV(
      spriteTexture,
      spriteAnimation.frameIndex,
      spriteAnimation.direction
    );
  }
}

async function boot() {
  const enemySpritePaths = generateEnemySpritePaths();
  const assetsPromise = preloadAll([
    PLAYER_SPRITE,
    GROUND_TILE,
    ...enemySpritePaths,
  ]);
  const minWait = new Promise<void>((resolve) =>
    setTimeout(resolve, MIN_LOADING_MS)
  );

  const [textures] = await Promise.all([assetsPromise, minWait]);
  const [playerTexture, groundTexture, ...enemyTextures] = textures;

  await hideLoadingScreen();

  createBackground(scene, groundTexture);
  const { entity: player, material } = createPlayer(scene, playerTexture);
  activeMaterial = material;
  playerEntity = player;
  world.add(player);
  updateSpriteUV(playerTexture, 0, DIRECTION_DOWN);

  createCharacterSelect(PLAYER_SPRITE, handleCharacterChange);

  const fpsEl = createFpsCounter();
  startGameLoop(player, fpsEl, enemyTextures);
}

boot();
