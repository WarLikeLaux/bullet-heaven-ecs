import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const isTauri = !!process.env.TAURI_ENV_PLATFORM;

export default defineConfig(({ mode }) => ({
  base: isTauri ? '/' : mode === 'production' ? '/bullet-heaven-ecs/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}));
