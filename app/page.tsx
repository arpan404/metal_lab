'use client'
import React from 'react'
import Link from 'next/link'
import { StatCard } from '@/components/atomic/stat-card'
import { PageHeader } from '@/components/atomic/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, TrendingUp, Clock, Award, BookOpen, Target, Sparkles } from 'lucide-react'

export default function Page() {
  const stats = [
    {
      icon: '🧪',
      label: 'Experiments Completed',
      value: 12,
      iconBg: 'bg-emerald-50',
      trend: { value: '+3 this week', positive: true },
    },
    {
      icon: '📊',
      label: 'Labs In Progress',
      value: 8,
      iconBg: 'bg-sky-50',
      trend: { value: '+1 today', positive: true },
    },
    {
      icon: '⚡',
      label: 'Current Streak',
      value: '14 days',
      iconBg: 'bg-amber-50',
      description: 'Your longest streak yet!',
    },
    {
      icon: '🎯',
      label: 'Accuracy Score',
      value: '94%',
      iconBg: 'bg-slate-50',
      trend: { value: '+2% this week', positive: true },
    },
  ]

  const recentActivity = [
    {
      id: 1,
      title: 'Quantum Tunneling',
      category: 'Quantum Mechanics',
      progress: 75,
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'Electromagnetic Field Lines',
      category: 'Electromagnetism',
      progress: 100,
      time: '5 hours ago',
    },
    {
      id: 3,
      title: 'Double Pendulum Chaos',
      category: 'Classical Mechanics',
      progress: 25,
      time: '1 day ago',
    },
  ]

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-slate-700" />
            <Badge variant="secondary" className="text-xs">Level 3 Scholar</Badge>
          </div>
          <PageHeader
            title="Welcome back, Student! 👋"
            description="Here's your learning progress and activity overview"
          />
        </div>

        {/* Current Learning State Card */}
        <Card className="mb-8 border-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none" />
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">Current Learning State</p>
                <h2 className="text-2xl font-bold mb-1">Quantum Mechanics</h2>
                <p className="text-white/90">Wave Functions & Applications</p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                Active
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold">2.5 hrs</div>
                <div className="text-white/70 text-sm">Today</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">15 hrs</div>
                <div className="text-white/70 text-sm">This Week</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">Level 3</div>
                <div className="text-white/70 text-sm">Current Level</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-700" />
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <Link href="/progress">
                    <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.category}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.progress}%
                      </Badge>
                    </div>
                    <Progress value={activity.progress} className="mb-2" />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-slate-700" />
                <h3 className="font-semibold text-gray-900">Weekly Goal</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Lab Completions</span>
                    <span className="text-sm font-semibold text-gray-900">3/5</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Study Time</span>
                    <span className="text-sm font-semibold text-gray-900">15/20 hrs</span>
                  </div>
                  <Progress value={75} />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/labs">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Labs
                  </Button>
                </Link>
                <Link href="/progress">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </Link>
                <Button className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white border-0">
                  <Award className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

