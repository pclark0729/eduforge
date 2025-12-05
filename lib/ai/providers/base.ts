export interface AIProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  name: string
  generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string>
  generateChat(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string>
}

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string>

  abstract generateChat(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string>
}














