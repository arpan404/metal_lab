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
  Target,
  Zap,
  Trophy,
  TrendingUp,
  Info,
  Activity,
} from 'lucide-react';

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  targetIndex: number;
}

export default function DeflectionGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [spawnRate, setSpawnRate] = useState(0.5);
  const [projectileSpeed, setProjectileSpeed] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const isRunningRef = useRef(isRunning);
  const spawnRateRef = useRef(spawnRate);
  const projectileSpeedRef = useRef(projectileSpeed);
  const targetsRef = useRef<THREE.Mesh[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    spawnRateRef.current = spawnRate;
  }, [spawnRate]);

  useEffect(() => {
    projectileSpeedRef.current = projectileSpeed;
  }, [projectileSpeed]);

  const handleReset = () => {
    setIsRunning(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setSpawnRate(0.5);
    setProjectileSpeed(10);
    setDifficulty('medium');
    
    // Clear projectiles
    projectilesRef.current = [];
  };

  const setDifficultyLevel = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    switch (level) {
      case 'easy':
        setSpawnRate(1.0);
        setProjectileSpeed(8);
        break;
      case 'medium':
        setSpawnRate(0.5);
        setProjectileSpeed(10);
        break;
      case 'hard':
        setSpawnRate(0.3);
        setProjectileSpeed(14);
        break;
    }
  };

  const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 1, 50);
    pointLight.position.set(0, 5, 8);
    scene.add(pointLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x00d4ff, 0x334455);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Targets
    const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.7,
    });

    // Glow for targets
    const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 3; i++) {
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      target.position.set((i - 1) * 5, 5, -8);
      scene.add(target);
      targetsRef.current.push(target);

      // Add glow
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(target.position);
      scene.add(glow);
      target.userData.glow = glow;
    }

    // Projectile geometry and material (reused)
    const projectileGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const projectileMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Projectile trail material
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    // Fire projectile function
    function fireProjectile() {
      const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
      projectile.position.set(0, 2, 8);

      const targetIdx = Math.floor(Math.random() * targetsRef.current.length);
      const target = targetsRef.current[targetIdx];
      const direction = new THREE.Vector3()
        .subVectors(target.position, projectile.position)
        .normalize();
      
      const velocity = direction.multiplyScalar(projectileSpeedRef.current);

      scene.add(projectile);

      // Add trail
      const trail = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        trailMaterial
      );
      trail.position.copy(projectile.position);
      scene.add(trail);
      projectile.userData.trail = trail;

      projectilesRef.current.push({
        mesh: projectile,
        velocity: velocity,
        targetIndex: targetIdx,
      });
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

      // Animate targets
      targetsRef.current.forEach((target, i) => {
        target.rotation.y += 0.02;
        const pulse = Math.sin(frameCount * 0.05 + i) * 0.1 + 1;
        target.scale.setScalar(pulse);
        
        if (target.userData.glow) {
          target.userData.glow.position.copy(target.position);
          target.userData.glow.scale.setScalar(pulse * 1.2);
        }
      });

      // Spawn projectiles if running
      if (isRunningRef.current) {
        spawnTimer += dt;
        if (spawnTimer > spawnRateRef.current) {
          fireProjectile();
          spawnTimer = 0;
        }
      }

      // Update projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        
        if (isRunningRef.current) {
          proj.mesh.position.add(proj.velocity.clone().multiplyScalar(dt));
          proj.mesh.rotation.x += 0.2;
          proj.mesh.rotation.y += 0.15;
        }

        // Update trail
        if (proj.mesh.userData.trail) {
          proj.mesh.userData.trail.position.lerp(proj.mesh.position, 0.3);
          proj.mesh.userData.trail.scale.multiplyScalar(0.98);
        }

        let hit = false;
        for (let j = 0; j < targetsRef.current.length; j++) {
          const target = targetsRef.current[j];
          if (proj.mesh.position.distanceTo(target.position) < 0.7) {
            setScore((prev) => prev + 100);
            setHits((prev) => prev + 1);

            // Reposition target
            target.position.set(
              (Math.random() - 0.5) * 10,
              3 + Math.random() * 4,
              -8 - Math.random() * 2
            );

            // Create explosion effect
            for (let k = 0; k < 8; k++) {
              const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({
                  color: 0xff8800,
                  transparent: true,
                  opacity: 1,
                })
              );
              particle.position.copy(proj.mesh.position);
              const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
              );
              particle.userData.velocity = vel;
              particle.userData.life = 1.0;
              scene.add(particle);
              
              // Fade out particles
              setTimeout(() => {
                const fadeOut = () => {
                  if (particle.userData.life > 0) {
                    particle.userData.life -= 0.05;
                    (particle.material as THREE.MeshBasicMaterial).opacity = particle.userData.life;
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.02));
                    particle.scale.multiplyScalar(0.95);
                    requestAnimationFrame(fadeOut);
                  } else {
                    scene.remove(particle);
                  }
                };
                fadeOut();
              }, 0);
            }

            hit = true;
            break;
          }
        }

        // Remove projectile if hit or out of bounds
        if (hit || proj.mesh.position.length() > 30) {
          if (!hit) {
            setMisses((prev) => prev + 1);
          }
          scene.remove(proj.mesh);
          if (proj.mesh.userData.trail) {
            scene.remove(proj.mesh.userData.trail);
          }
          projectilesRef.current.splice(i, 1);
        }
      }

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
              <Target className="w-5 h-5 text-red-400" />
              <h2 className="text-sm font-semibold text-white">
                Atomic Deflection Game
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Hit the moving targets!
            </p>
          </div>

          {/* Control Tabs */}
          <Tabs defaultValue="game" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="game" className="space-y-3 mt-4">
              {/* Game Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200">Game</span>
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
                    title="Reset game"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Score Display */}
              <div className="space-y-2 p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-xs font-semibold text-zinc-200">Statistics</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Score</p>
                    <p className="text-lg font-bold text-green-400">{score}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Accuracy</p>
                    <p className="text-lg font-bold text-yellow-400">{accuracy}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Hits</p>
                    <p className="text-sm font-bold text-cyan-400">{hits}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Misses</p>
                    <p className="text-sm font-bold text-red-400">{misses}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Difficulty Presets */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-medium text-zinc-200">Difficulty</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setDifficultyLevel('easy')}
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Easy
                  </Button>
                  <Button
                    onClick={() => setDifficultyLevel('medium')}
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Medium
                  </Button>
                  <Button
                    onClick={() => setDifficultyLevel('hard')}
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Hard
                  </Button>
                </div>
              </div>

              {/* Spawn Rate Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-zinc-200">Spawn Rate</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {spawnRate.toFixed(2)}s
                  </span>
                </div>

                <input
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  value={spawnRate}
                  onChange={(e) => setSpawnRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>

              {/* Projectile Speed Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-medium text-zinc-200">Speed</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {projectileSpeed.toFixed(0)}
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={projectileSpeed}
                  onChange={(e) => setProjectileSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>5</span>
                  <span>20</span>
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
                  Test your accuracy in this atomic deflection game! Projectiles automatically
                  target the red spheres. Score points by hitting them!
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200">How to Play</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    Projectiles auto-fire toward targets
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    Hit targets to score 100 points
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">•</span>
                    Targets reposition after each hit
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">•</span>
                    Missed shots count against accuracy
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h3 className="text-xs font-semibold mb-1 text-purple-400">Challenge</h3>
                <p className="text-xs text-zinc-400">
                  Can you maintain 100% accuracy on Hard mode?
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
