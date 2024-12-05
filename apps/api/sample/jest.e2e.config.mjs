import nodeConfig from '@repo/config-jest/node.config.mjs';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...nodeConfig,
  roots: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup/setup-e2e.ts'],
  testMatch: ['**/*.e2e-spec.{js,ts,jsx,tsx}', '**/*.e2e-test.{js,ts,jsx,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^public/(.*)$': '<rootDir>/public/$1',
  },
};
