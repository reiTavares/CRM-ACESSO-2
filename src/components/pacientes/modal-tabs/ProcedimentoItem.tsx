import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PacienteProcedimento } from '@/components/pacientes/paciente-card';
import { ProcedimentoConfig } from '@/components/configuracoes/ProcedimentosSettings';
import { StatusProcedimento } from '@/types/supabase';

// Import sub-components
import { ProcedimentoHeader } from './procedimento-item/ProcedimentoHeader';
import { ProcedimentoFormFields } from './procedimento-item/ProcedimentoFormFields';
import { ProcedimentoObservacao } from './procedimento-item/ProcedimentoObservacao';
import { ProcedimentoStatusActions } from './procedimento-item/ProcedimentoStatusActions';

interface ProcedimentoItemProps {
  procedimento: PacienteProcedimento;
  index: number;
  onProcedureInputChange: (index: number, field: string, value: any) => void;
  onStatusChange: (procedimentoId: string, status: StatusProcedimento) => void;
  onAgendarReagendar: (procedimentoId: string) => void;
  configuredProcedures: ProcedimentoConfig[];
  medicos: { id: string | number, nome: string }[];
  hospital_id?: number | null; // Pass hospital_id for filtering
  onDelete?: (index: number) => void; // Pass delete handler
}

export const ProcedimentoItem: React.FC<ProcedimentoItemProps> = ({
  procedimento,
  index,
  onProcedureInputChange,
  onStatusChange,
  onAgendarReagendar,
  configuredProcedures,
  medicos,
  hospital_id,
  onDelete,
}) => {

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(index);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <ProcedimentoHeader
          procedimento={procedimento}
          onDelete={handleDeleteClick}
          // Add canDelete prop if needed based on user role
        />

        <ProcedimentoFormFields
          procedimento={procedimento}
          index={index}
          onProcedureInputChange={onProcedureInputChange}
          configuredProcedures={configuredProcedures}
          medicos={medicos}
          hospital_id={hospital_id}
        />

        <ProcedimentoObservacao
          index={index}
          value={procedimento.observacao}
          onChange={onProcedureInputChange}
        />

        <ProcedimentoStatusActions
          procedimentoId={procedimento.id}
          currentStatus={procedimento.status}
          onStatusChange={onStatusChange}
          onAgendarReagendar={onAgendarReagendar}
        />
      </CardContent>
    </Card>
  );
};
