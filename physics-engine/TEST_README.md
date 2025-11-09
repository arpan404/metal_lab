# Physics Engine Test Suite

This document describes the comprehensive test suite for the physics-engine WebGL rendering and simulation system.

## Overview

The test suite validates:
- WebGL rendering with Three.js
- Simulation logic for experiments and games
- Physics engines (Quantum and Classical)
- Scene management and effects
- Data structures and computational accuracy

## Test Structure

### Integration Tests (`integration.test.ts`)
**Status: ✅ All 9 tests passing**

Core integration tests covering:
- WebGL renderer initialization
- Frame rendering
- Scene configuration (lights, fog, backgrounds)
- Window resize handling
- Physics state validation
- Wave field data structures
- Complete rendering pipeline

### Component Tests

#### Renderer Tests
- **ThreeJSRenderer.test.ts**: Main WebGL renderer (comprehensive)
- **DoubleSlitScene.test.ts**: Young's double slit experiment scene
- **WaveVisualization.test.ts**: Wave field visualization effects

#### Experiment Tests
- **FoucaultPendulum.test.ts**: Earth rotation demonstration

#### Game Tests
- **BankedTrackChallenge.test.ts**: NASCAR banking physics game

#### Physics Engine Tests
- **QuantumEngine.test.ts**: WebGPU quantum simulation engine

## Running Tests

### Run All Tests
```bash
cd physics-engine
npm test
```

### Run Specific Test Suite
```bash
npm test -- integration.test.ts
npm test -- renderer/ThreeJSRenderer.test.ts
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Infrastructure

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom (for browser API simulation)
- **Preset**: ts-jest (TypeScript support)
- **Module Mapping**: Handles GLSL/WGSL shaders and 3D models
- **Timeout**: 10 seconds per test

### Mocks

#### Three.js Mock (`__mocks__/three.ts`)
Complete mock implementation of Three.js classes:
- Vector3, Color
- Scene, Camera (Perspective/Orthographic)
- WebGLRenderer
- Geometries (Box, Sphere, Plane, Buffer)
- Materials (Basic, Standard, Shader, Points)
- Lights (Directional, Ambient, Point)
- Fog (Linear and Exponential)
- Texture, DataTexture

#### WebGL/WebGPU Mocks (`jest.setup.js`)
- WebGL context simulation
- WebGPU device mock
- Canvas element mock
- RequestAnimationFrame mock
- Performance.now mock

### Test Utilities (`__tests__/testUtils.ts`)
Helper functions for:
- Canvas creation
- State validation
- Physics state verification
- Mock data generation (wave fields, experiments, games)
- Numerical comparison (expectCloseTo)

## Test Coverage

### Covered Areas
✅ WebGL rendering initialization and configuration
✅ Scene management (add/remove objects, clear)
✅ Camera management (perspective, orthographic, resize)
✅ Lighting systems (ambient, directional, point, spot, hemisphere)
✅ Tone mapping (Linear, Reinhard, Cineon, ACESFilmic)
✅ Fog effects (linear, exponential)
✅ Shadow mapping
✅ Frame rendering
✅ Wave field data structures
✅ Physics state validation
✅ Vector operations

### Known Limitations

Some component tests may require adjustment due to API differences:
- BaseGame methods (getScore, etc.) may not be implemented
- WaveVisualization.dispose() may not exist
- QuantumEngine.computeInterferencePattern() may need implementation
- Experiment/Game state structures may differ from types

These tests serve as specifications for future implementation or can be adjusted to match actual API.

## Test Development Guidelines

### Adding New Tests

1. **Create test file** next to the source file:
   ```
   src/MyComponent.ts
   src/MyComponent.test.ts
   ```

2. **Import test utilities**:
   ```typescript
   import { createMockCanvas, validatePhysicsState } from '../__tests__/testUtils';
   ```

3. **Mock dependencies**:
   ```typescript
   jest.mock('three');
   jest.mock('../some-dependency');
   ```

4. **Write descriptive tests**:
   ```typescript
   describe('MyComponent', () => {
     describe('Feature X', () => {
       it('should do specific thing', () => {
         // Arrange
         const component = new MyComponent();

         // Act
         const result = component.doThing();

         // Assert
         expect(result).toBe(expected);
       });
     });
   });
   ```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use afterEach() to dispose resources
3. **Descriptive Names**: Test names should clearly state what is tested
4. **Single Responsibility**: One test per behavior
5. **AAA Pattern**: Arrange, Act, Assert
6. **Mock External Dependencies**: Don't rely on actual WebGL/WebGPU

### Debugging Tests

Run tests in verbose mode:
```bash
npm test -- --verbose
```

Run a single test:
```bash
npm test -- -t "test name pattern"
```

Debug with Node inspector:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before releases

Example GitHub Actions workflow:
```yaml
- name: Run Physics Engine Tests
  run: |
    cd physics-engine
    npm test
```

## Future Improvements

- [ ] Add visual regression tests for renderings
- [ ] Add performance benchmarks
- [ ] Add E2E tests for complete simulations
- [ ] Increase coverage to >80%
- [ ] Add mutation testing
- [ ] Add WebGPU compute shader tests
- [ ] Add screenshot comparison tests

## Troubleshooting

### Tests Fail Due to Missing Methods
**Cause**: Test expects method that doesn't exist in implementation
**Solution**: Either implement the method or remove/adjust the test

### WebGL Context Errors
**Cause**: Mock doesn't support required WebGL feature
**Solution**: Extend `jest.setup.js` with needed mock methods

### Timeout Errors
**Cause**: Test takes too long (>10 seconds)
**Solution**: Increase timeout in jest.config.js or use `jest.setTimeout()`

### Import Errors
**Cause**: Module path resolution issues
**Solution**: Check `moduleNameMapper` in jest.config.js

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Three.js Testing Examples](https://github.com/mrdoob/three.js/tree/dev/test)
- [WebGL Testing Guide](https://webglfundamentals.org/webgl/lessons/webgl-testing.html)

## Maintainers

For questions or issues with tests, please open an issue in the repository.
