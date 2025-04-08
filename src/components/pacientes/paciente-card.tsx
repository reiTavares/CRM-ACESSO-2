import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DraggableAttributes } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ApiConfig } from '@/contexts/ApiConfigContext';
import { User, PhoneCall, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PacienteData {
  id: string;
  nome: string;
  hospital: string;
  medico?: string;
  convenio?: string;
  telefone: string;
  dataNascimento: Date | null;
  cpf?: string;
  telefone2?: string;
  email?: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  origem: 'Publicidade Digital' | 'Publicidade Tradicional' | 'Indicação' | 'Evento';
  marketingData?: any;
  gestorResponsavel?: string;
  consultorResponsavel?: string;
  status: string;
}

export interface ProcedimentoData {
  id: string;
  tipo: string;
  procedimento: string;
  hospital: string;
  medico?: string;
  valor: number;
  data: Date | null;
  observacao?: string;
  convenio?: string;
  status: 'pendente' | 'agendado' | 'ganho' | 'perdido';
}

export interface HistoricoData {
  id: string;
  data: Date;
  tipo: string;
  descricao: string;
  usuario: string;
}

export interface NotaData {
  id: string;
  texto: string;
  data: Date;
  usuario: string;
  anexo?: string;
}

export interface PacienteDataExtended extends PacienteData {
  procedimentos?: ProcedimentoData[];
  historico?: HistoricoData[];
  valor?: number;
  notas?: NotaData[];
  quemCriou?: string;
}

interface PacienteCardProps {
  paciente: PacienteDataExtended;
  apiConfig: ApiConfig | null;
  onOpenModal: (paciente: PacienteDataExtended) => void;
}

export function PacienteCard({ paciente, apiConfig, onOpenModal }: PacienteCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: paciente.id,
      data: { paciente },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className={cn(
      "cursor-grab hover:shadow-md transition-shadow duration-200",
      isDragging ? 'opacity-50' : 'opacity-100'
    )}>
      <CardContent className="p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{paciente.nome}</h3>
          {paciente.status && (
            <Badge variant="secondary" className="text-xs">{paciente.status}</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-2">
          <User className="h-3.5 w-3.5" />
          <span>{paciente.hospital}</span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-2">
          <PhoneCall className="h-3.5 w-3.5" />
          <span>{paciente.telefone}</span>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onOpenModal(paciente)}>
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
