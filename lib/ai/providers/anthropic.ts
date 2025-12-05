import Anthropic from '@anthropic-ai/sdk'
import { BaseAIProvider, type ChatMessage } from './base'

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic'
  private client: Anthropic | null = null

  constructor(config: { apiKey?: string; model?: string }) {
    super(config)
    if (config.apiKey) {
      this.client = new Anthropic({
        apiKey: config.apiKey,
      })
    }
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
    if (!this.client) {
      throw new Error('Anthropic client not initialized. API key required.')
    }

    const response = await this.client.messages.create({
      model: options?.model || this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens ?? 2000,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    return ''
  }

  async generateChat(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic client not initialized. API key required.')
    }

    const systemMessage = messages.find((m) => m.role === 'system')
    const userMessages = messages.filter((m) => m.role !== 'system')

    const anthropicMessages: Anthropic.MessageParam[] = userMessages.map(
      (msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })
    )

    const response = await this.client.messages.create({
      model: options?.model || this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens ?? 2000,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: anthropicMessages,
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    return ''
  }
}
















