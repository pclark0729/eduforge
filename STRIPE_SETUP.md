# Stripe Payment Integration Setup

## Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe Webhook Secret (get after creating webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL for redirects
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Stripe Dashboard Setup

### 1. Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** → `STRIPE_SECRET_KEY`
3. Copy your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 2. Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://forge.peyton-clark.com/api/subscriptions/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode vs Live Mode

- **Test mode**: Use test keys (start with `sk_test_` and `pk_test_`)
- **Live mode**: Use live keys (start with `sk_live_` and `pk_live_`)

For development, use test mode. For production, use live mode.

## How It Works

1. **User clicks "Upgrade"** → Creates Stripe checkout session
2. **User completes payment** → Stripe redirects to success page
3. **Webhook receives event** → Updates subscription in database
4. **User can create courses** → Usage limits updated based on plan

## Testing

### Test Cards (Test Mode Only)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any ZIP code.

## Troubleshooting

### "Stripe is not configured"
- Make sure `STRIPE_SECRET_KEY` is set in environment variables
- Restart your dev server after adding the key

### Webhook not receiving events
- Verify webhook URL is correct in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` matches the signing secret
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/subscriptions/webhook`

### Subscription not activating
- Check webhook logs in Stripe dashboard
- Verify database migration `006_subscriptions_and_usage.sql` has been run
- Check server logs for webhook processing errors

