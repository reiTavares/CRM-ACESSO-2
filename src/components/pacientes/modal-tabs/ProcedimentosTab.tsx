import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { ProcedimentoItem } from './ProcedimentoItem';
import { safeFormatDate } from './utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcedimentoConfig } from '@/components/configuracoes/ProcedimentosSettings';
import { StatusProcedimento } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProcedimentosTabProps {
  paciente: PacienteDataExtended;
  handleProcedureInputChange: (procIndex: number, field: string, value: any) => void;
  handleStatusChange: (procedimentoId: string, status: StatusProcedimento) => void;
  handleAgendarReagendar: (procedimentoId: string) => void;
  addProcedimento: () => void;
  deleteProcedimento?: (index: number) => void;
  configuredProcedures: ProcedimentoConfig[];
  medicos: { id: string | number, nome: string }[];
}

export const ProcedimentosTab: React.FC<ProcedimentosTabProps> = ({
  paciente,
  handleProcedureInputChange,
  handleStatusChange,
  handleAgendarReagendar,
  addProcedimento,
  deleteProcedimento,
  configuredProcedures,
  medicos,
}) => {
  const procedimentos = paciente.procedimentos || [];
  const { toast } = useToast();

  const handleEditProcedimento = (index: number) => {
    console.log(`Editando procedimento no índice ${index}`);
  };

  const handleDeleteProcedimento = (index: number) => {
    if (deleteProcedimento) {
      deleteProcedimento(index);
      toast({
        description: "Procedimento removido"
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center sticky top-0 bg-background py-2 z-10 border-b mb-4">
        <h3 className="text-lg font-medium">Procedimentos</h3>
        <Button onClick={addProcedimento} size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
      </div>
      {procedimentos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum procedimento cadastrado.</div>
      ) : (
        <ScrollArea className="h-[calc(100%-8rem)] pr-4">
          <div className="space-y-6 pb-4">
            {procedimentos.map((procedimento, index) => {
              const formattedProcDate = safeFormatDate(procedimento.data, "yyyy-MM-dd");
              return (
                <ProcedimentoItem
                  key={procedimento.id || `proc-item-${index}`}
                  procedimento={procedimento}
                  index={index}
                  onProcedureInputChange={handleProcedureInputChange}
                  onStatusChange={handleStatusChange}
                  onAgendarReagendar={handleAgendarReagendar}
                  formattedProcDate={formattedProcDate}
                  configuredProcedures={configuredProcedures}
                  onEdit={() => handleEditProcedimento(index)}
                  onDelete={handleDeleteProcedimento}
                  medicos={medicos}
                  hospital_id={paciente.hospital_id}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
    </>
  );
};
