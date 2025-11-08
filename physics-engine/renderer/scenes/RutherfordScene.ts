// physics-engine/renderer/scenes/RutherfordScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { RutherfordGoldFoil } from '../../experiments/RutherfordGoldFoil';

/**
 * 3D scene for Rutherford gold foil experiment
 */

export class RutherfordScene extends BaseScene {
  private rutherford: RutherfordGoldFoil;
  private nucleus: THREE.Mesh | null = null;
  private foil: THREE.Mesh | null = null;
  private particles: Map<string, THREE.Mesh> = new Map();
  private trails: Map<string, THREE.Line> = new Map();
  private detectors: THREE.Group[] = [];
  
  constructor(scene: THREE.Scene, experiment: RutherfordGoldFoil) {
    super(scene, experiment);
    this.rutherford = experiment;
  }
  
  async initialize(): Promise<void> {
    // Create gold nucleus
    this.createNucleus();
    
    // Create gold foil
    this.createFoil();
    
    // Create particle source
    this.createSource();
    
    // Create detectors
    this.createDetectors();
  }
  
  private createNucleus(): void {
    // Nucleus (very small, but scaled up for visibility)
    const nucleusGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });
    
    this.nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    this.nucleus.position.set(0, 0, 0);
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.nucleus.add(glow);
    
    this.addObject('nucleus', this.nucleus);
  }
  
  private createFoil(): void {
    // Thin gold foil
    const foilGeometry = new THREE.PlaneGeometry(20, 20);
    const foilMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1.0,
      roughness: 0.3,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    
    this.foil = new THREE.Mesh(foilGeometry, foilMaterial);
    this.foil.position.z = 0;
    
    this.addObject('foil', this.foil);
  }
  
  private createSource(): void {
    // Radioactive source
    const sourceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const sourceMaterial = this.createMaterial('metal', {
      color: 0x666666,
      emissive: 0xff0000,
      emissiveIntensity: 0.3
    });
    
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    source.position.set(0, 0, -10);
    source.rotation.x = Math.PI / 2;
    
    this.addObject('source', source);
    
    // Shielding with aperture
    const shieldGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
    const shieldMaterial = this.createMaterial('metal', { color: 0x333333 });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.set(0, 0, -9);
    shield.rotation.x = Math.PI / 2;
    
    this.addObject('shield', shield);
  }
  
  private createDetectors(): void {
    // Create ring of detectors at various angles
    const detectorAngles = [10, 30, 45, 60, 90, 120, 150];
    const detectorDistance = 15;
    
    detectorAngles.forEach(angleDeg => {
      const angleRad = angleDeg * Math.PI / 180;
      
      const detectorGroup = new THREE.Group();
      
      // Detector body
      const detectorGeometry = new THREE.BoxGeometry(1, 2, 0.5);
      const detectorMaterial = this.createMaterial('metal', { color: 0x444444 });
      const detector = new THREE.Mesh(detectorGeometry, detectorMaterial);
      detectorGroup.add(detector);
      
      // Scintillator
      const scintGeometry = new THREE.PlaneGeometry(0.8, 1.8);
      const scintMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
      });
      const scint = new THREE.Mesh(scintGeometry, scintMaterial);
      scint.position.z = 0.26;
      detectorGroup.add(scint);
      
      // Position detector
      detectorGroup.position.x = detectorDistance * Math.sin(angleRad);
      detectorGroup.position.z = detectorDistance * Math.cos(angleRad);
      detectorGroup.lookAt(0, 0, 0);
      
      this.scene.add(detectorGroup);
      this.detectors.push(detectorGroup);
    });
  }
  
  update(deltaTime: number): void {
    const particles = this.rutherford.getActiveParticles();
    
    // Update particle positions and trails
    particles.forEach(particleData => {
      let particle = this.particles.get(particleData.id);
      
      if (!particle) {
        // Create new particle
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: 0xff6600,
          emissive: 0xff3300,
          emissiveIntensity: 0.5
        });
        
        particle = new THREE.Mesh(geometry, material);
        this.scene.add(particle);
        this.particles.set(particleData.id, particle);
        
        // Create trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.5
        });
        
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(trail);
        this.trails.set(particleData.id, trail);
      }
      
      // Update position
      particle.position.set(
        particleData.position.x * 10, // Scale for visibility
        particleData.position.y * 10,
        particleData.position.z * 10
      );
      
      // Update trail
      const trail = this.trails.get(particleData.id);
      if (trail) {
        const positions = trail.geometry.attributes.position?.array as Float32Array;
        if (positions) {
          const newPositions = new Float32Array([
            ...positions,
            particle.position.x,
            particle.position.y,
            particle.position.z
          ]);
          trail.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(newPositions, 3)
          );
        } else {
          trail.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
              new Float32Array([
                particle.position.x,
                particle.position.y,
                particle.position.z
              ]),
              3
            )
          );
        }
      }
    });
    
    // Remove old particles
    const activeIds = new Set(particles.map(p => p.id));
    this.particles.forEach((particle, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(particle);
        this.particles.delete(id);
        
        const trail = this.trails.get(id);
        if (trail) {
          this.scene.remove(trail);
          this.trails.delete(id);
        }
      }
    });
  }
  
  dispose(): void {
    this.clearObjects();
    this.particles.forEach(particle => this.scene.remove(particle));
    this.particles.clear();
    this.trails.forEach(trail => this.scene.remove(trail));
    this.trails.clear();
    this.detectors.forEach(detector => this.scene.remove(detector));
    this.detectors = [];
  }
}