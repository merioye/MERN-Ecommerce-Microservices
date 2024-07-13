import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

/*
 * This is a custom Vitest configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

/** @type {import('vitest').UserConfig} */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    css: false,
    globals: true,
    environment: 'jsdom',
    clearMocks: true,
  },
});
