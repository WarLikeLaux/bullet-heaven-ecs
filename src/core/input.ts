import { PlayerInput } from '@/core/ecs';

const KEY_BINDINGS: Record<string, keyof PlayerInput> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

export function createInputState(): PlayerInput {
  return { up: false, down: false, left: false, right: false };
}

export function bindInput(input: PlayerInput) {
  function onKeyDown(e: KeyboardEvent) {
    const action = KEY_BINDINGS[e.code];
    if (action) {
      e.preventDefault();
      input[action] = true;
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    const action = KEY_BINDINGS[e.code];
    if (action) {
      e.preventDefault();
      input[action] = false;
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

const MOUSE_DEAD = 12;

export function bindMouseInput(input: PlayerInput) {
  let dragging = false;
  let originX = 0;
  let originY = 0;

  function applyDelta(cx: number, cy: number) {
    const dx = cx - originX;
    const dy = cy - originY;
    input.right = dx > MOUSE_DEAD;
    input.left = dx < -MOUSE_DEAD;
    input.down = dy > MOUSE_DEAD;
    input.up = dy < -MOUSE_DEAD;
  }

  function reset() {
    dragging = false;
    input.up = input.down = input.left = input.right = false;
  }

  window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    originX = e.clientX;
    originY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (dragging) applyDelta(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    if (dragging) reset();
  });
}
