-- Clear ALL data including user accounts (for complete reset)
-- WARNING: This will delete EVERYTHING including user accounts
-- Only use this for complete database reset in development

-- Delete in order to respect foreign key constraints

-- 1. Delete user responses
DELETE FROM public.user_responses;

-- 2. Delete spaced repetition
DELETE FROM public.spaced_repetition;

-- 3. Delete user progress
DELETE FROM public.user_progress;

-- 4. Delete capstone projects
DELETE FROM public.capstone_projects;

-- 5. Delete quizzes
DELETE FROM public.quizzes;

-- 6. Delete worksheets
DELETE FROM public.worksheets;

-- 7. Delete lessons
DELETE FROM public.lessons;

-- 8. Delete learning paths
DELETE FROM public.learning_paths;

-- 9. Delete learning goals
DELETE FROM public.learning_goals;

-- 10. Delete AI provider configurations
DELETE FROM public.ai_providers;

-- 11. Delete user profiles
DELETE FROM public.user_profiles;

-- 12. Delete auth users (this will cascade to user_profiles if foreign key is set up)
-- Note: This requires admin privileges
-- DELETE FROM auth.users;









