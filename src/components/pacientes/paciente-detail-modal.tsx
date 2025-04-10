import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhoneCall, Save, MessageCircle, Loader2, StickyNote, History } from "lucide-react";
import { PacienteDataExtended } from "@/components/pacientes/paciente-card";
import { ContatoTab } from './modal-tabs/ContatoTab';
import { ProcedimentosTab } from './modal-tabs/ProcedimentosTab';
import { WhatsappTabWrapper } from './modal-tabs/WhatsappTabWrapper';
import { HistoricoTab } from './modal-tabs/HistoricoTab';
import { NotasTab } from './modal-tabs/NotasTab';
import { safeFormatDate } from './modal-tabs/utils';
import { ProcedimentoConfig } from "@/components/configuracoes/ProcedimentosSettings";
import { useModalState } from "./modal-hooks/useModalState";

interface PacienteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: PacienteDataExtended | null;
  onSave: (updatedPaciente: PacienteDataExtended) => Promise<void>;
  configuredProcedures: ProcedimentoConfig[];
}

export function PacienteDetailModal({
  open,
  onOpenChange,
  paciente: initialPaciente,
  onSave,
  configuredProcedures,
}: PacienteDetailModalProps) {
  // Use the custom hook to manage state and handlers
  const {
    activeTab,
    setActiveTab,
    paciente,
    isSaving,
    availableDoctors,
    hospitalsData,
    consultores,
    handleInputChange,
    handleMarketingInputChange,
    handleProcedureInputChange,
    handleHospitalChange,
    handleDoctorChange,
    handleCall,
    addProcedimento,
    deleteProcedimento,
    handleSaveChanges,
    handleStatusChange,
    handleAgendarReagendar,
    handleAddNota
  } = useModalState({
    initialPaciente,
    open,
    onSave,
    onOpenChange
  });

  if (!open) return null;
  
  if (!paciente) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle className="text-xl">Carregando...</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const hospitalNames = Object.keys(hospitalsData).filter(name => name !== "");
  const formattedNascimento = safeFormatDate(paciente.dataNascimento, "yyyy-MM-dd");
  const formattedMarketingIndicacao = safeFormatDate(paciente.marketingData?.dataIndicacao, "yyyy-MM-dd");
  const formattedMarketingEvento = safeFormatDate(paciente.marketingData?.dataEvento, "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">{paciente.nome}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCall} title="Ligar (Pendente)">
                <PhoneCall className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSaveChanges} disabled={isSaving} title="Salvar Alterações">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ModalTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          paciente={paciente}
          handleInputChange={handleInputChange}
          handleMarketingInputChange={handleMarketingInputChange}
          handleProcedureInputChange={handleProcedureInputChange}
          handleHospitalChange={handleHospitalChange}
          handleDoctorChange={handleDoctorChange}
          handleAgendarReagendar={handleAgendarReagendar}
          handleStatusChange={handleStatusChange}
          handleAddNota={handleAddNota}
          addProcedimento={addProcedimento}
          deleteProcedimento={deleteProcedimento}
          availableDoctors={availableDoctors}
          hospitalNames={hospitalNames}
          formattedNascimento={formattedNascimento}
          formattedMarketingIndicacao={formattedMarketingIndicacao}
          formattedMarketingEvento={formattedMarketingEvento}
          configuredProcedures={configuredProcedures}
          consultores={consultores}
        />
      </DialogContent>
    </Dialog>
  );
}

// Internal component to handle the tabs
function ModalTabs({
  activeTab,
  setActiveTab,
  paciente,
  handleInputChange,
  handleMarketingInputChange,
  handleProcedureInputChange,
  handleHospitalChange,
  handleDoctorChange,
  handleAgendarReagendar,
  handleStatusChange,
  handleAddNota,
  addProcedimento,
  deleteProcedimento,
  availableDoctors,
  hospitalNames,
  formattedNascimento,
  formattedMarketingIndicacao,
  formattedMarketingEvento,
  configuredProcedures,
  consultores
}) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0 overflow-hidden px-6 pb-6">
      <TabsList className="grid grid-cols-5 mb-4 shrink-0">
        <TabsTrigger value="contato">Contato</TabsTrigger>
        <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
        <TabsTrigger value="whatsapp">
          <MessageCircle className="h-4 w-4 mr-1"/> WhatsApp
        </TabsTrigger>
        <TabsTrigger value="notas">
          <StickyNote className="h-4 w-4 mr-1"/> Notas
        </TabsTrigger>
        <TabsTrigger value="historico">
          <History className="h-4 w-4 mr-1"/> Histórico
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto mt-0">
        <TabsContent value="contato" className="mt-0 space-y-6 focus-visible:ring-0">
          <ContatoTab
            paciente={paciente}
            handleInputChange={handleInputChange}
            handleMarketingInputChange={handleMarketingInputChange}
            handleHospitalChange={handleHospitalChange}
            handleDoctorChange={handleDoctorChange}
            availableDoctors={availableDoctors}
            hospitalNames={hospitalNames}
            formattedNascimento={formattedNascimento}
            formattedMarketingIndicacao={formattedMarketingIndicacao}
            formattedMarketingEvento={formattedMarketingEvento}
            consultores={consultores}
          />
        </TabsContent>

        <TabsContent value="procedimentos" className="mt-0 space-y-4 focus-visible:ring-0">
          <ProcedimentosTab
            paciente={paciente}
            handleProcedureInputChange={handleProcedureInputChange}
            handleStatusChange={handleStatusChange}
            handleAgendarReagendar={handleAgendarReagendar}
            addProcedimento={addProcedimento}
            deleteProcedimento={deleteProcedimento}
            configuredProcedures={configuredProcedures}
            medicos={availableDoctors}
          />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-0 flex-1 flex flex-col min-h-0 focus-visible:ring-0">
          <WhatsappTabWrapper
            paciente={paciente}
            isActiveTab={activeTab === 'whatsapp'}
          />
        </TabsContent>

        <TabsContent value="notas" className="mt-0 h-full focus-visible:ring-0">
          <NotasTab
            paciente={paciente}
            onAddNota={handleAddNota}
          />
        </TabsContent>

        <TabsContent value="historico" className="mt-0 space-y-4 focus-visible:ring-0">
          <HistoricoTab paciente={paciente} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
