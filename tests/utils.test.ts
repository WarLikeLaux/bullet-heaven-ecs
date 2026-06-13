import { describe, it, expect } from 'vitest';
import { formatTime } from '@/ui/hud';
import { isTouchDevice } from '@/ui/joystick';

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatTime(9)).toBe('0:09');
  });

  it('formats exact minute', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(90.7)).toBe('1:30');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('isTouchDevice', () => {
  it('returns a boolean', () => {
    expect(typeof isTouchDevice()).toBe('boolean');
  });
});
