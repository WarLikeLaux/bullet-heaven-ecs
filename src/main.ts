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
import { runContactDamageSystem, runDeathSystem } from '@/core/combat';
import {
  runAutoFireSystem,
  runProjectileHitSystem,
  runLifetimeSystem,
} from '@/core/weapons';
import { createEnemy } from '@/entities/enemy';
import { createPlayer } from '@/entities/player';
import {
  configureSpritesheet,
  updateSpriteUV,
  runSpriteRender,
} from '@/rendering/spritesheet';
import {
  createRenderer,
  createCamera,
  createScene,
  bindResize,
} from '@/rendering/setup';
import { createBackground, scatterDecor } from '@/rendering/background';
import { runHitFlashSystem } from '@/rendering/hit-flash';
import { hideLoadingScreen } from '@/ui/loading';
import { createCharacterSelect } from '@/ui/character-select';
import { createFpsCounter, createFpsState, updateFps } from '@/ui/fps-counter';
import { showGameOver } from '@/ui/game-over';
import { createHud, updateHud } from '@/ui/hud';
import { showLevelUp } from '@/ui/level-up';
import { showUpgradeSelect } from '@/ui/upgrade-select';
import { applyKillXp } from '@/core/progression';
import { pickRandomUpgrades, applyUpgrade } from '@/core/upgrades';
import { startMusic } from '@/core/audio';
import { createMuteButton } from '@/ui/mute-button';
import { createJoystick, isTouchDevice } from '@/ui/joystick';
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

function runSystems(dt: number, elapsed: number): number {
  runInputSystem(world);
  runChaseSystem(world);
  runMovementSystem(world, dt);
  runAutoFireSystem(world, scene, dt);
  runProjectileHitSystem(world, elapsed);
  runContactDamageSystem(world, elapsed);
  runLifetimeSystem(world, dt);
  const kills = runDeathSystem(world, scene);
  runSpriteAnimationSystem(world, dt);
  runHitFlashSystem(world, elapsed);
  return kills;
}

async function handleLevelUp(player: Entity, levels: number) {
  for (let i = 0; i < levels; i++) {
    showLevelUp(player.level ?? 1);
    const upgrades = pickRandomUpgrades(3);
    const chosenId = await showUpgradeSelect(upgrades);
    applyUpgrade(player, chosenId);
  }
}

function renderFrame(pos?: Vector3) {
  if (pos) {
    camera.position.x = pos.x;
    camera.position.y = pos.y;
  }
  runSpriteRender(world);
  renderer.render(scene, camera);
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
  let elapsed = 0;
  let gameOver = false;
  let paused = false;
  let totalKills = 0;
  const hud = createHud();

  function tick() {
    if (gameOver) return;
    requestAnimationFrame(tick);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (paused) {
      renderFrame();
      return;
    }

    elapsed += dt;
    const spawnCount = updateSpawner(spawner, dt);
    for (let i = 0; i < spawnCount; i++) {
      const tex =
        enemyTextures[Math.floor(Math.random() * enemyTextures.length)];
      world.add(
        createEnemy(
          scene,
          getSpawnPosition(playerPosition),
          playerPosition,
          tex
        )
      );
    }
    const frameKills = runSystems(dt, elapsed);
    totalKills += frameKills;

    const levelsGained = applyKillXp(player, frameKills);
    if (levelsGained > 0) {
      paused = true;
      handleLevelUp(player, levelsGained).then(() => {
        paused = false;
        lastTime = performance.now();
      });
    }

    if (player.dead) {
      gameOver = true;
      showGameOver({ elapsed, kills: totalKills, level: player.level ?? 1 });
      return;
    }

    updateHud(hud, {
      hp: player.hp ?? 0,
      maxHp: player.maxHp ?? 1,
      xp: player.xp ?? 0,
      xpToNext: player.xpToNext ?? 1,
      level: player.level ?? 1,
      elapsed,
      kills: totalKills,
    });

    fpsEl.textContent = `${updateFps(fpsState, dt)} FPS`;
    renderFrame(player.position);
  }

  tick();
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
  startGameLoop(player, createFpsCounter(), enemyTex);
}

boot();
