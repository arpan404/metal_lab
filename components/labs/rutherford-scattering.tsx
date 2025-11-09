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
  Atom,
  Zap,
  Target,
  Info,
  Activity,
  TrendingUp,
} from 'lucide-react';

interface AlphaParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
}

export default function RutherfordScattering() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState(5.0);
  const [spawnRate, setSpawnRate] = useState(0.3);
  const [forceStrength, setForceStrength] = useState(50);
  const [particlesFired, setParticlesFired] = useState(0);
  const [deflectedCount, setDeflectedCount] = useState(0);
  const [straightCount, setStraightCount] = useState(0);

  const isRunningRef = useRef(isRunning);
  const particleSpeedRef = useRef(particleSpeed);
  const spawnRateRef = useRef(spawnRate);
  const forceStrengthRef = useRef(forceStrength);
  const particlesRef = useRef<AlphaParticle[]>([]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    particleSpeedRef.current = particleSpeed;
  }, [particleSpeed]);

  useEffect(() => {
    spawnRateRef.current = spawnRate;
  }, [spawnRate]);

  useEffect(() => {
    forceStrengthRef.current = forceStrength;
  }, [forceStrength]);

  const handleReset = () => {
    setIsRunning(false);
    setParticleSpeed(5.0);
    setSpawnRate(0.3);
    setForceStrength(50);
    setParticlesFired(0);
    setDeflectedCount(0);
    setStraightCount(0);
    particlesRef.current = [];
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 20, 60);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.minDistance = 10;
    controls.maxDistance = 50;

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambientLight);

    // Main light
    const mainLight = new THREE.DirectionalLight(0x6495ed, 1.0);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0xffd700, 2, 20);
    accentLight1.position.set(0, 5, 0);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff4444, 1, 30);
    accentLight2.position.set(-15, 2, 0);
    scene.add(accentLight2);

    // Gold nucleus (atom core)
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleus.castShadow = true;
    scene.add(nucleus);

    // Nucleus glow
    const nucleusGlowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const nucleusGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const nucleusGlow = new THREE.Mesh(nucleusGlowGeometry, nucleusGlowMaterial);
    scene.add(nucleusGlow);

    // Electron cloud (wireframe sphere)
    const cloudGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloud);

    // Electron orbits
    const orbitLines: THREE.Line[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI;
      const points = [];
      const radius = 2.5;
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius * Math.cos(angle),
          Math.sin(theta) * radius,
          Math.cos(theta) * radius * Math.sin(angle)
        ));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x6666ff,
        transparent: true,
        opacity: 0.3,
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      orbitLines.push(orbit);
    }

    // Source emitter (left side)
    const emitterGeometry = new THREE.CylinderGeometry(0.5, 0.8, 2, 16);
    const emitterMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xff2222,
      emissiveIntensity: 0.3,
    });
    const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter.position.set(-18, 0, 0);
    emitter.rotation.z = Math.PI / 2;
    emitter.castShadow = true;
    scene.add(emitter);

    // Emitter glow
    const emitterGlowGeometry = new THREE.CylinderGeometry(0.6, 0.9, 2.2, 16);
    const emitterGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const emitterGlow = new THREE.Mesh(emitterGlowGeometry, emitterGlowMaterial);
    emitterGlow.position.copy(emitter.position);
    emitterGlow.rotation.copy(emitter.rotation);
    scene.add(emitterGlow);

    // Detection screen (right side)
    const screenGeometry = new THREE.PlaneGeometry(15, 15);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x222244,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(18, 0, 0);
    screen.rotation.y = Math.PI / 2;
    scene.add(screen);

    // Grid floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x444466, 0x222233);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Reference axes
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.y = -4.9;
    scene.add(axesHelper);

    // Alpha particle geometry and material
    const particleGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Trail material
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.5,
      linewidth: 2,
    });

    // Spawn alpha particle
    function spawnParticle() {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const yOffset = (Math.random() - 0.5) * 10;
      const zOffset = (Math.random() - 0.5) * 3;
      particle.position.set(-18, yOffset, zOffset);
      particle.castShadow = true;

      // Glow for particle
      const particleGlowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const particleGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      const particleGlow = new THREE.Mesh(particleGlowGeometry, particleGlowMaterial);
      particleGlow.position.copy(particle.position);
      scene.add(particleGlow);
      particle.userData.glow = particleGlow;

      scene.add(particle);

      const alphaParticle: AlphaParticle = {
        mesh: particle,
        velocity: new THREE.Vector3(particleSpeedRef.current, 0, 0),
        trail: [],
      };

      particlesRef.current.push(alphaParticle);
      setParticlesFired((prev) => prev + 1);
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

      // Animate nucleus glow
      const glowPulse = Math.sin(frameCount * 0.05) * 0.1 + 0.9;
      nucleusGlow.scale.setScalar(glowPulse);

      // Animate cloud rotation
      cloud.rotation.y += 0.005;
      
      // Animate orbit lines
      orbitLines.forEach((orbit, i) => {
        orbit.rotation.y += 0.002 * (i + 1);
        const opacity = Math.sin(frameCount * 0.03 + i) * 0.1 + 0.3;
        (orbit.material as THREE.LineBasicMaterial).opacity = opacity;
      });

      // Animate emitter glow
      const emitterPulse = Math.sin(frameCount * 0.08) * 0.15 + 0.85;
      emitterGlow.scale.setScalar(emitterPulse);

      // Spawn particles
      if (isRunningRef.current) {
        spawnTimer += dt;
        if (spawnTimer > spawnRateRef.current && particlesRef.current.length < 50) {
          spawnParticle();
          spawnTimer = 0;
        }
      }

      // Update particles with Coulomb force
      let deflected = 0;
      let straight = 0;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];

        if (isRunningRef.current) {
          // Calculate Coulomb repulsion force: F = k·q₁·q₂/r²
          const toNucleus = new THREE.Vector3().subVectors(
            nucleus.position,
            particle.mesh.position
          );
          const distance = toNucleus.length();

          // Apply force if within interaction range
          if (distance > 0.6 && distance < 12) {
            const forceMag = forceStrengthRef.current / (distance * distance);
            const force = toNucleus.normalize().multiplyScalar(-forceMag); // Repulsion (negative)
            particle.velocity.add(force.multiplyScalar(dt));
          }

          // Update position
          particle.mesh.position.add(particle.velocity.clone().multiplyScalar(dt));

          // Update glow
          if (particle.mesh.userData.glow) {
            particle.mesh.userData.glow.position.copy(particle.mesh.position);
          }

          // Update trail
          particle.trail.push(particle.mesh.position.clone());
          if (particle.trail.length > 30) {
            particle.trail.shift();
          }

          // Check deflection angle
          const angle = Math.abs(Math.atan2(particle.velocity.y, particle.velocity.x));
          if (angle > 0.2) {
            deflected++;
          } else {
            straight++;
          }

          // Rotation for visual effect
          particle.mesh.rotation.x += 0.1;
          particle.mesh.rotation.y += 0.08;
        }

        // Remove particles that are too far
        if (particle.mesh.position.length() > 30) {
          scene.remove(particle.mesh);
          if (particle.mesh.userData.glow) {
            scene.remove(particle.mesh.userData.glow);
          }
          particlesRef.current.splice(i, 1);
        }
      }

      setDeflectedCount(deflected);
      setStraightCount(straight);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const deflectionRate = particlesFired > 0 
    ? ((deflectedCount / particlesFired) * 100).toFixed(1)
    : '0.0';

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
              <Atom className="w-5 h-5 text-yellow-400" />
              <h2 className="text-sm font-semibold text-white">
                Rutherford Scattering
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Alpha particle deflection experiment
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Total Fired</p>
                    <p className="text-lg font-bold text-red-400">{particlesFired}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Deflection Rate</p>
                    <p className="text-lg font-bold text-yellow-400">{deflectionRate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Deflected</p>
                    <p className="text-lg font-bold text-orange-400">{deflectedCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Straight</p>
                    <p className="text-lg font-bold text-green-400">{straightCount}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Particle Speed Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-medium text-zinc-200">Particle Speed</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {particleSpeed.toFixed(1)}
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={particleSpeed}
                  onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Force Strength Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-medium text-zinc-200">Force Strength</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {forceStrength}
                  </span>
                </div>

                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={forceStrength}
                  onChange={(e) => setForceStrength(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>

              {/* Spawn Rate Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-zinc-200">Spawn Rate</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {spawnRate.toFixed(2)}s
                  </span>
                </div>

                <input
                  type="range"
                  min={0.1}
                  max={1.0}
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
              <div className="space-y-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h3 className="text-xs font-semibold text-yellow-400">Experiment Modes</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setParticleSpeed(3.0);
                      setForceStrength(30);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Low Energy
                  </Button>
                  <Button
                    onClick={() => {
                      setParticleSpeed(8.0);
                      setForceStrength(100);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    High Energy
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
                  The Rutherford scattering experiment (1909) revealed that atoms have a dense,
                  positively charged nucleus. Alpha particles fired at gold foil were mostly
                  undeflected, but some bounced back, proving the nuclear model of the atom.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200">Physics</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    Gold nucleus (positive charge)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">•</span>
                    Alpha particles (He²⁺ nuclei)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    Coulomb force: F = k·q₁·q₂/r²
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    Repulsive force (both positive)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    Inverse square law behavior
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h3 className="text-xs font-semibold mb-1 text-yellow-400">Discovery</h3>
                <p className="text-xs text-zinc-400">
                  Ernest Rutherford said it was like "firing a 15-inch shell at tissue paper
                  and having it bounce back" - leading to the nuclear model of the atom!
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200">Observations</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    Most particles pass straight through
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-400">✓</span>
                    Some deflect at large angles
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">✓</span>
                    Very few bounce back
                  </li>
                </ul>
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
