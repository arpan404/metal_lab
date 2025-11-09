"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";

export function SimpleAITutor({
  currentStep,
  onNext,
}: {
  currentStep: number;
  onNext: () => void;
}) {
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const stepPrompts = [
    "Explain Step 0: Input Tokens - how text is split into tokens (1-2 sentences)",
    "Explain Step 1: Embeddings - how tokens become vectors (1-2 sentences)",
    "Explain Step 2: QKV Projection - Query, Key, Value matrices (1-2 sentences)",
    "Explain Step 3: Attention - how tokens learn relationships (1-2 sentences)",
    "Explain Step 4: Feed-Forward Network - token processing (1-2 sentences)",
    "Explain Step 5: Layer Normalization - value stabilization (1-2 sentences)",
    "Explain Step 6: Output - final hidden states (1-2 sentences)",
    "Explain Step 7: Softmax - next token prediction (1-2 sentences)",
  ];

  const getExplanation = async (step: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/simulate-transformer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompts: [{ role: "user", content: stepPrompts[step] }],
          tools: [],
        }),
      });

      const data = await response.json();
      setExplanation(data.content || "Let's continue exploring transformers!");
    } catch (error) {
      console.error("Error:", error);
      setExplanation("Let's continue to the next step!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    getExplanation(0);
  };

  const handleContinue = () => {
    if (currentStep < 7) {
      onNext();
      getExplanation(currentStep + 1);
    } else {
      setExplanation("Great work! You've seen all 8 steps of the transformer!");
    }
  };

  if (!hasStarted) {
    return (
      <AIExplanation
        text="Hi! I'm Mela, your AI tutor. Click to explore how transformers work!"
        position={{ x: -40, y: 450 }}
        autohide={false}
      >
        <Button
          className="cursor-pointer"
          variant="secondary"
          size="icon"
          onClick={handleStart}
        >
          <ArrowRightIcon />
        </Button>
      </AIExplanation>
    );
  }

  if (explanation && !isLoading) {
    return (
      <AIExplanation
        text={explanation}
        position={{ x: -40, y: 450 }}
        autohide={false}
      >
        <Button
          className="cursor-pointer"
          variant="secondary"
          size="icon"
          onClick={handleContinue}
          disabled={isLoading}
        >
          <ArrowRightIcon />
        </Button>
      </AIExplanation>
    );
  }

  return null;
}

export const AIExplanation = ({
  text,
  position,
  children,
  autohide = true,
}: {
  text: string;
  autohide: boolean;
  position: { x: number; y: number };
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.95)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="relative flex items-start gap-2">
        <Image
          src="/mela.webp"
          width={200}
          height={400}
          draggable={false}
          alt="AI Explanation"
          className="rounded-2xl rounded-tr-none object-cover object-top select-none"
        />
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="bg-white rounded-2xl rounded-bl-none shadow-lg p-4 max-w-xs">
            <p className="text-sm text-gray-800">{text}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
