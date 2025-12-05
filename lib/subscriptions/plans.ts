export interface SubscriptionPlan {
  id: string
  name: string
  priceMonthly: number
  coursesPerPeriod: number | null // null = unlimited
  periodType: 'week' | 'month'
  stripePriceId?: string // Stripe Price ID for pre-created products
  features: {
    courses_per_week?: number
    courses_per_month?: number | string
    support?: string
    priority_generation?: boolean
  }
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    coursesPerPeriod: 1,
    periodType: 'week',
    features: {
      courses_per_week: 1,
      support: 'community',
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 20,
    coursesPerPeriod: 20,
    periodType: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PLAN_PRICE_ID,
    features: {
      courses_per_month: 20,
      support: 'email',
    },
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    priceMonthly: 30,
    coursesPerPeriod: null, // unlimited
    periodType: 'month',
    stripePriceId: process.env.STRIPE_UNLIMITED_PLAN_PRICE_ID,
    features: {
      courses_per_month: 'unlimited',
      support: 'priority',
      priority_generation: true,
    },
  },
}

export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

