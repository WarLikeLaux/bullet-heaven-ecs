import {
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Texture,
} from 'three';
import { createWorld, Entity, DIRECTION_DOWN } from '@/core/ecs';
import { createInputState, bindInput } from '@/core/input';
import { preloadAll } from '@/core/assets';
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
import {
  PLAYER_SPEED,
  SPRITE_SCALE,
  CAMERA_ZOOM,
  ANIMATION_FPS,
  PLAYER_SPRITE,
} from '@/config';

const world = createWorld();
const scene = createScene();
const renderer = createRenderer();
const camera = createCamera(CAMERA_ZOOM);
bindResize(camera, renderer, CAMERA_ZOOM);

function createPlayer(texture: Texture): Entity {
  configureSpritesheet(texture);

  const geometry = new PlaneGeometry(SPRITE_SCALE, SPRITE_SCALE);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });
  const mesh = new Mesh(geometry, material);
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

function startGameLoop(player: Entity, playerTexture: Texture) {
  let lastTime = performance.now();

  function tick() {
    requestAnimationFrame(tick);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    runInputSystem(world);
    runSpriteAnimationSystem(world, dt);
    runMovementSystem(world, dt);

    const anim = player.spriteAnimation;
    if (anim) {
      updateSpriteUV(playerTexture, anim.frameIndex, anim.direction);
    }

    renderer.render(scene, camera);
  }

  tick();
}

async function boot() {
  const [playerTexture] = await preloadAll([PLAYER_SPRITE]);
  const player = createPlayer(playerTexture);

  world.add(player);
  updateSpriteUV(playerTexture, 0, DIRECTION_DOWN);

  startGameLoop(player, playerTexture);
}

boot();
