import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Texture,
} from 'three';
import { createWorld, Entity, DIRECTION_DOWN } from '@/core/ecs';
import { createInputState, bindInput } from '@/core/input';
import { loadTexture, preloadAll } from '@/core/assets';
import {
  runInputSystem,
  runMovementSystem,
  runSpriteAnimationSystem,
} from '@/core/systems';
import {
  configureSpritesheet,
  updateSpriteUV,
  FRAME_COUNT,
} from '@/rendering/spritesheet';
import {
  createRenderer,
  createCamera,
  createScene,
  bindResize,
} from '@/rendering/setup';
import { createBackground } from '@/rendering/background';
import { hideLoadingScreen } from '@/ui/loading';
import { createCharacterSelect } from '@/ui/character-select';
import {
  PLAYER_SPEED,
  SPRITE_SCALE,
  CAMERA_ZOOM,
  ANIMATION_FPS,
  PLAYER_SPRITE,
  GROUND_TILE,
  MIN_LOADING_MS,
} from '@/config';

const world = createWorld();
const scene = createScene();
const renderer = createRenderer();
const camera = createCamera(CAMERA_ZOOM);
bindResize(camera, renderer, CAMERA_ZOOM);

let activeTexture: Texture;
let activeMaterial: MeshBasicMaterial;

function createPlayer(texture: Texture): Entity {
  configureSpritesheet(texture);

  const geometry = new PlaneGeometry(SPRITE_SCALE, SPRITE_SCALE);
  activeMaterial = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });
  const mesh = new Mesh(geometry, activeMaterial);
  scene.add(mesh);

  const inputState = createInputState();
  bindInput(inputState);

  return {
    id: 'player',
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    speed: PLAYER_SPEED,
    view: mesh,
    playerInput: inputState,
    spriteAnimation: {
      frameIndex: 0,
      frameCount: FRAME_COUNT,
      frameDuration: 1 / ANIMATION_FPS,
      elapsed: 0,
      direction: DIRECTION_DOWN,
      isMoving: false,
    },
  };
}

async function handleCharacterChange(path: string) {
  const texture = await loadTexture(path);
  configureSpritesheet(texture);
  activeMaterial.map = texture;
  activeMaterial.needsUpdate = true;
  activeTexture = texture;
  updateSpriteUV(texture, 0, DIRECTION_DOWN);
}

function startGameLoop(player: Entity) {
  let lastTime = performance.now();

  function tick() {
    requestAnimationFrame(tick);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    runInputSystem(world);
    runSpriteAnimationSystem(world, dt);
    runMovementSystem(world, dt);

    if (player.position) {
      camera.position.x = player.position.x;
      camera.position.y = player.position.y;
    }

    const anim = player.spriteAnimation;
    if (anim) {
      updateSpriteUV(activeTexture, anim.frameIndex, anim.direction);
    }

    renderer.render(scene, camera);
  }

  tick();
}

async function boot() {
  const assetsPromise = preloadAll([PLAYER_SPRITE, GROUND_TILE]);
  const minWait = new Promise<void>((resolve) =>
    setTimeout(resolve, MIN_LOADING_MS)
  );

  const [textures] = await Promise.all([assetsPromise, minWait]);
  const [playerTexture, groundTexture] = textures;
  activeTexture = playerTexture;

  await hideLoadingScreen();

  createBackground(scene, groundTexture);
  const player = createPlayer(playerTexture);
  world.add(player);
  updateSpriteUV(playerTexture, 0, DIRECTION_DOWN);

  createCharacterSelect(PLAYER_SPRITE, handleCharacterChange);

  startGameLoop(player);
}

boot();
