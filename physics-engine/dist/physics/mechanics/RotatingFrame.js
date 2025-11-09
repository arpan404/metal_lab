import { vectorCross, vectorScale } from '../../utils/math';
/**
 * Rotating reference frame calculations
 * Includes Coriolis and centrifugal forces
 */
export class RotatingFrame {
    /**
     * Calculate Coriolis force
     * F_c = -2m(ω × v)
     */
    static coriolisForce(mass, velocity, angularVelocity) {
        const cross = vectorCross(angularVelocity, velocity);
        return vectorScale(cross, -2 * mass);
    }
    /**
     * Calculate centrifugal force
     * F_cf = -m(ω × (ω × r))
     */
    static centrifugalForce(mass, position, angularVelocity) {
        const cross1 = vectorCross(angularVelocity, position);
        const cross2 = vectorCross(angularVelocity, cross1);
        return vectorScale(cross2, -mass);
    }
    /**
     * Calculate Euler force (for non-uniform rotation)
     * F_e = -m(α × r)
     */
    static eulerForce(mass, position, angularAcceleration) {
        const cross = vectorCross(angularAcceleration, position);
        return vectorScale(cross, -mass);
    }
    /**
     * Total fictitious forces in rotating frame
     */
    static totalFictitiousForce(mass, position, velocity, angularVelocity, angularAcceleration = { x: 0, y: 0, z: 0 }) {
        const coriolis = this.coriolisForce(mass, velocity, angularVelocity);
        const centrifugal = this.centrifugalForce(mass, position, angularVelocity);
        const euler = this.eulerForce(mass, position, angularAcceleration);
        return {
            x: coriolis.x + centrifugal.x + euler.x,
            y: coriolis.y + centrifugal.y + euler.y,
            z: coriolis.z + centrifugal.z + euler.z
        };
    }
    /**
     * Earth's angular velocity at given latitude
     */
    static earthAngularVelocity(latitude) {
        const earthOmega = 7.2921159e-5; // rad/s
        const latRad = latitude * Math.PI / 180;
        return {
            x: earthOmega * Math.cos(latRad),
            y: earthOmega * Math.sin(latRad),
            z: 0
        };
    }
    /**
     * Coriolis parameter (for meteorology)
     * f = 2Ω·sin(latitude)
     */
    static coriolisParameter(latitude) {
        const earthOmega = 7.2921159e-5;
        const latRad = latitude * Math.PI / 180;
        return 2 * earthOmega * Math.sin(latRad);
    }
    /**
     * Foucault pendulum precession rate
     */
    static foucaultPrecessionRate(latitude) {
        const earthOmega = 7.2921159e-5;
        const latRad = latitude * Math.PI / 180;
        return earthOmega * Math.sin(latRad);
    }
    /**
     * Foucault pendulum precession period (in seconds)
     */
    static foucaultPeriod(latitude) {
        const rate = this.foucaultPrecessionRate(latitude);
        if (Math.abs(rate) < 1e-10)
            return Infinity;
        return (2 * Math.PI) / rate;
    }
    /**
     * Transform velocity from inertial to rotating frame
     */
    static velocityToRotatingFrame(velocityInertial, position, angularVelocity) {
        const cross = vectorCross(angularVelocity, position);
        return {
            x: velocityInertial.x - cross.x,
            y: velocityInertial.y - cross.y,
            z: velocityInertial.z - cross.z
        };
    }
    /**
     * Transform velocity from rotating to inertial frame
     */
    static velocityToInertialFrame(velocityRotating, position, angularVelocity) {
        const cross = vectorCross(angularVelocity, position);
        return {
            x: velocityRotating.x + cross.x,
            y: velocityRotating.y + cross.y,
            z: velocityRotating.z + cross.z
        };
    }
}
