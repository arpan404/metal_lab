/**
 * Format number with SI prefix
 */
export declare function formatWithSIPrefix(value: number, unit?: string, decimals?: number): string;
/**
 * Format scientific notation
 */
export declare function formatScientific(value: number, decimals?: number): string;
/**
 * Format percentage
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Format time duration
 */
export declare function formatDuration(seconds: number): string;
/**
 * Format angle
 */
export declare function formatAngle(radians: number, unit?: 'rad' | 'deg'): string;
/**
 * Format vector
 */
export declare function formatVector(v: {
    x: number;
    y: number;
    z: number;
}, decimals?: number): string;
/**
 * Format large number with commas
 */
export declare function formatWithCommas(value: number): string;
/**
 * Format bytes
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format physical quantity with unit
 */
export declare function formatPhysicalQuantity(value: number, unit: string, name?: string): string;
/**
 * Format coordinate
 */
export declare function formatCoordinate(value: number, axis: 'x' | 'y' | 'z', decimals?: number): string;
/**
 * Format charge
 */
export declare function formatCharge(charge: number): string;
/**
 * Format energy
 */
export declare function formatEnergy(joules: number, preferredUnit?: 'J' | 'eV' | 'MeV'): string;
/**
 * Format mass
 */
export declare function formatMass(kg: number, preferredUnit?: 'kg' | 'amu'): string;
/**
 * Format wavelength
 */
export declare function formatWavelength(meters: number): string;
/**
 * Format frequency
 */
export declare function formatFrequency(hz: number): string;
//# sourceMappingURL=formatters.d.ts.map