import ElectricFieldSimulation, {
  ElectricFieldSimulationProvider,
} from "./electric-field-simulation";
import TransformerSimulation, { TransformerSimulationProvider } from "./transformer-simulation";

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
  }
  // doubleSlitExperiment: {
  //   component: DoubleSlitExperiment,
  // },
};
