import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { StatusProcedimento } from '@/types/supabase';

interface ProcedimentoStatusActionsProps {
  procedimentoId: string | number | undefined;
  currentStatus: StatusProcedimento;
  onStatusChange: (procedimentoId: string, status: StatusProcedimento) => void;
  onAgendarReagendar: (procedimentoId: string) => void;
}

export const ProcedimentoStatusActions: React.FC<ProcedimentoStatusActionsProps> = ({
  procedimentoId,
  currentStatus,
  onStatusChange,
  onAgendarReagendar,
}) => {

  const handleStatusClick = (newStatus: StatusProcedimento) => {
    if (procedimentoId) {
      onStatusChange(procedimentoId.toString(), newStatus);
    }
  };

  const handleRescheduleClick = () => {
    if (procedimentoId) {
      onAgendarReagendar(procedimentoId.toString());
    }
  };

  return (
    <div className="mt-4">
      <Label className="block mb-2">Status</Label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentStatus === "ganho" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusClick("ganho")}
          className="gap-1"
          disabled={!procedimentoId}
        >
          {currentStatus === "ganho" && <Check className="h-4 w-4" />}
          Ganho
        </Button>

        <Button
          variant={currentStatus === "perdido" || currentStatus === "cancelado" ? "destructive" : "outline"}
          size="sm"
          onClick={() => handleStatusClick("perdido")}
          className="gap-1"
          disabled={!procedimentoId}
        >
          {(currentStatus === "perdido" || currentStatus === "cancelado") && <AlertTriangle className="h-4 w-4" />}
          Perdido
        </Button>

        <Button
          variant={currentStatus === "agendado" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handleStatusClick("agendado")}
          className="gap-1"
          disabled={!procedimentoId}
        >
          {currentStatus === "agendado" && <CalendarIcon className="h-4 w-4" />}
          Agendado
        </Button>

        {/* Show Reschedule button only if status is 'agendado' */}
        {currentStatus === "agendado" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRescheduleClick}
            disabled={!procedimentoId}
          >
            Reagendar
          </Button>
        )}
      </div>
    </div>
  );
};
