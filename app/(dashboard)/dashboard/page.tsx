import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: learningPaths } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentProgress } = await supabase
    .from('user_progress')
    .select('*, learning_paths(title)')
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/create-path"
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
        >
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3 className="text-lg font-semibold">Create New Learning Path</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start learning a new topic
          </p>
        </Link>

        {learningPaths?.map((path) => (
          <Link
            key={path.id}
            href={`/dashboard/learn/${path.id}`}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold">{path.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {path.description || path.topic}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {path.level}
              </span>
              {path.estimated_hours && (
                <span className="text-sm text-gray-500">
                  ~{path.estimated_hours}h
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {recentProgress && recentProgress.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {recentProgress.map((progress: any) => (
              <div
                key={progress.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {progress.learning_paths?.title || 'Learning Path'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {progress.content_type} - {progress.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {progress.completion_percentage}%
                    </div>
                    {progress.score !== null && (
                      <div className="text-xs text-gray-500">
                        Score: {progress.score}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

