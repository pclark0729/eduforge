import type { AIProvider } from '@/lib/ai/providers/base'
import { generateLearningPath } from './learning-path'
import { generateLesson } from './lessons'
import { generateWorksheet } from './worksheets'
import { generateQuiz } from './quizzes'
import { generateCapstone } from './capstones'
import type {
  LearningPathGenerationResult,
  LessonGenerationResult,
  WorksheetGenerationResult,
  QuizGenerationResult,
  CapstoneGenerationResult,
} from './learning-path'

export class ContentGenerator {
  constructor(private provider: AIProvider) {}

  async createLearningPath(
    topic: string,
    level: string,
    priorKnowledge?: string
  ): Promise<LearningPathGenerationResult> {
    return generateLearningPath(this.provider, topic, level, priorKnowledge)
  }

  async createLesson(
    concept: string,
    level: string,
    learningStyle?: string,
    context?: string
  ): Promise<LessonGenerationResult> {
    return generateLesson(this.provider, concept, level, learningStyle, context)
  }

  async createWorksheet(
    concept: string,
    level: string,
    lessonContext?: string
  ): Promise<WorksheetGenerationResult> {
    return generateWorksheet(this.provider, concept, level, lessonContext)
  }

  async createQuiz(
    concepts: string[],
    level: string,
    type: 'quiz' | 'exam' = 'quiz'
  ): Promise<QuizGenerationResult> {
    return generateQuiz(this.provider, concepts, level, type)
  }

  async createCapstone(
    topic: string,
    level: string,
    concepts: string[]
  ): Promise<CapstoneGenerationResult> {
    return generateCapstone(this.provider, topic, level, concepts)
  }
}











