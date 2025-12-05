'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QuizInterface from '@/components/quiz/QuizInterface'

export default function QuizPage() {
  const params = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuiz()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.quizId}`)
      if (response.ok) {
        const data = await response.json()
        const quizData = data.quiz
        
        // Ensure questions and answer_key are parsed if they're strings
        if (quizData) {
          if (typeof quizData.questions === 'string') {
            quizData.questions = JSON.parse(quizData.questions)
          }
          if (typeof quizData.answer_key === 'string') {
            quizData.answer_key = JSON.parse(quizData.answer_key)
          }
          
          // Ensure questions is an array
          if (!Array.isArray(quizData.questions)) {
            console.error('Questions is not an array:', quizData.questions)
            quizData.questions = []
          }
          
          console.log('Parsed quiz data:', {
            questionsCount: quizData.questions.length,
            questions: quizData.questions.map((q: any) => ({
              id: q.id,
              type: q.type,
              hasOptions: !!q.options && Array.isArray(q.options),
              optionsCount: q.options?.length || 0,
            })),
          })
        }
        
        setQuiz(quizData)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch quiz:', errorData)
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (answers: Record<string, any>, score: number) => {
    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'quiz',
          quiz_id: params.quizId,
          learning_path_id: quiz?.learning_path_id,
          status: 'completed',
          completion_percentage: 100,
          score,
          time_spent_minutes: quiz?.time_limit_minutes || 30,
        }),
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (loading) {
    return <div>Loading quiz...</div>
  }

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return <QuizInterface quiz={quiz} onSubmit={handleSubmit} />
}



