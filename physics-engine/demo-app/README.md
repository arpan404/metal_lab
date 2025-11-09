# Physics Demo - Next.js App

A clean Next.js application for running physics experiments with Three.js rendering.

## 🚀 Quick Start

```bash
cd physics-engine/demo-app
npm install
npm run dev
```

Then open **http://localhost:3001** in your browser.

## 📁 Structure

```
demo-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page with experiment list
│   ├── foucault/               # ✅ Foucault Pendulum (WORKING)
│   │   └── page.tsx
│   ├── double-slit/            # 🚧 Young's Double Slit (TODO)
│   │   └── page.tsx
│   ├── rutherford/             # 🚧 Rutherford (TODO)
│   ├── nascar/                 # 🚧 NASCAR Banking (TODO)
│   ├── millikan/               # 🚧 Millikan (TODO)
│   ├── banking-game/           # 🚧 Game 1 (TODO)
│   └── deflection-game/        # 🚧 Game 2 (TODO)
└── components/
    └── ThreeScene.tsx          # Reusable Three.js component
```

## ✅ Implemented

### Foucault Pendulum (`/foucault`)
- Full physics simulation with Coriolis effect
- Real-time parameter controls
- Air resistance modeling
- Trail visualization
- Live statistics panel

## 🚧 To Implement

Use the Foucault Pendulum page as a template for implementing the remaining experiments:

### 1. Young's Double Slit (`/double-slit`)
**Physics:**
- Interference pattern calculation
- Wave/photon modes
- Wavelength adjustment (380-750 nm)

**Implementation tips:**
- Use Canvas2D for interference pattern
- Create CanvasTexture in Three.js
- Update texture each frame

### 2. Rutherford Gold Foil (`/rutherford`)
**Physics:**
- Coulomb force: F = k × q₁ × q₂ / r²
- Alpha particle trajectories
- Scattering angle statistics

**Implementation tips:**
- Create particle emitter
- Calculate force each frame
- Store trails in array

### 3. NASCAR Banking (`/nascar`)
**Physics:**
- Downforce: F = 0.5 × ρ × C_L × A × v²
- Drag force
- Circular motion

**Implementation tips:**
- Create torus for track
- Rotate car around center
- Calculate forces based on velocity

### 4. Millikan Oil Drop (`/millikan`)
**Physics:**
- Electric force: F_e = q × E
- Stokes drag: F_d = 6πηrv
- Force balance

**Implementation tips:**
- Create parallel plates
- Spawn drops periodically
- Update positions based on forces

### 5. Banking Track Challenge (`/banking-game`)
**Game mechanics:**
- Lap timing
- Score system
- Best lap tracking

### 6. Atomic Deflection (`/deflection-game`)
**Game mechanics:**
- Target hitting
- Accuracy tracking
- Score system

## 🔧 How to Add a New Experiment

### Step 1: Create the physics class

In your experiment page (e.g., `app/my-experiment/page.tsx`):

```typescript
'use client'

import { useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import ThreeScene from '@/components/ThreeScene'
import Link from 'next/link'

export default function MyExperiment() {
  const [isRunning, setIsRunning] = useState(true)
  const experimentRef = useRef<any>(null)

  const handleInit = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    // Create your 3D objects here
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    experimentRef.current = { cube }
  }, [])

  const handleAnimate = useCallback((dt: number) => {
    if (!isRunning || !experimentRef.current) return

    // Update physics here
    experimentRef.current.cube.rotation.x += dt
    experimentRef.current.cube.rotation.y += dt
  }, [isRunning])

  return (
    <div style={{ position: 'relative' }}>
      <ThreeScene onInit={handleInit} onAnimate={handleAnimate} />
      {/* Add your UI here */}
    </div>
  )
}
```

### Step 2: Add controls

Look at `/foucault/page.tsx` for examples of:
- Parameter sliders
- Play/pause buttons
- Reset functionality
- Statistics panel

### Step 3: Add to home page

The home page (`app/page.tsx`) already lists all experiments.

## 🎨 Styling

Using inline styles for simplicity. The color scheme:
- Background: `linear-gradient(135deg, #0f0c29, #302b63, #24243e)`
- Primary: `#4CAF50` (green)
- Secondary: `#00d4ff` (cyan)
- Accent: `#ff00ff` (magenta)

## 🔬 Physics Implementation Tips

### 1. **Use proper timestep**
```typescript
const dt = Math.min(deltaTime, 0.1) // Cap at 0.1s
```

### 2. **Scale physics for visibility**
Many real physics values are too small/large:
```typescript
// Real Coriolis: 7.3e-5 rad/s → Scale up by 1000x
const precession = omega_earth * 1000
```

### 3. **Limit array sizes**
```typescript
if (trailPoints.length > 800) trailPoints.shift()
```

### 4. **Use PBR materials**
```typescript
new THREE.MeshStandardMaterial({
  color: 0xb87333,
  metalness: 0.85,
  roughness: 0.25
})
```

## 📊 Performance

- Target: 60 FPS
- Three.js automatically handles WebGL
- Use object pooling for particles
- Limit geometry complexity

## 🐛 Debugging

Check browser console for errors:
- Press F12 → Console tab
- Look for Three.js or React errors

## 📦 Dependencies

- **Next.js 15**: React framework
- **React 19**: UI library
- **Three.js**: WebGL rendering
- **TypeScript**: Type safety

## 🚢 Deployment

```bash
npm run build
npm start
```

## 📝 Notes

- All experiments run client-side (marked with `'use client'`)
- Three.js scene is managed by `ThreeScene` component
- Use `useCallback` to prevent recreation of handlers
- Use `useRef` to store mutable objects without triggering re-renders

## 🎓 Learning Resources

- [Three.js Docs](https://threejs.org/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)

## ✨ Features

✅ Clean React architecture
✅ TypeScript type safety
✅ Hot reload during development
✅ Responsive design
✅ Reusable Three.js component
✅ No build errors
✅ Production-ready

---

**Status:** Foucault Pendulum working, 6 more to implement!
