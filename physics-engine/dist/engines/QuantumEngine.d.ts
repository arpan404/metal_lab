export declare class QuantumEngine {
    private device;
    private pipeline;
    private buffers;
    initialize(): Promise<void>;
    private loadShaders;
    computeWaveEvolution(waveData: Float32Array, params: WaveParameters): Promise<Float32Array>;
    private createParamBuffer;
    dispose(): void;
}
interface WaveParameters {
    gridSize: number;
    wavelength: number;
    dt: number;
    slitSeparation: number;
}
export {};
//# sourceMappingURL=QuantumEngine.d.ts.map