'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { requireAuth } from '@/lib/auth/require-auth'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!planId) {
      setError('No plan selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // For now, redirect to success page
      // TODO: Replace with actual Stripe checkout URL when integrated
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      } else {
        router.push(`/dashboard/pricing/success?plan=${planId}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (planId) {
      handleCheckout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="terminal-card">
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> checkout --plan={planId || 'unknown'}
        </div>
        <div className="ml-4 space-y-4">
          {loading && (
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-terminal-green border-t-transparent" />
              <p className="text-terminal-text">
                Processing checkout...
              </p>
            </div>
          )}
          {error && (
            <div className="text-terminal-error">
              <span className="text-terminal-red">✗ ERROR:</span> {error}
            </div>
          )}
          {!loading && !error && (
            <div className="text-terminal-info">
              <p>Redirecting to Stripe checkout...</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link href="/dashboard/pricing" className="terminal-link">
          ← Back to Pricing
        </Link>
      </div>
    </div>
  )
}

