import { create } from 'zustand'
import { supabase } from './supabase'
import type { StatItem, RecentActivity, Lab } from './types'

// Helper functions to transform data
const transformStatItem = (item: any): StatItem => ({
  icon: item.icon,
  label: item.label,
  value: item.value,
  iconBg: item.icon_bg,
  trend: item.trend ? {
    value: item.trend.value,
    positive: item.trend.positive
  } : undefined,
  description: item.description
})

const transformActivity = (activity: any): RecentActivity => ({
  id: activity.id,
  title: activity.title,
  category: activity.category,
  progress: activity.progress,
  time: activity.time
})

interface UserState {
  currentUser: {
    timeToday: number
    timeThisWeek: number
    level: number
    experimentsCompleted: number
    labsInProgress: number
  }
  learningState: {
    currentModule: string
    currentUnit: string
    lastStudied: Date
  }
  stats: {
    items: StatItem[]
    recentActivity: RecentActivity[]
    dayStreak: number
    averageScore: number
    totalHours: number
  }
  labs: Lab[]
  completedLabsCount: number
  inProgressLabsCount: number
  totalLabsCount: number
}

interface StoreState extends UserState {
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  updateUserState: (updates: Partial<UserState['currentUser']>) => Promise<void>
  updateLearningState: (updates: Partial<UserState['learningState']> & { progress?: number }) => Promise<void>
  updateStats: (updates: Partial<UserState['stats']>) => Promise<void>
  updateLabStatus: (labId: string, status: 'locked' | 'in-progress' | 'completed') => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: {
    timeToday: 0,
    timeThisWeek: 0,
    level: 1,
    experimentsCompleted: 0,
    labsInProgress: 0
  },
  learningState: {
    currentModule: '',
    currentUnit: '',
    lastStudied: new Date()
  },
  stats: {
    items: [],
    recentActivity: [],
    dayStreak: 0,
    averageScore: 0,
    totalHours: 0
  },
  labs: [],
  completedLabsCount: 0,
  inProgressLabsCount: 0,
  totalLabsCount: 0,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: userState, error: userError } = await supabase
        .from('user_state')
        .select('*')
        .eq('id', 1)
        .single()

      if (userError) throw userError

      const { data: learningState, error: learningError } = await supabase
        .from('learning_state')
        .select('*')
        .eq('id', 1)
        .single()

      if (learningError) throw learningError

      const { data: stats, error: statsError } = await supabase
        .from('stats')
        .select('*')
        .eq('id', 1)
        .single()

      if (statsError) throw statsError

      // Fetch labs
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select('*')
        .order('id')

      if (labsError) throw labsError

      // Transform the stats data
      const transformedStats = {
        ...stats,
        items: stats.items ? stats.items.map(transformStatItem) : [],
        recentActivity: stats.recent_activity ? stats.recent_activity.map(transformActivity) : []
      }

      const completedLabs = (labsData || []).filter(lab => lab.status === 'completed')
      const inProgressLabs = (labsData || []).filter(lab => lab.status === 'in_progress')

      set({
        currentUser: userState,
        learningState,
        stats: transformedStats,
        labs: labsData || [],
        completedLabsCount: completedLabs.length,
        inProgressLabsCount: inProgressLabs.length,
        totalLabsCount: (labsData || []).length,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateUserState: async (updates) => {
    try {
      const { error } = await supabase
        .from('user_state')
        .update(updates)
        .eq('id', 1) // Assuming single user state row

      if (error) throw error

      set((state) => ({
        currentUser: { ...state.currentUser, ...updates }
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateLearningState: async (updates) => {
    try {
      const { error } = await supabase
        .from('learning_state')
        .update(updates)
        .eq('id', 1)

      if (error) throw error

      set((state) => ({
        learningState: { ...state.learningState, ...updates }
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateStats: async (updates) => {
    try {
      // Transform the updates for Supabase
      const dbUpdates = {
        ...updates,
        items: updates.items?.map(item => ({
          icon: item.icon,
          label: item.label,
          value: item.value,
          icon_bg: item.iconBg,
          trend: item.trend ? {
            value: item.trend.value,
            positive: item.trend.positive
          } : null,
          description: item.description
        })),
        recent_activity: updates.recentActivity?.map(activity => ({
          id: activity.id,
          title: activity.title,
          category: activity.category,
          progress: activity.progress,
          time: activity.time
        }))
      }

      const { error } = await supabase
        .from('stats')
        .update(dbUpdates)
        .eq('id', 1)

      if (error) throw error

      set((state) => ({
        stats: { ...state.stats, ...updates }
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateLabStatus: async (labId, status) => {
    try {
      const { error } = await supabase
        .from('labs')
        .update({ status })
        .eq('id', labId)

      if (error) throw error

      // Update local state
      set((state) => {
        const updatedLabs = state.labs.map(lab => 
          lab.id === labId ? { ...lab, status } : lab
        )

        const completedLabs = updatedLabs.filter(lab => lab.status === 'completed')
        const inProgressLabs = updatedLabs.filter(lab => lab.status === 'in-progress')

        return {
          labs: updatedLabs,
          completedLabsCount: completedLabs.length,
          inProgressLabsCount: inProgressLabs.length
        }
      })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  }
}))