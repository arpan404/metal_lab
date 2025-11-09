import { ReactNode } from 'react'

export interface StatTrend {
  value: string
  positive: boolean
}

export interface StatItem {
  icon: ReactNode
  label: string
  value: string | number
  iconBg: string
  trend?: StatTrend
  description?: string
}

export interface RecentActivity {
  id: string | number
  title: string
  category: string
  progress: number
  time: string
}

export interface CurrentUser {
  experimentsCompleted: number
  labsInProgress: number
  timeToday: number
  timeThisWeek: number
  level: number
}

export interface Stats {
  items: StatItem[]
  recentActivity: RecentActivity[]
  dayStreak: number
  averageScore: number
  totalHours: number
}

export interface Lab {
  id: string
  title: string
  description: string
  category: 'Quantum' | 'Classical' | 'Relativity' | 'Thermodynamics'
  status: 'locked' | 'in-progress' | 'completed'
  progress: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: number
  points: number
  startedAt?: Date
  completedAt?: Date
  checkpoints?: {
    id: string
    title: string
    completed: boolean
  }[]
}

export interface AppState {
  labs: Lab[]
  completedLabsCount: number
  inProgressLabsCount: number
  totalLabsCount: number
}