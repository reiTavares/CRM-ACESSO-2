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
      convenios: {
        Row: {
          created_at: string
          hospital_id: number
          id: number
          nome: string
          tipo: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: number
          id?: number
          nome: string
          tipo?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: number
          id?: number
          nome?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convenios_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_marketing: {
        Row: {
          ativo: boolean
          created_at: string
          id: number
          nome: string
          origem_tipo: Database["public"]["Enums"]["origem_tipo"]
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: number
          nome: string
          origem_tipo: Database["public"]["Enums"]["origem_tipo"]
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: number
          nome?: string
          origem_tipo?: Database["public"]["Enums"]["origem_tipo"]
        }
        Relationships: []
      }
      historico: {
        Row: {
          created_at: string
          descricao: string
          id: number
          paciente_id: number
          tipo: Database["public"]["Enums"]["tipo_historico"]
          usuario_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: number
          paciente_id: number
          tipo: Database["public"]["Enums"]["tipo_historico"]
          usuario_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: number
          paciente_id?: number
          tipo?: Database["public"]["Enums"]["tipo_historico"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitais: {
        Row: {
          contato_agendamento: string | null
          contato_scm: string | null
          created_at: string
          endereco: string | null
          id: number
          nome: string
          responsavel: string | null
          telefone: string | null
        }
        Insert: {
          contato_agendamento?: string | null
          contato_scm?: string | null
          created_at?: string
          endereco?: string | null
          id?: number
          nome: string
          responsavel?: string | null
          telefone?: string | null
        }
        Update: {
          contato_agendamento?: string | null
          contato_scm?: string | null
          created_at?: string
          endereco?: string | null
          id?: number
          nome?: string
          responsavel?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      medicos: {
        Row: {
          created_at: string
          crm: string | null
          hospital_id: number
          id: number
          nome: string
          rqe: string | null
        }
        Insert: {
          created_at?: string
          crm?: string | null
          hospital_id: number
          id?: number
          nome: string
          rqe?: string | null
        }
        Update: {
          created_at?: string
          crm?: string | null
          hospital_id?: number
          id?: number
          nome?: string
          rqe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          anexo_path: string | null
          created_at: string
          id: number
          paciente_id: number
          texto: string
          usuario_id: string
        }
        Insert: {
          anexo_path?: string | null
          created_at?: string
          id?: number
          paciente_id: number
          texto: string
          usuario_id: string
        }
        Update: {
          anexo_path?: string | null
          created_at?: string
          id?: number
          paciente_id?: number
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          bairro: string | null
          cidade: string | null
          consultor_responsavel_id: string
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          foto_perfil_path: string | null
          gestor_responsavel_id: string | null
          hospital_id: number
          id: number
          marketing_info: Json | null
          medico_id: number | null
          nome: string
          origem: Database["public"]["Enums"]["origem_tipo"]
          quem_criou_id: string
          status: string
          telefone: string
          telefone2: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          consultor_responsavel_id: string
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          foto_perfil_path?: string | null
          gestor_responsavel_id?: string | null
          hospital_id: number
          id?: number
          marketing_info?: Json | null
          medico_id?: number | null
          nome: string
          origem: Database["public"]["Enums"]["origem_tipo"]
          quem_criou_id: string
          status: string
          telefone: string
          telefone2?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          consultor_responsavel_id?: string
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          foto_perfil_path?: string | null
          gestor_responsavel_id?: string | null
          hospital_id?: number
          id?: number
          marketing_info?: Json | null
          medico_id?: number | null
          nome?: string
          origem?: Database["public"]["Enums"]["origem_tipo"]
          quem_criou_id?: string
          status?: string
          telefone?: string
          telefone2?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimentos_config: {
        Row: {
          created_at: string
          descricao: string
          hospital_id: number
          id: number
          preco: number
          tipo: Database["public"]["Enums"]["tipo_procedimento"]
        }
        Insert: {
          created_at?: string
          descricao: string
          hospital_id: number
          id?: number
          preco: number
          tipo: Database["public"]["Enums"]["tipo_procedimento"]
        }
        Update: {
          created_at?: string
          descricao?: string
          hospital_id?: number
          id?: number
          preco?: number
          tipo?: Database["public"]["Enums"]["tipo_procedimento"]
        }
        Relationships: [
          {
            foreignKeyName: "procedimentos_config_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimentos_paciente: {
        Row: {
          convenio_usado: string | null
          created_at: string
          data_realizacao: string | null
          descricao_custom: string | null
          hospital_realizacao_id: number
          id: number
          medico_realizacao_id: number | null
          observacao: string | null
          paciente_id: number
          procedimento_config_id: number | null
          status: Database["public"]["Enums"]["status_procedimento"]
          tipo: Database["public"]["Enums"]["tipo_procedimento"]
          updated_at: string
          valor_cobrado: number
        }
        Insert: {
          convenio_usado?: string | null
          created_at?: string
          data_realizacao?: string | null
          descricao_custom?: string | null
          hospital_realizacao_id: number
          id?: number
          medico_realizacao_id?: number | null
          observacao?: string | null
          paciente_id: number
          procedimento_config_id?: number | null
          status: Database["public"]["Enums"]["status_procedimento"]
          tipo: Database["public"]["Enums"]["tipo_procedimento"]
          updated_at?: string
          valor_cobrado: number
        }
        Update: {
          convenio_usado?: string | null
          created_at?: string
          data_realizacao?: string | null
          descricao_custom?: string | null
          hospital_realizacao_id?: number
          id?: number
          medico_realizacao_id?: number | null
          observacao?: string | null
          paciente_id?: number
          procedimento_config_id?: number | null
          status?: Database["public"]["Enums"]["status_procedimento"]
          tipo?: Database["public"]["Enums"]["tipo_procedimento"]
          updated_at?: string
          valor_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "procedimentos_paciente_hospital_realizacao_id_fkey"
            columns: ["hospital_realizacao_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_paciente_medico_realizacao_id_fkey"
            columns: ["medico_realizacao_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_paciente_procedimento_config_id_fkey"
            columns: ["procedimento_config_id"]
            isOneToOne: false
            referencedRelation: "procedimentos_config"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          hospital_id: number | null
          id: string
          nivel_acesso: Database["public"]["Enums"]["nivel_acesso"]
          nome: string
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          hospital_id?: number | null
          id: string
          nivel_acesso: Database["public"]["Enums"]["nivel_acesso"]
          nome: string
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          hospital_id?: number | null
          id?: string
          nivel_acesso?: Database["public"]["Enums"]["nivel_acesso"]
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_access_level: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["nivel_acesso"]
      }
      user_can_access_paciente: {
        Args: { paciente_id_param: number; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      nivel_acesso:
        | "Super Admin"
        | "Admin"
        | "Gestor"
        | "Supervisor"
        | "Consultor"
      origem_tipo:
        | "Publicidade Digital"
        | "Publicidade Tradicional"
        | "Indicação"
        | "Evento"
      status_procedimento: "pendente" | "agendado" | "ganho" | "perdido"
      tipo_historico:
        | "Ligação"
        | "Status"
        | "Procedimento"
        | "Criação"
        | "Acompanhamento"
        | "Alteração"
      tipo_procedimento: "Consulta" | "Exame" | "Cirurgia"
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
    Enums: {
      nivel_acesso: [
        "Super Admin",
        "Admin",
        "Gestor",
        "Supervisor",
        "Consultor",
      ],
      origem_tipo: [
        "Publicidade Digital",
        "Publicidade Tradicional",
        "Indicação",
        "Evento",
      ],
      status_procedimento: ["pendente", "agendado", "ganho", "perdido"],
      tipo_historico: [
        "Ligação",
        "Status",
        "Procedimento",
        "Criação",
        "Acompanhamento",
        "Alteração",
      ],
      tipo_procedimento: ["Consulta", "Exame", "Cirurgia"],
    },
  },
} as const
