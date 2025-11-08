// physics-engine/utils/colors.ts

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
  export function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    if (!result) {
      return { r: 0, g: 0, b: 0 };
    }
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }
  
  /**
   * Convert RGB to hex
   */
  export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  /**
   * Convert HSL to RGB
   */
  export function hslToRgb(h: number, s: number, l: number): RGB {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  /**
   * Convert RGB to HSL
   */
  export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return {
      h: h * 360,
      s: s * 100,
      l: l * 100
    };
  }
  
  /**
   * Interpolate between two colors
   */
  export function lerpColor(color1: RGB, color2: RGB, t: number): RGB {
    return {
      r: color1.r + (color2.r - color1.r) * t,
      g: color1.g + (color2.g - color1.g) * t,
      b: color1.b + (color2.b - color1.b) * t
    };
  }
  
  /**
   * Create color gradient
   */
  export function createGradient(colors: string[], steps: number): string[] {
    const gradient: string[] = [];
    const rgbColors = colors.map(hexToRgb);
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const segmentIndex = Math.floor(t * (rgbColors.length - 1));
      const segmentT = (t * (rgbColors.length - 1)) - segmentIndex;
      
      const color1 = rgbColors[segmentIndex];
      const color2 = rgbColors[Math.min(segmentIndex + 1, rgbColors.length - 1)];
      
      const interpolated = lerpColor(color1, color2, segmentT);
      gradient.push(rgbToHex(interpolated.r, interpolated.g, interpolated.b));
    }
    
    return gradient;
  }
  
  /**
   * Map value to color using a colormap
   */
  export function mapValueToColor(
    value: number,
    min: number,
    max: number,
    colormap: 'viridis' | 'plasma' | 'hot' | 'cool' | 'rainbow' = 'viridis'
  ): string {
    const t = (value - min) / (max - min);
    
    const colormaps: Record<string, string[]> = {
      viridis: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde724'],
      plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
      hot: ['#000000', '#ff0000', '#ffff00', '#ffffff'],
      cool: ['#00ffff', '#ff00ff'],
      rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
    };
    
    const colors = colormaps[colormap] || colormaps.viridis;
    const gradient = createGradient(colors, 256);
    
    const index = Math.floor(t * (gradient.length - 1));
    return gradient[Math.max(0, Math.min(index, gradient.length - 1))];
  }
  
  /**
   * Get wavelength color (visible spectrum)
   */
  export function wavelengthToRgb(wavelength: number): RGB {
    // Wavelength in nanometers (380-750)
    let r, g, b;
    
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -(wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 750) {
      r = 1;
      g = 0;
      b = 0;
    } else {
      r = 0;
      g = 0;
      b = 0;
    }
    
    // Intensity falloff near limits
    let factor;
    if (wavelength >= 380 && wavelength < 420) {
      factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength < 700) {
      factor = 1.0;
    } else if (wavelength >= 700 && wavelength <= 750) {
      factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
    } else {
      factor = 0.0;
    }
    
    return {
      r: Math.round(r * factor * 255),
      g: Math.round(g * factor * 255),
      b: Math.round(b * factor * 255)
    };
  }
  
  /**
   * Physics-themed color palettes
   */
  export const COLOR_PALETTES = {
    electric: {
      positive: '#ff0000',
      negative: '#0000ff',
      neutral: '#888888',
      field: '#ffff00'
    },
    quantum: {
      wave: '#00ffff',
      particle: '#ff00ff',
      interference: '#ffff00',
      probability: '#00ff00'
    },
    nuclear: {
      alpha: '#ff6600',
      beta: '#0066ff',
      gamma: '#9900ff',
      nucleus: '#ffff00'
    },
    mechanics: {
      velocity: '#00ff00',
      acceleration: '#ffff00',
      force: '#ff0000',
      trajectory: '#00ffff'
    }
  };