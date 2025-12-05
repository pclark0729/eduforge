import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyLearningPage() {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: learningPaths } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Learning</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          All your learning paths and progress
        </p>
      </div>

      {learningPaths && learningPaths.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(learningPaths as any[]).map((path: any) => (
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
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don&apos;t have any learning paths yet.
          </p>
          <Link
            href="/dashboard/create-path"
            className="inline-block rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Your First Learning Path
          </Link>
        </div>
      )}
    </div>
  )
}









