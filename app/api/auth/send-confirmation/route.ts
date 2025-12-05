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

    // Use resendConfirmationEmail which actually sends the email
    const { error } = await supabase.auth.admin.resendConfirmationEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=invite&next=/signin`,
    })

    if (error) {
      // Fallback: try generateLink if resendConfirmationEmail fails
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery', // Use recovery type for password reset/confirmation
        email: email,
      })

      if (linkError) {
        throw linkError
      }

      // Note: generateLink doesn't send emails automatically
      // You would need to send the email manually using the link
      return NextResponse.json({
        success: true,
        message: 'Confirmation link generated (email may need to be sent manually)',
        // In development, return the link for testing
        link: process.env.NODE_ENV === 'development' ? linkData?.properties?.action_link : undefined,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
    })
  } catch (error: any) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}











