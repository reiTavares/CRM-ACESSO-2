import React from 'react';
import { formatISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PacienteDataExtended, PacienteHistorico, PacienteProcedimento } from '../paciente-card';
import { StatusProcedimento } from '@/types/supabase';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth to get currentUserId

interface UseModalActionHandlersProps {
  paciente: PacienteDataExtended | null;
  setPaciente: React.Dispatch<React.SetStateAction<PacienteDataExtended | null>>;
  onSave: (updatedPaciente: PacienteDataExtended) => Promise<void>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const useModalActionHandlers = ({
  paciente,
  setPaciente,
  onSave,
  setActiveTab,
}: UseModalActionHandlersProps) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the current user
  const currentUserId = user?.id || 'system'; // Use user ID or fallback

  // Helper to add history entries
  const addHistoryEntry = (tipo: string, descricao: string) => {
    setPaciente(prev => {
      if (!prev) return prev;
      const historyEntry: PacienteHistorico = {
        id: `temp-${Date.now()}-${Math.random()}`, // Ensure unique temp ID
        usuario_id: currentUserId,
        usuario_nome: 'Sistema', // Will be resolved on save or display
        tipo,
        descricao,
        created_at: new Date().toISOString()
      };
      return {
        ...prev,
        historico: [...(prev.historico || []), historyEntry]
      };
    });
  };

  const handleSaveChanges = async () => {
    if (!paciente) return;
    try {
      addHistoryEntry('Alteração', 'Dados do paciente alterados');
      // The actual saving logic is now handled by the onSave prop passed from the main hook
      await onSave(paciente);
    } catch (error) {
      console.error("Error saving changes (handler):", error);
      // Error toast is handled in the main hook's onSave implementation
    }
  };

  const handleCall = () => {
    if (!paciente?.telefone) return;
    addHistoryEntry('Ligação', `Tentativa de ligação para ${paciente.telefone}`);
    toast({ description: "Função de ligação a ser implementada" });
  };

  const addProcedimento = () => {
    setPaciente(prev => {
      if (!prev) return prev;
      const newProc: PacienteProcedimento = {
        id: `temp-${Date.now()}`,
        tipo: 'Consulta',
        procedimento: '',
        hospital: prev.hospital || '',
        hospital_id: prev.hospital_id,
        medico: prev.medico || '',
        medico_id: prev.medico_id,
        valor: 0,
        data: null,
        status: 'pendente',
        observacao: '',
        convenio: ''
      };
      addHistoryEntry('Procedimento', 'Novo procedimento adicionado');
      return {
        ...prev,
        procedimentos: [...(prev.procedimentos || []), newProc]
      };
    });
  };

  const deleteProcedimento = (index: number) => {
    setPaciente(prev => {
      if (!prev?.procedimentos) return prev;
      const procedimentoToDelete = prev.procedimentos[index];
      const updatedProcedimentos = prev.procedimentos.filter((_, i) => i !== index);
      addHistoryEntry('Procedimento', `Procedimento removido: ${procedimentoToDelete.tipo} - ${procedimentoToDelete.procedimento || 'Sem descrição'}`);
      return {
        ...prev,
        procedimentos: updatedProcedimentos
      };
    });
  };

  const handleStatusChange = (procedimentoId: string, status: StatusProcedimento) => {
    setPaciente(prev => {
      if (!prev?.procedimentos) return prev;
      let originalStatus = '';
      const updatedProcs = prev.procedimentos.map(proc => {
        if (proc.id === procedimentoId) {
          originalStatus = proc.status; // Capture original status before update
          return { ...proc, status };
        }
        return proc;
      });
      if (originalStatus && originalStatus !== status) {
        addHistoryEntry('Status', `Status do procedimento alterado de ${originalStatus} para ${status}`);
      }
      return { ...prev, procedimentos: updatedProcs };
    });
  };

  const handleAgendarReagendar = (procedimentoId: string) => {
    setActiveTab('procedimentos');
    addHistoryEntry('Agendamento', `Tentativa de agendar/reagendar procedimento ID: ${procedimentoId}`);
    toast({
      title: "Agendamento/Reagendamento",
      description: "Selecione uma nova data e hora para o procedimento.",
    });
  };

  const handleAddNota = (texto: string) => {
    setPaciente(prev => {
      if (!prev) return prev;
      const newNota = {
        id: `temp-${Date.now()}`,
        usuario_id: currentUserId,
        usuario_nome: 'Você', // Placeholder
        texto,
        created_at: formatISO(new Date())
      };
      addHistoryEntry('Acompanhamento', `Nova nota adicionada: ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`);
      return {
        ...prev,
        notas: [...(prev.notas || []), newNota]
      };
    });
  };

  return {
    handleSaveChanges,
    handleCall,
    addProcedimento,
    deleteProcedimento,
    handleStatusChange,
    handleAgendarReagendar,
    handleAddNota,
  };
};
