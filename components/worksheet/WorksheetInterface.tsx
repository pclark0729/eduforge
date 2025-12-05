'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import type { WorksheetQuestion } from '@/types'

interface WorksheetInterfaceProps {
  worksheet: {
    id: string
    title: string
    level: string
    learning_path_id?: string
    questions: WorksheetQuestion[]
    answer_key: Record<string, any>
  }
  onSubmit?: (answers: Record<string, any>, score: number) => void
  showNextModule?: boolean
}

import NextModuleButtonFromContent from '@/components/learning/NextModuleButtonFromContent'

export default function WorksheetInterface({
  worksheet,
  onSubmit,
  showNextModule = true,
}: WorksheetInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  // Ensure questions is an array and parse if needed
  const questions = Array.isArray(worksheet.questions)
    ? worksheet.questions
    : typeof worksheet.questions === 'string'
      ? JSON.parse(worksheet.questions)
      : []

  // Debug logging
  React.useEffect(() => {
    console.log('Worksheet data:', {
      title: worksheet.title,
      questionsCount: questions.length,
      questions: questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question?.substring(0, 50),
      })),
      answerKeyKeys: Object.keys(worksheet.answer_key || {}),
    })
  }, [])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    let correct = 0
    let total = 0

    questions.forEach((question: WorksheetQuestion) => {
      total += question.points
      const userAnswer = answers[question.id]
      const correctAnswer = worksheet.answer_key[question.id]

      let isCorrect = false
      if (question.type === 'matching' && Array.isArray(userAnswer)) {
        isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())
      } else if (question.type === 'multiple_choice') {
        // For multiple choice, correct_answer is an index
        isCorrect = userAnswer === correctAnswer || 
                   (typeof userAnswer === 'number' && userAnswer === correctAnswer)
      } else if (question.type === 'true_false') {
        // For true/false, compare strings
        isCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase()
      } else {
        isCorrect = userAnswer === correctAnswer || 
                   (typeof userAnswer === 'string' && 
                    typeof correctAnswer === 'string' && 
                    userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim())
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

  const renderQuestion = (question: WorksheetQuestion) => {
    switch (question.type) {
      case 'fill_in_blank':
        return (
          <div>
            <p className="mb-2">{question.question}</p>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={submitted}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            />
            {submitted && showAnswers && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Correct answer: {worksheet.answer_key[question.id]}
              </p>
            )}
          </div>
        )

      case 'matching':
        const matchingOptions = Array.isArray(question.options) ? question.options : []
        if (matchingOptions.length === 0) {
          return (
            <div>
              <p className="mb-2">{question.question}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">
                Error: No options provided for this matching question.
              </p>
            </div>
          )
        }
        return (
          <div>
            <p className="mb-2">{question.question}</p>
            {matchingOptions.map((option: string, index: number) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  placeholder={`Match: ${option}`}
                  value={answers[question.id]?.[index] || ''}
                  onChange={(e) => {
                    const newAnswers = answers[question.id] || []
                    newAnswers[index] = e.target.value
                    handleAnswerChange(question.id, newAnswers)
                  }}
                  disabled={submitted}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            ))}
            {submitted && showAnswers && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Correct answers: {Array.isArray(worksheet.answer_key[question.id]) 
                  ? worksheet.answer_key[question.id].join(', ')
                  : worksheet.answer_key[question.id]}
              </p>
            )}
          </div>
        )

      case 'multiple_choice':
        const mcOptions = Array.isArray(question.options) ? question.options : []
        if (mcOptions.length === 0) {
          return (
            <div>
              <p className="mb-2">{question.question}</p>
              <p className="text-red-600 dark:text-red-400 text-sm">
                Error: No options provided for this multiple choice question.
              </p>
            </div>
          )
        }
        return (
          <div>
            <p className="mb-2">{question.question}</p>
            <div className="space-y-2">
              {mcOptions.map((option: string, optIndex: number) => (
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
            {submitted && showAnswers && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Correct answer: {mcOptions[worksheet.answer_key[question.id]] || worksheet.answer_key[question.id]}
              </p>
            )}
          </div>
        )

      case 'true_false':
        return (
          <div>
            <p className="mb-2">{question.question}</p>
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
            {submitted && showAnswers && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Correct answer: <span className="capitalize">{worksheet.answer_key[question.id]}</span>
              </p>
            )}
          </div>
        )

      case 'short_answer':
      case 'scenario':
      case 'applied_challenge':
        return (
          <div>
            <p className="mb-2">{question.question}</p>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={submitted}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            />
            {submitted && showAnswers && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Key points: {worksheet.answer_key[question.id]}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {worksheet.learning_path_id && (
        <div className="flex items-center">
          <Link
            href={`/dashboard/learn/${worksheet.learning_path_id}`}
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
          <h1 className="text-3xl font-bold">{worksheet.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Level: {worksheet.level} • {questions.length} questions
          </p>
        </div>
        {questions.length < 5 && (
          <button
            onClick={async () => {
              if (confirm('Regenerate this worksheet with more questions?')) {
                try {
                  const response = await fetch(`/api/worksheets/${worksheet.id}/regenerate`, {
                    method: 'POST',
                  })
                  const data = await response.json()
                  if (response.ok) {
                    alert(`Worksheet regenerated! ${data.message}`)
                    window.location.reload()
                  } else {
                    alert(`Error: ${data.error}`)
                  }
                } catch (error: any) {
                  alert(`Error: ${error.message}`)
                }
              }
            }}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            Regenerate (Only {questions.length} questions)
          </button>
        )}
      </div>

      <div className="space-y-8">
        {questions.length === 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-200">
              No questions found in this worksheet. Please regenerate the worksheet.
            </p>
          </div>
        )}
        {questions.map((question: WorksheetQuestion, index: number) => (
          <div
            key={question.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Question {index + 1} ({question.points} points)
              </h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {question.type.replace('_', ' ')}
              </span>
            </div>
            {renderQuestion(question)}
          </div>
        ))}
      </div>

      {submitted && score !== null && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Your Score: {score}%</h2>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {showAnswers ? 'Hide' : 'Show'} Answer Key
          </button>
        </div>
      )}

      {!submitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit Worksheet
          </button>
        </div>
      )}

      {submitted && showNextModule && worksheet.learning_path_id && (
        <NextModuleButtonFromContent
          pathId={worksheet.learning_path_id}
          contentType="worksheet"
          contentId={worksheet.id}
          contentLevel={worksheet.level}
        />
      )}
    </div>
  )
}






