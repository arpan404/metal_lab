'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeSceneProps {
  onInit: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void
  onAnimate: (deltaTime: number) => void
}

export default function ThreeScene({ onInit, onAnimate }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x1a1a2e)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    canvasRef.current.appendChild(renderer.domElement)

    // Default camera position
    camera.position.set(0, 8, 20)
    camera.lookAt(0, 5, 0)

    // Default lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(15, 20, 15)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5)
    pointLight1.position.set(-15, 10, -15)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.3)
    pointLight2.position.set(15, 10, -15)
    scene.add(pointLight2)

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222)
    scene.add(gridHelper)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    // Call parent init
    onInit(scene, camera, renderer)

    // Animation loop
    function animate() {
      const currentTime = Date.now()
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = currentTime

      onAnimate(dt)

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      animationIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationIdRef.current)
      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [onInit, onAnimate])

  return <div ref={canvasRef} style={{ width: '100%', height: '100vh' }} />
}
