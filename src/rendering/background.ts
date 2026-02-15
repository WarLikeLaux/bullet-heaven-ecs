import {
  Scene,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  RepeatWrapping,
  NearestFilter,
  Texture,
} from 'three';
import {
  WORLD_SIZE,
  TILE_REPEAT,
  DECOR_COUNT,
  DECOR_SPREAD,
  DECOR_SCALE_MIN,
  DECOR_SCALE_MAX,
} from '@/config';

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

export function scatterDecor(scene: Scene, textures: Texture[]) {
  const scaleRange = DECOR_SCALE_MAX - DECOR_SCALE_MIN;

  for (let i = 0; i < DECOR_COUNT; i++) {
    const tex = textures[Math.floor(Math.random() * textures.length)];
    tex.magFilter = NearestFilter;
    tex.minFilter = NearestFilter;

    const scale = DECOR_SCALE_MIN + Math.random() * scaleRange;
    const geo = new PlaneGeometry(scale, scale);
    const mat = new MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
    });
    const m = new Mesh(geo, mat);
    m.position.x = (Math.random() - 0.5) * DECOR_SPREAD * 2;
    m.position.y = (Math.random() - 0.5) * DECOR_SPREAD * 2;
    m.position.z = -0.5;
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    scene.add(m);
  }
}
