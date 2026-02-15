import { describe, it, expect } from 'vitest';
import {
  generateEnemySpritePaths,
  CHARACTER_COUNT,
  CHARACTER_PATH_PREFIX,
} from '@/config';

describe('generateEnemySpritePaths', () => {
  it('returns correct number of paths', () => {
    const paths = generateEnemySpritePaths();
    expect(paths).toHaveLength(CHARACTER_COUNT);
  });

  it('generates padded filenames', () => {
    const paths = generateEnemySpritePaths();
    expect(paths[0]).toBe(`${CHARACTER_PATH_PREFIX}001.png`);
    expect(paths[9]).toBe(`${CHARACTER_PATH_PREFIX}010.png`);
    expect(paths[31]).toBe(`${CHARACTER_PATH_PREFIX}032.png`);
  });

  it('generates unique paths', () => {
    const paths = generateEnemySpritePaths();
    const unique = new Set(paths);
    expect(unique.size).toBe(CHARACTER_COUNT);
  });
});
