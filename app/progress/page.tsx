'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/atomic/page-header'
import { StatCard } from '@/components/atomic/stat-card'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, TrendingUp, Target, CheckCircle2, Circle, ChevronDown, ChevronUp, PlayCircle, RotateCcw } from 'lucide-react'

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

  const completedCheckpoints = lab.checkpoints.filter(c => c.completed).length
  const totalCheckpoints = lab.checkpoints.length

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{lab.title}</h3>
              <Badge variant="outline" className="text-xs">{lab.category}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lab.timeSpent}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>{lab.lastAccessed}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">
              {lab.progress}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={lab.progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{completedCheckpoints} of {totalCheckpoints} checkpoints</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-auto p-0 text-violet-600 hover:text-violet-700 font-medium"
            >
              {expanded ? (
                <>
                  Hide Details <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="bg-gray-50/50 border-t border-gray-100 py-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-700" />
            Checkpoint Progress
          </h4>
          <div className="space-y-3">
            {lab.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center gap-3 group/item">
                {checkpoint.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
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
        </CardContent>
      )}

      <CardFooter className="bg-white border-t border-gray-100 p-4 flex gap-3">
        <Link href={`/labs/${lab.id}`} className="flex-1">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0">
            <PlayCircle className="w-4 h-4 mr-2" />
            Continue Lab
          </Button>
        </Link>
        <Button variant="outline" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
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

  const stats = [
    {
      icon: '🔄',
      label: 'Labs In Progress',
      value: inProgressLabs.length,
      iconBg: 'bg-sky-50',
      description: 'Keep up the momentum!',
    },
    {
      icon: '📊',
      label: 'Average Progress',
      value: `${averageProgress}%`,
      iconBg: 'bg-slate-50',
      trend: { value: '+12% this week', positive: true },
    },
    {
      icon: '⏱️',
      label: 'Total Time Invested',
      value: `${totalTimeSpent.toFixed(1)} hrs`,
      iconBg: 'bg-emerald-50',
      description: 'Great dedication!',
    },
  ]

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Your Progress"
          description="Continue your incomplete experiments and track your learning journey"
          action={
            <Link href="/labs">
              <Button variant="outline" className="gap-2">
                <Target className="w-4 h-4" />
                Browse All Labs
              </Button>
            </Link>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs for Filtering */}
        <Tabs defaultValue="recent" className="mb-6" onValueChange={(value) => setSortBy(value as 'recent' | 'progress')}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              Incomplete Labs
            </h2>
            <TabsList>
              <TabsTrigger value="recent">Most Recent</TabsTrigger>
              <TabsTrigger value="progress">By Progress</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recent" className="mt-0">
            {sortedLabs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {sortedLabs.map(lab => (
                  <ProgressCard key={lab.id} lab={lab} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            {sortedLabs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {sortedLabs.map(lab => (
                  <ProgressCard key={lab.id} lab={lab} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
      <p className="text-gray-600 mb-6">You don't have any incomplete labs at the moment.</p>
      <Link href="/labs">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white border-0">
          Browse Labs
        </Button>
      </Link>
    </Card>
  )
}