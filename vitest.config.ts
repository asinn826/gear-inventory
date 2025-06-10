import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/test-utils/**',
        '**/__mocks__/**',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
