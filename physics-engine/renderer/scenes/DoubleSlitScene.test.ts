import * as THREE from 'three';
import { DoubleSlitScene } from './DoubleSlitScene';
import { describe, test, expect, beforeEach } from '@jest/globals';

function fakeExperiment() {
  let p = new Map<string, number>([
    ['slitSeparation', 0.002],
    ['slitWidth', 0.0005],
  ]);
  return {
    getParameter: (k: string) => p.get(k)!,
    getWaveField: () => new Float32Array(512*512).fill(0).map((_,i)=> (i%37===0? 0.8 : -0.3)) as any,
    getInterferencePattern: () => new Float32Array(256).fill(0).map((_,y)=> Math.abs(Math.sin(y/12))) as any,
  } as any;
}

test('updates DataTexture and screen texture without WebGL', async () => {
  const scene = new THREE.Scene();
  const exp = fakeExperiment();
  const ds = new DoubleSlitScene(scene, exp);
  await ds.initialize();

  // should not throw during updates
  ds.update(1/60);
  ds.update(1/60);

  // wave plane and screen should be present
  expect(scene.children.length).toBeGreaterThan(0);
});

