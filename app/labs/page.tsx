'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/atomic/page-header'
import { StatCard } from '@/components/atomic/stat-card'
import { LabCard } from '@/components/labs/lab-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'

interface Lab {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'locked'
  progress: number
  modelUrl?: string
  category: string
}

const labs: Lab[] = [
  {
    id: '1',
    title: 'Wave Interference Pattern',
    description: 'Double-slit experiment simulation with varying wavelengths',
    status: 'completed',
    progress: 100,
    category: 'Wave Physics'
  },
  {
    id: '2',
    title: 'Particle Collision Dynamics',
    description: 'Elastic and inelastic collision simulations',
    status: 'completed',
    progress: 100,
    category: 'Particle Physics'
  },
  {
    id: '3',
    title: 'Quantum Tunneling',
    description: 'Probability calculations for barrier penetration',
    status: 'in-progress',
    progress: 50,
    category: 'Quantum Mechanics'
  },
  {
    id: '4',
    title: 'Harmonic Oscillator',
    description: 'Energy levels and wave functions visualization',
    status: 'completed',
    progress: 100,
    category: 'Classical Mechanics'
  },
  {
    id: '5',
    title: 'Schrödinger Equation',
    description: 'Time-dependent solutions for various potentials',
    status: 'locked',
    progress: 0,
    category: 'Quantum Mechanics'
  },
  {
    id: '6',
    title: 'Quantum Entanglement',
    description: 'Bell state measurements and correlations',
    status: 'locked',
    progress: 0,
    category: 'Quantum Mechanics'
  }
]

export default function LabsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'locked'>('all')

  const filteredLabs = labs.filter(lab => {
    if (filter === 'all') return true
    return lab.status === filter
  })

  const completedCount = labs.filter(l => l.status === 'completed').length
  const inProgressCount = labs.filter(l => l.status === 'in-progress').length
  const lockedCount = labs.filter(l => l.status === 'locked').length

  const stats = [
    {
      icon: '✅',
      label: 'Completed Labs',
      value: completedCount,
      iconBg: 'bg-emerald-50',
      trend: { value: '+3 this month', positive: true },
    },
    {
      icon: '🔄',
      label: 'In Progress',
      value: inProgressCount,
      iconBg: 'bg-amber-50',
      description: 'Keep going!',
    },
    {
      icon: '🎯',
      label: 'Total Labs',
      value: labs.length,
      iconBg: 'bg-slate-50',
      description: `${lockedCount} locked`,
    },
  ]

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Physics Labs"
          description="Explore interactive experiments and simulations"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">
              All ({labs.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Active ({inProgressCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Done ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({lockedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {filteredLabs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLabs.map(lab => (
                  <LabCard key={lab.id} lab={lab} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No labs found in this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}