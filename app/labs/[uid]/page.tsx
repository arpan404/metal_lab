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

export default function SimulationPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const { isChatOpen, openChat, closeChat } = useLabChat();
  const { isNavbarVisible } = useNavbar();
  const LabComponent = componentMap[uid]?.component || (() => <div>Lab not found</div>);
  return (
    <main className="relative h-full bg-gray-900">
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
      <SideChat isOpen={isChatOpen} onClose={closeChat} labUID={uid} experimentDetails={
        {
          name: componentMap[uid]?.name || "Unknown Experiment",
          description: componentMap[uid]?.description || "No description available.",
          currentState: {},
          variables: {}
        }
      }/>
    </main>
  );
}
