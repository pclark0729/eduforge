# Clearing Database for Testing

## Quick Clear (Learning Data Only)

To clear all learning content but keep user accounts:

```sql
-- Run this in Supabase SQL Editor
DELETE FROM public.user_responses;
DELETE FROM public.spaced_repetition;
DELETE FROM public.user_progress;
DELETE FROM public.capstone_projects;
DELETE FROM public.quizzes;
DELETE FROM public.worksheets;
DELETE FROM public.lessons;
DELETE FROM public.learning_paths;
DELETE FROM public.learning_goals;
```

## Complete Reset (Everything)

To clear everything including user accounts:

```sql
-- Run this in Supabase SQL Editor
DELETE FROM public.user_responses;
DELETE FROM public.spaced_repetition;
DELETE FROM public.user_progress;
DELETE FROM public.capstone_projects;
DELETE FROM public.quizzes;
DELETE FROM public.worksheets;
DELETE FROM public.lessons;
DELETE FROM public.learning_paths;
DELETE FROM public.learning_goals;
DELETE FROM public.ai_providers;
DELETE FROM public.user_profiles;
-- Note: To delete auth users, you may need to do this in Supabase Dashboard
```

## Using Migration Files

1. **Learning Data Only**: Run `supabase/migrations/004_clear_learning_data.sql`
2. **Complete Reset**: Run `supabase/migrations/005_clear_all_data.sql`

## Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the SQL commands
4. Execute

## Important Notes

- ⚠️ These commands are **destructive** - they permanently delete data
- Always backup your database before running in production
- These are intended for **development and testing only**
- User authentication data in `auth.users` is separate and may require additional steps to delete

## Reset Sequences (Optional)

If you want to reset auto-incrementing IDs:

```sql
-- This is optional and may not be needed if using UUIDs
ALTER SEQUENCE IF EXISTS public.learning_goals_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.learning_paths_id_seq RESTART WITH 1;
-- ... etc for other tables
```









