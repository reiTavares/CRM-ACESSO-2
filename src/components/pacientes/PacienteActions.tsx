import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { PacienteDataExtended, PacienteProcedimento } from './paciente-card';
import { Hospital, Medico } from '@/types/supabase';
import { useFetchData } from './FetchDataContext';
import { useNewPaciente } from '@/hooks/useNewPaciente';
import { useUpdatePaciente } from '@/hooks/useUpdatePaciente';
import { useProcedimentosUpdate } from '@/hooks/useProcedimentosUpdate';
import { usePatientNotes } from '@/hooks/usePatientNotes';

interface PacienteActionsProps {
  hospitais: Hospital[];
  medicos: Medico[];
  currentUserId: string;
}

export const usePacienteActions = ({
  hospitais,
  medicos,
  currentUserId
}: PacienteActionsProps) => {
  const { toast } = useToast();
  const { fetchData, selectedFunnelId } = useFetchData();

  // Use our new hooks
  const { handleNewPaciente } = useNewPaciente({
    hospitais,
    medicos,
    currentUserId,
    selectedFunnelId,
    fetchData
  });

  const { updatePacienteData, fetchOriginalPacienteData } = useUpdatePaciente({
    hospitais,
    medicos,
    selectedFunnelId
  });

  const { updateExistingProcedimentos, addNewProcedimentos, deleteProcedimento } = useProcedimentosUpdate({
    hospitais,
    medicos
  });

  const { addNewNotas, addNewHistorico, fetchHistorico, fetchNotas } = usePatientNotes({
    currentUserId
  });

  const handleSavePaciente = async (updatedPaciente: PacienteDataExtended): Promise<void> => {
    console.log("Saving:", updatedPaciente);

    try {
      // Fetch the original patient data to compare changes
      const originalPacienteDbData = await fetchOriginalPacienteData(updatedPaciente.id);
      
      // First load historico and notas to compare with the updatedPaciente data
      const historico = await fetchHistorico(updatedPaciente.id);
      const notas = await fetchNotas(updatedPaciente.id);
      
      // Update the main patient data
      await updatePacienteData(updatedPaciente);

      // Handle notes if there are any new ones
      if (updatedPaciente.notas) {
        const existingNotaIds = notas.map(n => n.id);
        const newNotas = updatedPaciente.notas.filter(
          n => !existingNotaIds.includes(n.id)
        );

        if (newNotas.length > 0) {
          console.log(`Adding ${newNotas.length} new notes`);
          await addNewNotas(updatedPaciente.id, newNotas);
        }
      }

      // Handle history entries if there are any new ones
      if (updatedPaciente.historico) {
        const existingHistoricoIds = historico.map(h => h.id);
        const newHistorico = updatedPaciente.historico.filter(
          h => !existingHistoricoIds.includes(h.id)
        );

        if (newHistorico.length > 0) {
          console.log(`Adding ${newHistorico.length} new history entries`);
          await addNewHistorico(updatedPaciente.id, newHistorico);
        }
      }

      // Handle procedures
      if (updatedPaciente.procedimentos) {
        // Add new procedures
        const originalProcIds = originalPacienteDbData.procedimentos?.map(p => p.id.toString()) || [];
        const newProcs = updatedPaciente.procedimentos.filter(
          p => !p.id || !originalProcIds.includes(p.id.toString())
        );

        if (newProcs.length > 0) {
          console.log(`Adding ${newProcs.length} new procedures`);
          await addNewProcedimentos(updatedPaciente.id, newProcs);
        }

        // Update existing procedures
        const existingProcs = updatedPaciente.procedimentos.filter(
          p => p.id && originalProcIds.includes(p.id.toString())
        );

        if (existingProcs.length > 0) {
          console.log(`Updating ${existingProcs.length} existing procedures`);
          await updateExistingProcedimentos(
            updatedPaciente.id,
            existingProcs,
            originalPacienteDbData.procedimentos || []
          );
        }
        
        // Check for deleted procedures
        const updatedProcIds = updatedPaciente.procedimentos.map(p => p.id?.toString()).filter(Boolean) as string[];
        const deletedProcIds = originalProcIds.filter(id => !updatedProcIds.includes(id.toString()));
        
        if (deletedProcIds.length > 0) {
          console.log(`Deleting ${deletedProcIds.length} procedures`);
          for (const procId of deletedProcIds) {
            await deleteProcedimento(parseInt(procId));
          }
        }
      }

      toast({ title: "Alterações Salvas" });

      // Reload data to ensure consistency
      fetchData();

    } catch (error: any) {
      console.error("Erro ao salvar paciente:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: error.message || ''
      });
      throw error;
    }
  };

  return {
    handleNewPaciente,
    handleSavePaciente
  };
};
