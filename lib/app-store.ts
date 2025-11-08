import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  checkpoints?: {
    id: string
    title: string
    completed: boolean
  }[]
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
  // Labs
  labs: Lab[]
  
  // User Stats
  stats: UserStats
  
  // Badges
  badges: Badge[]
  
  // Recent Activity
  activities: Activity[]
  
  // Actions
  startLab: (labId: string) => void
  updateLabProgress: (labId: string, progress: number) => void
  completeLab: (labId: string) => void
  unlockLab: (labId: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  earnBadge: (badgeId: string) => void
  addPoints: (points: number) => void
  updateStreak: () => void
}

// Initial mock data
const initialLabs: Lab[] = [
  {
    id: 'double-slit',
    title: 'Double Slit Experiment',
    description: 'Explore the wave-particle duality of light through the famous double-slit experiment.',
    category: 'Quantum',
    status: 'completed',
    progress: 100,
    difficulty: 'Beginner',
    estimatedTime: 45,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    points: 250,
    checkpoints: [
      { id: '1', title: 'Setup apparatus', completed: true },
      { id: '2', title: 'Run simulation', completed: true },
      { id: '3', title: 'Analyze patterns', completed: true },
      { id: '4', title: 'Complete quiz', completed: true },
    ]
  },
  {
    id: 'quantum-tunneling',
    title: 'Quantum Tunneling',
    description: 'Discover how particles can pass through energy barriers in quantum mechanics.',
    category: 'Quantum',
    status: 'in-progress',
    progress: 65,
    difficulty: 'Intermediate',
    estimatedTime: 60,
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    points: 300,
    checkpoints: [
      { id: '1', title: 'Understand concept', completed: true },
      { id: '2', title: 'Setup simulation', completed: true },
      { id: '3', title: 'Observe tunneling', completed: true },
      { id: '4', title: 'Calculate probabilities', completed: false },
      { id: '5', title: 'Complete assessment', completed: false },
    ]
  },
  {
    id: 'wave-particle',
    title: 'Wave-Particle Duality',
    description: 'Understand the dual nature of matter and light in quantum physics.',
    category: 'Quantum',
    status: 'completed',
    progress: 100,
    difficulty: 'Beginner',
    estimatedTime: 50,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    points: 200,
  },
  {
    id: 'photoelectric',
    title: 'Photoelectric Effect',
    description: 'Investigate how light interacts with matter through the photoelectric effect.',
    category: 'Quantum',
    status: 'in-progress',
    progress: 30,
    difficulty: 'Beginner',
    estimatedTime: 40,
    startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    points: 180,
    checkpoints: [
      { id: '1', title: 'Learn theory', completed: true },
      { id: '2', title: 'Setup experiment', completed: true },
      { id: '3', title: 'Measure electrons', completed: false },
      { id: '4', title: 'Plot graphs', completed: false },
    ]
  },
  {
    id: 'schrodinger-cat',
    title: "Schrödinger's Cat",
    description: 'Explore quantum superposition through this famous thought experiment.',
    category: 'Quantum',
    status: 'locked',
    progress: 0,
    difficulty: 'Intermediate',
    estimatedTime: 55,
    points: 280,
  },
  {
    id: 'quantum-entanglement',
    title: 'Quantum Entanglement',
    description: 'Study the mysterious correlation between quantum particles.',
    category: 'Quantum',
    status: 'locked',
    progress: 0,
    difficulty: 'Advanced',
    estimatedTime: 75,
    points: 400,
  },
  {
    id: 'newtons-laws',
    title: "Newton's Laws of Motion",
    description: 'Master the fundamental principles of classical mechanics.',
    category: 'Classical',
    status: 'completed',
    progress: 100,
    difficulty: 'Beginner',
    estimatedTime: 35,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    points: 150,
  },
  {
    id: 'pendulum',
    title: 'Simple Pendulum',
    description: 'Analyze harmonic motion through pendulum experiments.',
    category: 'Classical',
    status: 'completed',
    progress: 100,
    difficulty: 'Beginner',
    estimatedTime: 40,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    points: 170,
  },
]

const initialBadges: Badge[] = [
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Completed first lab',
    icon: 'Zap',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    isEarned: true,
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'quantum-explorer',
    name: 'Quantum Explorer',
    description: 'Completed 5 quantum labs',
    icon: 'Flask',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    isEarned: true,
    earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: '100% on 3 labs',
    icon: 'Trophy',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    isEarned: true,
    earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: 'Target',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    isEarned: true,
    earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a lab in under 30 minutes',
    icon: 'Rocket',
    color: 'bg-red-100 text-red-700 border-red-200',
    isEarned: false,
  },
  {
    id: 'physics-master',
    name: 'Physics Master',
    description: 'Complete all available labs',
    icon: 'Crown',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    isEarned: false,
  },
]

const initialActivities: Activity[] = [
  {
    id: '1',
    type: 'completed',
    title: 'Double Slit Experiment',
    description: 'Completed lab with 100% score',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    points: 250,
  },
  {
    id: '2',
    type: 'badge',
    title: 'Earned "Quantum Explorer" badge',
    description: 'Completed 5 quantum physics labs',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    points: 100,
  },
  {
    id: '3',
    type: 'started',
    title: 'Started Quantum Tunneling',
    description: 'Began new lab experiment',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'completed',
    title: 'Wave-Particle Duality',
    description: 'Successfully completed advanced concepts',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    points: 200,
  },
]

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      labs: initialLabs,
      stats: {
        totalLabs: initialLabs.length,
        completedLabs: initialLabs.filter(l => l.status === 'completed').length,
        inProgressLabs: initialLabs.filter(l => l.status === 'in-progress').length,
        totalPoints: 2450,
        currentStreak: 7,
        longestStreak: 12,
        hoursLearned: 48,
        level: 8,
        currentXP: 2450,
        xpToNextLevel: 3000,
      },
      badges: initialBadges,
      activities: initialActivities,

      startLab: (labId) => {
        set((state) => ({
          labs: state.labs.map((lab) =>
            lab.id === labId && lab.status === 'locked'
              ? { ...lab, status: 'in-progress', startedAt: new Date() }
              : lab
          ),
          stats: {
            ...state.stats,
            inProgressLabs: state.stats.inProgressLabs + 1,
          },
        }))
        
        const lab = get().labs.find(l => l.id === labId)
        if (lab) {
          get().addActivity({
            type: 'started',
            title: `Started ${lab.title}`,
            description: 'Began new lab experiment',
          })
        }
      },

      updateLabProgress: (labId, progress) => {
        set((state) => ({
          labs: state.labs.map((lab) =>
            lab.id === labId ? { ...lab, progress } : lab
          ),
        }))
      },

      completeLab: (labId) => {
        const lab = get().labs.find(l => l.id === labId)
        if (!lab) return

        set((state) => ({
          labs: state.labs.map((l) =>
            l.id === labId
              ? { ...l, status: 'completed', progress: 100, completedAt: new Date() }
              : l
          ),
          stats: {
            ...state.stats,
            completedLabs: state.stats.completedLabs + 1,
            inProgressLabs: Math.max(0, state.stats.inProgressLabs - 1),
            totalPoints: state.stats.totalPoints + lab.points,
            currentXP: state.stats.currentXP + lab.points,
          },
        }))

        get().addActivity({
          type: 'completed',
          title: lab.title,
          description: 'Completed lab with excellent score',
          points: lab.points,
        })

        get().addPoints(lab.points)
      },

      unlockLab: (labId) => {
        set((state) => ({
          labs: state.labs.map((lab) =>
            lab.id === labId && lab.status === 'locked'
              ? { ...lab, status: 'in-progress' }
              : lab
          ),
        }))
      },

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        }
        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 20), // Keep last 20
        }))
      },

      earnBadge: (badgeId) => {
        set((state) => ({
          badges: state.badges.map((badge) =>
            badge.id === badgeId
              ? { ...badge, isEarned: true, earnedAt: new Date() }
              : badge
          ),
        }))

        const badge = get().badges.find(b => b.id === badgeId)
        if (badge) {
          get().addActivity({
            type: 'badge',
            title: `Earned "${badge.name}" badge`,
            description: badge.description,
            points: 100,
          })
          get().addPoints(100)
        }
      },

      addPoints: (points) => {
        set((state) => {
          const newXP = state.stats.currentXP + points
          const newLevel = Math.floor(newXP / 300) + 1 // Level up every 300 XP
          
          return {
            stats: {
              ...state.stats,
              totalPoints: state.stats.totalPoints + points,
              currentXP: newXP,
              level: newLevel,
              xpToNextLevel: (newLevel * 300),
            },
          }
        })
      },

      updateStreak: () => {
        set((state) => {
          const newStreak = state.stats.currentStreak + 1
          return {
            stats: {
              ...state.stats,
              currentStreak: newStreak,
              longestStreak: Math.max(state.stats.longestStreak, newStreak),
            },
          }
        })
      },
    }),
    {
      name: 'metal-lab-storage',
    }
  )
)
