'use client'

import ReactMarkdown from 'react-markdown'
import type { Lesson } from '@/types'

interface LessonViewerProps {
  lesson: Lesson
}

export default function LessonViewer({ lesson }: LessonViewerProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Concept: {lesson.concept} • Level: {lesson.level} • ~{lesson.estimated_minutes} minutes
        </p>
      </div>

      {lesson.simple_explanation && (
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-6 dark:border-gray-700 dark:bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-3">Simple Explanation</h2>
          <p className="text-gray-700 dark:text-gray-300">{lesson.simple_explanation}</p>
        </div>
      )}

      {lesson.deep_explanation && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Deep Dive</h2>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{lesson.deep_explanation}</ReactMarkdown>
          </div>
        </div>
      )}

      {lesson.step_by_step_examples && lesson.step_by_step_examples.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Step-by-Step Examples</h2>
          <div className="space-y-6">
            {lesson.step_by_step_examples.map((example, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {example.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{example.description}</h3>
                    <div className="mt-2 p-4 bg-gray-50 rounded dark:bg-gray-900">
                      <pre className="whitespace-pre-wrap text-sm">{example.example}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.real_world_use_cases && lesson.real_world_use_cases.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Real-World Use Cases</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {lesson.real_world_use_cases.map((useCase, index) => (
              <li key={index}>{useCase}</li>
            ))}
          </ul>
        </div>
      )}

      {lesson.analogies && lesson.analogies.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Analogies</h2>
          <div className="space-y-3">
            {lesson.analogies.map((analogy, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-yellow-50 p-4 dark:border-gray-700 dark:bg-yellow-900/20"
              >
                <p className="text-gray-700 dark:text-gray-300">{analogy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.visual_models && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Visual Models</h2>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{lesson.visual_models}</ReactMarkdown>
          </div>
        </div>
      )}

      {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
            Common Mistakes to Avoid
          </h2>
          <ul className="list-disc list-inside space-y-2 text-red-700 dark:text-red-300">
            {lesson.common_mistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}















