'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'

export default function DeflectionGamePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x0a0a1a)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.set(0, 8, 15)

    const light = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(light)

    // Targets
    const targets: THREE.Mesh[] = []
    const targetGeom = new THREE.SphereGeometry(0.5, 32, 32)
    const targetMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.3 })

    for (let i = 0; i < 3; i++) {
      const target = new THREE.Mesh(targetGeom, targetMat)
      target.position.set((i - 1) * 5, 5, -8)
      scene.add(target)
      targets.push(target)
    }

    // Projectiles
    const projectiles: THREE.Mesh[] = []
    const projGeom = new THREE.SphereGeometry(0.1, 16, 16)
    const projMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.6 })

    function fireProjectile() {
      const projectile = new THREE.Mesh(projGeom, projMat)
      projectile.position.set(0, 2, 8)

      const targetIdx = Math.floor(Math.random() * targets.length)
      const target = targets[targetIdx]
      const direction = new THREE.Vector3().subVectors(target.position, projectile.position).normalize()
      projectile.userData.velocity = direction.multiplyScalar(10)

      scene.add(projectile)
      projectiles.push(projectile)
    }

    let spawnTimer = 0
    let lastTime = Date.now()

    function animate() {
      requestAnimationFrame(animate)

      const currentTime = Date.now()
      const dt = Math.min((currentTime - lastTime) / 1000, 0.016)
      lastTime = currentTime

      spawnTimer += dt
      if (spawnTimer > 0.5) {
        fireProjectile()
        spawnTimer = 0
      }

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i]
        proj.position.add(proj.userData.velocity.clone().multiplyScalar(dt))

        let hit = false
        for (const target of targets) {
          if (proj.position.distanceTo(target.position) < 0.6) {
            setScore(prev => prev + 100)
            setHits(prev => prev + 1)
            target.position.set((Math.random() - 0.5) * 10, 3 + Math.random() * 4, -8 - Math.random() * 2)
            hit = true
            break
          }
        }

        if (hit || proj.position.length() > 25) {
          if (!hit) setMisses(prev => prev + 1)
          scene.remove(proj)
          projectiles.splice(i, 1)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

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
        <h1 style={{ fontSize: '24px', margin: '10px 0' }}>💥 Atomic Deflection</h1>
        <div style={{ marginTop: '15px', fontSize: '14px' }}>
          <div>Score: <strong style={{ color: '#4CAF50' }}>{score}</strong></div>
          <div>Hits: <strong style={{ color: '#00d4ff' }}>{hits}</strong></div>
          <div>Misses: <strong style={{ color: '#ff4444' }}>{misses}</strong></div>
          <div>Accuracy: <strong style={{ color: '#ffaa00' }}>
            {hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(0) : 0}%
          </strong></div>
        </div>
      </div>
    </div>
  )
}
