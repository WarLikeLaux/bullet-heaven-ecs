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
