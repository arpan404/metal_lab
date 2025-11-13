# Metal Lab

## Description
An advanced practical education platform that combines GPU-accelerated physics simulations with AI-powered tutoring. Metal Lab enables students to explore classical and quantum physics through interactive 3D experiments controlled and explained by Large Language Models.

---

## Inspiration
Since Covid, virtual labs have been extensively used by various educational institutions across the globe. Nvidia has recently been stressing more upon simulations for everything rather than animations. University of Colorado partnered with Nvidia to build PhET, a GPU-accelerated simulation based lab. That's when we got the idea of building something like PhET + Khan Academy where AI Assistant drive these simulations and also at the same time, allow users to learn, experiment around as well as play with physics simulations in a fun learning environment.

---

## What it does
Metal Lab is a practical learning app that acts as a virtual-lab and learning platform for students to gain experiential learning. It provides five historically significant physics experiments with AI-guided explanation and learning-experience. Furthermore, Metal Lab includes games that users can play, interact and learn from, all of which is GPU accelerated with the help of Metal shaders. Users can change parameters of the experiments at their convenience and even talk to the AI assistant - Mela, for doubts and gaining clarity on various physics concepts. Metal Labs helps the user progress through their coursework and monitor it in a unified dashboard. As a B2B business sold to high schools and undergraduate labs, Metal Lab's platform can help perform experiments that are almost impossible to include in a small-scale laboratory with limited equipment.

---

## How we built it

### Main Architecture
- **Next.js 15** (App Router) with **React 19** for the UI framework
- **TypeScript** for type safety across 15,000+ lines of code
- **Tailwind CSS + Radix UI** for modern, accessible components
- **Three.js** for 3D visualization and rendering
- **Zustand** for state management
- **Clerk** for authentication
- **Supabase** for PostgreSQL database

### WebGL Model, Scene and Effect Renders
- **Three.js** (jsm/examples) and simple geometries
- **Sketchfab** for free-licensed models of pendulum, nascar car

### Physics Engines and Math Calculations
- **Cannon-es** for using Cannon.js

### GPU Acceleration (WebGPU)
- **Metal** for Metal shaders to fully utilize metal GPUs on Apple Silicon (scalable for more complicated renders)
- **WGSL & GLSL**

### LLM APIs
- **xAI Grok** for concept explanations as well as chat assistant
- **ElevenLabs** for Text-to-Speech

## Challenges we ran into
- Finding the right 3D models and calculations that support the 3D graphics
- Renders and Scene generation
- Integrating LLM tool calls for LLM driven simulations (better explanation)
- Series of testing and debugging renders as well as LLM explanation points during the simulations

## Accomplishments that we're proud of
- LLM explanation points emulating AI driven simulations that use Text-to-speech
- Having 5+ experiments + a game that makes the practical learning on Metal Labs app a really fun experience
- Building physics engines for Kinematics, Waves and Particles, Quantum Mechanics (Basic) as well as Electromagnetism (NO UNITY or UNREAL)

---

## What we learned
- WebGL concepts with 2D and 3D renders, without use of engines like Unity and Unreal
- OpenAI Clip (incomplete implementation) for training AI on the live feed of the simulations

---

## Build (MVP)
### Simulations 
```
cd physics-engine/demo-app
npm run build
npm run dev
```

### App Platform
```
cd metal_lab
npm run dev
```

## What's next for Metal Lab
- Implement OpenAI Clip for consistent concept clarity according to what's shown on the simulations as well as different concepts that branch out when parameters are slightly changed (For example - Damped Oscillation of Foucault Pendulum, Double Slit Experiment variants)
- Have Grok change the parameters autonomously while explaining the concepts during the simulation runs
- Better Blender-built renders for realistic lab simulations
- Scaling it as a B2B business sold to high schools and university labs for STEM concepts on a subscription based revenue model.
