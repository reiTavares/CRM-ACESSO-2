import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { HistoricoItem } from './HistoricoItem';

interface HistoricoTabProps {
  paciente: PacienteDataExtended;
}

export const HistoricoTab: React.FC<HistoricoTabProps> = ({ paciente }) => {
  const historicoItems = paciente.historico || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="font-medium">Histórico de Ações</h3>
      </div>
      
      {historicoItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum registro de histórico.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2 pr-4">
            {historicoItems.map((historico, idx) => (
              <HistoricoItem key={historico.id || idx} historico={historico} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
