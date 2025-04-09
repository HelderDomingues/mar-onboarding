
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
          email: string | null
          avatar_url: string | null
          username: string | null
          company_name: string | null
          company_address: string | null
          website: string | null
          updated_at: string | null
          role: string | null
          social_media: any | null
          has_asaas_customer: boolean | null
          phone: string | null
          cnpj: string | null
          cpf: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          username?: string | null
          company_name?: string | null
          company_address?: string | null
          website?: string | null
          updated_at?: string | null
          role?: string | null
          social_media?: any | null
          has_asaas_customer?: boolean | null
          phone?: string | null
          cnpj?: string | null
          cpf?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          username?: string | null
          company_name?: string | null
          company_address?: string | null
          website?: string | null
          updated_at?: string | null
          role?: string | null
          social_media?: any | null
          has_asaas_customer?: boolean | null
          phone?: string | null
          cnpj?: string | null
          cpf?: string | null
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string
          completed: boolean
          completed_at: string | null
          contact_consent: boolean
          created_at: string
          updated_at: string
          current_module: number
          started_at: string
          webhook_processed: boolean | null
          email: string | null
        }
        Insert: {
          id?: string
          user_id: string
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          created_at?: string
          updated_at?: string
          current_module?: number
          started_at?: string
          webhook_processed?: boolean | null
          email?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          created_at?: string
          updated_at?: string
          current_module?: number
          started_at?: string
          webhook_processed?: boolean | null
          email?: string | null
        }
      }
      quiz_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: string | null
          created_at: string
          updated_at: string
          question_text: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer?: string | null
          created_at?: string
          updated_at?: string
          question_text?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: string | null
          created_at?: string
          updated_at?: string
          question_text?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          email: string | null
          name: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          email?: string | null
          name?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          email?: string | null
          name?: string | null
        }
      }
    }
    Functions: {
      get_user_emails: {
        Args: Record<string, never>
        Returns: { user_id: string, email: string }[]
      }
      complete_quiz: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
  }
}
