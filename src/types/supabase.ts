export type StatusProcedimento = "pendente" | "agendado" | "ganho" | "perdido" | "cancelado";
export type TipoProcedimento = "Consulta" | "Exame" | "Cirurgia" | "Retorno";
export type OrigemTipo = "Publicidade Digital" | "Publicidade Tradicional" | "Indicação" | "Evento";
export type NivelAcesso = "Super Admin" | "Admin" | "Gestor" | "Supervisor" | "Consultor";
export type HistoricoTipo = "Status" | "Agendamento" | "Procedimento" | "Edição" | "Observação" | "Outro" | "Ligação" | "Criação" | "Acompanhamento" | "Alteração";

export interface Hospital {
  id: number;
  nome: string;
  telefone: string;
  cidade: string;
  uf: string;
  created_at: string;
}

export interface Medico {
  id: number;
  nome: string;
  crm: string;
  hospital_id: number;
  especialidade: string;
  telefone: string;
  created_at: string;
}

export interface Funnel {
  id: number;
  name: string;
  description: string;
  created_at: string;
  is_default: boolean;
}

export interface PipelineStage {
  id: number;
  funnel_id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface ProcedimentoPacienteDb {
  id: number;
  paciente_id: number;
  tipo: TipoProcedimento;
  descricao_custom?: string;
  procedimento_config_id?: number;
  hospital_realizacao_id: number;
  medico_realizacao_id?: number;
  valor_cobrado: number;
  data_realizacao?: string;
  status: StatusProcedimento;
  observacao?: string;
  convenio_usado?: string;
  created_at: string;
  updated_at: string;
}
