import { mergeConfig } from 'vitest/config';
import reactConfig from '@repo/config-vitest/react.config.mjs';

/** @type {import('vitest').UserConfig} */
export default mergeConfig(reactConfig, {
  test: {
    setupFiles: './src/setupTests.ts',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['node_modules'],
  },
});
