"use client";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import DraggableCard from "../atomic/draggable-card";
import Image from "next/image";
import { set } from "@elevenlabs/elevenlabs-js/core/schemas";
import { Bot, User } from "lucide-react";

type ElectricFieldSimulationContext = {
  // Define any state or methods you want to expose via context
  isPlaying: boolean;
  togglePlay: () => void;

  charge1: { position: THREE.Vector3; magnitude: number };
  charge2: { position: THREE.Vector3; magnitude: number };

  setCharge1: (charge: { position: THREE.Vector3; magnitude: number }) => void;
  setCharge2: (charge: { position: THREE.Vector3; magnitude: number }) => void;

  fieldDensity: number;
  setFieldDensity: (density: number) => void;
  showFieldDensity: boolean;
  toggleFieldDensity: () => void;

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

  showFieldLines: boolean;
  toggleFieldLines: () => void;
};

export const electricFieldSimulationContext =
  React.createContext<ElectricFieldSimulationContext | null>(null);

export const ElectricFieldSimulationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [charge1, setCharge1] = useState<{
    position: THREE.Vector3;
    magnitude: number;
  }>({ position: new THREE.Vector3(), magnitude: 1 });
  const [charge2, setCharge2] = useState<{
    position: THREE.Vector3;
    magnitude: number;
  }>({ position: new THREE.Vector3(), magnitude: 1 });
  const [fieldDensity, setFieldDensity] = useState(1);
  const [showFieldDensity, setShowFieldDensity] = useState(true);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleFieldDensity = () => setShowFieldDensity(!showFieldDensity);

  const mountRef = useRef<HTMLDivElement | null>(null);

  const [aiMode, setAIMode] = useState(true);
  const toggleAIMode = () => setAIMode(!aiMode);
  const [stateOfSimulation, setStateOfSimulation] = useState<{
    aiModeState: unknown | null;
    manualModeState: unknown | null;
  }>({
    aiModeState: null,
    manualModeState: null,
  });
  const [showFieldLines, setShowFieldLines] = useState(true);
  const toggleFieldLines = () => setShowFieldLines(!showFieldLines);
  return (
    <electricFieldSimulationContext.Provider
      value={{
        isPlaying,
        togglePlay,
        charge1,
        charge2,
        setCharge1,
        setCharge2,
        fieldDensity,
        setFieldDensity,
        showFieldDensity,
        toggleFieldDensity,
        mountRef,
        stateOfSimulation,
        aiMode,
        toggleAIMode,
        setStateOfSimulation,
        showFieldLines,
        toggleFieldLines,
      }}
    >
      {children}
    </electricFieldSimulationContext.Provider>
  );
};

export const useElectricFieldSimulation = () => {
  const context = React.useContext(electricFieldSimulationContext);
  const currentState = context?.aiMode
    ? context.stateOfSimulation.aiModeState
    : context?.stateOfSimulation.manualModeState;
  if (!context) {
    throw new Error(
      "useElectricFieldSimulation must be used within a ElectricFieldSimulationProvider"
    );
  }
  useEffect(() => {
    if (!context) return;
    if (!context.mountRef.current) return; // return if ref is not set

    // scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717);
    scene.fog = new THREE.Fog(0x171717, 15, 30);

    const camera = new THREE.PerspectiveCamera(
      75,
      context.mountRef.current.clientWidth /
        context.mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
    renderer.setSize(
      context.mountRef.current.clientWidth,
      context.mountRef.current.clientHeight
    );
    context.mountRef.current.appendChild(renderer.domElement);

    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // Enable frustum culling for better performance
    camera.matrixAutoUpdate = true;

    // lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x4444ff, 0.5);
    rimLight.position.set(-10, 5, -10);
    scene.add(rimLight);

    // ground plane
    const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // constants - use refs for reactive values
    const q1Ref = { current: context.charge1.magnitude };
    const q2Ref = { current: context.charge2.magnitude };

    const pos1 = context.charge1.position;
    const pos2 = context.charge2.position;

    // create charges
    const chargeObjects: THREE.Mesh[] = [];

    // Shared geometries for better performance
    const sharedSphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const sharedGlowGeometry = new THREE.SphereGeometry(0.6, 32, 32);

    function createCharge(
      position: THREE.Vector3,
      color: number,
      magnitude: number
    ) {
      // Main Sphere - use shared geometry
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.3,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const sphere = new THREE.Mesh(sharedSphereGeometry, material);
      sphere.position.copy(position);
      scene.add(sphere);
      chargeObjects.push(sphere);

      // Glow effect - use shared geometry
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(sharedGlowGeometry, glowMaterial);
      glow.position.copy(position);
      scene.add(glow);

      // Label
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 128;
      canvas.height = 128;
      context.fillStyle = magnitude > 0 ? "#ff4444" : "#4444ff";
      context.font = "bold 80px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(magnitude > 0 ? "+" : "-", 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.position.y += 1;
      sprite.scale.set(1, 1, 1);
      scene.add(sprite);

      return { sphere, glow, sprite };
    }

    const charge1Obj = createCharge(pos1, 0xff3333, q1Ref.current);
    const charge2Obj = createCharge(pos2, 0x3333ff, q2Ref.current);

    // === Electric Field Function ===
    function electricFieldAtPoint(point: THREE.Vector3) {
      const r1 = new THREE.Vector3().subVectors(point, pos1);
      const r2 = new THREE.Vector3().subVectors(point, pos2);

      const dist1 = r1.length();
      const dist2 = r2.length();

      // Prevent division by zero near charges
      if (dist1 < 0.5 || dist2 < 0.5) return new THREE.Vector3(0, 0, 0);

      const e1 = r1
        .clone()
        .normalize()
        .multiplyScalar(q1Ref.current / (dist1 * dist1));
      const e2 = r2
        .clone()
        .normalize()
        .multiplyScalar(q2Ref.current / (dist2 * dist2));
      return e1.add(e2);
    }

    // === Draw Field Vectors with Instanced Rendering ===
    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);

    // Reusable geometry and material for better performance
    const arrowGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

    let instancedArrows: THREE.InstancedMesh | null = null;
    let arrowCount = 0;

    function updateFieldVectors() {
      // Clear existing arrows
      if (instancedArrows) {
        arrowGroup.remove(instancedArrows);
        instancedArrows.geometry.dispose();
        (instancedArrows.material as THREE.Material).dispose();
        instancedArrows = null;
      }

      if (!context?.showFieldLines) return;

      const spacing = 1.2 / context.fieldDensity;
      const range = 8;

      // Pre-calculate arrow positions and properties
      const arrows: Array<{
        position: THREE.Vector3;
        direction: THREE.Vector3;
        length: number;
        color: THREE.Color;
      }> = [];

      for (let x = -range; x <= range; x += spacing) {
        for (let y = -range; y <= range; y += spacing) {
          for (let z = -range; z <= range; z += spacing) {
            const point = new THREE.Vector3(x, y, z);
            const E = electricFieldAtPoint(point);
            const mag = E.length();

            if (mag < 0.02 || mag > 3) continue;

            const dir = E.clone().normalize();

            // Color based on field strength
            const colorValue = Math.min(mag / 2, 1);
            const color = new THREE.Color().setHSL(
              0.6 - colorValue * 0.6,
              1,
              0.5
            );

            const arrowLength = Math.min(mag * 0.3, 0.8);
            arrows.push({
              position: point,
              direction: dir,
              length: arrowLength,
              color,
            });
          }
        }
      }

      arrowCount = arrows.length;

      if (arrowCount === 0) return;

      // Use instanced mesh for better performance
      const coneGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
      const lineMaterial = new THREE.MeshBasicMaterial();
      instancedArrows = new THREE.InstancedMesh(
        coneGeometry,
        lineMaterial,
        arrowCount
      );

      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);

      arrows.forEach((arrow, i) => {
        // Set position and rotation
        quaternion.setFromUnitVectors(up, arrow.direction);
        matrix.compose(
          arrow.position
            .clone()
            .add(arrow.direction.clone().multiplyScalar(arrow.length / 2)),
          quaternion,
          new THREE.Vector3(1, arrow.length / 0.15, 1)
        );
        instancedArrows!.setMatrixAt(i, matrix);
        instancedArrows!.setColorAt(i, arrow.color);
      });

      instancedArrows.instanceMatrix.needsUpdate = true;
      if (instancedArrows.instanceColor) {
        instancedArrows.instanceColor.needsUpdate = true;
      }

      arrowGroup.add(instancedArrows);
    }

    updateFieldVectors();

    // === Test Charge (moves with mouse) ===
    const testChargeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const testChargeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const testCharge = new THREE.Mesh(testChargeGeometry, testChargeMaterial);
    testCharge.position.set(0, 2, 0);
    scene.add(testCharge);

    // Force vector on test charge
    const forceArrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      testCharge.position,
      1,
      0xff00ff,
      0.3,
      0.2
    );
    scene.add(forceArrowHelper);

    // Function to update charge visuals when magnitude changes
    function updateChargeVisuals() {
      // Update charge colors and labels based on magnitude
      const charge1Color = q1Ref.current > 0 ? 0xff3333 : 0x3333ff;
      const charge2Color = q2Ref.current > 0 ? 0xff3333 : 0x3333ff;

      (charge1Obj.sphere.material as THREE.MeshPhysicalMaterial).color.setHex(
        charge1Color
      );
      (
        charge1Obj.sphere.material as THREE.MeshPhysicalMaterial
      ).emissive.setHex(charge1Color);
      (charge1Obj.glow.material as THREE.MeshBasicMaterial).color.setHex(
        charge1Color
      );

      (charge2Obj.sphere.material as THREE.MeshPhysicalMaterial).color.setHex(
        charge2Color
      );
      (
        charge2Obj.sphere.material as THREE.MeshPhysicalMaterial
      ).emissive.setHex(charge2Color);
      (charge2Obj.glow.material as THREE.MeshBasicMaterial).color.setHex(
        charge2Color
      );

      // Update labels
      const updateLabel = (
        sprite: THREE.Sprite,
        magnitude: number,
        color: string
      ) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = 128;
        canvas.height = 128;
        ctx.fillStyle = color;
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(magnitude > 0 ? "+" : "-", 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        (sprite.material as THREE.SpriteMaterial).map = texture;
        (sprite.material as THREE.SpriteMaterial).needsUpdate = true;
      };

      updateLabel(
        charge1Obj.sprite,
        q1Ref.current,
        q1Ref.current > 0 ? "#ff4444" : "#4444ff"
      );
      updateLabel(
        charge2Obj.sprite,
        q2Ref.current,
        q2Ref.current > 0 ? "#ff4444" : "#4444ff"
      );
    }

    // === Animate ===
    let time = 0;
    let animationId: number;
    let prevFieldDensity = context.fieldDensity;
    let prevShowFieldLines = context.showFieldLines;
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 60; // 60 FPS cap

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Throttle updates to maintain consistent frame rate
      const deltaTime = currentTime - lastUpdateTime;
      if (deltaTime < updateInterval) {
        return;
      }
      lastUpdateTime = currentTime - (deltaTime % updateInterval);

      // Update magnitude refs from context
      const newQ1 = context.charge1.magnitude;
      const newQ2 = context.charge2.magnitude;
      const fieldDensityChanged = prevFieldDensity !== context.fieldDensity;
      const fieldLinesVisibilityChanged =
        prevShowFieldLines !== context.showFieldLines;

      const needsFieldUpdate =
        q1Ref.current !== newQ1 ||
        q2Ref.current !== newQ2 ||
        fieldDensityChanged ||
        fieldLinesVisibilityChanged;

      if (needsFieldUpdate) {
        q1Ref.current = newQ1;
        q2Ref.current = newQ2;
        prevFieldDensity = context.fieldDensity;
        prevShowFieldLines = context.showFieldLines;

        if (q1Ref.current !== newQ1 || q2Ref.current !== newQ2) {
          updateChargeVisuals();
        }
        updateFieldVectors();
      }

      if (context.isPlaying) {
        time += 0.01;

        // Animate charges slightly
        chargeObjects.forEach((obj, i) => {
          obj.position.y = Math.sin(time + i * Math.PI) * 0.1;
        });

        // Animate test charge in a circle
        const radius = 5;
        testCharge.position.x = Math.cos(time * 0.5) * radius;
        testCharge.position.z = Math.sin(time * 0.5) * radius;
        testCharge.position.y = 1;

        // Update force arrow
        const force = electricFieldAtPoint(testCharge.position);
        if (force.length() > 0.01) {
          forceArrowHelper.position.copy(testCharge.position);
          forceArrowHelper.setDirection(force.clone().normalize());
          forceArrowHelper.setLength(Math.min(force.length() * 2, 3));
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate(0);

    // === Resize Handler ===
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

    // === Cleanup ===
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      // Dispose of shared geometries
      sharedSphereGeometry.dispose();
      sharedGlowGeometry.dispose();

      // Dispose of instanced arrows
      if (instancedArrows) {
        instancedArrows.geometry.dispose();
        (instancedArrows.material as THREE.Material).dispose();
      }

      // Dispose of geometries and materials
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

      // Remove renderer from DOM
      if (context.mountRef.current?.contains(renderer.domElement)) {
        context.mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [context]);
  return context;
};

export function ManualControls() {
  const {
    charge1,
    charge2,
    setCharge1,
    setCharge2,
    fieldDensity,
    setFieldDensity,
    aiMode,
  } = useElectricFieldSimulation();

  // Don't show manual controls when in AI mode
  if (aiMode) return null;

  return (
    <DraggableCard
      initialPosition={{ x: 20, y: 50 }}
      initialSize={{ width: 340, height: "auto" }}
      minSize={{ width: 280, height: 200 }}
      maxSize={{ width: 500, height: 700 }}
    >
      <CardContent className="px-4 py-4 space-y-5">
        {/* Charge 1 Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Charge 1</h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
              {charge1.magnitude > 0 ? "+" : ""}
              {charge1.magnitude.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Magnitude</label>
            <input
              type="number"
              step="0.1"
              value={charge1.magnitude}
              onChange={(e) =>
                setCharge1({
                  ...charge1,
                  magnitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Charge 2 Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Charge 2</h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
              {charge2.magnitude > 0 ? "+" : ""}
              {charge2.magnitude.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Magnitude</label>
            <input
              type="number"
              step="0.1"
              value={charge2.magnitude}
              onChange={(e) =>
                setCharge2({
                  ...charge2,
                  magnitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Field Density Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">
              Field Density
            </h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
              {fieldDensity.toFixed(1)}x
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={fieldDensity}
              onChange={(e) => setFieldDensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800/60 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, rgb(82 82 91) 0%, rgb(82 82 91) ${
                  ((fieldDensity - 0.1) / (5 - 0.1)) * 100
                }%, rgb(39 39 42) ${
                  ((fieldDensity - 0.1) / (5 - 0.1)) * 100
                }%, rgb(39 39 42) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0.1</span>
              <span>5.0</span>
            </div>
          </div>
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
  const { aiMode } = useElectricFieldSimulation();
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

      // Auto-play
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
        // Start exit animation
        setIsVisible(false);
        // Remove from DOM after animation completes
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

  // Trigger enter animation after component is rendered
  useEffect(() => {
    if (!isLoading && aiMode && shouldRender) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto-hide after audio finishes or after 10 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 500);
      }, 10000); // 10 seconds display time
      
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, aiMode, shouldRender]);

  // Listen to audio end event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => {
      // Wait 2 seconds after audio ends, then hide
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
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
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

export default function ElectricFieldSimulation() {
  const {
    isPlaying,
    togglePlay,
    charge1,
    charge2,
    setCharge1,
    setCharge2,
    fieldDensity,
    setFieldDensity,
    showFieldDensity,
    toggleFieldDensity,
    mountRef,
    aiMode,
    toggleAIMode,
  } = useElectricFieldSimulation();
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Scene Canvas*/}
      <div ref={mountRef} className="w-full h-full bg-zinc-900" />
      
      {/* AI/Manual Mode Toggle */}
      <div className="absolute bottom-4 left-4 z-50">
        <button
          onClick={toggleAIMode}
          className={cn(
            "relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-200",
            aiMode ? "bg-purple-600" : "bg-zinc-700"
          )}
          aria-label={aiMode ? "Switch to Manual Mode" : "Switch to AI Mode"}
        >
          {/* Toggle Circle */}
          <span
            className={cn(
              "h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 flex items-center justify-center cursor-pointer",
              aiMode ? "translate-x-9" : "translate-x-1"
            )}
          >
            {aiMode ? (
              <Bot className="w-3.5 h-3.5 text-purple-600" />
            ) : (
              <User className="w-3.5 h-3.5 text-zinc-700" />
            )}
          </span>
        </button>
      </div>

      <ManualControls />
      <AIExplanation
        text="This is an AI-generated explanation."
        position={{ x: 600, y: 700 }}
      />
    </div>
  );
}
