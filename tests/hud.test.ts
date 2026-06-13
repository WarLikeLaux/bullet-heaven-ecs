import { describe, it, expect } from 'vitest';
import { formatTime } from '@/ui/hud';

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds with padding', () => {
    expect(formatTime(5)).toBe('0:05');
  });

  it('formats full minutes', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(63.7)).toBe('1:03');
  });

  it('formats large values', () => {
    expect(formatTime(600)).toBe('10:00');
  });
});
