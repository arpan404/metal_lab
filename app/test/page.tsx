'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const { 
    currentUser, 
    learningState, 
    stats, 
    isLoading,
    error,
    initialize,
    updateUserState,
    updateLearningState,
    updateStats
  } = useStore()

  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, message])
  }

  const runTests = async () => {
    setTestResults([])
    
    try {
      // Test 1: Initialize store
      addTestResult('Testing store initialization...')
      await initialize()
      addTestResult('✅ Store initialized successfully')

      // Test 2: Update user state
      addTestResult('Testing user state update...')
      await updateUserState({
        timeToday: 120,
        experimentsCompleted: 5
      })
      addTestResult('✅ User state updated successfully')

      // Test 3: Update learning state
      addTestResult('Testing learning state update...')
      await updateLearningState({
        currentModule: 'Test Module',
        currentUnit: 'Test Unit',
        lastStudied: new Date()
      })
      addTestResult('✅ Learning state updated successfully')

      // Test 4: Update stats
      addTestResult('Testing stats update...')
      await updateStats({
        totalHours: 10,
        averageScore: 85
      })
      addTestResult('✅ Stats updated successfully')

      // Test 5: Verify data persistence
      addTestResult('Testing data persistence...')
      await initialize()
      if (
        currentUser.timeToday === 120 &&
        currentUser.experimentsCompleted === 5 &&
        learningState.currentModule === 'Test Module' &&
        learningState.currentUnit === 'Test Unit' &&
        stats.totalHours === 10 &&
        stats.averageScore === 85
      ) {
        addTestResult('✅ Data persistence verified')
      } else {
        throw new Error('Data persistence test failed')
      }

    } catch (error) {
      addTestResult(`❌ Error: ${(error as Error).message}`)
    }
  }

  const resetStore = async () => {
    try {
      await updateUserState({
        timeToday: 0,
        timeThisWeek: 0,
        level: 1,
        experimentsCompleted: 0,
        labsInProgress: 0
      })

      await updateLearningState({
        currentModule: '',
        currentUnit: '',
        lastStudied: new Date()
      })

      await updateStats({
        totalHours: 0,
        averageScore: 0,
        dayStreak: 0
      })

      addTestResult('✅ Store reset successfully')
    } catch (error) {
      addTestResult(`❌ Error resetting store: ${(error as Error).message}`)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Store Testing Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runTests}>Run Tests</Button>
            <Button variant="outline" onClick={resetStore}>Reset Store</Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="text-sm">
                {result}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current User State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs">
                  {JSON.stringify(currentUser, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Learning State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs">
                  {JSON.stringify(learningState, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}