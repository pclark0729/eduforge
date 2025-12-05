import type { AIProvider } from '@/lib/ai/providers/base'
import { PROMPTS } from '@/lib/ai/prompts'
import type { LearningPath, Milestone } from '@/types'

export interface LearningPathGenerationResult {
  title: string
  description: string
  topic: string
  level: string
  estimated_hours: number
  prerequisites: string[]
  key_concepts: string[]
  milestones: Milestone[]
}

export async function generateLearningPath(
  provider: AIProvider,
  topic: string,
  level: string,
  priorKnowledge?: string
): Promise<LearningPathGenerationResult> {
  const prompt = PROMPTS.learningPath(topic, level, priorKnowledge)
  
  try {
    const response = await provider.generateText(
      prompt,
      'You are an expert educational content creator. Generate structured, comprehensive learning paths that are progressive and well-organized. Always respond with valid JSON only, no additional text.',
      {
        temperature: 0.7,
        maxTokens: 3000,
      }
    )

    // Extract JSON from response (handle cases where AI adds markdown formatting)
    let jsonStr = response.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonStr) as LearningPathGenerationResult

    // Validate and ensure all required fields
    if (!parsed.title || !parsed.topic || !parsed.milestones) {
      throw new Error('Invalid learning path structure')
    }

    return {
      title: parsed.title,
      description: parsed.description || `Learn ${topic} from ${level} level`,
      topic: parsed.topic,
      level: parsed.level || level,
      estimated_hours: parsed.estimated_hours || 20,
      prerequisites: parsed.prerequisites || [],
      key_concepts: parsed.key_concepts || [],
      milestones: parsed.milestones || [],
    }
  } catch (error: any) {
    throw new Error(`Failed to generate learning path: ${error.message}`)
  }
}











