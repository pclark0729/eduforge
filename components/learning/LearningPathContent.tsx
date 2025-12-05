'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LearningPathContentProps {
  pathId: string
  initialLessons?: any[]
  initialWorksheets?: any[]
  initialQuizzes?: any[]
  initialCapstones?: any[]
}

export default function LearningPathContent({
  pathId,
  initialLessons = [],
  initialWorksheets = [],
  initialQuizzes = [],
  initialCapstones = [],
}: LearningPathContentProps) {
  const [lessons, setLessons] = useState(initialLessons)
  const [worksheets, setWorksheets] = useState(initialWorksheets)
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [capstones, setCapstones] = useState(initialCapstones)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    // Poll for new content every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/learning-paths/${pathId}/content`)
        if (response.ok) {
          const data = await response.json()
          
          // Update state if content has changed
          if (data.lessons && data.lessons.length !== lessons.length) {
            setLessons(data.lessons)
          }
          if (data.worksheets && data.worksheets.length !== worksheets.length) {
            setWorksheets(data.worksheets)
          }
          if (data.quizzes && data.quizzes.length !== quizzes.length) {
            setQuizzes(data.quizzes)
          }
          if (data.capstones && data.capstones.length !== capstones.length) {
            setCapstones(data.capstones)
          }

          // Stop polling if we have substantial content (all milestones likely have content)
          const totalContent = (data.lessons?.length || 0) + 
                              (data.worksheets?.length || 0) + 
                              (data.quizzes?.length || 0) + 
                              (data.capstones?.length || 0)
          
          if (totalContent > 10 && isPolling) {
            // Wait a bit more then stop polling
            setTimeout(() => setIsPolling(false), 10000)
          }
        }
      } catch (error) {
        console.error('Error polling for content:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      setIsPolling(false)
      clearInterval(pollInterval)
    }, 300000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [pathId, lessons.length, worksheets.length, quizzes.length, capstones.length, isPolling])

  const totalContent = lessons.length + worksheets.length + quizzes.length + capstones.length

  if (totalContent === 0) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Generating content...
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Lessons, worksheets, and quizzes are being created. This page will update automatically.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isPolling && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ {totalContent} items generated so far. Content is still being created...
          </p>
        </div>
      )}

      {lessons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">📚 Lessons ({lessons.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/dashboard/learn/${pathId}/lesson/${lesson.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {lesson.title}
                </span>
                <span className="text-xs text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {worksheets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">✏️ Worksheets ({worksheets.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {worksheets.map((worksheet) => (
              <Link
                key={worksheet.id}
                href={`/dashboard/practice/${worksheet.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {worksheet.title}
                </span>
                <span className="text-xs text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {quizzes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">📝 Quizzes ({quizzes.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/dashboard/quiz/${quiz.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {quiz.title}
                </span>
                <span className="text-xs text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {capstones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">🎯 Capstone Projects ({capstones.length})</h3>
          <div className="grid gap-3">
            {capstones.map((capstone: any) => (
              <Link
                key={capstone.id}
                href={`/dashboard/capstone/${capstone.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
              >
                <div className="flex-1">
                  <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                    {capstone.title}
                  </h6>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {capstone.description}
                  </p>
                  {capstone.estimated_hours && (
                    <p className="text-xs text-gray-500 mt-2">
                      Estimated: {capstone.estimated_hours} hours
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 ml-4">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}



