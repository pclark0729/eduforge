'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase/client'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md terminal-card">
        <div className="mb-6">
          <div className="terminal-prompt mb-2">
            <span className="text-terminal-green">$</span> auth login
          </div>
          <p className="text-terminal-info text-sm ml-4">
            # Welcome back to EduForge
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSignIn}>
          {error && (
            <div className="terminal-card border-terminal-red border-2">
              <div className="text-terminal-error">
                <span className="text-terminal-red">✗ ERROR:</span> {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-terminal-text mb-2">
                <span className="text-terminal-green">→</span> Email address:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="terminal-input w-full"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-terminal-text mb-2">
                <span className="text-terminal-green">→</span> Password:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-input w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="terminal-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="text-terminal-yellow">⏳</span> Authenticating...
                </>
              ) : (
                <>
                  <span className="text-terminal-green">✓</span> Sign In
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/signup" className="terminal-link">
              <span className="text-terminal-info">[?]</span> Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-terminal-border">
          <p className="text-terminal-text text-xs opacity-70">
            <span className="text-terminal-green">eduforge@auth</span>
            <span className="text-terminal-yellow">:</span>
            <span className="text-terminal-blue">/login</span>
            <span className="text-terminal-green">$</span>
            {!loading && <TerminalCursor />}
          </p>
        </div>
      </div>
    </div>
  )
}

