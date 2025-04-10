import React from 'react';
import { PacienteDataExtended } from '../paciente-card';
import { Hospital, Medico } from '@/types/supabase';

interface UseModalInputHandlersProps {
  setPaciente: React.Dispatch<React.SetStateAction<PacienteDataExtended | null>>;
  hospitais: Hospital[];
  medicos: Medico[];
}

export const useModalInputHandlers = ({ setPaciente, hospitais, medicos }: UseModalInputHandlersProps) => {

  const handleInputChange = (field: keyof PacienteDataExtended, value: any) => {
    setPaciente(prev => {
      if (!prev) return null;
      // Special case for hospital change handled separately
      if (field === 'hospital') return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleMarketingInputChange = (field: string, value: any) => {
    setPaciente(prev => {
      if (!prev) return null;
      return {
        ...prev,
        marketingData: {
          ...(prev.marketingData || {}),
          [field]: value
        }
      };
    });
  };

  const handleProcedureInputChange = (procIndex: number, field: string, value: any) => {
    setPaciente(prev => {
      if (!prev?.procedimentos) return prev;

      const updatedProcs = [...prev.procedimentos];
      const currentProc = { ...updatedProcs[procIndex] }; // Clone procedure

      // Update the specific field
      (currentProc as any)[field] = value;

      // If the field is 'tipo', clear the 'procedimento'
      if (field === 'tipo') {
        currentProc.procedimento = '';
      }

      updatedProcs[procIndex] = currentProc;

      return { ...prev, procedimentos: updatedProcs };
    });
  };

  const handleHospitalChange = (hospitalName: string) => {
    const selectedHospital = hospitais.find(h => h?.nome === hospitalName);
    const hospital_id = selectedHospital ? selectedHospital.id : null;

    setPaciente(prev => {
      if (!prev) return null;
      return {
        ...prev,
        hospital: hospitalName,
        hospital_id,
        medico: '', // Reset medico when hospital changes
        medico_id: null,
      };
    });
  };

  const handleDoctorChange = (doctorName: string) => {
    const selectedDoctor = medicos.find(m => m?.nome === doctorName);
    const medico_id = selectedDoctor ? selectedDoctor.id : null;

    setPaciente(prev => {
      if (!prev) return null;
      return {
        ...prev,
        medico: doctorName,
        medico_id,
      };
    });
  };

  return {
    handleInputChange,
    handleMarketingInputChange,
    handleProcedureInputChange,
    handleHospitalChange,
    handleDoctorChange,
  };
};
