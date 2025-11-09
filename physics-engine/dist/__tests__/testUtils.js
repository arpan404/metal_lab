/**
 * Test utilities for physics-engine tests
 */
/**
 * Creates a mock canvas element for testing
 */
export function createMockCanvas(width = 800, height = 600) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
/**
 * Creates a mock WebGL rendering context
 */
export function createMockWebGLContext() {
    const canvas = createMockCanvas();
    return canvas.getContext('webgl2');
}
/**
 * Waits for next animation frame (mocked)
 */
export function waitForNextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => resolve());
    });
}
/**
 * Waits for multiple animation frames
 */
export async function waitForFrames(count) {
    for (let i = 0; i < count; i++) {
        await waitForNextFrame();
    }
}
/**
 * Simulates time passing
 */
export function advanceTime(ms) {
    const now = performance.now;
    const currentTime = now() || 0;
    now.mockReturnValue(currentTime + ms);
}
/**
 * Creates a mock experiment configuration
 */
export function createMockExperimentConfig() {
    return {
        id: 'test-experiment',
        name: 'Test Experiment',
        description: 'A test experiment',
        difficulty: 'beginner',
        estimatedTime: 10,
        learningObjectives: ['Test objective 1', 'Test objective 2'],
        parameters: {
            gravity: { value: 9.81, min: 0, max: 20, step: 0.1 },
            mass: { value: 1, min: 0.1, max: 10, step: 0.1 },
        },
        initialConditions: {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
        },
    };
}
/**
 * Creates a mock game configuration
 */
export function createMockGameConfig() {
    return {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        difficulty: 'beginner',
        estimatedTime: 15,
        objectives: [
            { id: 'obj1', description: 'Complete objective 1', points: 100 },
            { id: 'obj2', description: 'Complete objective 2', points: 200 },
        ],
        timeLimitSeconds: 300,
        parameters: {},
    };
}
/**
 * Validates that a scene has basic required components
 */
export function validateSceneStructure(scene) {
    expect(scene).toBeDefined();
    expect(scene.children).toBeDefined();
    expect(Array.isArray(scene.children)).toBe(true);
}
/**
 * Validates that a renderer is properly initialized
 */
export function validateRenderer(renderer) {
    expect(renderer).toBeDefined();
    const webglRenderer = renderer.getRenderer ? renderer.getRenderer() : renderer;
    expect(webglRenderer.domElement).toBeDefined();
    expect(webglRenderer.domElement).toBeInstanceOf(HTMLCanvasElement);
}
/**
 * Validates experiment state structure
 */
export function validateExperimentState(state) {
    expect(state).toBeDefined();
    expect(state).toHaveProperty('time');
    expect(state).toHaveProperty('parameters');
    expect(typeof state.time).toBe('number');
    expect(typeof state.parameters).toBe('object');
}
/**
 * Validates game state structure
 */
export function validateGameState(state) {
    validateExperimentState(state);
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('objectives');
    expect(typeof state.score).toBe('number');
}
/**
 * Creates a mock GPU device for testing
 */
export function createMockGPUDevice() {
    return {
        createBuffer: jest.fn().mockReturnValue({
            destroy: jest.fn(),
            getMappedRange: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
            mapAsync: jest.fn().mockResolvedValue(undefined),
            unmap: jest.fn(),
        }),
        createBindGroup: jest.fn().mockReturnValue({}),
        createBindGroupLayout: jest.fn().mockReturnValue({}),
        createPipelineLayout: jest.fn().mockReturnValue({}),
        createComputePipeline: jest.fn().mockReturnValue({}),
        createCommandEncoder: jest.fn().mockReturnValue({
            beginComputePass: jest.fn().mockReturnValue({
                setPipeline: jest.fn(),
                setBindGroup: jest.fn(),
                dispatchWorkgroups: jest.fn(),
                end: jest.fn(),
            }),
            copyBufferToBuffer: jest.fn(),
            finish: jest.fn().mockReturnValue({}),
        }),
        queue: {
            submit: jest.fn(),
            writeBuffer: jest.fn(),
        },
    };
}
/**
 * Mocks shader loading
 */
export function mockShaderLoader() {
    return jest.fn().mockResolvedValue('mock-shader-code');
}
/**
 * Validates measurement data structure
 */
export function validateMeasurements(measurements) {
    expect(measurements).toBeDefined();
    expect(Array.isArray(measurements)).toBe(true);
    measurements.forEach((measurement) => {
        expect(measurement).toHaveProperty('name');
        expect(measurement).toHaveProperty('value');
        expect(measurement).toHaveProperty('unit');
    });
}
/**
 * Creates mock wave field data for quantum simulations
 */
export function createMockWaveField(size) {
    const data = new Float32Array(size * size * 2); // Complex numbers (real, imag)
    for (let i = 0; i < data.length; i += 2) {
        data[i] = Math.random(); // Real part
        data[i + 1] = Math.random(); // Imaginary part
    }
    return data;
}
/**
 * Validates vector field data
 */
export function validateVectorField(field) {
    expect(field).toBeDefined();
    expect(field.length).toBeGreaterThan(0);
    expect(field.length % 3).toBe(0); // Should be sets of (x, y, z)
}
/**
 * Checks if a value is within a tolerance
 */
export function expectCloseTo(actual, expected, tolerance = 0.001) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}
/**
 * Validates physics state progression (no NaN or Infinity values)
 */
export function validatePhysicsState(state) {
    const validateNumber = (value, path) => {
        if (typeof value === 'number') {
            expect(isNaN(value)).toBe(false);
            expect(isFinite(value)).toBe(true);
        }
        else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([key, val]) => {
                validateNumber(val, `${path}.${key}`);
            });
        }
    };
    validateNumber(state, 'state');
}
