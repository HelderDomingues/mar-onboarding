
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
          hint: string | null
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          text: string
          type: string
          required?: boolean
          hint?: string | null
          order_number: number
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          text?: string
          type?: string
          required?: boolean
          hint?: string | null
          order_number?: number
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
      quiz_submissions: {
        Row: {
          id: string
          user_id: string
          user_email: string
          current_module: number
          completed: boolean
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          current_module?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          current_module?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          submission_id: string
          question_id: string
          answer: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          question_id: string
          answer?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          question_id?: string
          answer?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      is_quiz_complete: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
