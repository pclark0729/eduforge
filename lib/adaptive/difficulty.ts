import type { LearningLevel } from '@/types'

export interface PerformanceMetrics {
  averageScore: number
  completionRate: number
  timeSpent: number
  attempts: number
}

export function calculateDifficultyAdjustment(
  currentLevel: LearningLevel,
  performance: PerformanceMetrics
): LearningLevel | null {
  // If user is performing excellently, suggest moving up
  if (performance.averageScore >= 90 && performance.completionRate >= 0.9) {
    switch (currentLevel) {
      case 'beginner':
        return 'intermediate'
      case 'intermediate':
        return 'advanced'
      case 'advanced':
        return 'expert'
      case 'expert':
        return null // Already at highest level
    }
  }

  // If user is struggling, suggest moving down
  if (performance.averageScore < 60 && performance.completionRate < 0.6) {
    switch (currentLevel) {
      case 'expert':
        return 'advanced'
      case 'advanced':
        return 'intermediate'
      case 'intermediate':
        return 'beginner'
      case 'beginner':
        return null // Already at lowest level
    }
  }

  return null // Stay at current level
}

export function getRecommendedContent(
  currentLevel: LearningLevel,
  performance: PerformanceMetrics
): {
  suggestedLevel: LearningLevel
  needsReview: boolean
  focusAreas: string[]
} {
  const adjustment = calculateDifficultyAdjustment(currentLevel, performance)
  const suggestedLevel = adjustment || currentLevel

  const needsReview = performance.averageScore < 70
  const focusAreas: string[] = []

  if (performance.averageScore < 60) {
    focusAreas.push('Fundamental concepts need reinforcement')
  }
  if (performance.completionRate < 0.7) {
    focusAreas.push('Practice more exercises')
  }
  if (performance.timeSpent < 30) {
    focusAreas.push('Spend more time on each concept')
  }

  return {
    suggestedLevel,
    needsReview,
    focusAreas,
  }
}











