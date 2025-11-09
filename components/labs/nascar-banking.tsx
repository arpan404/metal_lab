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
  Gauge,
  TrendingUp,
  Info,
  Activity,
  Car,
  Circle,
} from 'lucide-react';

export default function NASCARBanking() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [velocity, setVelocity] = useState(3.0);
  const [bankAngle, setBankAngle] = useState(0.3);
  const [trackRadius, setTrackRadius] = useState(10);
  const [lapCount, setLapCount] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [centripetalAccel, setCentripetalAccel] = useState(0);

  const isRunningRef = useRef(isRunning);
  const velocityRef = useRef(velocity);
  const bankAngleRef = useRef(bankAngle);
  const trackRadiusRef = useRef(trackRadius);
  const angleRef = useRef(0);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    bankAngleRef.current = bankAngle;
  }, [bankAngle]);

  useEffect(() => {
    trackRadiusRef.current = trackRadius;
  }, [trackRadius]);

  const handleReset = () => {
    setIsRunning(false);
    setVelocity(3.0);
    setBankAngle(0.3);
    setTrackRadius(10);
    setLapCount(0);
    angleRef.current = 0;
    setCurrentSpeed(0);
    setCentripetalAccel(0);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 50);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 2, 0);

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
    controls.target.set(0, 2, 0);
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.1;

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff8e1, 1.2);
    sunLight.position.set(15, 25, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.4);
    fillLight.position.set(-10, 15, -10);
    scene.add(fillLight);

    // Rim light for highlights
    const rimLight = new THREE.DirectionalLight(0xffa500, 0.6);
    rimLight.position.set(-15, 10, 15);
    scene.add(rimLight);

    // Stadium lights around the track
    const stadiumLights: THREE.PointLight[] = [];
    const numStadiumLights = 8;
    for (let i = 0; i < numStadiumLights; i++) {
      const angle = (i / numStadiumLights) * Math.PI * 2;
      const radius = 18;
      const light = new THREE.PointLight(0xffffff, 1.5, 30);
      light.position.set(
        Math.cos(angle) * radius,
        12,
        Math.sin(angle) * radius
      );
      light.castShadow = true;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      scene.add(light);
      stadiumLights.push(light);

      // Light pole
      const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 12, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2,
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(
        Math.cos(angle) * radius,
        6,
        Math.sin(angle) * radius
      );
      pole.castShadow = true;
      pole.receiveShadow = true;
      scene.add(pole);

      // Light fixture
      const fixtureGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.5, 8);
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0xffff00,
        emissiveIntensity: 0.5,
      });
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.set(
        Math.cos(angle) * radius,
        12.5,
        Math.sin(angle) * radius
      );
      scene.add(fixture);

      // Light glow
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(fixture.position);
      scene.add(glow);
    }

    // Enhanced Ground with grass texture pattern
    const groundGeometry = new THREE.CircleGeometry(50, 128);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a5a2a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Infield grass (darker)
    const infieldGeometry = new THREE.CircleGeometry(7, 64);
    const infieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4a1a,
      roughness: 0.9,
    });
    const infield = new THREE.Mesh(infieldGeometry, infieldMaterial);
    infield.rotation.x = -Math.PI / 2;
    infield.position.y = 0.05;
    infield.receiveShadow = true;
    scene.add(infield);

    // Grandstands/barriers around track with spectators
    const barrierCount = 16;
    for (let i = 0; i < barrierCount; i++) {
      const angle = (i / barrierCount) * Math.PI * 2;
      const radius = 25;
      
      // Barrier wall with advertising
      const barrierGeometry = new THREE.BoxGeometry(4, 2, 0.3);
      const barrierMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x4444ff : 0xff4444,
        metalness: 0.3,
        roughness: 0.7,
        emissive: i % 2 === 0 ? 0x111133 : 0x331111,
        emissiveIntensity: 0.2,
      });
      const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      barrier.position.set(
        Math.cos(angle) * radius,
        1,
        Math.sin(angle) * radius
      );
      barrier.rotation.y = -angle + Math.PI / 2;
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      scene.add(barrier);

      // Grandstand seating behind barriers
      const standGeometry = new THREE.BoxGeometry(4, 3, 2);
      const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.1,
        roughness: 0.9,
      });
      const stand = new THREE.Mesh(standGeometry, standMaterial);
      stand.position.set(
        Math.cos(angle) * (radius + 1.5),
        2.5,
        Math.sin(angle) * (radius + 1.5)
      );
      stand.rotation.y = -angle + Math.PI / 2;
      stand.castShadow = true;
      stand.receiveShadow = true;
      scene.add(stand);

      // Add spectator lights (colored dots to simulate crowd)
      if (i % 2 === 0) {
        for (let j = 0; j < 3; j++) {
          const spectatorLight = new THREE.PointLight(
            Math.random() > 0.5 ? 0xffaa00 : 0x00aaff,
            0.5,
            3
          );
          spectatorLight.position.set(
            Math.cos(angle) * (radius + 1.5) + (Math.random() - 0.5) * 2,
            3 + Math.random() * 1.5,
            Math.sin(angle) * (radius + 1.5) + (Math.random() - 0.5) * 1
          );
          scene.add(spectatorLight);
        }
      }
    }

    // Pit lane markers
    for (let i = 0; i < 5; i++) {
      const pitMarkerGeometry = new THREE.BoxGeometry(0.5, 0.1, 1);
      const pitMarkerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xaaaa00,
        emissiveIntensity: 0.5,
      });
      const pitMarker = new THREE.Mesh(pitMarkerGeometry, pitMarkerMaterial);
      pitMarker.position.set(-8 + i * 1.5, 0.2, -15);
      pitMarker.rotation.x = -Math.PI / 2;
      pitMarker.castShadow = true;
      scene.add(pitMarker);
    }

    // Sky dome with gradient
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0x89b2eb) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Track function (updates with radius changes)
    let track: THREE.Mesh;
    let trackInner: THREE.Line;
    let trackOuter: THREE.Line;
    let currentTrackRadius = trackRadiusRef.current;
    
    function createTrack(radius: number) {
      currentTrackRadius = radius;
      // Remove old track
      if (track) scene.remove(track);
      if (trackInner) scene.remove(trackInner);
      if (trackOuter) scene.remove(trackOuter);

      // Track surface
      const trackGeometry = new THREE.TorusGeometry(radius, 2.5, 16, 100);
      const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
        metalness: 0.1,
      });
      track = new THREE.Mesh(trackGeometry, trackMaterial);
      track.rotation.x = Math.PI / 2;
      track.receiveShadow = true;
      track.castShadow = true;
      scene.add(track);

      // Inner track line
      const innerPoints = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        innerPoints.push(new THREE.Vector3(
          Math.cos(angle) * (radius - 2),
          0.1,
          Math.sin(angle) * (radius - 2)
        ));
      }
      const innerGeometry = new THREE.BufferGeometry().setFromPoints(innerPoints);
      const innerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      trackInner = new THREE.Line(innerGeometry, innerMaterial);
      scene.add(trackInner);

      // Outer track line
      const outerPoints = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        outerPoints.push(new THREE.Vector3(
          Math.cos(angle) * (radius + 2),
          0.1,
          Math.sin(angle) * (radius + 2)
        ));
      }
      const outerGeometry = new THREE.BufferGeometry().setFromPoints(outerPoints);
      const outerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      trackOuter = new THREE.Line(outerGeometry, outerMaterial);
      scene.add(trackOuter);

      // Start/Finish line (elevated slightly)
      const finishLineGeometry = new THREE.PlaneGeometry(5, 0.5);
      const finishLineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.3,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
      });
      const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
      finishLine.position.set(radius, 0.15, 0);
      finishLine.rotation.x = -Math.PI / 2;
      finishLine.receiveShadow = true;
      scene.add(finishLine);

      // Enhanced checkered pattern on finish line
      const checkerSize = 0.25;
      for (let i = -2; i <= 2; i++) {
        for (let j = 0; j < 2; j++) {
          if ((i + j) % 2 === 0) {
            const checkerGeometry = new THREE.PlaneGeometry(checkerSize, checkerSize);
            const checkerMaterial = new THREE.MeshStandardMaterial({
              color: 0x000000,
              metalness: 0.4,
              roughness: 0.4,
            });
            const checker = new THREE.Mesh(checkerGeometry, checkerMaterial);
            checker.position.set(radius + i * checkerSize, 0.16, j * checkerSize - checkerSize / 2);
            checker.rotation.x = -Math.PI / 2;
            checker.receiveShadow = true;
            scene.add(checker);
          }
        }
      }

      // Finish line banner/gantry
      const gantryPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
      const gantryPoleMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.1,
      });
      
      // Left pole
      const leftPole = new THREE.Mesh(gantryPoleGeometry, gantryPoleMaterial);
      leftPole.position.set(radius, 3, -3);
      leftPole.castShadow = true;
      scene.add(leftPole);

      // Right pole
      const rightPole = new THREE.Mesh(gantryPoleGeometry, gantryPoleMaterial);
      rightPole.position.set(radius, 3, 3);
      rightPole.castShadow = true;
      scene.add(rightPole);

      // Banner across top
      const bannerGeometry = new THREE.BoxGeometry(0.2, 0.3, 6.5);
      const bannerMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x550000,
        emissiveIntensity: 0.3,
      });
      const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
      banner.position.set(radius, 6, 0);
      banner.castShadow = true;
      scene.add(banner);
    }

    createTrack(trackRadiusRef.current);

    // NASCAR Car
    const carGroup = new THREE.Group();

    // Car body (larger and more visible)
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.6, 2.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x660000,
      emissiveIntensity: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    carGroup.add(body);

    // Car hood detail
    const hoodGeometry = new THREE.BoxGeometry(1.1, 0.08, 0.8);
    const hoodMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      metalness: 0.8,
      roughness: 0.2,
    });
    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    hood.position.set(0, 0.35, 0.7);
    hood.castShadow = true;
    carGroup.add(hood);

    // Windshield (larger)
    const windshieldGeometry = new THREE.BoxGeometry(1.0, 0.4, 0.6);
    const windshieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 0.4, 0.2);
    windshield.castShadow = true;
    carGroup.add(windshield);

    // Spoiler (larger and more visible)
    const spoilerGeometry = new THREE.BoxGeometry(1.3, 0.15, 0.2);
    const spoilerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x440000,
      emissiveIntensity: 0.2,
    });
    const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
    spoiler.position.set(0, 0.5, -1.0);
    spoiler.castShadow = true;
    carGroup.add(spoiler);

    // Front splitter
    const splitterGeometry = new THREE.BoxGeometry(1.3, 0.08, 0.3);
    const splitter = new THREE.Mesh(splitterGeometry, spoilerMaterial);
    splitter.position.set(0, -0.2, 1.15);
    splitter.castShadow = true;
    carGroup.add(splitter);

    // Wheels (larger and more visible)
    const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.2,
    });

    // Wheel rim detail
    const rimGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.16, 16);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1,
    });

    const wheelPositions = [
      [-0.6, -0.2, 0.8],   // Front left
      [0.6, -0.2, 0.8],    // Front right
      [-0.6, -0.2, -0.8],  // Back left
      [0.6, -0.2, -0.8],   // Back right
    ];

    const wheels: THREE.Group[] = [];
    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheelGroup.add(wheel);

      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      rim.castShadow = true;
      wheelGroup.add(rim);

      wheelGroup.position.set(pos[0], pos[1], pos[2]);
      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    // Car number (larger)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 256;
    context.fillStyle = '#ffffff';
    context.font = 'Bold 140px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('3', 128, 128);
    
    const numberTexture = new THREE.CanvasTexture(canvas);
    const numberMaterial = new THREE.MeshBasicMaterial({ 
      map: numberTexture,
      transparent: true,
    });
    const numberGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    
    // Number on both sides
    const numberPlaneLeft = new THREE.Mesh(numberGeometry, numberMaterial);
    numberPlaneLeft.position.set(-0.65, 0.1, 0);
    numberPlaneLeft.rotation.y = Math.PI / 2;
    carGroup.add(numberPlaneLeft);

    const numberPlaneRight = new THREE.Mesh(numberGeometry, numberMaterial);
    numberPlaneRight.position.set(0.65, 0.1, 0);
    numberPlaneRight.rotation.y = -Math.PI / 2;
    carGroup.add(numberPlaneRight);

    // Enhanced headlights (larger)
    const headlightGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffdd,
      emissive: 0xffff88,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.35, -0.08, 1.05);
    carGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.35, -0.08, 1.05);
    carGroup.add(rightHeadlight);

    // Headlight beams (brighter)
    const leftBeam = new THREE.SpotLight(0xffffdd, 3, 15, Math.PI / 5, 0.3, 1.5);
    leftBeam.position.set(-0.35, -0.08, 1.05);
    leftBeam.target.position.set(-0.35, 0, 5);
    leftBeam.castShadow = false;
    carGroup.add(leftBeam);
    carGroup.add(leftBeam.target);

    const rightBeam = new THREE.SpotLight(0xffffdd, 3, 15, Math.PI / 5, 0.3, 1.5);
    rightBeam.position.set(0.35, -0.08, 1.05);
    rightBeam.target.position.set(0.35, 0, 5);
    rightBeam.castShadow = false;
    carGroup.add(rightBeam);
    carGroup.add(rightBeam.target);

    // Taillights (larger)
    const taillightGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    
    const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.45, 0.05, -1.05);
    carGroup.add(leftTaillight);
    
    const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    rightTaillight.position.set(0.45, 0.05, -1.05);
    carGroup.add(rightTaillight);

    // Add glow to car (larger and more visible)
    const glowGeometry = new THREE.BoxGeometry(1.5, 0.8, 2.5);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.1;
    carGroup.add(glow);

    // Position car at starting position
    carGroup.position.set(currentTrackRadius, 0.5, 0);
    carGroup.rotation.y = Math.PI / 2;

    scene.add(carGroup);

    // Add a spotlight following the car
    const carSpotlight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 4, 0.5, 1);
    carSpotlight.position.set(0, 10, 0);
    carSpotlight.target = carGroup;
    carSpotlight.castShadow = true;
    scene.add(carSpotlight);
    scene.add(carSpotlight.target);

    // Enhanced speed trail particles with gradient
    const trailParticles: { position: THREE.Vector3; life: number; velocity: THREE.Vector3 }[] = [];
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: null }
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 5.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          gl_FragColor = vec4(1.0, 0.3, 0.0, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const trailPoints = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trailPoints);

    // Exhaust particles
    const exhaustParticles: { position: THREE.Vector3; life: number; velocity: THREE.Vector3 }[] = [];
    const exhaustGeometry = new THREE.BufferGeometry();
    const exhaustMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const exhaustPoints = new THREE.Points(exhaustGeometry, exhaustMaterial);
    scene.add(exhaustPoints);

    // Animation loop
    let lastAngle = 0;
    let frameCount = 0;

    function animate() {
      requestAnimationFrame(animate);
      frameCount++;

      const currentRadius = trackRadiusRef.current;
      const currentVelocity = velocityRef.current;
      const currentBankAngle = bankAngleRef.current;

      // Update track if radius changed significantly
      if (Math.abs(currentRadius - currentTrackRadius) > 0.5) {
        createTrack(currentRadius);
      }

      if (isRunningRef.current) {
        // Physics: ω = v/r (angular velocity)
        // More realistic time step
        const deltaTime = 0.016; // 60 FPS
        const omega = currentVelocity / currentRadius;
        angleRef.current += omega * deltaTime;

        // Normalize angle to 0-2π
        if (angleRef.current > Math.PI * 2) {
          angleRef.current -= Math.PI * 2;
          setLapCount((prev) => prev + 1);
        }

        // Lap counter (when crossing start line)
        if (lastAngle > Math.PI * 1.9 && angleRef.current < Math.PI * 0.1) {
          setLapCount((prev) => prev + 1);
        }
        lastAngle = angleRef.current;

        // Centripetal acceleration: a = v²/r
        const accel = (currentVelocity * currentVelocity) / currentRadius;
        setCentripetalAccel(accel);
        setCurrentSpeed(currentVelocity);
      }

      // Car position on circular path (elevated to track surface)
      const x = Math.cos(angleRef.current) * currentRadius;
      const z = Math.sin(angleRef.current) * currentRadius;
      carGroup.position.set(x, 0.5, z);

      // Car rotation (facing tangent to circle) - fixed direction
      carGroup.rotation.y = -angleRef.current + Math.PI / 2;
      
      // Bank angle (with smooth interpolation)
      const targetBankAngle = currentBankAngle;
      carGroup.rotation.z += (targetBankAngle - carGroup.rotation.z) * 0.1;

      // Wheel rotation based on velocity
      if (isRunningRef.current) {
        wheels.forEach((wheelGroup) => {
          wheelGroup.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              child.rotation.x += currentVelocity * 0.15;
            }
          });
        });
      }

      // Speed trail effect
      if (isRunningRef.current && frameCount % 2 === 0) {
        const tangentX = -Math.sin(angleRef.current);
        const tangentZ = Math.cos(angleRef.current);
        trailParticles.push({
          position: carGroup.position.clone(),
          life: 1.0,
          velocity: new THREE.Vector3(tangentX * -0.1, 0, tangentZ * -0.1),
        });
      }

      // Exhaust effect from back of car
      if (isRunningRef.current && frameCount % 3 === 0 && currentVelocity > 1) {
        const exhaustPos = carGroup.position.clone();
        const tangentX = -Math.sin(angleRef.current);
        const tangentZ = Math.cos(angleRef.current);
        
        // Offset to back of car
        const backOffsetX = Math.cos(angleRef.current - Math.PI / 2) * 1.2;
        const backOffsetZ = Math.sin(angleRef.current - Math.PI / 2) * 1.2;
        exhaustPos.x -= backOffsetX;
        exhaustPos.z -= backOffsetZ;
        exhaustPos.y = 0.2;
        
        exhaustParticles.push({
          position: exhaustPos,
          life: 0.8,
          velocity: new THREE.Vector3(
            tangentX * -0.3 + (Math.random() - 0.5) * 0.15,
            Math.random() * 0.15,
            tangentZ * -0.3 + (Math.random() - 0.5) * 0.15
          ),
        });
      }

      // Update trail particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        trailParticles[i].life -= 0.015;
        trailParticles[i].position.add(trailParticles[i].velocity);
        trailParticles[i].velocity.y -= 0.01; // Gravity
        if (trailParticles[i].life <= 0) {
          trailParticles.splice(i, 1);
        }
      }

      // Update exhaust particles
      for (let i = exhaustParticles.length - 1; i >= 0; i--) {
        exhaustParticles[i].life -= 0.03;
        exhaustParticles[i].position.add(exhaustParticles[i].velocity);
        exhaustParticles[i].velocity.multiplyScalar(0.95);
        if (exhaustParticles[i].life <= 0) {
          exhaustParticles.splice(i, 1);
        }
      }

      const positions = new Float32Array(trailParticles.length * 3);
      const alphas = new Float32Array(trailParticles.length);
      trailParticles.forEach((particle, i) => {
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        alphas[i] = particle.life;
      });
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      trailGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

      // Update exhaust
      const exhaustPositions = new Float32Array(exhaustParticles.length * 3);
      exhaustParticles.forEach((particle, i) => {
        exhaustPositions[i * 3] = particle.position.x;
        exhaustPositions[i * 3 + 1] = particle.position.y;
        exhaustPositions[i * 3 + 2] = particle.position.z;
      });
      exhaustGeometry.setAttribute('position', new THREE.BufferAttribute(exhaustPositions, 3));

      // Animate glow
      const glowPulse = Math.sin(frameCount * 0.1) * 0.1 + 0.9;
      glow.scale.set(glowPulse, glowPulse, glowPulse);

      // Animate stadium lights (pulse)
      stadiumLights.forEach((light, i) => {
        const pulse = Math.sin(frameCount * 0.05 + i * 0.5) * 0.2 + 1.3;
        light.intensity = pulse;
      });

      // Update car spotlight to follow car
      carSpotlight.position.set(
        carGroup.position.x,
        carGroup.position.y + 10,
        carGroup.position.z
      );

      // Dynamic sun position (optional, can be enabled for day/night cycle)
      // const sunAngle = frameCount * 0.001;
      // sunLight.position.x = Math.cos(sunAngle) * 20;
      // sunLight.position.y = Math.max(5, Math.sin(sunAngle) * 25);
      // sunLight.position.z = Math.sin(sunAngle) * 20;

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
              <Car className="w-5 h-5 text-red-400" />
              <h2 className="text-sm font-semibold text-white">
                NASCAR Banking
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Circular motion & centripetal force
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
                    title="Reset simulation"
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
                  <h3 className="text-xs font-semibold text-zinc-200">Performance</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Laps</p>
                    <p className="text-lg font-bold text-blue-400">{lapCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Speed</p>
                    <p className="text-lg font-bold text-green-400">{currentSpeed.toFixed(1)}</p>
                    <p className="text-xs text-zinc-500">m/s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">Accel</p>
                    <p className="text-lg font-bold text-orange-400">{centripetalAccel.toFixed(1)}</p>
                    <p className="text-xs text-zinc-500">m/s²</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3" />

              {/* Velocity Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-zinc-200">Velocity</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {velocity.toFixed(1)} m/s
                  </span>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={8.0}
                  step={0.5}
                  value={velocity}
                  onChange={(e) => setVelocity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Bank Angle Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-zinc-200">Bank Angle</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {(bankAngle * 180 / Math.PI).toFixed(1)}°
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={bankAngle}
                  onChange={(e) => setBankAngle(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>0°</span>
                  <span>46°</span>
                </div>
              </div>

              {/* Track Radius Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-zinc-200">Track Radius</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-700 text-zinc-300">
                    {trackRadius.toFixed(0)} m
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={trackRadius}
                  onChange={(e) => setTrackRadius(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Tight</span>
                  <span>Wide</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="text-xs font-semibold text-red-400">Racing Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setVelocity(2.0);
                      setBankAngle(0.2);
                      setTrackRadius(15);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Practice
                  </Button>
                  <Button
                    onClick={() => {
                      setVelocity(6.0);
                      setBankAngle(0.6);
                      setTrackRadius(10);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Race Speed
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
                  NASCAR tracks use banked turns to allow cars to maintain high speeds
                  through corners. Banking helps the normal force provide the centripetal
                  force needed for circular motion, reducing reliance on friction.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200">Physics</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-green-400">•</span>
                    Angular velocity: ω = v/r
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-400">•</span>
                    Centripetal accel: a = v²/r
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    Banking reduces tire slip
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    Faster speed needs more banking
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">•</span>
                    Tighter turns need more force
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="text-xs font-semibold mb-1 text-red-400">Fun Fact</h3>
                <p className="text-xs text-zinc-400">
                  The Daytona International Speedway has turns banked at 31°,
                  allowing cars to reach speeds over 200 mph!
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
