import { createServerComponentClient } from '@/lib/supabase/server'
import type { ContentType, ProgressStatus } from '@/types'
import { updateSpacedRepetition, createSpacedRepetitionItem } from './spaced-repetition'
import { getRecommendedContent } from './difficulty'

export interface ProgressUpdate {
  content_type: ContentType
  learning_path_id?: string
  lesson_id?: string
  worksheet_id?: string
  quiz_id?: string
  capstone_id?: string
  status: ProgressStatus
  completion_percentage: number
  score?: number
  time_spent_minutes: number
}

export class ProgressTracker {
  constructor(private userId: string) {}

  async updateProgress(update: ProgressUpdate): Promise<void> {
    const supabase = await createServerComponentClient()

    // Find existing progress or create new
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('content_type', update.content_type)
      .eq(
        update.content_type === 'lesson' ? 'lesson_id' :
        update.content_type === 'worksheet' ? 'worksheet_id' :
        update.content_type === 'quiz' ? 'quiz_id' :
        'capstone_id',
        update.lesson_id || update.worksheet_id || update.quiz_id || update.capstone_id
      )
      .single()

    const progressData = {
      user_id: this.userId,
      learning_path_id: update.learning_path_id || null,
      lesson_id: update.lesson_id || null,
      worksheet_id: update.worksheet_id || null,
      quiz_id: update.quiz_id || null,
      capstone_id: update.capstone_id || null,
      content_type: update.content_type,
      status: update.status,
      completion_percentage: update.completion_percentage,
      score: update.score || null,
      time_spent_minutes: update.time_spent_minutes,
      last_accessed_at: new Date().toISOString(),
      completed_at: update.status === 'completed' ? new Date().toISOString() : null,
    }

    if (existing) {
      await supabase
        .from('user_progress')
        .update(progressData)
        .eq('id', existing.id)
    } else {
      await supabase.from('user_progress').insert(progressData)
    }

    // Update spaced repetition if content is completed
    if (update.status === 'completed' && update.score !== undefined) {
      await this.updateSpacedRepetition(
        update.lesson_id || update.worksheet_id || update.quiz_id || '',
        update.content_type,
        update.score
      )
    }
  }

  private async updateSpacedRepetition(
    contentId: string,
    contentType: string,
    score: number
  ): Promise<void> {
    const supabase = await createServerComponentClient()

    const { data: existing } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', this.userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single()

    let performance: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) performance = 'excellent'
    else if (score >= 75) performance = 'good'
    else if (score >= 60) performance = 'fair'
    else performance = 'poor'

    if (existing) {
      const updated = updateSpacedRepetition(
        {
          content_id: existing.content_id,
          content_type: existing.content_type,
          difficulty_level: existing.difficulty_level,
          next_review_date: new Date(existing.next_review_date),
          review_count: existing.review_count,
          last_reviewed_at: existing.last_reviewed_at ? new Date(existing.last_reviewed_at) : null,
        },
        performance
      )

      await supabase
        .from('spaced_repetition')
        .update({
          difficulty_level: updated.difficulty_level,
          review_count: updated.review_count,
          last_reviewed_at: updated.last_reviewed_at?.toISOString(),
          next_review_date: updated.next_review_date.toISOString(),
        })
        .eq('id', existing.id)
    } else {
      const newItem = createSpacedRepetitionItem(contentId, contentType)
      await supabase.from('spaced_repetition').insert({
        user_id: this.userId,
        content_id: newItem.content_id,
        content_type: newItem.content_type,
        difficulty_level: newItem.difficulty_level,
        next_review_date: newItem.next_review_date.toISOString(),
        review_count: newItem.review_count,
      })
    }
  }

  async getProgressSummary(learningPathId: string) {
    const supabase = await createServerComponentClient()

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('learning_path_id', learningPathId)

    if (!progress || progress.length === 0) {
      return {
        totalItems: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        averageScore: 0,
        completionRate: 0,
      }
    }

    const completed = progress.filter((p) => p.status === 'completed').length
    const inProgress = progress.filter((p) => p.status === 'in_progress').length
    const scores = progress.filter((p) => p.score !== null).map((p) => p.score!)

    return {
      totalItems: progress.length,
      completed,
      inProgress,
      notStarted: progress.length - completed - inProgress,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      completionRate: completed / progress.length,
    }
  }

  async getRecommendedContent(learningPathId: string) {
    const supabase = await createServerComponentClient()

    const summary = await this.getProgressSummary(learningPathId)
    const { data: path } = await supabase
      .from('learning_paths')
      .select('level')
      .eq('id', learningPathId)
      .single()

    if (!path) return null

    const performance = {
      averageScore: summary.averageScore,
      completionRate: summary.completionRate,
      timeSpent: summary.completed * 30, // Estimate
      attempts: summary.completed,
    }

    return getRecommendedContent(path.level as any, performance)
  }
}











