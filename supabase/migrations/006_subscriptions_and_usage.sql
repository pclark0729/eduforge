-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY, -- 'free', 'basic', 'unlimited'
  name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  courses_per_period INTEGER, -- NULL means unlimited
  period_type TEXT NOT NULL, -- 'week', 'month'
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired', 'past_due'
  stripe_subscription_id TEXT, -- Stripe subscription ID
  stripe_customer_id TEXT, -- Stripe customer ID
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  courses_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, price_monthly, courses_per_period, period_type, features) VALUES
  ('free', 'Free', 0.00, 1, 'week', '{"courses_per_week": 1, "support": "community"}'::jsonb),
  ('basic', 'Basic', 20.00, 20, 'month', '{"courses_per_month": 20, "support": "email"}'::jsonb),
  ('unlimited', 'Unlimited', 30.00, NULL, 'month', '{"courses_per_month": "unlimited", "support": "priority", "priority_generation": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Function to get or create current usage period
CREATE OR REPLACE FUNCTION get_or_create_usage_period(
  p_user_id UUID,
  p_period_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_id TEXT;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_usage_id UUID;
BEGIN
  -- Get user's active subscription
  SELECT id, plan_id INTO v_subscription_id, v_plan_id
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- If no subscription, use free plan
  IF v_subscription_id IS NULL THEN
    v_plan_id := 'free';
  END IF;

  -- Calculate period based on type
  IF p_period_type = 'week' THEN
    v_period_start := DATE_TRUNC('week', NOW());
    v_period_end := v_period_start + INTERVAL '1 week';
  ELSE -- month
    v_period_start := DATE_TRUNC('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month';
  END IF;

  -- Get or create usage record
  INSERT INTO public.usage_tracking (user_id, subscription_id, period_start, period_end)
  VALUES (p_user_id, v_subscription_id, v_period_start, v_period_end)
  ON CONFLICT (user_id, period_start) DO UPDATE SET
    updated_at = NOW()
  RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create course
CREATE OR REPLACE FUNCTION can_create_course(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_id TEXT;
  v_courses_allowed INTEGER;
  v_period_type TEXT;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_courses_created INTEGER;
BEGIN
  -- Get user's active subscription
  SELECT us.id, sp.id, sp.courses_per_period, sp.period_type
  INTO v_subscription_id, v_plan_id, v_courses_allowed, v_period_type
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  LIMIT 1;

  -- If no subscription, use free plan
  IF v_subscription_id IS NULL THEN
    SELECT id, courses_per_period, period_type
    INTO v_plan_id, v_courses_allowed, v_period_type
    FROM public.subscription_plans
    WHERE id = 'free';
  END IF;

  -- Unlimited plan
  IF v_courses_allowed IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Calculate period
  IF v_period_type = 'week' THEN
    v_period_start := DATE_TRUNC('week', NOW());
    v_period_end := v_period_start + INTERVAL '1 week';
  ELSE -- month
    v_period_start := DATE_TRUNC('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month';
  END IF;

  -- Get current usage
  SELECT COALESCE(courses_created, 0) INTO v_courses_created
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND period_start = v_period_start
    AND period_end = v_period_end;

  -- Check if under limit
  RETURN v_courses_created < v_courses_allowed;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_course_usage(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_id TEXT;
  v_period_type TEXT;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user's active subscription
  SELECT us.id, sp.id, sp.period_type
  INTO v_subscription_id, v_plan_id, v_period_type
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  LIMIT 1;

  -- If no subscription, use free plan
  IF v_subscription_id IS NULL THEN
    v_plan_id := 'free';
    SELECT period_type INTO v_period_type
    FROM public.subscription_plans
    WHERE id = 'free';
  END IF;

  -- Calculate period
  IF v_period_type = 'week' THEN
    v_period_start := DATE_TRUNC('week', NOW());
    v_period_end := v_period_start + INTERVAL '1 week';
  ELSE -- month
    v_period_start := DATE_TRUNC('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month';
  END IF;

  -- Get or create usage record and increment
  INSERT INTO public.usage_tracking (user_id, subscription_id, period_start, period_end, courses_created)
  VALUES (p_user_id, v_subscription_id, v_period_start, v_period_end, 1)
  ON CONFLICT (user_id, period_start) DO UPDATE SET
    courses_created = usage_tracking.courses_created + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view all plans
CREATE POLICY "Users can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- Users can manage own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Users can view own usage
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


