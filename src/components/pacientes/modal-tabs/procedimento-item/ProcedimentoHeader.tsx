import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Assuming Badge is used for status or type
import { Trash2, Check, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PacienteProcedimento } from '@/components/pacientes/paciente-card';

interface ProcedimentoHeaderProps {
  procedimento: PacienteProcedimento;
  onDelete?: () => void; // Make onDelete optional and pass it directly
  canDelete?: boolean; // Add permission check if needed
}

export const ProcedimentoHeader: React.FC<ProcedimentoHeaderProps> = ({
  procedimento,
  onDelete,
  canDelete = true // Default to true or pass actual permission
}) => {

  const getStatusIndicator = () => {
    switch (procedimento.status) {
      case "ganho":
        return <Check className="h-4 w-4" />;
      case "perdido":
      case "cancelado": // Treat cancelado visually like perdido
        return <AlertTriangle className="h-4 w-4" />;
      case "agendado":
        return <Calendar className="h-4 w-4" />;
      default: // pendente
        return null; // Or some other indicator for pending
    }
  };

  const getStatusBgColor = () => {
    switch (procedimento.status) {
      case "ganho":
        return "bg-green-500 text-white";
      case "perdido":
      case "cancelado":
        return "bg-red-500 text-white";
      case "agendado":
        return "bg-blue-500 text-white";
      default: // pendente
        return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    }
  };


  return (
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h3 className="font-medium">{procedimento.procedimento || "Novo Procedimento"}</h3>
        <p className="text-sm text-muted-foreground">{procedimento.tipo}</p>
      </div>

      <div className="flex items-center space-x-2">
        {/* Status indicator */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          getStatusBgColor()
        )}>
          {getStatusIndicator()}
        </div>

        {/* Delete button */}
        {onDelete && canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Excluir Procedimento"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
