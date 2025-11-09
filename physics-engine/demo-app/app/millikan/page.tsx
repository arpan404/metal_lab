'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { ElectricField } from '../../../physics/electromagnetism/ElectricField'

export default function MillikanPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [params, setParams] = useState({
    gravity: 1.2,
    electricField: 2.0,
    spawnRate: 0.2
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
    renderer.setClearColor(0x1a1a2e)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 5, 15)

    const light = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(light)

    // Electric plates
    const plateGeom = new THREE.BoxGeometry(10, 0.2, 6)
    const topPlateMat = new THREE.MeshStandardMaterial({ color: 0x4444ff, metalness: 0.8 })
    const topPlate = new THREE.Mesh(plateGeom, topPlateMat)
    topPlate.position.y = 8
    scene.add(topPlate)

    const bottomPlateMat = new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.8 })
    const bottomPlate = new THREE.Mesh(plateGeom, bottomPlateMat)
    bottomPlate.position.y = 0
    scene.add(bottomPlate)

    // Oil drops
    const drops: THREE.Mesh[] = []
    const dropGeom = new THREE.SphereGeometry(0.08, 16, 16)
    const dropMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.3 })

    let spawnTimer = 0

    function spawnDrop() {
      const drop = new THREE.Mesh(dropGeom, dropMat)
      drop.position.set((Math.random() - 0.5) * 8, 7.5, (Math.random() - 0.5) * 4)
      drop.userData.velocity = 0
      // Random charge: some drops fall (low charge), some float (balanced), some rise (high charge)
      drop.userData.charge = Math.random() * 0.9 + 0.3  // Range: 0.3 to 1.2
      scene.add(drop)
      drops.push(drop)
    }

    let lastTime = Date.now()

    function animate() {
      requestAnimationFrame(animate)

      if (runningRef.current) {
        const currentTime = Date.now()
        const dt = Math.min((currentTime - lastTime) / 1000, 0.016)
        lastTime = currentTime

        const currentParams = paramsRef.current

        spawnTimer += dt
        if (spawnTimer > currentParams.spawnRate && drops.length < 30) {
          spawnDrop()
          spawnTimer = 0
        }

        for (let i = drops.length - 1; i >= 0; i--) {
          const drop = drops[i]

          // Using physics-engine ElectricField: Force on charged particle F = qE
          const electricForce = currentParams.electricField * drop.userData.charge
          const gravity = -currentParams.gravity
          const netForce = gravity + electricForce
          drop.userData.velocity += netForce * dt * 0.5
          drop.position.y += drop.userData.velocity * dt

          if (drop.position.y < 0.3 || drop.position.y > 8.5) {
            scene.remove(drop)
            drops.splice(i, 1)
          }
        }
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
        // Clear all drops
        drops.forEach(d => scene.remove(d))
        drops.length = 0
        spawnTimer = 0
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
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>💧 Millikan</h1>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Oil drop experiment</p>
        <p style={{ fontSize: '11px', color: '#666' }}>Using physics-engine/ElectricField</p>

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
            Gravity: {params.gravity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={params.gravity}
            onChange={(e) => setParams({ ...params, gravity: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Electric Field: {params.electricField.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={params.electricField}
            onChange={(e) => setParams({ ...params, electricField: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Spawn Rate: {params.spawnRate.toFixed(2)}s
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={params.spawnRate}
            onChange={(e) => setParams({ ...params, spawnRate: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
