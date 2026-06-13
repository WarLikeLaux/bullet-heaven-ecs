import {
  Texture,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Scene,
  NearestFilter,
  RepeatWrapping,
} from 'three';
import { Entity } from '@/core/ecs';

export type VfxSheet = {
  texture: Texture;
  cols: number;
  rows: number;
  totalFrames: number;
  fps: number;
};

export function createVfxSheet(
  texture: Texture,
  cols: number,
  rows: number,
  fps: number
): VfxSheet {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1 / cols, 1 / rows);
  texture.magFilter = NearestFilter;
  return { texture, cols, rows, totalFrames: cols * rows, fps };
}

export function createVfxMesh(
  scene: Scene,
  sheet: VfxSheet,
  scale: number,
  z: number
): Mesh {
  const geo = new PlaneGeometry(scale, scale);
  const mat = new MeshBasicMaterial({
    map: sheet.texture.clone(),
    transparent: true,
    depthWrite: false,
  });
  const cloned = mat.map;
  if (cloned) {
    cloned.wrapS = RepeatWrapping;
    cloned.wrapT = RepeatWrapping;
    cloned.repeat.set(1 / sheet.cols, 1 / sheet.rows);
    cloned.magFilter = NearestFilter;
  }
  const mesh = new Mesh(geo, mat);
  mesh.position.z = z;
  scene.add(mesh);
  return mesh;
}

export function setVfxFrame(mesh: Mesh, sheet: VfxSheet, frame: number) {
  const mat = mesh.material as MeshBasicMaterial;
  const tex = mat.map;
  if (!tex) return;
  const col = frame % sheet.cols;
  const row = Math.floor(frame / sheet.cols);
  tex.offset.set(col / sheet.cols, 1 - (row + 1) / sheet.rows);
}

export function animateVfxFrame(sheet: VfxSheet, elapsed: number): number {
  return Math.floor(elapsed * sheet.fps) % sheet.totalFrames;
}

export function createVfxEntity(
  scene: Scene,
  sheet: VfxSheet,
  scale: number,
  z: number
): { entity: Entity; mesh: Mesh } {
  const mesh = createVfxMesh(scene, sheet, scale, z);
  const entity: Entity = {
    id: `vfx-${Math.random().toString(36).slice(2, 8)}`,
    position: mesh.position,
    view: mesh,
  };
  return { entity, mesh };
}
