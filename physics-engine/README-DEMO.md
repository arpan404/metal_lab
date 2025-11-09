# Metal Lab - Enhanced Experiments Demo

## Quick Start

The experiments have been enhanced with realistic physics in the TypeScript source files, but to see them running in the browser, you have two options:

### Option 1: Use the Main Next.js App (Recommended for full features)
```bash
cd /home/user/metal_lab
npm run dev
```
Then navigate to the experiments pages in the web app.

### Option 2: Standalone Demos (For testing)

The standalone demos in physics-engine/ are simplified versions for testing:
- `demo.html` - Simple pendulum with basic physics
- `demo-full.html` - All experiments with simplified physics
- `test-experiments.html` - UI mockup only

**Note:** These standalone demos don't use the full TypeScript codebase. They're simplified JavaScript implementations for quick testing.

## What Was Enhanced

All enhancements are in the TypeScript source files:

### Experiments (`physics-engine/experiments/`):
1. **FoucaultPendulum.ts** - Air resistance, precession tracking, trail visualization
2. **YoungDoubleSlit.ts** - Photon mode, quantum interference, detection counting
3. **RutherfordGoldFoil.ts** - Particle trails, scattering events, improved Coulomb forces
4. **NASCARBanking.ts** - Downforce, drag, tire slip, lateral G-forces  
5. **MillikanOilDrop.ts** - Temperature, air viscosity, Brownian motion prep

### Games (`physics-engine/games/`):
1. **BankedTrackChallenge.ts** - Best lap tracking, perfect lap bonus, combos
2. **AtomicDeflection.ts** - Progressive difficulty, power-ups, combo system

### Rendering (`physics-engine/renderer/scenes/`):
1. **FoucaultScene.ts** - Realistic materials, 3D string, gradient trails

## To See Full Features

Run the main application:
```bash
npm run dev
```

The standalone demos are just for quick visualization testing.
