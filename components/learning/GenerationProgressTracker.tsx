'use client'

import { useEffect, useState } from 'react'

interface GenerationProgress {
  status: 'generating' | 'completed' | 'error' | 'not_found'
  currentStep: string
  progress: {
    milestones: number
    totalMilestones: number
    lessons: number
    worksheets: number
    quizzes: number
    capstones: number
  }
  error?: string
}

interface GenerationProgressTrackerProps {
  pathId: string
}

export default function GenerationProgressTracker({ pathId }: GenerationProgressTrackerProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    if (!isPolling) return

    let pollCount = 0
    const maxPolls = 300 // 10 minutes at 2 second intervals

    const pollProgress = async () => {
      try {
        pollCount++
        const response = await fetch(`/api/learning-paths/generate-status?pathId=${pathId}`)
        if (response.ok) {
          const data: GenerationProgress = await response.json()
          
          if (data.status !== 'not_found') {
            setProgress(data)
            
            // Stop polling if completed or error
            if (data.status === 'completed' || data.status === 'error') {
              setIsPolling(false)
              // Clear after showing for a bit longer
              setTimeout(() => {
                setProgress(null)
              }, 10000) // Show for 10 seconds
            }
          } else {
            // No progress found - might be complete or not started
            // Continue polling for a bit in case generation just started
            if (pollCount > 30) { // After 1 minute of no progress
              setIsPolling(false)
            }
          }
        }
      } catch (error) {
        console.error('Error polling generation progress:', error)
        // Don't stop on error, might be temporary
      }
    }

    // Poll immediately, then every 2 seconds
    pollProgress()
    const interval = setInterval(pollProgress, 2000)

    // Stop polling after 10 minutes
    const timeout = setTimeout(() => {
      setIsPolling(false)
      clearInterval(interval)
    }, 600000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathId, isPolling])

  if (!progress || progress.status === 'not_found') {
    return null
  }

  if (progress.status === 'completed') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center space-x-3">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-green-800 dark:text-green-200">
              Content Generation Complete!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {progress.progress.lessons} lessons, {progress.progress.worksheets} worksheets, {progress.progress.quizzes} quizzes, {progress.progress.capstones} capstones generated
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (progress.status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-800 dark:text-red-200">
          Error generating content
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">
          {progress.error || 'Unknown error occurred'}
        </p>
      </div>
    )
  }

  // Generating status
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Generating Content...
          </h3>
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {progress.currentStep}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-800 dark:text-blue-200">Milestones</span>
            <span className="text-blue-600 dark:text-blue-400">
              {progress.progress.milestones} / {progress.progress.totalMilestones}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 dark:bg-blue-800">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 dark:bg-blue-400"
              style={{
                width: `${progress.progress.totalMilestones > 0 
                  ? (progress.progress.milestones / progress.progress.totalMilestones) * 100 
                  : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Lessons:</span>
            <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
              {progress.progress.lessons}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Worksheets:</span>
            <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
              {progress.progress.worksheets}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Quizzes:</span>
            <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
              {progress.progress.quizzes}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Capstones:</span>
            <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
              {progress.progress.capstones}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

