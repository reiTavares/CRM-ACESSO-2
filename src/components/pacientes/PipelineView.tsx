import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'; // Import closestCenter if needed for collision detection, though not strictly necessary for this fix
import { PipelineColumn } from './PipelineColumn';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PacienteDataExtended } from './paciente-card';
import { ApiConfig } from '@/contexts/ApiConfigContext';
import { useFetchData } from './FetchDataContext';

interface PipelineViewProps {
  pacientes: PacienteDataExtended[]; // Receive original, unfiltered list
  funnelId: number;
  apiConfig: ApiConfig;
  searchTerm: string;
  onOpenPacienteModal: (paciente: PacienteDataExtended) => void;
  refreshPacientes: () => void; // Keep prop in case needed elsewhere, but don't call it here
}

export function PipelineView({
  pacientes, // Use the original list for reverting on error
  funnelId,
  apiConfig,
  searchTerm,
  onOpenPacienteModal,
  refreshPacientes // Keep prop, but avoid calling after drag
}: PipelineViewProps) {
  const { pipelineStages } = useFetchData();
  const { toast } = useToast();
  // Local state holds the potentially modified list for optimistic updates
  const [localPacientes, setLocalPacientes] = useState<PacienteDataExtended[]>([]);

  // Sync local state when the prop changes (e.g., after initial load or external refresh)
  useEffect(() => {
    setLocalPacientes(pacientes);
  }, [pacientes]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const pacienteId = active.id.toString();
      const novoStatus = over.id.toString(); // The ID of the droppable column is the status name

      // Find the patient in the *current local state*
      const pacienteIndex = localPacientes.findIndex(p => p.id === pacienteId);
      if (pacienteIndex === -1) return;

      const pacienteOriginal = localPacientes[pacienteIndex];

      // --- Optimistic UI Update ---
      const updatedLocalPacientes = localPacientes.map(p =>
        p.id === pacienteId ? { ...p, status: novoStatus } : p
      );
      setLocalPacientes(updatedLocalPacientes);
      // ---------------------------

      try {
        // --- Update Database ---
        const { error } = await supabase
          .from('pacientes')
          .update({ status: novoStatus })
          .eq('id', parseInt(pacienteId));

        if (error) {
          // Throw error to be caught below
          throw error;
        }

        // --- Success (Optional Toast) ---
        // toast({
        //   title: "Status Atualizado",
        //   description: `Paciente ${pacienteOriginal.nome} movido para ${novoStatus}.`,
        // });

        // **CRITICAL: Do NOT call refreshPacientes() here**
        // The local state is already updated optimistically.
        // A full refresh would cause the flicker.

      } catch (error: any) {
        console.error("Error updating status:", error);
        toast({
          variant: "destructive",
          title: "Erro ao Atualizar Status",
          description: `Não foi possível mover o paciente ${pacienteOriginal.nome}. (${error.message})`
        });

        // --- Revert Optimistic Update on Error ---
        setLocalPacientes(pacientes); // Revert to the original list passed via props
        // -----------------------------------------
      }
    }
  };

  // Helper function to calculate totals (remains the same)
  const calculateTotals = (filteredPatients: PacienteDataExtended[]) => {
    return filteredPatients.reduce(
      (acc, patient) => {
        const procedimentos = patient.procedimentos || [];
        procedimentos.forEach(proc => {
          const valor = proc.valor || 0;
          if (proc.tipo === 'Consulta') acc.consulta += valor;
          else if (proc.tipo === 'Exame') acc.exame += valor;
          else if (proc.tipo === 'Cirurgia') acc.cirurgia += valor;
        });
        return acc;
      },
      { consulta: 0, exame: 0, cirurgia: 0 }
    );
  };

  // Filter patients based on the *local state* for rendering
  const filteredPacientes = localPacientes.filter(p =>
    (p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefone.includes(searchTerm) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    p.funnelId === funnelId // Filter by funnelId
  );

  return (
    // Use closestCenter or other collision detection if needed for more complex scenarios
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden">
        <div className="flex space-x-4 h-full">
          {pipelineStages.map((stage) => {
            // Filter patients *from the filtered list* for this stage
            const stagePacientes = filteredPacientes.filter(p => p.status === stage.name);
            const totals = calculateTotals(stagePacientes);

            return (
              <PipelineColumn
                key={stage.id}
                id={stage.name} // Use stage name as droppable ID
                label={stage.name}
                pacientes={stagePacientes}
                apiConfig={apiConfig}
                totalConsulta={totals.consulta}
                totalExame={totals.exame}
                totalCirurgia={totals.cirurgia}
                showTotals={true}
                onOpenPacienteModal={onOpenPacienteModal}
                searchTerm={searchTerm}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
