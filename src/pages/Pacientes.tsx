import { useState, useEffect, useMemo } from "react"; // Added useMemo
  import { AppShell } from "@/components/layout/app-shell";
  import { PacienteCard, PacienteData } from "@/components/pacientes/paciente-card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Plus, Search } from "lucide-react";
  import { useToast } from "@/hooks/use-toast";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay, // To show item while dragging
    UniqueIdentifier
  } from '@dnd-kit/core';
  import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy, // Use vertical for columns
    rectSortingStrategy // Or this for grid-like behavior within columns
  } from '@dnd-kit/sortable';
  import { SortablePacienteCard } from "@/components/pacientes/sortable-paciente-card"; // Import the new sortable wrapper

  // Pipeline stages
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

  // Sample data generation (simplified for brevity, keep your detailed generation)
  const hospitalsData: Record<string, string[]> = { "HODF": ["Dr. João Silva", "Dra. Ana Costa"], "HO Londrina": ["Dr. Carlos Souza", "Dra. Beatriz Lima"], /* ... more */ };
  const hospitalNames = Object.keys(hospitalsData);
  const specificProcedures = ["Cirurgia de Catarata", "Consulta Oftalmológica Geral", /* ... more */];
  const consultores = ["Consultor A", "Consultor B", "Consultor C", "Consultor D"]; // Sample consultants

  const generatePacientes = (count = 60): PacienteData[] => {
    const pacientes: PacienteData[] = [];
    for (let i = 0; i < count; i++) {
      const stageIndex = i % pipelineStages.length;
      const stageLabel = pipelineStages[stageIndex].label; // Use label as status
      const currentHospital = hospitalNames[i % hospitalNames.length];
      const doctorsForHospital = hospitalsData[currentHospital];
      const currentDoctor = doctorsForHospital[Math.floor(Math.random() * doctorsForHospital.length)];
      const birthYear = 1950 + Math.floor(Math.random() * 50);
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = 1 + Math.floor(Math.random() * 28);

      pacientes.push({
        id: `pac-${i + 1}`, // Use string IDs
        nome: `Paciente ${i + 1}`, // Simplified name
        hospital: currentHospital,
        medico: currentDoctor,
        valor: 1000 + Math.floor(Math.random() * 9000),
        convenio: ["Acesso Oftalmologia", "Bradesco", "Unimed"][i % 3],
        telefone: `55119${String(Math.random()).substring(2, 10)}`,
        dataNascimento: new Date(birthYear, birthMonth, birthDay),
        cpf: `000.000.${String(100 + i).padStart(3, '0')}-00`, // Simplified CPF
        uf: "SP",
        cidade: "São Paulo",
        bairro: "Centro",
        origem: ["Publicidade Digital", "Evento", "Indicação"][i % 3],
        marketingData: {},
        procedimentos: [{
          id: `proc-${i + 1}-1`,
          tipo: "Consulta",
          hospital: currentHospital,
          medico: currentDoctor,
          procedimento: specificProcedures[i % specificProcedures.length],
          valor: 500 + (i % 500),
          data: new Date(2024, 0, 1 + (i % 28)),
          observacao: "",
          convenio: "Acesso Oftalmologia",
          status: "pendente",
        }],
        historico: [{
          id: `hist-${i + 1}-1`,
          data: new Date(),
          tipo: "Criação",
          descricao: "Paciente criado",
          usuario: "Sistema",
        }],
        status: stageLabel, // Assign stage label as status
        consultorResponsavel: consultores[i % consultores.length], // Assign consultant
      });
    }
    return pacientes;
  };

  // --- API Config Interface (needed if passing props) ---
  export interface ApiConfigProps {
      apiUrl: string;
      apiKey: string;
      apiInstance: string;
  }

  // --- Placeholder for getting API Config ---
  const getApiConfig = (): ApiConfigProps | null => {
      return {
          apiUrl: "https://evo1.profusaodigital.com",
          apiKey: "76777ED82273-4FD5-A172-5E5764FB6F28",
          apiInstance: "Acesso Oftalmologia"
      };
  };
  // --- End Placeholder ---


  const Pacientes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [apiConfig, setApiConfig] = useState<ApiConfigProps | null>(null);
    // --- State for Patients ---
    const [pacientes, setPacientes] = useState<PacienteData[]>(() => generatePacientes(60)); // Initialize state
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null); // For drag overlay

    useEffect(() => {
        const config = getApiConfig();
        setApiConfig(config);
        // Initial toast removed for brevity
    }, []);

    // --- dnd-kit Sensors ---
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // --- Memoize patients grouped by status ---
    const pacientesPorEtapa = useMemo(() => {
        const grouped: { [key: string]: PacienteData[] } = {};
        pipelineStages.forEach(stage => {
            grouped[stage.label] = []; // Initialize each stage
        });
        pacientes.forEach(p => {
            if (grouped[p.status]) {
                grouped[p.status].push(p);
            } else {
                console.warn(`Paciente ${p.id} com status inválido: ${p.status}`);
                // Optionally assign to a default stage or handle differently
            }
        });
        return grouped;
    }, [pacientes]); // Recalculate when pacientes state changes

    // --- Drag Handlers ---
    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null); // Clear active drag item
        const { active, over } = event;

        if (!over) {
            console.log("Drag ended outside a droppable area");
            return; // Dropped outside any valid column
        }

        const activeId = active.id;
        const overId = over.id; // This will be the column ID (stage label)

        // Find the patient being dragged
        const activePaciente = pacientes.find(p => p.id === activeId);
        if (!activePaciente) {
            console.error("Dragged patient not found:", activeId);
            return;
        }

        // The ID of the droppable column (we set it to the stage label)
        const targetStageLabel = overId.toString();

        // Check if the stage is valid
        if (!pipelineStages.some(stage => stage.label === targetStageLabel)) {
            console.error("Invalid target stage:", targetStageLabel);
            return;
        }

        // Only update if dropped in a *different* column
        if (activePaciente.status !== targetStageLabel) {
            console.log(`Moving patient ${activeId} from ${activePaciente.status} to ${targetStageLabel}`);

            setPacientes(prevPacientes => {
                return prevPacientes.map(p =>
                    p.id === activeId ? { ...p, status: targetStageLabel } : p
                );
            });

            toast({
                title: "Paciente Movido",
                description: `${activePaciente.nome} movido para a etapa "${targetStageLabel}".`,
            });

            // --- TODO: Add API call here to persist the status change on your backend ---
            // Example:
            // updatePatientStatusOnServer(activeId, targetStageLabel);
        } else {
            console.log("Dropped in the same column");
            // Handle reordering within the same column if needed (using arrayMove)
            // This requires tracking the original and new index within the column
            // For simplicity, we'll skip intra-column reordering persistence for now.
        }
    };

    const handleAddNewPaciente = () => {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "O cadastro de novos pacientes estará disponível em breve.",
      });
    };

    // Filter patients based on search term (applied per column now)
    const filterPacientes = (pacientesList: PacienteData[]) => {
        if (!searchTerm) {
            return pacientesList;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return pacientesList.filter(p =>
            p.nome.toLowerCase().includes(lowerSearchTerm) ||
            p.telefone?.includes(searchTerm) ||
            p.cpf?.includes(searchTerm)
        );
    };

    // Find the currently dragged patient for the overlay
    const draggedPaciente = activeId ? pacientes.find(p => p.id === activeId) : null;

    return (
      <AppShell>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter} // Or experiment with other strategies
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
              <div className="kanban-container flex flex-nowrap h-full p-4 gap-4"> {/* Added padding and gap */}
                {pipelineStages.map((stage) => {
                  const pacientesNestaEtapa = pacientesPorEtapa[stage.label] || [];
                  const filteredPacientesNestaEtapa = filterPacientes(pacientesNestaEtapa);
                  // Get IDs for SortableContext
                  const pacienteIds = filteredPacientesNestaEtapa.map(p => p.id);

                  return (
                    <div key={stage.id} className="pipeline-column flex flex-col flex-shrink-0 w-[320px] bg-muted/50 rounded-lg"> {/* Fixed width & styling */}
                      <h3 className="font-semibold text-md mb-3 px-3 pt-3 sticky top-0 z-10"> {/* Adjusted styling */}
                        {stage.label}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({filteredPacientesNestaEtapa.length})
                        </span>
                      </h3>
                      <ScrollArea className="flex-1 px-3 pb-3"> {/* Scroll area for cards */}
                        <SortableContext
                          items={pacienteIds}
                          strategy={verticalListSortingStrategy} // How items are arranged
                          id={stage.label} // Use stage label as the droppable ID
                        >
                          <div className="space-y-3 min-h-[50px]"> {/* Min height to ensure drop zone */}
                            {filteredPacientesNestaEtapa.map((paciente) => (
                              <SortablePacienteCard
                                key={paciente.id}
                                id={paciente.id} // Pass ID for dnd-kit
                                paciente={paciente}
                                apiConfig={apiConfig}
                              />
                            ))}
                            {/* Placeholder if empty */}
                            {filteredPacientesNestaEtapa.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed rounded-md">
                                    {searchTerm ? `Nenhum paciente encontrado para "${searchTerm}"` : `Arraste pacientes para cá`}
                                </div>
                            )}
                          </div>
                        </SortableContext>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Drag Overlay: Renders the card being dragged */}
          <DragOverlay>
            {activeId && draggedPaciente ? (
              <PacienteCard paciente={draggedPaciente} apiConfig={apiConfig} className="shadow-xl opacity-95"/>
            ) : null}
          </DragOverlay>
        </DndContext>
      </AppShell>
    );
  };

  export default Pacientes;
