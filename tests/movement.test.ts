import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { createWorld, Entity } from '@/core/ecs';
import { runMovementSystem } from '@/core/systems';

describe('Movement System', () => {
	it('применяет скорость к позиции за один такт', () => {
		const world = createWorld();

		const entity: Entity = {
			id: 'test',
			position: new Vector3(0, 0, 0),
			velocity: new Vector3(10, 0, 0),
		};

		world.add(entity);

		runMovementSystem(world, 1.0);

		expect(entity.position?.x).toBe(10);
		expect(entity.position?.y).toBe(0);
		expect(entity.position?.z).toBe(0);
	});
});
