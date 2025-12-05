import type { AIProvider } from '@/lib/ai/providers/base'
import { PROMPTS } from '@/lib/ai/prompts'
import type { QuizQuestion } from '@/types'

export interface QuizGenerationResult {
  title: string
  level: string
  type: 'quiz' | 'exam'
  questions: QuizQuestion[]
  answer_key: Record<string, any>
  passing_score: number
  time_limit_minutes: number
}

export async function generateQuiz(
  provider: AIProvider,
  concepts: string[],
  level: string,
  type: 'quiz' | 'exam' = 'quiz'
): Promise<QuizGenerationResult> {
  const prompt = PROMPTS.quiz(concepts, level, type)

  // Try up to 3 times to get enough questions
  let attempts = 0
  const maxAttempts = 3
  const minQuestions = type === 'exam' ? 12 : 8 // Lowered from 10 to 8 to be more lenient

  while (attempts < maxAttempts) {
    try {
      const response = await provider.generateText(
        prompt,
        'You are an expert educator creating assessments. Generate fair, comprehensive quizzes that test understanding. You MUST generate at least 10 questions for quizzes and 12 for exams. Always respond with valid JSON only, no additional text.',
        {
          temperature: 0.7,
          maxTokens: 5000, // Increased for more questions
        }
      )

      let jsonStr = response.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(jsonStr) as QuizGenerationResult

      if (!parsed.title || !parsed.questions || !parsed.answer_key) {
        throw new Error('Invalid quiz structure')
      }

      // Validate questions array
      if (!Array.isArray(parsed.questions)) {
        throw new Error('Questions must be an array')
      }

      // Ensure we have enough questions
      if (parsed.questions.length < minQuestions) {
        if (attempts < maxAttempts - 1) {
          attempts++
          console.log(`Only ${parsed.questions.length} questions generated, retrying... (attempt ${attempts + 1}/${maxAttempts})`)
          continue // Retry
        }
        console.warn(`Only ${parsed.questions.length} questions generated, expected at least ${minQuestions}`)
      }

      // Validate that all questions have required fields
      const validQuestions = parsed.questions.filter((q: any) => {
        if (!q.id || !q.type || !q.question || q.correct_answer === undefined || !q.explanation) {
          console.warn('Invalid question found:', q)
          return false
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

      if (validQuestions.length < minQuestions) {
        if (attempts < maxAttempts - 1) {
          attempts++
          console.log(`Too few valid questions (${validQuestions.length}), retrying... (attempt ${attempts + 1}/${maxAttempts})`)
          continue
        }
        // If we have at least 5 questions, proceed anyway (better than nothing)
        if (validQuestions.length >= 5) {
          console.warn(`Only ${validQuestions.length} valid questions generated, expected ${minQuestions}, but proceeding anyway`)
        } else {
          throw new Error(`Too few valid questions generated: ${validQuestions.length}. Expected at least ${minQuestions}.`)
        }
      }

      return {
        title: parsed.title,
        level: parsed.level || level,
        type: parsed.type || type,
        questions: validQuestions,
        answer_key: parsed.answer_key || {},
        passing_score: parsed.passing_score || (type === 'exam' ? 70 : 60),
        time_limit_minutes: parsed.time_limit_minutes || (type === 'exam' ? 60 : 30),
      }
    } catch (error: any) {
      if (attempts < maxAttempts - 1) {
        attempts++
        console.log(`Error generating quiz, retrying... (attempt ${attempts + 1}/${maxAttempts}):`, error.message)
        continue
      }
      throw new Error(`Failed to generate quiz: ${error.message}`)
    }
  }

  throw new Error('Failed to generate quiz after multiple attempts')
}






