export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          target_record_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_record_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_record_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      atualizar: {
        Row: {
          created_at: string
          id: number
          numero: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          numero?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          numero?: number | null
        }
        Relationships: []
      }
      material_accesses: {
        Row: {
          accessed_at: string | null
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_accesses_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          access_count: number | null
          category: string | null
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          plan_level: string | null
          thumbnail_url: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          plan_level?: string | null
          thumbnail_url?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          plan_level?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          user_email: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          user_email: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          user_email?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question_id: string
          submission_id: string
          updated_at: string
          user_email: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          submission_id: string
          updated_at?: string
          user_email?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          submission_id?: string
          updated_at?: string
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "quiz_submissions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
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
          hint: string | null
          id: string
          module_id: string
          order_number: number
          required: boolean | null
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id: string
          order_number: number
          required?: boolean | null
          text: string
          type: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id?: string
          order_number?: number
          required?: boolean | null
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_respostas_completas: {
        Row: {
          data_submissao: string
          full_name: string | null
          id: string
          respostas: Json
          submission_id: string
          user_email: string
          user_id: string
          webhook_processed: boolean | null
        }
        Insert: {
          data_submissao?: string
          full_name?: string | null
          id?: string
          respostas: Json
          submission_id: string
          user_email: string
          user_id: string
          webhook_processed?: boolean | null
        }
        Update: {
          data_submissao?: string
          full_name?: string | null
          id?: string
          respostas?: Json
          submission_id?: string
          user_email?: string
          user_id?: string
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_module: number
          full_name: string | null
          id: string
          started_at: string
          user_email: string
          user_id: string
          webhook_processed: boolean | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_module?: number
          full_name?: string | null
          id?: string
          started_at?: string
          user_email: string
          user_id: string
          webhook_processed?: boolean | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_module?: number
          full_name?: string | null
          id?: string
          started_at?: string
          user_email?: string
          user_id?: string
          webhook_processed?: boolean | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          admin_email: string
          make_admin?: boolean
          new_user_email: string
          new_user_name: string
          new_user_password: string
        }
        Returns: Json
      }
      complete_quiz: { Args: { p_user_id: string }; Returns: boolean }
      create_table_backup: {
        Args: {
          backup_reason?: string
          source_table: string
          target_table: string
        }
        Returns: boolean
      }
      fix_quiz_completion: { Args: { p_user_id: string }; Returns: boolean }
      gerar_respostas_json: { Args: { p_user_id: string }; Returns: Json }
      get_system_config: { Args: { p_config_key: string }; Returns: string }
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_users_with_emails: {
        Args: never
        Returns: {
          full_name: string
          user_created_at: string
          user_email: string
          user_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_quiz_complete: { Args: { p_user_id: string }; Returns: boolean }
      list_table_backups: {
        Args: { table_name_pattern: string }
        Returns: string[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_target_record_id?: string
          p_target_table?: string
        }
        Returns: boolean
      }
      restore_table_from_backup: {
        Args: { backup_table: string; target_table: string }
        Returns: boolean
      }
      toggle_user_admin_role: {
        Args: { p_make_admin: boolean; p_user_email: string; p_user_id: string }
        Returns: boolean
      }
      update_system_config: {
        Args: { p_config_key: string; p_config_value: string }
        Returns: boolean
      }
      update_user_quiz_progress: {
        Args: {
          p_completed_modules?: number[]
          p_current_module: number
          p_user_id: string
        }
        Returns: boolean
      }
      validate_quiz_completeness: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
