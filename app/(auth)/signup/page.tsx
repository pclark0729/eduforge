'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase/client'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Use server-side signup API that creates profile first, then sends email
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Show success message and redirect to signin
      // User needs to confirm email before they can sign in
      setError(null)
      alert('Account created successfully! Please check your email to confirm your account before signing in.')
      router.push('/signin')
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
            <span className="text-terminal-green">$</span> auth register
          </div>
          <p className="text-terminal-info text-sm ml-4">
            # Create your EduForge account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="terminal-card border-terminal-red border-2">
              <div className="text-terminal-error">
                <span className="text-terminal-red">✗ ERROR:</span> {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-terminal-text mb-2">
                <span className="text-terminal-green">→</span> Full Name:
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="terminal-input w-full"
                placeholder="John Doe"
              />
            </div>
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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-input w-full"
                placeholder="••••••••"
              />
              <p className="text-terminal-text text-xs mt-1 opacity-70">
                Minimum 6 characters
              </p>
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
                  <span className="text-terminal-yellow">⏳</span> Creating account...
                </>
              ) : (
                <>
                  <span className="text-terminal-green">✓</span> Sign Up
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/signin" className="terminal-link">
              <span className="text-terminal-info">[?]</span> Already have an account? Sign in
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-terminal-border">
          <p className="text-terminal-text text-xs opacity-70">
            <span className="text-terminal-green">eduforge@auth</span>
            <span className="text-terminal-yellow">:</span>
            <span className="text-terminal-blue">/register</span>
            <span className="text-terminal-green">$</span>
            {!loading && <TerminalCursor />}
          </p>
        </div>
      </div>
    </div>
  )
}

