-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  learning_style TEXT, -- visual, auditory, reading, kinesthetic
  time_available_hours INTEGER DEFAULT 5, -- hours per week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- AI Providers configuration
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL, -- openai, anthropic, ollama
  api_key TEXT, -- encrypted in production
  base_url TEXT,
  model TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, provider_name)
);

-- Learning Goals
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  goal_description TEXT,
  target_level TEXT, -- beginner, intermediate, advanced, expert
  deadline DATE,
  status TEXT DEFAULT 'active', -- active, completed, paused
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  learning_goal_id UUID REFERENCES public.learning_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  level TEXT NOT NULL, -- beginner, intermediate, advanced, expert
  estimated_hours INTEGER,
  prerequisites TEXT[], -- array of prerequisite topics
  key_concepts TEXT[], -- array of key concepts
  milestones JSONB, -- structured milestone data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  level TEXT NOT NULL, -- beginner, intermediate, advanced, expert
  order_index INTEGER NOT NULL,
  simple_explanation TEXT,
  deep_explanation TEXT,
  real_world_use_cases TEXT[],
  analogies TEXT[],
  visual_models TEXT, -- markdown or JSON
  step_by_step_examples JSONB,
  common_mistakes TEXT[],
  estimated_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Worksheets
CREATE TABLE IF NOT EXISTS public.worksheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  questions JSONB NOT NULL, -- array of question objects
  answer_key JSONB NOT NULL, -- structured answer key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL, -- beginner, intermediate, advanced, expert
  type TEXT DEFAULT 'quiz', -- quiz, exam
  questions JSONB NOT NULL, -- array of question objects
  answer_key JSONB NOT NULL, -- structured answer key
  passing_score INTEGER DEFAULT 70, -- percentage
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Capstone Projects
CREATE TABLE IF NOT EXISTS public.capstone_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  level TEXT NOT NULL, -- beginner, intermediate, advanced, expert
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  requirements JSONB, -- array of requirements
  evaluation_rubric JSONB, -- structured rubric
  extension_challenges JSONB, -- optional challenges
  estimated_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  capstone_id UUID REFERENCES public.capstone_projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- lesson, worksheet, quiz, capstone
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  completion_percentage INTEGER DEFAULT 0,
  score INTEGER, -- for quizzes/worksheets
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Responses (for quizzes and worksheets)
CREATE TABLE IF NOT EXISTS public.user_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- reference to question in worksheet/quiz
  response TEXT, -- user's answer
  is_correct BOOLEAN,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Spaced Repetition
CREATE TABLE IF NOT EXISTS public.spaced_repetition (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID NOT NULL, -- can reference lesson, concept, etc.
  content_type TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  next_review_date DATE NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_goal_id ON public.learning_paths(learning_goal_id);
CREATE INDEX IF NOT EXISTS idx_lessons_path_id ON public.lessons(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_path_id ON public.user_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_user_id ON public.spaced_repetition(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_next_review ON public.spaced_repetition(next_review_date);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_repetition ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own AI providers" ON public.ai_providers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning goals" ON public.learning_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning paths" ON public.learning_paths
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = lessons.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own worksheets" ON public.worksheets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = worksheets.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = quizzes.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own capstone projects" ON public.capstone_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = capstone_projects.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own responses" ON public.user_responses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spaced repetition" ON public.spaced_repetition
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON public.learning_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worksheets_updated_at BEFORE UPDATE ON public.worksheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capstone_projects_updated_at BEFORE UPDATE ON public.capstone_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_updated_at BEFORE UPDATE ON public.spaced_repetition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();















