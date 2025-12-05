import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LessonViewer from '@/components/learning/LessonViewer'
import CompleteLessonButton from '@/components/learning/CompleteLessonButton'
import NextModuleButton from '@/components/learning/NextModuleButton'
import Link from 'next/link'

export default async function LessonPage({
  params,
}: {
  params: { pathId: string; lessonId: string }
}) {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, learning_paths!inner(user_id)')
    .eq('id', params.lessonId)
    .eq('learning_paths.user_id', user.id)
    .single()

  if (error || !lesson) {
    notFound()
  }

  // Update progress
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', params.lessonId)
    .single()

  if (!existingProgress) {
    await supabase.from('user_progress').insert({
      user_id: user.id,
      learning_path_id: params.pathId,
      lesson_id: params.lessonId,
      content_type: 'lesson',
      status: 'in_progress',
      completion_percentage: 0,
      last_accessed_at: new Date().toISOString(),
    } as any)
  } else {
    await supabase
      .from('user_progress')
      .update({
        last_accessed_at: new Date().toISOString(),
        status: existingProgress.status === 'not_started' ? 'in_progress' : existingProgress.status,
      } as any)
      .eq('id', existingProgress.id)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Link
          href={`/dashboard/learn/${params.pathId}`}
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

      <LessonViewer lesson={lesson} />

      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <CompleteLessonButton
          pathId={params.pathId}
          lessonId={params.lessonId}
          estimatedMinutes={lesson.estimated_minutes}
        />
        <NextModuleButton
          pathId={params.pathId}
          currentLessonId={params.lessonId}
          currentOrderIndex={lesson.order_index}
        />
      </div>
    </div>
  )
}

