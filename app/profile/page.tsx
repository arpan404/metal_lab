'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/app-store'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Trophy,
  Target,
  Zap,
  Crown,
  Shield,
  Edit,
  Camera,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { IconFlask } from '@tabler/icons-react'

export default function ProfilePage() {
  const { user } = useUser()
  const { stats: userStats, badges, activities } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)

  const userInitials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
  const userName = user?.fullName || 'User Name'
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'user@example.com'
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2025'

  const stats = [
    { label: 'Labs Completed', value: userStats.completedLabs.toString(), icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Hours Learned', value: userStats.hoursLearned.toString(), icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Current Streak', value: userStats.currentStreak.toString(), icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Total Points', value: userStats.totalPoints.toLocaleString(), icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]

  const earnedBadges = badges.filter(b => b.isEarned)

  function formatTimestamp(timestamp: Date) {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  const recentActivity = activities.slice(0, 4).map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    time: formatTimestamp(activity.timestamp),
    points: activity.points ? `+${activity.points}` : '',
  }))

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
              <p className="text-sm text-slate-600">Manage your account and view your progress</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-gray-200/60 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-slate-700" />
                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-slate-200 shadow-lg">
                      <AvatarImage src={user?.imageUrl} alt={userName} />
                      <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900">{userName}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro Member
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Mail className="w-4 h-4" />
                      {userEmail}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      Member since {joinDate}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue={user?.firstName || ''} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue={user?.lastName || ''} className="mt-1.5" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={userEmail} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={3}
                        className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Passionate physics student exploring quantum mechanics through interactive experiments. 
                      Love learning about wave-particle duality and the mysteries of the quantum world.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        activity.type === 'completed' ? 'bg-emerald-100' :
                        activity.type === 'badge' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.type === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                         activity.type === 'badge' ? <Award className="w-5 h-5 text-amber-600" /> :
                         <IconFlask className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                      {activity.points && (
                        <Badge variant="outline" className="shrink-0 text-emerald-600 border-emerald-200">
                          {activity.points}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Badges */}
          <div className="space-y-6">
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Badges</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map((badge) => {
                    // Map icon names to components
                    const iconMap: Record<string, React.FC<{ className?: string }>> = {
                      Zap,
                      Trophy,
                      Target,
                      Shield,
                      Crown,
                      Sparkles,
                    }
                    const IconComponent = iconMap[badge.icon] || Award
                    
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      >
                        <div className={`w-14 h-14 rounded-full ${badge.color} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 text-center mb-1">{badge.name}</p>
                        <p className="text-xs text-slate-500 text-center">{badge.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card className="border-gray-200/60">
              <CardHeader className="bg-linear-to-r from-slate-50 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-900">Level Progress</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-blue-600 text-white font-bold text-2xl mb-3">
                    8
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Level 8</p>
                  <p className="text-xs text-slate-500">Physics Enthusiast</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>2,450 / 3,000 XP</span>
                    <span>Level 9</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: '82%' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">550 XP to next level</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
