import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  description?: string
  gradient?: string
  iconBg?: string
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({
  icon,
  label,
  value,
  description,
  gradient,
  iconBg = 'bg-slate-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-gray-200/60',
        gradient && 'text-white border-0',
        className
      )}
      style={gradient ? { background: gradient } : undefined}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110',
              gradient ? 'bg-white/20 backdrop-blur-sm' : iconBg
            )}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
                trend.positive === false && 'bg-red-50 text-red-700 border-red-200/50'
              )}
            >
              {trend.value}
            </div>
          )}
        </div>
        <div className={cn('text-3xl font-bold mb-1 tracking-tight', gradient ? 'text-white' : 'text-slate-900')}>
          {value}
        </div>
        <div className={cn('text-sm font-medium mb-1', gradient ? 'text-white/90' : 'text-slate-600')}>
          {label}
        </div>
        {description && (
          <div className={cn('text-xs mt-2', gradient ? 'text-white/70' : 'text-slate-500')}>
            {description}
          </div>
        )}
      </div>
    </Card>
  )
}
