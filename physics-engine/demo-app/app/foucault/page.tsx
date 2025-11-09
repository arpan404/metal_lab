'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { Pendulum } from '../../../physics/mechanics/Pendulum'

export default function FoucaultPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [params, setParams] = useState({
    length: 10,
    gravity: 9.81,
    damping: 0.999
  })
  const paramsRef = useRef(params)

  // Keep paramsRef in sync with params
  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x1a1a2e)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 10, 25)
    camera.lookAt(0, 5, 0)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222)
    scene.add(gridHelper)

    // Pendulum state - using physics-engine types
    let pendulumState = {
      mass: 5,
      length: params.length,
      angle: 0.5,
      angularVelocity: 0,
      damping: 1 - (1 - params.damping) * 10
    }
    let running = isRunning

    // Pivot point
    const pivotGeom = new THREE.SphereGeometry(0.3, 32, 32)
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 })
    const pivot = new THREE.Mesh(pivotGeom, pivotMat)
    pivot.position.y = 10 // Fixed at initial value
    scene.add(pivot)

    // Bob (pendulum ball)
    const bobGeom = new THREE.SphereGeometry(0.4, 32, 32)
    const bobMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.2 })
    const bob = new THREE.Mesh(bobGeom, bobMat)
    scene.add(bob)

    // String
    const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    const stringGeom = new THREE.BufferGeometry()
    const stringPositions = new Float32Array(6) // 2 points * 3 coordinates
    stringGeom.setAttribute('position', new THREE.BufferAttribute(stringPositions, 3))
    const string = new THREE.Line(stringGeom, stringMat)
    scene.add(string)

    // Animation loop
    let lastTime = Date.now()

    function animate() {
      requestAnimationFrame(animate)

      const currentTime = Date.now()
      const dt = Math.min((currentTime - lastTime) / 1000, 0.016) // Cap at ~60fps
      lastTime = currentTime

      // Get current params from ref
      const currentParams = paramsRef.current

      // Only update physics if running
      if (running) {
        // Update pendulum state using physics-engine Pendulum class
        pendulumState.length = currentParams.length
        pendulumState.damping = 1 - (1 - currentParams.damping) * 10

        pendulumState = Pendulum.updateState(pendulumState, dt, currentParams.gravity)
      }

      // Always update positions (even when paused) using physics-engine calculations
      const bobPos = Pendulum.bobPosition(currentParams.length, pendulumState.angle)

      bob.position.set(bobPos.x, bobPos.y + currentParams.length, bobPos.z)

      // Update pivot position based on current length
      pivot.position.y = currentParams.length

      // Update string positions
      const posAttr = string.geometry.getAttribute('position')
      posAttr.setXYZ(0, 0, currentParams.length, 0) // Top (pivot)
      posAttr.setXYZ(1, bobPos.x, bobPos.y + currentParams.length, bobPos.z) // Bottom (bob)
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Control handlers
    const handleStart = () => {
      running = true
      setIsRunning(true)
    }
    const handlePause = () => {
      running = false
      setIsRunning(false)
    }
    const handleReset = () => {
      pendulumState.angle = 0.5
      pendulumState.angularVelocity = 0
      running = false
      setIsRunning(false)
    }

    // Use setTimeout to ensure buttons are in DOM
    setTimeout(() => {
      const startBtn = document.getElementById('start-btn')
      const pauseBtn = document.getElementById('pause-btn')
      const resetBtn = document.getElementById('reset-btn')

      startBtn?.addEventListener('click', handleStart)
      pauseBtn?.addEventListener('click', handlePause)
      resetBtn?.addEventListener('click', handleReset)
    }, 0)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      const startBtn = document.getElementById('start-btn')
      const pauseBtn = document.getElementById('pause-btn')
      const resetBtn = document.getElementById('reset-btn')
      startBtn?.removeEventListener('click', handleStart)
      pauseBtn?.removeEventListener('click', handlePause)
      resetBtn?.removeEventListener('click', handleReset)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, []) // Only create scene once

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} />

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: '320px',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'system-ui'
      }}>
        <Link href="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>🌍 Foucault Pendulum</h1>
        <p style={{ fontSize: '11px', color: '#666' }}>Using physics-engine/Pendulum</p>

        <div style={{ marginTop: '20px' }}>
          <button id="start-btn" style={{
            padding: '10px 20px',
            margin: '5px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}>▶️ Start</button>

          <button id="pause-btn" style={{
            padding: '10px 20px',
            margin: '5px',
            background: '#FF9800',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}>⏸️ Pause</button>

          <button id="reset-btn" style={{
            padding: '10px 20px',
            margin: '5px',
            background: '#f44336',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}>🔄 Reset</button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Length: {params.length.toFixed(1)}m
          </label>
          <input
            type="range"
            min="5"
            max="15"
            step="0.5"
            value={params.length}
            onChange={(e) => setParams(p => ({ ...p, length: parseFloat(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Gravity: {params.gravity.toFixed(2)} m/s²
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={params.gravity}
            onChange={(e) => setParams(p => ({ ...p, gravity: parseFloat(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Damping: {params.damping.toFixed(3)}
          </label>
          <input
            type="range"
            min="0.990"
            max="1.000"
            step="0.001"
            value={params.damping}
            onChange={(e) => setParams(p => ({ ...p, damping: parseFloat(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '5px' }}>
          <div style={{ fontSize: '12px' }}>Status: <strong>{isRunning ? 'Running ✅' : 'Paused ⏸️'}</strong></div>
        </div>
      </div>
    </div>
  )
}
