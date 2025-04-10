import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PacienteHistorico } from '@/components/pacientes/paciente-card';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface HistoricoItemProps {
  historico: PacienteHistorico;
}

export const HistoricoItem: React.FC<HistoricoItemProps> = ({ historico }) => {
  const formattedDate = formatDistance(
    new Date(historico.created_at),
    new Date(),
    { addSuffix: true, locale: ptBR }
  );
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  const userInitials = historico.usuario_nome ? getInitials(historico.usuario_nome) : 'U';
  
  return (
    <Card className="mb-3 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 mt-0.5">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 flex-1">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{historico.usuario_nome || "Usuário"}</div>
              <time className="text-xs text-muted-foreground">{formattedDate}</time>
            </div>
            <div className="text-muted-foreground text-xs">{historico.tipo}</div>
            <p className="text-sm">{historico.descricao}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
