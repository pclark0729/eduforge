import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { getActiveAIProvider, createProviderFromEnv } from '@/lib/ai/provider-factory'
import { ContentGenerator } from '@/lib/content/content-generator'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { worksheetId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    // Get existing worksheet
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .select('*, learning_paths!inner(user_id)')
      .eq('id', params.worksheetId)
      .eq('learning_paths.user_id', user.id)
      .single()

    if (worksheetError || !worksheet) {
      return NextResponse.json(
        { error: 'Worksheet not found' },
        { status: 404 }
      )
    }

    // Get lesson context if available
    let lessonContext
    if (worksheet.lesson_id) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, concept, simple_explanation')
        .eq('id', worksheet.lesson_id)
        .single()

      if (lesson) {
        lessonContext = `${lesson.title}: ${lesson.simple_explanation}`
      }
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

    // Regenerate worksheet
    const generator = new ContentGenerator(provider)
    const concept = worksheet.lesson_id 
      ? (await supabase.from('lessons').select('concept').eq('id', worksheet.lesson_id).single()).data?.concept || 'concept'
      : 'concept'

    const newWorksheet = await generator.createWorksheet(
      concept,
      worksheet.level,
      lessonContext
    )

    // Update worksheet with new questions
    const { data: updatedWorksheet, error: updateError } = await supabase
      .from('worksheets')
      .update({
        title: newWorksheet.title,
        questions: newWorksheet.questions,
        answer_key: newWorksheet.answer_key,
      })
      .eq('id', params.worksheetId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      worksheet: updatedWorksheet,
      message: `Worksheet regenerated with ${newWorksheet.questions.length} questions`,
    })
  } catch (error: any) {
    console.error('Error regenerating worksheet:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate worksheet' },
      { status: 500 }
    )
  }
}









