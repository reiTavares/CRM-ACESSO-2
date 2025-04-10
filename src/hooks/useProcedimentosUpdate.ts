import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PacienteProcedimento } from '@/components/pacientes/paciente-card';
import { Hospital, Medico, StatusProcedimento, TipoProcedimento } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProcedimentosUpdateProps {
  hospitais: Hospital[];
  medicos: Medico[];
}

export const useProcedimentosUpdate = ({
  hospitais,
  medicos
}: ProcedimentosUpdateProps) => {
  const { toast } = useToast();

  const findHospitalId = (hospitalName: string): number | null => {
    if (!hospitalName) return null;
    const hospital = hospitais?.find(h => h && h.nome === hospitalName);
    return hospital ? hospital.id : null;
  };
  
  const findMedicoId = (medicoName: string): number | null => {
    if (!medicoName) return null;
    const medico = medicos?.find(m => m && m.nome === medicoName);
    return medico ? medico.id : null;
  };

  // Map our app's StatusProcedimento to valid Supabase enums
  const mapStatusToDatabaseStatus = (status: StatusProcedimento): "pendente" | "agendado" | "ganho" | "perdido" => {
    if (status === "cancelado") {
      return "perdido"; // Map "cancelado" to "perdido" for database compatibility
    }
    return status;
  };
  
  // Map our app's TipoProcedimento to valid Supabase enums
  const mapTipoToDatabaseTipo = (tipo: string): "Consulta" | "Exame" | "Cirurgia" => {
    if (tipo === "Retorno") {
      return "Consulta"; // Map "Retorno" to "Consulta" for database compatibility
    }
    return tipo as "Consulta" | "Exame" | "Cirurgia";
  };

  const updateExistingProcedimentos = async (
    pacienteId: string,
    procedimentos: PacienteProcedimento[],
    originalProcedimentos: PacienteProcedimento[]
  ) => {
    const errors = [];

    for (const proc of procedimentos) {
      try {
        const originalProc = originalProcedimentos.find(op => op.id?.toString() === proc.id?.toString());
        if (!originalProc) continue;

        if (
          proc.tipo === originalProc.tipo &&
          proc.procedimento === originalProc.procedimento &&
          proc.hospital === originalProc.hospital &&
          proc.medico === originalProc.medico &&
          proc.valor === originalProc.valor &&
          proc.data === originalProc.data &&
          proc.status === originalProc.status &&
          proc.observacao === originalProc.observacao &&
          proc.convenio === originalProc.convenio
        ) {
          continue;
        }

        const hospitalId = findHospitalId(proc.hospital);
        const medicoId = findMedicoId(proc.medico);
        
        // Ensure we have a valid tipo for the database
        const tipo = mapTipoToDatabaseTipo(proc.tipo);
        
        // Ensure we have a valid status for the database
        const status = mapStatusToDatabaseStatus(proc.status as StatusProcedimento);
        
        const procId = typeof proc.id === 'string' ? parseInt(proc.id) : proc.id;

        const { error } = await supabase
          .from('procedimentos_paciente')
          .update({
            tipo: tipo,
            descricao_custom: proc.procedimento,
            hospital_realizacao_id: hospitalId,
            medico_realizacao_id: medicoId,
            valor_cobrado: proc.valor,
            data_realizacao: proc.data ? proc.data.toISOString() : null,
            status: status,
            observacao: proc.observacao || null,
            convenio_usado: proc.convenio || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', procId);

        if (error) throw error;
        
      } catch (error: any) {
        console.error(`Error updating procedimento ${proc.id}:`, error);
        errors.push(`Falha ao atualizar ${proc.tipo} - ${proc.procedimento}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Erros ao atualizar procedimentos",
        description: errors.join(", ")
      });
    }

    return errors.length === 0;
  };

  const addNewProcedimentos = async (
    pacienteId: string,
    procedimentos: PacienteProcedimento[]
  ) => {
    if (!procedimentos.length) return true;
    
    const errors = [];

    const newProcs = procedimentos.filter(p => !p.id || p.id.toString().startsWith('temp-'));
    
    for (const proc of newProcs) {
      try {
        if (!proc.tipo || !proc.hospital) continue;

        const hospitalId = findHospitalId(proc.hospital);
        const medicoId = findMedicoId(proc.medico);
        
        // Use our mapping function for tipo
        const tipo = mapTipoToDatabaseTipo(proc.tipo);
        
        // Use our mapping function for status
        const status = mapStatusToDatabaseStatus(proc.status as StatusProcedimento);
        
        // Create the data object with properly typed values for the database
        const newProcData = {
          paciente_id: parseInt(pacienteId),
          tipo: tipo,
          descricao_custom: proc.procedimento,
          hospital_realizacao_id: hospitalId || null,
          medico_realizacao_id: medicoId,
          valor_cobrado: proc.valor || 0,
          data_realizacao: proc.data ? proc.data.toISOString() : null,
          status: status,
          observacao: proc.observacao || null,
          convenio_usado: proc.convenio || null
        };

        const { error } = await supabase
          .from('procedimentos_paciente')
          .insert(newProcData);

        if (error) throw error;
        
      } catch (error: any) {
        console.error(`Error adding procedimento:`, error);
        errors.push(`Falha ao adicionar ${proc.tipo} - ${proc.procedimento}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: "Erros ao adicionar procedimentos",
        description: errors.join(", ")
      });
    }

    return errors.length === 0;
  };

  const deleteProcedimento = async (procedimentoId: number) => {
    try {
      const { error } = await supabase
        .from('procedimentos_paciente')
        .delete()
        .eq('id', procedimentoId);
        
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error deleting procedure:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir procedimento",
        description: error.message
      });
      return false;
    }
  };

  return {
    updateExistingProcedimentos,
    addNewProcedimentos,
    deleteProcedimento
  };
};
