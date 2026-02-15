import { World } from 'miniplex';
import { Object3D, Vector3 } from 'three';

export type Entity = {
  id: string;
  position?: Vector3;
  velocity?: Vector3;
  view?: Object3D;
};

export function createWorld() {
  return new World<Entity>();
}
