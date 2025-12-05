import type { AIProvider } from '@/lib/ai/providers/base'
import { PROMPTS } from '@/lib/ai/prompts'
import type { RubricCriteria } from '@/types'

export interface CapstoneGenerationResult {
  title: string
  level: string
  description: string
  instructions: string
  requirements: string[]
  evaluation_rubric: RubricCriteria[]
  extension_challenges: string[] | null
  estimated_hours: number
}

export async function generateCapstone(
  provider: AIProvider,
  topic: string,
  level: string,
  concepts: string[]
): Promise<CapstoneGenerationResult> {
  const prompt = PROMPTS.capstone(topic, level, concepts)

  try {
    const response = await provider.generateText(
      prompt,
      'You are an expert educator creating meaningful capstone projects. Generate portfolio-worthy projects with clear requirements. Always respond with valid JSON only, no additional text.',
      {
        temperature: 0.8,
        maxTokens: 4000,
      }
    )

    let jsonStr = response.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonStr) as CapstoneGenerationResult

    if (!parsed.title || !parsed.description || !parsed.instructions) {
      throw new Error('Invalid capstone structure')
    }

    return {
      title: parsed.title,
      level: parsed.level || level,
      description: parsed.description,
      instructions: parsed.instructions,
      requirements: parsed.requirements || [],
      evaluation_rubric: parsed.evaluation_rubric || [],
      extension_challenges: parsed.extension_challenges || null,
      estimated_hours: parsed.estimated_hours || 10,
    }
  } catch (error: any) {
    throw new Error(`Failed to generate capstone: ${error.message}`)
  }
}











