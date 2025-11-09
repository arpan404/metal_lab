'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DraggableCard from '../atomic/draggable-card';
import {
  Play,
  Pause,
  RotateCcw,
  Droplet,
  Zap,
  Weight,
  Info,
  Activity,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface OilDrop {
  mesh: THREE.Mesh;
  velocity: number;
  charge: number;
}

export default function MillikanExperiment() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [gravity, setGravity] = useState(1.2);
  const [electricField, setElectricField] = useState(2.0);
  const [spawnRate, setSpawnRate] = useState(0.2);
  const [dropCount, setDropCount] = useState(0);
  const [floatingDrops, setFloatingDrops] = useState(0);
  const [fallingDrops, setFallingDrops] = useState(0);

  const isRunningRef = useRef(isRunning);
  const gravityRef = useRef(gravity);
  const electricFieldRef = useRef(electricField);
  const spawnRateRef = useRef(spawnRate);
  const dropsRef = useRef<OilDrop[]>([]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    gravityRef.current = gravity;
  }, [gravity]);

  useEffect(() => {
    electricFieldRef.current = electricField;
  }, [electricField]);

  useEffect(() => {
    spawnRateRef.current = spawnRate;
  }, [spawnRate]);

  const handleReset = () => {
    setIsRunning(false);
    setGravity(1.2);
    setElectricField(2.0);
    setSpawnRate(0.2);
    setDropCount(0);
    setFloatingDrops(0);
    setFallingDrops(0);
    dropsRef.current = [];
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Top plate (positive - blue)
    const plateGeometry = new THREE.BoxGeometry(10, 0.2, 6);
    const topPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0x4444ff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x2222aa,
      emissiveIntensity: 0.3,
    });
    const topPlate = new THREE.Mesh(plateGeometry, topPlateMaterial);
    topPlate.position.y = 8;
    scene.add(topPlate);

    // Top plate glow
    const topGlowGeometry = new THREE.BoxGeometry(10.5, 0.3, 6.5);
    const topGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const topGlow = new THREE.Mesh(topGlowGeometry, topGlowMaterial);
    topGlow.position.y = 8;
    scene.add(topGlow);

    // Bottom plate (negative - red)
    const bottomPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xaa2222,
      emissiveIntensity: 0.3,
    });
    const bottomPlate = new THREE.Mesh(plateGeometry, bottomPlateMaterial);
    bottomPlate.position.y = 0;
    scene.add(bottomPlate);

    // Bottom plate glow
    const bottomGlowGeometry = new THREE.BoxGeometry(10.5, 0.3, 6.5);
    const bottomGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const bottomGlow = new THREE.Mesh(bottomGlowGeometry, bottomGlowMaterial);
    bottomGlow.position.y = 0;
    scene.add(bottomGlow);

    // Electric field lines visualization
    const fieldLines: THREE.Line[] = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });

    for (let x = -4; x <= 4; x += 2) {
      for (let z = -2; z <= 2; z += 2) {
        const points = [];
        points.push(new THREE.Vector3(x, 7.8, z));
        points.push(new THREE.Vector3(x, 0.2, z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        fieldLines.push(line);
      }
    }

    // Labels
    const createLabel = (text: string, position: THREE.Vector3, color: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.font = 'Bold 32px Arial';
      context.textAlign = 'center';
      context.fillText(text, 128, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(2, 0.5, 1);
      scene.add(sprite);
      return sprite;
    };

    const topLabel = createLabel('+ Positive Plate', new THREE.Vector3(0, 8.8, 0), 0x4444ff);
    const bottomLabel = createLabel('- Negative Plate', new THREE.Vector3(0, -0.8, 0), 0xff4444);

    // Oil drop geometry and material
    const dropGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const dropMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.3,
      roughness: 0.5,
      emissive: 0xaa6600,
      emissiveIntensity: 0.2,
    });

    // Spawn oil drop
    function spawnDrop() {
      if (dropsRef.current.length >= 50) return; // Limit drops

      const drop = new THREE.Mesh(dropGeometry, dropMaterial);
      drop.position.set(
        (Math.random() - 0.5) * 8,
        7.5,
        (Math.random() - 0.5) * 4
      );

      // Add glow to drop
      const glowGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(drop.position);
      scene.add(glow);
      drop.userData.glow = glow;

      scene.add(drop);

      const oilDrop: OilDrop = {
        mesh: drop,
        velocity: 0,
        charge: Math.random() * 0.9 + 0.3, // Range: 0.3 to 1.2
      };

      dropsRef.current.push(oilDrop);
      setDropCount((prev) => prev + 1);
    }

    // Animation loop
    let spawnTimer = 0;
    let lastTime = Date.now();
    let frameCount = 0;

    function animate() {
      requestAnimationFrame(animate);
      frameCount++;

      const currentTime = Date.now();
      const dt = Math.min((currentTime - lastTime) / 1000, 0.016);
      lastTime = currentTime;

      // Animate plate glows
      const glowPulse = Math.sin(frameCount * 0.05) * 0.1 + 0.9;
      topGlow.scale.set(glowPulse, 1, glowPulse);
      bottomGlow.scale.set(glowPulse, 1, glowPulse);

      // Animate field lines
      fieldLines.forEach((line, i) => {
        const opacity = (Math.sin(frameCount * 0.03 + i * 0.5) * 0.15 + 0.3);
        (line.material as THREE.LineBasicMaterial).opacity = opacity;
      });

      // Spawn drops if running
      if (isRunningRef.current) {
        spawnTimer += dt;
        if (spawnTimer > spawnRateRef.current) {
          spawnDrop();
          spawnTimer = 0;
        }
      }

      // Update drops
      let floating = 0;
      let falling = 0;

      for (let i = dropsRef.current.length - 1; i >= 0; i--) {
        const drop = dropsRef.current[i];

        if (isRunningRef.current) {
          // Physics: F = qE (electric force) - mg (gravity)
          const currentGravity = gravityRef.current;
          const currentElectricField = electricFieldRef.current;

          const electricForce = currentElectricField * drop.charge;
          const gravityForce = -currentGravity;
          const netForce = gravityForce + electricForce;

          drop.velocity += netForce * dt * 0.5;
          drop.mesh.position.y += drop.velocity * dt;

          // Rotation for visual effect
          drop.mesh.rotation.x += drop.velocity * dt * 2;
          drop.mesh.rotation.z += drop.velocity * dt * 1.5;
        }

        // Update glow
        if (drop.mesh.userData.glow) {
          drop.mesh.userData.glow.position.copy(drop.mesh.position);
          const glowScale = 1 + Math.abs(drop.velocity) * 0.5;
          drop.mesh.userData.glow.scale.setScalar(glowScale);
        }

        // Count floating vs falling
        if (Math.abs(drop.velocity) < 0.1) {
          floating++;
        } else if (drop.velocity < 0) {
          falling++;
        }

        // Remove drops outside bounds
        if (drop.mesh.position.y < 0.3 || drop.mesh.position.y > 8.5) {
          scene.remove(drop.mesh);
          if (drop.mesh.userData.glow) {
            scene.remove(drop.mesh.userData.glow);
          }
          dropsRef.current.splice(i, 1);
        }
      }

      setFloatingDrops(floating);
      setFallingDrops(falling);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Full-screen 3D Visualization */}
      <div ref={containerRef} className="w-full h-full bg-black" />

      {/* Draggable Control Panel */}
      <DraggableCard
        initialPosition={{ x: 20, y: 80 }}
        initialSize={{ width: 340, height: 'auto' }}
        minSize={{ width: 300, height: 400 }}
        maxSize={{ width: 450, height: 700 }}
        className="bg-black/90 backdrop-blur-sm border-zinc-700 shadow-2xl"
      >
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b border-zinc-700 pb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Droplet className="w-5 h-5 text-orange-400" />
              <h2 className="text-sm font-semibold text-white">
                Millikan Oil Drop Experiment
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Measuring electron charge
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
                  <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
                    {isRunning ? 'Running' : 'Paused'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className={cn(
                      'col-span-2 h-8 text-xs',
                      isRunning
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
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
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="h-8"
                    title="Reset experiment"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Statistics Display */}
              <div className="space-y-2 p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold text-zinc-200">Statistics</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Total Drops</p>
                    <p className="text-lg font-bold text-orange-400">{dropCount}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-zinc-400">Floating</p>
                      <ChevronUp className="w-3 h-3 text-green-400" />
                    </div>
                    <p className="text-lg font-bold text-green-400">{floatingDrops}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-zinc-400">Falling</p>
                      <ChevronDown className="w-3 h-3 text-red-400" />
                    </div>
                    <p className="text-lg font-bold text-red-400">{fallingDrops}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Gravity Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Weight className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-zinc-200">Gravity</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {gravity.toFixed(2)}
                  </span>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>0.5</span>
                  <span>3.0</span>
                </div>
              </div>

              {/* Electric Field Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-zinc-200">Electric Field</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {electricField.toFixed(2)}
                  </span>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={4.0}
                  step={0.1}
                  value={electricField}
                  onChange={(e) => setElectricField(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>0.5</span>
                  <span>4.0</span>
                </div>
              </div>

              {/* Spawn Rate Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-3 h-3 text-orange-400" />
                    <span className="text-xs font-medium text-zinc-200">Spawn Rate</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {spawnRate.toFixed(2)}s
                  </span>
                </div>

                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={spawnRate}
                  onChange={(e) => setSpawnRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-xs font-semibold text-blue-400">Quick Balance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setGravity(1.2);
                      setElectricField(1.2);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Equal Forces
                  </Button>
                  <Button
                    onClick={() => {
                      setGravity(0.8);
                      setElectricField(3.0);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Strong Field
                  </Button>
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
                  The Millikan oil drop experiment measured the charge of the electron.
                  By balancing gravity and electric force on charged oil droplets, Millikan
                  determined that charge is quantized.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200">Physics</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    Top plate is positive (+)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">•</span>
                    Bottom plate is negative (-)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    Gravity pulls drops down
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    Electric field pushes drops up
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    Net force: F = qE - mg
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h3 className="text-xs font-semibold mb-1 text-orange-400">Experiment</h3>
                <p className="text-xs text-zinc-400">
                  Balance the forces to make drops float! Adjust electric field to
                  counteract gravity.
                </p>
              </div>
            </TabsContent>
          </Tabs>

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
