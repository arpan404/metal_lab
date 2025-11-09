import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

interface Checkpoint {
  id: string
  title: string
  completed: boolean
}

export interface Lab {
  id: string
  title: string
  description: string
  category: 'Quantum' | 'Classical' | 'Relativity' | 'Thermodynamics'
  status: 'locked' | 'in-progress' | 'completed'
  progress: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: number // in minutes
  completedAt?: Date
  startedAt?: Date
  points: number
  checkpoints?: Checkpoint[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt?: Date
  isEarned: boolean
}

export interface Activity {
  id: string
  type: 'completed' | 'badge' | 'started' | 'milestone'
  title: string
  description: string
  timestamp: Date
  points?: number
}

export interface UserStats {
  totalLabs: number
  completedLabs: number
  inProgressLabs: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  hoursLearned: number
  level: number
  currentXP: number
  xpToNextLevel: number
}

interface AppStore {
  // State
  labs: Lab[]
  stats: UserStats
  badges: Badge[]
  activities: Activity[]
  isLoading: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  startLab: (labId: string) => Promise<void>
  updateLabProgress: (labId: string, progress: number) => Promise<void>
  completeLab: (labId: string) => Promise<void>
  unlockLab: (labId: string) => Promise<void>
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>
  earnBadge: (badgeId: string) => Promise<void>
  addPoints: (points: number) => Promise<void>
  updateStreak: () => Promise<void>
}

export const useAppStore = create<AppStore>((set, get) => ({
  labs: [],
  stats: {
    totalLabs: 0,
    completedLabs: 0,
    inProgressLabs: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    hoursLearned: 0,
    level: 1,
    currentXP: 0,
    xpToNextLevel: 1000,
  },
  badges: [],
  activities: [],
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      // Fetch labs with their checkpoints
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select(`
          *,
          checkpoints:lab_checkpoints(*)
        `)
      if (labsError) throw labsError

      // Transform labs data
      const labs = labsData?.map(lab => ({
        id: lab.id,
        title: lab.title,
        description: lab.description,
        category: lab.category,
        status: lab.status,
        progress: lab.progress,
        difficulty: lab.difficulty,
        estimatedTime: lab.estimated_time,
        completedAt: lab.completed_at ? new Date(lab.completed_at) : undefined,
        startedAt: lab.started_at ? new Date(lab.started_at) : undefined,
        points: lab.points,
        checkpoints: lab.checkpoints?.map((cp: Checkpoint) => ({
          id: cp.id,
          title: cp.title,
          completed: cp.completed
        }))
      })) || []

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .single()
      if (statsError) throw statsError

      // Transform stats data
      const stats: UserStats = {
        totalLabs: statsData.total_labs,
        completedLabs: statsData.completed_labs,
        inProgressLabs: statsData.in_progress_labs,
        totalPoints: statsData.total_points,
        currentStreak: statsData.current_streak,
        longestStreak: statsData.longest_streak,
        hoursLearned: statsData.hours_learned,
        level: statsData.level,
        currentXP: statsData.current_xp,
        xpToNextLevel: statsData.xp_to_next_level
      }

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
      if (badgesError) throw badgesError

      // Transform badges data
      const badges = badgesData?.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        earnedAt: badge.earned_at ? new Date(badge.earned_at) : undefined,
        isEarned: badge.is_earned
      })) || []

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
      if (activitiesError) throw activitiesError

      // Transform activities data
      const activities = activitiesData?.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: new Date(activity.timestamp),
        points: activity.points
      })) || []

      set({
        labs,
        stats,
        badges,
        activities,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  startLab: async (labId) => {
    const { error } = await supabase
      .from('labs')
      .update({
        status: 'in-progress',
        started_at: new Date().toISOString(),
        progress: 0
      })
      .eq('id', labId)

    if (error) {
      set({ error: error.message })
      return
    }

    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        in_progress_labs: get().stats.inProgressLabs + 1
      })
      .eq('id', 1)

    if (statsError) {
      set({ error: statsError.message })
      return
    }

    await get().initialize()
  },

  updateLabProgress: async (labId, progress) => {
    const { error } = await supabase
      .from('labs')
      .update({ progress })
      .eq('id', labId)

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  },

  completeLab: async (labId) => {
    const { error } = await supabase
      .from('labs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('id', labId)

    if (error) {
      set({ error: error.message })
      return
    }

    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        completed_labs: get().stats.completedLabs + 1,
        in_progress_labs: get().stats.inProgressLabs - 1
      })
      .eq('id', 1)

    if (statsError) {
      set({ error: statsError.message })
      return
    }

    await get().initialize()
  },

  unlockLab: async (labId) => {
    const { error } = await supabase
      .from('labs')
      .update({ status: 'locked' })
      .eq('id', labId)

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  },

  addActivity: async (activity) => {
    const { error } = await supabase
      .from('activities')
      .insert([{
        ...activity,
        timestamp: new Date().toISOString()
      }])

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  },

  earnBadge: async (badgeId) => {
    const { error } = await supabase
      .from('badges')
      .update({
        is_earned: true,
        earned_at: new Date().toISOString()
      })
      .eq('id', badgeId)

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  },

  addPoints: async (points) => {
    const stats = get().stats
    const newXP = stats.currentXP + points
    const levelUp = newXP >= stats.xpToNextLevel

    const { error } = await supabase
      .from('user_stats')
      .update({
        total_points: stats.totalPoints + points,
        current_xp: levelUp ? newXP - stats.xpToNextLevel : newXP,
        level: levelUp ? stats.level + 1 : stats.level,
        xp_to_next_level: levelUp ? stats.xpToNextLevel * 1.5 : stats.xpToNextLevel
      })
      .eq('id', 1)

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  },

  updateStreak: async () => {
    const stats = get().stats
    const today = new Date()
    const lastActivity = get().activities[0]
    const streakBroken = lastActivity && 
      (today.getTime() - new Date(lastActivity.timestamp).getTime()) > 24 * 60 * 60 * 1000

    const { error } = await supabase
      .from('user_stats')
      .update({
        current_streak: streakBroken ? 1 : stats.currentStreak + 1,
        longest_streak: streakBroken ? 
          stats.longestStreak : 
          Math.max(stats.longestStreak, stats.currentStreak + 1)
      })
      .eq('id', 1)

    if (error) {
      set({ error: error.message })
      return
    }

    await get().initialize()
  }
}))

