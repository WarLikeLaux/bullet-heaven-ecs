import {
  Scene,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Float32BufferAttribute,
  Vector3,
  Mesh,
} from 'three';
import { Entity } from '@/core/ecs';
import { WeaponContext, WeaponInstance } from '@/core/weapon-registry';
import {
  createVfxMesh,
  setVfxFrame,
  animateVfxFrame,
} from '@/rendering/vfx-sprite';
import {
  CHAIN_INTERVAL,
  CHAIN_DAMAGE,
  CHAIN_TARGETS,
  CHAIN_RANGE,
  CHAIN_COLOR,
  HIT_FLASH_DURATION,
} from '@/config';

const CHAIN_RANGE_SQ = CHAIN_RANGE * CHAIN_RANGE;
const VISUAL_DURATION = 0.25;
const MAX_POINTS = CHAIN_TARGETS * 2;

type EnemyWithPos = Entity & { position: Vector3; hp: number };

function createLines(scene: Scene) {
  const positions = new Float32Array(MAX_POINTS * 3);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const mat = new LineBasicMaterial({
    color: CHAIN_COLOR,
    transparent: true,
    opacity: 0.9,
  });
  const lines = new LineSegments(geo, mat);
  lines.visible = false;
  lines.frustumCulled = false;
  scene.add(lines);
  return { lines, positions, mat };
}

function findChain(
  start: EnemyWithPos,
  enemies: EnemyWithPos[],
  count: number
): EnemyWithPos[] {
  const chain: EnemyWithPos[] = [start];
  const used = new Set<EnemyWithPos>([start]);
  for (let i = 1; i < count; i++) {
    let best: EnemyWithPos | null = null;
    let bestDist = CHAIN_RANGE_SQ;
    const prev = chain[i - 1];
    for (const e of enemies) {
      if (used.has(e)) continue;
      const dx = e.position.x - prev.position.x;
      const dy = e.position.y - prev.position.y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    if (!best) break;
    chain.push(best);
    used.add(best);
  }
  return chain;
}

function writeSeg(
  buf: Float32Array,
  i: number,
  fx: number,
  fy: number,
  tx: number,
  ty: number
): number {
  buf[i] = fx;
  buf[i + 1] = fy;
  buf[i + 2] = 0.5;
  buf[i + 3] = tx;
  buf[i + 4] = ty;
  buf[i + 5] = 0.5;
  return i + 6;
}

export function createChainLightningWeapon(ctx: WeaponContext): WeaponInstance {
  const { lines, positions, mat } = createLines(ctx.scene);
  const sheet = ctx.vfxSheets.lightning;
  const hitMeshes: Mesh[] = [];
  for (let i = 0; i < CHAIN_TARGETS; i++) {
    const m = createVfxMesh(ctx.scene, sheet, 1.5, 0.7);
    m.visible = false;
    hitMeshes.push(m);
  }
  let timer = CHAIN_INTERVAL;
  let visualTimer = 0;

  return {
    id: 'chainLightning',
    update(c: WeaponContext) {
      timer -= c.dt;

      if (timer <= 0) {
        timer = CHAIN_INTERVAL;
        const enemies = [
          ...c.world.with('enemy', 'position', 'hp'),
        ] as EnemyWithPos[];
        const pPos = c.player.position;
        if (!pPos || enemies.length === 0) return;

        let nearest: EnemyWithPos | null = null;
        let nearDist = CHAIN_RANGE_SQ * 4;
        for (const e of enemies) {
          const dx = e.position.x - pPos.x;
          const dy = e.position.y - pPos.y;
          const d = dx * dx + dy * dy;
          if (d < nearDist) {
            nearDist = d;
            nearest = e;
          }
        }
        if (!nearest) return;

        const chain = findChain(nearest, enemies, CHAIN_TARGETS);
        let idx = 0;
        for (let i = 0; i < chain.length; i++) {
          const t = chain[i];
          t.hp -= CHAIN_DAMAGE;
          if (t.hp <= 0) t.hp = 0;
          c.world.addComponent(
            t,
            'hitFlashUntil',
            c.elapsed + HIT_FLASH_DURATION
          );
          const fx = i === 0 ? pPos.x : chain[i - 1].position.x;
          const fy = i === 0 ? pPos.y : chain[i - 1].position.y;
          idx = writeSeg(positions, idx, fx, fy, t.position.x, t.position.y);
          hitMeshes[i].position.set(t.position.x, t.position.y, 0.7);
          hitMeshes[i].visible = true;
        }
        for (let i = chain.length; i < CHAIN_TARGETS; i++)
          hitMeshes[i].visible = false;
        for (let i = idx; i < positions.length; i++) positions[i] = 0;
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.setDrawRange(0, chain.length * 2);
        lines.visible = true;
        visualTimer = VISUAL_DURATION;
      }

      if (visualTimer > 0) {
        visualTimer -= c.dt;
        const progress = visualTimer / VISUAL_DURATION;
        mat.opacity = 0.9 * progress;
        const frame = animateVfxFrame(sheet, c.elapsed);
        for (const m of hitMeshes) {
          if (!m.visible) continue;
          setVfxFrame(m, sheet, frame);
          m.scale.setScalar(progress);
        }
        if (visualTimer <= 0) {
          lines.visible = false;
          for (const m of hitMeshes) m.visible = false;
        }
      }
    },
  };
}
