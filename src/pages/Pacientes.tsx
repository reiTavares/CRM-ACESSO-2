import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PipelineView } from '@/components/pacientes/PipelineView';
import { useAuth } from '@/hooks/useAuth';
import { useApiConfig } from '@/contexts/ApiConfigContext';
import { PacienteDetailModal } from '@/components/pacientes/paciente-detail-modal';
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { FetchDataProvider, useFetchData } from '@/components/pacientes/FetchDataContext';
import { usePacienteActions } from '@/components/pacientes/PacienteActions';
import { PacientesHeader } from '@/components/pacientes/PacientesHeader';
import { LoadingState } from '@/components/pacientes/LoadingState';

const PacientesContent: React.FC = () => {
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteDataExtended | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { apiConfig } = useApiConfig();
  const currentUserId = user?.id || '';
  const { pacientes, hospitais, medicos, configuredProcedures, selectedFunnelId, isLoading, fetchData } = useFetchData();
  
  const { handleNewPaciente, handleSavePaciente } = usePacienteActions({
    hospitais,
    medicos,
    currentUserId
  });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">
        <PacientesHeader 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewPaciente={handleNewPaciente}
        />

        <PipelineView
          pacientes={pacientes}
          funnelId={selectedFunnelId}
          apiConfig={apiConfig}
          searchTerm={searchTerm}
          onOpenPacienteModal={setSelectedPaciente}
          refreshPacientes={fetchData}
        />

        {selectedPaciente && (
          <PacienteDetailModal
            paciente={selectedPaciente}
            open={!!selectedPaciente}
            onOpenChange={(open) => !open && setSelectedPaciente(null)}
            onSave={handleSavePaciente}
            configuredProcedures={configuredProcedures}
          />
        )}
      </div>
    </AppShell>
  );
};

export function Pacientes() {
  return (
    <FetchDataProvider>
      <PacientesContent />
    </FetchDataProvider>
  );
}

export default Pacientes;
