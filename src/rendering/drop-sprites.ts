import { CanvasTexture, NearestFilter } from 'three';

const CRYSTAL_SIZE = 32;
const HEART_SIZE = 32;

function makeCanvas(
  size: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  return [canvas, ctx];
}

function makeTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  return tex;
}

let xpTex: CanvasTexture | null = null;
let healTex: CanvasTexture | null = null;

export function getXpCrystalTexture(): CanvasTexture {
  if (xpTex) return xpTex;
  const [canvas, ctx] = makeCanvas(CRYSTAL_SIZE);
  const cx = CRYSTAL_SIZE / 2;
  const cy = CRYSTAL_SIZE / 2;

  ctx.fillStyle = '#4af';
  ctx.beginPath();
  ctx.moveTo(cx, 2);
  ctx.lineTo(cx + 10, cy);
  ctx.lineTo(cx, CRYSTAL_SIZE - 2);
  ctx.lineTo(cx - 10, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#aef';
  ctx.beginPath();
  ctx.moveTo(cx, 6);
  ctx.lineTo(cx + 5, cy);
  ctx.lineTo(cx, CRYSTAL_SIZE - 6);
  ctx.lineTo(cx - 2, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(cx - 2, 10);
  ctx.lineTo(cx + 1, 10);
  ctx.lineTo(cx - 1, 16);
  ctx.closePath();
  ctx.fill();

  xpTex = makeTexture(canvas);
  return xpTex;
}

export function getHealTexture(): CanvasTexture {
  if (healTex) return healTex;
  const [canvas, ctx] = makeCanvas(HEART_SIZE);
  const cx = HEART_SIZE / 2;

  ctx.fillStyle = '#f44';
  ctx.beginPath();
  ctx.moveTo(cx, HEART_SIZE - 6);
  ctx.bezierCurveTo(2, HEART_SIZE / 2, 2, 6, cx, 10);
  ctx.bezierCurveTo(
    HEART_SIZE - 2,
    6,
    HEART_SIZE - 2,
    HEART_SIZE / 2,
    cx,
    HEART_SIZE - 6
  );
  ctx.fill();

  ctx.fillStyle = '#f88';
  ctx.beginPath();
  ctx.arc(cx - 4, 11, 3, 0, Math.PI * 2);
  ctx.fill();

  healTex = makeTexture(canvas);
  return healTex;
}
