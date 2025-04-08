import React from 'react';
import { PacienteDataExtended, NotaData } from '@/components/pacientes/paciente-card'; // Ajuste o caminho se necessário
import { safeFormatDate } from './utils'; // Reutilizar a função de data segura
import { UserCircle } from 'lucide-react'; // Ícone para usuário

interface NotaItemProps {
  nota: NotaData;
}

export const NotaItem: React.FC<NotaItemProps> = ({ nota }) => {
  return (
    <div className="border rounded-md p-3 shadow-sm bg-background">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-dashed">
        <div className="flex items-center text-xs text-muted-foreground">
          <UserCircle className="h-3.5 w-3.5 mr-1" />
          <span>{nota.usuario || 'Usuário Desconhecido'}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {safeFormatDate(nota.data, "dd/MM/yyyy HH:mm")}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap break-words">
        {nota.texto}
      </p>
    </div>
  );
};
