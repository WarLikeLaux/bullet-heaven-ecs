import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
} from 'three';
import { createWorld, Entity } from '@/core/ecs';
import { runMovementSystem } from '@/core/systems';

const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_DISTANCE = 5;
const CUBE_COLOR = 0x00ff00;
const INITIAL_CUBE_COUNT = 100;
const RANDOM_SPEED = 2;
const FRAME_DT = 0.016;

const world = createWorld();
const scene = new Scene();
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(
  CAMERA_FOV,
  aspectRatio,
  CAMERA_NEAR,
  CAMERA_FAR
);
const renderer = new WebGLRenderer();

document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = CAMERA_DISTANCE;

function createCube(id: string, x: number, y: number): Entity {
  const geometry = new BoxGeometry();
  const material = new MeshBasicMaterial({ color: CUBE_COLOR });
  const mesh = new Mesh(geometry, material);

  scene.add(mesh);

  const randomDirection = new Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    0
  )
    .normalize()
    .multiplyScalar(RANDOM_SPEED);

  return {
    id,
    position: new Vector3(x, y, 0),
    velocity: randomDirection,
    view: mesh,
  };
}

for (let i = 0; i < INITIAL_CUBE_COUNT; i++) {
  const entity = createCube(`cube-${i}`, 0, 0);
  world.add(entity);
}

function animate() {
  requestAnimationFrame(animate);
  runMovementSystem(world, FRAME_DT);
  renderer.render(scene, camera);
}

animate();
