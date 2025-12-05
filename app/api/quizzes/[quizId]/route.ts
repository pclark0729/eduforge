import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*, learning_paths!inner(user_id, id)')
      .eq('id', params.quizId)
      .eq('learning_paths.user_id', user.id)
      .single()

    if (error || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const quizAny = quiz as any

    // Ensure questions and answer_key are properly parsed
    // Supabase JSONB fields are automatically parsed, but ensure they're arrays/objects
    if (quizAny.questions && typeof quizAny.questions === 'string') {
      try {
        quizAny.questions = JSON.parse(quizAny.questions)
      } catch (e) {
        console.error('Error parsing questions:', e)
      }
    }
    
    if (quizAny.answer_key && typeof quizAny.answer_key === 'string') {
      try {
        quizAny.answer_key = JSON.parse(quizAny.answer_key)
      } catch (e) {
        console.error('Error parsing answer_key:', e)
      }
    }

    // Validate questions structure
    if (!Array.isArray(quizAny.questions)) {
      console.error('Questions is not an array:', quizAny.questions)
      quizAny.questions = []
    }

    // Add learning_path_id for navigation
    if (quizAny.learning_paths && typeof quizAny.learning_paths === 'object') {
      quizAny.learning_path_id = (quizAny.learning_paths as any).id
    }

    return NextResponse.json({ quiz: quizAny })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get quiz' },
      { status: 500 }
    )
  }
}






