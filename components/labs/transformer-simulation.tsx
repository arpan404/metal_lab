"use client";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo, use, useCallback } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import DraggableCard from "../atomic/draggable-card";
import {
  TinyTransformer,
  createPretrainedModel,
  tokenize,
  VOCABULARY,
} from "@/lib/tiny-transformer";
import { SimpleAITutor } from "./ai-tutor-simple";

type TransformerSimulationContext = {
  isPlaying: boolean;
  togglePlay: () => void;

  inputText: string;
  setInputText: (text: string) => void;

  currentStep: number;
  setCurrentStep: (step: number) => void;

  speed: number;
  setSpeed: (speed: number) => void;

  showAttentionWeights: boolean;
  toggleAttentionWeights: () => void;

  cameraFollowMode: boolean;
  toggleCameraFollow: () => void;

  stepByStep: boolean;
  toggleStepByStep: () => void;
  nextStep: () => void;

  mountRef: React.RefObject<HTMLDivElement | null>;

  aiMode: boolean;
  toggleAIMode: () => void;

  stateOfSimulation: {
    aiModeState: unknown | null;
    manualModeState: unknown | null;
  };
  setStateOfSimulation: React.Dispatch<
    React.SetStateAction<{
      aiModeState: unknown | null;
      manualModeState: unknown | null;
    }>
  >;

  transformerModel: TinyTransformer | null;
  predictedToken: string;
  setPredictedToken: (token: string) => void;

  tokenizedInput: Array<{ token: string; id: number; gptId: number }>;
  setTokenizedInput: React.Dispatch<
    React.SetStateAction<Array<{ token: string; id: number; gptId: number }>>
  >;

  computePrediction: boolean;
  setComputePrediction: (value: boolean) => void;

  autoContinue: boolean;
  setAutoContinue: (value: boolean) => void;

  maxTokens: number;
  setMaxTokens: (value: number) => void;

  generatedTokenCount: number;
  setGeneratedTokenCount: (value: number) => void;

  manualMode: boolean;
  setManualMode: (value: boolean) => void;

  intermediateValues: {
    embeddings: number[][] | null;
    qkvProjections: { Q: number[][]; K: number[][]; V: number[][] }[] | null;
    attentionOutputs: number[][] | null;
    ffnOutputs: number[][] | null;
    finalLogits: number[] | null;
    probabilities: number[] | null;
    topPredictions: Array<{ token: string; prob: number; id: number }> | null;
  };
  setIntermediateValues: React.Dispatch<
    React.SetStateAction<{
      embeddings: number[][] | null;
      qkvProjections: { Q: number[][]; K: number[][]; V: number[][] }[] | null;
      attentionOutputs: number[][] | null;
      ffnOutputs: number[][] | null;
      finalLogits: number[] | null;
      probabilities: number[] | null;
      topPredictions: Array<{ token: string; prob: number; id: number }> | null;
    }>
  >;
};

export const transformerSimulationContext =
  React.createContext<TransformerSimulationContext | null>(null);

export const TransformerSimulationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // List of words to randomly select from instead of using LLM
  const wordList = [
    "The",
    "cat",
    "sat",
    "on",
    "the",
    "mat",
    "and",
    "looked",
    "at",
    "the",
    "sky",
    "A",
    "dog",
    "ran",
    "through",
    "the",
    "park",
    "chasing",
    "a",
    "ball",
    "The",
    "sun",
    "shone",
    "brightly",
    "in",
    "the",
    "morning",
    "light",
    "Birds",
    "sang",
    "sweetly",
    "from",
    "the",
    "trees",
    "above",
    "The",
    "river",
    "flowed",
    "gently",
    "through",
    "the",
    "valley",
    "Children",
    "played",
    "happily",
    "in",
    "the",
    "garden",
    "The",
    "wind",
    "whispered",
    "secrets",
    "through",
    "the",
    "leaves",
    "Stars",
    "twinkled",
    "brightly",
    "in",
    "the",
    "night",
    "sky",
    "The",
    "moon",
    "glowed",
    "softly",
    "over",
    "the",
    "quiet",
    "town",
    "Rain",
    "fell",
    "gently",
    "on",
    "the",
    "rooftops",
    "below",
  ];

  // Randomly select initial input text from the word list
  const getRandomInitialText = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
  };

  const [inputText, setInputText] = useState(getRandomInitialText());
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [showAttentionWeights, setShowAttentionWeights] = useState(true);
  const [cameraFollowMode, setCameraFollowMode] = useState(true);
  const [stepByStep, setStepByStep] = useState(false); // Default to continuous mode for manual mode
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [aiMode, setAIMode] = useState(true);
  const [predictedToken, setPredictedToken] = useState("sits");
  const [tokenizedInput, setTokenizedInput] = useState<
    Array<{ token: string; id: number; gptId: number }>
  >([]);
  const [computePrediction, setComputePrediction] = useState(false);
  const [autoContinue, setAutoContinue] = useState(false);
  const [maxTokens, setMaxTokens] = useState(10);
  const [generatedTokenCount, setGeneratedTokenCount] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [stateOfSimulation, setStateOfSimulation] = useState<{
    aiModeState: unknown | null;
    manualModeState: unknown | null;
  }>({
    aiModeState: null,
    manualModeState: null,
  });

  // Store intermediate activations for visualization
  const [intermediateValues, setIntermediateValues] = useState<{
    embeddings: number[][] | null;
    qkvProjections: { Q: number[][]; K: number[][]; V: number[][] }[] | null;
    attentionOutputs: number[][] | null;
    ffnOutputs: number[][] | null;
    finalLogits: number[] | null;
    probabilities: number[] | null;
    topPredictions: Array<{ token: string; prob: number; id: number }> | null;
  }>({
    embeddings: null,
    qkvProjections: null,
    attentionOutputs: null,
    ffnOutputs: null,
    finalLogits: null,
    probabilities: null,
    topPredictions: null,
  });

  // Initialize transformer model (lazy-loaded and memoized)
  const [transformerModel, setTransformerModel] =
    useState<TinyTransformer | null>(null);

  useEffect(() => {
    // Lazy load the model after component mounts
    const timer = setTimeout(() => {
      if (!transformerModel) {
        setTransformerModel(createPretrainedModel());
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [transformerModel]);
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleAttentionWeights = () =>
    setShowAttentionWeights(!showAttentionWeights);
  const toggleAIMode = () => {
    const newAIMode = !aiMode;
    setAIMode(newAIMode);

    // Reset state when toggling AI mode
    setIsPlaying(false);
    setCurrentStep(0);
    setComputePrediction(false);
    setPredictedToken("...");
    setGeneratedTokenCount(0);

    // Reset intermediate values
    setIntermediateValues({
      embeddings: null,
      qkvProjections: null,
      attentionOutputs: null,
      ffnOutputs: null,
      finalLogits: null,
      probabilities: null,
      topPredictions: null,
    });

    // Set step-by-step mode based on AI mode
    // AI mode: enable step-by-step control
    // Manual mode: disable step-by-step (continuous)
    setStepByStep(newAIMode);

    // If entering AI mode, disable manual mode features
    if (newAIMode) {
      setManualMode(false);
      setAutoContinue(false);
    }
  };
  const toggleCameraFollow = () => setCameraFollowMode(!cameraFollowMode);
  const toggleStepByStep = () => {
    setStepByStep(!stepByStep);
    if (!stepByStep) {
      setIsPlaying(false);
    }
  };
  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % 8); // 8 steps total: 0-7 (Input -> Softmax)
  };

  return (
    <transformerSimulationContext.Provider
      value={{
        isPlaying,
        togglePlay,
        inputText,
        setInputText,
        currentStep,
        setCurrentStep,
        speed,
        setSpeed,
        showAttentionWeights,
        toggleAttentionWeights,
        cameraFollowMode,
        toggleCameraFollow,
        stepByStep,
        toggleStepByStep,
        nextStep,
        mountRef,
        stateOfSimulation,
        aiMode,
        toggleAIMode,
        setStateOfSimulation,
        transformerModel,
        predictedToken,
        setPredictedToken,
        tokenizedInput,
        setTokenizedInput,
        computePrediction,
        setComputePrediction,
        autoContinue,
        setAutoContinue,
        maxTokens,
        setMaxTokens,
        generatedTokenCount,
        setGeneratedTokenCount,
        manualMode,
        setManualMode,
        intermediateValues,
        setIntermediateValues,
      }}
    >
      {children}
    </transformerSimulationContext.Provider>
  );
};

export const useTransformerSimulation = () => {
  const context = React.useContext(transformerSimulationContext);

  if (!context) {
    throw new Error(
      "useTransformerSimulation must be used within a TransformerSimulationProvider"
    );
  }

  // Effect to tokenize input when it changes
  useEffect(() => {
    if (!context?.inputText) return;

    try {
      const { tokens, originalTokens } = tokenize(context.inputText);
      // Limit to max sequence length
      const limitedTokens = tokens.slice(0, 10);
      const limitedOriginal = originalTokens.slice(0, 10);

      context.setTokenizedInput(
        limitedOriginal.map((t, idx) => ({
          token: t.text,
          id: limitedTokens[idx],
          gptId: t.gptId,
        }))
      );

      // Reset prediction when input changes
      context.setPredictedToken("...");
      context.setComputePrediction(false);
    } catch (error) {
      console.error("Tokenization error:", error);
    }
  }, [context?.inputText]);

  // Effect to compute prediction when simulation reaches the end (step 6)
  useEffect(() => {
    // Always compute intermediate values when tokenizedInput changes (not just when computePrediction is true)
    // This ensures particles have data to display from the start
    if (!context?.transformerModel) return;
    if (context.tokenizedInput.length === 0) return;

    try {
      const tokenIds = context.tokenizedInput.map((t) => t.id);
      const result = context.transformerModel.forward(tokenIds);

      // Store intermediate values for visualization
      const model = context.transformerModel;

      // Get top 5 predictions
      const topK = 5;
      const probsWithIds = result.probabilities.map((p, i) => ({
        prob: p,
        id: i,
      }));
      probsWithIds.sort((a, b) => b.prob - a.prob);
      const topPredictions = probsWithIds
        .slice(0, topK)
        .map(({ prob, id }) => ({
          token: VOCABULARY[id] || `[${id}]`,
          prob,
          id,
        }));

      // Only update predicted token when computePrediction is true (step 7)
      if (context.computePrediction) {
        context.setPredictedToken(topPredictions[0]?.token || "...");
      }

      // ALWAYS set intermediate values for particle visualization
      context.setIntermediateValues({
        embeddings: model.embeddings?.data || null,
        qkvProjections: model.qkvProjections.map((qkv) => ({
          Q: qkv.Q.data,
          K: qkv.K.data,
          V: qkv.V.data,
        })),
        attentionOutputs: model.layerOutputs[0]?.data || null,
        ffnOutputs:
          model.layerOutputs[model.layerOutputs.length - 1]?.data || null,
        finalLogits: result.softmaxStage.beforeSoftmax,
        probabilities: result.probabilities,
        topPredictions,
      });

      // Auto-continue if enabled and under max tokens
      const topToken = topPredictions[0]?.token;
      if (
        context.autoContinue &&
        context.generatedTokenCount < context.maxTokens &&
        topToken &&
        topToken !== "..." &&
        topToken !== "<|endoftext|>"
      ) {
        // Wait longer for smooth viewing experience (0.5x speed = double the time)
        setTimeout(() => {
          const newText = context.inputText + topToken;
          console.log(
            "Auto-continuing with token:",
            topToken,
            "New text:",
            newText,
            "Generated:",
            context.generatedTokenCount + 1,
            "/",
            context.maxTokens
          );

          // Append the predicted token to input (this is the key to continuous generation!)
          context.setInputText(newText);
          context.setGeneratedTokenCount(context.generatedTokenCount + 1);

          // Reset to start the cycle again with the new input
          context.setComputePrediction(false);
          context.setCurrentStep(0);

          // Ensure simulation is playing for auto-continue to work
          if (!context.isPlaying && context.autoContinue) {
            context.togglePlay();
          }

          // Ensure stepByStep is off for auto-continue mode
          if (context.stepByStep) {
            context.toggleStepByStep();
          }
        }, 5000); // 5 second delay (0.5x speed) for smooth auto-generation viewing
      }
    } catch (error) {
      console.error("Model prediction error:", error);
    }
  }, [
    context?.computePrediction,
    context?.transformerModel,
    context?.tokenizedInput,
  ]);

  useEffect(() => {
    if (!context) return;
    if (!context.mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 50);

    const camera = new THREE.PerspectiveCamera(
      60,
      context.mountRef.current.clientWidth /
        context.mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      alpha: false,
      logarithmicDepthBuffer: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio for better perf
    renderer.setSize(
      context.mountRef.current.clientWidth,
      context.mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    context.mountRef.current.appendChild(renderer.domElement);

    // Orbit controls with smoother settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 15;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 1.0;

    // Simplified lighting (fewer lights = better performance)
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    // Simplified ground plane (fewer divisions)
    const gridHelper = new THREE.GridHelper(40, 20, 0x333333, 0x1a1a1a); // Reduced from 50x50 to 40x20
    gridHelper.position.y = -0.1;
    // scene.add(gridHelper);

    // Tokenize input using custom HuggingFace BPE tokenizer for visualization
    const { tokens: tokenIds, originalTokens } = tokenize(context.inputText);

    // Get token texts for visualization (limit to last 5 tokens for display)
    const displayTokens = originalTokens.slice(-5);
    const tokens = displayTokens.map((t) => t.text);

    const numTokens = tokens.length || 1;

    // Layout configuration - HORIZONTAL
    const tokenObjects: THREE.Group[] = [];
    const tokenSpacing = 4.5; // Increased from 3.5 for even better vertical spacing
    const startY = (-(numTokens - 1) * tokenSpacing) / 2;
    const horizontalSpacing = 8; // Increased horizontal spacing between stages
    const stageXPositions = {
      tokens: -horizontalSpacing * 3,
      embeddings: -horizontalSpacing * 2,
      qkv: -horizontalSpacing,
      attention: 0,
      ffn: horizontalSpacing,
      layerNorm: horizontalSpacing * 2,
      output: horizontalSpacing * 3,
    };

    // Arrays to hold different components
    const embeddingTensors: THREE.Mesh[] = [];
    const qkvTensors: THREE.Group[] = [];
    const attentionHeads: THREE.Group[] = [];
    const attentionOutputs: THREE.Mesh[] = [];
    const ffnBlocks: THREE.Mesh[] = [];
    const layerNormBlocks: THREE.Mesh[] = [];
    const outputTensors: THREE.Mesh[] = [];

    // Stage labels
    const stageLabels: THREE.Sprite[] = [];

    // Predicted next token (from the model)
    let predictedToken: THREE.Group | null = null;
    let currentPrediction = context.predictedToken || "...";

    // Helper function to create stage labels (using cache)
    function createStageLabel(text: string, position: THREE.Vector3) {
      const cacheKey = `stage_label_${text}`;
      const texture = getCachedTexture(cacheKey, () => {
        const canvas = getPooledCanvas(128, 32);
        const context = canvas.getContext("2d");
        if (!context) return canvas;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
        context.font = "bold 14px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 64, 16);
        return canvas;
      });

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(3, 0.75, 1);
      return sprite;
    }

    // Shared geometries and materials for better performance
    const sharedSphereGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const sharedBoxGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.3);

    // Canvas cache for reusable textures
    const canvasCache = new Map<string, THREE.CanvasTexture>();
    const canvasPool: HTMLCanvasElement[] = [];

    function getPooledCanvas(width: number, height: number): HTMLCanvasElement {
      for (let i = 0; i < canvasPool.length; i++) {
        const canvas = canvasPool[i];
        if (canvas.width === width && canvas.height === height) {
          canvasPool.splice(i, 1);
          return canvas;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function returnCanvasToPool(canvas: HTMLCanvasElement) {
      if (canvasPool.length < 20) {
        // Limit pool size
        canvasPool.push(canvas);
      }
    }

    function getCachedTexture(
      key: string,
      createFn: () => HTMLCanvasElement
    ): THREE.CanvasTexture {
      if (!canvasCache.has(key)) {
        const canvas = createFn();
        const texture = new THREE.CanvasTexture(canvas);
        canvasCache.set(key, texture);
      }
      return canvasCache.get(key)!;
    }

    // Create input tokens as text labels (using cache)
    function createToken(text: string, position: THREE.Vector3, index: number) {
      const group = new THREE.Group();

      // Token sphere (use shared geometry)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          index / Math.max(numTokens, 1),
          0.7,
          0.6
        ),
        metalness: 0.3,
        roughness: 0.2,
        emissive: new THREE.Color().setHSL(
          index / Math.max(numTokens, 1),
          0.7,
          0.3
        ),
        emissiveIntensity: 0.4,
      });
      const sphere = new THREE.Mesh(sharedSphereGeometry, material);
      sphere.userData.type = "token";
      group.add(sphere);

      // Label (using cache)
      const cacheKey = `token_${text}`;
      const texture = getCachedTexture(cacheKey, () => {
        const canvas = getPooledCanvas(128, 64);
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 64, 32);
        return canvas;
      });

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.x = -1.2;
      sprite.scale.set(2, 1, 1);
      group.add(sprite);

      group.position.copy(position);
      scene.add(group);

      return group;
    }

    // Create embedding tensors (rectangular matrices)
    function createEmbeddingTensor(position: THREE.Vector3, index: number) {
      // Use simpler material for better performance
      const material = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.5,
        roughness: 0.3,
        emissive: 0x1e40af,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(sharedBoxGeometry, material);
      mesh.userData.type = "embedding";
      mesh.position.copy(position);

      // Add wireframe
      const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(sharedBoxGeometry),
        new THREE.LineBasicMaterial({ color: 0x60a5fa })
      );
      mesh.add(wireframe);

      scene.add(mesh);
      return mesh;
    }

    // Create QKV projection tensors
    function createQKVGroup(position: THREE.Vector3, index: number) {
      const group = new THREE.Group();
      const tensorWidth = 0.4;
      const tensorHeight = 1.5;
      const spacing = 0.6;

      const colors = [0x00ffff, 0xff00ff, 0xffff00]; // Q, K, V
      const labels = ["Q", "K", "V"];

      // Shared geometry for all QKV tensors
      const qkvGeometry = new THREE.BoxGeometry(
        tensorWidth,
        tensorHeight,
        0.08
      );

      for (let i = 0; i < 3; i++) {
        const material = new THREE.MeshStandardMaterial({
          color: colors[i],
          metalness: 0.6,
          roughness: 0.2,
          emissive: colors[i],
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.85,
        });
        const mesh = new THREE.Mesh(qkvGeometry, material);
        mesh.userData.type = "qkv";
        mesh.position.x = (i - 1) * spacing;

        // Add label (using cache)
        const cacheKey = `qkv_${labels[i]}`;
        const texture = getCachedTexture(cacheKey, () => {
          const canvas = getPooledCanvas(64, 64);
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labels[i], 32, 32);
          return canvas;
        });

        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(mesh.position.x, 0, 0.5);
        sprite.scale.set(0.5, 0.5, 1);
        group.add(sprite);

        group.add(mesh);
      }

      group.position.copy(position);
      scene.add(group);
      return group;
    }

    // Create attention head visualization
    function createAttentionHead(position: THREE.Vector3, index: number) {
      const group = new THREE.Group();

      // Attention score matrix - use shared geometry
      const mainGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.05);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        metalness: 0.4,
        roughness: 0.3,
        emissive: 0xff6b6b,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
      });
      const mesh = new THREE.Mesh(mainGeometry, material);
      mesh.userData.type = "attention";
      group.add(mesh);

      // Add grid pattern - use shared geometry for cells
      const cellGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.06);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const cellMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL((i + j) / 8, 0.8, 0.5),
            transparent: true,
            opacity: 0.6,
          });
          const cell = new THREE.Mesh(cellGeometry, cellMat);
          cell.userData.type = "attention";
          cell.position.set((i - 1.5) * 0.37, (j - 1.5) * 0.37, 0.03);
          group.add(cell);
        }
      }

      group.position.copy(position);
      scene.add(group);
      return group;
    }

    // Create Feed-Forward Network block (using cache)
    function createFFNBlock(position: THREE.Vector3, index: number) {
      const geometry = new THREE.BoxGeometry(1.2, 2.5, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.5,
        roughness: 0.3,
        emissive: 0x059669,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.type = "ffn";
      mesh.position.copy(position);

      // Add label (using cache)
      const cacheKey = "ffn_label";
      const texture = getCachedTexture(cacheKey, () => {
        const canvas = getPooledCanvas(128, 64);
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("FFN", 64, 32);
        return canvas;
      });

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.position.z = 0.6;
      sprite.scale.set(1.5, 0.75, 1);
      scene.add(sprite);

      scene.add(mesh);
      return mesh;
    }

    // Create Attention Output (shows computed attention)
    function createAttentionOutput(position: THREE.Vector3) {
      const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff8800,
        metalness: 0.5,
        roughness: 0.2,
        emissive: 0xff4400,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.type = "attention";
      mesh.position.copy(position);
      scene.add(mesh);
      return mesh;
    }

    // Create Layer Normalization block
    function createLayerNorm(position: THREE.Vector3) {
      const geometry = new THREE.BoxGeometry(0.6, 1.0, 0.3);
      const material = new THREE.MeshStandardMaterial({
        color: 0x8844ff,
        metalness: 0.6,
        roughness: 0.2,
        emissive: 0x6622cc,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.type = "layerNorm";
      mesh.position.copy(position);
      scene.add(mesh);
      return mesh;
    }

    // Create Output Tensor (final hidden state)
    function createOutputTensor(position: THREE.Vector3) {
      const geometry = new THREE.BoxGeometry(0.8, 1.4, 0.2);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.5,
        roughness: 0.2,
        emissive: 0xffcc00,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.type = "output";
      mesh.position.copy(position);
      scene.add(mesh);
      return mesh;
    }

    // Create all layers - HORIZONTAL LAYOUT
    const yOffset = 0;

    // Define prediction X position early for use in labels
    const predictionX = stageXPositions.output + 6;

    // Create stage labels - BELOW tokens so they don't overlap when tokens grow
    // Calculate bottom position based on number of tokens
    // Move labels further down (increased from +2 to +4) to be below the bottom-most token
    const bottomY = yOffset + startY + (numTokens - 1) * tokenSpacing + 4;
    const labelY = bottomY;
    const labels = [
      { text: "Input", x: stageXPositions.tokens },
      { text: "Embeddings", x: stageXPositions.embeddings },
      { text: "Q/K/V", x: stageXPositions.qkv },
      { text: "Attention", x: stageXPositions.attention },
      { text: "FFN", x: stageXPositions.ffn },
      { text: "Layer Norm", x: stageXPositions.layerNorm },
      { text: "Output", x: stageXPositions.output },
      { text: "Softmax", x: predictionX - 2 },
    ];

    labels.forEach(({ text, x }) => {
      const label = createStageLabel(text, new THREE.Vector3(x, labelY, 0));
      if (label) {
        stageLabels.push(label);
        scene.add(label);
      }
    });

    // Create components for each token - flows LEFT TO RIGHT
    for (let i = 0; i < numTokens; i++) {
      const tokenY = yOffset + startY + i * tokenSpacing;

      // Stage 1: Input tokens (leftmost)
      const tokenPos = new THREE.Vector3(stageXPositions.tokens, tokenY, 0);
      const tokenGroup = createToken(tokens[i], tokenPos, i);
      tokenObjects.push(tokenGroup);

      // Stage 2: Embedding tensors
      const embeddingPos = new THREE.Vector3(
        stageXPositions.embeddings,
        tokenY,
        0
      );
      const embedding = createEmbeddingTensor(embeddingPos, i);
      embeddingTensors.push(embedding);

      // Stage 3: QKV projections
      const qkvPos = new THREE.Vector3(stageXPositions.qkv, tokenY, 0);
      const qkvGroup = createQKVGroup(qkvPos, i);
      qkvTensors.push(qkvGroup);

      // Stage 4: Attention outputs
      const attentionPos = new THREE.Vector3(
        stageXPositions.attention,
        tokenY,
        0
      );
      const attentionOutput = createAttentionOutput(attentionPos);
      attentionOutputs.push(attentionOutput);

      // Stage 5: FFN blocks
      const ffnPos = new THREE.Vector3(stageXPositions.ffn, tokenY, 0);
      const ffn = createFFNBlock(ffnPos, i);
      ffnBlocks.push(ffn);

      // Stage 6: Layer Normalization
      const layerNormPos = new THREE.Vector3(
        stageXPositions.layerNorm,
        tokenY,
        0
      );
      const layerNorm = createLayerNorm(layerNormPos);
      layerNormBlocks.push(layerNorm);

      // Stage 7: Output tensors
      const outputPos = new THREE.Vector3(stageXPositions.output, tokenY, 0);
      const output = createOutputTensor(outputPos);
      outputTensors.push(output);
    }

    // Attention heads visualization (between Q/K/V and attention outputs)
    for (let i = 0; i < Math.min(numTokens, 4); i++) {
      const tokenY = yOffset + startY + i * tokenSpacing;
      const attentionX = (stageXPositions.qkv + stageXPositions.attention) / 2;
      const attentionPos = new THREE.Vector3(attentionX, tokenY, 0);
      const attHead = createAttentionHead(attentionPos, i);
      attentionHeads.push(attHead);
    } // Create predicted next token at the top
    function createPredictedToken(text: string, position: THREE.Vector3) {
      const group = new THREE.Group();

      // Larger glowing sphere for prediction (optimized)
      const geometry = new THREE.SphereGeometry(0.6, 12, 12);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.4,
        roughness: 0.2,
        emissive: 0xffa500,
        emissiveIntensity: 0.8,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.userData.type = "prediction";
      group.add(sphere);

      // Bright glow (optimized)
      const glowGeometry = new THREE.SphereGeometry(1.0, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);

      // Label with "NEXT:" prefix
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 512;
      canvas.height = 256;

      // Draw background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.roundRect(20, 60, 472, 136, 20);
      ctx.fill();

      // Draw "NEXT:" label
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("NEXT:", 256, 100);

      // Draw predicted word
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px Arial";
      ctx.fillText(text, 256, 160);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.y = 1.8;
      sprite.scale.set(4, 2, 1);
      group.add(sprite);

      group.position.copy(position);
      scene.add(group);

      return group;
    }

    // Add prediction box at the top center
    // Place prediction at the far right, centered vertically (already defined above)
    predictedToken = createPredictedToken(
      currentPrediction,
      new THREE.Vector3(predictionX, yOffset, 0)
    );

    // Create softmax probability visualization panel
    const softmaxPanel = new THREE.Group();
    softmaxPanel.position.set(predictionX, yOffset + 5, 0);

    function createSoftmaxPanel() {
      // Background panel
      const panelGeo = new THREE.PlaneGeometry(4, 6);
      const panelMat = new THREE.MeshBasicMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      softmaxPanel.add(panel);

      // Title (using cache)
      const titleCacheKey = "softmax_title";
      const titleTexture = getCachedTexture(titleCacheKey, () => {
        const titleCanvas = getPooledCanvas(256, 64);
        const titleCtx = titleCanvas.getContext("2d")!;
        titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
        titleCtx.fillStyle = "#60a5fa";
        titleCtx.font = "bold 28px Arial";
        titleCtx.textAlign = "center";
        titleCtx.fillText("Softmax Probabilities", 128, 40);
        return titleCanvas;
      });

      const titleSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: titleTexture, transparent: true })
      );
      titleSprite.position.set(0, 2.7, 0.1);
      titleSprite.scale.set(3, 0.5, 1);
      softmaxPanel.add(titleSprite);

      // Probability bars (will be updated dynamically)
      for (let i = 0; i < 5; i++) {
        const barGroup = new THREE.Group();
        barGroup.position.set(-1.5, 1.8 - i * 0.9, 0.1);
        barGroup.userData.index = i;

        // Background bar
        const bgBar = new THREE.Mesh(
          new THREE.PlaneGeometry(3, 0.6),
          new THREE.MeshBasicMaterial({
            color: 0x2a2a3e,
            transparent: true,
            opacity: 0.5,
          })
        );
        bgBar.position.set(1.5, 0, 0);
        barGroup.add(bgBar);

        // Animated probability bar - create at max width, scale down
        const maxBarWidth = 3.0; // Max width is 3 units (100% probability)
        const probBar = new THREE.Mesh(
          new THREE.PlaneGeometry(maxBarWidth, 0.5),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        probBar.position.set(maxBarWidth / 2, 0, 0.01);
        probBar.scale.x = 0.01; // Start with very small scale
        probBar.userData.isBar = true;
        probBar.userData.maxBarWidth = maxBarWidth; // Store max width for later
        barGroup.add(probBar);

        // Label sprite (token + percentage) - high resolution for sharp text (pooled)
        const labelCanvas = getPooledCanvas(512, 128);
        const labelCtx = labelCanvas.getContext("2d")!;
        labelCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
        labelCtx.fillStyle = "#ffffff";
        labelCtx.font = "bold 40px Arial"; // Scaled up with canvas
        labelCtx.fillText("...", 20, 80);

        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        labelTexture.minFilter = THREE.LinearFilter; // Better filtering
        labelTexture.magFilter = THREE.LinearFilter;
        const labelSprite = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: labelTexture, transparent: true })
        );
        labelSprite.position.set(1.5, 0, 0.02);
        labelSprite.scale.set(2.5, 0.4, 1);
        labelSprite.userData.isLabel = true;
        labelSprite.userData.canvas = labelCanvas;
        labelSprite.userData.ctx = labelCtx;
        labelSprite.userData.texture = labelTexture;
        barGroup.add(labelSprite);

        softmaxPanel.add(barGroup);
      }
    }

    createSoftmaxPanel();
    softmaxPanel.visible = false; // Hide initially
    scene.add(softmaxPanel);

    // Add particles around predicted token for effect
    const particleCount = 20;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5;
      particlePositions[i * 3] = predictionX + Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = yOffset + Math.sin(angle) * radius * 0.3;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const predictionParticleMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const predictionParticles = new THREE.Points(
      particleGeometry,
      predictionParticleMaterial
    );
    scene.add(predictionParticles);

    // Add arrows from FFN to prediction
    const predictionArrows: THREE.Line[] = [];
    for (let i = 0; i < numTokens; i++) {
      const points = [
        ffnBlocks[i].position.clone().add(new THREE.Vector3(0, 1.25, 0)),
        predictedToken.position.clone().add(new THREE.Vector3(0, -1.2, 0)),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      predictionArrows.push(line);
    }

    // Create data flow lines between stages (HORIZONTAL)
    const dataFlowLines: THREE.Line[] = [];

    function createDataFlowLines() {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0,
      });

      // lineStage 0: tokens→embeddings (animates at step 0)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          tokenObjects[i].position.clone().add(new THREE.Vector3(0.5, 0, 0)),
          embeddingTensors[i].position
            .clone()
            .add(new THREE.Vector3(-0.4, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 1: embeddings→qkv (animates at step 1)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          embeddingTensors[i].position
            .clone()
            .add(new THREE.Vector3(0.4, 0, 0)),
          qkvTensors[i].position.clone().add(new THREE.Vector3(-0.6, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 2: qkv→attention heads (animates at step 2)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          qkvTensors[i].position.clone().add(new THREE.Vector3(0.6, 0, 0)),
          attentionHeads[Math.min(i, attentionHeads.length - 1)].position
            .clone()
            .add(new THREE.Vector3(-0.4, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 3: attention heads→attention outputs (animates at step 3)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          attentionHeads[Math.min(i, attentionHeads.length - 1)].position
            .clone()
            .add(new THREE.Vector3(0.4, 0, 0)),
          attentionOutputs[i].position
            .clone()
            .add(new THREE.Vector3(-0.4, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 4: attention outputs→ffn (animates at step 4)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          attentionOutputs[i].position
            .clone()
            .add(new THREE.Vector3(0.4, 0, 0)),
          ffnBlocks[i].position.clone().add(new THREE.Vector3(-0.6, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 5: ffn→layernorm (animates at step 5)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          ffnBlocks[i].position.clone().add(new THREE.Vector3(0.6, 0, 0)),
          layerNormBlocks[i].position
            .clone()
            .add(new THREE.Vector3(-0.3, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 6: layernorm→output (animates at step 6)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          layerNormBlocks[i].position.clone().add(new THREE.Vector3(0.3, 0, 0)),
          outputTensors[i].position.clone().add(new THREE.Vector3(-0.4, 0, 0)),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // lineStage 7: output→softmax (animates at step 7)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          outputTensors[i].position.clone().add(new THREE.Vector3(0.4, 0, 0)),
          new THREE.Vector3(
            softmaxPanel.position.x - 2.5,
            startY + i * tokenSpacing,
            0
          ),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }
    }

    createDataFlowLines();

    // Value flow sprites - show actual numbers flowing through network
    const valueFlowSprites: THREE.Sprite[] = [];

    function createValueSprite(
      value: number,
      position: THREE.Vector3,
      color: string = "#60a5fa"
    ): THREE.Sprite {
      const canvas = getPooledCanvas(128, 64);
      const ctx = canvas.getContext("2d")!;

      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.roundRect(5, 5, 118, 54, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.roundRect(5, 5, 118, 54, 8);
      ctx.stroke();

      // Value text
      ctx.fillStyle = color;
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayValue =
        Math.abs(value) < 0.01 ? value.toExponential(2) : value.toFixed(3);
      ctx.fillText(displayValue, 64, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, transparent: true })
      );
      sprite.position.copy(position);
      sprite.scale.set(1, 0.5, 1);
      sprite.userData.startTime = time;
      sprite.userData.duration = 1.0; // 1 second to flow
      sprite.userData.startPos = position.clone(); // Store start position
      sprite.userData.canvas = canvas; // Store for cleanup

      scene.add(sprite);
      valueFlowSprites.push(sprite);
      return sprite;
    }

    function animateValueFlow(
      sprite: THREE.Sprite,
      startPos: THREE.Vector3,
      endPos: THREE.Vector3,
      currentTime: number
    ) {
      const elapsed = currentTime - sprite.userData.startTime;
      const progress = Math.min(elapsed / sprite.userData.duration, 1);

      // Check if this is a softmax transformation sprite (has midPos and transformStage)
      if (
        sprite.userData.midPos &&
        sprite.userData.transformStage !== undefined
      ) {
        // Three-stage animation: logit -> exp() -> normalized probability
        const midPos = sprite.userData.midPos;

        if (progress < 0.33) {
          // Stage 1: Move from output to midpoint (showing logit value)
          const localProgress = progress / 0.33;
          const easedProgress =
            localProgress < 0.5
              ? 2 * localProgress * localProgress
              : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
          sprite.position.lerpVectors(startPos, midPos, easedProgress);
          sprite.material.opacity =
            0.7 + Math.sin(localProgress * Math.PI) * 0.3;
          sprite.scale.set(1, 0.5, 1);
        } else if (progress < 0.66) {
          // Stage 2: At midpoint, show exp() transformation (pulse and color change)
          sprite.position.copy(midPos);
          const pulseProgress = (progress - 0.33) / 0.33;
          const pulse = 1 + Math.sin(pulseProgress * Math.PI * 4) * 0.3;
          sprite.scale.set(pulse, pulse * 0.5, 1);
          sprite.material.opacity = 0.9;

          // Update text to show "exp()" transformation once
          if (!sprite.userData.expShown && pulseProgress > 0.3) {
            sprite.userData.expShown = true;
          }
        } else {
          // Stage 3: Move to softmax panel (showing normalized probability)
          const localProgress = (progress - 0.66) / 0.34;
          const easedProgress =
            localProgress < 0.5
              ? 2 * localProgress * localProgress
              : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
          sprite.position.lerpVectors(midPos, endPos, easedProgress);
          sprite.material.opacity = Math.sin(localProgress * Math.PI) * 0.8;
          sprite.scale.set(
            1 - localProgress * 0.3,
            0.5 - localProgress * 0.2,
            1
          );
        }
      } else {
        // Normal two-point animation
        const easedProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        sprite.position.lerpVectors(startPos, endPos, easedProgress);
        sprite.material.opacity = Math.sin(progress * Math.PI); // Fade in and out
      }

      if (progress >= 1) {
        scene.remove(sprite);

        // Return canvas to pool
        if (sprite.userData.canvas) {
          returnCanvasToPool(sprite.userData.canvas);
        }

        // Dispose texture
        if (sprite.material.map) {
          sprite.material.map.dispose();
        }

        const index = valueFlowSprites.indexOf(sprite);
        if (index > -1) valueFlowSprites.splice(index, 1);
      }
    }

    // Hover interaction system
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: THREE.Mesh | null = null;
    let hoverInfoDiv: HTMLDivElement | null = null;

    // Component metadata for hover information
    const componentInfo: Record<
      string,
      { title: string; description: string; how: string; why: string }
    > = {
      token: {
        title: "Input Tokens",
        description:
          "Raw text broken down into discrete units (tokens) that the model can process.",
        how: "A tokenizer splits text using rules (word, subword, or character-level). Each token gets a unique ID from a vocabulary.",
        why: "Neural networks can't process raw text directly—they need numerical representations. Tokenization converts text into a format the model understands.",
      },
      embedding: {
        title: "Embeddings",
        description:
          "Converts token IDs into dense vector representations that capture semantic meaning.",
        how: "Each token ID is mapped to a learned vector (e.g., 512 dimensions). Similar tokens have similar vectors in high-dimensional space.",
        why: "Embeddings encode semantic relationships: 'king' - 'man' + 'woman' ≈ 'queen'. This allows the model to understand meaning and context.",
      },
      qkv: {
        title: "QKV Projection",
        description:
          "Creates three different views of each token: Query (what to look for), Key (what's available), and Value (information to pass).",
        how: "Input embeddings are multiplied by three learned weight matrices (Wq, Wk, Wv) to produce Q, K, and V matrices.",
        why: "Separating Q, K, V allows the attention mechanism to compare 'what I'm looking for' (Q) with 'what others offer' (K) and retrieve 'relevant information' (V).",
      },
      attention: {
        title: "Attention Mechanism",
        description:
          "Computes how much each token should focus on every other token to gather contextual information.",
        how: "Calculates attention scores: softmax(Q·K^T / √d), then weights Values: Attention(Q,K,V) = softmax(QK^T/√d)V. Multiple heads capture different relationships.",
        why: "This is the transformer's superpower! It lets each token dynamically gather relevant context from all other tokens, enabling understanding of relationships and dependencies.",
      },
      ffn: {
        title: "Feed-Forward Network (FFN)",
        description:
          "Processes each token independently through a 2-layer neural network with non-linear activation.",
        how: "FFN(x) = ReLU(xW1 + b1)W2 + b2. Typically expands dimension (e.g., 512 → 2048 → 512) then contracts back.",
        why: "After gathering context via attention, FFN adds non-linear transformations to process and integrate that information. It's where the model 'thinks' about what it learned.",
      },
      layerNorm: {
        title: "Layer Normalization",
        description:
          "Stabilizes training by normalizing values across features to have zero mean and unit variance.",
        how: "For each token: norm(x) = γ(x - μ) / √(σ² + ε) + β, where μ and σ are mean/std computed across features.",
        why: "Prevents values from exploding or vanishing during training. Makes training faster and more stable by keeping values in a reasonable range throughout the network.",
      },
      output: {
        title: "Output Hidden States",
        description:
          "Final contextualized representation of each token after passing through all transformer layers.",
        how: "Result of stacking multiple transformer blocks (attention + FFN + normalization). Each layer adds deeper understanding and abstraction.",
        why: "These rich representations encode each token's meaning in context of the entire sequence. Used for downstream tasks like generation, classification, or translation.",
      },
      prediction: {
        title: "Softmax & Next Token Prediction",
        description:
          "Converts final hidden state into probability distribution over the vocabulary to predict the next token.",
        how: "Hidden state is projected to vocabulary size (e.g., 512 → 50,000), then softmax converts logits to probabilities: P(token_i) = exp(z_i) / Σexp(z_j).",
        why: "This is how the model generates text! Highest probability token is selected (or sampled with temperature). In autoregressive generation, this loops: predict → append → repeat.",
      },
    };

    function createHoverInfo(): HTMLDivElement {
      // Add animations to document if not already present
      if (!document.getElementById("hover-animations")) {
        const style = document.createElement("style");
        style.id = "hover-animations";
        style.textContent = `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hover-card-enter {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `;
        document.head.appendChild(style);
      }

      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.display = "none";
      div.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
      div.style.border = "1px solid rgba(0, 0, 0, 0.08)";
      div.style.borderRadius = "16px";
      div.style.padding = "20px";
      div.style.maxWidth = "380px";
      div.style.minWidth = "320px";
      div.style.pointerEvents = "none";
      div.style.zIndex = "1000";
      div.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', sans-serif";
      div.style.boxShadow =
        "0 20px 60px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)";
      div.style.backdropFilter = "blur(20px)";
      div.style.transition = "opacity 0.2s ease-in-out";
      div.style.opacity = "0";
      div.className = "hover-card-enter";
      document.body.appendChild(div);
      return div;
    }

    hoverInfoDiv = createHoverInfo();

    // Cache for AI-generated explanations with expiration (10 minutes)
    const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
    const aiExplanationCache = new Map<
      string,
      {
        data: { how: string; why: string };
        timestamp: number;
      }
    >();
    let currentFetchController: AbortController | null = null;

    async function fetchAIExplanation(
      componentType: string,
      onStream?: (partial: { how: string; why: string }) => void
    ): Promise<{ how: string; why: string }> {
      // Check cache first and validate expiry
      const cached = aiExplanationCache.get(componentType);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
        return cached.data;
      }

      // Cancel previous request if still pending
      if (currentFetchController) {
        currentFetchController.abort();
      }

      currentFetchController = new AbortController();

      try {
        const prompt = `I'm hovering over the ${
          componentInfo[componentType]?.title || componentType
        } in the transformer visualization. Help me understand it!

Give me:
HOW: Explain how it actually works - the mechanics, maybe include key formulas if relevant. Make it clear but not dry. (2-3 sentences)
WHY: Tell me why this matters in real life. Why should I care? Where does this show up in actual AI applications? (2-3 sentences)

Talk to me like a knowledgeable friend explaining something cool. Use "you" and "your" to make it personal. Format as:
HOW: [your natural, friendly explanation]
WHY: [why this is actually important and interesting]`;

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            newMessage: prompt,
          }),
          signal: currentFetchController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let extractedAnswer = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;

            // Extract and display only the "answer" field content from JSON
            const answerMatch = fullResponse.match(
              /"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/
            );
            if (answerMatch) {
              // Unescape JSON string
              extractedAnswer = answerMatch[1]
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "")
                .replace(/\\t/g, "\t")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");

              // Parse partial content
              const howMatch = extractedAnswer.match(
                /HOW:\s*([\s\S]+?)(?=WHY:|$)/
              );
              const whyMatch = extractedAnswer.match(/WHY:\s*([\s\S]+?)$/);

              const partialExplanation = {
                how: howMatch ? howMatch[1].trim() : "Generating...",
                why: whyMatch ? whyMatch[1].trim() : "Loading...",
              };

              // Call streaming callback
              if (onStream) {
                onStream(partialExplanation);
              }
            }
          }
        }

        // Parse the final response
        const howMatch = extractedAnswer.match(/HOW:\s*([\s\S]+?)(?=WHY:|$)/);
        const whyMatch = extractedAnswer.match(/WHY:\s*([\s\S]+?)$/);

        const explanation = {
          how: howMatch
            ? howMatch[1].trim()
            : componentInfo[componentType]?.how || "Processing...",
          why: whyMatch
            ? whyMatch[1].trim()
            : componentInfo[componentType]?.why || "Loading...",
        };

        // Cache the result with timestamp
        aiExplanationCache.set(componentType, {
          data: explanation,
          timestamp: Date.now(),
        });
        return explanation;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          throw error; // Re-throw abort errors
        }
        console.error("Error fetching AI explanation:", error);
        // Fallback to static info
        const info = componentInfo[componentType];
        return {
          how: info?.how || "Unable to load explanation",
          why: info?.why || "Unable to load explanation",
        };
      }
    }

    async function updateHoverInfo(
      object: THREE.Mesh,
      mouseX: number,
      mouseY: number
    ) {
      if (!hoverInfoDiv) return;

      const info = componentInfo[object.userData.type];
      if (!info) return;

      // In manual mode, show only basic info without AI explanations
      if (context?.manualMode) {
        hoverInfoDiv.innerHTML = `
          <div style="margin-bottom: 16px;">
            <div style="color: #0f172a; font-size: 17px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em;">
              ${info.title}
            </div>
            <div style="color: #475569; font-size: 13px; line-height: 1.6;">
              ${info.description}
            </div>
          </div>
          <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; margin-bottom: 10px;">
            <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">🔧</div>
            <div style="flex: 1;">
              <div style="color: #0c4a6e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">How it works</div>
              <div style="color: #334155; font-size: 12px; line-height: 1.5;">${info.how}</div>
            </div>
          </div>
          <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px;">
            <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">💡</div>
            <div style="flex: 1;">
              <div style="color: #78350f; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Why it matters</div>
              <div style="color: #334155; font-size: 12px; line-height: 1.5;">${info.why}</div>
            </div>
          </div>
          <div style="margin-top: 12px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #64748b; font-size: 10px; padding: 4px 10px; background: rgba(100, 116, 139, 0.08); border-radius: 12px;">
              <span>📖</span>
              <span>Manual Mode</span>
            </div>
          </div>
        `;

        const padding = 20;
        let maxX = window.innerWidth - 420 - padding;
        let maxY = window.innerHeight - 250 - padding;

        hoverInfoDiv.style.left = Math.min(mouseX + 20, maxX) + "px";
        hoverInfoDiv.style.top = Math.min(mouseY + 20, maxY) + "px";
        hoverInfoDiv.style.display = "block";
        setTimeout(() => {
          if (hoverInfoDiv) hoverInfoDiv.style.opacity = "1";
        }, 10);
        return;
      }

      // Show loading state immediately
      hoverInfoDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
          <div style="color: #0f172a; font-size: 17px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em;">
            ${info.title}
          </div>
          <div style="color: #475569; font-size: 13px; line-height: 1.6;">
            ${info.description}
          </div>
        </div>
        <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; margin-bottom: 10px;">
          <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">🔧</div>
          <div style="flex: 1;">
            <div style="color: #0c4a6e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">How it works</div>
            <div style="color: #334155; font-size: 12px; line-height: 1.5;">
              <span style="animation: pulse 1.5s ease-in-out infinite; color: #64748b;">⏳ Generating explanation...</span>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px;">
          <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">💡</div>
          <div style="flex: 1;">
            <div style="color: #78350f; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Why it matters</div>
            <div style="color: #334155; font-size: 12px; line-height: 1.5;">
              <span style="animation: pulse 1.5s ease-in-out infinite; color: #64748b;">⏳ Loading...</span>
            </div>
          </div>
        </div>
      `;

      const padding = 20;
      let maxX = window.innerWidth - 420 - padding; // Use fixed width for calculation
      let maxY = window.innerHeight - 300 - padding;

      hoverInfoDiv.style.left = Math.min(mouseX + 20, maxX) + "px";
      hoverInfoDiv.style.top = Math.min(mouseY + 20, maxY) + "px";
      hoverInfoDiv.style.display = "block";
      // Trigger fade-in animation
      setTimeout(() => {
        if (hoverInfoDiv) hoverInfoDiv.style.opacity = "1";
      }, 10);

      // Fetch AI explanation with streaming
      try {
        const updateHoverContent = (partial: { how: string; why: string }) => {
          // Only update if still hovering over the same object
          if (hoveredObject === object && hoverInfoDiv) {
            hoverInfoDiv.innerHTML = `
              <div style="margin-bottom: 16px;">
                <div style="color: #0f172a; font-size: 17px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em;">
                  ${info.title}
                </div>
                <div style="color: #475569; font-size: 13px; line-height: 1.6;">
                  ${info.description}
                </div>
              </div>
              <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; margin-bottom: 10px;">
                <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">🔧</div>
                <div style="flex: 1;">
                  <div style="color: #0c4a6e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">How it works</div>
                  <div style="color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${partial.how}</div>
                </div>
              </div>
              <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px;">
                <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">💡</div>
                <div style="flex: 1;">
                  <div style="color: #78350f; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Why it matters</div>
                  <div style="color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${partial.why}</div>
                </div>
              </div>
              <div style="margin-top: 12px; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 10px; padding: 4px 10px; background: rgba(148, 163, 184, 0.08); border-radius: 12px;">
                  <span>✨</span>
                  <span>AI-powered • Streaming</span>
                </div>
              </div>
            `;

            // Recalculate position with actual dimensions
            const maxX = window.innerWidth - hoverInfoDiv.offsetWidth - padding;
            const maxY =
              window.innerHeight - hoverInfoDiv.offsetHeight - padding;
            hoverInfoDiv.style.left = Math.min(mouseX + 20, maxX) + "px";
            hoverInfoDiv.style.top = Math.min(mouseY + 20, maxY) + "px";
          }
        };

        const aiExplanation = await fetchAIExplanation(
          object.userData.type,
          updateHoverContent
        );

        // Final update with complete content
        if (hoveredObject === object && hoverInfoDiv) {
          hoverInfoDiv.innerHTML = `
            <div style="margin-bottom: 16px;">
              <div style="color: #0f172a; font-size: 17px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em;">
                ${info.title}
              </div>
              <div style="color: #475569; font-size: 13px; line-height: 1.6;">
                ${info.description}
              </div>
            </div>
            <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; margin-bottom: 10px;">
              <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">🔧</div>
              <div style="flex: 1;">
                <div style="color: #0c4a6e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">How it works</div>
                <div style="color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${aiExplanation.how}</div>
              </div>
            </div>
            <div style="display: flex; align-items-start; gap: 10px; padding: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px;">
              <div style="flex-shrink: 0; font-size: 16px; margin-top: 1px;">💡</div>
              <div style="flex: 1;">
                <div style="color: #78350f; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Why it matters</div>
                <div style="color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${aiExplanation.why}</div>
              </div>
            </div>
            <div style="margin-top: 12px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 10px; padding: 4px 10px; background: rgba(148, 163, 184, 0.08); border-radius: 12px;">
                <span>✨</span>
                <span>AI-powered</span>
              </div>
            </div>
          `;

          // Recalculate position with actual dimensions
          maxX = window.innerWidth - hoverInfoDiv.offsetWidth - padding;
          maxY = window.innerHeight - hoverInfoDiv.offsetHeight - padding;
          hoverInfoDiv.style.left = Math.min(mouseX + 20, maxX) + "px";
          hoverInfoDiv.style.top = Math.min(mouseY + 20, maxY) + "px";
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load AI explanation:", error);
        }
      }
    }

    function onMouseMove(event: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check all interactive objects
      const interactiveObjects = [
        ...tokenObjects.map((g) => g.children[0] as THREE.Mesh),
        ...embeddingTensors,
        ...qkvTensors.flatMap(
          (g) =>
            g.children.filter((c) => c instanceof THREE.Mesh) as THREE.Mesh[]
        ),
        ...attentionHeads.flatMap(
          (g) =>
            g.children.filter((c) => c instanceof THREE.Mesh) as THREE.Mesh[]
        ),
        ...attentionOutputs,
        ...ffnBlocks,
        ...layerNormBlocks,
        ...outputTensors,
      ];

      // Add predicted token if it exists
      if (predictedToken) {
        const predictionMesh = predictedToken.children.find(
          (c) => c instanceof THREE.Mesh && c.userData.type === "prediction"
        ) as THREE.Mesh;
        if (predictionMesh) {
          interactiveObjects.push(predictionMesh);
        }
      }

      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const newHovered = intersects[0].object as THREE.Mesh;

        if (hoveredObject !== newHovered) {
          // Restore previous object
          if (
            hoveredObject &&
            hoveredObject.userData.originalEmissiveIntensity !== undefined
          ) {
            (
              hoveredObject.material as THREE.MeshStandardMaterial
            ).emissiveIntensity =
              hoveredObject.userData.originalEmissiveIntensity;
          }

          // Highlight new object
          hoveredObject = newHovered;
          const material = hoveredObject.material as THREE.MeshStandardMaterial;
          hoveredObject.userData.originalEmissiveIntensity =
            material.emissiveIntensity;
          material.emissiveIntensity = (material.emissiveIntensity || 0) + 0.4;

          updateHoverInfo(hoveredObject, event.clientX, event.clientY);
        } else {
          // Update position for same object
          updateHoverInfo(hoveredObject, event.clientX, event.clientY);
        }

        renderer.domElement.style.cursor = "pointer";
      } else {
        // No intersection
        if (hoveredObject) {
          if (hoveredObject.userData.originalEmissiveIntensity !== undefined) {
            (
              hoveredObject.material as THREE.MeshStandardMaterial
            ).emissiveIntensity =
              hoveredObject.userData.originalEmissiveIntensity;
          }
          hoveredObject = null;
        }

        if (hoverInfoDiv) {
          hoverInfoDiv.style.opacity = "0";
          setTimeout(() => {
            if (hoverInfoDiv) hoverInfoDiv.style.display = "none";
          }, 200);
        }

        renderer.domElement.style.cursor = "default";
      }
    }

    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // Animation state
    let time = 0;
    let animationId: number;
    let stepProgress = 0;
    const stepsPerToken = 8; // Input -> Embedding -> QKV -> Attention -> FFN -> Layer Norm -> Output -> Softmax

    // Animation step tracking
    let currentAnimStep = context.currentStep;
    const maxSteps = stepsPerToken;

    // Camera follow targets for each step
    const cameraTargets = [
      new THREE.Vector3(stageXPositions.tokens, yOffset, 0), // Step 0: Input tokens
      new THREE.Vector3(stageXPositions.embeddings, yOffset, 0), // Step 1: Embeddings
      new THREE.Vector3(stageXPositions.qkv, yOffset, 0), // Step 2: QKV
      new THREE.Vector3(stageXPositions.attention, yOffset, 0), // Step 3: Attention
      new THREE.Vector3(stageXPositions.ffn, yOffset, 0), // Step 4: FFN
      new THREE.Vector3(stageXPositions.layerNorm, yOffset, 0), // Step 5: Layer Norm
      new THREE.Vector3(stageXPositions.output, yOffset, 0), // Step 6: Output
      new THREE.Vector3(predictionX, yOffset, 0), // Step 7: Softmax & Prediction
    ];

    // Particle spawn counters - limit to 10 particles per step per cycle
    const particleSpawnCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };
    const MAX_PARTICLES_PER_STEP = 10;
    let lastStep = -1;

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Throttle time updates for better performance
      const deltaTime = Math.min(
        (currentTime - (animate as any).lastTime || 0) / 1000,
        0.1
      );
      (animate as any).lastTime = currentTime;

      // Update current step from context (for step-by-step mode)
      if (context.stepByStep) {
        currentAnimStep = context.currentStep;
        stepProgress = 0;
        time += deltaTime * 0.5; // Keep time advancing for smooth animations
      } else if (context.isPlaying || context.manualMode) {
        // Slow down animation speed by 0.5x when auto-continue is active for better viewing
        const speedMultiplier = context.autoContinue ? 0.5 : 1.0;
        time += deltaTime * context.speed * 2 * speedMultiplier;
        stepProgress += deltaTime * context.speed * 0.3 * speedMultiplier;

        // Advance through steps
        if (stepProgress >= 1) {
          stepProgress = 0;
          currentAnimStep = (currentAnimStep + 1) % maxSteps;
          context.setCurrentStep(currentAnimStep);
        }
      } else {
        // Slow passive animation when paused
        time += deltaTime * 0.5;
      }

      // Reset particle counter when step changes
      if (lastStep !== currentAnimStep) {
        particleSpawnCounts[currentAnimStep] = 0;
        lastStep = currentAnimStep;
      }
      {
        // Step 0: Input tokens (highlight original tokens)
        const isStep0Active = currentAnimStep === 0;
        tokenObjects.forEach((group, i) => {
          const sphere = group.children[0] as THREE.Mesh;
          const baseMat = sphere.material as THREE.MeshStandardMaterial;

          if (isStep0Active) {
            const pulse = 0.8 + Math.sin(time * 3 + i) * 0.4;
            if (Math.abs(baseMat.emissiveIntensity - pulse) > 0.01) {
              baseMat.emissiveIntensity = pulse;
            }
            const scale = 1.3 + Math.sin(time * 3 + i) * 0.15;
            group.scale.setScalar(scale);
          } else {
            if (baseMat.emissiveIntensity !== 0.4)
              baseMat.emissiveIntensity = 0.4;
            if (group.scale.x !== 1) group.scale.setScalar(1);
          }
        });

        // Step 1: Embedding tensors
        const isStep1Active = currentAnimStep === 1;
        embeddingTensors.forEach((tensor, i) => {
          const mat = tensor.material as THREE.MeshStandardMaterial;

          if (isStep1Active) {
            mat.emissiveIntensity = 0.6 + Math.sin(time * 4 + i * 0.5) * 0.5;
            tensor.rotation.y = time * 0.5;
            const scale = 1.25 + Math.sin(time * 3 + i) * 0.1;
            tensor.scale.setScalar(scale);
          } else {
            if (mat.emissiveIntensity !== 0.2) mat.emissiveIntensity = 0.2;
            tensor.rotation.y += 0.005;
            if (tensor.scale.x !== 1) tensor.scale.setScalar(1);
          }
        });

        // Step 2: QKV projections
        qkvTensors.forEach((group, i) => {
          if (currentAnimStep === 2) {
            const scale = 1.3 + Math.sin(time * 3 + i) * 0.15;
            group.scale.setScalar(scale);
          } else {
            if (group.scale.x !== 1) group.scale.setScalar(1);
          }

          group.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              const mat = child.material as THREE.MeshStandardMaterial;

              if (currentAnimStep === 2) {
                mat.emissiveIntensity = 0.8 + Math.sin(time * 3 + i) * 0.4;
                child.rotation.y = Math.sin(time + i) * 0.3;
              } else {
                mat.emissiveIntensity = 0.3;
                child.rotation.y = 0;
              }
            }
          });
        });

        // Step 3: Attention mechanism
        attentionHeads.forEach((head, i) => {
          head.rotation.z = Math.sin(time * 0.5 + i) * 0.1;

          if (currentAnimStep === 3) {
            const scale = 1.35 + Math.sin(time * 3 + i) * 0.2;
            head.scale.setScalar(scale);
          } else {
            if (head.scale.x !== 1) head.scale.setScalar(1);
          }

          head.children.forEach((child) => {
            if (
              child instanceof THREE.Mesh &&
              child.geometry.type.includes("Box")
            ) {
              const mat = child.material as
                | THREE.MeshPhysicalMaterial
                | THREE.MeshBasicMaterial;

              if (currentAnimStep === 3) {
                if ("emissiveIntensity" in mat) {
                  mat.emissiveIntensity = 0.9 + Math.sin(time * 5) * 0.4;
                }
                mat.opacity = 0.9 + Math.sin(time * 3 + i) * 0.1;
              } else {
                if ("emissiveIntensity" in mat) {
                  mat.emissiveIntensity = 0.3;
                }
                mat.opacity = 0.6;
              }
            }
          });
        });

        // Attention outputs
        attentionOutputs.forEach((output, i) => {
          const mat = output.material as THREE.MeshStandardMaterial;

          if (currentAnimStep === 3) {
            mat.emissiveIntensity = 0.7 + Math.sin(time * 4 + i * 0.5) * 0.4;
            const scale = 1.2 + Math.sin(time * 4 + i) * 0.1;
            output.scale.setScalar(scale);
          } else {
            mat.emissiveIntensity = 0.3;
            if (output.scale.x !== 1) output.scale.setScalar(1);
          }
        });

        // Step 4: FFN blocks
        ffnBlocks.forEach((block, i) => {
          const mat = block.material as THREE.MeshStandardMaterial;

          if (currentAnimStep === 4) {
            mat.emissiveIntensity = 0.7 + Math.sin(time * 4 + i * 0.7) * 0.5;
            block.rotation.y = Math.sin(time + i) * 0.2;
            const scale = 1.3 + Math.sin(time * 3 + i) * 0.15;
            block.scale.setScalar(scale);
          } else {
            mat.emissiveIntensity = 0.3;
            block.rotation.y *= 0.95;
            if (block.scale.x !== 1) block.scale.setScalar(1);
          }
        });

        // Step 5: Layer Normalization
        layerNormBlocks.forEach((block, i) => {
          const mat = block.material as THREE.MeshStandardMaterial;

          if (currentAnimStep === 5) {
            mat.emissiveIntensity = 0.8 + Math.sin(time * 5 + i * 0.6) * 0.5;
            block.scale.setScalar(1.35 + Math.sin(time * 4 + i) * 0.15);
          } else {
            mat.emissiveIntensity = 0.4;
            block.scale.setScalar(1);
          }
        });

        // Step 6: Output tensors (just animate, don't trigger prediction yet)
        outputTensors.forEach((output, i) => {
          const mat = output.material as THREE.MeshStandardMaterial;

          if (currentAnimStep === 6) {
            const activeIdx = Math.floor((time * 0.5) % numTokens);
            mat.emissiveIntensity = i === activeIdx ? 1.0 : 0.6;
            if (i === activeIdx) {
              output.scale.setScalar(1.4 + Math.sin(time * 5) * 0.2);
            } else {
              const scale = 1.15 + Math.sin(time * 3 + i) * 0.1;
              output.scale.setScalar(scale);
            }
          } else {
            mat.emissiveIntensity = 0.4;
            output.scale.setScalar(1);
          }
        });

        // Step 7: Softmax & Prediction - This is where we compute probabilities and select token
        if (currentAnimStep === 7) {
          // Trigger prediction computation when entering step 7
          if (!context.computePrediction) {
            context.setComputePrediction(true);
          }

          // Show softmax panel with probabilities
          softmaxPanel.visible = true;

          // Animate output tensors flowing towards prediction with enhanced softmax visualization
          outputTensors.forEach((output, i) => {
            const mat = output.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.6 + Math.sin(time * 4 + i * 0.3) * 0.4;
          });

          // Spawn particles showing softmax transformation: logits -> exp -> normalize -> probabilities
          // Stop spawning after prediction is complete (unless auto-continue is enabled)
          const hasCompletedPrediction =
            context.predictedToken && context.predictedToken !== "...";
          const shouldSpawnSoftmaxParticles =
            !hasCompletedPrediction || context.autoContinue;
          const hasSoftmaxReachedLimit =
            particleSpawnCounts[7] >= MAX_PARTICLES_PER_STEP;

          if (
            Math.random() < 0.25 &&
            context.intermediateValues.finalLogits &&
            shouldSpawnSoftmaxParticles &&
            !hasSoftmaxReachedLimit
          ) {
            const tokenIdx = Math.floor(Math.random() * outputTensors.length);
            const logitValue = context.intermediateValues.finalLogits[tokenIdx];

            // Create particle showing logit value flowing from output
            const startPos = outputTensors[tokenIdx].position
              .clone()
              .add(new THREE.Vector3(0.5, 0, 0));

            // Intermediate position for "exp()" transformation
            const midPos = new THREE.Vector3(
              (startPos.x + softmaxPanel.position.x) / 2,
              startPos.y + Math.sin(time + tokenIdx) * 0.5,
              0
            );

            // Final position at softmax panel
            const endPos = softmaxPanel.position
              .clone()
              .add(new THREE.Vector3(-1.5, 1.5 - tokenIdx * 0.5, 0.2));

            // Create sprite showing transformation stages
            const sprite = createValueSprite(logitValue, startPos, "#60a5fa");
            sprite.userData.midPos = midPos;
            sprite.userData.endPos = endPos;
            sprite.userData.transformStage = 0; // 0: logit, 1: exp(), 2: normalized
            particleSpawnCounts[7]++;
          }

          // Update softmax panel with actual probabilities
          if (context.intermediateValues.topPredictions) {
            const topPreds = context.intermediateValues.topPredictions;
            softmaxPanel.children.forEach((child, idx) => {
              if (idx === 0 || idx === 1) return; // Skip background and title

              const barGroup = child as THREE.Group;
              const barIndex = barGroup.userData.index;

              if (barIndex < topPreds.length) {
                const pred = topPreds[barIndex];

                // Update probability bar with smooth animation
                const probBar = barGroup.children.find(
                  (c) => c.userData.isBar
                ) as THREE.Mesh;
                if (probBar) {
                  const maxBarWidth = probBar.userData.maxBarWidth || 3.0;
                  const targetScale = pred.prob; // Scale from 0 to 1

                  // Initialize lerp state
                  if (!probBar.userData.initialized) {
                    probBar.userData.currentScale = 0.01;
                    probBar.userData.initialized = true;
                  }

                  // Smooth lerp on scale - no geometry recreation!
                  probBar.userData.currentScale =
                    probBar.userData.currentScale +
                    (targetScale - probBar.userData.currentScale) * 0.15;
                  probBar.scale.x = probBar.userData.currentScale;
                  // Update position to keep bar left-aligned at origin
                  probBar.position.x =
                    (maxBarWidth / 2) * probBar.userData.currentScale;

                  // Color based on rank (winner is green) - only set once
                  if (!probBar.userData.colorSet) {
                    const colors = [
                      0x10b981, 0x3b82f6, 0xf59e0b, 0xef4444, 0x8b5cf6,
                    ];
                    (probBar.material as THREE.MeshBasicMaterial).color.setHex(
                      colors[barIndex]
                    );
                    probBar.userData.colorSet = true;
                  }

                  // Pulse the winning token (only affect y-scale)
                  if (barIndex === 0) {
                    const pulse = 0.5 + Math.sin(time * 8) * 0.5;
                    probBar.scale.y = 1 + pulse * 0.3;
                  } else {
                    probBar.scale.y = 1;
                  }
                }

                // Update label with token and probability - only when changed
                const labelSprite = barGroup.children.find(
                  (c) => c.userData.isLabel
                ) as THREE.Sprite;
                if (labelSprite && labelSprite.userData.ctx) {
                  // Only update if token or probability changed significantly
                  const lastToken = labelSprite.userData.lastToken;
                  const lastProb = labelSprite.userData.lastProb || 0;
                  const probChanged =
                    Math.abs(pred.prob * 100 - lastProb) > 0.5;

                  if (lastToken !== pred.token || probChanged) {
                    const ctx = labelSprite.userData
                      .ctx as CanvasRenderingContext2D;
                    const canvas = labelSprite.userData
                      .canvas as HTMLCanvasElement;
                    const texture = labelSprite.userData
                      .texture as THREE.CanvasTexture;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Highlight the winning prediction - scaled up for high DPI
                    if (barIndex === 0) {
                      ctx.fillStyle = "#10b981";
                      ctx.font = "bold 44px monospace";
                    } else {
                      ctx.fillStyle = "#ffffff";
                      ctx.font = "bold 40px monospace";
                    }

                    ctx.textAlign = "left";
                    ctx.fillText(`${pred.token}`, 20, 80);
                    ctx.fillStyle = barIndex === 0 ? "#10b981" : "#60a5fa";
                    ctx.textAlign = "right";
                    ctx.fillText(`${(pred.prob * 100).toFixed(1)}%`, 492, 80);
                    texture.needsUpdate = true;

                    // Store last values
                    labelSprite.userData.lastToken = pred.token;
                    labelSprite.userData.lastProb = pred.prob * 100;
                  }
                }
              }
            });
          }
        } else {
          softmaxPanel.visible = false;
        }

        // Spawn value flow sprites based on current step - visualize data flowing through ALL connections
        // Stop spawning particles after prediction is complete (when we're about to auto-continue)
        const hasCompletedPrediction =
          context.predictedToken &&
          context.predictedToken !== "..." &&
          currentAnimStep === 7;
        const shouldSpawnParticles =
          !hasCompletedPrediction || context.autoContinue;

        // Check if we've reached the particle limit for this step (10 particles max per step)
        const hasReachedParticleLimit =
          particleSpawnCounts[currentAnimStep] >= MAX_PARTICLES_PER_STEP;

        if (
          Math.random() < 0.18 &&
          context.intermediateValues &&
          shouldSpawnParticles &&
          !hasReachedParticleLimit
        ) {
          // 18% chance per frame for more frequent particles
          const values = context.intermediateValues;

          if (
            currentAnimStep === 0 &&
            values.embeddings &&
            tokenObjects.length > 0
          ) {
            // Step 0: Show embedding values flowing from tokens to embeddings
            const tokenIdx = Math.floor(Math.random() * tokenObjects.length);
            if (values.embeddings[tokenIdx]) {
              const value = values.embeddings[tokenIdx][0];
              const startPos = tokenObjects[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.5, 0, 0));
              const endPos = embeddingTensors[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#3b82f6");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[0]++;
            }
          } else if (
            currentAnimStep === 1 &&
            values.qkvProjections &&
            values.qkvProjections.length > 0
          ) {
            // Step 1: Show Q/K/V values flowing from embeddings to QKV
            const tokenIdx = Math.floor(
              Math.random() * embeddingTensors.length
            );
            if (
              values.qkvProjections[0] &&
              values.qkvProjections[0].Q[tokenIdx]
            ) {
              const value = values.qkvProjections[0].Q[tokenIdx][0];
              const startPos = embeddingTensors[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.4, 0, 0));
              const endPos = qkvTensors[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.6, 0, 0));
              const sprite = createValueSprite(value, startPos, "#00ffff");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[1]++;
            }
          } else if (
            currentAnimStep === 2 &&
            values.qkvProjections &&
            values.qkvProjections.length > 0
          ) {
            // Step 2: Show QKV values flowing to attention heads
            const tokenIdx = Math.floor(Math.random() * qkvTensors.length);
            if (
              values.qkvProjections[0] &&
              values.qkvProjections[0].K[tokenIdx]
            ) {
              const value = values.qkvProjections[0].K[tokenIdx][0];
              const startPos = qkvTensors[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.6, 0, 0));
              const headIdx = Math.min(tokenIdx, attentionHeads.length - 1);
              const endPos = attentionHeads[headIdx].position
                .clone()
                .add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#ff00ff");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[2]++;
            }
          } else if (currentAnimStep === 3 && values.attentionOutputs) {
            // Step 3: Show attention output values
            const tokenIdx = Math.floor(
              Math.random() * attentionOutputs.length
            );
            if (values.attentionOutputs[tokenIdx]) {
              const value = values.attentionOutputs[tokenIdx][0];
              const headIdx = Math.min(tokenIdx, attentionHeads.length - 1);
              const startPos = attentionHeads[headIdx].position
                .clone()
                .add(new THREE.Vector3(0.4, 0, 0));
              const endPos = attentionOutputs[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#ff8800");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[3]++;
            }
          } else if (currentAnimStep === 4 && values.attentionOutputs) {
            // Step 4: Show values flowing from attention to FFN
            const tokenIdx = Math.floor(
              Math.random() * attentionOutputs.length
            );
            if (values.attentionOutputs[tokenIdx]) {
              const value = values.attentionOutputs[tokenIdx][0];
              const startPos = attentionOutputs[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.4, 0, 0));
              const endPos = ffnBlocks[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.6, 0, 0));
              const sprite = createValueSprite(value, startPos, "#f59e0b");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[4]++;
            }
          } else if (currentAnimStep === 5 && values.ffnOutputs) {
            // Step 5: Show FFN output values flowing to Layer Norm
            const tokenIdx = Math.floor(Math.random() * layerNormBlocks.length);
            if (values.ffnOutputs[tokenIdx]) {
              const value = values.ffnOutputs[tokenIdx][0];
              const startPos = ffnBlocks[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.6, 0, 0));
              const endPos = layerNormBlocks[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.3, 0, 0));
              const sprite = createValueSprite(value, startPos, "#10b981");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[5]++;
            }
          } else if (currentAnimStep === 6 && values.ffnOutputs) {
            // Step 6: Show Layer Norm output values flowing to Output tensors
            const tokenIdx = Math.floor(Math.random() * outputTensors.length);
            if (values.ffnOutputs[tokenIdx]) {
              const value = values.ffnOutputs[tokenIdx][0];
              const startPos = layerNormBlocks[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(0.3, 0, 0));
              const endPos = outputTensors[tokenIdx].position
                .clone()
                .add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#8b5cf6");
              sprite.userData.endPos = endPos;
              particleSpawnCounts[6]++;
            }
          }
        }

        // Animate value flow sprites
        valueFlowSprites.forEach((sprite) => {
          if (sprite.userData.endPos) {
            const startPos = new THREE.Vector3().copy(
              sprite.userData.startPos || sprite.position
            );
            animateValueFlow(sprite, startPos, sprite.userData.endPos, time);
          }
        });

        // Animate data flow lines - horizontal flow with smooth transitions
        dataFlowLines.forEach((line, idx) => {
          const mat = line.material as THREE.LineBasicMaterial;
          const linesPerStage = numTokens;
          const lineStage = Math.floor(idx / linesPerStage);

          // Initialize userData for smooth animation
          if (mat.userData.targetOpacity === undefined) {
            mat.userData.targetOpacity = 0;
            mat.userData.currentOpacity = mat.opacity || 0;
            mat.userData.prevStep = -1;
          }

          // Determine target opacity based on current step
          // Map data flow stages to animation steps:
          // lineStage 0: tokens→embeddings (step 0)
          // lineStage 1: embeddings→qkv (step 1)
          // lineStage 2: qkv→attention (step 2)
          // lineStage 3: attention→attention_out (step 3)
          // lineStage 4: attention_out→ffn (step 4)
          // lineStage 5: ffn→layernorm (step 5)
          // lineStage 6: layernorm→output (step 6)
          // lineStage 7: output→softmax (step 7)
          let targetOpacity = 0;

          // After prediction is complete, fade out all lines (unless auto-continue is enabled)
          if (hasCompletedPrediction && !context.autoContinue) {
            targetOpacity = 0;
          } else if (lineStage === currentAnimStep) {
            // Active stage: animate with flowing effect
            const offset = (time * 2 + idx * 0.2) % 1;
            targetOpacity = 0.45 + Math.sin(offset * Math.PI * 2) * 0.35;
          } else if (lineStage < currentAnimStep) {
            // Previous stages: dim but visible
            targetOpacity = 0.12;
          } else {
            // Future stages: invisible
            targetOpacity = 0;
          }

          // Faster lerp when stage changes, slower for animations
          const lerpSpeed =
            mat.userData.prevStep !== currentAnimStep ? 0.25 : 0.18;
          mat.userData.prevStep = currentAnimStep;

          // Smooth lerp to target opacity
          mat.userData.currentOpacity =
            mat.userData.currentOpacity +
            (targetOpacity - mat.userData.currentOpacity) * lerpSpeed;

          mat.opacity = Math.max(0, Math.min(1, mat.userData.currentOpacity));
        });

        // Animate predicted token - only show at step 7 (softmax)
        if (predictedToken) {
          const sphere = predictedToken.children[0] as THREE.Mesh;
          const mat = sphere.material as THREE.MeshStandardMaterial;
          const glow = predictedToken.children[1] as THREE.Mesh;
          const glowMat = glow.material as THREE.MeshBasicMaterial;

          if (currentAnimStep === 7) {
            // Show and pulse brightly during softmax/prediction step
            predictedToken.visible = true;
            mat.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.4;
            glowMat.opacity = 0.3 + Math.sin(time * 4) * 0.2;

            // Gentle rotation
            predictedToken.rotation.z = time * 0.5;

            // Float side to side
            sphere.position.x = Math.sin(time * 2) * 0.15;

            // Update prediction from context - use top prediction from softmax
            const topToken =
              context.intermediateValues.topPredictions?.[0]?.token ||
              context.predictedToken;
            if (topToken !== currentPrediction) {
              currentPrediction = topToken;

              // Update label (reuse existing canvas and texture)
              const sprite = predictedToken.children[2] as THREE.Sprite;

              // Safety check: ensure userData exists and has required properties
              if (
                sprite &&
                sprite.userData &&
                sprite.userData.ctx &&
                sprite.userData.canvas &&
                sprite.userData.texture
              ) {
                const ctx = sprite.userData.ctx as CanvasRenderingContext2D;
                const canvas = sprite.userData.canvas as HTMLCanvasElement;
                const texture = sprite.userData.texture as THREE.CanvasTexture;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.roundRect(20, 60, 472, 136, 20);
                ctx.fill();

                ctx.fillStyle = "#fbbf24";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("NEXT:", 256, 100);

                ctx.fillStyle = "#10b981"; // Green for selected token
                ctx.font = "bold 72px Arial";
                ctx.fillText(currentPrediction, 256, 160);

                // Add probability if available
                const topProb =
                  context.intermediateValues.topPredictions?.[0]?.prob;
                if (topProb) {
                  ctx.fillStyle = "#60a5fa";
                  ctx.font = "bold 32px Arial";
                  ctx.fillText(`${(topProb * 100).toFixed(1)}%`, 256, 210);
                }

                texture.needsUpdate = true;
              }
            }
          } else {
            // Hide prediction token when not at step 7
            predictedToken.visible = false;
            mat.emissiveIntensity = 0.4;
            glowMat.opacity = 0.15;
          }
        }

        // Animate prediction arrows - only show at step 7 (softmax/prediction)
        predictionArrows.forEach((arrow, idx) => {
          const mat = arrow.material as THREE.LineBasicMaterial;

          if (currentAnimStep === 7) {
            // Flowing animation towards prediction
            const flow = (time * 3 + idx * 0.3) % 1;
            mat.opacity = 0.3 + Math.sin(flow * Math.PI * 2) * 0.4;
          } else {
            mat.opacity = 0;
          }
        });

        // Animate particles around prediction - only show at step 7 (softmax)
        if (currentAnimStep === 7) {
          predictionParticles.rotation.z = time * 0.5;
          const positions = predictionParticles.geometry.attributes.position
            .array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const idx = i * 3 + 1;
            positions[idx] = yOffset + Math.sin(time * 2 + i * 0.5) * 0.3;
          }
          predictionParticles.geometry.attributes.position.needsUpdate = true;
          predictionParticleMaterial.opacity = 0.6 + Math.sin(time * 3) * 0.3;
        } else {
          predictionParticleMaterial.opacity = 0; // Completely hide when not at step 7
        }
      }

      // Camera follow mode - smoothly move camera to focus on current step
      if (context.cameraFollowMode && cameraTargets[currentAnimStep]) {
        const target = cameraTargets[currentAnimStep];

        // Determine lerp factor based on mode:
        // - Step-by-step: Fast (0.25) for immediate response
        // - Auto-continue: Medium (0.08) for smooth following during generation
        // - Normal play: Slow (0.05) for gentle transitions
        let lerpFactor = 0.05;
        if (context.stepByStep) {
          lerpFactor = 0.25;
        } else if (context.autoContinue) {
          lerpFactor = 0.08; // Smoother camera follow during auto-generation
        }

        controls.target.lerp(target, lerpFactor);

        // Move camera position to maintain good viewing angle
        const cameraOffset = new THREE.Vector3(0, 0, 25);
        const desiredCameraPos = target.clone().add(cameraOffset);
        camera.position.lerp(desiredCameraPos, lerpFactor);
      }

      // Hide stage labels when zoomed in close (when network appears bigger)
      // Camera distance < 20 means zoomed in close
      const cameraDistance = camera.position.length();
      const labelsVisible = cameraDistance > 30; // Show labels when far away
      stageLabels.forEach((label) => {
        label.visible = labelsVisible;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate(0);

    // Resize handler
    const handleResize = () => {
      if (!context.mountRef.current) return;
      camera.aspect =
        context.mountRef.current.clientWidth /
        context.mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        context.mountRef.current.clientWidth,
        context.mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);

      // Cancel any pending AI fetch
      if (currentFetchController) {
        currentFetchController.abort();
      }

      // Remove hover info div
      if (hoverInfoDiv && document.body.contains(hoverInfoDiv)) {
        document.body.removeChild(hoverInfoDiv);
      }

      // Remove pulse animation style
      const styleEl = document.getElementById("hover-pulse-animation");
      if (styleEl) {
        styleEl.remove();
      }

      cancelAnimationFrame(animationId);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
        if (object instanceof THREE.Sprite) {
          (object.material as THREE.SpriteMaterial).map?.dispose();
          object.material?.dispose();

          // Return canvas to pool if it was pooled
          if (object.userData.canvas) {
            returnCanvasToPool(object.userData.canvas);
          }
        }
      });

      // Clear canvas cache
      canvasCache.forEach((texture) => texture.dispose());
      canvasCache.clear();

      // Clear canvas pool
      canvasPool.length = 0;

      renderer.dispose();
      controls.dispose();

      if (context.mountRef.current?.contains(renderer.domElement)) {
        context.mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [context]);

  return context;
};

// Manual Controls Component - Shows all manual control options
function ManualControls() {
  const {
    speed,
    setSpeed,
    cameraFollowMode,
    toggleCameraFollow,
    maxTokens,
    setMaxTokens,
    manualMode,
    setManualMode,
    autoContinue,
    setAutoContinue,
    predictedToken,
    computePrediction,
    inputText,
    setInputText,
    setComputePrediction,
    setCurrentStep,
    generatedTokenCount,
    setGeneratedTokenCount,
    isPlaying,
    togglePlay,
  } = useTransformerSimulation();

  const handleContinue = () => {
    if (computePrediction && predictedToken && predictedToken !== "..." && generatedTokenCount < maxTokens) {
      const newText = inputText + predictedToken;
      setInputText(newText);
      setGeneratedTokenCount(generatedTokenCount + 1);
      setComputePrediction(false);
      setCurrentStep(0);
    }
  };

  const handleAutoContinueToggle = () => {
    const newAutoContinue = !autoContinue;
    setAutoContinue(newAutoContinue);
    
    // If enabling auto-continue, ensure simulation is playing
    if (newAutoContinue && !isPlaying) {
      togglePlay();
    }
  };

  return (
    <DraggableCard
      initialPosition={{ x: 20, y: 80 }}
      initialSize={{ width: 280, height: "auto" }}
      minSize={{ width: 240, height: 180 }}
      maxSize={{ width: 380, height: 600 }}
    >
      <CardContent className="px-3 py-3 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Manual Controls
          </h3>
        </div>

        <div className="h-px bg-linear-to-r from-blue-500/50 via-purple-500/50 to-transparent" />

        {/* Simulation Play/Pause Control */}
        <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 hover:bg-zinc-800/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-colors",
                  isPlaying ? "text-green-400" : "text-zinc-500"
                )}
              >
                {isPlaying ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </>
                ) : (
                  <polygon points="5 3 19 12 5 21 5 3" />
                )}
              </svg>
              <span className="text-xs font-medium text-zinc-200">
                Simulation
              </span>
            </div>
            <button
              onClick={togglePlay}
              className={cn(
                "relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200",
                isPlaying ? "bg-green-600" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-200",
                  isPlaying ? "translate-x-4" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Camera Follow Toggle */}
        <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 hover:bg-zinc-800/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-colors",
                  cameraFollowMode ? "text-green-400" : "text-zinc-500"
                )}
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs font-medium text-zinc-200">
                Camera Follow
              </span>
            </div>
            <button
              onClick={() => toggleCameraFollow()}
              className={cn(
                "relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200",
                cameraFollowMode ? "bg-green-600" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-200",
                  cameraFollowMode ? "translate-x-4" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Animation Speed Control */}
        <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 space-y-1.5 hover:bg-zinc-800/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-400"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-xs font-medium text-zinc-200">
                Speed
              </span>
            </div>
            <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
              {speed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setSpeed(Math.max(0.1, speed - 0.1))}
              size="sm"
              variant="outline"
              className="h-6 w-6 px-0 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600 text-xs"
              disabled={speed <= 0.1}
            >
              -
            </Button>
            <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${(speed / 3) * 100}%` }}
              />
            </div>
            <Button
              onClick={() => setSpeed(Math.min(3.0, speed + 0.1))}
              size="sm"
              variant="outline"
              className="h-6 w-6 px-0 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600 text-xs"
              disabled={speed >= 3.0}
            >
              +
            </Button>
          </div>
        </div>

        {/* Max Tokens Control */}
        <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 space-y-1.5 hover:bg-zinc-800/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
              </svg>
              <span className="text-xs font-medium text-zinc-200">
                Max Tokens
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
              {generatedTokenCount}/{maxTokens}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setMaxTokens(Math.max(1, maxTokens - 1))}
              size="sm"
              variant="outline"
              className="h-6 w-6 px-0 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600 text-xs"
              disabled={maxTokens <= 1}
            >
              -
            </Button>
            <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${(maxTokens / 50) * 100}%` }}
              />
            </div>
            <Button
              onClick={() => setMaxTokens(Math.min(50, maxTokens + 1))}
              size="sm"
              variant="outline"
              className="h-6 w-6 px-0 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600 text-xs"
              disabled={maxTokens >= 50}
            >
              +
            </Button>
          </div>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Generation Mode Toggles */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Generation Mode
          </h4>

          {/* Auto-Generate Toggle */}
          <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 hover:bg-zinc-800/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-colors",
                    autoContinue ? "text-green-400" : "text-zinc-500"
                  )}
                >
                  <path d="M12 2v4" />
                  <path d="m16.2 7.8 2.9-2.9" />
                  <path d="M18 12h4" />
                  <path d="m16.2 16.2 2.9 2.9" />
                  <path d="M12 18v4" />
                  <path d="m4.9 19.1 2.9-2.9" />
                  <path d="M2 12h4" />
                  <path d="m4.9 4.9 2.9 2.9" />
                </svg>
                <span className="text-xs font-medium text-zinc-200">
                  Auto-Generate
                </span>
              </div>
              <button
                onClick={handleAutoContinueToggle}
                className={cn(
                  "relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200",
                  autoContinue ? "bg-green-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-200",
                    autoContinue ? "translate-x-4" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Manual Mode Toggle */}
          <div className="bg-zinc-800/60 rounded-lg px-2.5 py-2 hover:bg-zinc-800/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-colors",
                    manualMode ? "text-blue-400" : "text-zinc-500"
                  )}
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span className="text-xs font-medium text-zinc-200">
                  Token Viz Mode
                </span>
              </div>
              <button
                onClick={() => setManualMode(!manualMode)}
                className={cn(
                  "relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200",
                  manualMode ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-200",
                    manualMode ? "translate-x-4" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Single Token Generation Button */}
        {!autoContinue && (
          <>
            <div className="h-px bg-zinc-800" />
            <div>
              <Button
                onClick={handleContinue}
                disabled={!predictedToken || predictedToken === "..." || generatedTokenCount >= maxTokens}
                size="sm"
                className={cn(
                  "w-full h-7 text-xs font-medium transition-all",
                  predictedToken && predictedToken !== "..." && generatedTokenCount < maxTokens
                    ? "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/20"
                    : "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed"
                )}
                title={generatedTokenCount >= maxTokens ? `Maximum tokens (${maxTokens}) reached` : "Generate one token at a time"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Generate Next Token
              </Button>
              {generatedTokenCount >= maxTokens && (
                <p className="text-[10px] text-amber-400 mt-1.5 text-center">
                  Maximum tokens reached ({generatedTokenCount}/{maxTokens})
                </p>
              )}
            </div>
          </>
        )}

        {/* Status Info */}
        <div className="bg-linear-to-r from-zinc-800/60 to-zinc-800/30 rounded-lg px-2.5 py-1.5">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            {autoContinue ? (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                Auto-generation active
              </span>
            ) : manualMode ? (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full" />
                Token visualization enabled
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                Manual control mode
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </DraggableCard>
  );
}

export function ModelInfo() {
  const {
    transformerModel,
    predictedToken,
    aiMode,
    computePrediction,
    inputText,
    setInputText,
    setComputePrediction,
    setCurrentStep,
    speed,
    setSpeed,
    cameraFollowMode,
    toggleCameraFollow,
    generatedTokenCount,
    setGeneratedTokenCount,
    autoContinue,
    setAutoContinue,
    manualMode,
    setManualMode,
    maxTokens,
    setMaxTokens,
  } = useTransformerSimulation();

  if (aiMode) return null;

  const handleContinue = () => {
    if (computePrediction && predictedToken && predictedToken !== "..." && generatedTokenCount < maxTokens) {
      // Append predicted token to input text
      const newText = inputText + predictedToken;
      setInputText(newText);

      // Increment counter
      setGeneratedTokenCount(generatedTokenCount + 1);

      // Reset prediction state to trigger new prediction
      setComputePrediction(false);

      // Jump back to step 0 to restart the animation
      setCurrentStep(0);
    }
  };

  const config = transformerModel?.config;
  const totalParams = config
    ? config.vocabSize * config.embeddingDim + // Token embeddings
      config.maxSeqLength * config.embeddingDim + // Position embeddings
      config.numLayers *
        (3 * config.embeddingDim * config.embeddingDim + // Q, K, V projections
          config.embeddingDim * config.embeddingDim + // Output projection
          config.embeddingDim * config.ffnHiddenDim + // FFN layer 1
          config.ffnHiddenDim * config.embeddingDim) + // FFN layer 2
      config.embeddingDim * config.vocabSize // Output projection
    : 0;

  return (
    <DraggableCard
      initialPosition={{ x: 1520, y: 50 }}
      initialSize={{ width: 300, height: "auto" }}
      minSize={{ width: 260, height: 150 }}
      maxSize={{ width: 500, height: 500 }}
    >
      <CardContent className="px-3 py-3 space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="16" height="16" x="4" y="4" rx="2" />
              <rect width="6" height="6" x="9" y="9" rx="1" />
              <path d="M15 2v2" />
              <path d="M15 20v2" />
              <path d="M2 15h2" />
              <path d="M2 9h2" />
              <path d="M20 15h2" />
              <path d="M20 9h2" />
              <path d="M9 2v2" />
              <path d="M9 20v2" />
            </svg>
            Model Architecture
          </h3>
          <div className="bg-zinc-800/60 rounded-md px-2.5 py-1.5 space-y-0.5 text-[10px] font-mono">
            <div className="flex justify-between text-zinc-300">
              <span>Parameters:</span>
              <span className="text-cyan-400">
                {totalParams.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Layers:</span>
              <span className="text-cyan-400">{config?.numLayers}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Heads:</span>
              <span className="text-cyan-400">{config?.numHeads}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Embedding Dim:</span>
              <span className="text-cyan-400">{config?.embeddingDim}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Vocab Size:</span>
              <span className="text-cyan-400">{config?.vocabSize}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800" />

        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            Predicted Next Token
            {!computePrediction && (
              <span className="text-[10px] text-zinc-500">(waiting...)</span>
            )}
          </h3>
          <div
            className={cn(
              "border rounded-md px-2.5 py-2 transition-all duration-300",
              computePrediction
                ? "bg-linear-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30"
                : "bg-zinc-800/60 border-zinc-700"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400">Token:</span>
                <span
                  className={cn(
                    "text-base font-bold",
                    computePrediction ? "text-amber-400" : "text-zinc-600"
                  )}
                >
                  {computePrediction ? predictedToken : "..."}
                </span>
              </div>

              {computePrediction &&
                predictedToken !== "..." &&
                !autoContinue && (
                  <Button
                    onClick={handleContinue}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500 h-6 px-2 text-[10px]"
                    title="Continue generating: add predicted token to input"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Continue
                  </Button>
                )}
            </div>
          </div>

          {/* Auto-Generation Toggle */}
          <div className="flex items-center justify-between bg-zinc-800/60 rounded-md px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-colors",
                  autoContinue ? "text-green-400" : "text-zinc-500"
                )}
              >
                <path d="M12 2v4" />
                <path d="m16.2 7.8 2.9-2.9" />
                <path d="M18 12h4" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="M12 18v4" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="M2 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
              </svg>
              <span className="text-[10px] font-medium text-zinc-300">
                Auto-Generate
              </span>
            </div>
            <Button
              onClick={() => setAutoContinue(!autoContinue)}
              size="sm"
              variant={autoContinue ? "default" : "outline"}
              className={cn(
                "h-5 px-1.5 text-[10px] transition-all",
                autoContinue
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
              )}
            >
              {autoContinue ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Manual Mode Toggle */}
          <div className="flex items-center justify-between bg-zinc-800/60 rounded-md px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-colors",
                  manualMode ? "text-blue-400" : "text-zinc-500"
                )}
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span className="text-[10px] font-medium text-zinc-300">
                Manual Mode
              </span>
            </div>
            <Button
              onClick={() => setManualMode(!manualMode)}
              size="sm"
              variant={manualMode ? "default" : "outline"}
              className={cn(
                "h-5 px-1.5 text-[10px] transition-all",
                manualMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
              )}
            >
              {manualMode ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Camera Follow Toggle */}
          <div className="flex items-center justify-between bg-zinc-800/60 rounded-md px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-colors",
                  cameraFollowMode ? "text-green-400" : "text-zinc-500"
                )}
              >
                <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1.586a1 1 0 0 1 .707.293l.707.707A1 1 0 0 0 13.414 11H15a2 2 0 0 1 2 2v1.172a2 2 0 0 1-.586 1.414l-.707.707A1 1 0 0 0 15.414 17H17a2 2 0 0 1 2 2v2" />
                <path d="M3 3l18 18" />
                <circle cx="9" cy="9" r="2" />
              </svg>
              <span className="text-[10px] font-medium text-zinc-300">
                Camera Follow
              </span>
            </div>
            <Button
              onClick={() => toggleCameraFollow()}
              size="sm"
              variant={cameraFollowMode ? "default" : "outline"}
              className={cn(
                "h-5 px-1.5 text-[10px] transition-all",
                cameraFollowMode
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                  : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
              )}
            >
              {cameraFollowMode ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Animation Speed Control */}
          <div className="bg-zinc-800/60 rounded-md px-2.5 py-1.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-400"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span className="text-[10px] font-medium text-zinc-300">
                  Speed
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">{speed.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setSpeed(Math.max(0.1, speed - 0.1))}
                size="sm"
                variant="outline"
                className="h-5 px-1.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
                disabled={speed <= 0.1}
              >
                -
              </Button>
              <div className="flex-1 bg-zinc-700 rounded h-1.5">
                <div
                  className="bg-orange-500 h-1.5 rounded transition-all duration-200"
                  style={{ width: `${(speed / 3) * 100}%` }}
                />
              </div>
              <Button
                onClick={() => setSpeed(Math.min(3.0, speed + 0.1))}
                size="sm"
                variant="outline"
                className="h-5 px-1.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
                disabled={speed >= 3.0}
              >
                +
              </Button>
            </div>
          </div>

          {/* Max Tokens Control */}
          <div className="bg-zinc-800/60 rounded-md px-2.5 py-1.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-400"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                <span className="text-[10px] font-medium text-zinc-300">
                  Max Tokens
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">{maxTokens}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setMaxTokens(Math.max(1, maxTokens - 1))}
                size="sm"
                variant="outline"
                className="h-5 px-1.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
                disabled={maxTokens <= 1}
              >
                -
              </Button>
              <div className="flex-1 bg-zinc-700 rounded h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded transition-all duration-200"
                  style={{ width: `${(maxTokens / 50) * 100}%` }}
                />
              </div>
              <Button
                onClick={() => setMaxTokens(Math.min(50, maxTokens + 1))}
                size="sm"
                variant="outline"
                className="h-5 px-1.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border-zinc-600"
                disabled={maxTokens >= 50}
              >
                +
              </Button>
            </div>
          </div>

          {/* Single Token Generation */}
          <div className="bg-zinc-800/60 rounded-md px-2.5 py-1.5">
            <Button
              onClick={() => {
                if (predictedToken && predictedToken !== "..." && !autoContinue && generatedTokenCount < maxTokens) {
                  handleContinue();
                }
              }}
              disabled={!predictedToken || predictedToken === "..." || autoContinue || generatedTokenCount >= maxTokens}
              size="sm"
              className={cn(
                "w-full h-6 text-[10px] transition-all",
                predictedToken && predictedToken !== "..." && !autoContinue && generatedTokenCount < maxTokens
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-500"
                  : "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed"
              )}
              title={generatedTokenCount >= maxTokens ? `Maximum tokens (${maxTokens}) reached` : "Generate one token at a time"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Generate Next Token {generatedTokenCount >= maxTokens && `(${generatedTokenCount}/${maxTokens})`}
            </Button>
          </div>

          <p className="text-[10px] text-zinc-500 italic">
            {generatedTokenCount >= maxTokens ? (
              `Maximum tokens reached (${generatedTokenCount}/${maxTokens}). Reset to generate more.`
            ) : manualMode ? (
              "Manual mode: No AI explanations, detailed token visualization"
            ) : autoContinue ? (
              "Auto-generation enabled - tokens will generate continuously"
            ) : computePrediction ? (
              "Click Continue to add predicted token to input and generate more"
            ) : (
              "Prediction runs after simulation completes (Step 6)"
            )}
          </p>
        </div>
      </CardContent>
    </DraggableCard>
  );
}

export default function TransformerSimulation() {
  const {
    mountRef,
    aiMode,
    autoContinue,
    inputText,
    isPlaying,
    manualMode,
    tokenizedInput,
    toggleAIMode,
  } = useTransformerSimulation();

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Scene Canvas */}
      <div ref={mountRef} className="w-full h-full bg-zinc-900" />

      {/* Generation Display - Shows input and generated text during auto-generation or manual mode - ONLY in manual mode, not AI mode */}
      {!aiMode && ((autoContinue && isPlaying) || manualMode) ? (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-6xl w-full px-4">
          <div className="bg-linear-to-r from-zinc-900/95 to-zinc-800/95 backdrop-blur-md rounded-xl border border-zinc-700/50 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">
                  {manualMode
                    ? "Manual Mode - Token Visualization"
                    : "Auto-Generating"}
                </span>
              </div>
              <div className="flex-1 h-px bg-linear-to-r from-green-500/50 to-transparent"></div>
            </div>

            <div className="space-y-4">
              {manualMode ? (
                <>
                  {/* Token Series Display */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Token Sequence ({tokenizedInput.length} tokens)
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/50">
                      <div className="flex flex-wrap gap-2">
                        {tokenizedInput.map((token, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1 p-2 bg-zinc-800/50 rounded-md border border-zinc-700/30 min-w-[60px]"
                          >
                            <span className="text-xs font-mono text-zinc-300 text-center">
                              {token.token}
                            </span>
                            <span className="text-xs text-zinc-500">
                              ID: {token.id}
                            </span>
                            <span className="text-xs text-zinc-500">
                              GPT: {token.gptId}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Current Input Text */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Current Text
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/50">
                      <p className="text-base font-mono text-zinc-100 leading-relaxed wrap-break-word">
                        {inputText || "No input text"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Auto-generation Display */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Generated Text
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/50">
                      <p className="text-base font-mono text-zinc-100 leading-relaxed wrap-break-word">
                        {inputText || "Starting generation..."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>
                {manualMode
                  ? "Visualizing how the transformer processes tokens step by step"
                  : "Watching the transformer generate token by token"}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-zinc-500 rounded-full animate-pulse"></span>
                <span className="inline-block w-1 h-1 bg-zinc-500 rounded-full animate-pulse delay-75"></span>
                <span className="inline-block w-1 h-1 bg-zinc-500 rounded-full animate-pulse delay-150"></span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* AI Mode Toggle - Simple Switch */}
      <div className="absolute top-6 right-6 z-50">
        <div className="bg-zinc-900/95 backdrop-blur-md rounded-lg border border-zinc-700/50 shadow-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-300">
              AI Tutor Mode
            </span>
            <button
              onClick={toggleAIMode}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
                aiMode ? "bg-purple-600" : "bg-zinc-700"
              )}
              role="switch"
              aria-checked={aiMode}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300",
                  aiMode ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "transition-colors",
                aiMode ? "text-purple-400" : "text-zinc-500"
              )}
            >
              <path d="M12 2a2 2 0 0 0-2 2c0 .74.4 1.39 1 1.73V7a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v.73a2 2 0 1 0 2 0V10a3 3 0 0 0-3-3h-2a1 1 0 0 1-1-1V5.73A2 2 0 1 0 12 2Z" />
              <path d="M10 16a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Manual Controls - Only show when AI mode is OFF */}
      {!aiMode && <ManualControls />}

      {aiMode && <SimpleAITutor />}
    </div>
  );
}
