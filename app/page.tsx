'use client'
import React from 'react'

export default function Page() {
  return (
    <main>
      <header>
        <div className="logo-section">
          <div className="logo">M</div>
          <span className="brand-name">Metal Lab</span>
        </div>

        <nav>
          <a href="#" className="active">
            <span>📊</span> Dashboard
          </a>
          <a href="#">
            <span>🧪</span> Labs
          </a>
          <a href="#">
            <span>📈</span> Progress
          </a>
        </nav>

        <div className="user-section">
          <button className="signout-btn">
            <span>🔓</span> Signout
          </button>
        </div>
      </header>

      <div className="container">
        <div className="welcome-section">
          <h1>Welcome back, Student! 👋</h1>
          <p>Here's your learning progress and activity overview</p>
        </div>

        <div className="state-card">
          <div className="state-title">Current Learning State</div>
          <div className="state-value">Quantum Mechanics - Wave Functions</div>
          <div className="state-details">
            <div className="state-detail">
              <div className="state-detail-value">2.5 hrs</div>
              <div className="state-detail-label">Today</div>
            </div>
            <div className="state-detail">
              <div className="state-detail-value">15 hrs</div>
              <div className="state-detail-label">This Week</div>
            </div>
            <div className="state-detail">
              <div className="state-detail-value">Level 3</div>
              <div className="state-detail-label">Current Level</div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}>🧪</div>
            </div>
            <div className="stat-value">12</div>
            <div className="stat-label">Experiments Completed</div>
            <div className="stat-change">+3 this week</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: '#e8f5f7' }}>📈</div>
            </div>
            <div className="stat-value">8</div>
            <div className="stat-label">Labs In Progress</div>
            <div className="stat-change">+1 today</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; color: #1d1d1f; }
        header { background: white; border-bottom: 1px solid #e5e7; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo { width: 40px; height: 40px; background: #7c3aed; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; }
        .brand-name { font-size: 18px; font-weight: 600; }
        nav { display: flex; gap: 32px; }
        nav a { text-decoration: none; color: #1d1d1f; font-size: 14px; display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; transition: background 0.2s; }
        nav a.active { background: #f5f5f7; }
        nav a:hover { background: #f5f5f7; }
        .user-section { display: flex; align-items: center; gap: 16px; }
        .signout-btn { border: none; background: none; cursor: pointer; font-size: 14px; color: #1d1d1f; display: flex; align-items: center; gap: 6px; }
        .container { max-width: 1400px; margin: 0 auto; padding: 32px; }
        .welcome-section { margin-bottom: 32px; }
        .welcome-section h1 { font-size: 32px; font-weight: 600; margin-bottom: 8px; }
        .welcome-section p { color: #6e6e73; font-size: 16px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .stat-value { font-size: 32px; font-weight: 600; margin-bottom: 4px; }
        .stat-label { color: #6e6e73; font-size: 14px; }
        .stat-change { font-size: 12px; color: #34c759; margin-top: 8px; }
        .state-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px; }
        .state-title { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
        .state-value { font-size: 24px; font-weight: 600; margin-bottom: 16px; }
        .state-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .state-detail { opacity: 0.9; }
        .state-detail-value { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .state-detail-label { font-size: 12px; opacity: 0.8; }
      `}</style>
    </main>
  )
}

