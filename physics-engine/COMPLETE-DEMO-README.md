# Complete Physics Demo - Metal Lab

## Overview

`complete-demo.html` is a **fully standalone** HTML file containing all 5 physics experiments and 2 games with realistic physics simulations and enhanced 3D rendering.

## How to Run

### Option 1: Using the Test Server (Recommended)
```bash
cd physics-engine
npm run serve
```
Then open: **http://localhost:3000/complete-demo.html**

### Option 2: Direct File Access
Simply open `complete-demo.html` directly in your browser (requires `three.min.js` in same directory).

## What's Included

### 🔬 5 Physics Experiments

#### 1. Foucault Pendulum 🌍
**Demonstrates:** Earth's rotation via Coriolis effect
**Enhanced Features:**
- Air resistance with drag coefficient (0.47 for sphere)
- Latitude-dependent precession rate
- Realistic brass/bronze PBR materials
- Trail visualization with 800-point history
- Real-time angle and precession tracking

**Parameters:**
- Length: 5-20 meters
- Gravity: 1-20 m/s²
- Damping: 0.98-1.0
- Latitude: 0-90 degrees
- Air Density: 0.5-2.0 kg/m³

**Physics:**
```
Angular acceleration: θ'' = -(g/L)sin(θ)
Precession rate: ω_precession = 2 * ω_earth * sin(latitude)
Air drag: F_drag = 0.5 * ρ * C_d * A * v²
```

---

#### 2. Young's Double Slit 🌊
**Demonstrates:** Wave-particle duality
**Enhanced Features:**
- Real-time interference pattern calculation
- Toggle between wave and photon modes
- Adjustable wavelength (380-750 nm) affects color
- Variable slit separation (100-500 μm)
- Photon emission and trajectory visualization

**Parameters:**
- Wavelength: 380-750 nm (violet to red)
- Slit Separation: 100-500 μm
- Photon Mode: On/Off

**Physics:**
```
Path difference: Δ = r₂ - r₁
Phase difference: φ = 2π * Δ / λ
Intensity: I = cos²(φ/2)
```

---

#### 3. Rutherford Gold Foil ⚛️
**Demonstrates:** Nuclear structure and Coulomb scattering
**Enhanced Features:**
- Coulomb force calculations for each particle
- Alpha particle trajectory tracking with trails
- Scattering angle statistics
- Variable nucleus charge (Z = 50-100)
- Real-time particle count and scattering events

**Parameters:**
- Nucleus Charge: 50-100 (Z, atomic number)
- Particle Speed: 1-5 × 10⁷ m/s

**Physics:**
```
Coulomb force: F = k * q₁ * q₂ / r²
where k = 8.99 × 10⁹ N·m²/C²
Scattering detected when deflection > 0.5 radians
```

---

#### 4. NASCAR Banking 🏎️
**Demonstrates:** Circular motion on banked curves
**Enhanced Features:**
- Aerodynamic downforce: F_down = 0.5 * ρ * C_L * A * v²
- Drag force modeling: F_drag = 0.5 * ρ * C_d * A * v²
- Bank angle visualization (car tilts with track)
- Variable friction coefficient
- Real-time force calculations

**Parameters:**
- Bank Angle: 0-35 degrees
- Velocity: 20-90 m/s
- Friction Coefficient: 0.3-1.2

**Physics:**
```
Downforce: F_down = 0.5 * ρ * C_L * A * v² (C_L = -2.5)
Drag: F_drag = 0.5 * ρ * C_d * A * v² (C_d = 0.3)
Centripetal: F_c = m * v² / r
```

---

#### 5. Millikan Oil Drop 💧
**Demonstrates:** Elementary charge measurement
**Enhanced Features:**
- Electric field force balance
- Stokes drag force: F_d = 6πηrv
- Gravity vs electric force competition
- Variable electric field strength (1-20 × 10⁴ V/m)
- Charge quantization (1e to 5e)
- Up to 30 simultaneous drops

**Parameters:**
- Electric Field: 1-20 × 10⁴ V/m
- Drop Charge: 1-5 elementary charges

**Physics:**
```
Forces:
  Gravity: F_g = m * g = ρ * V * g
  Electric: F_e = q * E
  Drag: F_d = 6πηrv (Stokes' law)
Net: F_net = F_e - F_g - F_d
```

---

### 🎮 2 Physics Games

#### 6. Banking Track Challenge 🏁
**Objective:** Optimize velocity and bank angle for fastest lap times
**Features:**
- Real-time lap timing
- Best lap tracking
- Score system (100 points per lap, 1000 for new record)
- Circular banked track
- Physics-based racing

**Parameters:**
- Velocity: 20-80 m/s
- Bank Angle: 0-30 degrees

**Scoring:**
- Complete lap: +100 points
- New best lap: +1000 points

---

#### 7. Atomic Deflection 💥
**Objective:** Hit moving atomic targets with projectiles
**Features:**
- 3 moving targets
- Auto-firing projectile system
- Accuracy tracking (hits/misses)
- Score system (100 points per hit)
- Respawning targets

**Scoring:**
- Hit target: +100 points
- Accuracy percentage displayed

---

## Technical Details

### Graphics
- **Engine:** Three.js r150+
- **Renderer:** WebGL with antialiasing
- **Shadows:** PCF soft shadows
- **Materials:** Physically Based Rendering (PBR)
  - Metalness and roughness properties
  - Emissive materials for glowing effects
- **Lighting:**
  - Ambient light (40% intensity)
  - Directional light with shadows (80% intensity)
  - Two colored point lights (cyan and magenta)

### Physics Timestep
- Maximum timestep: 0.1 seconds (prevents instability)
- Target framerate: 60 FPS
- Delta time smoothing

### Performance
- Trail points capped at 500-1000 per object
- Particle systems limited (e.g., max 30 oil drops)
- Efficient geometry updates
- Optimized material usage

## Controls

### Playback
- **▶️ Start:** Begin simulation
- **⏸️ Pause:** Pause simulation
- **🔄 Reset:** Reset to initial state

### Parameters
Each experiment has adjustable sliders for real-time parameter modification.

### Camera
Gentle auto-rotation around experiments for better viewing angles.

## Real-Time Statistics

Each experiment displays:
- **Status:** Running/Paused
- **Time:** Elapsed time in seconds
- **FPS:** Frames per second
- **Custom Measurements:** Experiment-specific data
  - Foucault: Angle, Precession, Speed
  - Double Slit: Wavelength, Photon count, Mode
  - Rutherford: Particles, Scattering events, Charge
  - NASCAR: Velocity, Downforce, Drag, Bank angle
  - Millikan: Active drops, E-field, Charge
  - Games: Score, performance metrics

## Educational Value

### Concepts Demonstrated
1. **Classical Mechanics:**
   - Pendulum motion
   - Coriolis effect
   - Circular motion
   - Banking physics
   - Force balance

2. **Quantum Mechanics:**
   - Wave-particle duality
   - Interference patterns
   - Probability distributions

3. **Nuclear Physics:**
   - Coulomb scattering
   - Nuclear structure
   - Alpha particles

4. **Electromagnetism:**
   - Electric fields
   - Force on charged particles
   - Elementary charge

5. **Fluid Mechanics:**
   - Air resistance
   - Stokes drag
   - Viscosity

## File Size
- complete-demo.html: ~55 KB
- Requires: three.min.js (~650 KB) in same directory

## Browser Compatibility
- Chrome/Edge: ✅ Recommended
- Firefox: ✅ Supported
- Safari: ✅ Supported
- Requires WebGL support

## Advantages Over TypeScript Source

### Standalone Demo Benefits:
✅ No build process required
✅ No Node.js installation needed
✅ Works offline (with local three.min.js)
✅ Single file for easy sharing
✅ Instant preview without compilation
✅ Great for classroom demonstrations

### TypeScript Source Benefits:
✅ Type safety
✅ Better code organization
✅ Full Next.js integration
✅ Advanced state management
✅ More extensive physics calculations
✅ Production-ready architecture

## Development Notes

### Adding New Experiments
1. Create new class (e.g., `MyExperiment`)
2. Implement required methods:
   - `setupMeshes()` - Create 3D objects
   - `update(dt)` - Physics calculations
   - `reset()` - Reset to initial state
   - `dispose()` - Clean up resources
   - `getMeasurements()` - Return stats object
   - Parameter setters (e.g., `setGravity(val)`)
3. Add to `demoConfigs` object
4. Add button in HTML sidebar

### Physics Scaling
Many physics values are scaled for better visualization:
- Real Millikan droplets: ~1 μm → Scaled to 0.08 units
- Real NASCAR speeds: ~90 m/s → Display units
- Real quantum wavelengths: 500 nm → Visible interference

## Future Enhancements
- [ ] Add more experiments (Photoelectric, Compton scattering)
- [ ] Export simulation data to CSV
- [ ] Screenshot/video recording
- [ ] Touch controls for mobile
- [ ] VR support
- [ ] Procedural track generation for games

## Credits

**Physics Implementation:** Realistic equations from classical/quantum mechanics
**Graphics:** Three.js WebGL library
**UI Design:** Modern gradient-based interface

---

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**License:** MIT
