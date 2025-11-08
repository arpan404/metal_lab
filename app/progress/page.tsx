'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/app-store'
import { 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  RotateCcw,
  Award,
  Zap,
  Calendar,
  ArrowUpRight,
  Filter,
  Timer,
  Activity,
  Flame,
  BarChart3
} from 'lucide-react'
import { IconFlask, IconAtom, IconChartBar, IconClock, IconTrophy } from '@tabler/icons-react'

export default function ProgressPage() {
  const { labs, stats } = useAppStore()
  const [expandedLabs, setExpandedLabs] = useState<string[]>([])

  const toggleLabExpansion = (labId: string) => {
    setExpandedLabs(prev =>
      prev.includes(labId)
        ? prev.filter(id => id !== labId)
        : [...prev, labId]
    )
  }

  // Get labs in progress with checkpoints
  const inProgressLabs = labs.filter(lab => lab.status === 'in-progress' && lab.checkpoints)

  function formatTimestamp(date?: Date) {
    if (!date) return 'Recently'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const statsDisplay = [
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      label: 'Completed Labs',
      value: stats.completedLabs,
      iconBg: 'bg-emerald-500',
      description: `${stats.totalLabs} total`,
    },
    {
      icon: <Flame className="h-6 w-6" />,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      iconBg: 'bg-orange-500',
      description: stats.currentStreak === stats.longestStreak ? 'Best streak!' : `Best: ${stats.longestStreak} days`,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      label: 'Hours Learned',
      value: stats.hoursLearned,
      iconBg: 'bg-blue-500',
      description: 'Keep learning!',
    },
  ]

  const ProgressCard = ({ lab }: { lab: typeof labs[0] }) => {
    const isExpanded = expandedLabs.includes(lab.id)
    const completedCheckpoints = lab.checkpoints?.filter(c => c.completed).length || 0
    const totalCheckpoints = lab.checkpoints?.length || 0
    const timeSpent = lab.estimatedTime ? `${Math.floor((lab.progress / 100) * lab.estimatedTime)} min` : 'N/A'
    const lastAccessed = formatTimestamp(lab.startedAt)

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200/60 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Progress Circle */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${lab.progress * 1.75} 175`}
                  className="text-blue-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-900">{lab.progress}%</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {lab.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">{lab.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLabExpansion(lab.id)}
                  className="shrink-0 -mt-1 text-slate-600 hover:text-slate-900"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  <span>{timeSpent}</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{lastAccessed}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={lab.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {completedCheckpoints} of {totalCheckpoints} checkpoints completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isExpanded && lab.checkpoints && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Checkpoint Progress
              </h4>
              <div className="space-y-2">
                {lab.checkpoints.map((checkpoint, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-sm">
                    {checkpoint.completed ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      </div>
                    )}
                    <span className={checkpoint.completed ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      {checkpoint.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Link href={`/labs/${lab.id}`} className="flex-1">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0 gap-2">
                <PlayCircle className="w-4 h-4" />
                Continue Lab
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="shrink-0">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                <Activity className="w-3 h-3 mr-1" />
                {inProgressLabs.length} Active Labs
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Your Progress
            </h1>
            <p className="text-lg text-slate-600">
              Continue your incomplete experiments and track your learning journey
            </p>
          </div>
          <Link href="/labs">
            <Button size="lg" variant="outline" className="gap-2">
              <IconFlask className="w-4 h-4" />
              Browse All Labs
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200/60 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                    {stat.icon}
                  </div>

                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-xs text-slate-500 mt-2">
                    {stat.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Filtering */}
        <div>
          <Card className="border-gray-200/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <IconAtom className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">Incomplete Labs</div>
                    <div className="text-xs text-slate-500 font-normal">Continue where you left off</div>
                  </div>
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {inProgressLabs.length > 0 ? (
                <div className="space-y-4">
                  {inProgressLabs.map(lab => (
                    <ProgressCard key={lab.id} lab={lab} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <IconFlask className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Labs In Progress</h3>
                  <p className="text-sm text-slate-600 max-w-sm mb-6">
                    Start a new lab to begin your learning journey and track your progress here.
                  </p>
                  <Link href="/labs">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                      <IconFlask className="w-4 h-4 mr-2" />
                      Browse Labs
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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