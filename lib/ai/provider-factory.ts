import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { OllamaProvider } from './providers/ollama'
import type { AIProvider } from './providers/base'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function getActiveAIProvider(
  userId: string
): Promise<AIProvider | null> {
  const supabase = await createServerComponentClient()

  const { data: providers, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (error || !providers) {
    return null
  }

  return createProvider(providers)
}

export function createProvider(config: {
  provider_name: string
  api_key?: string | null
  base_url?: string | null
  model?: string | null
}): AIProvider {
  switch (config.provider_name) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: config.api_key || undefined,
        model: config.model || undefined,
      })
    case 'anthropic':
      return new AnthropicProvider({
        apiKey: config.api_key || undefined,
        model: config.model || undefined,
      })
    case 'ollama':
      return new OllamaProvider({
        baseUrl: config.base_url || undefined,
        model: config.model || undefined,
      })
    default:
      throw new Error(`Unknown provider: ${config.provider_name}`)
  }
}

export function createProviderFromEnv(): AIProvider | null {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    })
  }

  // Try Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    })
  }

  // Try Ollama
  if (process.env.OLLAMA_BASE_URL) {
    return new OllamaProvider({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: process.env.OLLAMA_MODEL || 'llama2',
    })
  }

  return null
}
















