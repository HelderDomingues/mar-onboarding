
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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          email: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      quiz_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          order_number: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          order_number?: number
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          module_id: string
          text: string
          type: string
          required: boolean
          order_number: number
          hint: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          text: string
          type: string
          required?: boolean
          order_number: number
          hint?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          text?: string
          type?: string
          required?: boolean
          order_number?: number
          hint?: string | null
          created_at?: string
        }
      }
      quiz_options: {
        Row: {
          id: string
          question_id: string
          text: string
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          text: string
          order_number: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          text?: string
          order_number?: number
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string
          current_module: number
          completed: boolean
          started_at: string
          completed_at: string | null
          contact_preference: string | null
          contact_consent: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          current_module?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          contact_preference?: string | null
          contact_consent?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          current_module?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          contact_preference?: string | null
          contact_consent?: boolean | null
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          file_url: string
          plan_level: string
          type: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          file_url: string
          plan_level: string
          type: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          file_url?: string
          plan_level?: string
          type?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      material_views: {
        Row: {
          id: string
          material_id: string
          user_id: string
          access_count: number
          last_accessed: string
        }
        Insert: {
          id?: string
          material_id: string
          user_id: string
          access_count?: number
          last_accessed?: string
        }
        Update: {
          id?: string
          material_id?: string
          user_id?: string
          access_count?: number
          last_accessed?: string
        }
      }
      onboarding_videos: {
        Row: {
          id: string
          title: string
          content: string | null
          video_url: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          video_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          video_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      faq_entries: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          is_active: boolean
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          is_active?: boolean
          order_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          is_active?: boolean
          order_number?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_quiz: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
