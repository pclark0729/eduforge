'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/plans'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const planId = searchParams.get('plan')
  const [plan, setPlan] = useState(planId ? SUBSCRIPTION_PLANS[planId] : null)
  const [loading, setLoading] = useState(!!sessionId)

  useEffect(() => {
    // If we have a session_id, verify the subscription was created
    if (sessionId) {
      // The webhook should have already processed this, but we can verify
      setLoading(false)
    }
  }, [sessionId])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="terminal-card">
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> subscription activated
        </div>
        <div className="ml-4 space-y-4">
          <p className="text-terminal-success text-lg">
            ✓ Subscription activated successfully!
          </p>
          {plan && (
            <p className="text-terminal-text">
              Your plan has been upgraded to <span className="text-terminal-green">{plan.name}</span>. You can now create {plan.coursesPerPeriod === null ? 'unlimited' : plan.coursesPerPeriod} courses per {plan.periodType}.
            </p>
          )}
          {!plan && (
            <p className="text-terminal-text">
              Your plan has been upgraded. You can now create more courses.
            </p>
          )}
          <div className="mt-6 space-y-3">
            <Link
              href="/dashboard/create-path"
              className="terminal-button block text-center"
            >
              Create Your First Course
            </Link>
            <Link
              href="/dashboard"
              className="terminal-link block text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="terminal-card">
        <p className="text-terminal-text text-xs">
          <span className="text-terminal-green">eduforge@checkout</span>
          <span className="text-terminal-yellow">:</span>
          <span className="text-terminal-blue">/success</span>
          <span className="text-terminal-green">$</span>
          <TerminalCursor />
        </p>
      </div>
    </div>
  )
}

