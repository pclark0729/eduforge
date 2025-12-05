import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use service role client to create user and manage everything
    const supabase = createServiceRoleClient()

    // Step 1: Create the user in auth.users (this won't send email automatically)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm, user needs to confirm via email
      user_metadata: {
        full_name: fullName || '',
      },
    })

    if (authError) {
      // If user already exists, return error
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Step 2: Create user profile (this happens before email is sent)
    const { error: profileError } = await (supabase
      .from('user_profiles') as any)
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName || null,
      })

    if (profileError) {
      // If profile already exists, that's okay (trigger might have created it)
      if (profileError.code !== '23505') {
        // If it's not a duplicate error, try to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Failed to cleanup user after profile creation error:', deleteError)
        }
        throw profileError
      }
    }

    // Step 3: Send confirmation email
    // When using admin.createUser with email_confirm: false, Supabase should automatically
    // send a confirmation email IF email confirmations are enabled in project settings.
    // However, to ensure the email is sent, we can use resendConfirmationEmail
    const { error: resendError } = await supabase.auth.admin.resendConfirmationEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup&next=/signin`,
    })

    if (resendError) {
      console.error('Error resending confirmation email:', resendError)
      // Fallback: Generate link (for manual email sending if needed)
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin`,
        },
      })
      
      if (linkError) {
        console.error('Error generating confirmation link (fallback):', linkError)
        // Don't fail the signup, but log the error
        // The user can request a new confirmation email later via Supabase dashboard
      } else if (linkData?.properties?.action_link && process.env.NODE_ENV === 'development') {
        // In development, log the link for testing
        console.log('Confirmation link (dev only):', linkData.properties.action_link)
      }
    }

    // IMPORTANT: Make sure email confirmations are enabled in Supabase:
    // 1. Go to Supabase Dashboard > Authentication > Settings
    // 2. Enable "Enable email confirmations"
    // 3. Set "Confirm email" to required
    // 4. Configure your email provider (SMTP or use Supabase's built-in)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: 'Account created successfully. Please check your email to confirm your account.',
    })
  } catch (error: any) {
    console.error('Error in signup:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}

