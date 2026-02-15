import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  DIRECTION_DOWN,
  DIRECTION_UP,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
} from '@/core/ecs';
import { directionFromVelocity } from '@/core/systems';

describe('directionFromVelocity', () => {
  it('returns DOWN for negative Y dominant', () => {
    expect(directionFromVelocity(new Vector3(0, -5, 0))).toBe(DIRECTION_DOWN);
  });

  it('returns UP for positive Y dominant', () => {
    expect(directionFromVelocity(new Vector3(0, 5, 0))).toBe(DIRECTION_UP);
  });

  it('returns LEFT for negative X dominant', () => {
    expect(directionFromVelocity(new Vector3(-5, 0, 0))).toBe(DIRECTION_LEFT);
  });

  it('returns RIGHT for positive X dominant', () => {
    expect(directionFromVelocity(new Vector3(5, 0, 0))).toBe(DIRECTION_RIGHT);
  });

  it('returns DOWN for equal negative components', () => {
    expect(directionFromVelocity(new Vector3(-3, -3, 0))).toBe(DIRECTION_DOWN);
  });

  it('returns UP for equal positive components', () => {
    expect(directionFromVelocity(new Vector3(3, 3, 0))).toBe(DIRECTION_UP);
  });

  it('returns DOWN for diagonal down-right', () => {
    expect(directionFromVelocity(new Vector3(1, -5, 0))).toBe(DIRECTION_DOWN);
  });

  it('returns RIGHT for diagonal right-up', () => {
    expect(directionFromVelocity(new Vector3(5, 1, 0))).toBe(DIRECTION_RIGHT);
  });
});
