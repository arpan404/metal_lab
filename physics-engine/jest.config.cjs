/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',                 // or 'node' if you don't touch DOM
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json', useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    // allow imports like 'three/addons/...'
    '^three/addons/(.*)$': 'three/examples/jsm/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
};
