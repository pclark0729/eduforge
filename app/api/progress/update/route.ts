import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { ProgressTracker } from '@/lib/adaptive/progress-tracker'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const {
      content_type,
      learning_path_id,
      lesson_id,
      worksheet_id,
      quiz_id,
      capstone_id,
      status,
      completion_percentage,
      score,
      time_spent_minutes,
    } = body

    if (!content_type || !status) {
      return NextResponse.json(
        { error: 'content_type and status are required' },
        { status: 400 }
      )
    }

    const tracker = new ProgressTracker(user.id)
    await tracker.updateProgress({
      content_type,
      learning_path_id,
      lesson_id,
      worksheet_id,
      quiz_id,
      capstone_id,
      status,
      completion_percentage: completion_percentage || 0,
      score,
      time_spent_minutes: time_spent_minutes || 0,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const learningPathId = searchParams.get('learning_path_id')

    if (!learningPathId) {
      return NextResponse.json(
        { error: 'learning_path_id is required' },
        { status: 400 }
      )
    }

    const tracker = new ProgressTracker(user.id)
    const summary = await tracker.getProgressSummary(learningPathId)
    const recommendations = await tracker.getRecommendedContent(learningPathId)

    return NextResponse.json({
      summary,
      recommendations,
    })
  } catch (error: any) {
    console.error('Error getting progress:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get progress' },
      { status: 500 }
    )
  }
}










