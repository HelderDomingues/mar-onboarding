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
          user_email: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          user_email?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          user_email?: string | null
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
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          submission_id?: string
          updated_at?: string
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
      "quiz_answers_backup_2025-04-29T18-12-42-205Z": {
        Row: {
          answer: string | null
          created_at: string | null
          id: string | null
          question_id: string | null
          submission_id: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "quiz_answers_backup_2025-04-29T18-12-55-659Z": {
        Row: {
          answer: string | null
          created_at: string | null
          id: string | null
          question_id: string | null
          submission_id: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string | null
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
      "quiz_modules_backup_2025-04-29T18-12-42-201Z": {
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
      "quiz_modules_backup_2025-04-29T18-12-55-649Z": {
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
      "quiz_options_backup_2025-04-29T18-12-42-203Z": {
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
      "quiz_options_backup_2025-04-29T18-12-55-655Z": {
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
      "quiz_questions_backup_2025-04-29T18-12-42-202Z": {
        Row: {
          created_at: string | null
          hint: string | null
          id: string | null
          module_id: string | null
          order_number: number | null
          required: boolean | null
          text: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          hint?: string | null
          id?: string | null
          module_id?: string | null
          order_number?: number | null
          required?: boolean | null
          text?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          hint?: string | null
          id?: string | null
          module_id?: string | null
          order_number?: number | null
          required?: boolean | null
          text?: string | null
          type?: string | null
        }
        Relationships: []
      }
      "quiz_questions_backup_2025-04-29T18-12-55-651Z": {
        Row: {
          created_at: string | null
          hint: string | null
          id: string | null
          module_id: string | null
          order_number: number | null
          required: boolean | null
          text: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          hint?: string | null
          id?: string | null
          module_id?: string | null
          order_number?: number | null
          required?: boolean | null
          text?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          hint?: string | null
          id?: string | null
          module_id?: string | null
          order_number?: number | null
          required?: boolean | null
          text?: string | null
          type?: string | null
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
        Relationships: []
      }
      "quiz_respostas_completas_backup_2025-04-29T18-12-42-206Z": {
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
      "quiz_respostas_completas_backup_2025-04-29T18-12-55-660Z": {
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
      quiz_submissions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_module: number
          id: string
          started_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_module?: number
          id?: string
          started_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_module?: number
          id?: string
          started_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      "quiz_submissions_backup_2025-04-29T18-12-42-204Z": {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_module: number | null
          id: string | null
          started_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "quiz_submissions_backup_2025-04-29T18-12-55-657Z": {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_module: number | null
          id: string | null
          started_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
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
          new_user_email: string
          new_user_password: string
          new_user_name: string
          make_admin?: boolean
        }
        Returns: Json
      }
      complete_quiz: {
        Args: { user_id: string }
        Returns: boolean
      }
      create_table_backup: {
        Args: {
          source_table: string
          target_table: string
          backup_reason?: string
        }
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
      get_users_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          user_created_at: string
          user_name: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_quiz_complete: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      list_table_backups: {
        Args: { table_name_pattern: string }
        Returns: string[]
      }
      restore_table_from_backup: {
        Args: { backup_table: string; target_table: string }
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
