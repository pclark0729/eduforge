# Environment Variables Setup Guide

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Never commit `.env.local` to git (it's already in `.gitignore`)

## Required Variables

### Supabase (Required)

These are **required** for the app to function:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Get from: Supabase Dashboard > Settings > API > Project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get from: Supabase Dashboard > Settings > API > anon public key
   - This is safe to expose in the browser

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: Supabase Dashboard > Settings > API > service_role secret key
   - ⚠️ **Keep this secret!** Never expose in client-side code
   - Used for server-side operations

### AI Provider (At least one required)

You need at least **one** AI provider configured for content generation:

#### Option 1: OpenAI
- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys
- **OPENAI_MODEL**: Optional, defaults to `gpt-4-turbo-preview`

#### Option 2: Anthropic
- **ANTHROPIC_API_KEY**: Get from https://console.anthropic.com/
- **ANTHROPIC_MODEL**: Optional, defaults to `claude-3-5-sonnet-20241022`

#### Option 3: Ollama (Local LLM)
- **OLLAMA_BASE_URL**: Defaults to `http://localhost:11434`
- **OLLAMA_MODEL**: Defaults to `llama2`
- Requires running Ollama locally: https://ollama.ai

## Setup Instructions

### 1. Supabase Setup

1. Go to https://supabase.com and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings > API
4. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`
5. Run the database migration:
   - Go to SQL Editor in Supabase
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute

### 2. AI Provider Setup

Choose one or more providers:

**OpenAI:**
1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy to `OPENAI_API_KEY`

**Anthropic:**
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to API Keys
4. Create a new API key
5. Copy to `ANTHROPIC_API_KEY`

**Ollama (Local):**
1. Install Ollama: https://ollama.ai
2. Run: `ollama pull llama2`
3. Start Ollama service
4. Use default values or customize `OLLAMA_BASE_URL` and `OLLAMA_MODEL`

### 3. Configure in App

After setting environment variables, you can also configure AI providers in the app:
1. Sign up/Login
2. Go to Settings
3. Add your AI provider credentials
4. Set one as active

## Environment File Priority

Next.js loads environment variables in this order (later files override earlier):
1. `.env`
2. `.env.local` (loaded in all environments, ignored by git)
3. `.env.development` (development only)
4. `.env.production` (production only)

## Security Notes

- ✅ `.env.local` is in `.gitignore` - safe to use
- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ⚠️ Never commit `.env.local` or any file with real API keys
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep it secret
- ⚠️ Use different keys for development and production

## Vercel Deployment

When deploying to Vercel:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add all variables from `.env.example`
4. Set values for:
   - Production
   - Preview (optional)
   - Development (optional)

## Troubleshooting

### "No AI provider configured"
- Make sure at least one AI provider has a valid API key
- Check that the key is correct and has proper permissions
- For Ollama, ensure the service is running

### "Supabase connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches your project
- Ensure database migrations have been run

### Variables not loading
- Restart the dev server after changing `.env.local`
- Check for typos in variable names
- Ensure no extra spaces or quotes around values










