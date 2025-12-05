# Supabase Email Configuration Guide

## Problem: Authentication Emails Not Sending

If users are not receiving confirmation emails after signup, follow these steps:

## 1. Enable Email Confirmations in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Settings** (or **Auth** > **Settings**)
4. Scroll to **Email Auth** section
5. Enable the following:
   - ✅ **Enable email confirmations** - This requires users to confirm their email before signing in
   - ✅ **Confirm email** - Set to "Required" (users must confirm email to sign in)

## 2. Configure Email Provider

Supabase needs an email provider to send emails. You have two options:

### Option A: Use Supabase's Built-in Email (Free Tier - Limited)

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. Under **SMTP Settings**, Supabase provides a basic email service
3. **Limitations**: 
   - Free tier: Limited to 3 emails per hour
   - Emails come from `noreply@mail.app.supabase.io`
   - Not suitable for production

### Option B: Configure Custom SMTP (Recommended for Production)

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Configure your SMTP provider:

   **For Gmail:**
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [App Password - see below]
   Sender email: your-email@gmail.com
   Sender name: Your App Name
   ```

   **For SendGrid:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: your-verified-email@domain.com
   Sender name: Your App Name
   ```

   **For AWS SES:**
   ```
   Host: email-smtp.us-east-1.amazonaws.com (or your region)
   Port: 587
   Username: [Your SES SMTP Username]
   Password: [Your SES SMTP Password]
   Sender email: your-verified-email@domain.com
   Sender name: Your App Name
   ```

5. Click **Save**

### Gmail App Password Setup

If using Gmail, you need to create an App Password:

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** > **2-Step Verification** (must be enabled)
3. Scroll to **App passwords**
4. Create a new app password for "Mail"
5. Use this 16-character password in Supabase SMTP settings

## 3. Test Email Configuration

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Invite user** or create a test user
3. Check if the email is received
4. Check Supabase logs: **Logs** > **Auth Logs** for any errors

## 4. Verify Environment Variables

Make sure these are set in your Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Important for email redirects
```

## 5. Check Email Templates (Optional)

You can customize email templates in Supabase:

1. Go to **Authentication** > **Email Templates**
2. Customize:
   - **Confirm signup** - Email sent when user signs up
   - **Magic Link** - Email sent for passwordless login
   - **Change Email Address** - Email sent when email is changed
   - **Reset Password** - Email sent for password reset

## Troubleshooting

### Emails Still Not Sending

1. **Check Supabase Logs:**
   - Go to **Logs** > **Auth Logs**
   - Look for email sending errors

2. **Verify SMTP Settings:**
   - Test SMTP connection in Supabase dashboard
   - Check if credentials are correct
   - Ensure port 587 is not blocked

3. **Check Spam Folder:**
   - Ask users to check spam/junk folder
   - Consider setting up SPF/DKIM records for custom domains

4. **Rate Limits:**
   - Free tier has limits (3 emails/hour)
   - Upgrade to Pro for higher limits
   - Use custom SMTP for unlimited emails

5. **Email Provider Issues:**
   - Gmail: May require app password
   - SendGrid: Verify sender email address
   - AWS SES: Verify domain/email in SES console

### Alternative: Manual Email Sending

If Supabase email sending continues to fail, you can:

1. Use the confirmation link from `generateLink` API
2. Send emails manually using a service like:
   - Resend (https://resend.com)
   - SendGrid API
   - AWS SES API
   - Nodemailer

See `app/api/auth/send-confirmation/route.ts` for an example of generating links that can be sent manually.

## Code Changes Made

The signup route (`app/api/auth/signup/route.ts`) has been updated to:

1. Use `inviteUserByEmail` which actually sends emails (unlike `generateLink`)
2. Fallback to `generateLink` if invite fails (for manual email sending)
3. Better error handling and logging

## Next Steps

1. ✅ Configure email provider in Supabase Dashboard
2. ✅ Enable email confirmations
3. ✅ Test signup flow
4. ✅ Monitor Supabase Auth Logs
5. ✅ Set up custom SMTP for production

