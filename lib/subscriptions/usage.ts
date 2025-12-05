import { createServerComponentClient } from '@/lib/supabase/server'

export interface UsageInfo {
  canCreate: boolean
  coursesCreated: number
  coursesAllowed: number | null // null = unlimited
  periodStart: Date
  periodEnd: Date
  planId: string
  planName: string
}

export async function checkUsage(userId: string): Promise<UsageInfo> {
  const supabase = await createServerComponentClient()

  // Check if user can create course using database function
  const { data: canCreateResult } = await supabase.rpc('can_create_course', {
    p_user_id: userId,
  })

  const canCreate = canCreateResult === true

  // Get user's subscription
  const { data: subscription } = await (supabase
    .from('user_subscriptions') as any)
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  // Get current plan (subscription or free)
  let planId = 'free'
  let planName = 'Free'
  let coursesAllowed: number | null = 1
  let periodType: 'week' | 'month' = 'week'

  if (subscription && subscription.subscription_plans) {
    planId = subscription.subscription_plans.id
    planName = subscription.subscription_plans.name
    coursesAllowed = subscription.subscription_plans.courses_per_period
    periodType = subscription.subscription_plans.period_type
  } else {
    // Get free plan details
    const { data: freePlan } = await (supabase
      .from('subscription_plans') as any)
      .select('*')
      .eq('id', 'free')
      .single()

    if (freePlan) {
      planId = freePlan.id
      planName = freePlan.name
      coursesAllowed = freePlan.courses_per_period
      periodType = freePlan.period_type
    }
  }

  // Calculate period dates
  const now = new Date()
  let periodStart: Date
  let periodEnd: Date

  if (periodType === 'week') {
    periodStart = new Date(now)
    periodStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    periodStart.setHours(0, 0, 0, 0)
    periodEnd = new Date(periodStart)
    periodEnd.setDate(periodStart.getDate() + 7)
  } else {
    // Month
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  // Get current usage
  const { data: usage } = await (supabase
    .from('usage_tracking') as any)
    .select('courses_created')
    .eq('user_id', userId)
    .gte('period_start', periodStart.toISOString())
    .lte('period_start', periodEnd.toISOString())
    .single()

  const coursesCreated = usage?.courses_created || 0

  return {
    canCreate,
    coursesCreated,
    coursesAllowed,
    periodStart,
    periodEnd,
    planId,
    planName,
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createServerComponentClient()

  await supabase.rpc('increment_course_usage', {
    p_user_id: userId,
  })
}

