"use client";

import SideChat from "@/components/side-chat";
import { use } from "react";
import { MessageSquare } from "lucide-react";
import { useLabChat } from "../../../lib/hooks/use-lab-chat";
import { useNavbar } from "@/lib/contexts/navbar-context";
import DoubleSlitExperiment from "@/components/labs/double_slit";
import ElectricFieldSimulation, {
  ElectricFieldSimulationProvider,
} from "@/components/labs/electric-field-simulation";
import { componentMap } from "@/components/labs/componentMap";
import { useTransformerSimulation } from "@/components/labs/transformer-simulation";
import { useElectricFieldSimulation } from "@/components/labs/electric-field-simulation";

// Wrapper component to provide chat with simulation context
function SimulationWithChat({ uid }: { uid: string }) {
  const { isChatOpen, openChat, closeChat } = useLabChat();
  const { isNavbarVisible } = useNavbar();
  const LabComponent = componentMap[uid]?.component || (() => <div>Lab not found</div>);
  
  // Try to get transformer simulation context if available
  let transformerContext = null;
  try {
    if (uid === "transformerSimulation") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      transformerContext = useTransformerSimulation();
    }
  } catch (e) {
    // Context not available, that's fine
  }

  // Try to get electric field simulation context if available
  let electricFieldContext = null;
  try {
    if (uid === "electricFieldSimulation") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      electricFieldContext = useElectricFieldSimulation();
    }
  } catch (e) {
    // Context not available, that's fine
  }

  // Build experiment details based on which simulation is active
  const experimentDetails = {
    name: componentMap[uid]?.name || "Unknown Experiment",
    description: componentMap[uid]?.description || "No description available.",
    currentState: transformerContext ? {
      currentStep: transformerContext.currentStep,
      inputText: transformerContext.inputText,
      predictedToken: transformerContext.predictedToken,
      aiMode: transformerContext.aiMode,
      manualMode: transformerContext.manualMode,
      autoContinue: transformerContext.autoContinue,
      isPlaying: transformerContext.isPlaying,
      generatedTokenCount: transformerContext.generatedTokenCount,
      maxTokens: transformerContext.maxTokens,
      tokenizedInput: transformerContext.tokenizedInput,
      stepByStep: transformerContext.stepByStep,
    } : electricFieldContext ? {
      charge1Magnitude: electricFieldContext.charge1.magnitude,
      charge2Magnitude: electricFieldContext.charge2.magnitude,
      fieldDensity: electricFieldContext.fieldDensity,
      showFieldLines: electricFieldContext.showFieldLines,
      isPlaying: electricFieldContext.isPlaying,
      observations: electricFieldContext.observationLog,
    } : {},
    variables: transformerContext ? {
      "Current Step": transformerContext.currentStep,
      "Input Text": transformerContext.inputText,
      "Predicted Token": transformerContext.predictedToken,
      "AI Mode": transformerContext.aiMode ? "ON" : "OFF",
      "Manual Mode": transformerContext.manualMode ? "ON" : "OFF",
      "Auto Continue": transformerContext.autoContinue ? "ON" : "OFF",
      "Generated Tokens": `${transformerContext.generatedTokenCount}/${transformerContext.maxTokens}`,
    } : electricFieldContext ? {
      "Charge 1": `${electricFieldContext.charge1.magnitude > 0 ? "+" : ""}${electricFieldContext.charge1.magnitude}`,
      "Charge 2": `${electricFieldContext.charge2.magnitude > 0 ? "+" : ""}${electricFieldContext.charge2.magnitude}`,
      "Field Density": `${electricFieldContext.fieldDensity}x`,
      "Field Lines": electricFieldContext.showFieldLines ? "Visible" : "Hidden",
      "Simulation": electricFieldContext.isPlaying ? "Playing" : "Paused",
    } : {}
  };

  return (
    <>
      <div className="p-0">
        <LabComponent />
      </div>
      {/* Floating chat toggle button on right edge */}
      {!isChatOpen && (
        <button
          onClick={openChat}
          className={`fixed right-0 ${
            isNavbarVisible ? "top-[calc(50vh+1.75rem)]" : "top-1/2"
          } -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-l-lg shadow-lg transition-all duration-300 z-50 opacity-60 hover:opacity-100 hover:pr-5 cursor-pointer`}
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Chat sidebar */}
      <SideChat 
        isOpen={isChatOpen} 
        onClose={closeChat} 
        labUID={uid} 
        experimentDetails={experimentDetails}
      />
    </>
  );
}

export default function SimulationPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  
  return (
    <main className="relative h-full bg-gray-900">
      <SimulationWithChat uid={uid} />
    </main>
  );
}
