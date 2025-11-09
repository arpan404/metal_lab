import type { ExperimentState, Snapshot } from '../types/Experiments';
/**
 * Serialize experiment state to JSON
 */
export declare function serializeState(state: ExperimentState): string;
/**
 * Deserialize experiment state from JSON
 */
export declare function deserializeState(json: string): ExperimentState;
/**
 * Serialize snapshot to compressed format
 */
export declare function serializeSnapshot(snapshot: Snapshot): string;
/**
 * Deserialize snapshot
 */
export declare function deserializeSnapshot(json: string): Snapshot;
/**
 * Export to file
 */
export declare function exportToFile(data: string, filename: string, mimeType?: string): void;
/**
 * Import from file
 */
export declare function importFromFile(file: File): Promise<string>;
/**
 * Compress data using simple RLE
 */
export declare function compressData(data: number[]): string;
/**
 * Decompress RLE data
 */
export declare function decompressData(compressed: string): number[];
/**
 * Convert typed array to base64
 */
export declare function typedArrayToBase64(array: Float32Array | Uint8Array): string;
/**
 * Convert base64 to typed array
 */
export declare function base64ToTypedArray(base64: string, ArrayType?: any): Float32Array | Uint8Array;
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Validate JSON structure
 */
export declare function validateJSON(json: string, schema?: any): boolean;
//# sourceMappingURL=serialization.d.ts.map