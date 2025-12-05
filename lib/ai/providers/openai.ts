import OpenAI from 'openai'
import { BaseAIProvider, type ChatMessage } from './base'

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai'
  private client: OpenAI | null = null

  constructor(config: { apiKey?: string; model?: string }) {
    super(config)
    if (config.apiKey) {
      this.client = new OpenAI({
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
      throw new Error('OpenAI client not initialized. API key required.')
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    const response = await this.client.chat.completions.create({
      model: options?.model || this.config.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    })

    return response.choices[0]?.message?.content || ''
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
      throw new Error('OpenAI client not initialized. API key required.')
    }

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    const response = await this.client.chat.completions.create({
      model: options?.model || this.config.model || 'gpt-4-turbo-preview',
      messages: openaiMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    })

    return response.choices[0]?.message?.content || ''
  }
}
















