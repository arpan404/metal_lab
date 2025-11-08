// physics-engine/renderer/scenes/FoucaultScene.ts
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import type { FoucaultPendulum } from '../../experiments/FoucaultPendulum';

/**
 * 3D scene for Foucault Pendulum experiment
 */

export class FoucaultScene extends BaseScene {
  private pendulum: FoucaultPendulum;
  private bob: THREE.Mesh | null = null;
  private string: THREE.Line | null = null;
  private trailPoints: THREE.Vector3[] = [];
  private trailLine: THREE.Line | null = null;
  
  constructor(scene: THREE.Scene, experiment: FoucaultPendulum) {
    super(scene, experiment);
    this.pendulum = experiment;
  }
  
  async initialize(): Promise<void> {
    // Create pendulum rig
    this.createPendulumRig();
    
    // Create bob
    this.createBob();
    
    // Create string
    this.createString();
    
    // Create trail
    this.createTrail();
    
    // Create ground reference
    this.createGround();
  }
  
  private createPendulumRig(): void {
    const length = this.pendulum.getParameter('length');
    
    // Support structure
    const supportGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
    const supportMaterial = this.createMaterial('metal', { color: 0x333333 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.y = length + 0.25;
    
    this.addObject('support', support);
    
    // Pivot point
    const pivotGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const pivotMaterial = this.createMaterial('metal', { color: 0x666666 });
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.y = length;
    
    this.addObject('pivot', pivot);
  }
  
  private createBob(): void {
    const bobRadius = 0.2;
    const bobGeometry = new THREE.SphereGeometry(bobRadius, 32, 32);
    const bobMaterial = this.createMaterial('metal', { color: 0xff6600 });
    
    this.bob = new THREE.Mesh(bobGeometry, bobMaterial);
    this.bob.castShadow = true;
    this.bob.receiveShadow = true;
    
    this.addObject('bob', this.bob);
  }
  
  private createString(): void {
    const points = [new THREE.Vector3(0, this.pendulum.getParameter('length'), 0), new THREE.Vector3(0, 0, 0)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 2 });
    
    this.string = new THREE.Line(geometry, material);
    this.addObject('string', this.string);
  }
  
  private createTrail(): void {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5
    });
    
    this.trailLine = new THREE.Line(geometry, material);
    this.addObject('trail', this.trailLine);
  }
  
  private createGround(): void {
    // Grid to show precession
    const gridSize = 20;
    const grid = new THREE.GridHelper(gridSize, 20, 0x444444, 0x222222);
    this.addObject('grid', grid);
    
    // Circular markers
    const circleGeometry = new THREE.RingGeometry(2, 2.1, 64);
    const circleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x444444,
      side: THREE.DoubleSide 
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    this.addObject('circle', circle);
  }
  
  update(deltaTime: number): void {
    const state = this.pendulum.getState();
    const length = this.pendulum.getParameter('length');
    
    if (this.bob && state.objects.length > 0) {
      const bobState = state.objects[0];
      
      // Update bob position
      this.bob.position.set(
        bobState.position.x,
        bobState.position.y,
        bobState.position.z
      );
      
      // Update string
      if (this.string) {
        const points = [
          new THREE.Vector3(0, length, 0),
          new THREE.Vector3(bobState.position.x, bobState.position.y, bobState.position.z)
        ];
        this.string.geometry.setFromPoints(points);
      }
      
      // Update trail
      this.trailPoints.push(new THREE.Vector3(
        bobState.position.x,
        bobState.position.y,
        bobState.position.z
      ));
      
      // Keep trail length reasonable
      if (this.trailPoints.length > 500) {
        this.trailPoints.shift();
      }
      
      if (this.trailLine) {
        this.trailLine.geometry.setFromPoints(this.trailPoints);
      }
    }
  }
  
  dispose(): void {
    this.clearObjects();
    this.trailPoints = [];
  }
}