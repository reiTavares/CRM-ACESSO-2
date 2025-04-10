import { useModalCoreState } from './useModalCoreState';
import { useModalDataDependencies } from './useModalDataDependencies';
import { useModalInputHandlers } from './useModalInputHandlers';
import { useModalActionHandlers } from './useModalActionHandlers';
import { PacienteDataExtended } from '../paciente-card';
import { useToast } from '@/hooks/use-toast';
import { usePatientNotes } from '@/hooks/usePatientNotes';
import { useUpdatePaciente } from '@/hooks/useUpdatePaciente';
import { useProcedimentosUpdate } from '@/hooks/useProcedimentosUpdate';
import { useAuth } from '@/hooks/useAuth';

interface UseModalStateProps {
  initialPaciente: PacienteDataExtended | null;
  open: boolean;
  onSave: (updatedPaciente: PacienteDataExtended) => Promise<void>; // Keep the original onSave prop
  onOpenChange: (open: boolean) => void;
}

export const useModalState = ({
  initialPaciente,
  open,
  onSave: originalOnSave, // Rename original prop
  onOpenChange
}: UseModalStateProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUserId = user?.id || 'system';

  // --- Core State ---
  const {
    activeTab,
    setActiveTab,
    paciente,
    setPaciente,
    isSaving,
    setIsSaving,
  } = useModalCoreState({ initialPaciente, open });

  // --- Data Dependencies ---
  const {
    hospitais,
    medicos,
    profiles,
    consultores,
    availableDoctors,
    hospitalsData,
    hospitalNames,
  } = useModalDataDependencies({ paciente });

  // --- Input Handlers ---
  const {
    handleInputChange,
    handleMarketingInputChange,
    handleProcedureInputChange,
    handleHospitalChange,
    handleDoctorChange,
  } = useModalInputHandlers({ setPaciente, hospitais, medicos });

  // --- Database Interaction Hooks ---
  const { fetchOriginalPacienteData, updatePacienteData } = useUpdatePaciente({
    hospitais,
    medicos,
    selectedFunnelId: paciente?.funnelId || 1, // Use patient's funnel or default
  });

  const { addNewProcedimentos, updateExistingProcedimentos, deleteProcedimento } = useProcedimentosUpdate({
    hospitais,
    medicos,
  });

  const { addNewNotas, addNewHistorico, fetchHistorico, fetchNotas } = usePatientNotes({
    currentUserId,
  });

  // --- Enhanced Save Logic ---
  const handleSaveWithDetails = async (updatedPaciente: PacienteDataExtended) => {
    setIsSaving(true);
    try {
      // 1. Fetch original data for comparison
      const originalPacienteDbData = await fetchOriginalPacienteData(updatedPaciente.id);
      const originalHistorico = await fetchHistorico(updatedPaciente.id);
      const originalNotas = await fetchNotas(updatedPaciente.id);

      // 2. Update main patient data
      await updatePacienteData(updatedPaciente);

      // 3. Handle Notas (Add only new ones)
      const existingNotaIds = originalNotas.map(n => n.id.toString());
      const newNotas = (updatedPaciente.notas || []).filter(
        n => !existingNotaIds.includes(n.id.toString())
      );
      if (newNotas.length > 0) {
        await addNewNotas(updatedPaciente.id, newNotas);
      }

      // 4. Handle Historico (Add only new ones)
      const existingHistoricoIds = originalHistorico.map(h => h.id.toString());
      const newHistorico = (updatedPaciente.historico || []).filter(
        h => !existingHistoricoIds.includes(h.id.toString())
      );
      if (newHistorico.length > 0) {
        await addNewHistorico(updatedPaciente.id, newHistorico);
      }

      // 5. Handle Procedimentos
      const originalProcIds = (originalPacienteDbData.procedimentos || []).map(p => p.id.toString());
      const currentProcs = updatedPaciente.procedimentos || [];

      // 5a. Add New Procedures
      const procsToAdd = currentProcs.filter(p => !p.id || !originalProcIds.includes(p.id.toString()));
      if (procsToAdd.length > 0) {
        await addNewProcedimentos(updatedPaciente.id, procsToAdd);
      }

      // 5b. Update Existing Procedures
      const procsToUpdate = currentProcs.filter(p => p.id && originalProcIds.includes(p.id.toString()));
      if (procsToUpdate.length > 0) {
        await updateExistingProcedimentos(
          updatedPaciente.id,
          procsToUpdate,
          originalPacienteDbData.procedimentos || []
        );
      }

      // 5c. Delete Removed Procedures
      const currentProcIds = currentProcs.map(p => p.id?.toString()).filter(Boolean) as string[];
      const procsToDeleteIds = originalProcIds.filter(id => !currentProcIds.includes(id));
      if (procsToDeleteIds.length > 0) {
        for (const procId of procsToDeleteIds) {
          await deleteProcedimento(parseInt(procId));
        }
      }

      // Call the original onSave passed from the parent (e.g., for closing modal)
      await originalOnSave(updatedPaciente);

      toast({ title: "Alterações Salvas com Sucesso" });

    } catch (error: any) {
      console.error("Erro detalhado ao salvar paciente:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: error.message || 'Ocorreu um erro ao salvar as alterações.'
      });
      // Optionally re-throw or handle the error further
      // throw error;
    } finally {
      setIsSaving(false);
    }
  };


  // --- Action Handlers (using the enhanced save logic) ---
  const {
    handleCall,
    addProcedimento,
    deleteProcedimento: deleteProcedimentoHandler, // Rename to avoid conflict
    handleStatusChange,
    handleAgendarReagendar,
    handleAddNota,
  } = useModalActionHandlers({
    paciente,
    setPaciente,
    onSave: handleSaveWithDetails, // Pass the enhanced save function
    setActiveTab,
  });

  // Expose all necessary states and handlers
  return {
    activeTab,
    setActiveTab,
    paciente,
    isSaving,
    availableDoctors,
    hospitalsData,
    hospitalNames,
    consultores,
    handleInputChange,
    handleMarketingInputChange,
    handleProcedureInputChange,
    handleHospitalChange,
    handleDoctorChange,
    handleCall,
    addProcedimento,
    deleteProcedimento: deleteProcedimentoHandler, // Expose the renamed handler
    handleSaveChanges: () => handleSaveWithDetails(paciente!), // Expose save trigger
    handleStatusChange,
    handleAgendarReagendar,
    handleAddNota,
  };
};
