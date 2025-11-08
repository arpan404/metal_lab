import React from "react";
import ExperimentCard from "./ExperimentCard";

const experiments = [
  {
    title: "Rutherford's Gold Foil Experiment",
    description: "Visualize alpha particle scattering and discover atomic structure at the quantum level.",
    difficulty: "Advanced" as const,
    duration: "15-20 min",
    icon: "atom" as const,
    isNew: true,
  },
  {
    title: "Young's Double Slit Experiment",
    description: "Observe wave-particle duality with photons passing through double slits.",
    difficulty: "Intermediate" as const,
    duration: "10-15 min",
    icon: "waves" as const,
    isNew: true,
  },
  {
    title: "Projectile Motion Lab",
    description: "Explore trajectory, velocity, and acceleration in 2D motion with real-time physics.",
    difficulty: "Beginner" as const,
    duration: "8-12 min",
    icon: "zap" as const,
    isNew: false,
  },
  {
    title: "Electric Circuit Builder",
    description: "Build and analyze circuits with resistors, capacitors, and voltage sources.",
    difficulty: "Beginner" as const,
    duration: "12-18 min",
    icon: "zap" as const,
    isNew: false,
  },
  {
    title: "Pendulum Dynamics",
    description: "Study simple harmonic motion, damping, and energy conservation.",
    difficulty: "Intermediate" as const,
    duration: "10-15 min",
    icon: "flask" as const,
    isNew: false,
  },
  {
    title: "Photoelectric Effect",
    description: "Investigate Einstein's photoelectric effect and quantum energy transitions.",
    difficulty: "Advanced" as const,
    duration: "18-25 min",
    icon: "atom" as const,
    isNew: false,
  },
];

export default function ExperimentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiments.map((exp, index) => (
        <ExperimentCard key={index} {...exp} />
      ))}
    </div>
  );
}