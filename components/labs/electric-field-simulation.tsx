"use client";
import * as THREE from "three";
import { useEffect, useRef, useState, useCallback } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import DraggableCard from "../atomic/draggable-card";

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
  showFieldLines: boolean;
  toggleFieldLines: () => void;

  // Observations and state tracking for AI chat
  observationLog: string[];
  addObservation: (observation: string) => void;

  // Test charge hover state for tooltip
  testChargeHoverState: { isHovering: boolean; position: { x: number; y: number } };
  updateTestChargeHoverState: (isHovering: boolean, position: { x: number; y: number }) => void;

  // Get current simulation state for AI context
  getSimulationState: () => {
    charge1Magnitude: number;
    charge2Magnitude: number;
    fieldDensity: number;
    showFieldLines: boolean;
    testChargePosition?: THREE.Vector3;
    forceAtTestCharge?: THREE.Vector3;
  };
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

  const [showFieldLines, setShowFieldLines] = useState(true);
  const toggleFieldLines = () => setShowFieldLines(!showFieldLines);

  // Test charge state refs for real-time updates
  const testChargePositionRef = useRef(new THREE.Vector3(0, 2, 0));
  const testChargeVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const testChargeForceRef = useRef(new THREE.Vector3(0, 0, 0));

  // Test charge hover state
  const [testChargeHoverState, setTestChargeHoverState] = useState({
    isHovering: false,
    position: { x: 0, y: 0 },
  });
  
  // Callback to update hover state from useEffect
  const updateTestChargeHoverState = useCallback(
    (isHovering: boolean, position: { x: number; y: number }) => {
      setTestChargeHoverState({ isHovering, position });
    },
    []
  );

  // Observation log for AI chat context
  const [observationLog, setObservationLog] = useState<string[]>([]);
  const addObservation = (observation: string) => {
    setObservationLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${observation}`,
    ]);
  };

  // Get current simulation state for AI
  const getSimulationState = () => ({
    charge1Magnitude: charge1.magnitude,
    charge2Magnitude: charge2.magnitude,
    fieldDensity,
    showFieldLines,
  });

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
        showFieldLines,
        toggleFieldLines,
        observationLog,
        addObservation,
        testChargeHoverState,
        updateTestChargeHoverState,
        getSimulationState,
      }}
    >
      {children}
    </electricFieldSimulationContext.Provider>
  );
};

export const useElectricFieldSimulation = () => {
  const context = React.useContext(electricFieldSimulationContext);
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

    // Test charge state refs for real-time updates
    const testChargePositionRef = { current: new THREE.Vector3(0, 2, 0) };
    const testChargeVelocityRef = { current: new THREE.Vector3(0, 0, 0) };
    const testChargeForceRef = { current: new THREE.Vector3(0, 0, 0) };

    // Test charge hover state ref
    const testChargeHoverStateRef = {
      current: { isHovering: false, position: { x: 0, y: 0 } },
    };

    // Refs for charge magnitudes
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

    // Create a separate invisible mesh for raycasting (no longer used but kept for cleanup)
    const testChargeRaycastGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const testChargeRaycastMaterial = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const testChargeRaycast = new THREE.Mesh(
      testChargeRaycastGeometry,
      testChargeRaycastMaterial
    );
    testCharge.add(testChargeRaycast); // Attach to test charge so it moves with it

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

    // Removed raycaster and mouse interaction since tooltip is always visible

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
    let lastPhysicsUpdateTime = 0;
    const physicsUpdateInterval = 1000 / 10; // 10 FPS for physics state updates to prevent render issues

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Always render the scene regardless of updates
      controls.update();
      renderer.render(scene, camera);

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
        // Log observations when parameters change
        if (q1Ref.current !== newQ1) {
          const sign1 = newQ1 > 0 ? "positive" : "negative";
          context.addObservation(
            `Charge 1 changed to ${newQ1.toFixed(2)} (${sign1})`
          );
        }
        if (q2Ref.current !== newQ2) {
          const sign2 = newQ2 > 0 ? "positive" : "negative";
          context.addObservation(
            `Charge 2 changed to ${newQ2.toFixed(2)} (${sign2})`
          );
        }
        if (fieldDensityChanged) {
          context.addObservation(
            `Field density changed to ${context.fieldDensity.toFixed(1)}x`
          );
        }
        if (fieldLinesVisibilityChanged) {
          context.addObservation(
            `Field lines ${context.showFieldLines ? "shown" : "hidden"}`
          );
        }

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
        const angularSpeed = 0.5;
        const newX = Math.cos(time * angularSpeed) * radius;
        const newZ = Math.sin(time * angularSpeed) * radius;

        testCharge.position.x = newX;
        testCharge.position.z = newZ;
        testCharge.position.y = 1;

        // Calculate velocity (derivative of position)
        const velocity = new THREE.Vector3(
          -Math.sin(time * angularSpeed) * radius * angularSpeed,
          0,
          Math.cos(time * angularSpeed) * radius * angularSpeed
        );

        // Update force arrow
        const force = electricFieldAtPoint(testCharge.position);

        if (force.length() > 0.01) {
          forceArrowHelper.position.copy(testCharge.position);
          forceArrowHelper.setDirection(force.clone().normalize());
          forceArrowHelper.setLength(Math.min(force.length() * 2, 3));
        }
      }
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
      testChargeRaycastGeometry.dispose();

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
    showFieldLines,
    toggleFieldLines,
    isPlaying,
    togglePlay,
  } = useElectricFieldSimulation();

  return (
    <DraggableCard
      initialPosition={{ x: 20, y: 80 }}
      initialSize={{ width: 320, height: "auto" }}
      minSize={{ width: 280, height: 300 }}
      maxSize={{ width: 400, height: 600 }}
      className="bg-black/90 backdrop-blur-sm border-zinc-700 shadow-2xl"
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-sm font-semibold text-white">
            Electric Field Controls
          </h2>
        </div>

        {/* Play/Pause */}
        <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
          <span className="text-sm font-medium text-zinc-200">Simulation</span>
          <button
            onClick={togglePlay}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium transition-all",
              isPlaying
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        {/* Charges in a grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Charge 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200">
                Charge 1
              </label>
              <span
                className={cn(
                  "px-1.5 py-0.5 text-xs font-mono rounded",
                  charge1.magnitude > 0
                    ? "bg-red-500/20 text-red-300"
                    : "bg-blue-500/20 text-blue-300"
                )}
              >
                {charge1.magnitude > 0 ? "+" : ""}
                {charge1.magnitude.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={charge1.magnitude}
              onChange={(e) =>
                setCharge1({
                  ...charge1,
                  magnitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>

          {/* Charge 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200">
                Charge 2
              </label>
              <span
                className={cn(
                  "px-1.5 py-0.5 text-xs font-mono rounded",
                  charge2.magnitude > 0
                    ? "bg-red-500/20 text-red-300"
                    : "bg-blue-500/20 text-blue-300"
                )}
              >
                {charge2.magnitude > 0 ? "+" : ""}
                {charge2.magnitude.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={charge2.magnitude}
              onChange={(e) =>
                setCharge2({
                  ...charge2,
                  magnitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        </div>

        {/* Field Controls */}
        <div className="space-y-3">
          {/* Field Density */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-200">
              Field Density
            </label>
            <span className="px-1.5 py-0.5 text-xs font-mono bg-zinc-700 text-zinc-300 rounded">
              {fieldDensity.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={fieldDensity}
            onChange={(e) => setFieldDensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />

          {/* Field Lines Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-200">
              Field Lines
            </span>
            <button
              onClick={toggleFieldLines}
              className={cn(
                "relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200",
                showFieldLines ? "bg-blue-600" : "bg-zinc-600"
              )}
            >
              <span
                className={cn(
                  "h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200",
                  showFieldLines ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-zinc-400 bg-zinc-800/30 p-2 rounded">
          <p className="font-medium text-zinc-300 mb-1">Controls:</p>
          <p>• Adjust charges • Mouse orbit • AI chat</p>
        </div>
      </CardContent>
    </DraggableCard>
  );
}

// AI Explanation removed - interaction now happens through side chat

export default function ElectricFieldSimulation() {
  const {
    mountRef,
    testChargeHoverState,
  } = useElectricFieldSimulation();

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Scene Canvas - adjusted for title bar */}
      <div ref={mountRef} className="w-full h-full bg-zinc-900 pt-16" />

      {/* Manual controls */}
      <ManualControls />
    </div>
  );
}
