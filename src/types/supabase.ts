import type { Database } from '@/integrations/supabase/types';

// Tipos para as tabelas
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Hospital = Database['public']['Tables']['hospitais']['Row'];
export type Medico = Database['public']['Tables']['medicos']['Row'];
export type Convenio = Database['public']['Tables']['convenios']['Row'];
export type ProcedimentoConfig = Database['public']['Tables']['procedimentos_config']['Row'];
export type FonteMarketing = Database['public']['Tables']['fontes_marketing']['Row'];
export type Paciente = Database['public']['Tables']['pacientes']['Row'];
export type ProcedimentoPaciente = Database['public']['Tables']['procedimentos_paciente']['Row'];
export type Nota = Database['public']['Tables']['notas']['Row'];
export type HistoricoItem = Database['public']['Tables']['historico']['Row'];

// Tipos para as enumerações
export type NivelAcesso = Database['public']['Enums']['nivel_acesso'];
export type OrigemTipo = Database['public']['Enums']['origem_tipo'];
export type StatusProcedimento = Database['public']['Enums']['status_procedimento'];
export type TipoProcedimento = Database['public']['Enums']['tipo_procedimento'];
export type TipoHistorico = Database['public']['Enums']['tipo_historico'];
