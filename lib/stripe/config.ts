import Stripe from 'stripe'

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

// Initialize Stripe only if secret key is available
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null

if (!stripe && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is not set - payment features will not work')
}

