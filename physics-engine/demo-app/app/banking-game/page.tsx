'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'

export default function BankingGamePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [laps, setLaps] = useState(0)
  const [velocity, setVelocity] = useState(3)
  const velocityRef = useRef(velocity)

  useEffect(() => {
    velocityRef.current = velocity
  }, [velocity])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x1a1a2e)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 15, 20)
    camera.lookAt(0, 0, 0)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)

    // Simple circular track
    const trackRadius = 10
    const trackGeom = new THREE.TorusGeometry(trackRadius, 1.5, 16, 100)
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const track = new THREE.Mesh(trackGeom, trackMat)
    track.rotation.x = Math.PI / 2
    scene.add(track)

    // Simple car
    const carGeom = new THREE.BoxGeometry(0.6, 0.4, 1.2)
    const carMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    const car = new THREE.Mesh(carGeom, carMat)
    scene.add(car)

    let angle = 0
    let lapCount = 0
    let lastAngle = 0

    function animate() {
      requestAnimationFrame(animate)

      // Simple circular motion: v = ω * r, so ω = v/r
      angle += velocityRef.current * 0.016 / trackRadius

      // Check for lap completion
      if (angle > Math.PI * 2) {
        angle -= Math.PI * 2
        lapCount++
        setLaps(lapCount)
        setScore(prev => prev + 100)
      }

      const x = trackRadius * Math.cos(angle)
      const z = trackRadius * Math.sin(angle)

      car.position.set(x, 0, z)
      car.rotation.y = -angle + Math.PI / 2

      renderer.render(scene, camera)
    }
    animate()

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setVelocity(prev => Math.min(prev + 0.5, 10))
      } else if (e.key === 'ArrowDown') {
        setVelocity(prev => Math.max(prev - 0.5, 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
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
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>🏁 Banking Track</h1>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Use arrow keys to control speed</p>
        <div style={{ marginTop: '15px', fontSize: '14px' }}>
          <div>Score: <strong style={{ color: '#4CAF50' }}>{score}</strong></div>
          <div>Laps: <strong style={{ color: '#00d4ff' }}>{laps}</strong></div>
          <div>Speed: <strong style={{ color: '#ffaa00' }}>{velocity.toFixed(1)}</strong></div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '11px', color: '#888' }}>
          <div>↑ Speed Up</div>
          <div>↓ Slow Down</div>
        </div>
      </div>
    </div>
  )
}
