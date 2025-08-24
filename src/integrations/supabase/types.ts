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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          data_criacao: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          data_criacao?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          data_criacao?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      attusuarios: {
        Row: {
          business_id: string | null
          consentimento_dados: boolean | null
          data_atualizacao: string | null
          data_criacao: string | null
          data_exclusao: string | null
          email: string
          id: string
          nome: string
          notificacoes_ativas: boolean | null
          preferencias: Json | null
          senha_hash: string | null
          status: string
          tipo_usuario: string
        }
        Insert: {
          business_id?: string | null
          consentimento_dados?: boolean | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_exclusao?: string | null
          email: string
          id?: string
          nome: string
          notificacoes_ativas?: boolean | null
          preferencias?: Json | null
          senha_hash?: string | null
          status?: string
          tipo_usuario?: string
        }
        Update: {
          business_id?: string | null
          consentimento_dados?: boolean | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_exclusao?: string | null
          email?: string
          id?: string
          nome?: string
          notificacoes_ativas?: boolean | null
          preferencias?: Json | null
          senha_hash?: string | null
          status?: string
          tipo_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "attusuarios_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attusuarios_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "comercios_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          comentario: string | null
          comercio_id: string
          data_atualizacao: string | null
          data_criacao: string | null
          estrelas: number
          id: string
          usuario_id: string
        }
        Insert: {
          comentario?: string | null
          comercio_id: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          estrelas: number
          id?: string
          usuario_id: string
        }
        Update: {
          comentario?: string | null
          comercio_id?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          estrelas?: number
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comercios: {
        Row: {
          categoria: string
          cep: string
          cidade: string
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          email: string | null
          endereco: string
          estado: string
          facebook: string | null
          fotos: string[] | null
          horario_funcionamento: Json | null
          id: string
          instagram: string | null
          latitude: number | null
          longitude: number | null
          nome: string
          status: string
          telefone: string | null
          usuario_id: string
          website: string | null
        }
        Insert: {
          categoria: string
          cep: string
          cidade: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          email?: string | null
          endereco: string
          estado: string
          facebook?: string | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          nome: string
          status?: string
          telefone?: string | null
          usuario_id: string
          website?: string | null
        }
        Update: {
          categoria?: string
          cep?: string
          cidade?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string
          estado?: string
          facebook?: string | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          nome?: string
          status?: string
          telefone?: string | null
          usuario_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comercios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          comercio_id: string
          data_criacao: string | null
          id: string
          usuario_id: string
        }
        Insert: {
          comercio_id: string
          data_criacao?: string | null
          id?: string
          usuario_id: string
        }
        Update: {
          comercio_id?: string
          data_criacao?: string | null
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_buscas: {
        Row: {
          categoria: string | null
          cidade: string | null
          data_busca: string | null
          id: string
          termo_busca: string
          usuario_id: string
        }
        Insert: {
          categoria?: string | null
          cidade?: string | null
          data_busca?: string | null
          id?: string
          termo_busca: string
          usuario_id: string
        }
        Update: {
          categoria?: string | null
          cidade?: string | null
          data_busca?: string | null
          id?: string
          termo_busca?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_buscas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_notifications: {
        Row: {
          admin_id: string
          data_agendamento: string | null
          data_atualizacao: string
          data_criacao: string
          data_envio: string | null
          descricao: string
          id: string
          imagem_url: string | null
          lgpd_confirmado: boolean
          link_acao: string | null
          publico_alvo: string
          publico_filtros: Json | null
          status: string
          taxa_cliques: number | null
          taxa_entrega: number | null
          titulo: string
          total_usuarios: number | null
        }
        Insert: {
          admin_id: string
          data_agendamento?: string | null
          data_atualizacao?: string
          data_criacao?: string
          data_envio?: string | null
          descricao: string
          id?: string
          imagem_url?: string | null
          lgpd_confirmado?: boolean
          link_acao?: string | null
          publico_alvo?: string
          publico_filtros?: Json | null
          status?: string
          taxa_cliques?: number | null
          taxa_entrega?: number | null
          titulo: string
          total_usuarios?: number | null
        }
        Update: {
          admin_id?: string
          data_agendamento?: string | null
          data_atualizacao?: string
          data_criacao?: string
          data_envio?: string | null
          descricao?: string
          id?: string
          imagem_url?: string | null
          lgpd_confirmado?: boolean
          link_acao?: string | null
          publico_alvo?: string
          publico_filtros?: Json | null
          status?: string
          taxa_cliques?: number | null
          taxa_entrega?: number | null
          titulo?: string
          total_usuarios?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          data_criacao: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "attusuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          description: string | null
          id: string
          key: string
          value: Json
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          description?: string | null
          id?: string
          key: string
          value: Json
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          description?: string | null
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          comercio_id: string
          data_atualizacao: string | null
          data_criacao: string | null
          data_fim: string
          data_inicio: string
          descricao: string
          id: string
          status: string
          tipo_desconto: string | null
          titulo: string
          valor_desconto: number | null
        }
        Insert: {
          comercio_id: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_fim: string
          data_inicio: string
          descricao: string
          id?: string
          status?: string
          tipo_desconto?: string | null
          titulo: string
          valor_desconto?: number | null
        }
        Update: {
          comercio_id?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string
          id?: string
          status?: string
          tipo_desconto?: string | null
          titulo?: string
          valor_desconto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promocoes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      comercios_stats: {
        Row: {
          id: string | null
          media_estrelas: number | null
          nome: string | null
          total_avaliacoes: number | null
          total_favoritos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_id: string
          email: string
          id: string
          nome: string
          preferencias: Json
          status: string
          tipo_usuario: string
        }[]
      }
      is_superadmin: {
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
