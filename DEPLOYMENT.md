# EduForge Deployment Guide

## Prerequisites

1. Supabase account and project
2. Vercel account
3. AI provider API keys (OpenAI, Anthropic, or Ollama)

## Setup Steps

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor
3. Get your Supabase credentials:
   - Project URL (Settings > API > Project URL)
   - Anon key (Settings > API > anon public key)
   - Service role key (Settings > API > service_role secret key)

### 2. Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key (optional)
ANTHROPIC_API_KEY=your_anthropic_key (optional)
OLLAMA_BASE_URL=http://localhost:11434 (optional, for local LLM)
```

### 3. Vercel Deployment

1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`
4. Deploy

### 4. Post-Deployment

1. Verify database migrations ran successfully
2. Test authentication flow
3. Configure AI provider in user settings
4. Create a test learning path

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check RLS policies are set correctly
- Ensure migrations ran successfully

### AI Provider Issues
- Verify API keys are valid
- Check provider is set as active in database
- Review API rate limits

### Build Errors
- Ensure all dependencies are in package.json
- Check TypeScript errors
- Verify environment variables are set
















