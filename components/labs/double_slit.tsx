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
  Waves,
  Ruler,
  Zap,
  Info,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Photon {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    wavelength: number;
    phase: number;
    active: boolean;
}

export default function DoubleSlitExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRunning, setIsRunning] = useState(true);
    const [showPhotons, setShowPhotons] = useState(true);
    const [wavelength, setWavelength] = useState(0.5);
    const [slitSeparation, setSlitSeparation] = useState(2.0);
    const [emissionRate, setEmissionRate] = useState(5);
    const [photonCount, setPhotonCount] = useState(0);
    const [detectionCount, setDetectionCount] = useState(0);

    const isRunningRef = useRef(isRunning);
    const wavelengthRef = useRef(wavelength);
    const slitSeparationRef = useRef(slitSeparation);
    const emissionRateRef = useRef(emissionRate);
    const showPhotonsRef = useRef(showPhotons);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    useEffect(() => {
        wavelengthRef.current = wavelength;
    }, [wavelength]);

    useEffect(() => {
        slitSeparationRef.current = slitSeparation;
    }, [slitSeparation]);

    useEffect(() => {
        emissionRateRef.current = emissionRate;
    }, [emissionRate]);

    useEffect(() => {
        showPhotonsRef.current = showPhotons;
    }, [showPhotons]);

    const intensityMapRef = useRef<Float32Array | null>(null);

    const handleReset = () => {
        setIsRunning(false);
        setWavelength(0.5);
        setSlitSeparation(2.0);
        setEmissionRate(5);
        setPhotonCount(0);
        setDetectionCount(0);
        // Clear the intensity map
        if (intensityMapRef.current) {
            for (let i = 0; i < intensityMapRef.current.length; i++) {
                intensityMapRef.current[i] = 0;
            }
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Physical constants
        const SLIT_WIDTH = 0.6; // width of each slit (increased for visibility)
        const BARRIER_POSITION = 0;
        const SCREEN_POSITION = -8;
        const SOURCE_POSITION = 10;
        const PHOTON_SPEED = 0.05; // slower for better visibility

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        const camera = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(15, 8, 12);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        
        const pointLight1 = new THREE.PointLight(0xffffff, 2);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 1.5);
        pointLight2.position.set(-10, 5, 5);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xffffff, 1);
        pointLight3.position.set(0, -5, 0);
        scene.add(pointLight3);

        // Light source visualization
        const lightSourceGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const lightSourceMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff
        });
        const lightSource = new THREE.Mesh(lightSourceGeometry, lightSourceMaterial);
        lightSource.position.set(0, 0, SOURCE_POSITION);
        scene.add(lightSource);

        // Add bright glow effect around light source
        const glowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0, SOURCE_POSITION);
        scene.add(glow);

        // Add outer glow layer
        const outerGlowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        outerGlow.position.set(0, 0, SOURCE_POSITION);
        scene.add(outerGlow);

        // Add light beam indicators
        const beamGeometry = new THREE.CylinderGeometry(0.05, 0.4, SOURCE_POSITION - BARRIER_POSITION, 16);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.rotation.x = Math.PI / 2;
        beam.position.z = SOURCE_POSITION - (SOURCE_POSITION - BARRIER_POSITION) / 2;
        scene.add(beam);

        // Add point light at source for illumination
        const sourceLight = new THREE.PointLight(0x00ffff, 3, 20);
        sourceLight.position.set(0, 0, SOURCE_POSITION);
        scene.add(sourceLight);

        // Create barrier with two slits
        const barrierMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x222222,
            emissiveIntensity: 0.5
        });
        
        // Top section of barrier
        const topBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(12, 3, 0.3),
            barrierMaterial
        );
        scene.add(topBarrier);

        // Bottom section of barrier
        const bottomBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(12, 3, 0.3),
            barrierMaterial
        );
        scene.add(bottomBarrier);

        // Middle section between slits
        const middleBarrierGeometry = new THREE.BoxGeometry(12, 1, 0.3);
        const middleBarrier = new THREE.Mesh(
            middleBarrierGeometry,
            barrierMaterial
        );
        scene.add(middleBarrier);

        // Function to update barrier positions based on slit separation
        function updateBarrierPositions() {
            const currentSeparation = slitSeparationRef.current;
            topBarrier.position.set(0, currentSeparation / 2 + SLIT_WIDTH / 2 + 1.5, BARRIER_POSITION);
            bottomBarrier.position.set(0, -currentSeparation / 2 - SLIT_WIDTH / 2 - 1.5, BARRIER_POSITION);
            
            // Update middle barrier
            const newHeight = Math.max(0.1, currentSeparation - SLIT_WIDTH);
            middleBarrier.geometry.dispose();
            middleBarrier.geometry = new THREE.BoxGeometry(12, newHeight, 0.3);
            middleBarrier.position.set(0, 0, BARRIER_POSITION);
        }
        
        updateBarrierPositions();

        // Detection screen with heat map
        const screenWidth = 12;
        const screenHeight = 8;
        const screenResolution = 128;
        const intensityMap = new Float32Array(screenResolution * screenResolution);
        intensityMapRef.current = intensityMap; // Store reference for reset
        
        const canvas = document.createElement('canvas');
        canvas.width = screenResolution;
        canvas.height = screenResolution;
        const ctx = canvas.getContext('2d')!;
        
        const screenTexture = new THREE.CanvasTexture(canvas);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            map: screenTexture,
            side: THREE.DoubleSide 
        });
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(screenWidth, screenHeight),
            screenMaterial
        );
        screen.position.z = SCREEN_POSITION;
        scene.add(screen);

        // Photon system
        const maxPhotons = 2000;
        const photons: Photon[] = [];
        const photonGeometry = new THREE.BufferGeometry();
        const photonPositions = new Float32Array(maxPhotons * 3);
        const photonColors = new Float32Array(maxPhotons * 3);
        
        photonGeometry.setAttribute('position', new THREE.BufferAttribute(photonPositions, 3));
        photonGeometry.setAttribute('color', new THREE.BufferAttribute(photonColors, 3));
        
        const photonMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        const photonSystem = new THREE.Points(photonGeometry, photonMaterial);
        scene.add(photonSystem);

        // Add slit markers to show where slits are
        const slitMarkerGeometry = new THREE.BoxGeometry(0.1, SLIT_WIDTH, 0.4);
        const slitMarkerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.4
        });
        
        const slit1Marker = new THREE.Mesh(slitMarkerGeometry, slitMarkerMaterial);
        scene.add(slit1Marker);
        
        const slit2Marker = new THREE.Mesh(slitMarkerGeometry, slitMarkerMaterial);
        scene.add(slit2Marker);

        // Function to update slit marker positions
        function updateSlitMarkers() {
            const currentSeparation = slitSeparationRef.current;
            slit1Marker.position.set(0, currentSeparation / 2, BARRIER_POSITION);
            slit2Marker.position.set(0, -currentSeparation / 2, BARRIER_POSITION);
        }
        
        updateSlitMarkers();

        // Helper function to calculate wave interference
        function calculateInterference(x: number, y: number, z: number): number {
            if (z > BARRIER_POSITION) return 1.0;
            
            // Distances from each slit
            const currentSeparation = slitSeparationRef.current;
            const currentWavelength = wavelengthRef.current;
            const slit1Y = currentSeparation / 2;
            const slit2Y = -currentSeparation / 2;
            
            const d1 = Math.sqrt(Math.pow(y - slit1Y, 2) + Math.pow(z - BARRIER_POSITION, 2));
            const d2 = Math.sqrt(Math.pow(y - slit2Y, 2) + Math.pow(z - BARRIER_POSITION, 2));
            
            // Path difference
            const pathDiff = d1 - d2;
            
            // Phase difference
            const phaseDiff = (2 * Math.PI * pathDiff) / currentWavelength;
            
            // Interference: constructive when phase difference is multiple of 2π
            const interference = Math.pow(Math.cos(phaseDiff / 2), 2);
            
            return interference;
        }

        // Emit photons
        function emitPhoton() {
            if (photons.length >= maxPhotons) return;
            
            const spreadAngle = 0.4;
            const angle = (Math.random() - 0.5) * spreadAngle;
            const verticalSpread = (Math.random() - 0.5) * 1.5; // increased vertical spread
            
            const photon: Photon = {
                position: new THREE.Vector3(0, verticalSpread, SOURCE_POSITION),
                velocity: new THREE.Vector3(0, Math.sin(angle) * PHOTON_SPEED, -Math.cos(angle) * PHOTON_SPEED),
                wavelength: wavelengthRef.current,
                phase: Math.random() * Math.PI * 2,
                active: true
            };
            
            photons.push(photon);
        }

        // Update intensity map on screen
        function updateScreen() {
            // Decay old intensities slowly
            for (let i = 0; i < intensityMap.length; i++) {
                intensityMap[i] *= 0.999; // Very slow decay for persistent pattern
            }
            
            // Create heat map
            const imageData = ctx.createImageData(screenResolution, screenResolution);
            
            for (let y = 0; y < screenResolution; y++) {
                for (let x = 0; x < screenResolution; x++) {
                    const idx = y * screenResolution + x;
                    // Amplify the intensity for better visibility
                    const rawIntensity = intensityMap[idx];
                    const intensity = Math.min(rawIntensity * 1.5, 1.0);
                    
                    const pixelIdx = idx * 4;
                    
                    // Show even very low intensities
                    if (intensity > 0.005) {
                        // Color mapping: blue -> cyan -> yellow -> red
                        if (intensity < 0.25) {
                            imageData.data[pixelIdx] = 0;
                            imageData.data[pixelIdx + 1] = 0;
                            imageData.data[pixelIdx + 2] = Math.floor(intensity * 4 * 255);
                        } else if (intensity < 0.5) {
                            imageData.data[pixelIdx] = 0;
                            imageData.data[pixelIdx + 1] = Math.floor((intensity - 0.25) * 4 * 255);
                            imageData.data[pixelIdx + 2] = 255;
                        } else if (intensity < 0.75) {
                            imageData.data[pixelIdx] = Math.floor((intensity - 0.5) * 4 * 255);
                            imageData.data[pixelIdx + 1] = 255;
                            imageData.data[pixelIdx + 2] = Math.floor((1 - (intensity - 0.5) * 4) * 255);
                        } else {
                            imageData.data[pixelIdx] = 255;
                            imageData.data[pixelIdx + 1] = Math.floor((1 - (intensity - 0.75) * 4) * 255);
                            imageData.data[pixelIdx + 2] = 0;
                        }
                        imageData.data[pixelIdx + 3] = 255;
                    } else {
                        // Black background
                        imageData.data[pixelIdx] = 0;
                        imageData.data[pixelIdx + 1] = 0;
                        imageData.data[pixelIdx + 2] = 0;
                        imageData.data[pixelIdx + 3] = 255;
                    }
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            screenTexture.needsUpdate = true;
        }

        // Animation loop
        let frameCount = 0;
        function animate() {
            requestAnimationFrame(animate);
            frameCount++;

            // Animate light source glow
            const pulseScale = 1 + Math.sin(frameCount * 0.05) * 0.15;
            glow.scale.set(pulseScale, pulseScale, pulseScale);
            outerGlow.scale.set(pulseScale * 0.8, pulseScale * 0.8, pulseScale * 0.8);

            // Update barrier and slit positions if changed
            updateBarrierPositions();
            updateSlitMarkers();

            // Animate slit markers to draw attention
            const slitPulse = 0.4 + Math.sin(frameCount * 0.08) * 0.2;
            slit1Marker.material.opacity = slitPulse;
            slit2Marker.material.opacity = slitPulse;

            // Emit new photons only if running
            if (isRunningRef.current) {
                const currentEmissionRate = emissionRateRef.current;
                for (let i = 0; i < currentEmissionRate; i++) {
                    if (Math.random() < 0.8) {
                        emitPhoton();
                    }
                }
            }

            // Update photons
            let activePhotons = 0;
            const currentSeparation = slitSeparationRef.current;
            const shouldShowPhotons = showPhotonsRef.current;
            
            for (let i = photons.length - 1; i >= 0; i--) {
                const photon = photons[i];
                if (!photon.active) continue;

                // Update position only if running
                if (isRunningRef.current) {
                    photon.position.add(photon.velocity);
                    photon.phase += 0.3;
                }

                // Check barrier collision only once
                if (photon.position.z <= BARRIER_POSITION && 
                    photon.position.z > BARRIER_POSITION - 0.5 &&
                    photon.velocity.z < 0) {
                    
                    const distToSlit1 = Math.abs(photon.position.y - currentSeparation / 2);
                    const distToSlit2 = Math.abs(photon.position.y + currentSeparation / 2);
                    
                    // Check if photon passes through a slit
                    if (distToSlit1 > SLIT_WIDTH / 2 && distToSlit2 > SLIT_WIDTH / 2) {
                        // Blocked by barrier
                        photon.active = false;
                        continue;
                    }
                    
                    // Photon passed through a slit - apply diffraction
                    const diffraction = (Math.random() - 0.5) * 0.5;
                    photon.velocity.y += diffraction * PHOTON_SPEED;
                    photon.velocity.normalize().multiplyScalar(PHOTON_SPEED);
                }

                // Apply interference pattern only well after passing through slits
                // Make this VERY lenient to allow pattern to form
                if (photon.position.z < BARRIER_POSITION - 1.0) {
                    const interference = calculateInterference(
                        photon.position.x,
                        photon.position.y,
                        photon.position.z
                    );
                    
                    // Very lenient - let most photons through
                    // Only filter out very low interference areas
                    if (Math.random() > Math.sqrt(interference)) {
                        photon.active = false;
                        continue;
                    }
                }

                // Check screen collision - detect when photon crosses the screen plane
                if (photon.position.z <= SCREEN_POSITION && photon.velocity.z < 0) {
                    // Record hit on screen
                    const screenY = ((photon.position.y + screenHeight / 2) / screenHeight) * screenResolution;
                    const screenX = ((photon.position.x + screenWidth / 2) / screenWidth) * screenResolution;
                    
                    if (screenX >= 0 && screenX < screenResolution && 
                        screenY >= 0 && screenY < screenResolution) {
                        const idx = Math.floor(screenY) * screenResolution + Math.floor(screenX);
                        intensityMap[idx] += 1.0; // Increased for better visibility
                        setDetectionCount(prev => prev + 1);
                    }
                    
                    photon.active = false;
                    continue;
                }

                // Remove photons that went too far
                if (photon.position.z < SCREEN_POSITION - 1 || 
                    Math.abs(photon.position.y) > 10 ||
                    Math.abs(photon.position.x) > 10) {
                    photon.active = false;
                    continue;
                }

                // Update visual representation
                const idx = activePhotons * 3;
                photonPositions[idx] = photon.position.x;
                photonPositions[idx + 1] = photon.position.y;
                photonPositions[idx + 2] = photon.position.z;
                
                // Color based on position - brighter and changes based on location
                const hue = (Math.sin(photon.phase) + 1) / 2;
                
                // Make photons brighter when near or past the barrier
                if (photon.position.z <= BARRIER_POSITION) {
                    // Photons that passed through slits - bright cyan/yellow
                    photonColors[idx] = 0.7 + hue * 0.3;
                    photonColors[idx + 1] = 0.9 + hue * 0.1;
                    photonColors[idx + 2] = 1.0;
                } else {
                    // Photons before barrier - cyan/white
                    photonColors[idx] = 0.5 + hue * 0.5;
                    photonColors[idx + 1] = 0.7 + hue * 0.3;
                    photonColors[idx + 2] = 1.0;
                }
                
                activePhotons++;
            }

            // Remove inactive photons
            photons.splice(0, photons.length - activePhotons);

            // Update photon count
            setPhotonCount(activePhotons);

            // Update buffers
            photonGeometry.attributes.position.needsUpdate = true;
            photonGeometry.attributes.color.needsUpdate = true;
            photonGeometry.setDrawRange(0, activePhotons);
            
            // Hide/show photons based on toggle
            photonSystem.visible = shouldShowPhotons;

            // Update screen every few frames
            if (frameCount % 2 === 0) {
                updateScreen();
            }

            controls.update();
            renderer.render(scene, camera);
        }

        animate();

        // Cleanup
        return () => {
            renderer.dispose();
            photonGeometry.dispose();
            photonMaterial.dispose();
            screenTexture.dispose();
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
                initialSize={{ width: 340, height: "auto" }}
                minSize={{ width: 300, height: 400 }}
                maxSize={{ width: 450, height: 700 }}
                className="bg-black/90 backdrop-blur-sm border-zinc-700 shadow-2xl"
            >
                <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="text-center border-b border-zinc-700 pb-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Waves className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-sm font-semibold text-white">
                                Double-Slit Experiment
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Quantum wave interference
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
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        onClick={() => setIsRunning(!isRunning)}
                                        className={cn(
                                            "col-span-2 h-8 text-xs",
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
                                    <Button onClick={handleReset} variant="outline" size="sm" className="h-8" title="Reset all settings and clear screen">
                                        <RotateCcw className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => {
                                        if (intensityMapRef.current) {
                                            for (let i = 0; i < intensityMapRef.current.length; i++) {
                                                intensityMapRef.current[i] = 0;
                                            }
                                            setDetectionCount(0);
                                        }
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-7 text-xs text-zinc-400 hover:text-zinc-200"
                                >
                                    Clear Screen Pattern
                                </Button>
                            </div>

                            <div className="border-t border-zinc-700 pt-3" />

                            {/* Wavelength Control */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Waves className="w-3 h-3 text-cyan-400" />
                                        <span className="text-xs font-medium text-zinc-200">Wavelength</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                                        {wavelength.toFixed(2)} nm
                                    </span>
                                </div>
                                
                                <input
                                    type="range"
                                    min={0.1}
                                    max={1.5}
                                    step={0.05}
                                    value={wavelength}
                                    onChange={(e) => setWavelength(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                />
                                
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>0.1</span>
                                    <span>1.5</span>
                                </div>
                            </div>

                            {/* Slit Separation Control */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="w-3 h-3 text-green-400" />
                                        <span className="text-xs font-medium text-zinc-200">Slit Separation</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                                        {slitSeparation.toFixed(1)} units
                                    </span>
                                </div>
                                
                                <input
                                    type="range"
                                    min={0.5}
                                    max={4}
                                    step={0.1}
                                    value={slitSeparation}
                                    onChange={(e) => setSlitSeparation(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                />
                                
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>0.5</span>
                                    <span>4.0</span>
                                </div>
                            </div>

                            {/* Emission Rate Control */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-yellow-400" />
                                        <span className="text-xs font-medium text-zinc-200">Emission Rate</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                                        {emissionRate}/frame
                                    </span>
                                </div>
                                
                                <input
                                    type="range"
                                    min={1}
                                    max={15}
                                    step={1}
                                    value={emissionRate}
                                    onChange={(e) => setEmissionRate(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                />
                                
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>1</span>
                                    <span>15</span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-700 pt-3" />

                            {/* Photon Visibility Toggle */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-200">Show Photons</span>
                                    <button
                                        onClick={() => setShowPhotons(!showPhotons)}
                                        className={cn(
                                            "relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200",
                                            showPhotons ? "bg-blue-600" : "bg-zinc-600"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200",
                                                showPhotons ? "translate-x-5" : "translate-x-1"
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
                                    The double-slit experiment demonstrates wave-particle duality. 
                                    Single photons create an interference pattern, showing quantum behavior.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-zinc-200">Key Observations</h3>
                                <ul className="space-y-1.5 text-xs text-zinc-400">
                                    <li className="flex gap-2">
                                        <span className="text-cyan-400">•</span>
                                        Photons emit from right source
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">•</span>
                                        Pass through two slits in barrier
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400">•</span>
                                        Interference pattern on left screen
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-400">•</span>
                                        Smaller wavelength = tighter fringes
                                    </li>
                                </ul>
                            </div>

                            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                <h3 className="text-xs font-semibold mb-1 text-cyan-400">Heat Map Colors</h3>
                                <p className="text-xs text-zinc-400">
                                    Blue → Cyan → Yellow → Red represents increasing photon detection intensity
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Measurements Panel */}
                    <div className="border-t border-zinc-700 pt-3 mt-2">
                        <h3 className="text-xs font-semibold mb-3 text-zinc-200 flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-400">Active Photons</p>
                                <p className="text-sm font-bold text-cyan-400">{photonCount}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-400">Detections</p>
                                <p className="text-sm font-bold text-green-400">{detectionCount}</p>
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