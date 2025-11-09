'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { Interference } from '../../../physics/quantum/Interference'

export default function DoubleSlitPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [params, setParams] = useState({
    slitSeparation: 2,
    wavelength: 0.5,
    distance: 8
  })
  const paramsRef = useRef(params)
  const [running, setRunning] = useState(true)
  const runningRef = useRef(running)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000011)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 0, 15)

    // Barrier with slits
    const barrierGeom = new THREE.BoxGeometry(0.2, 10, 5)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const barrier = new THREE.Mesh(barrierGeom, barrierMat)
    scene.add(barrier)

    // Slits (gaps in barrier)
    const slitMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
    const slitGeom = new THREE.BoxGeometry(0.3, 0.5, 0.1)
    const slit1 = new THREE.Mesh(slitGeom, slitMat)
    const slit2 = new THREE.Mesh(slitGeom, slitMat)
    scene.add(slit1)
    scene.add(slit2)

    // Screen with interference pattern
    const screenGeom = new THREE.PlaneGeometry(10, 10)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    const screenMat = new THREE.MeshBasicMaterial({ map: texture })
    const screen = new THREE.Mesh(screenGeom, screenMat)
    screen.position.x = -8
    scene.add(screen)

    // Lights
    const light = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(light)

    // Draw interference pattern
    function drawPattern() {
      const currentParams = paramsRef.current

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 256, 256)

      for (let y = 0; y < 256; y++) {
        const pos = (y - 128) / 20

        // Use physics-engine Interference module to calculate pattern
        const angle = Math.atan(pos / currentParams.distance)
        const intensity = Interference.intensity(
          angle,
          currentParams.wavelength,
          currentParams.slitSeparation,
          1.0
        )

        const brightness = Math.floor(intensity * 255)
        const r = brightness
        const g = Math.floor(brightness * 0.8)
        const b = brightness
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
        ctx.fillRect(0, y, 256, 1)
      }
      texture.needsUpdate = true

      // Update slit positions based on separation
      slit1.position.set(0, currentParams.slitSeparation / 2, 0)
      slit2.position.set(0, -currentParams.slitSeparation / 2, 0)
    }

    function animate() {
      requestAnimationFrame(animate)
      if (runningRef.current) {
        drawPattern()
      }
      renderer.render(scene, camera)
    }
    animate()

    // Button controls
    setTimeout(() => {
      const startBtn = document.getElementById('start-btn')
      const pauseBtn = document.getElementById('pause-btn')
      const resetBtn = document.getElementById('reset-btn')

      const handleStart = () => setRunning(true)
      const handlePause = () => setRunning(false)
      const handleReset = () => {
        setParams({ slitSeparation: 2, wavelength: 0.5, distance: 8 })
        setRunning(false)
      }

      startBtn?.addEventListener('click', handleStart)
      pauseBtn?.addEventListener('click', handlePause)
      resetBtn?.addEventListener('click', handleReset)
    }, 0)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} />
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'system-ui'
      }}>
        <Link href="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>🌊 Double Slit</h1>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Wave interference pattern</p>
        <p style={{ fontSize: '11px', color: '#666' }}>Using physics-engine/Interference</p>

        <div style={{ marginTop: '15px' }}>
          <button id="start-btn" style={{
            background: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '5px'
          }}>Start</button>
          <button id="pause-btn" style={{
            background: '#ff9800',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '5px'
          }}>Pause</button>
          <button id="reset-btn" style={{
            background: '#f44336',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>Reset</button>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Slit Separation: {params.slitSeparation.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={params.slitSeparation}
            onChange={(e) => setParams({ ...params, slitSeparation: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Wavelength: {params.wavelength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={params.wavelength}
            onChange={(e) => setParams({ ...params, wavelength: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Distance: {params.distance.toFixed(1)}
          </label>
          <input
            type="range"
            min="4"
            max="15"
            step="0.5"
            value={params.distance}
            onChange={(e) => setParams({ ...params, distance: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
