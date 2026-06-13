import { PlaneGeometry, MeshBasicMaterial, Mesh, Scene } from 'three';
import { Entity } from '@/core/ecs';
import {
  DROP_XP_VALUE,
  DROP_HEAL_VALUE,
  DROP_SIZE,
  DROP_LIFETIME,
} from '@/config';
import { getXpCrystalTexture, getHealTexture } from '@/rendering/drop-sprites';

let nextDropId = 0;

const dropGeometry = new PlaneGeometry(DROP_SIZE, DROP_SIZE);

function createDrop(
  scene: Scene,
  pos: { x: number; y: number },
  type: 'xp' | 'heal'
): Entity {
  const isXp = type === 'xp';
  const texture = isXp ? getXpCrystalTexture() : getHealTexture();
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });
  const mesh = new Mesh(dropGeometry, material);
  mesh.position.set(pos.x, pos.y, -0.1);
  scene.add(mesh);

  const id = `drop-${nextDropId}`;
  nextDropId += 1;

  return {
    id,
    position: mesh.position,
    view: mesh,
    pickup: type,
    pickupValue: isXp ? DROP_XP_VALUE : DROP_HEAL_VALUE,
    lifetime: DROP_LIFETIME,
  };
}

export function createXpCrystal(
  scene: Scene,
  pos: { x: number; y: number }
): Entity {
  return createDrop(scene, pos, 'xp');
}

export function createHealDrop(
  scene: Scene,
  pos: { x: number; y: number }
): Entity {
  return createDrop(scene, pos, 'heal');
}
