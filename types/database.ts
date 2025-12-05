export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          learning_style: string | null
          time_available_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          learning_style?: string | null
          time_available_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          learning_style?: string | null
          time_available_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_providers: {
        Row: {
          id: string
          user_id: string
          provider_name: string
          api_key: string | null
          base_url: string | null
          model: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_name: string
          api_key?: string | null
          base_url?: string | null
          model?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider_name?: string
          api_key?: string | null
          base_url?: string | null
          model?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_goals: {
        Row: {
          id: string
          user_id: string
          topic: string
          goal_description: string | null
          target_level: string | null
          deadline: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          goal_description?: string | null
          target_level?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          goal_description?: string | null
          target_level?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          user_id: string
          learning_goal_id: string | null
          title: string
          description: string | null
          topic: string
          level: string
          estimated_hours: number | null
          prerequisites: string[] | null
          key_concepts: string[] | null
          milestones: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          learning_goal_id?: string | null
          title: string
          description?: string | null
          topic: string
          level: string
          estimated_hours?: number | null
          prerequisites?: string[] | null
          key_concepts?: string[] | null
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          learning_goal_id?: string | null
          title?: string
          description?: string | null
          topic?: string
          level?: string
          estimated_hours?: number | null
          prerequisites?: string[] | null
          key_concepts?: string[] | null
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          learning_path_id: string
          title: string
          concept: string
          level: string
          order_index: number
          simple_explanation: string | null
          deep_explanation: string | null
          real_world_use_cases: string[] | null
          analogies: string[] | null
          visual_models: string | null
          step_by_step_examples: Json | null
          common_mistakes: string[] | null
          estimated_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          title: string
          concept: string
          level: string
          order_index: number
          simple_explanation?: string | null
          deep_explanation?: string | null
          real_world_use_cases?: string[] | null
          analogies?: string[] | null
          visual_models?: string | null
          step_by_step_examples?: Json | null
          common_mistakes?: string[] | null
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          title?: string
          concept?: string
          level?: string
          order_index?: number
          simple_explanation?: string | null
          deep_explanation?: string | null
          real_world_use_cases?: string[] | null
          analogies?: string[] | null
          visual_models?: string | null
          step_by_step_examples?: Json | null
          common_mistakes?: string[] | null
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      worksheets: {
        Row: {
          id: string
          learning_path_id: string | null
          lesson_id: string | null
          title: string
          level: string
          questions: Json
          answer_key: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          learning_path_id?: string | null
          lesson_id?: string | null
          title: string
          level: string
          questions: Json
          answer_key: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string | null
          lesson_id?: string | null
          title?: string
          level?: string
          questions?: Json | null
          answer_key?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          learning_path_id: string | null
          title: string
          level: string
          type: string
          questions: Json
          answer_key: Json
          passing_score: number
          time_limit_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          learning_path_id?: string | null
          title: string
          level: string
          type?: string
          questions: Json
          answer_key: Json
          passing_score?: number
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string | null
          title?: string
          level?: string
          type?: string
          questions?: Json | null
          answer_key?: Json | null
          passing_score?: number
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      capstone_projects: {
        Row: {
          id: string
          learning_path_id: string
          title: string
          level: string
          description: string
          instructions: string
          requirements: Json | null
          evaluation_rubric: Json | null
          extension_challenges: Json | null
          estimated_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          title: string
          level: string
          description: string
          instructions: string
          requirements?: Json | null
          extension_challenges?: Json | null
          evaluation_rubric?: Json | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          title?: string
          level?: string
          description?: string
          instructions?: string
          requirements?: Json | null
          extension_challenges?: Json | null
          evaluation_rubric?: Json | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          learning_path_id: string | null
          lesson_id: string | null
          worksheet_id: string | null
          quiz_id: string | null
          capstone_id: string | null
          content_type: string
          status: string
          completion_percentage: number
          score: number | null
          time_spent_minutes: number
          last_accessed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          learning_path_id?: string | null
          lesson_id?: string | null
          worksheet_id?: string | null
          quiz_id?: string | null
          capstone_id?: string | null
          content_type: string
          status?: string
          completion_percentage?: number
          score?: number | null
          time_spent_minutes?: number
          last_accessed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          learning_path_id?: string | null
          lesson_id?: string | null
          worksheet_id?: string | null
          quiz_id?: string | null
          capstone_id?: string | null
          content_type?: string
          status?: string
          completion_percentage?: number
          score?: number | null
          time_spent_minutes?: number
          last_accessed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_responses: {
        Row: {
          id: string
          user_id: string
          worksheet_id: string | null
          quiz_id: string | null
          question_id: string
          response: string | null
          is_correct: boolean | null
          feedback: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          worksheet_id?: string | null
          quiz_id?: string | null
          question_id: string
          response?: string | null
          is_correct?: boolean | null
          feedback?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          worksheet_id?: string | null
          quiz_id?: string | null
          question_id?: string
          response?: string | null
          is_correct?: boolean | null
          feedback?: string | null
          submitted_at?: string
        }
      }
      spaced_repetition: {
        Row: {
          id: string
          user_id: string
          content_id: string
          content_type: string
          difficulty_level: number
          next_review_date: string
          review_count: number
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          content_type: string
          difficulty_level?: number
          next_review_date: string
          review_count?: number
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          content_type?: string
          difficulty_level?: number
          next_review_date?: string
          review_count?: number
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}














