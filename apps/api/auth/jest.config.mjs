import nodeConfig from '@repo/config-jest/node.config.mjs';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...nodeConfig,
  roots: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup/setup.ts'],
  testMatch: ['**/*.spec.{js,ts,jsx,tsx}', '**/*.test.{js,ts,jsx,tsx}'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    'public/(.*)': '<rootDir>/public/$1',
  },
};
