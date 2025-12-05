import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { worksheetId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select('*, learning_paths!inner(user_id, id)')
      .eq('id', params.worksheetId)
      .eq('learning_paths.user_id', user.id)
      .single()

    if (error || !worksheet) {
      return NextResponse.json(
        { error: 'Worksheet not found' },
        { status: 404 }
      )
    }

    const worksheetAny = worksheet as any

    // Ensure questions and answer_key are properly parsed
    if (worksheetAny.questions && typeof worksheetAny.questions === 'string') {
      try {
        worksheetAny.questions = JSON.parse(worksheetAny.questions)
      } catch (e) {
        console.error('Error parsing questions:', e)
      }
    }
    
    if (worksheetAny.answer_key && typeof worksheetAny.answer_key === 'string') {
      try {
        worksheetAny.answer_key = JSON.parse(worksheetAny.answer_key)
      } catch (e) {
        console.error('Error parsing answer_key:', e)
      }
    }

    // Validate questions structure
    if (!Array.isArray(worksheetAny.questions)) {
      console.error('Questions is not an array:', worksheetAny.questions)
      worksheetAny.questions = []
    }

    // Add learning_path_id for navigation
    if (worksheetAny.learning_paths && typeof worksheetAny.learning_paths === 'object') {
      worksheetAny.learning_path_id = (worksheetAny.learning_paths as any).id
    }

    // Log for debugging
    console.log('Worksheet data:', {
      id: worksheetAny.id,
      title: worksheetAny.title,
      questionsCount: Array.isArray(worksheetAny.questions) ? worksheetAny.questions.length : 0,
      answerKeyCount: worksheetAny.answer_key ? Object.keys(worksheetAny.answer_key).length : 0,
    })

    return NextResponse.json({ worksheet: worksheetAny })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get worksheet' },
      { status: 500 }
    )
  }
}






