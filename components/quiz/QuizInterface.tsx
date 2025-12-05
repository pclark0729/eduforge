'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { QuizQuestion } from '@/types'
import NextModuleButtonFromContent from '@/components/learning/NextModuleButtonFromContent'

interface QuizInterfaceProps {
  quiz: {
    id: string
    title: string
    level: string
    learning_path_id?: string
    type: 'quiz' | 'exam'
    questions: QuizQuestion[]
    answer_key: Record<string, any>
    passing_score: number
    time_limit_minutes: number | null
  }
  onSubmit?: (answers: Record<string, any>, score: number) => void
  showNextModule?: boolean
}

export default function QuizInterface({ quiz, onSubmit, showNextModule = true }: QuizInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  )

  // Ensure questions is an array and parse if needed
  const questions = Array.isArray(quiz.questions) 
    ? quiz.questions 
    : typeof quiz.questions === 'string' 
      ? JSON.parse(quiz.questions) 
      : []

  // Ensure answer_key is an object and parse if needed
  const answerKey = typeof quiz.answer_key === 'object' && quiz.answer_key !== null
    ? quiz.answer_key
    : typeof quiz.answer_key === 'string'
      ? JSON.parse(quiz.answer_key)
      : {}

  // Debug logging
  useEffect(() => {
    console.log('Quiz data:', {
      questionsCount: questions.length,
      answerKeyKeys: Object.keys(answerKey),
      questions: questions.map((q: any, i: number) => ({
        index: i + 1,
        id: q.id,
        type: q.type,
        question: q.question?.substring(0, 50),
        options: q.options,
        hasOptions: !!q.options && Array.isArray(q.options),
        optionsCount: q.options?.length || 0,
      })),
    })
  }, [])

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeRemaining === 0 && !submitted) {
      handleSubmit()
    }
  }, [timeRemaining, submitted])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    let correct = 0
    let total = 0

    questions.forEach((question: QuizQuestion) => {
      total += question.points || 10
      const userAnswer = answers[question.id]
      const correctAnswer = answerKey[question.id]

      let isCorrect = false
      if (question.type === 'multiple_choice') {
        isCorrect = userAnswer === correctAnswer
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer === correctAnswer
      } else {
        // For short_response and scenario, check if key points are present
        const userAnswerStr = String(userAnswer || '').toLowerCase()
        const correctAnswerStr = String(correctAnswer || '').toLowerCase()
        isCorrect = userAnswerStr.includes(correctAnswerStr) || 
                   correctAnswerStr.includes(userAnswerStr)
      }

      if (isCorrect) {
        correct += question.points
      }
    })

    const finalScore = Math.round((correct / total) * 100)
    setScore(finalScore)
    setSubmitted(true)
    
    if (onSubmit) {
      onSubmit(answers, finalScore)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestion = (question: QuizQuestion, index: number) => {
    // Normalize question type
    const questionType = question.type?.toLowerCase().replace('-', '_') || ''
    
    // Debug individual question
    if (!questionType) {
      console.warn('Question missing type:', question)
    }
    
    switch (questionType) {
      case 'multiple_choice':
        const options = Array.isArray(question.options) ? question.options : []
        if (options.length === 0) {
          return (
            <div>
              <p className="mb-4 font-medium">{question.question}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">
                Error: No options provided for this multiple choice question.
              </p>
            </div>
          )
        }
        return (
          <div>
            <p className="mb-4 font-medium">{question.question}</p>
            <div className="space-y-2">
              {options.map((option: string, optIndex: number) => (
                <label
                  key={optIndex}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optIndex}
                    checked={answers[question.id] === optIndex}
                    onChange={() => handleAnswerChange(question.id, optIndex)}
                    disabled={submitted}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="mt-4 p-4 rounded bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        )

      case 'true_false':
        return (
          <div>
            <p className="mb-4 font-medium">{question.question}</p>
            <div className="space-y-2">
              {['true', 'false'].map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    disabled={submitted}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="capitalize font-medium">{option}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="mt-4 p-4 rounded bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        )

      case 'short_response':
      case 'scenario':
        return (
          <div>
            <p className="mb-4 font-medium">{question.question}</p>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={submitted}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            />
            {submitted && (
              <div className="mt-4 p-4 rounded bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div>
            <p className="mb-4 font-medium">{question.question || 'Question text missing'}</p>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              Unknown question type: {question.type || 'undefined'}. Question data: {JSON.stringify(question, null, 2)}
            </p>
          </div>
        )
    }
  }

  const [regenerating, setRegenerating] = useState(false)

  const handleRegenerate = async () => {
    if (!confirm('Regenerate this quiz with new questions? This will replace all current questions.')) {
      return
    }

    setRegenerating(true)
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/regenerate`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        alert(`Quiz regenerated! ${data.message}`)
        window.location.reload()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {quiz.learning_path_id && (
        <div className="flex items-center">
          <Link
            href={`/dashboard/learn/${quiz.learning_path_id}`}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Learning Path</span>
          </Link>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {quiz.type === 'exam' ? 'Exam' : 'Quiz'} • Level: {quiz.level} • Passing Score: {quiz.passing_score}% • {questions.length} questions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {questions.length < 8 && !submitted && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : `Regenerate (Only ${questions.length} questions)`}
            </button>
          )}
          {timeRemaining !== null && (
            <div className="text-2xl font-bold">
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {questions.length === 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-200">
              No questions found in this quiz. Please check the quiz data.
            </p>
          </div>
        )}
        {questions.map((question: QuizQuestion, index: number) => (
          <div
            key={question.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Question {index + 1} of {questions.length} ({question.points || 10} points)
              </h3>
              <span className="text-xs text-gray-500 capitalize">
                {question.type?.replace('_', ' ') || 'unknown'}
              </span>
            </div>
            {renderQuestion(question, index)}
          </div>
        ))}
      </div>

      {submitted && score !== null && (
        <div className={`rounded-lg border p-6 ${
          score >= quiz.passing_score
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
        }`}>
          <h2 className="text-xl font-semibold mb-2">
            Your Score: {score}%
          </h2>
          <p>
            {score >= quiz.passing_score
              ? 'Congratulations! You passed!'
              : `You need ${quiz.passing_score}% to pass. Keep practicing!`}
          </p>
        </div>
      )}

      {!submitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit {quiz.type === 'exam' ? 'Exam' : 'Quiz'}
          </button>
        </div>
      )}

      {submitted && showNextModule && quiz.learning_path_id && (
        <NextModuleButtonFromContent
          pathId={quiz.learning_path_id}
          contentType="quiz"
          contentId={quiz.id}
          contentLevel={quiz.level}
        />
      )}
    </div>
  )
}






