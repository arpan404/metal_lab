import { componentMap } from "@/components/labs/componentMap";
import ElectricFieldSimulation, {
  ElectricFieldSimulationProvider,
} from "@/components/labs/electric-field-simulation";
import { use } from "react";
import React from "react";

export default function LabsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);

  const Provider = componentMap[uid]?.provider || React.Fragment;

  return (
    <>
      <Provider>{children}</Provider>
    </>
  );
}
