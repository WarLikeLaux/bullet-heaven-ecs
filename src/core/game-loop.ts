import { World } from 'miniplex';
import {
  Vector3,
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Texture,
} from 'three';
import { Entity } from '@/core/ecs';
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
import { runHitFlashSystem } from '@/rendering/hit-flash';
import { runSpriteRender } from '@/rendering/spritesheet';
import { createEnemy } from '@/entities/enemy';
import { createFpsState, updateFps } from '@/ui/fps-counter';
import { showGameOver } from '@/ui/game-over';
import { createHud, updateHud } from '@/ui/hud';
import { showLevelUp } from '@/ui/level-up';
import { showUpgradeSelect } from '@/ui/upgrade-select';
import { applyKillXp } from '@/core/progression';
import { pickRandomUpgrades, applyUpgrade } from '@/core/upgrades';

export type GameDeps = {
  world: World<Entity>;
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
  player: Entity;
  fpsEl: HTMLElement;
  enemyTextures: Texture[];
};

function runSystems(deps: GameDeps, dt: number, elapsed: number): number {
  const { world, scene } = deps;
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

function renderFrame(deps: GameDeps, pos?: Vector3) {
  if (pos) {
    deps.camera.position.x = pos.x;
    deps.camera.position.y = pos.y;
  }
  runSpriteRender(deps.world);
  deps.renderer.render(deps.scene, deps.camera);
}

function spawnEnemies(deps: GameDeps, playerPos: Vector3, count: number) {
  for (let i = 0; i < count; i++) {
    const tex =
      deps.enemyTextures[Math.floor(Math.random() * deps.enemyTextures.length)];
    deps.world.add(
      createEnemy(deps.scene, getSpawnPosition(playerPos), playerPos, tex)
    );
  }
}

export function startGameLoop(deps: GameDeps) {
  let lastTime = performance.now();
  const fpsState = createFpsState();
  const spawner = createSpawnerState();
  const playerPos = deps.player.position ?? new Vector3();
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
      renderFrame(deps);
      return;
    }

    elapsed += dt;
    spawnEnemies(deps, playerPos, updateSpawner(spawner, dt));
    const frameKills = runSystems(deps, dt, elapsed);
    totalKills += frameKills;

    const levelsGained = applyKillXp(deps.player, frameKills);
    if (levelsGained > 0) {
      paused = true;
      handleLevelUp(deps.player, levelsGained).then(() => {
        paused = false;
        lastTime = performance.now();
      });
    }

    if (deps.player.dead) {
      gameOver = true;
      showGameOver({
        elapsed,
        kills: totalKills,
        level: deps.player.level ?? 1,
      });
      return;
    }

    updateHud(hud, {
      hp: deps.player.hp ?? 0,
      maxHp: deps.player.maxHp ?? 1,
      xp: deps.player.xp ?? 0,
      xpToNext: deps.player.xpToNext ?? 1,
      level: deps.player.level ?? 1,
      elapsed,
      kills: totalKills,
    });

    deps.fpsEl.textContent = `${updateFps(fpsState, dt)} FPS`;
    renderFrame(deps, deps.player.position);
  }

  tick();
}
