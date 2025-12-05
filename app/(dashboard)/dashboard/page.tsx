import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  const { data: learningPaths } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentProgress } = await supabase
    .from('user_progress')
    .select('*, learning_paths(title)')
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Terminal Header */}
      <div className="terminal-card">
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> dashboard status
        </div>
        <div className="ml-4 space-y-2">
          <p className="text-terminal-success">
            ✓ Welcome back! Continue your learning journey.
          </p>
          <p className="text-terminal-info text-sm">
            # Type 'help' for available commands
          </p>
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div>
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> ls learning_paths/
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Link
            href="/dashboard/create-path"
            className="terminal-card border-dashed border-2 flex flex-col items-center justify-center p-8 text-center hover:border-terminal-green transition-colors"
          >
            <div className="text-terminal-green text-4xl mb-4">+</div>
            <h3 className="text-lg font-semibold text-terminal-text mb-2">
              Create New Learning Path
            </h3>
            <p className="text-sm text-terminal-text opacity-70">
              Start learning a new topic
            </p>
          </Link>

          {(learningPaths as any[])?.map((path: any) => (
            <Link
              key={path.id}
              href={`/dashboard/learn/${path.id}`}
              className="terminal-card hover:border-terminal-green transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-terminal-text flex-1">
                  {path.title}
                </h3>
                <span className="text-terminal-green text-xs">→</span>
              </div>
              <p className="text-sm text-terminal-text opacity-70 mb-4">
                {path.description || path.topic}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-terminal-blue border border-terminal-border px-2 py-1">
                  {path.level}
                </span>
                {path.estimated_hours && (
                  <span className="text-terminal-yellow">
                    ~{path.estimated_hours}h
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentProgress && recentProgress.length > 0 && (
        <div>
          <div className="terminal-prompt mb-4">
            <span className="text-terminal-green">$</span> tail -n 5 activity.log
          </div>
          <div className="mt-4 space-y-3">
            {recentProgress.map((progress: any) => (
              <div
                key={progress.id}
                className="terminal-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-terminal-text">
                      <span className="text-terminal-green">→</span>{' '}
                      {progress.learning_paths?.title || 'Learning Path'}
                    </h4>
                    <p className="text-sm text-terminal-text opacity-70 mt-1">
                      {progress.content_type} -{' '}
                      <span className="text-terminal-blue">{progress.status}</span>
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-terminal-success">
                      {progress.completion_percentage}%
                    </div>
                    {progress.score !== null && (
                      <div className="text-xs text-terminal-yellow mt-1">
                        Score: {progress.score}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Prompt Footer */}
      <div className="terminal-card">
        <p className="text-terminal-text text-xs">
          <span className="text-terminal-green">eduforge@dashboard</span>
          <span className="text-terminal-yellow">:</span>
          <span className="text-terminal-blue">~</span>
          <span className="text-terminal-green">$</span>
          <TerminalCursor />
        </p>
      </div>
    </div>
  )
}

