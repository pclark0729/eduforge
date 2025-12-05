'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface NextModuleButtonFromContentProps {
  pathId: string
  contentType: 'worksheet' | 'quiz'
  contentId: string
  contentLevel: string
}

export default function NextModuleButtonFromContent({
  pathId,
  contentType,
  contentId,
  contentLevel,
}: NextModuleButtonFromContentProps) {
  const [nextModule, setNextModule] = useState<{
    type: 'lesson' | 'worksheet' | 'quiz' | null
    id: string
    title: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNextModule()
  }, [pathId, contentType, contentId, contentLevel])

  const fetchNextModule = async () => {
    try {
      const response = await fetch(
        `/api/learning-paths/${pathId}/next-module-from-content?contentType=${contentType}&contentId=${contentId}&contentLevel=${contentLevel}`
      )
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

  if (loading || !nextModule) {
    return null
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
    <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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




