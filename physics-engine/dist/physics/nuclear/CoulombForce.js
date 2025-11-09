import { vectorMagnitude, vectorNormalize, vectorScale } from '../../utils/math';
/**
 * Coulomb force calculations for nuclear physics
 */
export class CoulombForce {
    /**
     * Calculate Coulomb force magnitude
     * F = k·q₁·q₂/r²
     */
    static forceMagnitude(charge1, charge2, distance) {
        if (distance < 1e-15)
            return Infinity;
        return (this.k * charge1 * charge2 * this.e * this.e) / (distance * distance);
    }
    /**
     * Calculate Coulomb force vector
     */
    static forceVector(charge1, position1, charge2, position2) {
        const separation = {
            x: position2.x - position1.x,
            y: position2.y - position1.y,
            z: position2.z - position1.z
        };
        const distance = vectorMagnitude(separation);
        if (distance < 1e-15)
            return { x: 0, y: 0, z: 0 };
        const magnitude = this.forceMagnitude(charge1, charge2, distance);
        const direction = vectorNormalize(separation);
        // Repulsive if same sign, attractive if opposite
        const sign = charge1 * charge2 > 0 ? 1 : -1;
        return vectorScale(direction, sign * magnitude);
    }
    /**
     * Calculate Coulomb potential energy
     * U = k·q₁·q₂/r
     */
    static potentialEnergy(charge1, charge2, distance) {
        if (distance < 1e-15)
            return Infinity;
        return (this.k * charge1 * charge2 * this.e * this.e) / distance;
    }
    /**
     * Calculate electric field from nucleus
     * E = k·Z·e/r²
     */
    static electricField(charge, distance) {
        if (distance < 1e-15)
            return Infinity;
        return (this.k * charge * this.e) / (distance * distance);
    }
    /**
     * Calculate potential at distance
     * V = k·Z·e/r
     */
    static potential(charge, distance) {
        if (distance < 1e-15)
            return Infinity;
        return (this.k * charge * this.e) / distance;
    }
    /**
     * Calculate work done moving particle
     * W = q·ΔV
     */
    static work(movingCharge, fixedCharge, initialDistance, finalDistance) {
        const Vi = this.potential(fixedCharge, initialDistance);
        const Vf = this.potential(fixedCharge, finalDistance);
        return movingCharge * this.e * (Vf - Vi);
    }
    /**
     * Calculate escape velocity from Coulomb potential
     */
    static escapeVelocity(charge1, charge2, distance, mass) {
        const U = this.potentialEnergy(charge1, charge2, distance);
        // (1/2)mv² = U
        return Math.sqrt(2 * Math.abs(U) / mass);
    }
    /**
     * Calculate orbital velocity (if attractive)
     */
    static orbitalVelocity(charge1, charge2, radius, mass) {
        // Centripetal force = Coulomb force
        // mv²/r = k·q₁·q₂/r²
        const force = Math.abs(this.forceMagnitude(charge1, charge2, radius));
        return Math.sqrt((force * radius) / mass);
    }
    /**
     * Calculate Bohr radius (for hydrogen-like atoms)
     * a₀ = ℏ²/(m·k·e²)
     */
    static bohrRadius(mass, charge = 1) {
        const hbar = 1.054571817e-34;
        return (hbar * hbar) / (mass * this.k * charge * this.e * this.e);
    }
    /**
     * Calculate binding energy (magnitude)
     */
    static bindingEnergy(charge1, charge2, radius) {
        return Math.abs(this.potentialEnergy(charge1, charge2, radius));
    }
}
CoulombForce.k = 8.99e9; // Coulomb constant (N·m²/C²)
CoulombForce.e = 1.602176634e-19; // Elementary charge (C)
