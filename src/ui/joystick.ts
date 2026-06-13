import { PlayerInput } from '@/core/ecs';
import styles from './joystick.module.css';

const DEAD_ZONE = 0.2;

export function createJoystick(input: PlayerInput): void {
  const area = document.createElement('div');
  area.className = styles.joystickArea;

  const base = document.createElement('div');
  base.className = styles.joystickBase;

  const knob = document.createElement('div');
  knob.className = styles.joystickKnob;

  area.appendChild(base);
  area.appendChild(knob);
  document.body.appendChild(area);

  let activeId: number | null = null;
  const center = { x: 0, y: 0 };
  const maxDist = 50;

  function updateCenter() {
    const rect = area.getBoundingClientRect();
    center.x = rect.left + rect.width / 2;
    center.y = rect.top + rect.height / 2;
  }

  function applyInput(dx: number, dy: number) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    const norm = Math.min(dist / maxDist, 1);
    const nx = dist > 0 ? (dx / dist) * norm : 0;
    const ny = dist > 0 ? (dy / dist) * norm : 0;

    input.right = nx > DEAD_ZONE;
    input.left = nx < -DEAD_ZONE;
    input.up = ny < -DEAD_ZONE;
    input.down = ny > DEAD_ZONE;

    const knobX = nx * maxDist;
    const knobY = ny * maxDist;
    knob.style.left = `calc(50% + ${knobX}px)`;
    knob.style.top = `calc(50% + ${knobY}px)`;
  }

  function resetInput() {
    input.up = input.down = input.left = input.right = false;
    knob.style.left = '50%';
    knob.style.top = '50%';
    knob.classList.remove(styles.active);
    activeId = null;
  }

  area.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (activeId !== null) return;
    const touch = e.changedTouches[0];
    activeId = touch.identifier;
    updateCenter();
    knob.classList.add(styles.active);
    applyInput(touch.clientX - center.x, touch.clientY - center.y);
  });

  area.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === activeId) {
        applyInput(t.clientX - center.x, t.clientY - center.y);
        break;
      }
    }
  });

  area.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeId) {
        resetInput();
        break;
      }
    }
  });

  area.addEventListener('touchcancel', () => resetInput());
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
