'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface UsageInfo {
  canCreate: boolean
  coursesCreated: number
  coursesAllowed: number | null
  periodStart: string
  periodEnd: string
  planId: string
  planName: string
}

export default function CreatePathPage() {
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('beginner')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null)
  const [pathId, setPathId] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscriptions/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (err) {
      console.error('Error fetching usage:', err)
    }
  }

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
        if (data.upgradeRequired) {
          setUpgradeRequired(true)
          setUsage(data.usage)
        }
        throw new Error(data.error || 'Failed to create learning path')
      }

      // Refresh usage after successful creation
      await fetchUsage()

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
        <h1 className="text-3xl font-bold text-terminal-text">Create Learning Path</h1>
        <p className="mt-2 text-terminal-text opacity-70">
          Enter a topic you want to learn, and we&apos;ll create a complete learning path with lessons, worksheets, and quizzes for all levels.
        </p>
      </div>

      {/* Usage Info */}
      {usage && (
        <div className="terminal-card">
          <div className="terminal-prompt mb-4">
            <span className="text-terminal-green">$</span> usage status
          </div>
          <div className="ml-4 space-y-2">
            <p className="text-terminal-text">
              <span className="text-terminal-green">→</span> Plan: <span className="text-terminal-blue">{usage.planName}</span>
            </p>
            <p className="text-terminal-text">
              <span className="text-terminal-green">→</span> Usage: <span className="text-terminal-yellow">
                {usage.coursesCreated}
                {usage.coursesAllowed !== null ? `/${usage.coursesAllowed}` : ''}
              </span>{' '}
              courses this {usage.planName === 'Free' ? 'week' : 'month'}
            </p>
            {!usage.canCreate && (
              <p className="text-terminal-error mt-2">
                ⚠ Limit reached. <Link href="/dashboard/pricing" className="terminal-link">Upgrade</Link> to create more courses.
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className={`terminal-card ${upgradeRequired ? 'border-terminal-red border-2' : ''}`}>
            <div className={`text-sm ${upgradeRequired ? 'text-terminal-error' : 'text-terminal-text'}`}>
              {upgradeRequired ? (
                <div className="space-y-3">
                  <p className="font-semibold">⚠ {error}</p>
                  <Link href="/dashboard/pricing" className="terminal-button inline-block">
                    View Plans & Upgrade
                  </Link>
                </div>
              ) : (
                <>
                  <span className="text-terminal-red">✗ ERROR:</span> {error}
                </>
              )}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2 text-terminal-text">
            <span className="text-terminal-green">→</span> What do you want to learn?
          </label>
          <input
            id="topic"
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Machine Learning, Photosynthesis, JavaScript"
            className="terminal-input w-full"
            disabled={usage && !usage.canCreate}
          />
          <p className="mt-1 text-sm text-terminal-text opacity-70">
            Be as specific or general as you like. We&apos;ll break it down for you.
          </p>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-2 text-terminal-text">
            <span className="text-terminal-green">→</span> Your current level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="terminal-input w-full"
            disabled={usage && !usage.canCreate}
          >
            <option value="beginner">Beginner - Just starting out</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Strong foundation</option>
            <option value="expert">Expert - Looking to master</option>
          </select>
        </div>

        <div>
          <label htmlFor="priorKnowledge" className="block text-sm font-medium mb-2 text-terminal-text">
            <span className="text-terminal-green">→</span> Prior knowledge (optional)
          </label>
          <textarea
            id="priorKnowledge"
            value={priorKnowledge}
            onChange={(e) => setPriorKnowledge(e.target.value)}
            placeholder="Tell us what you already know about this topic..."
            rows={4}
            className="terminal-input w-full"
            disabled={usage && !usage.canCreate}
          />
        </div>

        {loading && (
          <div className="terminal-card">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-terminal-green border-t-transparent" />
              <p className="text-sm font-medium text-terminal-text">
                Creating your learning path...
              </p>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading || !topic || (usage && !usage.canCreate)}
            className="terminal-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="text-terminal-yellow">⏳</span> Creating learning path...
              </>
            ) : usage && !usage.canCreate ? (
              'Usage Limit Reached - Upgrade Required'
            ) : (
              <>
                <span className="text-terminal-green">✓</span> Create Learning Path
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}




