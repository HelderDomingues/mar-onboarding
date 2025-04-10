export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question_id: string
          question_text: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          question_text: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          question_text?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          module_number: number
          module_title: string
          options: Json | null
          question_number: number
          question_text: string
          question_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_number: number
          module_title: string
          options?: Json | null
          question_number: number
          question_text: string
          question_type: string
        }
        Update: {
          created_at?: string
          id?: string
          module_number?: number
          module_title?: string
          options?: Json | null
          question_number?: number
          question_text?: string
          question_type?: string
        }
        Relationships: []
      }
      quiz_respostas_completas: {
        Row: {
          data_submissao: string
          id: string
          respostas: Json
          submission_id: string
          user_email: string
          user_id: string
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          data_submissao?: string
          id?: string
          respostas: Json
          submission_id: string
          user_email: string
          user_id: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          data_submissao?: string
          id?: string
          respostas?: Json
          submission_id?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_respostas_completas_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "quiz_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          completed_at: string | null
          current_module: number
          id: string
          is_complete: boolean
          started_at: string
          user_email: string
          user_id: string
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          current_module?: number
          id?: string
          is_complete?: boolean
          started_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          current_module?: number
          id?: string
          is_complete?: boolean
          started_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_quiz: {
        Args: { user_id: string }
        Returns: boolean
      }
      gerar_respostas_json: {
        Args: { p_user_id: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
