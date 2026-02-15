import { World } from 'miniplex';
import { Object3D, Texture, Vector3 } from 'three';

export const DIRECTION_DOWN = 0;
export const DIRECTION_LEFT = 1;
export const DIRECTION_RIGHT = 2;
export const DIRECTION_UP = 3;

export type SpriteAnimation = {
  frameIndex: number;
  frameCount: number;
  frameDuration: number;
  elapsed: number;
  direction: number;
  isMoving: boolean;
};

export type PlayerInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type Entity = {
  id: string;
  position?: Vector3;
  velocity?: Vector3;
  speed?: number;
  view?: Object3D;
  playerInput?: PlayerInput;
  spriteAnimation?: SpriteAnimation;
  enemy?: true;
  chaseTarget?: Vector3;
  spriteTexture?: Texture;
  hp?: number;
  maxHp?: number;
  damage?: number;
  invulnerableUntil?: number;
  dead?: true;
  projectile?: true;
  lifetime?: number;
  fireTimer?: number;
};

export function createWorld() {
  return new World<Entity>();
}
