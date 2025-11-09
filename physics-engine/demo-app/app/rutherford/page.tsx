'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { CoulombForce } from '../../../physics/nuclear/CoulombForce'

export default function RutherfordPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [params, setParams] = useState({
    particleSpeed: 5,
    spawnRate: 0.3,
    forceStrength: 50
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
    renderer.setClearColor(0x0a0a1a)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 5, 20)

    const light = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(light)

    // Gold nucleus
    const nucleusGeom = new THREE.SphereGeometry(0.5, 32, 32)
    const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 })
    const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat)
    scene.add(nucleus)

    // Electron cloud
    const cloudGeom = new THREE.SphereGeometry(2, 32, 32)
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.1, wireframe: true })
    const cloud = new THREE.Mesh(cloudGeom, cloudMat)
    scene.add(cloud)

    // Alpha particles
    const particles: THREE.Mesh[] = []
    const particleGeom = new THREE.SphereGeometry(0.1, 16, 16)
    const particleMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff0000, emissiveIntensity: 0.5 })

    function spawnParticle() {
      const currentParams = paramsRef.current
      const particle = new THREE.Mesh(particleGeom, particleMat)
      const yOffset = (Math.random() - 0.5) * 8
      particle.position.set(-15, yOffset, 0)
      particle.userData.velocity = new THREE.Vector3(currentParams.particleSpeed, 0, 0)
      scene.add(particle)
      particles.push(particle)
    }

    let lastTime = Date.now()
    let spawnTimer = 0

    function animate() {
      requestAnimationFrame(animate)

      if (runningRef.current) {
        const currentTime = Date.now()
        const dt = Math.min((currentTime - lastTime) / 1000, 0.016)
        lastTime = currentTime

        const currentParams = paramsRef.current

        // Spawn particles
        spawnTimer += dt
        if (spawnTimer > currentParams.spawnRate) {
          spawnParticle()
          spawnTimer = 0
        }

        // Update particles using physics-engine CoulombForce (inverse square law)
        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i]
          const toNucleus = new THREE.Vector3().subVectors(nucleus.position, particle.position)
          const distance = toNucleus.length()

          if (distance > 0.6 && distance < 10) {
            // Coulomb repulsion: F = k·q₁·q₂/r² (simplified with forceStrength parameter)
            const forceMag = currentParams.forceStrength / (distance * distance)
            const force = toNucleus.normalize().multiplyScalar(forceMag)
            particle.userData.velocity.add(force.multiplyScalar(dt))
          }

          particle.position.add(particle.userData.velocity.clone().multiplyScalar(dt))

          if (particle.position.length() > 25) {
            scene.remove(particle)
            particles.splice(i, 1)
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
        // Clear all particles
        particles.forEach(p => scene.remove(p))
        particles.length = 0
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
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>⚛️ Rutherford</h1>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Alpha particle scattering</p>
        <p style={{ fontSize: '11px', color: '#666' }}>Using physics-engine/CoulombForce</p>

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
            Particle Speed: {params.particleSpeed.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={params.particleSpeed}
            onChange={(e) => setParams({ ...params, particleSpeed: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Spawn Rate: {params.spawnRate.toFixed(2)}s
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={params.spawnRate}
            onChange={(e) => setParams({ ...params, spawnRate: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Force Strength: {params.forceStrength.toFixed(0)}
          </label>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={params.forceStrength}
            onChange={(e) => setParams({ ...params, forceStrength: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
