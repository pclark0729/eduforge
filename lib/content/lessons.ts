import type { AIProvider } from '@/lib/ai/providers/base'
import { PROMPTS } from '@/lib/ai/prompts'
import type { Lesson, StepByStepExample } from '@/types'

export interface LessonGenerationResult {
  title: string
  concept: string
  level: string
  simple_explanation: string
  deep_explanation: string
  real_world_use_cases: string[]
  analogies: string[]
  visual_models: string
  step_by_step_examples: StepByStepExample[]
  common_mistakes: string[]
  estimated_minutes: number
}

export async function generateLesson(
  provider: AIProvider,
  concept: string,
  level: string,
  learningStyle?: string,
  context?: string
): Promise<LessonGenerationResult> {
  const prompt = PROMPTS.lesson(concept, level, learningStyle, context)

  try {
    const response = await provider.generateText(
      prompt,
      'You are an expert educator. Create clear, engaging, and comprehensive lessons. Always respond with valid JSON only, no additional text.',
      {
        temperature: 0.7,
        maxTokens: 4000,
      }
    )

    let jsonStr = response.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonStr) as LessonGenerationResult

    if (!parsed.title || !parsed.concept) {
      throw new Error('Invalid lesson structure')
    }

    return {
      title: parsed.title,
      concept: parsed.concept,
      level: parsed.level || level,
      simple_explanation: parsed.simple_explanation || '',
      deep_explanation: parsed.deep_explanation || '',
      real_world_use_cases: parsed.real_world_use_cases || [],
      analogies: parsed.analogies || [],
      visual_models: parsed.visual_models || '',
      step_by_step_examples: parsed.step_by_step_examples || [],
      common_mistakes: parsed.common_mistakes || [],
      estimated_minutes: parsed.estimated_minutes || 30,
    }
  } catch (error: any) {
    throw new Error(`Failed to generate lesson: ${error.message}`)
  }
}










