
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
          email: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          email?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          email?: string | null
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
          question_text: string
          answer: string | null
          created_at: string
          updated_at: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          question_text: string
          answer?: string | null
          created_at?: string
          updated_at?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          question_text?: string
          answer?: string | null
          created_at?: string
          updated_at?: string | null
          user_email?: string
          user_name?: string | null
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string
          current_module: number
          is_complete: boolean
          started_at: string
          completed_at: string | null
          user_email: string
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          current_module?: number
          is_complete?: boolean
          started_at?: string
          completed_at?: string | null
          user_email: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          current_module?: number
          is_complete?: boolean
          started_at?: string
          completed_at?: string | null
          user_email?: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
      }
      quiz_respostas_completas: {
        Row: {
          id: string
          user_id: string
          submission_id: string
          respostas: Json
          data_submissao: string
          user_email: string
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          submission_id: string
          respostas: Json
          data_submissao?: string
          user_email: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          submission_id?: string
          respostas?: Json
          data_submissao?: string
          user_email?: string
          user_name?: string | null
          webhook_processed?: boolean | null
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      gerar_respostas_json: {
        Args: {
          p_user_id: string
        }
        Returns: Json
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
