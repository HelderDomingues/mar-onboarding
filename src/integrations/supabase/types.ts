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
      asaas_customers: {
        Row: {
          asaas_id: string | null
          cpf_cnpj: number
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
          telefone: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          asaas_id?: string | null
          cpf_cnpj: number
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          telefone?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          asaas_id?: string | null
          cpf_cnpj?: number
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          telefone?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_logos: {
        Row: {
          created_at: string
          id: string
          logo: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_accesses: {
        Row: {
          accessed_at: string | null
          id: string
          material_id: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          material_id?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          id?: string
          material_id?: string | null
          user_id?: string | null
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
          category: string
          created_at: string | null
          description: string
          file_url: string
          id: string
          plan_level: string
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          category: string
          created_at?: string | null
          description: string
          file_url: string
          id?: string
          plan_level: string
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          category?: string
          created_at?: string | null
          description?: string
          file_url?: string
          id?: string
          plan_level?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_content: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cnpj: string | null
          company_address: string | null
          company_name: string | null
          cpf: string | null
          email: string | null
          full_name: string | null
          has_asaas_customer: boolean | null
          id: string
          phone: string | null
          role: string | null
          social_media: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          cnpj?: string | null
          company_address?: string | null
          company_name?: string | null
          cpf?: string | null
          email?: string | null
          full_name?: string | null
          has_asaas_customer?: boolean | null
          id: string
          phone?: string | null
          role?: string | null
          social_media?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          cnpj?: string | null
          company_address?: string | null
          company_name?: string | null
          cpf?: string | null
          email?: string | null
          full_name?: string | null
          has_asaas_customer?: boolean | null
          id?: string
          phone?: string | null
          role?: string | null
          social_media?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses_flat"
            referencedColumns: ["question_id"]
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_number: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_number?: number
          title?: string
          updated_at?: string
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_number: number
          question_id: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_number?: number
          question_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses_flat"
            referencedColumns: ["question_id"]
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
          required: boolean
          text: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id: string
          order_number: number
          required?: boolean
          text: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id?: string
          order_number?: number
          required?: boolean
          text?: string
          type?: string
          updated_at?: string
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
      quiz_submissions: {
        Row: {
          completed: boolean
          completed_at: string | null
          contact_consent: boolean
          contact_preference: string | null
          created_at: string
          current_module: number
          email: string | null
          id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          contact_preference?: string | null
          created_at?: string
          current_module?: number
          email?: string | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          contact_preference?: string | null
          created_at?: string
          current_module?: number
          email?: string | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          asaas_customer_id: string | null
          asaas_payment_link: string | null
          asaas_subscription_id: string | null
          contract_accepted: boolean | null
          contract_accepted_at: string | null
          created_at: string
          current_period_end: string | null
          external_reference: string | null
          id: string
          installments: number | null
          payment_details: Json | null
          payment_id: string | null
          payment_status: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_payment_link?: string | null
          asaas_subscription_id?: string | null
          contract_accepted?: boolean | null
          contract_accepted_at?: string | null
          created_at?: string
          current_period_end?: string | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          payment_details?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          plan_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_payment_link?: string | null
          asaas_subscription_id?: string | null
          contract_accepted?: boolean | null
          contract_accepted_at?: string | null
          created_at?: string
          current_period_end?: string | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          payment_details?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean | null
          company: string
          created_at: string | null
          id: string
          name: string
          role: string
          text: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          company: string
          created_at?: string | null
          id?: string
          name: string
          role: string
          text: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          company?: string
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      quiz_responses_flat: {
        Row: {
          answer: string | null
          company_name: string | null
          completed: boolean | null
          completed_at: string | null
          contact_consent: boolean | null
          email: string | null
          full_name: string | null
          question_id: string | null
          question_text: string | null
          started_at: string | null
          submission_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_admin_role: {
        Args: {
          admin_user_id: string
        }
        Returns: boolean
      }
      check_and_migrate_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_if_user_is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      complete_quiz_submission: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      create_table_if_not_exists: {
        Args: {
          table_name: string
          table_definition: string
        }
        Returns: undefined
      }
      get_system_setting: {
        Args: {
          setting_key: string
        }
        Returns: string
      }
      get_user_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
        }[]
      }
      import_user_from_asaas: {
        Args: {
          p_email: string
          p_nome: string
          p_cpf_cnpj: string
          p_telefone: string
          p_asaas_id: string
          p_password?: string
        }
        Returns: string
      }
      increment_material_access_count: {
        Args: {
          material_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_quiz_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_email: string
            }
            Returns: boolean
          }
      link_user_to_asaas_customer: {
        Args: {
          user_email: string
          asaas_email: string
        }
        Returns: boolean
      }
      setup_asaas_customers_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      setup_subscriptions_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      sync_existing_users: {
        Args: Record<PropertyKey, never>
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
