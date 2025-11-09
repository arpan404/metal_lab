import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

interface Checkpoint {
  id: string
  title: string
  completed: boolean
}

// Static lab definitions - matches componentMap.tsx
const LABS_DEFINITION: Omit<Lab, 'status' | 'progress' | 'completedAt' | 'startedAt'>[] = [
  {
    id: 'electricFieldSimulation',
    title: 'Electric Field Simulation',
    description: 'Explore electric fields created by two point charges in 3D space. Adjust charge magnitudes (positive or negative) and observe how the field vectors change in real-time.',
    category: 'Simulation',
    difficulty: 'Beginner',
    estimatedTime: 30,
    points: 100,
  },
  {
    id: 'transformerSimulation',
    title: 'Transformer Simulation',
    description: 'Explore how transformer models process text step-by-step. This uses a custom HuggingFace ByteLevel BPE tokenizer with TRUE multi-head attention.',
    category: 'Model',
    difficulty: 'Advanced',
    estimatedTime: 45,
    points: 150,
  },
  {
    id: 'foucaultPendulum',
    title: 'Foucault Pendulum',
    description: 'Experience Earth\'s rotation through the mesmerizing Foucault Pendulum! This 3D simulation demonstrates how the Coriolis effect causes precession.',
    category: 'Visualization',
    difficulty: 'Intermediate',
    estimatedTime: 25,
    points: 100,
  },
  {
    id: 'doubleSlitExperiment',
    title: 'Double-Slit Experiment',
    description: 'Witness the mind-bending quantum phenomenon that puzzled physicists for decades! Watch individual photons create an interference pattern.',
    category: 'Experiment',
    difficulty: 'Intermediate',
    estimatedTime: 35,
    points: 120,
  },
  {
    id: 'deflectionGame',
    title: 'Atomic Deflection Game',
    description: 'Challenge your reflexes and precision in this exciting physics-based shooting game! Score points by hitting moving targets.',
    category: 'Game',
    difficulty: 'Beginner',
    estimatedTime: 20,
    points: 80,
  },
  {
    id: 'millikanExperiment',
    title: 'Millikan Oil Drop Experiment',
    description: 'Recreate the groundbreaking 1909 experiment that measured the elementary charge! Balance forces on charged oil droplets.',
    category: 'Experiment',
    difficulty: 'Intermediate',
    estimatedTime: 30,
    points: 110,
  },
  {
    id: 'nascarBanking',
    title: 'NASCAR Banking',
    description: 'Experience the physics of high-speed racing on banked tracks! Control velocity and bank angle to understand centripetal force.',
    category: 'Simulation',
    difficulty: 'Beginner',
    estimatedTime: 25,
    points: 90,
  },
  {
    id: 'rutherfordScattering',
    title: 'Rutherford Scattering Experiment',
    description: 'Witness the groundbreaking 1909 experiment that revolutionized atomic theory! Fire alpha particles at a gold nucleus.',
    category: 'Experiment',
    difficulty: 'Advanced',
    estimatedTime: 40,
    points: 140,
  },
]

// Merge static lab definitions with user progress from backend
const mergeLabs = (userProgress: Record<string, { status: string; progress: number; completedAt?: string; startedAt?: string }> = {}): Lab[] => {
  return LABS_DEFINITION.map(labDef => {
    const progress = userProgress[labDef.id]
    return {
      ...labDef,
      status: (progress?.status as Lab['status']) || 'in-progress', // First lab unlocked by default
      progress: progress?.progress || 0,
      completedAt: progress?.completedAt ? new Date(progress.completedAt) : undefined,
      startedAt: progress?.startedAt ? new Date(progress.startedAt) : undefined,
    }
  })
}

export interface Lab {
  id: string
  title: string
  description: string
  category: 'Simulation' | 'Interactive' | 'Visualization' | 'Experiment' | 'Game' | 'Model' | 'Analysis'
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
  initialize: (userId?: string) => Promise<void>
  startLab: (labId: string, userId?: string) => Promise<void>
  updateLabProgress: (labId: string, progress: number, userId?: string) => Promise<void>
  completeLab: (labId: string, userId?: string) => Promise<void>
  unlockLab: (labId: string, userId?: string) => Promise<void>
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>, userId?: string) => Promise<void>
  earnBadge: (badgeId: string, userId?: string) => Promise<void>
  addPoints: (points: number, userId?: string) => Promise<void>
  updateStreak: (userId?: string) => Promise<void>
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

  initialize: async (userId) => {
    try {
      set({ isLoading: true, error: null })

      if (!userId) {
        // If no user, show labs with default progress (first one unlocked)
        set({ 
          labs: mergeLabs(),
          isLoading: false 
        })
        return
      }

      // Fetch ONLY user progress data (not lab definitions)
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select('id, status, progress, completed_at, started_at')
        .eq('user_id', userId)
      
      // Create progress map from backend data
      const userProgress: Record<string, any> = {}
      if (labsData) {
        labsData.forEach(lab => {
          userProgress[lab.id] = {
            status: lab.status,
            progress: lab.progress,
            completedAt: lab.completed_at,
            startedAt: lab.started_at
          }
        })
      }
      
      // Merge static lab definitions with user progress
      const labs = mergeLabs(userProgress)

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single()
      
      let stats: UserStats
      if (statsError) {
        console.log('No user stats found, using defaults')
        stats = {
          totalLabs: labs.length,
          completedLabs: labs.filter(l => l.status === 'completed').length,
          inProgressLabs: labs.filter(l => l.status === 'in-progress').length,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          hoursLearned: 0,
          level: 1,
          currentXP: 0,
          xpToNextLevel: 1000,
        }
      } else {
        // Transform stats data
        stats = {
          totalLabs: statsData.total_labs || labs.length,
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
      }

      // Fetch badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
      
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
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50)
      
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
      console.error('Initialize error:', error)
      // Show labs even on error, just without progress
      set({ 
        labs: mergeLabs(),
        error: null, // Don't show error to user, just use default progress
        isLoading: false 
      })
    }
  },

  startLab: async (labId, userId) => {
    try {
      if (!userId) {
        console.log('No user, updating local state only')
        // Update local state without backend
        set({
          labs: get().labs.map(lab => 
            lab.id === labId 
              ? { ...lab, status: 'in-progress' as const, startedAt: new Date() }
              : lab
          )
        })
        return
      }

      const lab = LABS_DEFINITION.find(l => l.id === labId)
      if (!lab) throw new Error('Lab not found')

      // Try to update existing progress entry
      const { error: updateError } = await supabase
        .from('labs')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString(),
          progress: 0
        })
        .eq('id', labId)
        .eq('user_id', userId)

      // If update fails (no existing row), insert new one
      if (updateError) {
        const { error: insertError } = await supabase
          .from('labs')
          .insert({
            id: labId,
            user_id: userId,
            title: lab.title,
            description: lab.description,
            category: lab.category,
            status: 'in-progress',
            difficulty: lab.difficulty,
            estimated_time: lab.estimatedTime,
            points: lab.points,
            progress: 0,
            started_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }

      // Update or create user stats
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('in_progress_labs')
        .eq('id', userId)
        .single()

      if (existingStats) {
        await supabase
          .from('user_stats')
          .update({
            in_progress_labs: existingStats.in_progress_labs + 1,
            total_labs: LABS_DEFINITION.length
          })
          .eq('id', userId)
      } else {
        // Create initial stats if they don't exist
        await supabase
          .from('user_stats')
          .insert({
            id: userId,
            total_labs: LABS_DEFINITION.length,
            in_progress_labs: 1,
            completed_labs: 0,
            total_points: 0,
            current_streak: 0,
            longest_streak: 0,
            hours_learned: 0,
            level: 1,
            current_xp: 0,
            xp_to_next_level: 1000
          })
      }

      // Add activity
      await get().addActivity({
        type: 'started',
        title: `Started ${lab.title}`,
        description: 'Lab session started',
      }, userId)

      await get().initialize(userId)
    } catch (error) {
      console.error('Error starting lab:', error)
      set({ error: (error as Error).message })
    }
  },

  updateLabProgress: async (labId, progress, userId) => {
    try {
      if (!userId) {
        // Update local state without backend
        set({
          labs: get().labs.map(lab => 
            lab.id === labId 
              ? { ...lab, progress }
              : lab
          )
        })
        return
      }

      const { error } = await supabase
        .from('labs')
        .update({ progress })
        .eq('id', labId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating lab progress:', error)
        throw error
      }

      await get().initialize(userId)
    } catch (error) {
      console.error('Error updating progress:', error)
      set({ error: (error as Error).message })
    }
  },

  completeLab: async (labId, userId) => {
    try {
      if (!userId) {
        // Update local state without backend
        set({
          labs: get().labs.map(lab => 
            lab.id === labId 
              ? { ...lab, status: 'completed' as const, progress: 100, completedAt: new Date() }
              : lab
          )
        })
        return
      }

      const lab = get().labs.find(l => l.id === labId)
      if (!lab) throw new Error('Lab not found')

      // Update or insert lab completion
      const { error } = await supabase
        .from('labs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress: 100
        })
        .eq('id', labId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error completing lab:', error)
        throw error
      }

      // Update stats
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('completed_labs, in_progress_labs')
        .eq('id', userId)
        .single()

      if (existingStats) {
        await supabase
          .from('user_stats')
          .update({
            completed_labs: existingStats.completed_labs + 1,
            in_progress_labs: Math.max(0, existingStats.in_progress_labs - 1)
          })
          .eq('id', userId)
      }

      // Add points and activity
      await get().addPoints(lab.points, userId)
      await get().addActivity({
        type: 'completed',
        title: `Completed ${lab.title}`,
        description: `Earned ${lab.points} points`,
        points: lab.points
      }, userId)

      await get().initialize(userId)
    } catch (error) {
      console.error('Error completing lab:', error)
      set({ error: (error as Error).message })
    }
  },

  unlockLab: async (labId, userId) => {
    try {
      if (!userId) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('labs')
        .update({ status: 'in-progress' })
        .eq('id', labId)
        .eq('user_id', userId)

      if (error) throw error

      await get().initialize(userId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addActivity: async (activity, userId) => {
    try {
      if (!userId) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('activities')
        .insert([{
          ...activity,
          user_id: userId,
          timestamp: new Date().toISOString()
        }])

      if (error) throw error

      await get().initialize(userId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  earnBadge: async (badgeId, userId) => {
    try {
      if (!userId) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('badges')
        .update({
          is_earned: true,
          earned_at: new Date().toISOString()
        })
        .eq('id', badgeId)
        .eq('user_id', userId)

      if (error) throw error

      await get().initialize(userId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addPoints: async (points, userId) => {
    try {
      if (!userId) throw new Error('User not authenticated')

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
        .eq('id', userId)

      if (error) throw error

      await get().initialize(userId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateStreak: async (userId) => {
    try {
      if (!userId) throw new Error('User not authenticated')

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
        .eq('id', userId)

      if (error) throw error

      await get().initialize(userId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  }
}))

