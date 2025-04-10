import React from 'react';
import { PacienteNota } from '@/components/pacientes/paciente-card';
import { Card, CardContent } from "@/components/ui/card";
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NotaItemProps {
  nota: PacienteNota;
}

export const NotaItem: React.FC<NotaItemProps> = ({ nota }) => {
  // Format the date for display
  const formattedDate = formatDistance(
    new Date(nota.created_at),
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
  
  const userInitials = nota.usuario_nome ? getInitials(nota.usuario_nome) : 'U';
  
  return (
    <Card className="border rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">{nota.usuario_nome || "Usuário"}</p>
              <time className="text-xs text-muted-foreground">{formattedDate}</time>
            </div>
            
            <p className="text-sm whitespace-pre-line">{nota.texto}</p>
            
            {nota.anexo_path && (
              <a 
                href={nota.anexo_path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-primary hover:underline"
              >
                Ver anexo
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
