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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agenda_events: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          has_notification: boolean | null
          id: string
          is_deadline: boolean | null
          notify_email: boolean | null
          notify_whatsapp: boolean | null
          process_number: string | null
          start_date: string
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          has_notification?: boolean | null
          id?: string
          is_deadline?: boolean | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          process_number?: string | null
          start_date: string
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          has_notification?: boolean | null
          id?: string
          is_deadline?: boolean | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          process_number?: string | null
          start_date?: string
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          active: boolean | null
          benefits: string[] | null
          category: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          downloads: number | null
          featured: boolean | null
          features: string[] | null
          full_description: string | null
          id: string
          image_url: string | null
          name: string
          payment_type: string | null
          price: number
          purchase_url: string | null
          rating: number | null
          requirements: string[] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          downloads?: number | null
          featured?: boolean | null
          features?: string[] | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          name: string
          payment_type?: string | null
          price?: number
          purchase_url?: string | null
          rating?: number | null
          requirements?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          downloads?: number | null
          featured?: boolean | null
          features?: string[] | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          payment_type?: string | null
          price?: number
          purchase_url?: string | null
          rating?: number | null
          requirements?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_usuarios: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_sign_in: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_sign_in?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_sign_in?: string | null
        }
        Relationships: []
      }
      calendar_sync_log: {
        Row: {
          action: Database["public"]["Enums"]["sync_action"]
          created_at: string | null
          error_message: string | null
          event_id: string | null
          google_event_id: string | null
          id: string
          status: Database["public"]["Enums"]["sync_status"]
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["sync_action"]
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          google_event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sync_status"]
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["sync_action"]
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          google_event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sync_status"]
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "chat_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          process: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          process?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          process?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          arquivo_url: string | null
          cliente_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          processo: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          processo?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          processo?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          error_message: string
          function_name: string
          id: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          error_message: string
          function_name: string
          id?: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          error_message?: string
          function_name?: string
          id?: string
        }
        Relationships: []
      }
      exemplo: {
        Row: {
          id: number
          nome: string | null
          valor: number | null
        }
        Insert: {
          id?: number
          nome?: string | null
          valor?: number | null
        }
        Update: {
          id?: number
          nome?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      financeiro: {
        Row: {
          categoria: string
          cliente_id: string | null
          comprovante_url: string | null
          created_at: string | null
          data: string
          data_vencimento: string | null
          descricao: string
          id: string
          installments: Json | null
          parcela_atual: number | null
          processo: string | null
          status: string
          tipo: string
          total_parcelas: number | null
          updated_at: string | null
          user_id: string
          valor: number
          valor_parcela: number | null
        }
        Insert: {
          categoria: string
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data: string
          data_vencimento?: string | null
          descricao: string
          id?: string
          installments?: Json | null
          parcela_atual?: number | null
          processo?: string | null
          status: string
          tipo: string
          total_parcelas?: number | null
          updated_at?: string | null
          user_id: string
          valor: number
          valor_parcela?: number | null
        }
        Update: {
          categoria?: string
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data?: string
          data_vencimento?: string | null
          descricao?: string
          id?: string
          installments?: Json | null
          parcela_atual?: number | null
          processo?: string | null
          status?: string
          tipo?: string
          total_parcelas?: number | null
          updated_at?: string | null
          user_id?: string
          valor?: number
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          connected_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          last_sync: string | null
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          last_sync?: string | null
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          last_sync?: string | null
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_chats: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          is_user: boolean
          user_id: string
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_user: boolean
          user_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_user?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_chats_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mercadopago_settings: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          id: string
          public_key: string | null
          test_access_token: string | null
          test_public_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          public_key?: string | null
          test_access_token?: string | null
          test_public_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          public_key?: string | null
          test_access_token?: string | null
          test_public_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      note_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string
          folder_id: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      perfect_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_user: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_user?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_user?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfect_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_juridicos: {
        Row: {
          assunto: string
          client_id: string | null
          created_at: string
          data_inicio: string
          id: string
          numero_processo: string
          observacoes: string | null
          parte_autora: string
          parte_re: string
          prazo: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assunto: string
          client_id?: string | null
          created_at?: string
          data_inicio: string
          id?: string
          numero_processo: string
          observacoes?: string | null
          parte_autora: string
          parte_re: string
          prazo: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assunto?: string
          client_id?: string | null
          created_at?: string
          data_inicio?: string
          id?: string
          numero_processo?: string
          observacoes?: string | null
          parte_autora?: string
          parte_re?: string
          prazo?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_juridicos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_status: {
        Row: {
          ano: number | null
          descricao: string | null
          id: number
          numero_processo: string
          status: string
        }
        Insert: {
          ano?: number | null
          descricao?: string | null
          id?: never
          numero_processo: string
          status: string
        }
        Update: {
          ano?: number | null
          descricao?: string | null
          id?: never
          numero_processo?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assinatura: string | null
          created_at: string | null
          endereco: string | null
          especialidade: string | null
          foto_url: string | null
          id: string
          nome: string | null
          oab: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          assinatura?: string | null
          created_at?: string | null
          endereco?: string | null
          especialidade?: string | null
          foto_url?: string | null
          id: string
          nome?: string | null
          oab?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          assinatura?: string | null
          created_at?: string | null
          endereco?: string | null
          especialidade?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          oab?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          plan_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          plan_name: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          plan_name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          preapproval_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          preapproval_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          preapproval_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      task: {
        Row: {
          color: string | null
          created_at: string | null
          end_time: string
          id: string
          start_time: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      TaskRecord: {
        Row: {
          color: string | null
          created_at: string | null
          end_time: string
          id: string
          is_all_day: boolean | null
          start_time: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean | null
          start_time: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      user_management: {
        Row: {
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          email: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_management_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_management_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "system_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_data: Json
          preference_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_data: Json
          preference_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_data?: Json
          preference_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          data: Json
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          data: Json
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      webhook_logs_kiwify: {
        Row: {
          created_at: string | null
          email: string
          evento: string
          id: string
          processed_at: string | null
          produto: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          evento: string
          id?: string
          processed_at?: string | null
          produto?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          evento?: string
          id?: string
          processed_at?: string | null
          produto?: string | null
        }
        Relationships: []
      }
      webhook_settings: {
        Row: {
          bug_report_webhook_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          bug_report_webhook_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          bug_report_webhook_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      sync_action: "create" | "update" | "delete"
      sync_status: "success" | "failed" | "pending"
      user_role: "comum" | "admin"
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
    Enums: {
      sync_action: ["create", "update", "delete"],
      sync_status: ["success", "failed", "pending"],
      user_role: ["comum", "admin"],
    },
  },
} as const
