import { useState, useEffect } from 'react';
import { PacienteDataExtended } from '../paciente-card';

interface UseModalCoreStateProps {
  initialPaciente: PacienteDataExtended | null;
  open: boolean;
}

export const useModalCoreState = ({ initialPaciente, open }: UseModalCoreStateProps) => {
  const [activeTab, setActiveTab] = useState('contato');
  const [paciente, setPaciente] = useState<PacienteDataExtended | null>(initialPaciente);
  const [isSaving, setIsSaving] = useState(false);

  // Reset the state when the modal opens/closes or initialPaciente changes
  useEffect(() => {
    setPaciente(initialPaciente);
    // Only reset tab if modal is opening or patient changes while open
    if (open && initialPaciente) {
        setActiveTab('contato');
    } else if (!open) {
        // Optionally reset tab when closing, or keep it as is
        // setActiveTab('contato');
    }
  }, [initialPaciente, open]);

  return {
    activeTab,
    setActiveTab,
    paciente,
    setPaciente,
    isSaving,
    setIsSaving,
  };
};
