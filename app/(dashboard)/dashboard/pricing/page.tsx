import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/subscriptions/plans'
import { checkUsage } from '@/lib/subscriptions/usage'
import Link from 'next/link'
import { TerminalCursor } from '@/components/ui/TerminalCursor'

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }> | { canceled?: string }
}) {
  const user = await requireAuth()
  const supabase = await createServerComponentClient()

  // Get user's current subscription
  const { data: subscription } = await (supabase
    .from('user_subscriptions') as any)
    .select('*, subscription_plans(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const currentPlanId = subscription?.subscription_plans?.id || 'free'
  
  // Handle searchParams as either Promise or object (Next.js 14 compatibility)
  const resolvedSearchParams = searchParams && 'then' in searchParams 
    ? await searchParams 
    : searchParams
  const canceled = resolvedSearchParams?.canceled === 'true'
  
  // Get usage info with error handling
  let usage
  try {
    usage = await checkUsage(user.id)
  } catch (error) {
    console.error('Error checking usage:', error)
    // Fallback to default usage if check fails
    usage = {
      canCreate: true,
      coursesCreated: 0,
      coursesAllowed: 1,
      periodStart: new Date(),
      periodEnd: new Date(),
      planId: 'free',
      planName: 'Free',
    }
  }

  return (
    <div className="space-y-8">
      {/* Canceled Message */}
      {canceled && (
        <div className="terminal-card border-terminal-yellow border-2">
          <div className="terminal-prompt mb-4">
            <span className="text-terminal-yellow">⚠</span> Checkout Canceled
          </div>
          <div className="ml-4">
            <p className="text-terminal-text">
              Your checkout was canceled. You can try again anytime.
            </p>
          </div>
        </div>
      )}

      {/* Terminal Header */}
      <div className="terminal-card">
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> cat pricing.txt
        </div>
        <div className="ml-4 space-y-2">
          <p className="text-terminal-info">
            # Choose Your Plan
          </p>
          <p className="text-terminal-text">
            Current plan: <span className="text-terminal-green">{usage.planName}</span>
          </p>
          <p className="text-terminal-text">
            Usage: <span className="text-terminal-yellow">
              {usage.coursesCreated}
              {usage.coursesAllowed !== null ? `/${usage.coursesAllowed}` : ''}
            </span>{' '}
            courses this {usage.planName === 'Free' ? 'week' : 'month'}
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId
          const isPopular = plan.id === 'basic'

          return (
            <div
              key={plan.id}
              className={`terminal-card ${isCurrentPlan ? 'border-terminal-green border-2' : ''} ${isPopular ? 'ring-2 ring-terminal-blue' : ''}`}
            >
              {isPopular && (
                <div className="text-center mb-4">
                  <span className="text-terminal-blue text-xs border border-terminal-blue px-2 py-1">
                    MOST POPULAR
                  </span>
                </div>)}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-terminal-text mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-terminal-green mb-2">
                  {formatPrice(plan.priceMonthly)}
                  <span className="text-lg text-terminal-text">/month</span>
                </div>
                {plan.coursesPerPeriod === null ? (
                  <p className="text-terminal-success text-sm">Unlimited courses</p>
                ) : (
                  <p className="text-terminal-text text-sm">
                    {plan.coursesPerPeriod} courses per {plan.periodType}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.courses_per_week && (
                  <li className="text-terminal-success text-sm">
                    ✓ {plan.features.courses_per_week} course{plan.features.courses_per_week !== 1 ? 's' : ''} per week
                  </li>
                )}
                {plan.features.courses_per_month && (
                  <li className="text-terminal-success text-sm">
                    ✓ {plan.features.courses_per_month === 'unlimited' ? 'Unlimited' : plan.features.courses_per_month} course{plan.features.courses_per_month === 'unlimited' || (typeof plan.features.courses_per_month === 'number' && plan.features.courses_per_month !== 1) ? 's' : ''} per month
                  </li>
                )}
                {plan.features.support && (
                  <li className="text-terminal-success text-sm">
                    ✓ {plan.features.support} support
                  </li>
                )}
                {plan.features.priority_generation && (
                  <li className="text-terminal-success text-sm">
                    ✓ Priority content generation
                  </li>
                )}
              </ul>

              {isCurrentPlan ? (
                <div className="terminal-button w-full text-center opacity-50 cursor-not-allowed">
                  Current Plan
                </div>
              ) : plan.id === 'free' ? (
                <Link
                  href="/dashboard"
                  className="terminal-button block text-center"
                >
                  Current Plan
                </Link>
              ) : (
                <Link
                  href={`/dashboard/pricing/checkout?plan=${plan.id}`}
                  className="terminal-button block text-center"
                >
                  Upgrade to {plan.name}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Usage Info */}
      <div className="terminal-card">
        <div className="terminal-prompt mb-4">
          <span className="text-terminal-green">$</span> usage status
        </div>
        <div className="ml-4 space-y-2">
          <p className="text-terminal-text">
            <span className="text-terminal-green">→</span> Plan: <span className="text-terminal-blue">{usage.planName}</span>
          </p>
          <p className="text-terminal-text">
            <span className="text-terminal-green">→</span> Courses created: <span className="text-terminal-yellow">
              {usage.coursesCreated}
              {usage.coursesAllowed !== null ? `/${usage.coursesAllowed}` : ''}
            </span>
          </p>
          <p className="text-terminal-text">
            <span className="text-terminal-green">→</span> Period: {usage.periodStart.toLocaleDateString()} - {usage.periodEnd.toLocaleDateString()}
          </p>
          {!usage.canCreate && (
            <p className="text-terminal-error mt-4">
              ⚠ Usage limit reached. Upgrade to create more courses.
            </p>
          )}
        </div>
      </div>

      {/* Terminal Prompt Footer */}
      <div className="terminal-card">
        <p className="text-terminal-text text-xs">
          <span className="text-terminal-green">eduforge@pricing</span>
          <span className="text-terminal-yellow">:</span>
          <span className="text-terminal-blue">/pricing</span>
          <span className="text-terminal-green">$</span>
          <TerminalCursor />
        </p>
      </div>
    </div>
  )
}

