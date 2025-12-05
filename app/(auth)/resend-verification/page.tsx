'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email')
      }

      setSuccess('Verification email sent! Please check your inbox (and spam folder) for the confirmation link.')
      setEmail('') // Clear email after success
    } catch (error: any) {
      setError(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md terminal-card">
        <div className="mb-6">
          <div className="terminal-prompt mb-2">
            <span className="text-terminal-green">$</span> auth resend-verification
          </div>
          <p className="text-terminal-info text-sm ml-4">
            # Resend email verification
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleResendVerification}>
          {error && (
            <div className="terminal-card border-terminal-red border-2">
              <div className="text-terminal-error">
                <span className="text-terminal-red">✗ ERROR:</span> {error}
              </div>
            </div>
          )}

          {success && (
            <div className="terminal-card border-terminal-green border-2">
              <div className="text-terminal-success">
                <span className="text-terminal-green">✓ SUCCESS:</span> {success}
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
              <p className="text-terminal-info text-xs mt-2 ml-4">
                # Enter the email address you used to sign up
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="terminal-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="text-terminal-yellow">⏳</span> Sending...
                </>
              ) : (
                <>
                  <span className="text-terminal-green">✓</span> Resend Verification Email
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm space-y-2">
            <div>
              <Link href="/signin" className="terminal-link">
                <span className="text-terminal-info">[←]</span> Back to Sign In
              </Link>
            </div>
            <div>
              <Link href="/signup" className="terminal-link">
                <span className="text-terminal-info">[?]</span> Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-terminal-border">
          <p className="text-terminal-text text-xs opacity-70">
            <span className="text-terminal-green">eduforge@auth</span>
            <span className="text-terminal-yellow">:</span>
            <span className="text-terminal-blue">/resend-verification</span>
            <span className="text-terminal-green">$</span>
            {!loading && <TerminalCursor />}
          </p>
        </div>
      </div>
    </div>
  )
}

