'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NextModuleButtonProps {
  pathId: string
  currentLessonId: string
  currentOrderIndex: number
}

export default function NextModuleButton({
  pathId,
  currentLessonId,
  currentOrderIndex,
}: NextModuleButtonProps) {
  const [nextModule, setNextModule] = useState<{
    type: 'lesson' | 'worksheet' | 'quiz' | null
    id: string
    title: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNextModule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId, currentLessonId, currentOrderIndex])

  const fetchNextModule = async () => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/next-module?currentLessonId=${currentLessonId}&currentOrderIndex=${currentOrderIndex}`)
      if (response.ok) {
        const data = await response.json()
        setNextModule(data.nextModule)
      }
    } catch (error) {
      console.error('Error fetching next module:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!nextModule) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🎉 Congratulations! You&apos;ve completed this module. Return to the learning path to explore more content.
        </p>
        <Link
          href={`/dashboard/learn/${pathId}`}
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Learning Path
        </Link>
      </div>
    )
  }

  const getHref = () => {
    switch (nextModule.type) {
      case 'lesson':
        return `/dashboard/learn/${pathId}/lesson/${nextModule.id}`
      case 'worksheet':
        return `/dashboard/practice/${nextModule.id}`
      case 'quiz':
        return `/dashboard/quiz/${nextModule.id}`
      default:
        return `/dashboard/learn/${pathId}`
    }
  }

  const getButtonText = () => {
    switch (nextModule.type) {
      case 'lesson':
        return 'Next Lesson'
      case 'worksheet':
        return 'Practice Worksheet'
      case 'quiz':
        return 'Take Quiz'
      default:
        return 'Continue'
    }
  }

  return (
    <div className="flex justify-end">
      <Link
        href={getHref()}
        className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <span>{getButtonText()}</span>
        <svg
          className="ml-2 h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
  )
}





