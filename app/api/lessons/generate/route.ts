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

    const { learning_path_id, concept, level, order_index, learningStyle } = body

    if (!learning_path_id || !concept || !level || order_index === undefined) {
      return NextResponse.json(
        { error: 'learning_path_id, concept, level, and order_index are required' },
        { status: 400 }
      )
    }

    // Verify path belongs to user
    const { data: path } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', learning_path_id)
      .eq('user_id', user.id)
      .single()

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
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

    // Get user profile for learning style
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('learning_style')
      .eq('id', user.id)
      .single()

    const pathAny = path as any
    const profileAny = profile as any

    // Generate lesson
    const generator = new ContentGenerator(provider)
    const lesson = await generator.createLesson(
      concept,
      level,
      learningStyle || profileAny?.learning_style || undefined,
      `Part of learning path: ${pathAny.title}`
    )

    // Save to database
    const { data: savedLesson, error: saveError } = await (supabase
      .from('lessons') as any)
      .insert({
        learning_path_id,
        title: lesson.title,
        concept: lesson.concept,
        level: lesson.level,
        order_index,
        simple_explanation: lesson.simple_explanation,
        deep_explanation: lesson.deep_explanation,
        real_world_use_cases: lesson.real_world_use_cases,
        analogies: lesson.analogies,
        visual_models: lesson.visual_models,
        step_by_step_examples: lesson.step_by_step_examples,
        common_mistakes: lesson.common_mistakes,
        estimated_minutes: lesson.estimated_minutes,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({ lesson: savedLesson })
  } catch (error: any) {
    console.error('Error generating lesson:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate lesson' },
      { status: 500 }
    )
  }
}
















