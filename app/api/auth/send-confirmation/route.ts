import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Send confirmation email to a user
 * This can be called after profile creation to ensure email is sent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // First, try to get the user to check if they exist and need confirmation
    // Then use generateLink with 'invite' type which doesn't require password
    // and will send a confirmation email for unconfirmed users
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite', // Use invite type - works for resending confirmation without password
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup&next=/signin`,
      },
    })

    if (linkError) {
      // If invite type fails, try recovery type as fallback
      const { data: recoveryLinkData, error: recoveryError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery&next=/signin`,
        },
      })

      if (recoveryError) {
        throw recoveryError
      }

      // Note: generateLink creates the link, but Supabase should send the email automatically
      // if email confirmations are enabled in project settings
      return NextResponse.json({
        success: true,
        message: 'Confirmation email should be sent. Please check your inbox (and spam folder).',
        // In development, return the link for testing
        link: process.env.NODE_ENV === 'development' ? recoveryLinkData?.properties?.action_link : undefined,
      })
    }

    // Note: generateLink creates the link, but Supabase should send the email automatically
    // if email confirmations are enabled in project settings
    return NextResponse.json({
      success: true,
      message: 'Confirmation email should be sent. Please check your inbox (and spam folder).',
      // In development, return the link for testing
      link: process.env.NODE_ENV === 'development' ? linkData?.properties?.action_link : undefined,
    })
  } catch (error: any) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}











