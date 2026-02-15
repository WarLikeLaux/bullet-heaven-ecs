import { World } from 'miniplex';
import {
  Vector3,
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Texture,
} from 'three';
import { VfxSheet } from '@/rendering/vfx-sprite';
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
import { updateProjectileVfx } from '@/entities/projectile';
import { runHitFlashSystem } from '@/rendering/hit-flash';
import { runSpriteRender } from '@/rendering/spritesheet';
import { createEnemy } from '@/entities/enemy';
import { createFpsState, updateFps } from '@/ui/fps-counter';
import { showGameOver } from '@/ui/game-over';
import { createHud, updateHud } from '@/ui/hud';
import { showLevelUp } from '@/ui/level-up';
import { showUpgradeSelect } from '@/ui/upgrade-select';
import { applyKillXp } from '@/core/progression';
import {
  pickRandomUpgrades,
  applyUpgrade,
  UPGRADE_POOL,
} from '@/core/upgrades';
import { showPause, hidePause } from '@/ui/pause-overlay';
import { runWeapons, WeaponContext } from '@/core/weapon-registry';

export type GameDeps = {
  world: World<Entity>;
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
  player: Entity;
  fpsEl: HTMLElement;
  enemyTextures: Texture[];
  vfxSheets: Record<string, VfxSheet>;
};

function runAllSystems(deps: GameDeps, dt: number, elapsed: number): number {
  const { world, scene } = deps;
  const fb = deps.vfxSheets.fireball;
  runInputSystem(world);
  runChaseSystem(world);
  runMovementSystem(world, dt);
  runAutoFireSystem(world, scene, dt, fb);
  runProjectileHitSystem(world, elapsed);
  runContactDamageSystem(world, elapsed);
  runLifetimeSystem(world, dt);
  const kills = runDeathSystem(world, scene);
  if (fb) {
    for (const p of world.with('projectile', 'view'))
      updateProjectileVfx(p, fb, elapsed);
  }
  runSpriteAnimationSystem(world, dt);
  runHitFlashSystem(world, elapsed);
  return kills;
}

function handleWeaponUpgrade(ctx: WeaponContext, upgradeId: string) {
  const def = UPGRADE_POOL.find((u) => u.id === upgradeId);
  if (!def?.weaponFactory) return;
  const weapons = ctx.player.weapons ?? [];
  weapons.push(def.weaponFactory(ctx));
  ctx.player.weapons = weapons;
}

function ownedWeaponIds(player: Entity): string[] {
  return (player.weapons ?? []).map((w) => w.id);
}

function renderFrame(deps: GameDeps, pos?: Vector3) {
  if (pos) {
    deps.camera.position.x = pos.x;
    deps.camera.position.y = pos.y;
  }
  runSpriteRender(deps.world);
  deps.renderer.render(deps.scene, deps.camera);
}

export function startGameLoop(deps: GameDeps) {
  let lastTime = performance.now();
  const fpsState = createFpsState();
  const spawner = createSpawnerState();
  const playerPos = deps.player.position ?? new Vector3();
  let elapsed = 0;
  let gameOver = false;
  let manualPause = false;
  let levelUpActive = false;
  let totalKills = 0;
  const hud = createHud();

  function weaponCtx(dt: number, el: number): WeaponContext {
    return {
      world: deps.world,
      scene: deps.scene,
      player: deps.player,
      dt,
      elapsed: el,
      vfxSheets: deps.vfxSheets,
    };
  }

  function setPause(on: boolean) {
    if (gameOver || levelUpActive) return;
    manualPause = on;
    if (on) {
      showPause();
    } else {
      hidePause();
      lastTime = performance.now();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') setPause(!manualPause);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setPause(true);
  });
  window.addEventListener('blur', () => setPause(true));

  async function handleLevelUp(levels: number) {
    for (let i = 0; i < levels; i++) {
      showLevelUp(deps.player.level ?? 1);
      const upgrades = pickRandomUpgrades(3, ownedWeaponIds(deps.player));
      const chosenId = await showUpgradeSelect(upgrades);
      applyUpgrade(deps.player, chosenId);
      handleWeaponUpgrade(weaponCtx(0, elapsed), chosenId);
    }
  }

  function tick() {
    if (gameOver) return;
    requestAnimationFrame(tick);
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    if (manualPause || levelUpActive) {
      renderFrame(deps);
      return;
    }

    elapsed += dt;
    const spawnCount = updateSpawner(spawner, dt);
    for (let i = 0; i < spawnCount; i++) {
      const tex =
        deps.enemyTextures[
          Math.floor(Math.random() * deps.enemyTextures.length)
        ];
      deps.world.add(
        createEnemy(deps.scene, getSpawnPosition(playerPos), playerPos, tex)
      );
    }

    const frameKills = runAllSystems(deps, dt, elapsed);
    runWeapons(deps.player.weapons ?? [], weaponCtx(dt, elapsed));
    totalKills += frameKills;

    const levelsGained = applyKillXp(deps.player, frameKills);
    if (levelsGained > 0) {
      levelUpActive = true;
      handleLevelUp(levelsGained).then(() => {
        levelUpActive = false;
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
