export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
          social_links: Json | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
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
      diagnostic_requests: {
        Row: {
          company_name: string | null
          company_size: string | null
          completed_date: string | null
          created_at: string | null
          current_revenue: string | null
          desired_results: string | null
          email: string
          id: string
          lead_id: string | null
          main_challenge: string | null
          metadata: Json | null
          name: string
          phone: string
          report_generated: boolean | null
          scheduled_date: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_revenue?: string | null
          desired_results?: string | null
          email: string
          id?: string
          lead_id?: string | null
          main_challenge?: string | null
          metadata?: Json | null
          name: string
          phone: string
          report_generated?: boolean | null
          scheduled_date?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_revenue?: string | null
          desired_results?: string | null
          email?: string
          id?: string
          lead_id?: string | null
          main_challenge?: string | null
          metadata?: Json | null
          name?: string
          phone?: string
          report_generated?: boolean | null
          scheduled_date?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      event_leads: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
          instagram: string | null
          lecture_date: string | null
          lecture_id: string | null
          material_sent: boolean
          name: string
          notes: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          instagram?: string | null
          lecture_date?: string | null
          lecture_id?: string | null
          material_sent?: boolean
          name: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          instagram?: string | null
          lecture_date?: string | null
          lecture_id?: string | null
          material_sent?: boolean
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_leads_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      image_placeholders: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string | null
          id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          lead_source: string
          metadata: Json | null
          name: string | null
          notes: string | null
          phone: string
          qualification: string | null
          service_interest: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_conversation_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_source?: string
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone: string
          qualification?: string | null
          service_interest?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_conversation_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_source?: string
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string
          qualification?: string | null
          service_interest?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_conversation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_whatsapp_conversation_id_fkey"
            columns: ["whatsapp_conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      lectures: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          speaker: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          speaker?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          speaker?: string | null
          title?: string
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
          question_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          question_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          question_text?: string | null
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
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_submission_details"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "quiz_answers_question_text_fkey"
            columns: ["question_text"]
            isOneToOne: true
            referencedRelation: "quiz_questions"
            referencedColumns: ["text"]
          },
          {
            foreignKeyName: "quiz_answers_question_text_fkey"
            columns: ["question_text"]
            isOneToOne: true
            referencedRelation: "quiz_responses_flat"
            referencedColumns: ["question_text"]
          },
          {
            foreignKeyName: "quiz_answers_question_text_fkey"
            columns: ["question_text"]
            isOneToOne: true
            referencedRelation: "quiz_submission_details"
            referencedColumns: ["question_text"]
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
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_submission_details"
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
          module_tittle: string | null
          order_number: number
          required: boolean
          text: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id: string
          module_tittle?: string | null
          order_number: number
          required?: boolean
          text?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          module_id?: string
          module_tittle?: string | null
          order_number?: number
          required?: boolean
          text?: string | null
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
      quiz_respostas_completas: {
        Row: {
          company_name: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          m1_cargo: string | null
          m1_email: string | null
          m1_empresa: string | null
          m1_nome: string | null
          m1_telefone: string | null
          m2_faturamento: string | null
          m2_funcionarios: string | null
          m2_localizacao: string | null
          m2_segmento: string | null
          m2_site: string | null
          m2_tempo_atuacao: string | null
          m3_instagram_concorrente_a: string | null
          m3_instagram_concorrente_b: string | null
          m3_instagram_concorrente_c: string | null
          m3_instagram_empresa: string | null
          m3_presenca_digital: string | null
          m3_principais_canais: string | null
          m4_acoes_marketing: string | null
          m4_atuais_campanhas: string | null
          m4_desafios_atuais: string | null
          m4_investimento_marketing: string | null
          m5_canais_vendas: string | null
          m5_equipe_comercial: string | null
          m5_estrategia_comercial: string | null
          m5_metas_vendas: string | null
          m5_processo_vendas: string | null
          m5_sistema_crm: string | null
          m6_expectativas: string | null
          m6_prazo_resultados: string | null
          m6_principais_desafios: string | null
          m6_resultados_esperados: string | null
          m7_como_conheceu: string | null
          m7_detalhes_adicionais: string | null
          m7_preferencia_contato: string | null
          submission_id: string | null
          updated_at: string | null
          user_id: string
          webhook_processed: boolean | null
        }
        Insert: {
          company_name?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          m1_cargo?: string | null
          m1_email?: string | null
          m1_empresa?: string | null
          m1_nome?: string | null
          m1_telefone?: string | null
          m2_faturamento?: string | null
          m2_funcionarios?: string | null
          m2_localizacao?: string | null
          m2_segmento?: string | null
          m2_site?: string | null
          m2_tempo_atuacao?: string | null
          m3_instagram_concorrente_a?: string | null
          m3_instagram_concorrente_b?: string | null
          m3_instagram_concorrente_c?: string | null
          m3_instagram_empresa?: string | null
          m3_presenca_digital?: string | null
          m3_principais_canais?: string | null
          m4_acoes_marketing?: string | null
          m4_atuais_campanhas?: string | null
          m4_desafios_atuais?: string | null
          m4_investimento_marketing?: string | null
          m5_canais_vendas?: string | null
          m5_equipe_comercial?: string | null
          m5_estrategia_comercial?: string | null
          m5_metas_vendas?: string | null
          m5_processo_vendas?: string | null
          m5_sistema_crm?: string | null
          m6_expectativas?: string | null
          m6_prazo_resultados?: string | null
          m6_principais_desafios?: string | null
          m6_resultados_esperados?: string | null
          m7_como_conheceu?: string | null
          m7_detalhes_adicionais?: string | null
          m7_preferencia_contato?: string | null
          submission_id?: string | null
          updated_at?: string | null
          user_id: string
          webhook_processed?: boolean | null
        }
        Update: {
          company_name?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          m1_cargo?: string | null
          m1_email?: string | null
          m1_empresa?: string | null
          m1_nome?: string | null
          m1_telefone?: string | null
          m2_faturamento?: string | null
          m2_funcionarios?: string | null
          m2_localizacao?: string | null
          m2_segmento?: string | null
          m2_site?: string | null
          m2_tempo_atuacao?: string | null
          m3_instagram_concorrente_a?: string | null
          m3_instagram_concorrente_b?: string | null
          m3_instagram_concorrente_c?: string | null
          m3_instagram_empresa?: string | null
          m3_presenca_digital?: string | null
          m3_principais_canais?: string | null
          m4_acoes_marketing?: string | null
          m4_atuais_campanhas?: string | null
          m4_desafios_atuais?: string | null
          m4_investimento_marketing?: string | null
          m5_canais_vendas?: string | null
          m5_equipe_comercial?: string | null
          m5_estrategia_comercial?: string | null
          m5_metas_vendas?: string | null
          m5_processo_vendas?: string | null
          m5_sistema_crm?: string | null
          m6_expectativas?: string | null
          m6_prazo_resultados?: string | null
          m6_principais_desafios?: string | null
          m6_resultados_esperados?: string | null
          m7_como_conheceu?: string | null
          m7_detalhes_adicionais?: string | null
          m7_preferencia_contato?: string | null
          submission_id?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_respostas_completas_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses_flat"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "quiz_respostas_completas_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "quiz_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          completed: boolean
          completed_at: string | null
          contact_consent: boolean
          created_at: string
          current_module: number
          email: string | null
          id: string
          started_at: string
          updated_at: string
          user_id: string
          webhook_processed: boolean | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          created_at?: string
          current_module?: number
          email?: string | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id: string
          webhook_processed?: boolean | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          contact_consent?: boolean
          created_at?: string
          current_module?: number
          email?: string | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
          webhook_processed?: boolean | null
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
          name: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          conversation_status: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_qualification: string | null
          metadata: Json | null
          phone_number: string
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_status?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_qualification?: string | null
          metadata?: Json | null
          phone_number: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_status?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_qualification?: string | null
          metadata?: Json | null
          phone_number?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string
          id: string
          media_url: string | null
          message_id: string | null
          message_type: string | null
          metadata: Json | null
          phone_number: string
          status: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone_number: string
          status?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone_number?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      quiz_submission_details: {
        Row: {
          answer: string | null
          question_id: string | null
          question_text: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_admin_role: {
        Args: { admin_user_id: string }
        Returns: boolean
      }
      check_and_migrate_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_if_user_is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      complete_quiz_submission: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_table_if_not_exists: {
        Args: { table_name: string; table_definition: string }
        Returns: undefined
      }
      execute_sql: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_system_setting: {
        Args: { setting_key: string }
        Returns: string
      }
      get_user_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
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
        Args: { material_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_quiz_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      link_user_to_asaas_customer: {
        Args: { user_email: string; asaas_email: string }
        Returns: boolean
      }
      process_quiz_completion: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_asaas_customers_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      setup_subscriptions_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
