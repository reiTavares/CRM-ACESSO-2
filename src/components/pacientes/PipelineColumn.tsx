import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { PacienteCard, PacienteDataExtended } from './paciente-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiConfig } from '@/contexts/ApiConfigContext';

interface PipelineColumnProps {
  id: string;
  label: string;
  pacientes: PacienteDataExtended[];
  apiConfig: ApiConfig;
  totalConsulta: number;
  totalExame: number;
  totalCirurgia: number;
  showTotals: boolean;
  onOpenPacienteModal: (paciente: PacienteDataExtended) => void;
  searchTerm?: string;
}

export function PipelineColumn({
  id,
  label,
  pacientes,
  apiConfig,
  totalConsulta,
  totalExame,
  totalCirurgia,
  showTotals,
  onOpenPacienteModal,
  searchTerm,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const isFiltering = !!searchTerm?.trim();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "pipeline-column flex-shrink-0 w-[300px] h-full flex flex-col rounded-md overflow-hidden border-2 border-transparent", // Added border-transparent for ring offset
        "transition-colors duration-200 ease-in-out", // Added transition
        isOver
          ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/50 ring-offset-2 ring-offset-background' // Highlight styles when hovering over
          : 'bg-muted/30' // Default background
      )}
    >
      {/* Header */}
      <div className={cn(
          "font-medium text-sm mb-0 px-3 py-3 sticky top-0 z-10 border-b shrink-0",
          isOver ? "bg-primary/10 backdrop-blur-sm" : "bg-muted/80 backdrop-blur-sm" // Adjust header bg slightly on hover too
        )}
      >
        {label}
        <span className="text-xs text-muted-foreground ml-2">
          ({pacientes.length})
        </span>
        {showTotals && (
          <div className="text-xs mt-1 space-y-0.5">
            {totalConsulta > 0 && (<div className="flex justify-between items-center text-blue-600"><span>Consultas:</span><span>R$ {totalConsulta.toLocaleString('pt-BR')}</span></div>)}
            {totalExame > 0 && (<div className="flex justify-between items-center text-purple-600"><span>Exames:</span><span>R$ {totalExame.toLocaleString('pt-BR')}</span></div>)}
            {totalCirurgia > 0 && (<div className="flex justify-between items-center text-green-600"><span>Cirurgias:</span><span>R$ {totalCirurgia.toLocaleString('pt-BR')}</span></div>)}
          </div>
        )}
      </div>

      {/* Content Area with Vertical Scroll */}
      <ScrollArea className="flex-1 h-full pb-4 px-2"> {/* Changed to flex-1 */}
        <div className="space-y-3 pt-3 pb-4"> {/* Adjusted padding */}
          {pacientes.length > 0 ? (
            pacientes.map((paciente) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                apiConfig={apiConfig}
                onOpenModal={() => onOpenPacienteModal(paciente)}
              />
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground p-4">
              Nenhum paciente nesta etapa{isFiltering ? ' (com filtro ativo)' : ''}.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
