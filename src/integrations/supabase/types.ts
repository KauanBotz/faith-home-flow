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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      casas_fe: {
        Row: {
          bairro: string | null
          campus: string
          cep: string | null
          cidade: string | null
          created_at: string
          dias_semana: string[]
          email: string
          email_dupla: string | null
          endereco: string
          facilitador_1_batizado: boolean | null
          facilitador_2_batizado: boolean | null
          geracao: string
          horario_reuniao: string
          id: string
          nome_anfitriao: string | null
          nome_dupla: string | null
          nome_lider: string
          numero_casa: string | null
          numero_documento: string | null
          ponto_referencia: string | null
          rede: string
          rede_facilitador_1: string | null
          rede_facilitador_2: string | null
          rede_minc_facilitador_1: string | null
          rede_minc_facilitador_2: string | null
          rua_avenida: string | null
          telefone: string
          telefone_dupla: string | null
          tipo_documento: string | null
          updated_at: string
          user_id: string
          whatsapp_anfitriao: string | null
        }
        Insert: {
          bairro?: string | null
          campus: string
          cep?: string | null
          cidade?: string | null
          created_at?: string
          dias_semana?: string[]
          email: string
          email_dupla?: string | null
          endereco: string
          facilitador_1_batizado?: boolean | null
          facilitador_2_batizado?: boolean | null
          geracao?: string
          horario_reuniao: string
          id?: string
          nome_anfitriao?: string | null
          nome_dupla?: string | null
          nome_lider: string
          numero_casa?: string | null
          numero_documento?: string | null
          ponto_referencia?: string | null
          rede: string
          rede_facilitador_1?: string | null
          rede_facilitador_2?: string | null
          rede_minc_facilitador_1?: string | null
          rede_minc_facilitador_2?: string | null
          rua_avenida?: string | null
          telefone: string
          telefone_dupla?: string | null
          tipo_documento?: string | null
          updated_at?: string
          user_id: string
          whatsapp_anfitriao?: string | null
        }
        Update: {
          bairro?: string | null
          campus?: string
          cep?: string | null
          cidade?: string | null
          created_at?: string
          dias_semana?: string[]
          email?: string
          email_dupla?: string | null
          endereco?: string
          facilitador_1_batizado?: boolean | null
          facilitador_2_batizado?: boolean | null
          geracao?: string
          horario_reuniao?: string
          id?: string
          nome_anfitriao?: string | null
          nome_dupla?: string | null
          nome_lider?: string
          numero_casa?: string | null
          numero_documento?: string | null
          ponto_referencia?: string | null
          rede?: string
          rede_facilitador_1?: string | null
          rede_facilitador_2?: string | null
          rede_minc_facilitador_1?: string | null
          rede_minc_facilitador_2?: string | null
          rua_avenida?: string | null
          telefone?: string
          telefone_dupla?: string | null
          tipo_documento?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_anfitriao?: string | null
        }
        Relationships: []
      }
      membros: {
        Row: {
          aceitou_jesus: boolean
          casa_fe_id: string
          created_at: string
          endereco: string
          id: string
          idade: number
          nome_completo: string
          notas: string | null
          reconciliou_jesus: boolean
          telefone: string
          updated_at: string
        }
        Insert: {
          aceitou_jesus?: boolean
          casa_fe_id: string
          created_at?: string
          endereco: string
          id?: string
          idade: number
          nome_completo: string
          notas?: string | null
          reconciliou_jesus?: boolean
          telefone: string
          updated_at?: string
        }
        Update: {
          aceitou_jesus?: boolean
          casa_fe_id?: string
          created_at?: string
          endereco?: string
          id?: string
          idade?: number
          nome_completo?: string
          notas?: string | null
          reconciliou_jesus?: boolean
          telefone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_casa_fe_id_fkey"
            columns: ["casa_fe_id"]
            isOneToOne: false
            referencedRelation: "casas_fe"
            referencedColumns: ["id"]
          },
        ]
      }
      oracoes: {
        Row: {
          casa_fe_id: string
          created_at: string
          data_oracao: string
          id: string
          pedido: string
        }
        Insert: {
          casa_fe_id: string
          created_at?: string
          data_oracao?: string
          id?: string
          pedido: string
        }
        Update: {
          casa_fe_id?: string
          created_at?: string
          data_oracao?: string
          id?: string
          pedido?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracoes_casa_fe_id_fkey"
            columns: ["casa_fe_id"]
            isOneToOne: false
            referencedRelation: "casas_fe"
            referencedColumns: ["id"]
          },
        ]
      }
      palavra_pastor: {
        Row: {
          conteudo: string
          created_at: string
          data_publicacao: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_publicacao?: string
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_publicacao?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          created_at: string
          data_reuniao: string
          id: string
          membro_id: string
          presente: boolean
        }
        Insert: {
          created_at?: string
          data_reuniao: string
          id?: string
          membro_id: string
          presente?: boolean
        }
        Update: {
          created_at?: string
          data_reuniao?: string
          id?: string
          membro_id?: string
          presente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          casa_fe_id: string
          created_at: string
          data_reuniao: string
          id: string
          notas: string | null
        }
        Insert: {
          casa_fe_id: string
          created_at?: string
          data_reuniao: string
          id?: string
          notas?: string | null
        }
        Update: {
          casa_fe_id?: string
          created_at?: string
          data_reuniao?: string
          id?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_casa_fe_id_fkey"
            columns: ["casa_fe_id"]
            isOneToOne: false
            referencedRelation: "casas_fe"
            referencedColumns: ["id"]
          },
        ]
      }
      testemunhos: {
        Row: {
          casa_fe_id: string
          created_at: string
          data_testemunho: string
          id: string
          nome_pessoa: string
          testemunho: string
        }
        Insert: {
          casa_fe_id: string
          created_at?: string
          data_testemunho?: string
          id?: string
          nome_pessoa: string
          testemunho: string
        }
        Update: {
          casa_fe_id?: string
          created_at?: string
          data_testemunho?: string
          id?: string
          nome_pessoa?: string
          testemunho?: string
        }
        Relationships: [
          {
            foreignKeyName: "testemunhos_casa_fe_id_fkey"
            columns: ["casa_fe_id"]
            isOneToOne: false
            referencedRelation: "casas_fe"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
