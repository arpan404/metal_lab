/**
 * Color utilities for visualization
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export interface HSL {
    h: number;
    s: number;
    l: number;
}
/**
 * Convert hex color to RGB
 */
export declare function hexToRgb(hex: string): RGB;
/**
 * Convert RGB to hex
 */
export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Convert HSL to RGB
 */
export declare function hslToRgb(h: number, s: number, l: number): RGB;
/**
 * Convert RGB to HSL
 */
export declare function rgbToHsl(r: number, g: number, b: number): HSL;
/**
 * Interpolate between two colors
 */
export declare function lerpColor(color1: RGB, color2: RGB, t: number): RGB;
/**
 * Create color gradient
 */
export declare function createGradient(colors: string[], steps: number): string[];
/**
 * Map value to color using a colormap
 */
export declare function mapValueToColor(value: number, min: number, max: number, colormap?: 'viridis' | 'plasma' | 'hot' | 'cool' | 'rainbow'): string;
/**
 * Get wavelength color (visible spectrum)
 */
export declare function wavelengthToRgb(wavelength: number): RGB;
/**
 * Physics-themed color palettes
 */
export declare const COLOR_PALETTES: {
    electric: {
        positive: string;
        negative: string;
        neutral: string;
        field: string;
    };
    quantum: {
        wave: string;
        particle: string;
        interference: string;
        probability: string;
    };
    nuclear: {
        alpha: string;
        beta: string;
        gamma: string;
        nucleus: string;
    };
    mechanics: {
        velocity: string;
        acceleration: string;
        force: string;
        trajectory: string;
    };
};
//# sourceMappingURL=colors.d.ts.map