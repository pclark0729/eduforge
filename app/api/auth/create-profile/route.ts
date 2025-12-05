import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, fullName } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
      })

    if (error) {
      // If profile already exists, that's okay
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Profile already exists' })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    )
  }
}










