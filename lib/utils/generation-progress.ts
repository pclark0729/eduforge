// In-memory store for generation progress (in production, use Redis or database)
const generationProgress = new Map<string, {
  status: 'generating' | 'completed' | 'error'
  currentStep: string
  progress: {
    milestones: number
    totalMilestones: number
    lessons: number
    worksheets: number
    quizzes: number
    capstones: number
  }
  error?: string
}>()

export function setGenerationProgress(
  pathId: string,
  progress: {
    status: 'generating' | 'completed' | 'error'
    currentStep: string
    progress: {
      milestones: number
      totalMilestones: number
      lessons: number
      worksheets: number
      quizzes: number
      capstones: number
    }
    error?: string
  }
) {
  generationProgress.set(pathId, progress)
}

export function getGenerationProgress(pathId: string) {
  return generationProgress.get(pathId)
}

export function clearGenerationProgress(pathId: string) {
  generationProgress.delete(pathId)
}









