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
    const { searchParams } = new URL(request.url)
    const currentLessonId = searchParams.get('currentLessonId')
    const currentOrderIndex = searchParams.get('currentOrderIndex')

    if (!currentLessonId || !currentOrderIndex) {
      return NextResponse.json(
        { error: 'currentLessonId and currentOrderIndex are required' },
        { status: 400 }
      )
    }

    // Verify path belongs to user
    const { data: learningPath } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', params.pathId)
      .eq('user_id', user.id)
      .single()

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      )
    }

    const orderIndex = parseInt(currentOrderIndex, 10)

    // Get current lesson to find its level
    const { data: currentLesson } = await supabase
      .from('lessons')
      .select('level, learning_path_id')
      .eq('id', currentLessonId)
      .single()

    if (!currentLesson) {
      return NextResponse.json({ nextModule: null })
    }

    const currentLessonAny = currentLesson as any

    // Strategy: Try to find next lesson, then worksheet, then quiz for the same level
    // 1. Check for next lesson in sequence
    const { data: nextLesson } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('learning_path_id', params.pathId)
      .eq('level', currentLessonAny.level)
      .gt('order_index', orderIndex)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    const nextLessonAny = nextLesson as any
    if (nextLessonAny) {
      return NextResponse.json({
        nextModule: {
          type: 'lesson',
          id: nextLessonAny.id,
          title: nextLessonAny.title,
        },
      })
    }

    // 2. Check for worksheet for current lesson
    const { data: worksheet } = await supabase
      .from('worksheets')
      .select('id, title')
      .eq('learning_path_id', params.pathId)
      .eq('lesson_id', currentLessonId)
      .limit(1)
      .single()

    const worksheetAny = worksheet as any
    if (worksheetAny) {
      return NextResponse.json({
        nextModule: {
          type: 'worksheet',
          id: worksheetAny.id,
          title: worksheetAny.title,
        },
      })
    }

    // 3. Check for quiz at this level
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('learning_path_id', params.pathId)
      .eq('level', currentLessonAny.level)
      .limit(1)
      .single()

    const quizAny = quiz as any
    if (quizAny) {
      return NextResponse.json({
        nextModule: {
          type: 'quiz',
          id: quizAny.id,
          title: quizAny.title,
        },
      })
    }

    // 4. Check for next lesson at any level (progression to next milestone)
    const { data: anyNextLesson } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('learning_path_id', params.pathId)
      .gt('order_index', orderIndex)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    const anyNextLessonAny = anyNextLesson as any
    if (anyNextLessonAny) {
      return NextResponse.json({
        nextModule: {
          type: 'lesson',
          id: anyNextLessonAny.id,
          title: anyNextLessonAny.title,
        },
      })
    }

    // No next module found
    return NextResponse.json({ nextModule: null })
  } catch (error: any) {
    console.error('Error finding next module:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find next module' },
      { status: 500 }
    )
  }
}










