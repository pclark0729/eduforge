import type { AIProvider } from '@/lib/ai/providers/base'
import { PROMPTS } from '@/lib/ai/prompts'
import type { WorksheetQuestion } from '@/types'

export interface WorksheetGenerationResult {
  title: string
  level: string
  questions: WorksheetQuestion[]
  answer_key: Record<string, any>
}

export async function generateWorksheet(
  provider: AIProvider,
  concept: string,
  level: string,
  lessonContext?: string
): Promise<WorksheetGenerationResult> {
  const prompt = PROMPTS.worksheet(concept, level, lessonContext)

  // Try up to 2 times to get enough questions
  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    try {
      const response = await provider.generateText(
        prompt,
        'You are an expert educator creating practice worksheets. Generate diverse, appropriate questions. You MUST generate at least 7 questions. Always respond with valid JSON only, no additional text.',
        {
          temperature: 0.8,
          maxTokens: 4000, // Increased for more questions
        }
      )

    let jsonStr = response.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonStr) as WorksheetGenerationResult

    if (!parsed.title || !parsed.questions || !parsed.answer_key) {
      throw new Error('Invalid worksheet structure')
    }

    // Validate questions array
    if (!Array.isArray(parsed.questions)) {
      throw new Error('Questions must be an array')
    }

    // Ensure we have at least 5 questions, ideally 7-8
    if (parsed.questions.length < 5) {
      console.warn(`Only ${parsed.questions.length} questions generated, expected at least 5`)
    }

    // Validate that all questions have required fields
    const validQuestions = parsed.questions.filter((q: any) => {
      // Basic validation
      if (!q.id || !q.type || !q.question || q.correct_answer === undefined || !q.points) {
        console.warn('Invalid question - missing basic fields:', q)
        return false
      }

      // Validate question text is not empty
      if (!q.question || q.question.trim().length === 0) {
        console.warn('Invalid question - empty question text:', q)
        return false
      }

      // Type-specific validation
      if (q.type === 'matching') {
        if (!Array.isArray(q.options) || q.options.length === 0) {
          console.warn('Invalid matching question - missing or empty options:', q)
          return false
        }
        if (!Array.isArray(q.correct_answer) || q.correct_answer.length !== q.options.length) {
          console.warn('Invalid matching question - answer length mismatch:', q)
          return false
        }
      }

      if (q.type === 'multiple_choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          console.warn('Invalid multiple choice question - missing or insufficient options:', q)
          return false
        }
        if (typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer >= q.options.length) {
          console.warn('Invalid multiple choice question - invalid correct_answer index:', q)
          return false
        }
      }

      if (q.type === 'true_false') {
        if (q.correct_answer !== 'true' && q.correct_answer !== 'false') {
          console.warn('Invalid true/false question - correct_answer must be "true" or "false":', q)
          return false
        }
      }

      if (q.type === 'fill_in_blank' && !q.question.includes('___')) {
        console.warn('Invalid fill_in_blank question - missing blank marker (___):', q)
        // Don't fail, but warn
      }

      return true
    })

    // Validate answer key has entries for all question IDs
    const questionIds = new Set(validQuestions.map((q: any) => q.id))
    const answerKeyIds = new Set(Object.keys(parsed.answer_key))
    
    // Check for missing answer key entries
    const missingAnswers = Array.from(questionIds).filter(id => !answerKeyIds.has(id))
    if (missingAnswers.length > 0) {
      console.warn('Missing answer key entries for questions:', missingAnswers)
      // Add placeholder answers for missing entries
      missingAnswers.forEach((id) => {
        const question = validQuestions.find((q: any) => q.id === id)
        if (question) {
          parsed.answer_key[id] = question.correct_answer || 'Answer not provided'
        }
      })
    }

    // Check for extra answer key entries
    const extraAnswers = Array.from(answerKeyIds).filter(id => !questionIds.has(id))
    if (extraAnswers.length > 0) {
      console.warn('Extra answer key entries without questions:', extraAnswers)
    }

      if (validQuestions.length < 5) {
        if (attempts < maxAttempts - 1) {
          attempts++
          console.log(`Only ${validQuestions.length} questions generated, retrying... (attempt ${attempts + 1}/${maxAttempts})`)
          continue // Retry
        }
        throw new Error(`Too few valid questions generated: ${validQuestions.length}. Expected at least 5.`)
      }

      return {
        title: parsed.title,
        level: parsed.level || level,
        questions: validQuestions,
        answer_key: parsed.answer_key || {},
      }
    } catch (error: any) {
      if (attempts < maxAttempts - 1) {
        attempts++
        console.log(`Error generating worksheet, retrying... (attempt ${attempts + 1}/${maxAttempts}):`, error.message)
        continue
      }
      throw new Error(`Failed to generate worksheet: ${error.message}`)
    }
  }

  throw new Error('Failed to generate worksheet after multiple attempts')
}






