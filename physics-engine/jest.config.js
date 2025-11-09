module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
      },
    }],
  },
  moduleNameMapper: {
    '\\.(glsl|vert|frag|wgsl)$': '<rootDir>/__mocks__/shaderMock.js',
    '\\.(glb|gltf)$': '<rootDir>/__mocks__/modelMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/types/**',
    '!index.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  globals: {
    WebGLRenderingContext: {},
    WebGL2RenderingContext: {},
  },
};
