'use client'

import { useState } from 'react'

interface CompleteLessonButtonProps {
  pathId: string
  lessonId: string
  estimatedMinutes?: number | null
}

export default function CompleteLessonButton({
  pathId,
  lessonId,
  estimatedMinutes,
}: CompleteLessonButtonProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'lesson',
          learning_path_id: pathId,
          lesson_id: lessonId,
          status: 'completed',
          completion_percentage: 100,
          time_spent_minutes: estimatedMinutes || 30,
        }),
      })
      setCompleted(true)
    } catch (error) {
      console.error('Error completing lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="rounded-md bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-200">
        Lesson completed!
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="rounded-md bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Marking as completed...' : 'Mark as Completed'}
    </button>
  )
}














