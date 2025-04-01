import React, { useState, useEffect } from "react";
      import { AppShell } from "@/components/layout/app-shell";
      import { PacienteCard, PacienteData } from "@/components/pacientes/paciente-card";
      import { Button } from "@/components/ui/button";
      import { Input } from "@/components/ui/input";
      import { Plus, Search, GripVertical } from "lucide-react"; // Added GripVertical
      import { useToast } from "@/hooks/use-toast";
      import { ScrollArea } from "@/components/ui/scroll-area";
      import { useApiConfig, ApiConfig } from "@/contexts/ApiConfigContext";
      import {
        DndContext,
        closestCenter,
        PointerSensor,
        KeyboardSensor,
        useSensor,
        useSensors,
        DragEndEvent,
        UniqueIdentifier
      } from '@dnd-kit/core';
      import {
        SortableContext,
        sortableKeyboardCoordinates,
        verticalListSortingStrategy, // Strategy for vertical lists within columns
        useSortable
      } from '@dnd-kit/sortable';
      import { CSS } from '@dnd-kit/utilities';
      import { Badge } from "@/components/ui/badge"; // Import Badge

      // Pipeline stages with IDs matching droppable containers
      const pipelineStages = [
        { id: "lead", label: "Lead Recebido" },
        { id: "tentativa", label: "Tentativa de Contato" },
        { id: "contato", label: "Contato Realizado" },
        { id: "agendamento_consulta", label: "Agendamento de Consulta" },
        { id: "consulta_realizada", label: "Consulta Realizada" },
        { id: "agendamento_exames", label: "Agendamento de Exames" },
        { id: "exames_realizados", label: "Exames Realizados" },
        { id: "agendamento_cirurgia_smc", label: "Agendamento Cirurgia (SMC)" },
        { id: "cirurgia_1_olho", label: "1º Olho - Cirurgia Realizada" },
        { id: "agendamento_cirurgia_2_olho", label: "Agendamento Cirurgia 2º Olho" },
        { id: "cirurgia_2_olho", label: "2º Olho - Cirurgia Realizada" },
        { id: "resgate", label: "Resgate" },
      ];

      // --- Sample Data Generation (Keep as before) ---
      const hospitalsData: Record<string, string[]> = { "HODF": ["Dr. João Silva", "Dra. Ana Costa"], "HO Londrina": ["Dr. Carlos Souza", "Dra. Beatriz Lima"], "HO Maringa": ["Dra. Mariana Ferreira", "Dr. Gustavo Pereira"], "HOA": ["Dr. Lucas Gomes", "Dra. Julia Almeida"] };
      const hospitalNames = Object.keys(hospitalsData);
      const generateCPF = (): string => { const rnd = (n: number) => Math.round(Math.random() * n); const n = Array(9).fill(0).map(() => rnd(9)); let d1 = n.map((v, i) => v * (10 - i)).reduce((acc, v) => acc + v, 0) % 11; d1 = d1 < 2 ? 0 : 11 - d1; n.push(d1); let d2 = n.map((v, i) => v * (11 - i)).reduce((acc, v) => acc + v, 0) % 11; d2 = d2 < 2 ? 0 : 11 - d2; n.push(d2); return `${n.slice(0, 3).join('')}.${n.slice(3, 6).join('')}.${n.slice(6, 9).join('')}-${n.slice(9).join('')}`; };
      const generateBrazilianName = (): string => { const firstNames = ["Ana", "Carlos", "Fernanda", "Lucas", "Mariana", "Pedro", "Sofia", "Thiago"]; const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira"]; return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`; };
      const specificProcedures = [ "Cirurgia de Catarata", "Cirurgia Refrativa", "Consulta Oftalmológica", "Exame OCT", "Exame Topografia", "Tratamento Glaucoma" ];
      const generatePacientes = (count = 60): PacienteData[] => { const pacientes: PacienteData[] = []; for (let i = 0; i < count; i++) { const stageIndex = i % pipelineStages.length; const stageId = pipelineStages[stageIndex].id; const currentHospital = hospitalNames[i % hospitalNames.length]; const doctorsForHospital = hospitalsData[currentHospital]; const currentDoctor = doctorsForHospital[Math.floor(Math.random() * doctorsForHospital.length)]; const birthYear = 1950 + Math.floor(Math.random() * 50); const birthMonth = Math.floor(Math.random() * 12); const birthDay = 1 + Math.floor(Math.random() * 28); pacientes.push({ id: `pac-${i + 1}`, nome: generateBrazilianName(), hospital: currentHospital, medico: currentDoctor, valor: 1000 + Math.floor(Math.random() * 9000), convenio: ["Acesso Oftalmologia", "Bradesco", "Unimed", "SulAmérica", "Particular"][i % 5], telefone: `55119${String(Math.random()).substring(2, 10)}`, dataNascimento: new Date(birthYear, birthMonth, birthDay), cpf: generateCPF(), telefone2: Math.random() > 0.7 ? `55119${String(Math.random()).substring(2, 10)}` : undefined, email: Math.random() > 0.4 ? `paciente.teste${i + 1}@email.com` : undefined, uf: ["SP", "RJ", "MG", "PR"][i % 4], cidade: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba"][i % 4], bairro: ["Centro", "Jardins", "Copacabana", "Savassi"][i % 4], origem: ["Publicidade Digital", "Evento", "Indicação"][i % 3], marketingData: {}, procedimentos: Array(1 + Math.floor(Math.random() * 2)).fill(null).map((_, j) => { const procedureName = specificProcedures[Math.floor(Math.random() * specificProcedures.length)]; const procedureType = procedureName.includes("Consulta") ? "Consulta" : procedureName.includes("Exame") ? "Exame" : "Cirurgia"; const procedureStatus = ["pendente", "ganho", "perdido"][Math.floor(Math.random() * 3)]; const procYear = 2023 + Math.floor(Math.random() * 2); const procMonth = Math.floor(Math.random() * 12); const procDay = 1 + Math.floor(Math.random() * 28); return { id: `proc-${i + 1}-${j + 1}`, tipo: procedureType, hospital: currentHospital, medico: currentDoctor, procedimento: procedureName, valor: 300 + Math.floor(Math.random() * 4700), data: new Date(procYear, procMonth, procDay), observacao: Math.random() > 0.8 ? `Obs ${j + 1}` : "", convenio: ["Acesso Oftalmologia", "Bradesco", "Unimed"][i % 3], status: procedureStatus, } }), historico: Array(1 + Math.floor(Math.random() * 3)).fill(null).map((_, j) => { const histYear = 2023 + Math.floor(Math.random() * 2); const histMonth = Math.floor(Math.random() * 12); const histDay = 1 + Math.floor(Math.random() * 28); const histHour = Math.floor(Math.random() * 24); const histMin = Math.floor(Math.random() * 60); return { id: `hist-${i + 1}-${j + 1}`, data: new Date(histYear, histMonth, histDay, histHour, histMin), tipo: ["Ligação", "Status", "Criação"][j % 3], descricao: `Histórico ${j + 1}.`, usuario: ["Admin", "Consultor"][j % 2], }; }).sort((a, b) => b.data.getTime() - a.data.getTime()), status: pipelineStages[stageIndex].label // Use label for initial status matching
          }); } return pacientes; };
      const initialPacientesData = generatePacientes(60);
      // --- End Sample Data Generation ---

      // --- Draggable Patient Card Component ---
      interface DraggablePacienteCardProps {
        paciente: PacienteData;
        apiConfig: ApiConfig | null;
      }

      const DraggablePacienteCard: React.FC<DraggablePacienteCardProps> = ({ paciente, apiConfig }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging, // Use isDragging for styling
        } = useSortable({ id: paciente.id }); // Use paciente.id as the sortable ID

        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1, // Make card semi-transparent while dragging
          zIndex: isDragging ? 10 : undefined, // Bring card to front while dragging
          // cursor: isDragging ? 'grabbing' : 'grab', // Cursor is handled by the handle now
        };

        return (
          <div ref={setNodeRef} style={style} {...attributes} >
            {/* Pass listeners ONLY to the handle element inside PacienteCard */}
            <PacienteCard
              paciente={paciente}
              apiConfig={apiConfig}
              listeners={listeners} // Pass listeners down
            />
          </div>
        );
      };
      // --- End Draggable Patient Card Component ---


      const Pacientes = () => {
        const [searchTerm, setSearchTerm] = useState("");
        const { toast } = useToast();
        const { apiConfig } = useApiConfig();
        const [pacientesList, setPacientesList] = useState<PacienteData[]>(initialPacientesData); // Manage patients in state

        useEffect(() => {
            console.log("[Pacientes Page] Received apiConfig from context:", apiConfig);
            if (!apiConfig?.apiUrl || !apiConfig?.apiKey || !apiConfig?.apiInstance) {
                console.warn("[Pacientes Page] API Config from context seems incomplete.");
            }
        }, [apiConfig]);

        const sensors = useSensors(
          useSensor(PointerSensor, {
              // Require the mouse to move by 10 pixels before starting a drag
              // Helps prevent unwanted drags when clicking on elements inside the card
              activationConstraint: {
                  distance: 10,
              },
          }),
          useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
          })
        );

        const handleAddNewPaciente = () => {
          toast({
            title: "Funcionalidade em desenvolvimento",
            description: "O cadastro de novos pacientes estará disponível em breve.",
          });
        };

        // Filter patients based on search term AND stage
        const getFilteredPacientesByStage = (stageLabel: string): PacienteData[] => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          return pacientesList.filter(p =>
            p.status === stageLabel &&
            (!searchTerm ||
              p.nome.toLowerCase().includes(lowerSearchTerm) ||
              p.telefone?.includes(searchTerm) ||
              p.cpf?.includes(searchTerm)
            )
          );
        };

        // --- Drag End Handler ---
        const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;

          // Ensure 'over' is not null and we are dropping onto a SortableContext container
          if (over && active.id !== over.id) {
            const activePacienteId = active.id as string;
            // over.id should be the ID of the SortableContext (stage.id)
            const targetStageId = over.id as string;

            const targetStage = pipelineStages.find(stage => stage.id === targetStageId);

            if (!targetStage) {
              console.error("Target stage not found for ID:", targetStageId);
              // Check if dropped over a card instead of the column
              // Find the stage of the card dropped over
              const overPaciente = pacientesList.find(p => p.id === over.id);
              if (overPaciente) {
                  const overStage = pipelineStages.find(s => s.label === overPaciente.status);
                  if (overStage) {
                      console.log(`Dropped over card ${over.id} in stage ${overStage.label}`);
                      // Re-run logic with the correct stage ID
                      handleDragEnd({ ...event, over: { ...over, id: overStage.id } });
                  } else {
                      console.error("Could not determine stage for card:", over.id);
                  }
              } else {
                  console.error("Could not find target stage or card:", targetStageId, over.id);
              }
              return; // Exit if target stage is invalid
            }

            const newStatus = targetStage.label;

            // Check if the patient is actually changing stage
            const currentPaciente = pacientesList.find(p => p.id === activePacienteId);
            if (currentPaciente && currentPaciente.status === newStatus) {
                console.log(`Patient ${activePacienteId} dropped in the same stage (${newStatus}). No status change.`);
                return; // No need to update if status is the same
            }


            setPacientesList((prevPacientes) => {
              const updatedPacientes = prevPacientes.map(paciente => {
                if (paciente.id === activePacienteId) {
                  console.log(`Moving patient ${activePacienteId} to stage ${newStatus}`);
                  return { ...paciente, status: newStatus };
                }
                return paciente;
              });
              return updatedPacientes;
            });

            toast({
                title: "Paciente Movido",
                description: `Paciente movido para a etapa "${newStatus}". (Alteração local)`,
            });
            // **TODO: Add API call here to persist the status change in the backend**
          } else {
              console.log("Drag ended but not over a valid target or same target:", active, over);
          }
        };
        // --- End Drag End Handler ---

        // --- Sum Calculation ---
        const calculateStageSum = (stageLabel: string): { consulta: number; exame: number; cirurgia: number } => {
            const stagePacientes = pacientesList.filter(p => p.status === stageLabel);
            let sums = { consulta: 0, exame: 0, cirurgia: 0 };

            stagePacientes.forEach(paciente => {
                // Sum based on the *first* procedure's type and value
                if (paciente.procedimentos && paciente.procedimentos.length > 0) {
                    const firstProc = paciente.procedimentos[0];
                    const value = firstProc.valor || 0;
                    if (firstProc.tipo === "Consulta") {
                        sums.consulta += value;
                    } else if (firstProc.tipo === "Exame") {
                        sums.exame += value;
                    } else if (firstProc.tipo === "Cirurgia") {
                        sums.cirurgia += value;
                    }
                }
            });
            return sums;
        };

        const shouldDisplaySum = (stageLabel: string): boolean => {
            const startIndex = pipelineStages.findIndex(s => s.label === "Agendamento de Consulta");
            const currentIndex = pipelineStages.findIndex(s => s.label === stageLabel);
            return startIndex !== -1 && currentIndex !== -1 && currentIndex >= startIndex;
        };
        // --- End Sum Calculation ---

        return (
          <AppShell>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b sticky top-0 bg-background z-20">
                  <div className="container mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <h1 className="text-2xl font-bold">Pacientes</h1>
                      <div className="flex items-center w-full sm:w-auto gap-2">
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar paciente..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleAddNewPaciente}>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="kanban-container flex flex-nowrap h-full">
                    {pipelineStages.map((stage) => {
                      const stagePacientes = getFilteredPacientesByStage(stage.label);
                      const stageSums = shouldDisplaySum(stage.label) ? calculateStageSum(stage.label) : null;
                      const totalStageSum = stageSums ? stageSums.consulta + stageSums.exame + stageSums.cirurgia : 0;

                      return (
                        // Each column is a SortableContext providing the droppable area
                        // Use stage.id as the ID for the droppable container
                        <SortableContext key={stage.id} id={stage.id} items={stagePacientes.map(p => p.id)} strategy={verticalListSortingStrategy}>
                          <div id={stage.id} className="pipeline-column flex-shrink-0 w-[300px]">
                            <div className="font-medium text-sm mb-1 px-1 sticky top-0 bg-muted/80 backdrop-blur-sm z-10 pt-2 pb-1">
                              {stage.label}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({stagePacientes.length})
                              </span>
                              {/* Display Sums */}
                              {stageSums && (
                                <div className="mt-1 text-xs space-y-0.5">
                                   <Badge variant="secondary" className="w-full justify-between font-normal">
                                      <span>Total:</span>
                                      <span>R$ {totalStageSum.toLocaleString('pt-BR')}</span>
                                   </Badge>
                                   {stageSums.consulta > 0 && <Badge variant="outline" className="w-full justify-between font-normal bg-blue-50 border-blue-200 text-blue-800"><span>Consultas:</span> <span>R$ {stageSums.consulta.toLocaleString('pt-BR')}</span></Badge>}
                                   {stageSums.exame > 0 && <Badge variant="outline" className="w-full justify-between font-normal bg-purple-50 border-purple-200 text-purple-800"><span>Exames:</span> <span>R$ {stageSums.exame.toLocaleString('pt-BR')}</span></Badge>}
                                   {stageSums.cirurgia > 0 && <Badge variant="outline" className="w-full justify-between font-normal bg-green-50 border-green-200 text-green-800"><span>Cirurgias:</span> <span>R$ {stageSums.cirurgia.toLocaleString('pt-BR')}</span></Badge>}
                                </div>
                              )}
                            </div>
                            <ScrollArea className="h-[calc(100%-4rem)] pr-2"> {/* Adjust height based on header */}
                              <div className="space-y-3 pt-1 pb-4">
                                {stagePacientes.map((paciente) => (
                                  // Render the draggable card component
                                  <DraggablePacienteCard
                                    key={paciente.id}
                                    paciente={paciente}
                                    apiConfig={apiConfig}
                                  />
                                ))}
                                {stagePacientes.length === 0 && searchTerm && (
                                    <p className="text-center text-sm text-muted-foreground p-4">Nenhum paciente encontrado nesta etapa com o termo "{searchTerm}".</p>
                                )}
                                 {stagePacientes.length === 0 && !searchTerm && (
                                    <p className="text-center text-sm text-muted-foreground p-4">Nenhum paciente nesta etapa.</p>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </SortableContext>
                      );
                    })}
                  </div>
                </div>
              </div>
            </DndContext>
          </AppShell>
        );
      };

      export default Pacientes;
