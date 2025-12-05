'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface GenerationProgress {
  status: 'generating' | 'completed' | 'error' | 'not_found'
  currentStep: string
  progress: {
    milestones: number
    totalMilestones: number
    lessons: number
    worksheets: number
    quizzes: number
    capstones: number
  }
  error?: string
}

export default function CreatePathPage() {
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('beginner')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null)
  const [pathId, setPathId] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Note: Progress polling removed - navigation happens immediately after path creation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGenerationProgress(null)
    setPathId(null)

    try {
      const response = await fetch('/api/learning-paths/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          level,
          priorKnowledge: priorKnowledge || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create learning path')
      }

      // Navigate immediately after learning path structure is created
      // Content will be generated in the background
      router.push(`/dashboard/learn/${data.learningPath.id}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Learning Path</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter a topic you want to learn, and we&apos;ll create a complete learning path with lessons, worksheets, and quizzes for all levels.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2">
            What do you want to learn?
          </label>
          <input
            id="topic"
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Machine Learning, Photosynthesis, JavaScript"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <p className="mt-1 text-sm text-gray-500">
            Be as specific or general as you like. We&apos;ll break it down for you.
          </p>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-2">
            Your current level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="beginner">Beginner - Just starting out</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Strong foundation</option>
            <option value="expert">Expert - Looking to master</option>
          </select>
        </div>

        <div>
          <label htmlFor="priorKnowledge" className="block text-sm font-medium mb-2">
            Prior knowledge (optional)
          </label>
          <textarea
            id="priorKnowledge"
            value={priorKnowledge}
            onChange={(e) => setPriorKnowledge(e.target.value)}
            placeholder="Tell us what you already know about this topic..."
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        {loading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Creating your learning path...
              </p>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading || !topic}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating learning path...' : 'Create Learning Path'}
          </button>
        </div>
      </form>
    </div>
  )
}




