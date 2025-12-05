'use client'

interface ContentGenerationStatusProps {
  status: 'generating' | 'completed' | 'error'
  message?: string
}

export default function ContentGenerationStatus({
  status,
  message,
}: ContentGenerationStatusProps) {
  if (status === 'generating') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Generating Content...
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {message || 'Creating lessons, worksheets, and quizzes for all milestones'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'completed') {
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
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Content Generated Successfully!
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              {message || 'All lessons, worksheets, and quizzes are ready'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-800 dark:text-red-200">
          Error generating content
        </p>
        <p className="text-sm text-red-600 dark:text-red-300">{message}</p>
      </div>
    )
  }

  return null
}











