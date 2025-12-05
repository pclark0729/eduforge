import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    // Get existing quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*, learning_paths!inner(user_id)')
      .eq('id', params.quizId)
      .eq('learning_paths.user_id', user.id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get learning path to extract concepts
    const { data: learningPath } = await supabase
      .from('learning_paths')
      .select('topic, milestones, key_concepts')
      .eq('id', quiz.learning_path_id)
      .single()

    // Extract concepts for this quiz level
    let concepts: string[] = []
    if (learningPath) {
      const milestones = (learningPath.milestones as any[]) || []
      const milestone = milestones.find((m: any) => m.level === quiz.level)
      if (milestone && milestone.concepts) {
        concepts = milestone.concepts
      } else if (learningPath.key_concepts) {
        concepts = learningPath.key_concepts
      }
    }

    if (concepts.length === 0) {
      concepts = [learningPath?.topic || 'the topic']
    }

    // Get AI provider
    let provider = await getActiveAIProvider(user.id)
    if (!provider) {
      provider = createProviderFromEnv()
      if (!provider) {
        return NextResponse.json(
          { error: 'No AI provider configured' },
          { status: 400 }
        )
      }
    }

    // Regenerate quiz
    const generator = new ContentGenerator(provider)
    const newQuiz = await generator.createQuiz(
      concepts,
      quiz.level,
      quiz.type || 'quiz'
    )

    // Update quiz with new questions
    const { data: updatedQuiz, error: updateError } = await supabase
      .from('quizzes')
      .update({
        title: newQuiz.title,
        questions: newQuiz.questions,
        answer_key: newQuiz.answer_key,
        passing_score: newQuiz.passing_score,
        time_limit_minutes: newQuiz.time_limit_minutes,
      })
      .eq('id', params.quizId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      quiz: updatedQuiz,
      message: `Quiz regenerated with ${newQuiz.questions.length} questions`,
    })
  } catch (error: any) {
    console.error('Error regenerating quiz:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate quiz' },
      { status: 500 }
    )
  }
}









