import { addDays, isBefore, parseISO } from 'date-fns'

export interface SpacedRepetitionItem {
  content_id: string
  content_type: string
  difficulty_level: number // 1-5 scale
  next_review_date: Date | string
  review_count: number
  last_reviewed_at: Date | string | null
}

/**
 * Calculate next review date based on SM-2 algorithm (simplified)
 */
export function calculateNextReviewDate(
  difficulty: number,
  reviewCount: number,
  lastReviewDate: Date | null
): Date {
  // Base interval in days
  let interval = 1

  if (reviewCount === 0) {
    interval = 1 // First review tomorrow
  } else if (reviewCount === 1) {
    interval = 3 // Second review in 3 days
  } else if (reviewCount === 2) {
    interval = 7 // Third review in a week
  } else {
    // Exponential growth based on difficulty
    // Higher difficulty = shorter intervals
    const baseInterval = Math.pow(2, reviewCount - 2)
    const difficultyMultiplier = 1 + (5 - difficulty) * 0.2
    interval = Math.floor(baseInterval * difficultyMultiplier)
  }

  const baseDate = lastReviewDate || new Date()
  return addDays(baseDate, interval)
}

/**
 * Update spaced repetition item after review
 */
export function updateSpacedRepetition(
  item: SpacedRepetitionItem,
  performance: 'excellent' | 'good' | 'fair' | 'poor'
): SpacedRepetitionItem {
  const difficultyMap = {
    excellent: Math.max(1, item.difficulty_level - 1),
    good: item.difficulty_level,
    fair: Math.min(5, item.difficulty_level + 1),
    poor: Math.min(5, item.difficulty_level + 2),
  }

  const newDifficulty = difficultyMap[performance]
  const newReviewCount = item.review_count + 1
  const now = new Date()

  return {
    ...item,
    difficulty_level: newDifficulty,
    review_count: newReviewCount,
    last_reviewed_at: now,
    next_review_date: calculateNextReviewDate(newDifficulty, newReviewCount, now),
  }
}

/**
 * Get items due for review
 */
export function getItemsDueForReview(
  items: SpacedRepetitionItem[]
): SpacedRepetitionItem[] {
  const today = new Date()
  return items.filter((item) => {
    const reviewDate = item.next_review_date instanceof Date
      ? item.next_review_date
      : parseISO(item.next_review_date.toString())
    return isBefore(reviewDate, today) || reviewDate.getTime() === today.getTime()
  })
}

/**
 * Create initial spaced repetition item
 */
export function createSpacedRepetitionItem(
  contentId: string,
  contentType: string,
  initialDifficulty: number = 3
): SpacedRepetitionItem {
  return {
    content_id: contentId,
    content_type: contentType,
    difficulty_level: initialDifficulty,
    next_review_date: calculateNextReviewDate(initialDifficulty, 0, null),
    review_count: 0,
    last_reviewed_at: null,
  }
}














