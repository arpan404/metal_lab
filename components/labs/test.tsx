"use client";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, ZoomIn } from "lucide-react";

export default function ElectricFieldSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [charge1, setCharge1] = useState(1);
  const [charge2, setCharge2] = useState(-1);
  const [fieldDensity, setFieldDensity] = useState(1);
  const [showFieldLines, setShowFieldLines] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // === Basic Scene Setup ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717);
    scene.fog = new THREE.Fog(0x0a0a0f, 15, 30);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // === Orbit Controls ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;

    // === Lighting ===
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x4444ff, 0.5);
    rimLight.position.set(-10, 5, -10);
    scene.add(rimLight);

    // === Ground Plane ===
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // === Constants ===
    let q1 = charge1;
    let q2 = charge2;
    const pos1 = new THREE.Vector3(-3, 0, 0);
    const pos2 = new THREE.Vector3(3, 0, 0);

    // === Create Charges ===
    const chargeObjects: THREE.Mesh[] = [];
    
    function createCharge(position: THREE.Vector3, color: number, charge: number) {
      // Main sphere
      const geometry = new THREE.SphereGeometry(0.4, 64, 64);
      const material = new THREE.MeshPhysicalMaterial({ 
        color,
        metalness: 0.3,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      sphere.castShadow = true;
      scene.add(sphere);
      chargeObjects.push(sphere);

      // Glow effect
      const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(position);
      scene.add(glow);

      // Label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 128;
      canvas.height = 128;
      context.fillStyle = charge > 0 ? '#ff4444' : '#4444ff';
      context.font = 'bold 80px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(charge > 0 ? '+' : '-', 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.position.y += 1;
      sprite.scale.set(1, 1, 1);
      scene.add(sprite);

      return { sphere, glow, sprite };
    }

    const charge1Obj = createCharge(pos1, 0xff3333, q1);
    const charge2Obj = createCharge(pos2, 0x3333ff, q2);

    // === Electric Field Function ===
    function electricFieldAtPoint(point: THREE.Vector3) {
      const r1 = new THREE.Vector3().subVectors(point, pos1);
      const r2 = new THREE.Vector3().subVectors(point, pos2);
      
      const dist1 = r1.length();
      const dist2 = r2.length();
      
      // Prevent division by zero near charges
      if (dist1 < 0.5 || dist2 < 0.5) return new THREE.Vector3(0, 0, 0);
      
      const e1 = r1.clone().normalize().multiplyScalar(q1 / (dist1 * dist1));
      const e2 = r2.clone().normalize().multiplyScalar(q2 / (dist2 * dist2));
      return e1.add(e2);
    }

    // === Draw Field Vectors ===
    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);

    function updateFieldVectors() {
      // Clear existing arrows
      while (arrowGroup.children.length > 0) {
        arrowGroup.remove(arrowGroup.children[0]);
      }

      if (!showFieldLines) return;

      const spacing = 1.2 / fieldDensity;
      const range = 8;
      
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
            const color = new THREE.Color().setHSL(0.6 - colorValue * 0.6, 1, 0.5);
            
            const arrowLength = Math.min(mag * 0.3, 0.8);
            const arrow = new THREE.ArrowHelper(
              dir, 
              point, 
              arrowLength, 
              color.getHex(),
              arrowLength * 0.3,
              arrowLength * 0.2
            );
            arrowGroup.add(arrow);
          }
        }
      }
    }

    updateFieldVectors();

    // === Test Charge (moves with mouse) ===
    const testChargeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const testChargeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
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

    // === Animate ===
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isPlaying) {
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
    animate();

    // === Resize Handler ===
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // === Cleanup ===
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [isPlaying, charge1, charge2, fieldDensity, showFieldLines]);

  return (
    <div className="relative w-full h-screen bg-slate-950">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Control Panel */}
      <Card className="absolute top-6 left-6 p-6 bg-slate-900/90 backdrop-blur-lg border-slate-700 text-white shadow-2xl max-w-sm">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Electric Field Simulator</h2>
            <p className="text-sm text-slate-400">Interactive visualization of electric forces</p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400">
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          {/* Charge 1 Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Charge 1 (Red)</span>
              <span className="text-red-400 font-mono">{charge1 > 0 ? '+' : ''}{charge1.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={charge1}
              onChange={(e) => setCharge1(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Charge 2 Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Charge 2 (Blue)</span>
              <span className="text-blue-400 font-mono">{charge2 > 0 ? '+' : ''}{charge2.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={charge2}
              onChange={(e) => setCharge2(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Field Density Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Field Density</span>
              <span className="text-purple-400 font-mono">{fieldDensity.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={fieldDensity}
              onChange={(e) => setFieldDensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Toggle Field Lines */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-sm font-medium text-slate-300">Show Field Vectors</span>
            <button
              onClick={() => setShowFieldLines(!showFieldLines)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showFieldLines ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showFieldLines ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Yellow sphere:</span> Test charge moving in the field
              <br />
              <span className="font-semibold">Pink arrow:</span> Force on test charge
              <br />
              <span className="font-semibold">Colored arrows:</span> Electric field vectors
            </p>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="absolute bottom-6 right-6 p-4 bg-slate-900/90 backdrop-blur-lg border-slate-700 text-white shadow-2xl">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            Camera Controls
          </h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <span className="text-slate-300">Left Click + Drag:</span> Rotate view</li>
            <li>• <span className="text-slate-300">Right Click + Drag:</span> Pan view</li>
            <li>• <span className="text-slate-300">Scroll:</span> Zoom in/out</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
