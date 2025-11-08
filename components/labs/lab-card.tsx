import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import * as BABYLON from 'babylonjs'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, PlayCircle, CheckCircle } from 'lucide-react'

interface Lab {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'locked'
  progress: number
  modelUrl?: string
  category: string
}

interface LabCardProps {
  lab: Lab
}

export function LabCard({ lab }: LabCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<BABYLON.Engine | null>(null)
  const sceneRef = useRef<BABYLON.Scene | null>(null)

  useEffect(() => {
    if (!canvasRef.current || lab.status === 'locked') return

    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })
    engineRef.current = engine

    const createScene = () => {
      const scene = new BABYLON.Scene(engine)
      scene.clearColor = new BABYLON.Color4(0.98, 0.98, 0.99, 1)

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

      const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
      )
      light.intensity = 0.8

      // Create simple 3D model based on lab type
      if (lab.category === 'Wave Physics') {
        const points = []
        for (let i = 0; i < 100; i++) {
          const x = (i - 50) / 10
          const y = Math.sin(x * 2) * 2
          points.push(new BABYLON.Vector3(x, y, 0))
        }
        const lines = BABYLON.MeshBuilder.CreateLines('wave', { points }, scene)
        lines.color = new BABYLON.Color3(0.48, 0.24, 0.93)
      } else if (lab.category === 'Particle Physics') {
        const sphere1 = BABYLON.MeshBuilder.CreateSphere('sphere1', { diameter: 1 }, scene)
        sphere1.position = new BABYLON.Vector3(-2, 0, 0)
        const sphere2 = BABYLON.MeshBuilder.CreateSphere('sphere2', { diameter: 1 }, scene)
        sphere2.position = new BABYLON.Vector3(2, 0, 0)

        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        sphere1.material = material
        sphere2.material = material
      } else if (lab.category === 'Quantum Mechanics') {
        const torus = BABYLON.MeshBuilder.CreateTorus('torus', { diameter: 4, thickness: 0.2 }, scene)
        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        torus.material = material

        scene.registerBeforeRender(() => {
          torus.rotation.y += 0.01
        })
      } else {
        const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene)
        const material = new BABYLON.StandardMaterial('mat', scene)
        material.diffuseColor = new BABYLON.Color3(0.48, 0.24, 0.93)
        box.material = material

        scene.registerBeforeRender(() => {
          box.rotation.y += 0.01
        })
      }

      return scene
    }

    const scene = createScene()
    sceneRef.current = scene

    engine.runRenderLoop(() => {
      scene.render()
    })

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

  const getStatusBadge = () => {
    switch (lab.status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case 'locked':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-500">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        )
    }
  }

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 ${
        lab.status === 'locked'
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'
      }`}
    >
      {/* 3D Preview */}
      <div className="relative w-full h-56 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
        {lab.status === 'locked' ? (
          <div className="w-full h-full flex items-center justify-center backdrop-blur-sm">
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Complete previous labs to unlock</p>
            </div>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
          </>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          {getStatusBadge()}
          <Badge variant="outline" className="text-xs">{lab.category}</Badge>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">
          {lab.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{lab.description}</p>

        {lab.status !== 'locked' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-semibold text-gray-900">{lab.progress}%</span>
            </div>
            <Progress value={lab.progress} />
          </div>
        )}
      </CardContent>

      {lab.status !== 'locked' && (
        <CardFooter className="p-6 pt-0">
          <Link href={`/labs/${lab.id}`} className="w-full">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0">
              {lab.status === 'in-progress' ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Continue Lab
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review Lab
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
