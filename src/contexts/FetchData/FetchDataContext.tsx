import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { Hospital, Medico } from '@/types/supabase';
import { Funnel, PipelineStage } from '@/types/funnel';
import { ProcedimentoConfig } from '@/components/configuracoes/ProcedimentosSettings';
import { Profile } from '@/hooks/useProfilesData';

// Import custom hooks
import { useFetchHospitalsMedicos } from './useFetchHospitalsMedicos';
import { useFetchConfiguredProcedures } from './useFetchConfiguredProcedures';
import { useFetchFunnelsStages } from './useFetchFunnelsStages';
import { useFetchProfiles } from './useFetchProfiles';
import { useFetchPacientes } from './useFetchPacientes';

interface FetchDataContextType {
  pacientes: PacienteDataExtended[];
  hospitais: Hospital[];
  medicos: Medico[];
  configuredProcedures: ProcedimentoConfig[];
  funnels: Funnel[];
  pipelineStages: PipelineStage[];
  selectedFunnelId: number | null; // Allow null initially
  profiles: Profile[]; // Add profiles to context
  isLoading: boolean;
  fetchData: () => Promise<void>; // Main orchestrator function
  setSelectedFunnelId: React.Dispatch<React.SetStateAction<number | null>>; // Allow setting null
  fetchFunnels: () => Promise<void>; // Expose funnel fetch if needed externally
}

const FetchDataContext = createContext<FetchDataContextType | null>(null);

export const useFetchData = () => {
  const context = useContext(FetchDataContext);
  if (!context) {
    throw new Error('useFetchData must be used within a FetchDataProvider');
  }
  return context;
};

export const FetchDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use individual hooks
  const { hospitais, medicos, isLoadingHospitalsMedicos, fetchHospitalsAndMedicos } = useFetchHospitalsMedicos();
  const { configuredProcedures, isLoadingConfiguredProcedures, fetchConfiguredProcedures } = useFetchConfiguredProcedures();
  const { funnels, pipelineStages, selectedFunnelId, setSelectedFunnelId, isLoadingFunnelsStages, fetchFunnels, fetchPipelineStages } = useFetchFunnelsStages();
  const { profiles, isLoadingProfiles, fetchProfiles } = useFetchProfiles();

  // Create profilesMap needed by useFetchPacientes
  const profilesMap = useMemo(() => {
    return profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, Profile>);
  }, [profiles]);

  const { pacientes, isLoadingPacientes, fetchPacientes } = useFetchPacientes({ profilesMap, selectedFunnelId });

  // Combine loading states
  const isLoading = isLoadingHospitalsMedicos || isLoadingConfiguredProcedures || isLoadingFunnelsStages || isLoadingProfiles || isLoadingPacientes;

  // Main data fetching orchestrator
  const fetchData = useCallback(async () => {
    console.log("FetchDataContext: fetchData triggered");
    // Fetch data that doesn't depend on others first (or in parallel)
    await Promise.all([
      fetchHospitalsAndMedicos(),
      fetchConfiguredProcedures(),
      fetchFunnels(), // Fetches funnels, sets selectedFunnelId, triggers stage fetch internally
      fetchProfiles(), // Fetch all profiles initially or based on some logic
    ]);
    // Fetch pacientes after profiles are available (or adjust dependency if needed)
    // Note: fetchPacientes depends on profilesMap, which updates when profiles change.
    // We might need to trigger fetchPacientes explicitly after fetchProfiles finishes.
    // Let's trigger it here for now.
    await fetchPacientes();
    console.log("FetchDataContext: fetchData completed");

  }, [
    fetchHospitalsAndMedicos,
    fetchConfiguredProcedures,
    fetchFunnels,
    fetchProfiles,
    fetchPacientes // Add fetchPacientes dependency
  ]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run once on mount

  // Re-fetch pacientes when profilesMap or selectedFunnelId changes
  useEffect(() => {
    if (Object.keys(profilesMap).length > 0 && selectedFunnelId !== null) {
        console.log("FetchDataContext: ProfilesMap or SelectedFunnelId changed, refetching pacientes.");
        fetchPacientes();
    }
  }, [profilesMap, selectedFunnelId, fetchPacientes]);


  const value = {
    pacientes,
    hospitais,
    medicos,
    configuredProcedures,
    funnels,
    pipelineStages,
    selectedFunnelId,
    profiles, // Expose profiles
    isLoading,
    fetchData,
    setSelectedFunnelId,
    fetchFunnels, // Expose fetchFunnels
  };

  return (
    <FetchDataContext.Provider value={value}>
      {children}
    </FetchDataContext.Provider>
  );
};
