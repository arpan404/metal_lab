import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, PlayCircle, CheckCircle, Clock, Award, TrendingUp, Sparkles } from 'lucide-react'
import { IconFlask } from '@tabler/icons-react'

interface Lab {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'locked'
  progress: number
  category: string
}

interface LabCardProps {
  lab: Lab
}

export function LabCard({ lab }: LabCardProps) {

  const getStatusBadge = () => {
    switch (lab.status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-50">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case 'locked':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        )
    }
  }

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 border-gray-200/60 ${
        lab.status === 'locked'
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'
      }`}
    >
      {/* Lab Thumbnail */}
      <div className="relative w-full h-56 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {lab.status === 'locked' ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/80 text-sm font-medium">Complete previous labs to unlock</p>
              <p className="text-white/50 text-xs mt-2">Keep learning to access this experiment</p>
            </div>
          </div>
        ) : (
          <>
            {/* Lab Thumbnail Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-600/20 to-blue-600/20">
              <IconFlask className="w-16 h-16 text-white/40" />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Floating badge for completed labs */}
            {lab.status === 'completed' && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-emerald-500 text-white border-0 shadow-lg backdrop-blur-sm">
                  <Award className="w-3 h-3 mr-1" />
                  Mastered
                </Badge>
              </div>
            )}

            {/* Progress indicator overlay */}
            {lab.status === 'in-progress' && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/90">Progress</span>
                    <span className="text-xs font-bold text-white">{lab.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${lab.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <IconFlask className="w-4 h-4 text-purple-600" />
            </div>
            {getStatusBadge()}
          </div>
          <Badge variant="outline" className="text-xs border-gray-200">{lab.category}</Badge>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
          {lab.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{lab.description}</p>

        {lab.status !== 'locked' && (
          <div className="space-y-3">
            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-slate-600">
              {lab.status === 'completed' ? (
                <>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Certified</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~45 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{lab.progress}% done</span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Bar for in-progress */}
            {lab.status === 'in-progress' && (
              <div className="pt-2">
                <Progress value={lab.progress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>

      {lab.status !== 'locked' && (
        <CardFooter className="p-6 pt-0">
          <Link href={`/labs/${lab.id}`} className="w-full">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0 gap-2 group/btn">
              {lab.status === 'in-progress' ? (
                <>
                  <PlayCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  Continue Lab
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                  Review & Practice
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
