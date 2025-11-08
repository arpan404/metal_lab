'use client'
import React from 'react'
import { useAuth } from "@clerk/nextjs"
import LandingPage from '@/components/ui/landing_page'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/app-store'
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  Sparkles, 
  Flame,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Play,
  CheckCircle2,
  Timer,
  BarChart3,
  Brain,
  Rocket,
  Star,
  Trophy,
  Calendar
} from 'lucide-react'
import { 
  IconFlask, 
  IconAtom, 
  IconTrophy,
} from '@tabler/icons-react'

export default function Page() {
  const { userId, isLoaded } = useAuth()
  const { stats: userStats, labs, activities } = useAppStore()

  // Show landing page for unauthenticated users or while auth is loading
  // if (!isLoaded || !userId) {
    return <LandingPage/>
  // }

  const stats = [
    {
      icon: <IconFlask className="h-6 w-6" />,
      label: 'Experiments Completed',
      value: userStats.completedLabs,
      iconBg: 'bg-emerald-500',
      trend: { value: '+3 this week', positive: true },
    },
    {
      icon: <IconAtom className="h-6 w-6" />,
      label: 'Labs In Progress',
      value: userStats.inProgressLabs,
      iconBg: 'bg-sky-500',
      trend: { value: '+1 today', positive: true },
    },
    {
      icon: <Flame className="h-6 w-6" />,
      label: 'Current Streak',
      value: `${userStats.currentStreak} days`,
      iconBg: 'bg-orange-500',
      description: userStats.currentStreak === userStats.longestStreak ? 'Your longest streak yet!' : `Best: ${userStats.longestStreak} days`,
    },
    {
      icon: <IconTrophy className="h-6 w-6" />,
      label: 'Total Points',
      value: userStats.totalPoints.toLocaleString(),
      iconBg: 'bg-purple-500',
      trend: { value: `Level ${userStats.level}`, positive: true },
    },
  ]

  // Get recent labs from activities
  const recentActivity = activities.slice(0, 3).map((activity) => {
    const relatedLab = labs.find(l => l.title === activity.title || activity.title.includes(l.title))
    return {
      id: activity.id,
      title: activity.title,
      category: relatedLab?.category || 'Physics',
      progress: relatedLab?.progress || 0,
      time: formatTimestamp(activity.timestamp),
    }
  })

  function formatTimestamp(timestamp: Date) {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section with Welcome */}
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1">
                  <Trophy className="w-3 h-3 mr-1" />
                  Level {userStats.level} Scholar
                </Badge>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Flame className="w-3 h-3 mr-1" />
                  {userStats.currentStreak} day streak
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Welcome back, Student! 👋
              </h1>
              <p className="text-lg text-slate-600">
                You're making incredible progress. Keep up the momentum!
              </p>
            </div>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 gap-2">
              <Rocket className="w-4 h-4" />
              Start Learning
            </Button>
          </div>
        </div>

        {/* Current Focus Card - Full Width */}
        <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent" />
          <CardContent className="relative p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Current Focus</span>
                </div>
                <h2 className="text-3xl font-bold">Quantum Mechanics</h2>
                <p className="text-white/80 text-lg">Wave Functions & Applications</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm hover:bg-white/20">
                    <Play className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                  <span className="text-sm text-white/60">Last studied 2 hours ago</span>
                </div>
              </div>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 gap-2 shadow-xl">
                Continue Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/60 uppercase">Today</span>
                </div>
                <div className="text-2xl font-bold">2.5 hrs</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-white/60 uppercase">This Week</span>
                </div>
                <div className="text-2xl font-bold">15 hrs</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/60 uppercase">Progress</span>
                </div>
                <div className="text-2xl font-bold">68%</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-white/60 uppercase">Level</span>
                </div>
                <div className="text-2xl font-bold">{userStats.level}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200/60 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend.value}
                    </Badge>
                  )}
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-gray-200/60">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">Recent Activity</div>
                      <div className="text-xs text-slate-500 font-normal">Your latest experiments</div>
                    </div>
                  </CardTitle>
                  <Link href="/progress">
                    <Button variant="ghost" size="sm" className="gap-1 text-slate-700 hover:text-slate-900">
                      View All
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-6 hover:bg-slate-50/50 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${
                            activity.progress === 100 ? 'bg-emerald-100' : 'bg-blue-100'
                          } flex items-center justify-center shrink-0`}>
                            {activity.progress === 100 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Play className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                            <p className="text-sm text-slate-600">{activity.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {activity.progress}%
                        </Badge>
                      </div>
                      <div className="ml-13">
                        <Progress value={activity.progress} className="mb-3" />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card className="overflow-hidden border-gray-200/60">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">Weekly Goal</div>
                    <div className="text-xs text-slate-500 font-normal">Track your progress</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconFlask className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Lab Completions</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-slate-500 mt-2">2 more to reach your goal</p>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Study Time</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">15/20 hrs</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-slate-500 mt-2">5 hours remaining</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="overflow-hidden border-gray-200/60">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b border-gray-100">
                <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Link href="/labs" className="block">
                  <Button className="w-full justify-between group" variant="outline">
                    <span className="flex items-center gap-2">
                      <IconFlask className="w-4 h-4" />
                      Browse Labs
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
                <Link href="/progress" className="block">
                  <Button className="w-full justify-between group" variant="outline">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      View Progress
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
                <Button className="w-full justify-between bg-slate-900 hover:bg-slate-800 text-white border-0 group">
                  <span className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Continue Learning
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Preview */}
            <Card className="overflow-hidden border-gray-200/60 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shrink-0">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Almost there!</h4>
                    <p className="text-sm text-slate-600 mb-3">Complete 2 more labs to unlock the "Quantum Explorer" achievement</p>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Achievements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}