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
          answered_at: string | null
          created_at: string
          id: string
          module_id: string | null
          module_number: number | null
          module_title: string | null
          question_id: string
          question_text: string
          question_type: string | null
          section_id: string | null
          section_name: string | null
          time_spent: number | null
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          module_number?: number | null
          module_title?: string | null
          question_id: string
          question_text: string
          question_type?: string | null
          section_id?: string | null
          section_name?: string | null
          time_spent?: number | null
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          module_number?: number | null
          module_title?: string | null
          question_id?: string
          question_text?: string
          question_type?: string | null
          section_id?: string | null
          section_name?: string | null
          time_spent?: number | null
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
      quiz_answers_backup: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string | null
          question_id: string | null
          question_text: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          question_text?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          question_text?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      quiz_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_number: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_number: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_number?: number
          title?: string
        }
        Relationships: []
      }
      quiz_modules_backup: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          order_number: number | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          order_number?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          order_number?: number | null
          title?: string | null
        }
        Relationships: []
      }
      quiz_options: {
        Row: {
          created_at: string
          id: string
          order_number: number
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_number: number
          question_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          order_number?: number
          question_id?: string
          text?: string
        }
        Relationships: []
      }
      quiz_options_backup: {
        Row: {
          created_at: string | null
          id: string | null
          order_number: number | null
          question_id: string | null
          text: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          order_number?: number | null
          question_id?: string | null
          text?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          order_number?: number | null
          question_id?: string | null
          text?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          category: string | null
          created_at: string
          dependency: Json | null
          hint: string | null
          id: string
          max_options: number | null
          module_id: string | null
          module_number: number
          module_title: string
          options: Json | null
          options_json: Json | null
          order_number: number
          placeholder: string | null
          prefix: string | null
          question_number: number
          question_text: string
          question_type: string
          required: boolean | null
          section_id: string | null
          validation: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          dependency?: Json | null
          hint?: string | null
          id?: string
          max_options?: number | null
          module_id?: string | null
          module_number: number
          module_title: string
          options?: Json | null
          options_json?: Json | null
          order_number: number
          placeholder?: string | null
          prefix?: string | null
          question_number: number
          question_text: string
          question_type: string
          required?: boolean | null
          section_id?: string | null
          validation?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          dependency?: Json | null
          hint?: string | null
          id?: string
          max_options?: number | null
          module_id?: string | null
          module_number?: number
          module_title?: string
          options?: Json | null
          options_json?: Json | null
          order_number?: number
          placeholder?: string | null
          prefix?: string | null
          question_number?: number
          question_text?: string
          question_type?: string
          required?: boolean | null
          section_id?: string | null
          validation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "quiz_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions_backup: {
        Row: {
          created_at: string | null
          id: string | null
          module_number: number | null
          module_title: string | null
          options: Json | null
          question_number: number | null
          question_text: string | null
          question_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          module_number?: number | null
          module_title?: string | null
          options?: Json | null
          question_number?: number | null
          question_text?: string | null
          question_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          module_number?: number | null
          module_title?: string | null
          options?: Json | null
          question_number?: number | null
          question_text?: string | null
          question_type?: string | null
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
      quiz_respostas_completas_backup: {
        Row: {
          data_submissao: string | null
          id: string | null
          respostas: Json | null
          submission_id: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          data_submissao?: string | null
          id?: string | null
          respostas?: Json | null
          submission_id?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          data_submissao?: string | null
          id?: string | null
          respostas?: Json | null
          submission_id?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
      quiz_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module_id: string
          name: string
          order_number: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id: string
          name: string
          order_number: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string
          name?: string
          order_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          completed_at: string | null
          current_module: number
          device_info: string | null
          id: string
          is_complete: boolean
          last_active: string | null
          modules_completed: number[] | null
          sessions: number | null
          started_at: string
          total_time_spent: number | null
          user_email: string | null
          user_id: string
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          current_module?: number
          device_info?: string | null
          id?: string
          is_complete?: boolean
          last_active?: string | null
          modules_completed?: number[] | null
          sessions?: number | null
          started_at?: string
          total_time_spent?: number | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          current_module?: number
          device_info?: string | null
          id?: string
          is_complete?: boolean
          last_active?: string | null
          modules_completed?: number[] | null
          sessions?: number | null
          started_at?: string
          total_time_spent?: number | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
      quiz_submissions_backup: {
        Row: {
          completed_at: string | null
          current_module: number | null
          id: string | null
          is_complete: boolean | null
          started_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          current_module?: number | null
          id?: string | null
          is_complete?: boolean | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          current_module?: number | null
          id?: string | null
          is_complete?: boolean | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string
          user_id?: string
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
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_quiz_progress: {
        Args: {
          p_user_id: string
          p_current_module: number
          p_completed_modules?: number[]
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
