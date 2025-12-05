# Pricing Structure Setup

## Overview

EduForge now includes a pricing structure with three tiers:

1. **Free**: 1 course per week
2. **Basic**: $20/month - 20 courses per month
3. **Unlimited**: $30/month - Unlimited courses

## Database Migration

Run the subscription migration in your Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `supabase/migrations/006_subscriptions_and_usage.sql`
3. Execute the migration

This will create:
- `subscription_plans` table with the three plans
- `user_subscriptions` table for tracking user subscriptions
- `usage_tracking` table for tracking course creation usage
- Database functions for checking and incrementing usage
- RLS policies for security

## Features Implemented

### Usage Tracking
- Automatic usage tracking when courses are created
- Weekly limits for free plan
- Monthly limits for paid plans
- Unlimited access for premium plan

### API Endpoints
- `POST /api/subscriptions/checkout` - Create checkout session
- `GET /api/subscriptions/usage` - Get current usage info

### Pages
- `/dashboard/pricing` - Pricing page with plan comparison
- `/dashboard/pricing/checkout` - Checkout flow (Stripe integration pending)
- `/dashboard/pricing/success` - Success page after subscription

### Usage Limits Enforcement
- Learning path creation checks usage limits before allowing creation
- Clear error messages when limits are reached
- Upgrade prompts with links to pricing page

## Stripe Integration (TODO)

The checkout flow is currently a placeholder. To complete payment processing:

1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Add Stripe keys to environment variables:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Update `/api/subscriptions/checkout/route.ts` to create Stripe checkout sessions
4. Create webhook handler at `/api/subscriptions/webhook/route.ts` to handle subscription events
5. Update subscription status based on webhook events

## Testing

After running the migration:
1. All users start on the free plan automatically
2. Free users can create 1 course per week
3. Usage resets weekly for free plan, monthly for paid plans
4. Check usage at `/dashboard/pricing`

## Notes

- Users without an active subscription default to the free plan
- Usage tracking is automatic and handled by database functions
- The system prevents course creation when limits are reached
- Upgrade prompts are shown when limits are hit

