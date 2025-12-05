import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { learning_path_id, concepts, level, type = 'quiz' } = body

    if (!concepts || !Array.isArray(concepts) || concepts.length === 0 || !level) {
      return NextResponse.json(
        { error: 'Concepts array and level are required' },
        { status: 400 }
      )
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

    // Generate quiz
    const generator = new ContentGenerator(provider)
    const quiz = await generator.createQuiz(concepts, level, type)

    // Save to database
    const { data: savedQuiz, error: saveError } = await supabase
      .from('quizzes')
      .insert({
        learning_path_id: learning_path_id || null,
        title: quiz.title,
        level: quiz.level,
        type: quiz.type,
        questions: quiz.questions,
        answer_key: quiz.answer_key,
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({ quiz: savedQuiz })
  } catch (error: any) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}














