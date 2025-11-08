'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNotificationStore } from '@/lib/notification-store'
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  X, 
  CheckCheck,
  Trash2,
  Sparkles
} from 'lucide-react'

export function NotificationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50'
      case 'info':
        return 'bg-blue-50'
      case 'warning':
        return 'bg-amber-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
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
    <TooltipProvider>
      <div className="relative" ref={dropdownRef}>
        {/* Notification Bell Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-[420px] max-w-[420px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-600">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              
              {/* Actions on the right */}
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    {unreadCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={markAllAsRead}
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark all as read</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearAll}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear all notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Notifications List - Scrollable */}
          <div className="overflow-y-auto max-h-[500px] p-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">All clear!</h4>
                <p className="text-xs text-slate-600 max-w-[250px]">
                  You don't have any notifications right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      notification.read
                        ? 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'bg-linear-to-br from-blue-50/80 to-purple-50/80 border-blue-200 hover:border-blue-300'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      </div>
                    )}

                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`shrink-0 w-9 h-9 rounded-lg ${getBackgroundColor(notification.type)} flex items-center justify-center`}>
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                            {notification.title}
                          </h4>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Dismiss</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>

                          {notification.action && (
                            <Link 
                              href={notification.action.href}
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                                setIsOpen(false)
                              }}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                {notification.action.label} →
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
