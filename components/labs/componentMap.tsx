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
    description: "Simulate electric fields with customizable parameters.",
    component: ElectricFieldSimulation,
    provider: ElectricFieldSimulationProvider,
  },
  transformerSimulation: {
    name: "Transformer Simulation",
    description: "Explore the principles of transformers and electromagnetic induction.",
    component: TransformerSimulation,
    provider: TransformerSimulationProvider
  }
  // doubleSlitExperiment: {
  //   component: DoubleSlitExperiment,
  // },
};
