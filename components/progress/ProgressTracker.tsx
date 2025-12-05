'use client'

import { useEffect, useState } from 'react'

interface ProgressSummary {
  totalItems: number
  completed: number
  inProgress: number
  notStarted: number
  averageScore: number
  completionRate: number
}

interface Recommendations {
  suggestedLevel: string
  needsReview: boolean
  focusAreas: string[]
}

interface ProgressTrackerProps {
  learningPathId: string
}

export default function ProgressTracker({ learningPathId }: ProgressTrackerProps) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningPathId])

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `/api/progress?learning_path_id=${learningPathId}`
      )
      const data = await response.json()
      setSummary(data.summary)
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading progress...</div>
  }

  if (!summary) {
    return <div>No progress data available</div>
  }

  const completionPercentage = Math.round(summary.completionRate * 100)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-2xl font-bold">{summary.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{summary.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{summary.notStarted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Not Started</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {summary.averageScore > 0 ? Math.round(summary.averageScore) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          {recommendations.needsReview && (
            <div className="mb-4 p-4 rounded bg-yellow-50 dark:bg-yellow-900/20">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Review recommended: Your performance suggests reviewing previous concepts.
              </p>
            </div>
          )}
          {recommendations.focusAreas.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Focus Areas</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {recommendations.focusAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}











