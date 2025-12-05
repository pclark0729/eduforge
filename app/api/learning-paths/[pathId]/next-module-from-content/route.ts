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
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')
    const contentLevel = searchParams.get('contentLevel')

    if (!contentType || !contentId || !contentLevel) {
      return NextResponse.json(
        { error: 'contentType, contentId, and contentLevel are required' },
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

    // Strategy: After worksheet/quiz, go to quiz if worksheet, or next lesson if quiz
    if (contentType === 'worksheet') {
      // After worksheet, try to find quiz at same level
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('learning_path_id', params.pathId)
        .eq('level', contentLevel)
        .limit(1)
        .single()

      if (quiz) {
        return NextResponse.json({
          nextModule: {
            type: 'quiz',
            id: quiz.id,
            title: quiz.title,
          },
        })
      }
    }

    // After quiz or if no quiz found, find next lesson
    // Get the lesson associated with this content (if worksheet)
    let lessonOrderIndex = 0
    if (contentType === 'worksheet') {
      const { data: worksheet } = await supabase
        .from('worksheets')
        .select('lesson_id')
        .eq('id', contentId)
        .single()

      if (worksheet?.lesson_id) {
        const { data: lesson } = await supabase
          .from('lessons')
          .select('order_index')
          .eq('id', worksheet.lesson_id)
          .single()

        if (lesson) {
          lessonOrderIndex = lesson.order_index
        }
      }
    }

    // Find next lesson in sequence
    const { data: nextLesson } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('learning_path_id', params.pathId)
      .gt('order_index', lessonOrderIndex)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    if (nextLesson) {
      return NextResponse.json({
        nextModule: {
          type: 'lesson',
          id: nextLesson.id,
          title: nextLesson.title,
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









