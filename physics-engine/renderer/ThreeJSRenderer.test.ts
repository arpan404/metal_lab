import * as THREE from 'three';
import { ThreeJSRenderer } from './ThreeJSRenderer';
import { describe, test, expect, beforeEach } from '@jest/globals';

test('creates renderer & scene and adds/removes objects', () => {
  document.body.innerHTML = `<canvas id="c" width="300" height="150"></canvas>`;
  const canvas = document.getElementById('c') as HTMLCanvasElement;

  const r = new ThreeJSRenderer(canvas, { antialias: true, shadows: true, physicallyCorrectLights: true });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial());
  r.add(box);
  expect(r.getScene().children).toContain(box);

  r.remove(box);
  expect(r.getScene().children).not.toContain(box);
});
