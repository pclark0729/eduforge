-- Clear all learning data for testing
-- WARNING: This will delete ALL learning content, progress, and responses
-- Run this only in development/test environments

-- Delete in order to respect foreign key constraints

-- 1. Delete user responses (references worksheets and quizzes)
DELETE FROM public.user_responses;

-- 2. Delete spaced repetition items
DELETE FROM public.spaced_repetition;

-- 3. Delete user progress (references multiple content types)
DELETE FROM public.user_progress;

-- 4. Delete capstone projects (references learning_paths)
DELETE FROM public.capstone_projects;

-- 5. Delete quizzes (references learning_paths)
DELETE FROM public.quizzes;

-- 6. Delete worksheets (references learning_paths and lessons)
DELETE FROM public.worksheets;

-- 7. Delete lessons (references learning_paths)
DELETE FROM public.lessons;

-- 8. Delete learning paths (references learning_goals)
DELETE FROM public.learning_paths;

-- 9. Delete learning goals (references users)
DELETE FROM public.learning_goals;

-- Optional: Delete AI provider configurations (uncomment if needed)
-- DELETE FROM public.ai_providers;

-- Optional: Delete user profiles (uncomment if you want to reset user data too)
-- DELETE FROM public.user_profiles;

-- Reset sequences (optional, but good for clean IDs)
-- ALTER SEQUENCE IF EXISTS public.learning_goals_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.learning_paths_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.lessons_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.worksheets_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.quizzes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.capstone_projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.user_progress_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.user_responses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.spaced_repetition_id_seq RESTART WITH 1;











