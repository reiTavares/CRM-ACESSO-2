import { supabase } from '@/integrations/supabase/client';
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { Hospital, Medico, OrigemTipo } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseUpdatePacienteProps {
  hospitais: Hospital[];
  medicos: Medico[];
  selectedFunnelId: number;
}

export const useUpdatePaciente = ({
  hospitais,
  medicos,
  selectedFunnelId
}: UseUpdatePacienteProps) => {
  const { toast } = useToast();

  const updatePacienteData = async (updatedPaciente: PacienteDataExtended) => {
    const hospitalId = hospitais.find(h => h.nome === updatedPaciente.hospital)?.id;
    if (!hospitalId) {
      throw new Error(`Hospital "${updatedPaciente.hospital}" não encontrado`);
    }
    
    const medicoId = medicos.find(m => m.nome === updatedPaciente.medico)?.id;
    
    // Validate origem is within allowed types
    let origem: OrigemTipo;
    if (updatedPaciente.origem === "Publicidade Digital" ||
        updatedPaciente.origem === "Publicidade Tradicional" ||
        updatedPaciente.origem === "Indicação" ||
        updatedPaciente.origem === "Evento") {
      origem = updatedPaciente.origem as OrigemTipo;
    } else {
      // Default to Publicidade Digital if not a valid value
      origem = "Publicidade Digital";
    }
    
    // Updating the paciente record
    const { error } = await supabase
      .from('pacientes')
      .update({
        nome: updatedPaciente.nome,
        hospital_id: hospitalId,
        medico_id: medicoId || null,
        telefone: updatedPaciente.telefone,
        data_nascimento: updatedPaciente.dataNascimento ? new Date(updatedPaciente.dataNascimento).toISOString() : null,
        cpf: updatedPaciente.cpf || null,
        telefone2: updatedPaciente.telefone2 || null,
        email: updatedPaciente.email || null,
        uf: updatedPaciente.uf || null,
        cidade: updatedPaciente.cidade || null,
        bairro: updatedPaciente.bairro || null,
        marketing_info: updatedPaciente.marketingData || null,
        status: updatedPaciente.status,
        funnel_id: selectedFunnelId,
        origem: origem,
        convenio: updatedPaciente.convenio || null
      })
      .eq('id', parseInt(updatedPaciente.id));
    
    if (error) throw error;

    return await fetchOriginalPacienteData(updatedPaciente.id);
  };

  const fetchOriginalPacienteData = async (pacienteId: string) => {
    const { data: originalPacienteData, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        procedimentos:procedimentos_paciente(*)
      `)
      .eq('id', parseInt(pacienteId))
      .single();

    if (error) throw error;
    return originalPacienteData;
  };

  return {
    updatePacienteData,
    fetchOriginalPacienteData
  };
};
