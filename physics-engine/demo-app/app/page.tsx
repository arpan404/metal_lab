'use client'

import Link from 'next/link'

export default function Home() {
  const experiments = [
    { id: 'foucault', name: '🌍 Foucault Pendulum', desc: 'Earth rotation via Coriolis effect' },
    { id: 'double-slit', name: '🌊 Young\'s Double Slit', desc: 'Wave-particle duality' },
    { id: 'rutherford', name: '⚛️ Rutherford Gold Foil', desc: 'Nuclear scattering' },
    { id: 'nascar', name: '🏎️ NASCAR Banking', desc: 'Circular motion physics' },
    { id: 'millikan', name: '💧 Millikan Oil Drop', desc: 'Elementary charge measurement' },
  ]

  const games = [
    { id: 'banking-game', name: '🏁 Banking Track Challenge', desc: 'Racing game' },
    { id: 'deflection-game', name: '💥 Atomic Deflection', desc: 'Target practice' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      padding: '40px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{
        fontSize: '48px',
        textAlign: 'center',
        marginBottom: '20px',
        textShadow: '0 0 20px rgba(76, 175, 80, 0.5)'
      }}>
        🧪 Metal Lab Physics Suite
      </h1>

      <p style={{ textAlign: 'center', fontSize: '18px', color: '#aaa', marginBottom: '60px' }}>
        Interactive Physics Experiments with Realistic Simulations
      </p>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '32px',
          marginBottom: '30px',
          color: '#00d4ff',
          borderBottom: '2px solid #00d4ff',
          paddingBottom: '10px'
        }}>
          🔬 Experiments
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {experiments.map(exp => (
            <Link
              key={exp.id}
              href={`/${exp.id}`}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{exp.name}</h3>
              <p style={{ color: '#ddd', fontSize: '14px' }}>{exp.desc}</p>
            </Link>
          ))}
        </div>

        <h2 style={{
          fontSize: '32px',
          marginBottom: '30px',
          color: '#ff00ff',
          borderBottom: '2px solid #ff00ff',
          paddingBottom: '10px'
        }}>
          🎮 Games
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {games.map(game => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '30px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{game.name}</h3>
              <p style={{ color: '#ddd', fontSize: '14px' }}>{game.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
