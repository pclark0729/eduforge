import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

if (!stripe) {
  console.warn('Stripe is not configured - webhooks will not work')
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) {
          console.error('Missing userId or planId in session metadata')
          break
        }

        // Get subscription from Stripe
        const subscriptionId = session.subscription as string
        const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
        // Type assertion to ensure TypeScript recognizes this as Stripe.Subscription
        // Use 'any' intermediate to bypass type checking issues
        const subscription: Stripe.Subscription = subscriptionResponse as any

        // Extract properties with explicit type assertions
        const periodStart = (subscription as any).current_period_start as number
        const periodEnd = (subscription as any).current_period_end as number
        const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | null | undefined

        // Create or update user subscription
        await (supabase
          .from('user_subscriptions') as any)
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            cancel_at_period_end: cancelAtPeriodEnd || false,
          })

        console.log(`Subscription activated for user ${userId}, plan ${planId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: existingSub } = await (supabase
          .from('user_subscriptions') as any)
          .select('user_id, plan_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSub) {
          // Extract properties with explicit type assertions to bypass TypeScript issues
          const subscriptionAny = subscription as any
          const periodStart = subscriptionAny.current_period_start as number
          const periodEnd = subscriptionAny.current_period_end as number
          const cancelAtPeriodEnd = subscriptionAny.cancel_at_period_end as boolean | null | undefined
          const subscriptionStatus = subscription.status as string
          
          await (supabase
            .from('user_subscriptions') as any)
            .update({
              status: subscriptionStatus === 'active' ? 'active' : 'canceled',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              cancel_at_period_end: cancelAtPeriodEnd || false,
            })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await (supabase
          .from('user_subscriptions') as any)
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId)

        console.log(`Subscription canceled for customer ${customerId}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Update subscription period if payment succeeded
        // Access subscription property through 'any' to bypass TypeScript type checking
        const invoiceAny = invoice as any
        const subscriptionId = invoiceAny.subscription as string | null | undefined
        
        if (subscriptionId) {
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
          // Type assertion to ensure TypeScript recognizes this as Stripe.Subscription
          const subscription: Stripe.Subscription = subscriptionResponse as any
          
          // Extract properties with explicit type assertions
          const periodStart = (subscription as any).current_period_start as number
          const periodEnd = (subscription as any).current_period_end as number
          
          await (supabase
            .from('user_subscriptions') as any)
            .update({
              status: 'active',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
            })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Mark subscription as past_due
        await (supabase
          .from('user_subscriptions') as any)
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

