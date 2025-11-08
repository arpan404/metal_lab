'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Mail,
  Shield
} from 'lucide-react'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()

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

  const userInitials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
  const userName = user?.fullName || 'User'
  const userEmail = user?.primaryEmailAddress?.emailAddress || ''

  return (
    <TooltipProvider>
      <div className="relative" ref={dropdownRef}>
        {/* User Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:bg-slate-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Avatar className="h-7 w-7 border-2 border-slate-200">
                <AvatarImage src={user?.imageUrl} alt={userName} />
                <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">{user?.firstName || 'User'}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Account menu</p>
          </TooltipContent>
        </Tooltip>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-100 bg-linear-to-br from-slate-50 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm">
                  <AvatarImage src={user?.imageUrl} alt={userName} />
                  <AvatarFallback className="bg-slate-900 text-white text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-xs text-slate-600 truncate">{userEmail}</p>
                </div>
              </div>
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-8 border-slate-200 hover:bg-slate-50"
                >
                  View Profile
                </Button>
              </Link>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Profile</p>
                  <p className="text-xs text-slate-500">Manage your account</p>
                </div>
              </Link>

              <Link 
                href="/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Settings</p>
                  <p className="text-xs text-slate-500">Preferences & privacy</p>
                </div>
              </Link>

              <div className="my-2 h-px bg-gray-100" />

              <SignOutButton>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-red-600">Sign Out</p>
                    <p className="text-xs text-red-500">Log out of your account</p>
                  </div>
                </button>
              </SignOutButton>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
