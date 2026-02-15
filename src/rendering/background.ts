import {
  Scene,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  RepeatWrapping,
  NearestFilter,
  Texture,
} from 'three';
import { WORLD_SIZE, TILE_REPEAT } from '@/config';

export function createBackground(scene: Scene, tileTexture: Texture) {
  tileTexture.wrapS = RepeatWrapping;
  tileTexture.wrapT = RepeatWrapping;
  tileTexture.magFilter = NearestFilter;
  tileTexture.minFilter = NearestFilter;
  tileTexture.repeat.set(TILE_REPEAT, TILE_REPEAT);

  const geometry = new PlaneGeometry(WORLD_SIZE, WORLD_SIZE);
  const material = new MeshBasicMaterial({ map: tileTexture });
  const mesh = new Mesh(geometry, material);
  mesh.position.z = -1;
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  scene.add(mesh);
}
