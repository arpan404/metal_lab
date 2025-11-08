"use client";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import DraggableCard from "../atomic/draggable-card";
import Image from "next/image";
import { TinyTransformer, createPretrainedModel, tokenize, VOCABULARY } from "@/lib/tiny-transformer";

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
  setTokenizedInput: React.Dispatch<React.SetStateAction<Array<{ token: string; id: number; gptId: number }>>>;
  
  computePrediction: boolean;
  setComputePrediction: (value: boolean) => void;
  
  autoContinue: boolean;
  setAutoContinue: (value: boolean) => void;
  
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  
  generatedTokenCount: number;
  setGeneratedTokenCount: (value: number) => void;
  
  intermediateValues: {
    embeddings: number[][] | null;
    qkvProjections: { Q: number[][]; K: number[][]; V: number[][] }[] | null;
    attentionOutputs: number[][] | null;
    ffnOutputs: number[][] | null;
    finalLogits: number[] | null;
    probabilities: number[] | null;
    topPredictions: Array<{ token: string; prob: number; id: number }> | null;
  };
  setIntermediateValues: React.Dispatch<React.SetStateAction<{
    embeddings: number[][] | null;
    qkvProjections: { Q: number[][]; K: number[][]; V: number[][] }[] | null;
    attentionOutputs: number[][] | null;
    ffnOutputs: number[][] | null;
    finalLogits: number[] | null;
    probabilities: number[] | null;
    topPredictions: Array<{ token: string; prob: number; id: number }> | null;
  }>>;
};

export const transformerSimulationContext =
  React.createContext<TransformerSimulationContext | null>(null);

export const TransformerSimulationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [inputText, setInputText] = useState("The cat");
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(0.5);
  const [showAttentionWeights, setShowAttentionWeights] = useState(true);
  const [cameraFollowMode, setCameraFollowMode] = useState(true);
  const [stepByStep, setStepByStep] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [aiMode, setAIMode] = useState(false);
  const [predictedToken, setPredictedToken] = useState("sits");
  const [tokenizedInput, setTokenizedInput] = useState<Array<{ token: string; id: number; gptId: number }>>([]);
  const [computePrediction, setComputePrediction] = useState(false);
  const [autoContinue, setAutoContinue] = useState(false);
  const [maxTokens, setMaxTokens] = useState(10);
  const [generatedTokenCount, setGeneratedTokenCount] = useState(0);
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
  const [transformerModel, setTransformerModel] = useState<TinyTransformer | null>(null);
  
  useEffect(() => {
    // Lazy load the model after component mounts
    const timer = setTimeout(() => {
      if (!transformerModel) {
        setTransformerModel(createPretrainedModel());
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [transformerModel]);  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleAttentionWeights = () => setShowAttentionWeights(!showAttentionWeights);
  const toggleAIMode = () => setAIMode(!aiMode);
  const toggleCameraFollow = () => setCameraFollowMode(!cameraFollowMode);
  const toggleStepByStep = () => {
    setStepByStep(!stepByStep);
    if (!stepByStep) {
      setIsPlaying(false);
    }
  };
  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % 7);
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
      
      context.setTokenizedInput(limitedOriginal.map((t, idx) => ({
        token: t.text,
        id: limitedTokens[idx],
        gptId: t.gptId
      })));
      
      // Reset prediction when input changes
      context.setPredictedToken("...");
      context.setComputePrediction(false);
    } catch (error) {
      console.error("Tokenization error:", error);
    }
  }, [context?.inputText]);

  // Effect to compute prediction when simulation reaches the end (step 6)
  useEffect(() => {
    if (!context?.transformerModel || !context?.computePrediction) return;
    if (context.tokenizedInput.length === 0) return;

    try {
      const tokenIds = context.tokenizedInput.map(t => t.id);
      const result = context.transformerModel.forward(tokenIds);
      context.setPredictedToken(result.predictedGptToken);
      
      // Store intermediate values for visualization
      const model = context.transformerModel;
      
      // Get top 5 predictions
      const topK = 5;
      const probsWithIds = result.probabilities.map((p, i) => ({ prob: p, id: i }));
      probsWithIds.sort((a, b) => b.prob - a.prob);
      const topPredictions = probsWithIds.slice(0, topK).map(({ prob, id }) => ({
        token: VOCABULARY[id] || `[${id}]`,
        prob,
        id
      }));
      
      context.setIntermediateValues({
        embeddings: model.embeddings?.data || null,
        qkvProjections: model.qkvProjections.map(qkv => ({
          Q: qkv.Q.data,
          K: qkv.K.data,
          V: qkv.V.data
        })),
        attentionOutputs: model.layerOutputs[0]?.data || null,
        ffnOutputs: model.layerOutputs[model.layerOutputs.length - 1]?.data || null,
        finalLogits: result.softmaxStage.beforeSoftmax,
        probabilities: result.probabilities,
        topPredictions
      });
      
      console.log("Prediction computed:", {
        input: context.tokenizedInput,
        prediction: result.predictedGptToken,
        tokenId: result.predictedTokenId,
        probability: result.probabilities[result.predictedTokenId],
        topPredictions
      });
      
      // Auto-continue if enabled and under max tokens
      if (context.autoContinue && 
          context.generatedTokenCount < context.maxTokens &&
          result.predictedGptToken &&
          result.predictedGptToken !== "..." &&
          result.predictedGptToken !== "<|endoftext|>") {
        
        // Wait a moment for the animation, then continue
        setTimeout(() => {
          const newText = context.inputText + result.predictedGptToken;
          context.setInputText(newText);
          context.setGeneratedTokenCount(context.generatedTokenCount + 1);
          context.setComputePrediction(false);
          context.setCurrentStep(0);
        }, 2500); // 2.5 second delay to show the softmax animation
      }
    } catch (error) {
      console.error("Model prediction error:", error);
    }
  }, [context?.computePrediction, context?.transformerModel, context?.tokenizedInput]);

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

    // Tokenize input using simple vocabulary mapping
    const vocabulary = [
      "the", "cat", "dog", "sits", "runs", "on", "mat", "is", "a", "walks",
      "jumps", "sleeps", "eats", "big", "small", "red", "blue", "quick", "lazy", "brown",
      "fox", "bird", "tree", "house", "fast", "slow", "happy", "sad", "good", "bad",
      "over", "under", "near", "far", "up", "down", "left", "right", "here", "there",
      "now", "then", "when", "where", "why", "how", "who", "what", "which", "meows"
    ];
    
    let tokens = context.inputText.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    tokens = tokens.slice(0, 5); // Limit to 5 tokens
    
    // Map tokens to IDs
    let tokenIds = tokens.map(token => {
      const idx = vocabulary.indexOf(token);
      return idx >= 0 ? idx : 0; // Default to "the" if unknown
    });
    
    // Run transformer model to get prediction
    let modelPrediction = "sits";
    if (context.transformerModel && tokenIds.length > 0) {
      try {
        const result = context.transformerModel.forward(tokenIds);
        modelPrediction = result.predictedToken;
        context.setPredictedToken(modelPrediction);
      } catch (error) {
        console.error("Model forward pass error:", error);
      }
    }
    
    const numTokens = tokens.length || 1;
    const embeddingDim = 512;
    const numHeads = 8;

    // Layout configuration - HORIZONTAL
    const tokenObjects: THREE.Group[] = [];
    const tokenSpacing = 2.5;
    const startY = -(numTokens - 1) * tokenSpacing / 2;
    const stageXPositions = {
      tokens: -18,
      embeddings: -12,
      qkv: -6,
      attention: 0,
      ffn: 6,
      layerNorm: 12,
      output: 18,
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
    let currentPrediction = modelPrediction;

    // Helper function to create stage labels
    function createStageLabel(text: string, position: THREE.Vector3) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      canvas.width = 128;
      canvas.height = 32;
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.font = 'bold 14px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 64, 16);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(3, 0.75, 1);
      return sprite;
    }

    // Shared geometries and materials for better performance
    const sharedSphereGeometry = new THREE.SphereGeometry(0.3, 8, 8); // Further reduced
    const sharedBoxGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.3);
    
    // Create input tokens as text labels
    function createToken(text: string, position: THREE.Vector3, index: number) {
      const group = new THREE.Group();
      
      // Token sphere (use shared geometry)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(index / Math.max(numTokens, 1), 0.7, 0.6),
        metalness: 0.3,
        roughness: 0.2,
        emissive: new THREE.Color().setHSL(index / Math.max(numTokens, 1), 0.7, 0.3),
        emissiveIntensity: 0.4,
      });
      const sphere = new THREE.Mesh(sharedSphereGeometry, material);
      group.add(sphere);

      // Label
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 128;
      canvas.height = 64;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 64, 32);

      const texture = new THREE.CanvasTexture(canvas);
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
      const labels = ['Q', 'K', 'V'];
      
      // Shared geometry for all QKV tensors
      const qkvGeometry = new THREE.BoxGeometry(tensorWidth, tensorHeight, 0.08);
      
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
        mesh.position.x = (i - 1) * spacing;
        
        // Add label
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = 64;
        canvas.height = 64;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labels[i], 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
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
          cell.position.set((i - 1.5) * 0.37, (j - 1.5) * 0.37, 0.03);
          group.add(cell);
        }
      }
      
      group.position.copy(position);
      scene.add(group);
      return group;
    }

    // Create Feed-Forward Network block
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
      mesh.position.copy(position);
      
      // Add label
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 128;
      canvas.height = 64;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FFN", 64, 32);

      const texture = new THREE.CanvasTexture(canvas);
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
      mesh.position.copy(position);
      scene.add(mesh);
      return mesh;
    }

    // Create all layers - HORIZONTAL LAYOUT
    const yOffset = 0;

    // Create stage labels
    const labelY = yOffset + 7;
    const labels = [
      { text: 'Input', x: stageXPositions.tokens },
      { text: 'Embeddings', x: stageXPositions.embeddings },
      { text: 'Q/K/V', x: stageXPositions.qkv },
      { text: 'Attention', x: stageXPositions.attention },
      { text: 'FFN', x: stageXPositions.ffn },
      { text: 'Layer Norm', x: stageXPositions.layerNorm },
      { text: 'Output', x: stageXPositions.output },
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
      const embeddingPos = new THREE.Vector3(stageXPositions.embeddings, tokenY, 0);
      const embedding = createEmbeddingTensor(embeddingPos, i);
      embeddingTensors.push(embedding);

      // Stage 3: QKV projections
      const qkvPos = new THREE.Vector3(stageXPositions.qkv, tokenY, 0);
      const qkvGroup = createQKVGroup(qkvPos, i);
      qkvTensors.push(qkvGroup);
      
      // Stage 4: Attention outputs
      const attentionPos = new THREE.Vector3(stageXPositions.attention, tokenY, 0);
      const attentionOutput = createAttentionOutput(attentionPos);
      attentionOutputs.push(attentionOutput);
      
      // Stage 5: FFN blocks
      const ffnPos = new THREE.Vector3(stageXPositions.ffn, tokenY, 0);
      const ffn = createFFNBlock(ffnPos, i);
      ffnBlocks.push(ffn);
      
      // Stage 6: Layer Normalization
      const layerNormPos = new THREE.Vector3(stageXPositions.layerNorm, tokenY, 0);
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
    }    // Create predicted next token at the top
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
    // Place prediction at the far right, centered vertically
    const predictionX = stageXPositions.output + 6;
    predictedToken = createPredictedToken(currentPrediction, new THREE.Vector3(predictionX, yOffset, 0));
    
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
        side: THREE.DoubleSide
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      softmaxPanel.add(panel);
      
      // Title
      const titleCanvas = document.createElement("canvas");
      const titleCtx = titleCanvas.getContext("2d")!;
      titleCanvas.width = 256;
      titleCanvas.height = 64;
      titleCtx.fillStyle = "#60a5fa";
      titleCtx.font = "bold 28px Arial";
      titleCtx.textAlign = "center";
      titleCtx.fillText("Softmax Probabilities", 128, 40);
      
      const titleTexture = new THREE.CanvasTexture(titleCanvas);
      const titleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: titleTexture, transparent: true }));
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
          new THREE.MeshBasicMaterial({ color: 0x2a2a3e, transparent: true, opacity: 0.5 })
        );
        bgBar.position.set(1.5, 0, 0);
        barGroup.add(bgBar);
        
        // Animated probability bar
        const probBar = new THREE.Mesh(
          new THREE.PlaneGeometry(0.01, 0.5),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        probBar.position.set(0.005, 0, 0.01);
        probBar.userData.isBar = true;
        barGroup.add(probBar);
        
        // Label sprite (token + percentage)
        const labelCanvas = document.createElement("canvas");
        const labelCtx = labelCanvas.getContext("2d")!;
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        labelCtx.fillStyle = "#ffffff";
        labelCtx.font = "20px Arial";
        labelCtx.fillText("...", 10, 40);
        
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true }));
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
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const predictionParticleMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const predictionParticles = new THREE.Points(particleGeometry, predictionParticleMaterial);
    scene.add(predictionParticles);

    // Add arrows from FFN to prediction
    const predictionArrows: THREE.Line[] = [];
    for (let i = 0; i < numTokens; i++) {
      const points = [
        ffnBlocks[i].position.clone().add(new THREE.Vector3(0, 1.25, 0)),
        predictedToken.position.clone().add(new THREE.Vector3(0, -1.2, 0))
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

      // Lines from tokens to embeddings (stage 0->1)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          tokenObjects[i].position.clone().add(new THREE.Vector3(0.5, 0, 0)),
          embeddingTensors[i].position.clone().add(new THREE.Vector3(-0.4, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from embeddings to QKV (stage 1->2)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          embeddingTensors[i].position.clone().add(new THREE.Vector3(0.4, 0, 0)),
          qkvTensors[i].position.clone().add(new THREE.Vector3(-0.6, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from QKV to attention heads (stage 2->3)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          qkvTensors[i].position.clone().add(new THREE.Vector3(0.6, 0, 0)),
          attentionHeads[Math.min(i, attentionHeads.length - 1)].position.clone().add(new THREE.Vector3(-0.4, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from attention heads to attention outputs (stage 3->3b)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          attentionHeads[Math.min(i, attentionHeads.length - 1)].position.clone().add(new THREE.Vector3(0.4, 0, 0)),
          attentionOutputs[i].position.clone().add(new THREE.Vector3(-0.4, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from attention outputs to FFN (stage 3->4)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          attentionOutputs[i].position.clone().add(new THREE.Vector3(0.4, 0, 0)),
          ffnBlocks[i].position.clone().add(new THREE.Vector3(-0.6, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from FFN to Layer Norm (stage 4->5)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          ffnBlocks[i].position.clone().add(new THREE.Vector3(0.6, 0, 0)),
          layerNormBlocks[i].position.clone().add(new THREE.Vector3(-0.3, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from Layer Norm to Output (stage 5->6)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          layerNormBlocks[i].position.clone().add(new THREE.Vector3(0.3, 0, 0)),
          outputTensors[i].position.clone().add(new THREE.Vector3(-0.4, 0, 0))
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        scene.add(line);
        dataFlowLines.push(line);
      }

      // Lines from outputs to prediction (stage 6->prediction)
      for (let i = 0; i < numTokens; i++) {
        const points = [
          outputTensors[i].position.clone().add(new THREE.Vector3(0.4, 0, 0)),
          predictedToken!.position.clone().add(new THREE.Vector3(-1.5, startY + i * tokenSpacing, 0))
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
    
    function createValueSprite(value: number, position: THREE.Vector3, color: string = "#60a5fa"): THREE.Sprite {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 128;
      canvas.height = 64;
      
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
      const displayValue = Math.abs(value) < 0.01 ? value.toExponential(2) : value.toFixed(3);
      ctx.fillText(displayValue, 64, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
      sprite.position.copy(position);
      sprite.scale.set(1, 0.5, 1);
      sprite.userData.startTime = time;
      sprite.userData.duration = 1.0; // 1 second to flow
      sprite.userData.startPos = position.clone(); // Store start position
      
      scene.add(sprite);
      valueFlowSprites.push(sprite);
      return sprite;
    }
    
    function animateValueFlow(sprite: THREE.Sprite, startPos: THREE.Vector3, endPos: THREE.Vector3, currentTime: number) {
      const elapsed = currentTime - sprite.userData.startTime;
      const progress = Math.min(elapsed / sprite.userData.duration, 1);
      
      // Smooth easing
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      sprite.position.lerpVectors(startPos, endPos, easedProgress);
      sprite.material.opacity = Math.sin(progress * Math.PI); // Fade in and out
      
      if (progress >= 1) {
        scene.remove(sprite);
        const index = valueFlowSprites.indexOf(sprite);
        if (index > -1) valueFlowSprites.splice(index, 1);
      }
    }

    // Animation state
    let time = 0;
    let animationId: number;
    let stepProgress = 0;
    const stepsPerToken = 7; // Input -> Embedding -> QKV -> Attention -> FFN -> Layer Norm -> Output
    
    // Animation step tracking
    let currentAnimStep = context.currentStep;
    const maxSteps = stepsPerToken;
    
    // Camera follow targets for each step
    const cameraTargets = [
      new THREE.Vector3(stageXPositions.tokens, yOffset, 0),      // Step 0: Input tokens
      new THREE.Vector3(stageXPositions.embeddings, yOffset, 0),  // Step 1: Embeddings
      new THREE.Vector3(stageXPositions.qkv, yOffset, 0),         // Step 2: QKV
      new THREE.Vector3(stageXPositions.attention, yOffset, 0),   // Step 3: Attention
      new THREE.Vector3(stageXPositions.ffn, yOffset, 0),         // Step 4: FFN
      new THREE.Vector3(stageXPositions.layerNorm, yOffset, 0),   // Step 5: Layer Norm
      new THREE.Vector3(stageXPositions.output, yOffset, 0),      // Step 6: Output
    ];

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Throttle time updates for better performance
      const deltaTime = Math.min((currentTime - (animate as any).lastTime || 0) / 1000, 0.1);
      (animate as any).lastTime = currentTime;

      // Update current step from context (for step-by-step mode)
      if (context.stepByStep) {
        currentAnimStep = context.currentStep;
        stepProgress = 0;
      } else if (context.isPlaying) {
        time += deltaTime * context.speed * 2;
        stepProgress += deltaTime * context.speed * 0.3;

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
      {

      // Step 0: Input tokens (highlight original tokens)
        const isStep0Active = currentAnimStep === 0;
        tokenObjects.forEach((group, i) => {
          const sphere = group.children[0] as THREE.Mesh;
          const baseMat = sphere.material as THREE.MeshStandardMaterial;
          
          if (isStep0Active) {
            const pulse = 0.6 + Math.sin(time * 3 + i) * 0.3;
            if (Math.abs(baseMat.emissiveIntensity - pulse) > 0.01) {
              baseMat.emissiveIntensity = pulse;
            }
            const scale = 1 + Math.sin(time * 3 + i) * 0.1;
            group.scale.setScalar(scale);
          } else {
            if (baseMat.emissiveIntensity !== 0.4) baseMat.emissiveIntensity = 0.4;
            if (group.scale.x !== 1) group.scale.setScalar(1);
          }
        });

        // Step 1: Embedding tensors
        const isStep1Active = currentAnimStep === 1;
        embeddingTensors.forEach((tensor, i) => {
          const mat = tensor.material as THREE.MeshStandardMaterial;
          
          if (isStep1Active) {
            mat.emissiveIntensity = 0.4 + Math.sin(time * 4 + i * 0.5) * 0.4;
            tensor.rotation.y = time * 0.5;
          } else {
            if (mat.emissiveIntensity !== 0.2) mat.emissiveIntensity = 0.2;
            tensor.rotation.y += 0.005;
          }
        });

        // Step 2: QKV projections
        qkvTensors.forEach((group, i) => {
          group.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              const mat = child.material as THREE.MeshStandardMaterial;
              
              if (currentAnimStep === 2) {
                mat.emissiveIntensity = 0.6 + Math.sin(time * 3 + i) * 0.3;
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
          
          head.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.geometry.type.includes("Box")) {
              const mat = child.material as THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial;
              
              if (currentAnimStep === 3) {
                if ('emissiveIntensity' in mat) {
                  mat.emissiveIntensity = 0.7 + Math.sin(time * 5) * 0.3;
                }
                mat.opacity = 0.8 + Math.sin(time * 3 + i) * 0.2;
              } else {
                if ('emissiveIntensity' in mat) {
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
            mat.emissiveIntensity = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;
          } else {
            mat.emissiveIntensity = 0.3;
          }
        });

        // Step 4: FFN blocks
        ffnBlocks.forEach((block, i) => {
          const mat = block.material as THREE.MeshStandardMaterial;
          
          if (currentAnimStep === 4) {
            mat.emissiveIntensity = 0.5 + Math.sin(time * 4 + i * 0.7) * 0.4;
            block.rotation.y = Math.sin(time + i) * 0.2;
          } else {
            mat.emissiveIntensity = 0.3;
            block.rotation.y *= 0.95;
          }
        });

        // Step 5: Layer Normalization
        layerNormBlocks.forEach((block, i) => {
          const mat = block.material as THREE.MeshStandardMaterial;
          
          if (currentAnimStep === 5) {
            mat.emissiveIntensity = 0.6 + Math.sin(time * 5 + i * 0.6) * 0.4;
            block.scale.setScalar(1 + Math.sin(time * 4 + i) * 0.1);
          } else {
            mat.emissiveIntensity = 0.4;
            block.scale.setScalar(1);
          }
        });

        // Step 6: Output tensors - TRIGGER PREDICTION AND SOFTMAX
        outputTensors.forEach((output, i) => {
          const mat = output.material as THREE.MeshStandardMaterial;
          
          if (currentAnimStep === 6) {
            // Trigger prediction computation when entering step 6
            if (!context.computePrediction) {
              context.setComputePrediction(true);
            }
            
            const activeIdx = Math.floor((time * 0.5) % numTokens);
            mat.emissiveIntensity = i === activeIdx ? 0.9 : 0.4;
            if (i === activeIdx) {
              output.scale.setScalar(1 + Math.sin(time * 5) * 0.15);
            }
            
            // Show softmax panel with probabilities
            softmaxPanel.visible = true;
            
            // Update softmax panel with actual probabilities
            if (context.intermediateValues.topPredictions) {
              const topPreds = context.intermediateValues.topPredictions;
              softmaxPanel.children.forEach((child, idx) => {
                if (idx === 0 || idx === 1) return; // Skip background and title
                
                const barGroup = child as THREE.Group;
                const barIndex = barGroup.userData.index;
                
                if (barIndex < topPreds.length) {
                  const pred = topPreds[barIndex];
                  
                  // Update probability bar
                  const probBar = barGroup.children.find(c => c.userData.isBar) as THREE.Mesh;
                  if (probBar) {
                    const targetWidth = pred.prob * 3; // Max width 3 units
                    const currentWidth = (probBar.geometry as THREE.PlaneGeometry).parameters.width;
                    const newWidth = currentWidth + (targetWidth - currentWidth) * 0.1; // Smooth animation
                    
                    probBar.geometry.dispose();
                    probBar.geometry = new THREE.PlaneGeometry(newWidth, 0.5);
                    probBar.position.set(newWidth / 2, 0, 0.01);
                    
                    // Color based on rank
                    const colors = [0x10b981, 0x3b82f6, 0xf59e0b, 0xef4444, 0x8b5cf6];
                    (probBar.material as THREE.MeshBasicMaterial).color.setHex(colors[barIndex]);
                  }
                  
                  // Update label
                  const labelSprite = barGroup.children.find(c => c.userData.isLabel) as THREE.Sprite;
                  if (labelSprite && labelSprite.userData.ctx) {
                    const ctx = labelSprite.userData.ctx as CanvasRenderingContext2D;
                    const canvas = labelSprite.userData.canvas as HTMLCanvasElement;
                    const texture = labelSprite.userData.texture as THREE.CanvasTexture;
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 20px monospace";
                    ctx.textAlign = "left";
                    ctx.fillText(`${pred.token}`, 10, 40);
                    ctx.fillStyle = "#60a5fa";
                    ctx.textAlign = "right";
                    ctx.fillText(`${(pred.prob * 100).toFixed(1)}%`, 246, 40);
                    texture.needsUpdate = true;
                  }
                }
              });
            }
          } else {
            mat.emissiveIntensity = 0.4;
            output.scale.setScalar(1);
            softmaxPanel.visible = false;
          }
        });
        
        // Spawn value flow sprites based on current step
        if (Math.random() < 0.15 && context.intermediateValues) { // 15% chance per frame
          const values = context.intermediateValues;
          
          if (currentAnimStep === 0 && values.embeddings && tokenObjects.length > 0) {
            // Show embedding values flowing from tokens to embeddings
            const tokenIdx = Math.floor(Math.random() * tokenObjects.length);
            if (values.embeddings[tokenIdx]) {
              const value = values.embeddings[tokenIdx][0]; // First dimension
              const startPos = tokenObjects[tokenIdx].position.clone().add(new THREE.Vector3(0.5, 0, 0));
              const endPos = embeddingTensors[tokenIdx].position.clone().add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#3b82f6");
              sprite.userData.endPos = endPos;
            }
          } else if (currentAnimStep === 1 && values.qkvProjections && values.qkvProjections.length > 0) {
            // Show Q/K/V values flowing from embeddings to QKV
            const tokenIdx = Math.floor(Math.random() * embeddingTensors.length);
            if (values.qkvProjections[0] && values.qkvProjections[0].Q[tokenIdx]) {
              const value = values.qkvProjections[0].Q[tokenIdx][0];
              const startPos = embeddingTensors[tokenIdx].position.clone().add(new THREE.Vector3(0.4, 0, 0));
              const endPos = qkvTensors[tokenIdx].position.clone().add(new THREE.Vector3(-0.6, 0, 0));
              const sprite = createValueSprite(value, startPos, "#00ffff");
              sprite.userData.endPos = endPos;
            }
          } else if (currentAnimStep === 3 && values.attentionOutputs) {
            // Show attention output values
            const tokenIdx = Math.floor(Math.random() * attentionOutputs.length);
            if (values.attentionOutputs[tokenIdx]) {
              const value = values.attentionOutputs[tokenIdx][0];
              const headIdx = Math.min(tokenIdx, attentionHeads.length - 1);
              const startPos = attentionHeads[headIdx].position.clone().add(new THREE.Vector3(0.4, 0, 0));
              const endPos = attentionOutputs[tokenIdx].position.clone().add(new THREE.Vector3(-0.4, 0, 0));
              const sprite = createValueSprite(value, startPos, "#ff8800");
              sprite.userData.endPos = endPos;
            }
          } else if (currentAnimStep === 5 && values.ffnOutputs) {
            // Show FFN output values
            const tokenIdx = Math.floor(Math.random() * layerNormBlocks.length);
            if (values.ffnOutputs[tokenIdx]) {
              const value = values.ffnOutputs[tokenIdx][0];
              const startPos = ffnBlocks[tokenIdx].position.clone().add(new THREE.Vector3(0.6, 0, 0));
              const endPos = layerNormBlocks[tokenIdx].position.clone().add(new THREE.Vector3(-0.3, 0, 0));
              const sprite = createValueSprite(value, startPos, "#10b981");
              sprite.userData.endPos = endPos;
            }
          }
        }
        
        // Animate value flow sprites
        valueFlowSprites.forEach(sprite => {
          if (sprite.userData.endPos) {
            const startPos = new THREE.Vector3().copy(sprite.userData.startPos || sprite.position);
            animateValueFlow(sprite, startPos, sprite.userData.endPos, time);
          }
        });

        // Animate data flow lines - horizontal flow
        dataFlowLines.forEach((line, idx) => {
          const mat = line.material as THREE.LineBasicMaterial;
          const linesPerStage = numTokens;
          const lineStage = Math.floor(idx / linesPerStage);
          
          // Show lines based on current step
          // Stage 0: tokens->embeddings, Stage 1: embeddings->QKV, etc.
          if (lineStage === currentAnimStep) {
            const offset = (time * 2 + idx * 0.2) % 1;
            mat.opacity = 0.4 + Math.sin(offset * Math.PI * 2) * 0.3;
          } else if (lineStage < currentAnimStep) {
            mat.opacity = 0.15;
          } else {
            mat.opacity = 0;
          }
        });

        // Animate predicted token
        if (predictedToken) {
          const sphere = predictedToken.children[0] as THREE.Mesh;
          const mat = sphere.material as THREE.MeshStandardMaterial;
          const glow = predictedToken.children[1] as THREE.Mesh;
          const glowMat = glow.material as THREE.MeshBasicMaterial;

          if (currentAnimStep >= 6) {
            // Pulse brightly during output step
            mat.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.4;
            glowMat.opacity = 0.3 + Math.sin(time * 4) * 0.2;
            
            // Gentle rotation
            predictedToken.rotation.z = time * 0.5;
            
            // Float side to side
            sphere.position.x = Math.sin(time * 2) * 0.15;
            
            // Update prediction from context (live from model)
            if (context.predictedToken !== currentPrediction) {
              currentPrediction = context.predictedToken;
              
              // Update label
              const sprite = predictedToken.children[2] as THREE.Sprite;
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;
              canvas.width = 512;
              canvas.height = 256;
              
              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              ctx.roundRect(20, 60, 472, 136, 20);
              ctx.fill();
              
              ctx.fillStyle = "#fbbf24";
              ctx.font = "bold 40px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("NEXT:", 256, 100);
              
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 72px Arial";
              ctx.fillText(currentPrediction, 256, 160);
              
              const texture = new THREE.CanvasTexture(canvas);
              (sprite.material as THREE.SpriteMaterial).map = texture;
              (sprite.material as THREE.SpriteMaterial).needsUpdate = true;
            }
          } else {
            mat.emissiveIntensity = 0.4;
            glowMat.opacity = 0.15;
          }
        }

        // Animate prediction arrows
        predictionArrows.forEach((arrow, idx) => {
          const mat = arrow.material as THREE.LineBasicMaterial;
          
          if (currentAnimStep === 4) {
            // Flowing animation towards prediction
            const flow = (time * 3 + idx * 0.3) % 1;
            mat.opacity = 0.3 + Math.sin(flow * Math.PI * 2) * 0.4;
          } else {
            mat.opacity = 0;
          }
        });

        // Animate particles around prediction
        if (currentAnimStep >= 6) {
          predictionParticles.rotation.z = time * 0.5;
          const positions = predictionParticles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const idx = i * 3 + 1;
            positions[idx] = yOffset + Math.sin(time * 2 + i * 0.5) * 0.3;
          }
          predictionParticles.geometry.attributes.position.needsUpdate = true;
          predictionParticleMaterial.opacity = 0.6 + Math.sin(time * 3) * 0.3;
        } else {
          predictionParticleMaterial.opacity = 0.2;
        }
      }

      // Camera follow mode - smoothly move camera to focus on current step
      if (context.cameraFollowMode && cameraTargets[currentAnimStep]) {
        const target = cameraTargets[currentAnimStep];
        const currentTarget = controls.target.clone();
        
        // Smooth interpolation
        const lerpFactor = 0.05;
        controls.target.lerp(target, lerpFactor);
        
        // Move camera position to maintain good viewing angle
        const cameraOffset = new THREE.Vector3(0, 0, 25);
        const desiredCameraPos = target.clone().add(cameraOffset);
        camera.position.lerp(desiredCameraPos, lerpFactor * 0.5);
      }

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
        }
      });

      renderer.dispose();
      controls.dispose();

      if (context.mountRef.current?.contains(renderer.domElement)) {
        context.mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [context]);
  
  return context;
};

export function MultiHeadAttentionViz() {
  const {
    transformerModel,
    currentStep,
    aiMode,
  } = useTransformerSimulation();

  if (aiMode || currentStep !== 3) return null;

  const headWeights = transformerModel?.headAttentionWeights;
  if (!headWeights || headWeights.length === 0) return null;

  // Show first layer's attention heads
  const layerHeads = headWeights[0];
  if (!layerHeads || layerHeads.length === 0) return null;

  return (
    <DraggableCard
      initialPosition={{ x: 20, y: 750 }}
      initialSize={{ width: 420, height: "auto" }}
      minSize={{ width: 380, height: 200 }}
      maxSize={{ width: 600, height: 800 }}
    >
      <CardContent className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            Multi-Head Attention (Layer 1)
          </h3>
          <p className="text-xs text-zinc-400">
            Showing {layerHeads.length} attention heads. Each head learns different patterns.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            {layerHeads.map((head, headIdx) => {
              const seqLen = head.rows;
              const maxWeight = 1.0;
              
              return (
                <div key={headIdx} className="space-y-1">
                  <p className="text-[10px] font-mono text-zinc-500">Head {headIdx + 1}</p>
                  <div className="bg-zinc-900/80 rounded p-2">
                    <svg width="100%" height={seqLen * 16} viewBox={`0 0 ${seqLen * 16} ${seqLen * 16}`}>
                      {Array.from({ length: seqLen }).map((_, i) =>
                        Array.from({ length: seqLen }).map((_, j) => {
                          const weight = head.data[i][j];
                          const opacity = Math.max(0, Math.min(1, weight / maxWeight));
                          const color = opacity > 0.5 ? '#ef4444' : '#3b82f6';
                          
                          return (
                            <rect
                              key={`${i}-${j}`}
                              x={j * 16}
                              y={i * 16}
                              width={15}
                              height={15}
                              fill={color}
                              opacity={opacity}
                              rx={2}
                            />
                          );
                        })
                      )}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-700/50">
            <div className="flex items-center gap-1 text-[10px]">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-zinc-400">Low</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-zinc-400">High Attention</span>
            </div>
          </div>
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
    generatedTokenCount,
    setGeneratedTokenCount,
  } = useTransformerSimulation();

  if (aiMode) return null;

  const handleContinue = () => {
    if (computePrediction && predictedToken && predictedToken !== "...") {
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
  const totalParams = config ? (
    config.vocabSize * config.embeddingDim + // Token embeddings
    config.maxSeqLength * config.embeddingDim + // Position embeddings
    config.numLayers * (
      3 * config.embeddingDim * config.embeddingDim + // Q, K, V projections
      config.embeddingDim * config.embeddingDim + // Output projection
      config.embeddingDim * config.ffnHiddenDim + // FFN layer 1
      config.ffnHiddenDim * config.embeddingDim // FFN layer 2
    ) +
    config.embeddingDim * config.vocabSize // Output projection
  ) : 0;

  return (
    <DraggableCard
      initialPosition={{ x: 1520, y: 50 }}
      initialSize={{ width: 360, height: "auto" }}
      minSize={{ width: 300, height: 150 }}
      maxSize={{ width: 500, height: 500 }}
    >
      <CardContent className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="16" x="4" y="4" rx="2"/>
              <rect width="6" height="6" x="9" y="9" rx="1"/>
              <path d="M15 2v2"/>
              <path d="M15 20v2"/>
              <path d="M2 15h2"/>
              <path d="M2 9h2"/>
              <path d="M20 15h2"/>
              <path d="M20 9h2"/>
              <path d="M9 2v2"/>
              <path d="M9 20v2"/>
            </svg>
            Model Architecture
          </h3>
          <div className="bg-zinc-800/60 rounded-md px-3 py-2 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-zinc-300">
              <span>Parameters:</span>
              <span className="text-cyan-400">{totalParams.toLocaleString()}</span>
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

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            Predicted Next Token
            {!computePrediction && (
              <span className="text-xs text-zinc-500">(waiting...)</span>
            )}
          </h3>
          <div className={cn(
            "border rounded-md px-3 py-3 transition-all duration-300",
            computePrediction 
              ? "bg-linear-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30" 
              : "bg-zinc-800/60 border-zinc-700"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Token:</span>
                <span className={cn(
                  "text-lg font-bold",
                  computePrediction ? "text-amber-400" : "text-zinc-600"
                )}>
                  {computePrediction ? predictedToken : "..."}
                </span>
              </div>
              
              {computePrediction && predictedToken !== "..." && (
                <Button
                  onClick={handleContinue}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500 h-7 px-3 text-xs"
                  title="Continue generating: add predicted token to input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  Continue
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic">
            {computePrediction 
              ? "Click Continue to add predicted token to input and generate more" 
              : "Prediction runs after simulation completes (Step 6)"}
          </p>
        </div>
      </CardContent>
    </DraggableCard>
  );
}

export function ManualControls() {
  const {
    inputText,
    setInputText,
    speed,
    setSpeed,
    isPlaying,
    togglePlay,
    currentStep,
    aiMode,
    cameraFollowMode,
    toggleCameraFollow,
    stepByStep,
    toggleStepByStep,
    nextStep,
    autoContinue,
    setAutoContinue,
    maxTokens,
    setMaxTokens,
    generatedTokenCount,
    setGeneratedTokenCount,
    predictedToken,
    setComputePrediction,
    setCurrentStep,
  } = useTransformerSimulation();

  if (aiMode) return null;
  
  const handleContinue = () => {
    if (predictedToken && predictedToken !== "..." && predictedToken !== "<|endoftext|>") {
      const newText = inputText + predictedToken;
      setInputText(newText);
      setGeneratedTokenCount(generatedTokenCount + 1);
      setComputePrediction(false);
      setCurrentStep(0);
    }
  };
  
  const handleAutoContinueToggle = () => {
    setAutoContinue(!autoContinue);
    if (!autoContinue) {
      // Reset counter when enabling
      setGeneratedTokenCount(0);
    }
  };

  const stepNames = [
    "Step 0: Input Tokens - Raw input text tokens",
    "Step 1: Embeddings - Converting tokens to vectors",
    "Step 2: QKV Projection - Query, Key, Value matrices",
    "Step 3: Attention - Computing token relationships",
    "Step 4: Feed-Forward Network - Non-linear transformation",
    "Step 5: Layer Normalization - Stabilizing outputs",
    "Step 6: Output - Final hidden states & prediction",
  ];

  return (
    <DraggableCard
      initialPosition={{ x: 20, y: 50 }}
      initialSize={{ width: 360, height: "auto" }}
      minSize={{ width: 300, height: 200 }}
      maxSize={{ width: 500, height: 700 }}
    >
      <CardContent className="px-4 py-4 space-y-5">
        {/* Input Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Input Text</h3>
            {currentStep === 6 && predictedToken && predictedToken !== "..." && (
              <Button
                onClick={handleContinue}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
              >
                ➕ Continue
              </Button>
            )}
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
            placeholder="Enter text to tokenize..."
          />
          <div className="text-xs text-zinc-500 italic">
            Using custom HF tokenizer (500 tokens)
          </div>
          {currentStep === 6 && predictedToken && predictedToken !== "..." && (
            <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/50 rounded-md px-3 py-2">
              <p className="text-xs text-amber-300">
                Predicted: <span className="font-bold text-amber-100">{predictedToken}</span>
              </p>
              <p className="text-xs text-amber-400/70 mt-1">
                Click "Continue" to append this token
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800" />

        {/* Current Step */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">Current Step</h3>
          <div className="bg-zinc-800/60 rounded-md px-3 py-2">
            <p className="text-sm text-cyan-400 font-mono">
              {stepNames[currentStep]}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800" />

        {/* Playback Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Playback</h3>
            <Button
              onClick={togglePlay}
              size="sm"
              className={cn(
                "transition-all",
                isPlaying
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
          
          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800/60 rounded-lg appearance-none cursor-pointer"
              disabled={stepByStep}
            />
          </div>
        </div>

        <div className="border-t border-zinc-800" />

        {/* Camera & Step Mode */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">View Options</h3>
          
          {/* Camera Follow Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Camera Follow</label>
            <Button
              onClick={toggleCameraFollow}
              size="sm"
              variant={cameraFollowMode ? "default" : "outline"}
              className="h-7 text-xs"
            >
              {cameraFollowMode ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Step-by-Step Mode */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Step-by-Step</label>
            <Button
              onClick={toggleStepByStep}
              size="sm"
              variant={stepByStep ? "default" : "outline"}
              className="h-7 text-xs"
            >
              {stepByStep ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Next Step Button (only visible in step-by-step mode) */}
          {stepByStep && (
            <Button
              onClick={nextStep}
              size="sm"
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              Next Step →
            </Button>
          )}
        </div>

        <div className="border-t border-zinc-800" />

        {/* Auto-Continue Generation */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Auto-Generate
          </h3>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Auto-Continue</label>
            <Button
              onClick={handleAutoContinueToggle}
              size="sm"
              variant={autoContinue ? "default" : "outline"}
              className={cn(
                "h-7 text-xs",
                autoContinue && "bg-amber-600 hover:bg-amber-700"
              )}
            >
              {autoContinue ? "ON" : "OFF"}
            </Button>
          </div>

          {autoContinue && (
            <>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800/60 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="bg-zinc-800/60 rounded-md px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Generated:</span>
                  <span className="text-amber-400 font-mono">
                    {generatedTokenCount} / {maxTokens}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={() => setGeneratedTokenCount(0)}
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs"
              >
                Reset Counter
              </Button>
            </>
          )}
          
          <p className="text-xs text-zinc-500 italic">
            {autoContinue 
              ? "Model will automatically continue generating tokens" 
              : "Enable to automatically append predictions to input"}
          </p>
        </div>
      </CardContent>
    </DraggableCard>
  );
}

export const AIExplanation = ({
  text,
  position,
}: {
  text: string;
  position: { x: number; y: number };
}) => {
  const { aiMode } = useTransformerSimulation();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const generateAudio = async () => {
    if (!text.trim()) {
      return;
    }

    setAudioURL(null);

    try {
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setIsLoading(false);
        console.log("Failed to generate audio");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioURL(url);

      setTimeout(() => {
        audioRef.current?.play().catch((e) => {
          console.log("Auto-play blocked:", e);
        });
      }, 100);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (!aiMode) {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500);
        return;
      }

      setIsLoading(true);
      setShouldRender(true);
      generateAudio();
    } catch (e) {
      console.error("Error generating audio:", e);
    }
  }, [text, aiMode]);

  useEffect(() => {
    if (!isLoading && aiMode && shouldRender) {
      setTimeout(() => setIsVisible(true), 50);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500);
      }, 15000);

      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, aiMode, shouldRender]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500);
      }, 2000);
    };

    audio.addEventListener("ended", handleAudioEnd);
    return () => audio.removeEventListener("ended", handleAudioEnd);
  }, [audioURL]);

  if (!shouldRender) return null;

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
      <div className="relative flex items-start">
        <Image
          src="/mela.webp"
          width={200}
          height={400}
          draggable={false}
          alt="AI Explanation"
          className="rounded-2xl rounded-tr-none object-cover object-top select-none"
          style={{
            transform: isVisible ? "translateX(0)" : "translateX(-30px)",
            opacity: isVisible ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
          }}
        />
        <div
          className="bg-white rounded-2xl rounded-bl-none shadow-lg p-4 max-w-xs -ml-10"
          style={{
            transform: isVisible ? "translateX(0)" : "translateX(30px)",
            opacity: isVisible ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
          }}
        >
          <p className="text-sm text-gray-800">{text}</p>
        </div>
      </div>
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          className="mt-2 w-full"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.4s ease-in-out 0.4s",
          }}
        />
      )}
    </div>
  );
};

export default function TransformerSimulation() {
  const {
    mountRef,
    aiMode,
    toggleAIMode,
  } = useTransformerSimulation();

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Scene Canvas */}
      <div ref={mountRef} className="w-full h-full bg-zinc-900" />

      {/* AI/Manual Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={toggleAIMode}
          variant={aiMode ? "default" : "outline"}
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            aiMode
              ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600"
          )}
        >
          {aiMode ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
              AI Mode
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Manual Mode
            </>
          )}
        </Button>
      </div>

      <ManualControls />
      <MultiHeadAttentionViz />
      {/* <ModelInfo /> */}
      <AIExplanation
        text="Watch a REAL transformer model predict the next token! This uses a custom HuggingFace ByteLevel BPE tokenizer (trained on WikiText-2) with 500-token vocabulary and an actual transformer (~50K parameters) featuring TRUE multi-head attention (4 heads), feed-forward networks, and layer normalization. The model computes attention weights PER HEAD, allowing each head to learn different linguistic patterns! Data flows left-to-right through 7 stages: (1) Input tokens (custom BPE), (2) Embeddings (blue), (3) Q/K/V projections (cyan/magenta/yellow), (4) Multi-head attention (red grids - each head shown separately), (5) FFN (green), (6) Layer Norm (purple), (7) Output. The golden sphere shows the predicted token AFTER softmax!"
        position={{ x: 20, y: 450 }}
      />
    </div>
  );
}
