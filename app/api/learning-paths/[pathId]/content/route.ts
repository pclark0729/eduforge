import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { pathId: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()

    // Verify path belongs to user
    const { data: learningPath } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('id', params.pathId)
      .eq('user_id', user.id)
      .single()

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      )
    }

    // Get all content for this path
    const [lessonsResult, worksheetsResult, quizzesResult, capstonesResult] = await Promise.all([
      supabase
        .from('lessons')
        .select('id, title, level, order_index')
        .eq('learning_path_id', params.pathId)
        .order('order_index', { ascending: true }),
      supabase
        .from('worksheets')
        .select('id, title, level')
        .eq('learning_path_id', params.pathId),
      supabase
        .from('quizzes')
        .select('id, title, level')
        .eq('learning_path_id', params.pathId),
      supabase
        .from('capstone_projects')
        .select('id, title, description, level')
        .eq('learning_path_id', params.pathId),
    ])

    // Parse JSON fields if needed
    const lessons = (lessonsResult.data || []).map((lesson: any) => ({
      ...lesson,
    }))

    const worksheets = (worksheetsResult.data || []).map((worksheet: any) => {
      if (typeof worksheet.questions === 'string') {
        try {
          worksheet.questions = JSON.parse(worksheet.questions)
        } catch (e) {
          // Ignore parse errors
        }
      }
      return worksheet
    })

    const quizzes = (quizzesResult.data || []).map((quiz: any) => {
      if (typeof quiz.questions === 'string') {
        try {
          quiz.questions = JSON.parse(quiz.questions)
        } catch (e) {
          // Ignore parse errors
        }
      }
      return quiz
    })

    return NextResponse.json({
      lessons,
      worksheets,
      quizzes,
      capstones: capstonesResult.data || [],
    })
  } catch (error: any) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}









