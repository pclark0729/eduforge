import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { checkUsage } from '@/lib/subscriptions/usage'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const usage = await checkUsage(user.id)

    return NextResponse.json({ usage })
  } catch (error: any) {
    console.error('Error getting usage:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get usage' },
      { status: 500 }
    )
  }
}

