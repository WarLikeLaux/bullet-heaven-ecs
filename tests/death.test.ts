import { describe, it, expect, vi } from 'vitest';
import { Scene } from 'three';
import { createWorld, Entity } from '@/core/ecs';
import { runDeathSystem } from '@/core/combat';

describe('Death System', () => {
  it('removes dead entities from world', () => {
    const world = createWorld();
    const scene = { remove: vi.fn() } as unknown as Scene;

    const entity: Entity = { id: 'e1', dead: true };
    world.add(entity);

    expect(world.entities.length).toBe(1);
    runDeathSystem(world, scene);
    expect(world.entities.length).toBe(0);
  });

  it('calls scene.remove for dead entities with view', () => {
    const world = createWorld();
    const mockView = { position: { x: 0, y: 0, z: 0 } };
    const scene = { remove: vi.fn() } as unknown as Scene;

    const entity: Entity = {
      id: 'e1',
      dead: true,
      view: mockView as Entity['view'],
    };
    world.add(entity);

    runDeathSystem(world, scene);

    expect(scene.remove).toHaveBeenCalledWith(mockView);
  });

  it('does not remove alive entities', () => {
    const world = createWorld();
    const scene = { remove: vi.fn() } as unknown as Scene;

    world.add({ id: 'alive' });
    world.add({ id: 'dead', dead: true });

    runDeathSystem(world, scene);

    expect(world.entities.length).toBe(1);
    expect(world.entities[0].id).toBe('alive');
  });
});
