// physics-engine/utils/formatters.ts

/**
 * Format number with SI prefix
 */
export function formatWithSIPrefix(value: number, unit: string = '', decimals: number = 2): string {
    const prefixes = [
      { value: 1e12, prefix: 'T' },
      { value: 1e9, prefix: 'G' },
      { value: 1e6, prefix: 'M' },
      { value: 1e3, prefix: 'k' },
      { value: 1, prefix: '' },
      { value: 1e-3, prefix: 'm' },
      { value: 1e-6, prefix: 'µ' },
      { value: 1e-9, prefix: 'n' },
      { value: 1e-12, prefix: 'p' }
    ];
    
    const absValue = Math.abs(value);
    
    for (const { value: threshold, prefix } of prefixes) {
      if (absValue >= threshold) {
        const scaled = value / threshold;
        return `${scaled.toFixed(decimals)} ${prefix}${unit}`;
      }
    }
    
    return `${value.toExponential(decimals)} ${unit}`;
  }
  
  /**
   * Format scientific notation
   */
  export function formatScientific(value: number, decimals: number = 2): string {
    return value.toExponential(decimals);
  }
  
  /**
   * Format percentage
   */
  export function formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }
  
  /**
   * Format time duration
   */
  export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    } else if (secs > 0) {
      return `${secs}.${ms.toString().padStart(3, '0')}s`;
    } else {
      return `${ms}ms`;
    }
  }
  
  /**
   * Format angle
   */
  export function formatAngle(radians: number, unit: 'rad' | 'deg' = 'deg'): string {
    if (unit === 'deg') {
      const degrees = radians * 180 / Math.PI;
      return `${degrees.toFixed(1)}°`;
    } else {
      return `${radians.toFixed(3)} rad`;
    }
  }
  
  /**
   * Format vector
   */
  export function formatVector(v: { x: number; y: number; z: number }, decimals: number = 2): string {
    return `(${v.x.toFixed(decimals)}, ${v.y.toFixed(decimals)}, ${v.z.toFixed(decimals)})`;
  }
  
  /**
   * Format large number with commas
   */
  export function formatWithCommas(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  /**
   * Format bytes
   */
  export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }
  
  /**
   * Format physical quantity with unit
   */
  export function formatPhysicalQuantity(
    value: number,
    unit: string,
    name?: string
  ): string {
    const formatted = formatWithSIPrefix(value, unit);
    return name ? `${name}: ${formatted}` : formatted;
  }
  
  /**
   * Format coordinate
   */
  export function formatCoordinate(value: number, axis: 'x' | 'y' | 'z', decimals: number = 3): string {
    return `${axis}: ${value.toFixed(decimals)}`;
  }
  
  /**
   * Format charge
   */
  export function formatCharge(charge: number): string {
    const e = 1.602e-19;
    const multiple = Math.round(charge / e);
    
    if (Math.abs(multiple) <= 10 && Math.abs(charge - multiple * e) < e * 0.1) {
      return `${multiple}e`;
    }
    
    return formatWithSIPrefix(charge, 'C');
  }
  
  /**
   * Format energy
   */
  export function formatEnergy(joules: number, preferredUnit: 'J' | 'eV' | 'MeV' = 'J'): string {
    if (preferredUnit === 'eV') {
      const eV = joules / 1.602e-19;
      return formatWithSIPrefix(eV, 'eV');
    } else if (preferredUnit === 'MeV') {
      const MeV = joules / 1.602e-13;
      return `${MeV.toFixed(2)} MeV`;
    } else {
      return formatWithSIPrefix(joules, 'J');
    }
  }
  
  /**
   * Format mass
   */
  export function formatMass(kg: number, preferredUnit: 'kg' | 'amu' = 'kg'): string {
    if (preferredUnit === 'amu') {
      const amu = kg / 1.66054e-27;
      return `${amu.toFixed(2)} amu`;
    } else {
      return formatWithSIPrefix(kg, 'g', 3); // Convert to grams for better readability
    }
  }
  
  /**
   * Format wavelength
   */
  export function formatWavelength(meters: number): string {
    const nm = meters * 1e9;
    return `${nm.toFixed(1)} nm`;
  }
  
  /**
   * Format frequency
   */
  export function formatFrequency(hz: number): string {
    return formatWithSIPrefix(hz, 'Hz');
  }