import { vectorMagnitude, vectorNormalize, vectorScale } from '../../utils/math';
/**
 * Electric field calculations
 */
export class ElectricField {
    /**
     * Calculate electric field from point charge
     * E = kq/r²
     */
    static pointCharge(charge, position, testPoint) {
        const r = {
            x: testPoint.x - position.x,
            y: testPoint.y - position.y,
            z: testPoint.z - position.z
        };
        const distance = vectorMagnitude(r);
        if (distance < 1e-10)
            return { x: 0, y: 0, z: 0 };
        const magnitude = (this.k * charge) / (distance * distance);
        const direction = vectorNormalize(r);
        return vectorScale(direction, magnitude);
    }
    /**
     * Calculate electric field from multiple point charges
     */
    static multipleCharges(charges, testPoint) {
        const totalField = { x: 0, y: 0, z: 0 };
        charges.forEach(({ charge, position }) => {
            const field = this.pointCharge(charge, position, testPoint);
            totalField.x += field.x;
            totalField.y += field.y;
            totalField.z += field.z;
        });
        return totalField;
    }
    /**
     * Uniform electric field between parallel plates
     * E = V/d
     */
    static uniformField(voltage, separation) {
        return voltage / separation;
    }
    /**
     * Electric field from infinite line charge
     * E = λ/(2πε₀r)
     */
    static lineCharge(linearChargeDensity, distance) {
        return linearChargeDensity / (2 * Math.PI * this.epsilon0 * distance);
    }
    /**
     * Electric field from infinite plane
     * E = σ/(2ε₀)
     */
    static planeCharge(surfaceChargeDensity) {
        return surfaceChargeDensity / (2 * this.epsilon0);
    }
    /**
     * Electric field inside spherical shell
     */
    static insideSphericalShell() {
        return 0; // Field is zero inside
    }
    /**
     * Electric field outside spherical shell
     * E = kQ/r² (same as point charge)
     */
    static outsideSphericalShell(totalCharge, distance) {
        return (this.k * totalCharge) / (distance * distance);
    }
    /**
     * Electric potential from point charge
     * V = kq/r
     */
    static potential(charge, distance) {
        if (distance < 1e-10)
            return Infinity;
        return (this.k * charge) / distance;
    }
    /**
     * Electric potential difference (voltage)
     * ΔV = Ed (for uniform field)
     */
    static potentialDifference(fieldStrength, distance) {
        return fieldStrength * distance;
    }
    /**
     * Electric force on charge in field
     * F = qE
     */
    static forceOnCharge(charge, field) {
        return vectorScale(field, charge);
    }
    /**
     * Work done moving charge in field
     * W = qΔV
     */
    static work(charge, potentialDifference) {
        return charge * potentialDifference;
    }
    /**
     * Electric field energy density
     * u = (1/2)ε₀E²
     */
    static energyDensity(fieldStrength) {
        return 0.5 * this.epsilon0 * fieldStrength * fieldStrength;
    }
    /**
     * Capacitance of parallel plates
     * C = ε₀A/d
     */
    static capacitance(area, separation) {
        return (this.epsilon0 * area) / separation;
    }
    /**
     * Energy stored in capacitor
     * U = (1/2)CV²
     */
    static capacitorEnergy(capacitance, voltage) {
        return 0.5 * capacitance * voltage * voltage;
    }
}
ElectricField.k = 8.99e9; // Coulomb constant (N·m²/C²)
ElectricField.epsilon0 = 8.854187817e-12; // Vacuum permittivity
