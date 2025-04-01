import React, { forwardRef } from "react"; // Import forwardRef
      import { User, Building, User2, CreditCard, Phone, BookText, Stethoscope, GripVertical } from "lucide-react"; // Added GripVertical
      import { Button } from "@/components/ui/button";
      import { Card, CardContent } from "@/components/ui/card";
      import { useState, useEffect } from "react";
      import { PacienteDetailModal } from "@/components/pacientes/paciente-detail-modal";
      import { cn } from "@/lib/utils";
      import { ApiConfig } from "@/contexts/ApiConfigContext";
      import type { DraggableSyntheticListeners } from '@dnd-kit/core'; // Import type
      import type { Transform } from '@dnd-kit/utilities'; // Import type

      export interface PacienteData {
        id: string;
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
        status: string;
      }

      interface PacienteCardProps extends React.HTMLAttributes<HTMLDivElement> { // Extend HTMLDivElement attributes
        paciente: PacienteData;
        apiConfig: ApiConfig | null;
        // Add props from useSortable
        listeners?: DraggableSyntheticListeners;
        // style?: React.CSSProperties; // Already included via HTMLAttributes
        // ref?: React.Ref<HTMLDivElement>; // Already included via HTMLAttributes
      }

      // Use forwardRef to pass the ref down to the Card element
      export const PacienteCard = forwardRef<HTMLDivElement, PacienteCardProps>(
          ({ paciente, className, apiConfig, listeners, style, ...props }, ref) => {
          const [showDetails, setShowDetails] = useState(false);

          useEffect(() => {
              console.log(`[PacienteCard ${paciente.id}] Received apiConfig prop:`, apiConfig);
          }, [apiConfig, paciente.id]);

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
            "Novo": "card-status-novo",
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

          // Prevent modal opening when dragging
          const handleCardClick = (e: React.MouseEvent) => {
              // A simple check: if the target or its parent has drag handle attributes, likely dragging
              const targetElement = e.target as HTMLElement;
              if (targetElement.closest('[role="button"][aria-describedby^="DndDescribedBy"]')) {
                  return; // Don't open modal if clicking the drag handle area
              }
              setShowDetails(true);
          };


          return (
            <>
              {/* Apply ref, style, and props from useSortable */}
              <Card
                ref={ref} // Apply the ref here
                style={style} // Apply the style here
                className={cn(
                    "relative overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-grab", // Use cursor-grab
                    className
                )}
                onClick={handleCardClick} // Use custom click handler
                {...props} // Pass down other props like attributes from useSortable
              >
                {/* Status Indicator */}
                <div
                  className={cn("card-status", currentStatusClass)}
                  title={status}
                />
                {/* Drag Handle (Optional but recommended for clarity) */}
                <div
                    {...listeners} // Apply listeners ONLY to the handle
                    className="absolute top-1 right-1 p-1 text-muted-foreground hover:bg-accent rounded cursor-grab active:cursor-grabbing"
                    aria-label="Mover paciente"
                    title="Mover paciente"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking handle
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                <CardContent className="pt-4 px-4 pb-3"> {/* Adjusted padding */}
                  <div className="space-y-3 mr-6"> {/* Add margin to avoid overlap with handle */}
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

              <PacienteDetailModal
                open={showDetails}
                onOpenChange={setShowDetails}
                paciente={paciente}
                apiConfig={apiConfig}
              />
            </>
          );
        }
      );

      PacienteCard.displayName = "PacienteCard"; // Add display name for forwardRef
