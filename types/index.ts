export type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic'
export type ContentType = 'lesson' | 'worksheet' | 'quiz' | 'capstone'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface LearningPath {
  id: string
  user_id: string
  learning_goal_id: string | null
  title: string
  description: string | null
  topic: string
  level: LearningLevel
  estimated_hours: number | null
  prerequisites: string[] | null
  key_concepts: string[] | null
  milestones: Milestone[] | null
  created_at: string
  updated_at: string
}

export interface Milestone {
  level: LearningLevel
  concepts: string[]
  estimated_time: string
  prerequisites: string[]
  outcomes: string[]
}

export interface Lesson {
  id: string
  learning_path_id: string
  title: string
  concept: string
  level: LearningLevel
  order_index: number
  simple_explanation: string | null
  deep_explanation: string | null
  real_world_use_cases: string[] | null
  analogies: string[] | null
  visual_models: string | null
  step_by_step_examples: StepByStepExample[] | null
  common_mistakes: string[] | null
  estimated_minutes: number | null
}

export interface StepByStepExample {
  step: number
  description: string
  example: string
}

export interface Worksheet {
  id: string
  learning_path_id: string | null
  lesson_id: string | null
  title: string
  level: LearningLevel
  questions: WorksheetQuestion[]
  answer_key: Record<string, any>
}

export interface WorksheetQuestion {
  id: string
  type: 'fill_in_blank' | 'matching' | 'scenario' | 'short_answer' | 'applied_challenge'
  question: string
  options?: string[]
  correct_answer: string | string[]
  points: number
}

export interface Quiz {
  id: string
  learning_path_id: string | null
  title: string
  level: LearningLevel
  type: 'quiz' | 'exam'
  questions: QuizQuestion[]
  answer_key: Record<string, any>
  passing_score: number
  time_limit_minutes: number | null
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_response' | 'scenario'
  question: string
  options?: string[]
  correct_answer: string | number
  explanation: string
  points: number
}

export interface CapstoneProject {
  id: string
  learning_path_id: string
  title: string
  level: LearningLevel
  description: string
  instructions: string
  requirements: string[]
  evaluation_rubric: RubricCriteria[]
  extension_challenges: string[] | null
  estimated_hours: number | null
}

export interface RubricCriteria {
  criterion: string
  excellent: string
  good: string
  satisfactory: string
  needs_improvement: string
  points: number
}

export interface UserProgress {
  id: string
  user_id: string
  learning_path_id: string | null
  lesson_id: string | null
  worksheet_id: string | null
  quiz_id: string | null
  capstone_id: string | null
  content_type: ContentType
  status: ProgressStatus
  completion_percentage: number
  score: number | null
  time_spent_minutes: number
  last_accessed_at: string | null
  completed_at: string | null
}

export interface AIProvider {
  id: string
  user_id: string
  provider_name: 'openai' | 'anthropic' | 'ollama'
  api_key: string | null
  base_url: string | null
  model: string | null
  is_active: boolean
}











