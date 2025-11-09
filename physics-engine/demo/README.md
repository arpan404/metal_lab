# Physics Engine Demo

Interactive localhost demo showcasing WebGL simulations and physics games.

## Features

### 🌊 Wave Visualization
- Real-time quantum wave interference patterns
- Adjustable wave speed, height, and frequency
- GPU-accelerated vertex animations

### 🌍 Foucault Pendulum
- Earth's rotation demonstration
- Adjustable latitude and pendulum length
- Realistic precession physics

### ⚛️ Young's Double Slit Experiment
- Famous quantum physics experiment
- Adjustable slit separation and wavelength
- Particle visualization

### ✨ Particle System
- GPU-accelerated particle simulation
- 5000+ particles with physics
- Customizable gravity and particle count

### 🏎️ Banking Track Challenge
- NASCAR physics racing game
- Banked turn mechanics
- Lap counter and speed control

## Quick Start

### Installation

```bash
cd physics-engine/demo
npm install
```

### Run Development Server

```bash
npm run dev
```

Then open your browser to the URL shown (typically http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

## Controls

- **Start**: Begin the simulation
- **Pause**: Pause the simulation
- **Reset**: Reset to initial state

Each demo has specific controls for adjusting parameters in real-time.

## Technical Details

- **Renderer**: Three.js WebGL
- **Physics**: Custom physics calculations
- **Animation**: 60 FPS requestAnimationFrame loop
- **Responsive**: Adapts to window resize

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (WebGL required)

## Performance

- FPS counter shows real-time performance
- Frame counter tracks total frames rendered
- Elapsed time shows simulation duration

## Demo Structure

```
demo/
├── index.html       # Main HTML page with UI
├── demo.js         # Demo logic and Three.js setup
├── package.json    # Dependencies
└── README.md       # This file
```

## Troubleshooting

### Port Already in Use
If port 5173 is taken, Vite will automatically use the next available port.

### WebGL Not Supported
Make sure your browser supports WebGL 2.0. Check at https://get.webgl.org/

### Performance Issues
- Lower particle count in particle system demo
- Reduce wave grid resolution
- Close other browser tabs

## Future Enhancements

- [ ] Add more experiments
- [ ] Implement actual physics engine integration
- [ ] Add VR support
- [ ] Mobile touch controls
- [ ] Screenshot/recording functionality
- [ ] Save/load simulation states
