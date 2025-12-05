import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CapstoneViewer from '@/components/capstone/CapstoneViewer'
import Link from 'next/link'

export default async function CapstonePage({
  params,
}: {
  params: { capstoneId: string }
}) {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: capstone, error } = await supabase
    .from('capstone_projects')
    .select('*, learning_paths!inner(user_id, id)')
    .eq('id', params.capstoneId)
    .eq('learning_paths.user_id', user.id)
    .single()

  if (error || !capstone) {
    notFound()
  }

  // Cast to any to handle joined relations and property access
  const capstoneAny = capstone as any
  const pathId = capstoneAny.learning_path_id || capstoneAny.learning_paths?.id

  // Parse JSON fields if needed
  if (capstoneAny.requirements && typeof capstoneAny.requirements === 'string') {
    try {
      capstoneAny.requirements = JSON.parse(capstoneAny.requirements)
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (capstoneAny.evaluation_rubric && typeof capstoneAny.evaluation_rubric === 'string') {
    try {
      capstoneAny.evaluation_rubric = JSON.parse(capstoneAny.evaluation_rubric)
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (capstoneAny.extension_challenges && typeof capstoneAny.extension_challenges === 'string') {
    try {
      capstoneAny.extension_challenges = JSON.parse(capstoneAny.extension_challenges)
    } catch (e) {
      // Ignore parse errors
    }
  }

  return (
    <div className="space-y-8">
      {pathId && (
        <div className="flex items-center">
          <Link
            href={`/dashboard/learn/${pathId}`}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Learning Path</span>
          </Link>
        </div>
      )}

      <CapstoneViewer capstone={capstoneAny} />
    </div>
  )
}







