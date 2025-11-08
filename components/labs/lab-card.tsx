import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import * as BABYLON from 'babylonjs'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, PlayCircle, CheckCircle, Clock, Award, TrendingUp, Sparkles } from 'lucide-react'
import { IconFlask } from '@tabler/icons-react'

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
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-50">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case 'locked':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        )
    }
  }

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 border-gray-200/60 ${
        lab.status === 'locked'
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'
      }`}
    >
      {/* 3D Preview */}
      <div className="relative w-full h-56 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {lab.status === 'locked' ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/80 text-sm font-medium">Complete previous labs to unlock</p>
              <p className="text-white/50 text-xs mt-2">Keep learning to access this experiment</p>
            </div>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Floating badge for completed labs */}
            {lab.status === 'completed' && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-emerald-500 text-white border-0 shadow-lg backdrop-blur-sm">
                  <Award className="w-3 h-3 mr-1" />
                  Mastered
                </Badge>
              </div>
            )}

            {/* Progress indicator overlay */}
            {lab.status === 'in-progress' && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/90">Progress</span>
                    <span className="text-xs font-bold text-white">{lab.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${lab.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <IconFlask className="w-4 h-4 text-purple-600" />
            </div>
            {getStatusBadge()}
          </div>
          <Badge variant="outline" className="text-xs border-gray-200">{lab.category}</Badge>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
          {lab.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{lab.description}</p>

        {lab.status !== 'locked' && (
          <div className="space-y-3">
            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-slate-600">
              {lab.status === 'completed' ? (
                <>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Certified</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~45 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{lab.progress}% done</span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Bar for in-progress */}
            {lab.status === 'in-progress' && (
              <div className="pt-2">
                <Progress value={lab.progress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>

      {lab.status !== 'locked' && (
        <CardFooter className="p-6 pt-0">
          <Link href={`/labs/${lab.id}`} className="w-full">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0 gap-2 group/btn">
              {lab.status === 'in-progress' ? (
                <>
                  <PlayCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  Continue Lab
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                  Review & Practice
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
