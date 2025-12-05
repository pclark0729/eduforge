import { z } from 'zod'

export const learningPathSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  priorKnowledge: z.string().optional(),
})

export const aiProviderSchema = z.object({
  provider_name: z.enum(['openai', 'anthropic', 'ollama']),
  api_key: z.string().optional(),
  base_url: z.string().url().optional().or(z.literal('')),
  model: z.string().optional(),
  is_active: z.boolean().optional(),
})















