import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    href: string
  }
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Lab Completed!',
    message: 'You successfully completed the Double Slit Experiment lab.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false,
    action: {
      label: 'View Certificate',
      href: '/progress'
    }
  },
  {
    id: '2',
    type: 'info',
    title: 'New Lab Available',
    message: 'Quantum Tunneling lab is now unlocked. Start your journey into quantum mechanics!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    action: {
      label: 'Start Lab',
      href: '/labs/quantum-tunneling'
    }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Simulation Timeout',
    message: 'Your previous simulation session timed out. Progress has been saved.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Weekly Progress Report',
    message: 'Great work! You completed 3 labs this week and earned 2 new badges.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    action: {
      label: 'View Stats',
      href: '/progress'
    }
  },
  {
    id: '5',
    type: 'success',
    title: 'Achievement Unlocked',
    message: 'You earned the "Quantum Explorer" badge for completing 5 quantum physics labs!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    action: {
      label: 'View Badges',
      href: '/progress'
    }
  }
]

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,
  
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }
  }),
  
  markAsRead: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    }
    return state
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount
    }
  }),
  
  clearAll: () => set(() => ({
    notifications: [],
    unreadCount: 0
  }))
}))
