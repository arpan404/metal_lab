import ElectricFieldSimulation, {
  ElectricFieldSimulationProvider,
} from "./electric-field-simulation";
import TransformerSimulation, { TransformerSimulationProvider } from "./transformer-simulation";
import FoucaultPendulumSimulation from "./foucault-pendulum-simulation";
import DoubleSlitExperiment from "./double_slit";
import DeflectionGame from "./deflection-game";
import MillikanExperiment from "./millikan-experiment";
import NASCARBanking from "./nascar-banking";
import RutherfordScattering from "./rutherford-scattering";

// Provider for Foucault Pendulum (simple wrapper if no special context needed)
const FoucaultPendulumProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Provider for Double Slit Experiment
const DoubleSlitProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Provider for Deflection Game
const DeflectionGameProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Provider for Millikan Experiment
const MillikanExperimentProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Provider for NASCAR Banking
const NASCARBankingProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Provider for Rutherford Scattering
const RutherfordScatteringProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const componentMap: Record<
  string,
  {
    name: string;
    description?: string;
    component: React.ComponentType;
    provider: React.ComponentType<{ children: React.ReactNode }>;
  }
> = {
  electricFieldSimulation: {
    name: "Electric Field Simulation",
    description: `Explore electric fields created by two point charges in 3D space. Adjust charge magnitudes (positive or negative) and observe how the field vectors change in real-time. The simulation visualizes field lines, shows force on a test charge, and demonstrates fundamental concepts like superposition and inverse-square law. Switch between Manual mode (full control) and AI mode (guided exploration with Mela). Features include adjustable field density, 3D orbital controls, and color-coded field strength visualization. Perfect for understanding Coulomb's law and electrostatic interactions!`,
    component: ElectricFieldSimulation,
    provider: ElectricFieldSimulationProvider,
  },
  transformerSimulation: {
    name: "Transformer Simulation",
    description: `Explore how transformer models process text step-by-step. This uses a custom HuggingFace ByteLevel BPE tokenizer (trained on WikiText-2) with 500-token vocabulary and an actual transformer (~80K parameters) featuring TRUE multi-head attention (4 heads), feed-forward networks, and layer normalization. The model computes attention weights PER HEAD, allowing each head to learn different linguistic patterns! Data flows left-to-right through 7 stages: (1) Input tokens (custom BPE), (2) Embeddings (blue), (3) Q/K/V projections (cyan/magenta/yellow), (4) Multi-head attention (red grids - each head shown separately), (5) FFN (green), (6) Layer Norm (purple), (7) Output. The golden sphere shows the predicted token AFTER softmax! `,
    component: TransformerSimulation,
    provider: TransformerSimulationProvider
  },
  foucaultPendulum: {
    name: "Foucault Pendulum",
    description: `Experience Earth's rotation through the mesmerizing Foucault Pendulum! This 3D simulation demonstrates how the Coriolis effect causes the pendulum's oscillation plane to precess over time. Adjust the geographic latitude (0-90°) to see how precession rate changes - at the poles, it completes one rotation in 24 hours, while at the equator, there's no precession at all! Control pendulum length (5-20m), bob mass (1-20kg), and watch the beautiful trail as it swings. The simulation includes accurate physics with gravity, string tension, Coriolis force, and centrifugal effects. Features include a compass rose showing cardinal directions, real-time measurements of precession angle and period, and orbital camera controls. Perfect for understanding rotational dynamics and non-inertial reference frames!`,
    component: FoucaultPendulumSimulation,
    provider: FoucaultPendulumProvider,
  },
  doubleSlitExperiment: {
    name: "Double-Slit Experiment",
    description: `Witness the mind-bending quantum phenomenon that puzzled physicists for decades! This interactive 3D simulation recreates the famous double-slit experiment, demonstrating wave-particle duality. Watch individual photons emit from the source (right), pass through two narrow slits in a barrier (center), and create a mesmerizing interference pattern on the detection screen (left). Adjust the wavelength (0.1-1.5 nm) to see how it affects fringe spacing - shorter wavelengths produce tighter patterns. Control slit separation (0.5-4 units) to observe how the interference pattern changes. Modify photon emission rate (1-15 per frame) to speed up pattern formation. The heat map visualization shows detection intensity with colors from blue (low) to cyan to yellow to red (high intensity). Features include real-time photon counting, detection statistics, orbital camera controls, and the ability to toggle photon visibility. Perfect for understanding quantum mechanics, wave interference, and the fundamental nature of light and matter!`,
    component: DoubleSlitExperiment,
    provider: DoubleSlitProvider,
  },
  deflectionGame: {
    name: "Atomic Deflection Game",
    description: `Challenge your reflexes and precision in this exciting physics-based shooting game! Watch as projectiles automatically fire toward glowing red targets in 3D space. Score 100 points for each successful hit, while missed shots count against your accuracy. The game features three difficulty levels: Easy (slow spawn, slower projectiles), Medium (balanced challenge), or Hard (fast spawn, rapid projectiles). Fine-tune your experience with adjustable spawn rate (0.2-2.0s) and projectile speed (5-20 units/s). Targets dynamically reposition after each hit, keeping you on your toes! The game includes spectacular explosion effects on successful hits, glowing particle trails, pulsing target animations, and a beautiful grid-based arena. Track your performance with real-time statistics including total score, hit/miss count, and accuracy percentage. Features orbital camera controls to view the action from any angle, pause/resume functionality, and instant reset. Perfect for testing your aim, understanding projectile motion, and having fun with physics!`,
    component: DeflectionGame,
    provider: DeflectionGameProvider,
  },
  millikanExperiment: {
    name: "Millikan Oil Drop Experiment",
    description: `Recreate the groundbreaking 1909 experiment that measured the elementary charge! Watch charged oil droplets fall between two electrified plates and experience how Robert Millikan determined that electric charge is quantized. The simulation features glowing blue positive (top) and red negative (bottom) plates with animated electric field lines showing the force on charged droplets. Control gravity strength (0.5-3.0) to simulate different gravitational conditions, adjust the electric field (0.5-4.0) to balance forces, and modify spawn rate (0.05-0.5s) to control drop frequency. Each golden oil droplet carries a random charge (0.3-1.2 units) - some fall due to strong gravity, others float when forces balance, and some even rise with strong electric fields! Real-time statistics track total drops spawned, currently floating drops (balanced forces), and falling drops. Quick preset buttons let you instantly test "Equal Forces" or "Strong Field" scenarios. The simulation includes beautiful glowing effects, particle rotation, and orbital camera controls. Perfect for understanding quantization of charge, force balance, and one of physics' most important discoveries that proved electrons carry discrete charge units!`,
    component: MillikanExperiment,
    provider: MillikanExperimentProvider,
  },
  nascarBanking: {
    name: "NASCAR Banking",
    description: `Experience the physics of high-speed racing on banked tracks! This 3D simulation demonstrates how NASCAR uses banked turns to maintain incredible speeds through corners. Watch a detailed red race car (complete with spoiler, splitter, number 3, and rotating wheels) navigate a circular track with realistic banking. Control the velocity (0.5-8.0 m/s) to see how speed affects the centripetal force needed, adjust the bank angle (0-46°) to understand how track banking helps cars turn, and modify the track radius (5-20m) to compare tight vs wide turns. The simulation calculates real-time centripetal acceleration (a = v²/r) and angular velocity (ω = v/r), showing how these fundamental circular motion principles apply to racing. Track your performance with lap counter, current speed display, and live acceleration values. Features include a beautiful track with white lane lines, checkered start/finish line, speed trail particles behind the car, glowing effects, and orbital camera controls. Quick preset buttons offer "Practice" (slow, gentle) and "Race Speed" (fast, aggressive banking) modes. Perfect for understanding circular motion, centripetal force, and why NASCAR engineers design tracks with specific banking angles!`,
    component: NASCARBanking,
    provider: NASCARBankingProvider,
  },
  rutherfordScattering: {
    name: "Rutherford Scattering Experiment",
    description: `Witness the groundbreaking 1909 experiment that revolutionized atomic theory! This interactive 3D simulation recreates Ernest Rutherford's gold foil experiment where alpha particles were fired at atoms, revealing the existence of the atomic nucleus. Watch red alpha particles (helium nuclei) stream from a particle emitter on the left toward a glowing gold nucleus at center. Most particles pass straight through, but some are dramatically deflected by the intense Coulomb repulsion force (F = k·q₁·q₂/r²) between positive charges. Control particle speed (1-10) to simulate different energy levels - slower particles deflect more easily, while high-energy particles penetrate closer to the nucleus. Adjust force strength (10-150) to modify the repulsive interaction intensity, and change spawn rate (0.1-1.0s) to control particle frequency. The simulation includes a wireframe electron cloud showing the atom's electron shell, animated electron orbits, glowing particle trails, and a detection screen. Real-time statistics track total particles fired, deflection rate percentage, number of deflected vs straight particles. Quick presets offer "Low Energy" (gentle deflection) and "High Energy" (dramatic scattering) modes. Features include orbital camera controls, particle glow effects, and animated nucleus pulsing. Perfect for understanding nuclear physics, Coulomb's law, inverse square relationships, and how Rutherford proved atoms have tiny, dense, positively charged nuclei!`,
    component: RutherfordScattering,
    provider: RutherfordScatteringProvider,
  }
};
