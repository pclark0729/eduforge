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

    const { learning_path_id, lesson_id, concept, level } = body

    if (!concept || !level) {
      return NextResponse.json(
        { error: 'Concept and level are required' },
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

    // Get lesson context if lesson_id provided
    let lessonContext
    if (lesson_id) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, concept, simple_explanation')
        .eq('id', lesson_id)
        .single()

      if (lesson) {
        lessonContext = `${lesson.title}: ${lesson.simple_explanation}`
      }
    }

    // Generate worksheet
    const generator = new ContentGenerator(provider)
    const worksheet = await generator.createWorksheet(concept, level, lessonContext)

    // Save to database
    const { data: savedWorksheet, error: saveError } = await supabase
      .from('worksheets')
      .insert({
        learning_path_id: learning_path_id || null,
        lesson_id: lesson_id || null,
        title: worksheet.title,
        level: worksheet.level,
        questions: worksheet.questions,
        answer_key: worksheet.answer_key,
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({ worksheet: savedWorksheet })
  } catch (error: any) {
    console.error('Error generating worksheet:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate worksheet' },
      { status: 500 }
    )
  }
}










