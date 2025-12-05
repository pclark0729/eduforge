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

    // Ensure questions and answer_key are properly parsed
    if (worksheet.questions && typeof worksheet.questions === 'string') {
      try {
        worksheet.questions = JSON.parse(worksheet.questions)
      } catch (e) {
        console.error('Error parsing questions:', e)
      }
    }
    
    if (worksheet.answer_key && typeof worksheet.answer_key === 'string') {
      try {
        worksheet.answer_key = JSON.parse(worksheet.answer_key)
      } catch (e) {
        console.error('Error parsing answer_key:', e)
      }
    }

    // Validate questions structure
    if (!Array.isArray(worksheet.questions)) {
      console.error('Questions is not an array:', worksheet.questions)
      worksheet.questions = []
    }

    // Add learning_path_id for navigation
    if (worksheet.learning_paths && typeof worksheet.learning_paths === 'object') {
      worksheet.learning_path_id = (worksheet.learning_paths as any).id
    }

    // Log for debugging
    console.log('Worksheet data:', {
      id: worksheet.id,
      title: worksheet.title,
      questionsCount: Array.isArray(worksheet.questions) ? worksheet.questions.length : 0,
      answerKeyCount: worksheet.answer_key ? Object.keys(worksheet.answer_key).length : 0,
    })

    return NextResponse.json({ worksheet })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get worksheet' },
      { status: 500 }
    )
  }
}






