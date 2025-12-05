# How to Create a Stripe Webhook

## Step-by-Step Instructions

### 1. Log into Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Log in with your Stripe account

### 2. Navigate to Webhooks

1. In the left sidebar, click on **"Developers"**
2. Click on **"Webhooks"**
3. You'll see a list of existing webhooks (if any)

### 3. Create New Webhook Endpoint

1. Click the **"+ Add endpoint"** button (top right)
2. You'll see a form to configure the webhook

### 4. Configure Webhook Settings

**Endpoint URL:**
```
https://forge.peyton-clark.com/api/subscriptions/webhook
```

**Description (optional):**
```
EduForge Subscription Webhook
```

**Events to send:**
Select these specific events:
- ✅ `checkout.session.completed` - When a customer completes checkout
- ✅ `customer.subscription.updated` - When subscription is updated
- ✅ `customer.subscription.deleted` - When subscription is canceled
- ✅ `invoice.payment_succeeded` - When monthly payment succeeds
- ✅ `invoice.payment_failed` - When payment fails

**Note:** You can either:
- Select "Select events" and manually check the boxes above
- Or use "Receive all events" (not recommended for production)

### 5. Save the Webhook

1. Click **"Add endpoint"** button
2. Stripe will create the webhook and show you the details

### 6. Get the Webhook Signing Secret

1. After creating the webhook, click on it to view details
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)
4. This is your `STRIPE_WEBHOOK_SECRET`

### 7. Add to Environment Variables

Add the webhook secret to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

And add it to Vercel:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `STRIPE_WEBHOOK_SECRET` with the value you copied

### 8. Test the Webhook

1. In Stripe Dashboard, go to your webhook
2. Click **"Send test webhook"**
3. Select an event type (e.g., `checkout.session.completed`)
4. Click **"Send test webhook"**
5. Check the webhook logs to see if it was received successfully

## Webhook Endpoint Details

**URL:** `https://forge.peyton-clark.com/api/subscriptions/webhook`

**Method:** POST

**Authentication:** Uses Stripe signature verification

**What it does:**
- Activates subscriptions when checkout completes
- Updates subscription status when changed
- Handles payment success/failure
- Cancels subscriptions when deleted

## Troubleshooting

### Webhook not receiving events
- Verify the URL is correct and accessible
- Check that your app is deployed and running
- Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret
- Check webhook logs in Stripe dashboard for error messages

### 401/403 Errors
- Verify the webhook secret is correct
- Check that the endpoint is publicly accessible (not behind auth)

### Events not processing
- Check server logs for webhook processing errors
- Verify database migration `006_subscriptions_and_usage.sql` has been run
- Ensure Supabase service role key is set correctly

## Local Development

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/subscriptions/webhook

# This will give you a webhook signing secret for local testing
# Use this in your .env.local instead of the production secret
```

## Production Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] All required events selected
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] Test webhook sent and verified
- [ ] Webhook logs checked for successful processing


