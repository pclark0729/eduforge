import { BaseAIProvider, type ChatMessage } from './base'

export class OllamaProvider extends BaseAIProvider {
  name = 'ollama'
  private baseUrl: string

  constructor(config: { baseUrl?: string; model?: string }) {
    super(config)
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string> {
    const model = options?.model || this.config.model || 'llama2'

    const messages: ChatMessage[] = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    return this.generateChat(messages, options)
  }

  async generateChat(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string> {
    const model = options?.model || this.config.model || 'llama2'

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2000,
          },
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || ''
    } catch (error: any) {
      throw new Error(`Failed to generate text with Ollama: ${error.message}`)
    }
  }
}















