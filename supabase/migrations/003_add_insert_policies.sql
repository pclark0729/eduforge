-- Add INSERT policies for content tables
-- Users can insert lessons, worksheets, quizzes, and capstones for their own learning paths

CREATE POLICY "Users can insert own lessons" ON public.lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = lessons.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own worksheets" ON public.worksheets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = worksheets.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = quizzes.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own capstone projects" ON public.capstone_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = capstone_projects.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );










