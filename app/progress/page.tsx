'use client'

import React, { useState } from 'react'

interface LabProgress {
  id: string
  title: string
  category: string
  progress: number
  lastAccessed: string
  timeSpent: string
  checkpoints: {
    name: string
    completed: boolean
  }[]
  snapshotUrl?: string // Future: Babylon.js snapshot from Supabase
}

// Mock data - will be fetched from Supabase in future
const inProgressLabs: LabProgress[] = [
  {
    id: '3',
    title: 'Quantum Tunneling',
    category: 'Quantum Mechanics',
    progress: 50,
    lastAccessed: '2 hours ago',
    timeSpent: '1.5 hrs',
    checkpoints: [
      { name: 'Introduction & Theory', completed: true },
      { name: 'Set up barrier parameters', completed: true },
      { name: 'Calculate probability density', completed: false },
      { name: 'Visualize wave function', completed: false },
      { name: 'Final assessment', completed: false }
    ]
  },
  {
    id: '7',
    title: 'Double Pendulum Chaos',
    category: 'Classical Mechanics',
    progress: 25,
    lastAccessed: '1 day ago',
    timeSpent: '45 min',
    checkpoints: [
      { name: 'Introduction & Theory', completed: true },
      { name: 'Configure pendulum system', completed: false },
      { name: 'Observe chaotic motion', completed: false },
      { name: 'Phase space analysis', completed: false },
      { name: 'Final assessment', completed: false }
    ]
  },
  {
    id: '8',
    title: 'Electromagnetic Field Lines',
    category: 'Electromagnetism',
    progress: 75,
    lastAccessed: '3 hours ago',
    timeSpent: '2.2 hrs',
    checkpoints: [
      { name: 'Introduction & Theory', completed: true },
      { name: 'Single charge field', completed: true },
      { name: 'Dipole configuration', completed: true },
      { name: 'Multiple charge interactions', completed: false },
      { name: 'Final assessment', completed: false }
    ]
  },
  {
    id: '9',
    title: 'Photoelectric Effect',
    category: 'Quantum Mechanics',
    progress: 15,
    lastAccessed: '2 days ago',
    timeSpent: '30 min',
    checkpoints: [
      { name: 'Introduction & Theory', completed: true },
      { name: 'Setup light source', completed: false },
      { name: 'Measure electron emission', completed: false },
      { name: 'Calculate work function', completed: false },
      { name: 'Final assessment', completed: false }
    ]
  }
]

function ProgressCard({ lab }: { lab: LabProgress }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{lab.title}</h3>
            <p className="text-sm text-gray-500">{lab.category}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{lab.progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${lab.progress}%` }}
          />
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              ⏱️ {lab.timeSpent}
            </span>
            <span className="text-gray-600">
              🕐 {lab.lastAccessed}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {expanded ? '▲ Hide Details' : '▼ Show Details'}
          </button>
        </div>
      </div>

      {/* Expandable Checkpoints */}
      {expanded && (
        <div className="p-6 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Checkpoints Progress</h4>
          <div className="space-y-3">
            {lab.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  checkpoint.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {checkpoint.completed ? '✓' : index + 1}
                </div>
                <span className={`text-sm ${
                  checkpoint.completed 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {checkpoint.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Future: Snapshot Preview */}
          {lab.snapshotUrl && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Last saved state:</p>
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400">Babylon.js Snapshot Preview</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
        <button className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Continue Lab
        </button>
        <button className="py-2 px-4 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors">
          Reset
        </button>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent')

  const sortedLabs = [...inProgressLabs].sort((a, b) => {
    if (sortBy === 'recent') {
      // Sort by most recently accessed
      const timeMap: { [key: string]: number } = {
        'hours ago': 1,
        'day ago': 24,
        'days ago': 48
      }
      const aTime = Object.keys(timeMap).find(key => a.lastAccessed.includes(key))
      const bTime = Object.keys(timeMap).find(key => b.lastAccessed.includes(key))
      return (timeMap[aTime || ''] || 0) - (timeMap[bTime || ''] || 0)
    } else {
      // Sort by progress percentage
      return b.progress - a.progress
    }
  })

  const totalTimeSpent = inProgressLabs.reduce((acc, lab) => {
    const hours = parseFloat(lab.timeSpent.split(' ')[0])
    return acc + hours
  }, 0)

  const averageProgress = Math.round(
    inProgressLabs.reduce((acc, lab) => acc + lab.progress, 0) / inProgressLabs.length
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
            M
          </div>
          <span className="text-lg font-semibold">Metal Lab</span>
        </div>

        <nav className="flex gap-8">
          <a href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors">
            <span>📊</span> Dashboard
          </a>
          <a href="/labs" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors">
            <span>🧪</span> Labs
          </a>
          <a href="/progress" className="flex items-center gap-2 text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
            <span>📈</span> Progress
          </a>
        </nav>

        <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <span>🔓</span> Signout
        </button>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Continue your incomplete experiments and track your learning journey</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                🔄
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{inProgressLabs.length}</div>
                <div className="text-sm text-gray-600">Labs In Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageProgress}%</div>
                <div className="text-sm text-gray-600">Average Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                ⏱️
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalTimeSpent.toFixed(1)} hrs</div>
                <div className="text-sm text-gray-600">Total Time Invested</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Incomplete Labs</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                sortBy === 'recent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              Most Recent
            </button>
            <button
              onClick={() => setSortBy('progress')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                sortBy === 'progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              By Progress
            </button>
          </div>
        </div>

        {/* Progress Cards */}
        {sortedLabs.length > 0 ? (
          <div className="space-y-6">
            {sortedLabs.map(lab => (
              <ProgressCard key={lab.id} lab={lab} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-6">You don't have any incomplete labs at the moment.</p>
            <a 
              href="/labs"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Labs
            </a>
          </div>
        )}
      </div>
    </main>
  )
}