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

    // Ensure questions and answer_key are properly parsed
    // Supabase JSONB fields are automatically parsed, but ensure they're arrays/objects
    if (quiz.questions && typeof quiz.questions === 'string') {
      try {
        quiz.questions = JSON.parse(quiz.questions)
      } catch (e) {
        console.error('Error parsing questions:', e)
      }
    }
    
    if (quiz.answer_key && typeof quiz.answer_key === 'string') {
      try {
        quiz.answer_key = JSON.parse(quiz.answer_key)
      } catch (e) {
        console.error('Error parsing answer_key:', e)
      }
    }

    // Validate questions structure
    if (!Array.isArray(quiz.questions)) {
      console.error('Questions is not an array:', quiz.questions)
      quiz.questions = []
    }

    // Add learning_path_id for navigation
    if (quiz.learning_paths && typeof quiz.learning_paths === 'object') {
      quiz.learning_path_id = (quiz.learning_paths as any).id
    }

    return NextResponse.json({ quiz })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get quiz' },
      { status: 500 }
    )
  }
}






