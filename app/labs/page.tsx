'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as BABYLON from 'babylonjs'

interface Lab {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'locked'
  progress: number
  modelUrl?: string
  category: string
}

const labs: Lab[] = [
  {
    id: '1',
    title: 'Wave Interference Pattern',
    description: 'Double-slit experiment simulation with varying wavelengths',
    status: 'completed',
    progress: 100,
    category: 'Wave Physics'
  },
  {
    id: '2',
    title: 'Particle Collision Dynamics',
    description: 'Elastic and inelastic collision simulations',
    status: 'completed',
    progress: 100,
    category: 'Particle Physics'
  },
  {
    id: '3',
    title: 'Quantum Tunneling',
    description: 'Probability calculations for barrier penetration',
    status: 'in-progress',
    progress: 50,
    category: 'Quantum Mechanics'
  },
  {
    id: '4',
    title: 'Harmonic Oscillator',
    description: 'Energy levels and wave functions visualization',
    status: 'completed',
    progress: 100,
    category: 'Classical Mechanics'
  },
  {
    id: '5',
    title: 'Schrödinger Equation',
    description: 'Time-dependent solutions for various potentials',
    status: 'locked',
    progress: 0,
    category: 'Quantum Mechanics'
  },
  {
    id: '6',
    title: 'Quantum Entanglement',
    description: 'Bell state measurements and correlations',
    status: 'locked',
    progress: 0,
    category: 'Quantum Mechanics'
  }
]

function LabCard({ lab }: { lab: Lab }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<BABYLON.Engine | null>(null)
  const sceneRef = useRef<BABYLON.Scene | null>(null)

  useEffect(() => {
    if (!canvasRef.current || lab.status === 'locked') return

    // Initialize Babylon.js engine and scene
    const engine = new BABYLON.Engine(canvasRef.current, true)
    engineRef.current = engine

    const createScene = () => {
      const scene = new BABYLON.Scene(engine)
      scene.clearColor = new BABYLON.Color4(0.95, 0.95, 0.97, 1)

      // Camera
      const camera = new BABYLON.ArcRotateCamera(
        'camera',
        Math.PI / 4,
        Math.PI / 3,
        10,
        BABYLON.Vector3.Zero(),
        scene
      )
      camera.attachControl(canvasRef.current, false)
      camera.lowerRadiusLimit = 5
      camera.upperRadiusLimit = 20

      // Lighting
      const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
      )
      light.intensity = 0.7

      // Create simple 3D model based on lab type
      if (lab.category === 'Wave Physics') {
        // Create wave pattern
        const points = []
        for (let i = 0; i < 100; i++) {
          const x = (i - 50) / 10
          const y = Math.sin(x * 2) * 2
          points.push(new BABYLON.Vector3(x, y, 0))
        }
        const lines = BABYLON.MeshBuilder.CreateLines('wave', { points }, scene)
        lines.color = new BABYLON.Color3(0.48, 0.24, 0.93)
      } else if (lab.category === 'Particle Physics') {
        // Create particle spheres
        const sphere1 = BABYLON.MeshBuilder.CreateSphere('sphere1', { diameter: 1 }, scene)
        sphere1.position = new BABYLON.Vector3(-2, 0, 0)
        const sphere2 = BABYLON.MeshBuilder.CreateSphere('sphere2', { diameter: 1 }, scene)
        sphere2.position = new BABYLON.Vector3(2, 0, 0)
        
        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        sphere1.material = material
        sphere2.material = material
      } else if (lab.category === 'Quantum Mechanics') {
        // Create orbital visualization
        const torus = BABYLON.MeshBuilder.CreateTorus('torus', { diameter: 4, thickness: 0.2 }, scene)
        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        torus.material = material
        
        // Animate rotation
        scene.registerBeforeRender(() => {
          torus.rotation.y += 0.01
        })
      } else {
        // Default box
        const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene)
        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        box.material = material
      }

      return scene
    }

    const scene = createScene()
    sceneRef.current = scene

    engine.runRenderLoop(() => {
      scene.render()
    })

    // Resize handler
    const handleResize = () => {
      engine.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      scene.dispose()
      engine.dispose()
    }
  }, [lab])

  const getStatusColor = () => {
    switch (lab.status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'locked':
        return 'bg-gray-100 text-gray-500'
    }
  }

  const getStatusText = () => {
    switch (lab.status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'locked':
        return 'Locked'
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg ${
      lab.status === 'locked' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'
    }`}>
      {/* 3D Preview */}
      <div className="relative w-full h-64 bg-gray-50">
        {lab.status === 'locked' ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <p className="text-gray-500 text-sm">Complete previous labs to unlock</p>
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-xs text-gray-500">{lab.category}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{lab.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{lab.description}</p>

        {lab.status !== 'locked' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{lab.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${lab.progress}%` }}
              />
            </div>
          </div>
        )}

        {lab.status !== 'locked' && (
          <button className="w-full mt-4 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            {lab.status === 'in-progress' ? 'Continue Lab' : 'Review Lab'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function LabsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'locked'>('all')

  const filteredLabs = labs.filter(lab => {
    if (filter === 'all') return true
    return lab.status === filter
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
            M
          </div>
          <span className="text-lg font-semibold">Metal Lab</span>
        </div>

        <nav className="flex gap-8">
          <a href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors">
            <span>📊</span> Dashboard
          </a>
          <a href="/labs" className="flex items-center gap-2 text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
            <span>🧪</span> Labs
          </a>
          <a href="/progress" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors">
            <span>📈</span> Progress
          </a>
        </nav>

        <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <span>🔓</span> Signout
        </button>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Physics Labs</h1>
          <p className="text-gray-600">Choose a lab to start or continue your experiment</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 font-medium transition-colors ${
              filter === 'all'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Labs ({labs.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`pb-3 px-1 font-medium transition-colors ${
              filter === 'in-progress'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Progress ({labs.filter(l => l.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-3 px-1 font-medium transition-colors ${
              filter === 'completed'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({labs.filter(l => l.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`pb-3 px-1 font-medium transition-colors ${
              filter === 'locked'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Locked ({labs.filter(l => l.status === 'locked').length})
          </button>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>
    </main>
  )
}