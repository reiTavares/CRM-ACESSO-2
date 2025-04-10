import React from 'react';
import { StatusProcedimento } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ApiConfig } from '@/contexts/ApiConfigContext';
import { Stethoscope, Phone, UserCircle, GripVertical } from 'lucide-react';

export interface PacienteProcedimento {
  id?: string | number;
  tipo: string;
  procedimento: string;
  hospital: string;
  hospital_id?: number | null;
  medico: string;
  medico_id?: number | null;
  valor: number;
  data: Date | null;
  status: StatusProcedimento;
  observacao?: string;
  convenio?: string;
}

export interface PacienteHistorico {
  id: string | number;
  usuario_id: string;
  usuario_nome?: string;
  tipo: string;
  descricao: string;
  created_at: string;
}

export interface PacienteNota {
  id: string | number;
  usuario_id: string;
  usuario_nome?: string;
  texto: string;
  created_at: string;
  anexo_path?: string;
}

export interface PacienteDataExtended {
  id: string;
  nome: string;
  hospital: string;
  hospital_id?: number | null;
  medico: string;
  medico_id?: number | null;
  telefone: string;
  dataNascimento: Date | null;
  cpf?: string;
  telefone2?: string;
  email?: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  status?: string;
  origem?: string;
  funnelId?: number;
  convenio?: string;
  consultorResponsavel?: string;
  consultor_responsavel_id?: string;
  gestorResponsavel?: string;
  gestor_responsavel_id?: string;
  procedimentos?: PacienteProcedimento[];
  historico?: PacienteHistorico[];
  notas?: PacienteNota[];
  valor?: number;
  marketingData?: any;
}

export type PacienteData = PacienteDataExtended;

interface PacienteCardProps {
  paciente: PacienteDataExtended;
  apiConfig: ApiConfig | null;
  onOpenModal?: () => void;
}

export function PacienteCard({ paciente, apiConfig, onOpenModal }: PacienteCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paciente.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
    position: 'relative',
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 0 15px rgba(0, 0, 0, 0.2)' : undefined,
  } as React.CSSProperties : undefined;

  const totalValue = paciente.procedimentos?.reduce((total, proc) => total + (proc.valor || 0), 0) || 0;

  let procedimentoDestaque = "";
  if (paciente.procedimentos?.some(p => p.tipo === "Cirurgia")) {
    procedimentoDestaque = "Cirurgia";
  } else if (paciente.procedimentos?.some(p => p.tipo === "Exame")) {
    procedimentoDestaque = "Exame";
  } else if (paciente.procedimentos?.some(p => p.tipo === "Consulta")) {
    procedimentoDestaque = "Consulta";
  }

  const convenio = paciente.convenio || paciente.procedimentos?.find(p => p.convenio)?.convenio || "";

  const handleContentClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation();
      return;
    }
    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging ? "cursor-grabbing" : "cursor-default"
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className={cn(
          "absolute top-1 right-1 p-1 cursor-grab rounded opacity-50 group-hover:opacity-100 transition-opacity",
          isDragging && "cursor-grabbing opacity-100"
        )}
        title="Arrastar paciente"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div onClick={handleContentClick} className="cursor-pointer hover:bg-accent/50 rounded-lg p-3">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-1">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {paciente.hospital}
            </Badge>
            {procedimentoDestaque && (
              <Badge variant="secondary" className="text-xs">
                {procedimentoDestaque}
              </Badge>
            )}
          </div>

          <h3 className="font-medium text-md leading-tight mb-1 mt-1">{paciente.nome}</h3>

          <div className="text-sm text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              <span className="truncate">{paciente.medico || "Não informado"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5" />
              <span className="truncate">{paciente.consultorResponsavel || "Não atribuído"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span>{paciente.telefone}</span>
            </div>

            {convenio && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">Convênio:</span>
                <span className="truncate">{convenio}</span>
              </div>
            )}
          </div>

          {totalValue > 0 && (
            <div className="mt-2 border-t pt-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Valor Total:</span>
                <span className="text-sm font-medium">
                  R$ {totalValue.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
