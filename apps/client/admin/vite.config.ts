import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    dts({ tsconfigPath: './tsconfig.build.json' }),
  ],
});
