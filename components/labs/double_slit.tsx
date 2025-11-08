'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Photon {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    wavelength: number;
    phase: number;
    active: boolean;
}

export default function DoubleSlitExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Physical constants
        const WAVELENGTH = 0.5; // in arbitrary units
        const SLIT_SEPARATION = 2.0; // distance between slit centers
        const SLIT_WIDTH = 0.6; // width of each slit (increased for visibility)
        const BARRIER_POSITION = 0;
        const SCREEN_POSITION = -8;
        const SOURCE_POSITION = 10;
        const PHOTON_SPEED = 0.05; // slower for better visibility
        const EMISSION_RATE = 5; // more photons per frame

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
        topBarrier.position.set(0, SLIT_SEPARATION / 2 + SLIT_WIDTH / 2 + 1.5, BARRIER_POSITION);
        scene.add(topBarrier);

        // Bottom section of barrier
        const bottomBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(12, 3, 0.3),
            barrierMaterial
        );
        bottomBarrier.position.set(0, -SLIT_SEPARATION / 2 - SLIT_WIDTH / 2 - 1.5, BARRIER_POSITION);
        scene.add(bottomBarrier);

        // Middle section between slits
        const middleBarrier = new THREE.Mesh(
            new THREE.BoxGeometry(12, SLIT_SEPARATION - SLIT_WIDTH, 0.3),
            barrierMaterial
        );
        middleBarrier.position.set(0, 0, BARRIER_POSITION);
        scene.add(middleBarrier);

        // Detection screen with heat map
        const screenWidth = 12;
        const screenHeight = 8;
        const screenResolution = 128;
        const intensityMap = new Float32Array(screenResolution * screenResolution);
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
        slit1Marker.position.set(0, SLIT_SEPARATION / 2, BARRIER_POSITION);
        scene.add(slit1Marker);
        
        const slit2Marker = new THREE.Mesh(slitMarkerGeometry, slitMarkerMaterial);
        slit2Marker.position.set(0, -SLIT_SEPARATION / 2, BARRIER_POSITION);
        scene.add(slit2Marker);

        // Helper function to calculate wave interference
        function calculateInterference(x: number, y: number, z: number): number {
            if (z > BARRIER_POSITION) return 1.0;
            
            // Distances from each slit
            const slit1Y = SLIT_SEPARATION / 2;
            const slit2Y = -SLIT_SEPARATION / 2;
            
            const d1 = Math.sqrt(Math.pow(y - slit1Y, 2) + Math.pow(z - BARRIER_POSITION, 2));
            const d2 = Math.sqrt(Math.pow(y - slit2Y, 2) + Math.pow(z - BARRIER_POSITION, 2));
            
            // Path difference
            const pathDiff = d1 - d2;
            
            // Phase difference
            const phaseDiff = (2 * Math.PI * pathDiff) / WAVELENGTH;
            
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
                wavelength: WAVELENGTH,
                phase: Math.random() * Math.PI * 2,
                active: true
            };
            
            photons.push(photon);
        }

        // Update intensity map on screen
        function updateScreen() {
            // Decay old intensities
            for (let i = 0; i < intensityMap.length; i++) {
                intensityMap[i] *= 0.995;
            }
            
            // Create heat map
            const imageData = ctx.createImageData(screenResolution, screenResolution);
            
            for (let y = 0; y < screenResolution; y++) {
                for (let x = 0; x < screenResolution; x++) {
                    const idx = y * screenResolution + x;
                    const intensity = Math.min(intensityMap[idx] * 5, 1.0);
                    
                    const pixelIdx = idx * 4;
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

            // Animate slit markers to draw attention
            const slitPulse = 0.4 + Math.sin(frameCount * 0.08) * 0.2;
            slit1Marker.material.opacity = slitPulse;
            slit2Marker.material.opacity = slitPulse;

            // Emit new photons
            for (let i = 0; i < EMISSION_RATE; i++) {
                if (Math.random() < 0.8) {
                    emitPhoton();
                }
            }

            // Update photons
            let activePhotons = 0;
            for (let i = photons.length - 1; i >= 0; i--) {
                const photon = photons[i];
                if (!photon.active) continue;

                // Update position
                photon.position.add(photon.velocity);
                photon.phase += 0.3;

                // Check barrier collision
                if (Math.abs(photon.position.z - BARRIER_POSITION) < 0.2 && 
                    photon.velocity.z < 0) {
                    
                    const distToSlit1 = Math.abs(photon.position.y - SLIT_SEPARATION / 2);
                    const distToSlit2 = Math.abs(photon.position.y + SLIT_SEPARATION / 2);
                    
                    // Check if photon passes through a slit
                    if (distToSlit1 > SLIT_WIDTH / 2 && distToSlit2 > SLIT_WIDTH / 2) {
                        photon.active = false;
                        continue;
                    }
                    
                    // Apply wave diffraction after passing through slit
                    const diffraction = (Math.random() - 0.5) * 0.3;
                    photon.velocity.y += diffraction * PHOTON_SPEED;
                    photon.velocity.normalize().multiplyScalar(PHOTON_SPEED);
                }

                // Apply interference pattern
                if (photon.position.z < BARRIER_POSITION) {
                    const interference = calculateInterference(
                        photon.position.x,
                        photon.position.y,
                        photon.position.z
                    );
                    
                    // Quantum probability - photon survives based on interference
                    if (Math.random() > interference * 0.98) {
                        photon.active = false;
                        continue;
                    }
                }

                // Check screen collision
                if (photon.position.z <= SCREEN_POSITION && photon.velocity.z < 0) {
                    // Record hit on screen
                    const screenY = ((photon.position.y + screenHeight / 2) / screenHeight) * screenResolution;
                    const screenX = ((photon.position.x + screenWidth / 2) / screenWidth) * screenResolution;
                    
                    if (screenX >= 0 && screenX < screenResolution && 
                        screenY >= 0 && screenY < screenResolution) {
                        const idx = Math.floor(screenY) * screenResolution + Math.floor(screenX);
                        intensityMap[idx] += 0.3;
                    }
                    
                    photon.active = false;
                    continue;
                }

                // Remove photons that went too far
                if (photon.position.z < SCREEN_POSITION - 2 || 
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

            // Update buffers
            photonGeometry.attributes.position.needsUpdate = true;
            photonGeometry.attributes.color.needsUpdate = true;
            photonGeometry.setDrawRange(0, activePhotons);

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
        <div className="w-full h-full relative">
            <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
            <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm">
                <h3 className="font-bold mb-2">Double-Slit Experiment</h3>
                <p className="text-xs opacity-80">Photons emitted from source (right)</p>
                <p className="text-xs opacity-80">Pass through double slits (center)</p>
                <p className="text-xs opacity-80">Create interference pattern (left screen)</p>
                <p className="text-xs opacity-80 mt-2">Colors: Blue → Cyan → Yellow → Red (increasing intensity)</p>
            </div>
        </div>
    );
}