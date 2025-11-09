/**
 * Predefined explanation points for each experiment
 * These trigger automatically when conditions are met
 */
export const FOUCAULT_EXPLANATION_POINTS = [
    {
        id: 'foucault-intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'Welcome to the Foucault Pendulum experiment! This demonstrates one of the most elegant proofs of Earth\'s rotation.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'foucault-first-precession',
        type: 'observation',
        priority: 'high',
        condition: 'Math.abs(precessionAngle) > 0.05',
        message: 'Notice how the pendulum\'s swing plane is rotating! This precession is caused by the Coriolis effect from Earth\'s rotation.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'foucault-latitude-effect',
        type: 'concept',
        priority: 'medium',
        condition: 'latitude_changes > 1',
        message: 'The precession rate depends on latitude. At the North Pole, the pendulum completes one rotation in 24 hours. At the equator, there\'s no precession at all!',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'foucault-coriolis-math',
        type: 'concept',
        priority: 'medium',
        condition: 'elapsedTime > 30 && Math.abs(precessionAngle) > 0.2',
        message: 'The Coriolis force is F = -2m(ω × v), where ω is Earth\'s angular velocity. This fictitious force appears in rotating reference frames.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'foucault-quarter-rotation',
        type: 'achievement',
        priority: 'low',
        condition: 'Math.abs(precessionAngle) > Math.PI/2',
        message: 'The swing plane has rotated 90 degrees! At this latitude, continue watching to see the full precession cycle.',
        audioRequired: false,
        pauseSimulation: false
    }
];
export const NASCAR_EXPLANATION_POINTS = [
    {
        id: 'nascar-intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'NASCAR tracks are heavily banked to allow cars to take turns at incredible speeds. Let\'s explore the physics!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'nascar-forces',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime > 5 && elapsedTime < 7',
        message: 'Three forces act on the car: gravity (down), normal force (perpendicular to track), and friction (parallel to track). The banking angle determines how these combine.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'nascar-optimal-speed',
        type: 'observation',
        priority: 'high',
        condition: 'Math.abs(velocity - optimalSpeed) < 2',
        message: 'You\'ve found the optimal speed! At this velocity, the normal force provides exactly the centripetal force needed. No friction required!',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'nascar-too-fast',
        type: 'warning',
        priority: 'medium',
        condition: 'velocity > optimalSpeed + 10',
        message: 'Going too fast! The car needs friction pointing down the bank to prevent sliding up. This wears the tires and slows you down.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'nascar-too-slow',
        type: 'warning',
        priority: 'medium',
        condition: 'velocity < optimalSpeed - 10',
        message: 'Too slow! The car needs friction pointing up the bank to prevent sliding down. You need more speed!',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'nascar-first-lap',
        type: 'achievement',
        priority: 'low',
        condition: 'lapCount >= 1',
        message: 'Lap complete! Try adjusting the bank angle or velocity to see how they affect the optimal speed formula: v = √(gr·tan(θ))',
        audioRequired: false,
        pauseSimulation: false
    },
    {
        id: 'nascar-angle-exploration',
        type: 'concept',
        priority: 'medium',
        condition: 'bankAngle_changes > 3',
        message: 'Great exploration! Notice that steeper banking allows higher speeds. Daytona uses 31°, while Bristol uses 28°.',
        audioRequired: true,
        pauseSimulation: false
    }
];
export const MILLIKAN_EXPLANATION_POINTS = [
    {
        id: 'millikan-intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'In 1909, Robert Millikan measured the charge of a single electron using tiny oil droplets. Let\'s recreate his Nobel Prize-winning experiment!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'millikan-forces',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime > 3 && elapsedTime < 5',
        message: 'The droplet experiences two main forces: gravity (mg) pulling down, and electric force (qE) pushing up. When balanced, the droplet floats!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'millikan-first-balance',
        type: 'achievement',
        priority: 'high',
        condition: 'Math.abs(dropletVelocity) < 0.001 && dropletVelocity !== undefined',
        message: 'Perfect! You\'ve suspended a droplet. At equilibrium, qE = mg. Now we can calculate the charge!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'millikan-charge-calculation',
        type: 'concept',
        priority: 'high',
        condition: 'chargesMeasured >= 1',
        message: 'From qE = mg, we get q = mg/E. The electric field E = V/d, so q = mgd/V. Now measure more droplets!',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'millikan-quantization',
        type: 'concept',
        priority: 'high',
        condition: 'quantizationConfidence > 0.8',
        message: 'Amazing discovery! All measured charges are integer multiples of 1.602×10⁻¹⁹ C. This is the elementary charge - the charge of ONE electron!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'millikan-multiple-droplets',
        type: 'observation',
        priority: 'medium',
        condition: 'chargesMeasured >= 3',
        message: 'You\'ve measured multiple droplets. Notice the pattern: 1e, 2e, 3e... Each droplet carries a different number of electrons.',
        audioRequired: true,
        pauseSimulation: false
    }
];
export const DOUBLE_SLIT_EXPLANATION_POINTS = [
    {
        id: 'doubleslit-intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'Young\'s double slit experiment (1801) proved that light behaves as a wave. Later, it became central to understanding quantum mechanics!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'doubleslit-wave-nature',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime > 5 && elapsedTime < 7',
        message: 'Light passing through both slits creates overlapping waves. Where waves align (constructive interference), you see bright fringes. Where they cancel (destructive), dark fringes.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'doubleslit-pattern-forming',
        type: 'observation',
        priority: 'high',
        condition: 'fringesObserved > 5',
        message: 'See the interference pattern forming! The bright and dark bands prove light traveled through BOTH slits as a wave.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'doubleslit-wavelength-effect',
        type: 'concept',
        priority: 'medium',
        condition: 'wavelength_changes > 2',
        message: 'Different wavelengths create different patterns! Shorter wavelengths (blue) produce tighter fringes, longer wavelengths (red) produce wider spacing.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'doubleslit-quantum-weirdness',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime > 60',
        message: 'Here\'s the quantum twist: If we send photons ONE AT A TIME, they still form this pattern! Each photon somehow "interferes with itself" through both slits.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'doubleslit-measurement',
        type: 'concept',
        priority: 'high',
        condition: 'fringesObserved > 10 && wavelength_changes > 3',
        message: 'But if we try to measure WHICH slit each photon goes through, the interference pattern disappears! This is the famous "observer effect."',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'doubleslit-math',
        type: 'concept',
        priority: 'medium',
        condition: 'elapsedTime > 30',
        message: 'The fringe spacing follows Δy = λL/d, where λ is wavelength, L is distance to screen, and d is slit separation.',
        audioRequired: false,
        pauseSimulation: false
    }
];
export const RUTHERFORD_EXPLANATION_POINTS = [
    {
        id: 'rutherford-intro',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime < 2',
        message: 'In 1909, Rutherford fired alpha particles at gold foil. The shocking results led to the discovery of the atomic nucleus!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'rutherford-expectation',
        type: 'concept',
        priority: 'high',
        condition: 'elapsedTime > 3 && elapsedTime < 5',
        message: 'According to the "plum pudding" model, atoms were thought to be uniform clouds of positive charge. Particles should pass through with minimal deflection.',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'rutherford-first-detection',
        type: 'observation',
        priority: 'medium',
        condition: 'particlesDetected > 10',
        message: 'Most particles are passing straight through! This tells us atoms are mostly empty space.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'rutherford-first-large-angle',
        type: 'observation',
        priority: 'high',
        condition: 'largeAngleCount > 0',
        message: 'Incredible! A particle just deflected at a large angle! Rutherford said this was like firing a cannonball at tissue paper and having it bounce back!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'rutherford-nuclear-model',
        type: 'concept',
        priority: 'high',
        condition: 'largeAngleCount > 3',
        message: 'Large-angle deflections prove the atom has a tiny, dense, positively-charged nucleus. Only something very small and massive could deflect alpha particles so strongly!',
        audioRequired: true,
        pauseSimulation: true
    },
    {
        id: 'rutherford-coulomb',
        type: 'concept',
        priority: 'medium',
        condition: 'particlesDetected > 50',
        message: 'The deflection follows Coulomb\'s law: F = kq₁q₂/r². The closer a particle passes to the nucleus, the larger the deflection angle.',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'rutherford-statistics',
        type: 'concept',
        priority: 'medium',
        condition: 'particlesDetected > 100',
        message: 'About 1 in 8000 particles deflects more than 90°. This rarity tells us the nucleus is tiny - only about 10⁻¹⁵ meters across!',
        audioRequired: true,
        pauseSimulation: false
    },
    {
        id: 'rutherford-impact-parameter',
        type: 'concept',
        priority: 'medium',
        condition: 'largeAngleCount > 5',
        message: 'The deflection angle depends on the "impact parameter" - how close the particle passes to the nucleus. Small impact parameter = large deflection.',
        audioRequired: false,
        pauseSimulation: false
    }
];
/**
 * Get explanation points for a specific experiment
 */
export function getExplanationPointsForExperiment(experimentName) {
    const normalized = experimentName.toLowerCase().replace(/\s+/g, '_');
    switch (normalized) {
        case 'foucault_pendulum':
        case 'foucault':
            return FOUCAULT_EXPLANATION_POINTS;
        case 'nascar_banking':
        case 'nascar':
            return NASCAR_EXPLANATION_POINTS;
        case 'millikan_oil_drop':
        case 'millikan':
            return MILLIKAN_EXPLANATION_POINTS;
        case 'young_double_slit':
        case 'youngs_double_slit':
        case 'double_slit':
            return DOUBLE_SLIT_EXPLANATION_POINTS;
        case 'rutherford_gold_foil':
        case 'rutherford':
            return RUTHERFORD_EXPLANATION_POINTS;
        default:
            return [];
    }
}
/**
 * Create custom explanation point
 */
export function createExplanationPoint(id, type, condition, message, options) {
    return {
        id,
        type,
        priority: options?.priority ?? 'medium',
        condition,
        message,
        audioRequired: options?.audioRequired ?? false,
        pauseSimulation: options?.pauseSimulation ?? false
    };
}
/**
 * Evaluate explanation point condition
 */
export function evaluateCondition(condition, measurements) {
    try {
        // Create function with measurement names as parameters
        const paramNames = Object.keys(measurements);
        const paramValues = Object.values(measurements);
        const fn = new Function(...paramNames, `return ${condition}`);
        return Boolean(fn(...paramValues));
    }
    catch (error) {
        console.error('Error evaluating condition:', condition, error);
        return false;
    }
}
