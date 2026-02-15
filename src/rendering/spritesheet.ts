import { Texture } from 'three';

const FRAME_COUNT = 3;
const DIRECTION_COUNT = 4;

export function configureSpritesheet(texture: Texture) {
  texture.repeat.set(1 / FRAME_COUNT, 1 / DIRECTION_COUNT);
}

export function updateSpriteUV(
  texture: Texture,
  frameIndex: number,
  direction: number
) {
  texture.offset.set(
    frameIndex / FRAME_COUNT,
    1 - (direction + 1) / DIRECTION_COUNT
  );
}

export { FRAME_COUNT, DIRECTION_COUNT };
