import { RotationalEngine } from './RotationalEngine';
import { describe, test, expect, beforeEach } from '@jest/globals';

test('precession period vs latitude', () => {
  const re = new RotationalEngine();
  // pole (90°): period ≈ 24h
  re.setEarthRotation(Math.PI/2);
  const T_pole = re.getPrecessionPeriod();
  expect(T_pole).toBeGreaterThan(23*3600);
  expect(T_pole).toBeLessThan(25*3600);

  // equator (0°): no precession (Infinity or very large)
  re.setEarthRotation(0);
  expect(re.getPrecessionPeriod()).toBe(Infinity);
});
