'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { Lab } from '@/lib/types'
import { Play, CheckCircle2, Lock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function LabsList() {
  const { labs, isLoading } = useStore()

  if (isLoading) {
    return <div>Loading labs...</div>
  }

  if (!labs?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-slate-900">No labs found</h3>
        <p className="text-sm text-slate-500">Try adjusting your filters to see more results</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labs.map((lab: Lab) => (
        <Card key={lab.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                lab.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                lab.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {lab.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                 lab.status === 'in-progress' ? <Play className="w-5 h-5" /> :
                 <Lock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">{lab.category}</p>
                <CardTitle className="text-lg">{lab.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-4">{lab.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm text-slate-500">{lab.progress}%</span>
            </div>
            <Progress value={lab.progress} className="mb-4" />
            <div className="flex items-center justify-between">
              <Button 
                variant={lab.status === 'locked' ? 'outline' : 'default'}
                disabled={lab.status === 'locked'}
                className="w-full"
              >
                {lab.status === 'completed' ? 'Review Lab' :
                 lab.status === 'in-progress' ? 'Continue' :
                 'Start Lab'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}