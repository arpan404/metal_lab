'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { CircularMotion } from '../../../physics/mechanics/CircularMotion'

export default function NASCARPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [params, setParams] = useState({
    velocity: 3,
    bankAngle: 0.3
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

    camera.position.set(0, 12, 18)
    camera.lookAt(0, 0, 0)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)

    // Simple circular track
    const trackRadius = 10
    const trackGeom = new THREE.TorusGeometry(trackRadius, 2, 16, 100)
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x222222 })
    const track = new THREE.Mesh(trackGeom, trackMat)
    track.rotation.x = Math.PI / 2
    scene.add(track)

    // Simple red car
    const carBody = new THREE.Group()
    const bodyGeom = new THREE.BoxGeometry(0.8, 0.4, 1.5)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const body = new THREE.Mesh(bodyGeom, bodyMat)
    carBody.add(body)

    // Add spoiler
    const spoilerGeom = new THREE.BoxGeometry(0.9, 0.1, 0.15)
    const spoiler = new THREE.Mesh(spoilerGeom, bodyMat)
    spoiler.position.set(0, 0.3, -0.7)
    carBody.add(spoiler)

    scene.add(carBody)

    let angle = 0

    function animate() {
      requestAnimationFrame(animate)

      const currentParams = paramsRef.current

      if (runningRef.current) {
        // Use physics-engine CircularMotion: ω = v/r
        const omega = CircularMotion.angularVelocity(currentParams.velocity, trackRadius)
        angle += omega * 0.016
      }

      // Use physics-engine CircularMotion to get position
      const position = CircularMotion.positionOnPath(trackRadius, angle)

      carBody.position.set(position.x, position.y, position.z)
      carBody.rotation.y = -angle + Math.PI / 2
      carBody.rotation.z = currentParams.bankAngle // Bank the car

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
        angle = 0
        setRunning(false)
      }

      startBtn?.addEventListener('click', handleStart)
      pauseBtn?.addEventListener('click', handlePause)
      resetBtn?.addEventListener('click', handleReset)

      return () => {
        startBtn?.removeEventListener('click', handleStart)
        pauseBtn?.removeEventListener('click', handlePause)
        resetBtn?.removeEventListener('click', handleReset)
      }
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
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>🏎️ NASCAR Banking</h1>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Red car on circular track</p>
        <p style={{ fontSize: '11px', color: '#666' }}>Using physics-engine/CircularMotion</p>

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
            Velocity: {params.velocity.toFixed(1)} m/s
          </label>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.5"
            value={params.velocity}
            onChange={(e) => setParams({ ...params, velocity: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Bank Angle: {params.bankAngle.toFixed(2)} rad
          </label>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={params.bankAngle}
            onChange={(e) => setParams({ ...params, bankAngle: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '15px', fontSize: '11px', color: '#888' }}>
          <div>Circular motion: v = ωr</div>
          <div>Centripetal acceleration: a = v²/r</div>
        </div>
      </div>
    </div>
  )
}
