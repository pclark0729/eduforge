import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LearningPathViewer from '@/components/learning/LearningPathViewer'
import ProgressTracker from '@/components/progress/ProgressTracker'
import LearningPathContent from '@/components/learning/LearningPathContent'
import GenerationProgressTracker from '@/components/learning/GenerationProgressTracker'
import Link from 'next/link'

export default async function LearningPathPage({
  params,
}: {
  params: { pathId: string }
}) {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: learningPath, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('id', params.pathId)
    .eq('user_id', user.id)
    .single()

  if (error || !learningPath) {
    notFound()
  }

  // Get lessons for this path
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('learning_path_id', params.pathId)
    .order('order_index', { ascending: true })

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError)
  }

  // Get worksheets for this path
  const { data: worksheets, error: worksheetsError } = await supabase
    .from('worksheets')
    .select('*')
    .eq('learning_path_id', params.pathId)

  if (worksheetsError) {
    console.error('Error fetching worksheets:', worksheetsError)
  }

  // Get quizzes for this path
  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('learning_path_id', params.pathId)

  if (quizzesError) {
    console.error('Error fetching quizzes:', quizzesError)
  }

  // Get capstone projects for this path
  const { data: capstones, error: capstonesError } = await supabase
    .from('capstone_projects')
    .select('*')
    .eq('learning_path_id', params.pathId)

  if (capstonesError) {
    console.error('Error fetching capstones:', capstonesError)
  }

  // Get progress summary
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('learning_path_id', params.pathId)

  const progress = progressData
    ? {
        totalItems: progressData.length,
        completed: progressData.filter((p) => p.status === 'completed').length,
        inProgress: progressData.filter((p) => p.status === 'in_progress').length,
        notStarted: progressData.filter((p) => p.status === 'not_started').length,
        averageScore:
          progressData
            .filter((p) => p.score !== null)
            .reduce((sum, p) => sum + (p.score || 0), 0) /
          (progressData.filter((p) => p.score !== null).length || 1),
        completionRate:
          progressData.filter((p) => p.status === 'completed').length /
          progressData.length,
      }
    : undefined

  return (
    <div className="space-y-8">
      {/* Generation progress tracker */}
      <GenerationProgressTracker pathId={params.pathId} />

      <LearningPathViewer
        learningPath={learningPath}
        progress={progress}
        lessons={lessons || []}
        worksheets={worksheets || []}
        quizzes={quizzes || []}
        capstones={capstones || []}
      />

      {/* Real-time content updates */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">All Learning Content</h2>
        <LearningPathContent
          pathId={params.pathId}
          initialLessons={lessons || []}
          initialWorksheets={worksheets || []}
          initialQuizzes={quizzes || []}
          initialCapstones={capstones || []}
        />
      </div>

      <ProgressTracker learningPathId={params.pathId} />
    </div>
  )
}



