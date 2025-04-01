import { User, Building, User2, CreditCard, Phone, BookText, Stethoscope } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import { useState } from "react";
  import { PacienteDetailModal } from "@/components/pacientes/paciente-detail-modal";
  import { cn } from "@/lib/utils";
  import { ApiConfigProps } from "@/pages/Pacientes"; // Import ApiConfigProps if defined in Pacientes.tsx

  export interface PacienteData {
    id: string; // Keep as string for dnd-kit compatibility
    nome: string;
    hospital: string;
    medico: string;
    valor: number;
    convenio: string;
    telefone: string;
    dataNascimento: Date;
    cpf: string;
    telefone2?: string;
    email?: string;
    uf: string;
    cidade: string;
    bairro: string;
    origem: "Publicidade Digital" | "Evento" | "Publicidade Tradicional" | "Indicação";
    marketingData: any;
    procedimentos: {
      id: string;
      tipo: string;
      hospital: string;
      medico: string;
      procedimento: string;
      valor: number;
      data: Date;
      observacao: string;
      convenio: string;
      status: string;
    }[];
    historico: any[];
    status: string; // This will represent the pipeline stage label
    consultorResponsavel?: string; // Added field
  }

  interface PacienteCardProps {
    paciente: PacienteData;
    className?: string;
    apiConfig: ApiConfigProps | null; // Pass API config down
    // Add any other props needed by the card itself (excluding dnd props)
  }

  export function PacienteCard({ paciente, className, apiConfig }: PacienteCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    const statusClass = {
      "Lead Recebido": "bg-gray-400",
      "Tentativa de Contato": "bg-yellow-400",
      "Contato Realizado": "bg-blue-400",
      "Agendamento de Consulta": "bg-cyan-400",
      "Consulta Realizada": "bg-indigo-400",
      "Agendamento de Exames": "bg-purple-400",
      "Exames Realizados": "bg-pink-400",
      "Agendamento Cirurgia (SMC)": "bg-rose-400",
      "1º Olho - Cirurgia Realizada": "bg-green-500",
      "Agendamento Cirurgia 2º Olho": "bg-lime-400",
      "2º Olho - Cirurgia Realizada": "bg-emerald-500",
      "Resgate": "bg-orange-400",
      "Novo": "card-status-novo", // Keep fallbacks just in case
      "Em Negociação": "card-status-negociacao",
      "Finalizado": "card-status-finalizado",
      "Perdido": "card-status-perdido",
      "Atendido": "card-status-atendido",
      "Agendado": "card-status-agendado",
    };

    const procedureToDisplay = paciente.procedimentos?.length > 0
      ? paciente.procedimentos[0].procedimento
      : "N/A";

    const status = paciente.status;
    const currentStatusClass = statusClass[status as keyof typeof statusClass] || 'bg-gray-300';

    return (
      <>
        <Card
          className={cn("relative overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer", className)}
          onClick={() => setShowDetails(true)} // Click opens modal
          // Draggable attributes/listeners will be applied by the wrapper component
        >
          {/* Status Indicator */}
          <div
            className={cn("card-status", currentStatusClass)}
            title={status}
          />
          <CardContent className="pt-4 px-4">
            <div className="space-y-3">
              {/* Hospital */}
              <div className="flex items-center text-xs text-muted-foreground">
                <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="font-medium truncate">{paciente.hospital}</span>
              </div>

              {/* Name */}
              <h3 className="font-medium truncate text-primary">{paciente.nome}</h3>

              {/* Doctor */}
              <div className="flex items-center text-xs text-muted-foreground">
                <User2 className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{paciente.medico}</span>
              </div>

              {/* Consultant */}
              {paciente.consultorResponsavel && (
                <div className="flex items-center text-xs text-muted-foreground pt-1">
                  <User className="h-3 w-3 mr-1 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-blue-600">{paciente.consultorResponsavel}</span>
                </div>
              )}

              {/* Details Section */}
              <div className="space-y-1 border-t pt-2 mt-2">
                {/* Procedure */}
                <div className="flex items-center text-xs">
                   <Stethoscope className="h-3 w-3 mr-1 flex-shrink-0 text-indigo-500" />
                   <span className="font-medium truncate">{procedureToDisplay}</span>
                </div>
                {/* Value */}
                <div className="flex items-center text-xs">
                  <CreditCard className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="font-medium">
                    R$ {typeof paciente.valor === 'number' ? paciente.valor.toLocaleString('pt-BR') : 'N/A'}
                  </span>
                </div>
                {/* Convenio */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <BookText className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{paciente.convenio}</span>
                </div>
                {/* Phone */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{paciente.telefone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal rendering */}
        <PacienteDetailModal
          open={showDetails}
          onOpenChange={setShowDetails}
          paciente={paciente}
          apiConfig={apiConfig} // Pass API config to modal
        />
      </>
    );
  }
