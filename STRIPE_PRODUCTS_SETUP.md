# Setting Up Stripe Products and Prices

## Overview

You have two options for setting up subscription products in Stripe:
1. **Create in Dashboard** (Recommended) - More control, easier to manage
2. **Create dynamically in code** (Current implementation) - Automatic, less manual setup

## Option 1: Create Products in Stripe Dashboard (Recommended)

### Step-by-Step Instructions

#### 1. Create Products

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**

**For Basic Plan ($20/month):**
- **Name:** `EduForge Basic Plan`
- **Description:** `20 courses per month`
- **Pricing model:** Recurring
- **Price:** `$20.00`
- **Billing period:** Monthly
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`) - you'll need this!

**For Unlimited Plan ($30/month):**
- **Name:** `EduForge Unlimited Plan`
- **Description:** `Unlimited courses per month`
- **Pricing model:** Recurring
- **Price:** `$30.00`
- **Billing period:** Monthly
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`) - you'll need this!

#### 2. Update Your Code to Use Price IDs

After creating products, update your checkout route to use the Price IDs instead of creating prices dynamically.

#### 3. Add Price IDs to Environment Variables

```env
STRIPE_BASIC_PLAN_PRICE_ID=price_...
STRIPE_UNLIMITED_PLAN_PRICE_ID=price_...
```

## Option 2: Keep Dynamic Price Creation (Current)

Your current implementation creates prices on-the-fly. This works but has some limitations:
- Prices aren't visible in Stripe Dashboard until first purchase
- Harder to track and manage
- Can't easily change prices without code changes

## Recommended: Hybrid Approach

Create products in Dashboard, but keep the code flexible:

1. **Create products in Stripe Dashboard** (as described above)
2. **Store Price IDs in your subscription plans config**
3. **Update checkout to use Price IDs**

This gives you:
- Better visibility in Stripe Dashboard
- Easier price management
- Ability to change prices without code changes
- Better reporting and analytics

## Current Implementation

Your code currently creates prices dynamically using `price_data`. This works, but here's how to improve it:

### Update Subscription Plans Config

Add Stripe Price IDs to your plans:

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 20,
    coursesPerPeriod: 20,
    periodType: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PLAN_PRICE_ID || '', // Add this
    features: { ... }
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    priceMonthly: 30,
    coursesPerPeriod: null,
    periodType: 'month',
    stripePriceId: process.env.STRIPE_UNLIMITED_PLAN_PRICE_ID || '', // Add this
    features: { ... }
  }
}
```

### Update Checkout Route

Use Price ID if available, otherwise create dynamically:

```typescript
const lineItems = plan.stripePriceId
  ? [{ price: plan.stripePriceId, quantity: 1 }] // Use existing price
  : [{ price_data: { ... }, quantity: 1 }] // Create dynamically
```

## Quick Setup Checklist

- [ ] Create "EduForge Basic Plan" product in Stripe Dashboard
- [ ] Create "EduForge Unlimited Plan" product in Stripe Dashboard
- [ ] Copy Price IDs from both products
- [ ] Add Price IDs to environment variables
- [ ] (Optional) Update code to use Price IDs

## Benefits of Dashboard Setup

1. **Better Analytics** - See all subscriptions in one place
2. **Price Management** - Change prices without code deployment
3. **Testing** - Easier to test with consistent Price IDs
4. **Reporting** - Better financial reporting in Stripe
5. **Customer Portal** - Stripe's customer portal can show these products

## Next Steps

1. Create the two products in Stripe Dashboard
2. Copy the Price IDs
3. Let me know if you want me to update the code to use Price IDs instead of dynamic creation

