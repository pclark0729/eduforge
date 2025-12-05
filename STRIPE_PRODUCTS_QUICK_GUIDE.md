# Quick Guide: Setting Up Stripe Products

## Step-by-Step: Create Products in Stripe Dashboard

### 1. Go to Products Page
- Visit https://dashboard.stripe.com/products
- Click **"+ Add product"** button

### 2. Create Basic Plan Product

**Product Details:**
- **Name:** `EduForge Basic Plan`
- **Description:** `20 courses per month - Perfect for regular learners`

**Pricing:**
- **Pricing model:** Select **"Recurring"**
- **Price:** `$20.00`
- **Billing period:** `Monthly`
- **Currency:** `USD`

Click **"Save product"**

**Important:** After saving, copy the **Price ID** (starts with `price_...`) - you'll see it in the product details.

### 3. Create Unlimited Plan Product

**Product Details:**
- **Name:** `EduForge Unlimited Plan`
- **Description:** `Unlimited courses per month - For power users`

**Pricing:**
- **Pricing model:** Select **"Recurring"**
- **Price:** `$30.00`
- **Billing period:** `Monthly`
- **Currency:** `USD`

Click **"Save product"**

**Important:** Copy the **Price ID** (starts with `price_...`)

### 4. Add Price IDs to Environment Variables

Add to your `.env` file:
```env
STRIPE_BASIC_PLAN_PRICE_ID=price_...
STRIPE_UNLIMITED_PLAN_PRICE_ID=price_...
```

### 5. Update Code (Optional but Recommended)

I can update your code to use these Price IDs instead of creating prices dynamically. This gives you:
- Better visibility in Stripe Dashboard
- Easier price management
- Better analytics and reporting

## Current vs Recommended Approach

**Current:** Creates prices on-the-fly (works, but less visible in Dashboard)
**Recommended:** Use pre-created Price IDs (better management)

Would you like me to update the code to use Price IDs?


