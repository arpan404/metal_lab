/**
 * Test utilities for physics-engine tests
 */
/**
 * Creates a mock canvas element for testing
 */
export declare function createMockCanvas(width?: number, height?: number): HTMLCanvasElement;
/**
 * Creates a mock WebGL rendering context
 */
export declare function createMockWebGLContext(): WebGL2RenderingContext | null;
/**
 * Waits for next animation frame (mocked)
 */
export declare function waitForNextFrame(): Promise<void>;
/**
 * Waits for multiple animation frames
 */
export declare function waitForFrames(count: number): Promise<void>;
/**
 * Simulates time passing
 */
export declare function advanceTime(ms: number): void;
/**
 * Creates a mock experiment configuration
 */
export declare function createMockExperimentConfig(): {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner";
    estimatedTime: number;
    learningObjectives: string[];
    parameters: {
        gravity: {
            value: number;
            min: number;
            max: number;
            step: number;
        };
        mass: {
            value: number;
            min: number;
            max: number;
            step: number;
        };
    };
    initialConditions: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        velocity: {
            x: number;
            y: number;
            z: number;
        };
    };
};
/**
 * Creates a mock game configuration
 */
export declare function createMockGameConfig(): {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner";
    estimatedTime: number;
    objectives: {
        id: string;
        description: string;
        points: number;
    }[];
    timeLimitSeconds: number;
    parameters: {};
};
/**
 * Validates that a scene has basic required components
 */
export declare function validateSceneStructure(scene: any): void;
/**
 * Validates that a renderer is properly initialized
 */
export declare function validateRenderer(renderer: any): void;
/**
 * Validates experiment state structure
 */
export declare function validateExperimentState(state: any): void;
/**
 * Validates game state structure
 */
export declare function validateGameState(state: any): void;
/**
 * Creates a mock GPU device for testing
 */
export declare function createMockGPUDevice(): {
    createBuffer: jest.Mock<any, any, any>;
    createBindGroup: jest.Mock<any, any, any>;
    createBindGroupLayout: jest.Mock<any, any, any>;
    createPipelineLayout: jest.Mock<any, any, any>;
    createComputePipeline: jest.Mock<any, any, any>;
    createCommandEncoder: jest.Mock<any, any, any>;
    queue: {
        submit: jest.Mock<any, any, any>;
        writeBuffer: jest.Mock<any, any, any>;
    };
};
/**
 * Mocks shader loading
 */
export declare function mockShaderLoader(): jest.Mock<any, any, any>;
/**
 * Validates measurement data structure
 */
export declare function validateMeasurements(measurements: any): void;
/**
 * Creates mock wave field data for quantum simulations
 */
export declare function createMockWaveField(size: number): Float32Array;
/**
 * Validates vector field data
 */
export declare function validateVectorField(field: any): void;
/**
 * Checks if a value is within a tolerance
 */
export declare function expectCloseTo(actual: number, expected: number, tolerance?: number): void;
/**
 * Validates physics state progression (no NaN or Infinity values)
 */
export declare function validatePhysicsState(state: any): void;
//# sourceMappingURL=testUtils.d.ts.map