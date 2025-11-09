"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DraggableCard from "../atomic/draggable-card";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Globe, 
  Ruler, 
  Weight,
  Eye,
  EyeOff,
  Info,
  Activity,
} from "lucide-react";

interface PendulumState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angle: number;
  precessionAngle: number;
}

export default function FoucaultPendulumSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Pendulum objects
  const bobRef = useRef<THREE.Mesh | null>(null);
  const stringRef = useRef<THREE.Line | null>(null);
  const trailRef = useRef<THREE.Points | null>(null);

  // Physics state
  const stateRef = useRef<PendulumState>({
    position: new THREE.Vector3(3, -5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    angle: 0.3,
    precessionAngle: 0,
  });

  // Parameters
  const [latitude, setLatitude] = useState(45);
  const [length, setLength] = useState(10);
  const [mass, setMass] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [precessionAngle, setPrecessionAngle] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const trailPositions = useRef<Float32Array>(new Float32Array(3000)); // 1000 points
  const trailIndex = useRef(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-5, 10, 5);
    scene.add(directionalLight);

    // Create pendulum pivot point (sphere at origin)
    const pivotGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pivotMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.set(0, 0, 0);
    scene.add(pivot);

    // Create pendulum bob
    const bobGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bobMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      metalness: 0.5,
      roughness: 0.2,
    });
    const bob = new THREE.Mesh(bobGeometry, bobMaterial);
    bob.position.copy(stateRef.current.position);
    scene.add(bob);
    bobRef.current = bob;

    // Create pendulum string
    const stringGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      stateRef.current.position,
    ]);
    const stringMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const string = new THREE.Line(stringGeometry, stringMaterial);
    scene.add(string);
    stringRef.current = string;

    // Create trail
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPositions.current, 3)
    );
    const trailMaterial = new THREE.PointsMaterial({
      color: 0x33ccff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);
    trailRef.current = trail;

    // Create ground plane with grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -12;
    scene.add(gridHelper);

    // Create compass rose to show precession
    const compassGeometry = new THREE.CircleGeometry(8, 64);
    const compassMaterial = new THREE.MeshBasicMaterial({
      color: 0x2a2a2a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const compass = new THREE.Mesh(compassGeometry, compassMaterial);
    compass.rotation.x = -Math.PI / 2;
    compass.position.y = -11.9;
    scene.add(compass);

    // Add cardinal direction markers
    const directions = [
      { text: "N", pos: new THREE.Vector3(0, -11.5, -9) },
      { text: "S", pos: new THREE.Vector3(0, -11.5, 9) },
      { text: "E", pos: new THREE.Vector3(9, -11.5, 0) },
      { text: "W", pos: new THREE.Vector3(-9, -11.5, 0) },
    ];

    directions.forEach(({ text, pos }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(pos);
      sprite.scale.set(2, 2, 1);
      scene.add(sprite);
    });

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Physics simulation
  useEffect(() => {
    if (!isRunning) return;

    const dt = 0.016; // ~60 FPS
    let lastTime = Date.now();

    const simulate = () => {
      if (!isRunning) return;

      const now = Date.now();
      const actualDt = (now - lastTime) / 1000;
      lastTime = now;

      const state = stateRef.current;
      const g = 9.81;
      const L = length;

      // Convert latitude to radians
      const latRad = (latitude * Math.PI) / 180;

      // Earth's angular velocity
      const omega = (2 * Math.PI) / 86400; // radians per second (one rotation per day)

      // Get position and velocity
      const pos = state.position;
      const vel = state.velocity;

      // 1. Gravity force
      const gravity = new THREE.Vector3(0, -g * mass, 0);

      // 2. String tension (restoring force)
      const stringVector = new THREE.Vector3(-pos.x, -pos.y, -pos.z);
      const currentLength = stringVector.length();
      const tensionMagnitude = (mass * g * L) / (currentLength || 1);
      const tension = stringVector.normalize().multiplyScalar(tensionMagnitude);

      // 3. Coriolis force: F = -2m * Ω × v
      // Ω = ω * sin(latitude) in the vertical direction
      const omegaVertical = omega * Math.sin(latRad);
      const coriolis = new THREE.Vector3(
        2 * mass * omegaVertical * vel.z,
        0,
        -2 * mass * omegaVertical * vel.x
      );

      // 4. Centrifugal force (smaller effect)
      const omegaHorizontal = omega * Math.cos(latRad);
      const centrifugal = new THREE.Vector3(
        mass * omegaHorizontal * omegaHorizontal * pos.x,
        0,
        mass * omegaHorizontal * omegaHorizontal * pos.z
      );

      // Total force
      const totalForce = new THREE.Vector3()
        .add(gravity)
        .add(tension)
        .add(coriolis)
        .add(centrifugal);

      // Update velocity: v = v + (F/m) * dt
      const acceleration = totalForce.divideScalar(mass);
      vel.add(acceleration.multiplyScalar(dt));

      // Apply damping to simulate air resistance
      vel.multiplyScalar(0.999);

      // Update position: p = p + v * dt
      pos.add(vel.clone().multiplyScalar(dt));

      // Constrain to pendulum length (string constraint)
      const distFromOrigin = pos.length();
      if (distFromOrigin > L) {
        pos.normalize().multiplyScalar(L);
        // Project velocity onto the tangent plane
        const radialVel = vel.dot(pos) / L;
        vel.sub(pos.clone().normalize().multiplyScalar(radialVel));
      }

      // Update precession angle
      state.precessionAngle = Math.atan2(pos.z, pos.x);
      setPrecessionAngle((state.precessionAngle * 180) / Math.PI);

      // Update elapsed time
      setElapsedTime((t) => t + actualDt);

      // Update visuals
      if (bobRef.current) {
        bobRef.current.position.copy(pos);
      }

      if (stringRef.current) {
        const positions = new Float32Array([0, 0, 0, pos.x, pos.y, pos.z]);
        stringRef.current.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
      }

      // Update trail
      if (showTrail && trailRef.current) {
        const idx = trailIndex.current * 3;
        trailPositions.current[idx] = pos.x;
        trailPositions.current[idx + 1] = pos.y;
        trailPositions.current[idx + 2] = pos.z;
        trailIndex.current = (trailIndex.current + 1) % 1000;

        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }

      animationIdRef.current = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isRunning, latitude, length, mass, showTrail]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPrecessionAngle(0);
    trailIndex.current = 0;
    trailPositions.current.fill(0);

    // Reset state
    const initialAngle = 0.3;
    stateRef.current = {
      position: new THREE.Vector3(length * Math.sin(initialAngle), -length * Math.cos(initialAngle), 0),
      velocity: new THREE.Vector3(0, 0, 0),
      angle: initialAngle,
      precessionAngle: 0,
    };

    // Reset visuals
    if (bobRef.current) {
      bobRef.current.position.copy(stateRef.current.position);
    }

    if (stringRef.current) {
      const positions = new Float32Array([
        0, 0, 0,
        stateRef.current.position.x,
        stateRef.current.position.y,
        stateRef.current.position.z
      ]);
      stringRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
    }

    if (trailRef.current) {
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Full-screen 3D Visualization */}
      <div
        ref={mountRef}
        className="w-full h-full bg-black"
      />

      {/* Draggable Control Panel */}
      <DraggableCard
        initialPosition={{ x: 20, y: 80 }}
        initialSize={{ width: 340, height: "auto" }}
        minSize={{ width: 300, height: 400 }}
        maxSize={{ width: 450, height: 700 }}
        className="bg-black/90 backdrop-blur-sm border-zinc-700 shadow-2xl"
      >
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b border-zinc-700 pb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">
                Foucault Pendulum
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Demonstrating Earth's rotation
            </p>
          </div>

          {/* Control Tabs */}
          <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-3 mt-4">
            {/* Simulation Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">Simulation</span>
                <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                  {isRunning ? "Running" : "Paused"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className={cn(
                    "flex-1 h-8 text-xs",
                    isRunning
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm" className="h-8">
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-3" />

            {/* Latitude Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-medium text-zinc-200">Latitude</span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300"
                )}>
                  {latitude}°
                </span>
              </div>
              
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={latitude}
                onChange={(e) => {
                  if (!isRunning) setLatitude(parseFloat(e.target.value));
                }}
                disabled={isRunning}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              
              <div className="flex justify-between text-xs text-zinc-500">
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
              </div>
            </div>

            {/* Length Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-zinc-200">Length</span>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                  {length.toFixed(1)} m
                </span>
              </div>
              
              <input
                type="range"
                min={5}
                max={20}
                step={0.5}
                value={length}
                onChange={(e) => {
                  if (!isRunning) setLength(parseFloat(e.target.value));
                }}
                disabled={isRunning}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              
              <div className="flex justify-between text-xs text-zinc-500">
                <span>5 m</span>
                <span>20 m</span>
              </div>
            </div>

            {/* Mass Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Weight className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-medium text-zinc-200">Mass</span>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                  {mass.toFixed(1)} kg
                </span>
              </div>
              
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={mass}
                onChange={(e) => {
                  if (!isRunning) setMass(parseFloat(e.target.value));
                }}
                disabled={isRunning}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              
              <div className="flex justify-between text-xs text-zinc-500">
                <span>1 kg</span>
                <span>20 kg</span>
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-3" />

            {/* Visualization Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">Trail Visibility</span>
                <button
                  onClick={() => setShowTrail(!showTrail)}
                  className={cn(
                    "relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200",
                    showTrail ? "bg-blue-600" : "bg-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200",
                      showTrail ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-3 mt-4">
            <div className="space-y-2 p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-3 h-3 text-blue-400" />
                <h3 className="text-xs font-semibold text-zinc-200">About</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The Foucault pendulum demonstrates Earth's rotation through the Coriolis effect.
                The plane of oscillation appears to rotate over time.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-200">Key Facts</h3>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-green-400">•</span>
                  At poles: 24h precession period
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  At equator: no precession
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  Period = 24h ÷ sin(latitude)
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  Coriolis force causes precession
                </li>
              </ul>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-xs font-semibold mb-1 text-blue-400">Quick Locations</h3>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                <button
                  onClick={() => {
                    if (!isRunning) setLatitude(90);
                  }}
                  disabled={isRunning}
                  className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded disabled:opacity-50 text-zinc-200"
                >
                  North Pole
                </button>
                <button
                  onClick={() => {
                    if (!isRunning) setLatitude(-90);
                  }}
                  disabled={isRunning}
                  className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded disabled:opacity-50 text-zinc-200"
                >
                  South Pole
                </button>
                <button
                  onClick={() => {
                    if (!isRunning) setLatitude(45);
                  }}
                  disabled={isRunning}
                  className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded disabled:opacity-50 text-zinc-200"
                >
                  45° N
                </button>
                <button
                  onClick={() => {
                    if (!isRunning) setLatitude(0);
                  }}
                  disabled={isRunning}
                  className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded disabled:opacity-50 text-zinc-200"
                >
                  Equator
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Measurements Panel */}
        <div className="border-t border-zinc-700 pt-3 mt-2">
          <h3 className="text-xs font-semibold mb-3 text-zinc-200 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Measurements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Time</p>
              <p className="text-sm font-bold text-blue-400">{elapsedTime.toFixed(1)}s</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Angle</p>
              <p className="text-sm font-bold text-purple-400">{precessionAngle.toFixed(1)}°</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Period</p>
              <p className="text-sm font-bold text-green-400">
                {latitude !== 0
                  ? (86400 / Math.abs(Math.sin((latitude * Math.PI) / 180)) / 3600).toFixed(1)
                  : "∞"}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Position</p>
              <p className="text-xs font-mono text-orange-400">
                ({stateRef.current.position.x.toFixed(1)}, {stateRef.current.position.z.toFixed(1)})
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-zinc-400 bg-zinc-800/30 p-2 rounded mt-2">
          <p className="font-medium text-zinc-300 mb-1">Controls:</p>
          <p>• Drag card to reposition • Resize from corner • Mouse to orbit view</p>
        </div>
      </CardContent>
    </DraggableCard>
    </div>
  );
}
