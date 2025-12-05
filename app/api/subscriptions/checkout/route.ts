import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { createServerComponentClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/plans'
import { stripe } from '@/lib/stripe/config'
import Stripe from 'stripe'

if (!stripe) {
  console.warn('Stripe is not configured - checkout will not work')
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerComponentClient()
    const body = await request.json()

    const { planId } = body

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId]

    // For free plan, just update subscription
    if (planId === 'free') {
      // Cancel any existing paid subscription
      await (supabase
        .from('user_subscriptions') as any)
        .update({ status: 'canceled' })
        .eq('user_id', user.id)
        .eq('status', 'active')

      return NextResponse.json({
        success: true,
        message: 'Switched to free plan',
        plan: planId,
      })
    }

    // For paid plans, create Stripe checkout session
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000')

    // Create or get Stripe customer
    const { data: subscription } = await (supabase
      .from('user_subscriptions') as any)
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // Create Stripe customer
      const customer: Stripe.Customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await (supabase
        .from('user_subscriptions') as any)
        .upsert({
          user_id: user.id,
          plan_id: planId,
          stripe_customer_id: customerId,
          status: 'active',
        })
    }

    // Create Stripe checkout session
    // Use pre-created Price ID if available, otherwise create dynamically
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = plan.stripePriceId
      ? [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ]
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} Plan`,
                description: `${plan.coursesPerPeriod === null ? 'Unlimited' : plan.coursesPerPeriod} courses per ${plan.periodType}`,
              },
              recurring: {
                interval: 'month' as Stripe.Price.Recurring.Interval,
              },
              unit_amount: Math.round(plan.priceMonthly * 100), // Convert to cents
            },
            quantity: 1,
          },
        ]

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      plan: planId,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

