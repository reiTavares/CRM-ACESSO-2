import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PacienteDataExtended, PacienteProcedimento } from '@/components/pacientes/paciente-card';
import { Profile } from '@/hooks/useProfilesData'; // Assuming type is defined here

interface UseFetchPacientesProps {
  profilesMap: Record<string, Profile>; // Pass profiles map for name resolution
  selectedFunnelId: number | null; // Needed for filtering or default assignment
}

export const useFetchPacientes = ({ profilesMap, selectedFunnelId }: UseFetchPacientesProps) => {
  const [pacientes, setPacientes] = useState<PacienteDataExtended[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPacientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          *,
          hospital:hospital_id(id, nome),
          medico:medico_id(id, nome),
          procedimentos:procedimentos_paciente(
            *,
            hospital:hospital_realizacao_id(id, nome),
            medico:medico_realizacao_id(id, nome)
          )
        `)
        .order('created_at', { ascending: false }); // Example ordering

      if (error) throw error;

      const formattedData: PacienteDataExtended[] = (data || []).map(p => {
        const consultorProfile = p.consultor_responsavel_id ? profilesMap[p.consultor_responsavel_id] : null;
        const gestorProfile = p.gestor_responsavel_id ? profilesMap[p.gestor_responsavel_id] : null;

        return {
          id: p.id.toString(),
          nome: p.nome,
          hospital: p.hospital?.nome || '',
          hospital_id: p.hospital_id,
          medico: p.medico?.nome || '',
          medico_id: p.medico_id,
          telefone: p.telefone,
          dataNascimento: p.data_nascimento ? new Date(p.data_nascimento) : null,
          cpf: p.cpf || '',
          telefone2: p.telefone2 || '',
          email: p.email || '',
          uf: p.uf || '',
          cidade: p.cidade || '',
          bairro: p.bairro || '',
          status: p.status || 'Lead Recebido', // Default status if null
          origem: p.origem || 'Indicação', // Default origem if null
          funnelId: p.funnel_id || selectedFunnelId || 1, // Use patient's funnel, selected, or default 1
          consultorResponsavel: consultorProfile?.nome || 'Não atribuído',
          consultor_responsavel_id: p.consultor_responsavel_id,
          gestorResponsavel: gestorProfile?.nome || '',
          gestor_responsavel_id: p.gestor_responsavel_id,
          procedimentos: (p.procedimentos || []).map(proc => ({
            id: proc.id.toString(),
            tipo: proc.tipo || '', // Ensure string
            procedimento: proc.descricao_custom || '',
            hospital: proc.hospital?.nome || '',
            hospital_id: proc.hospital_realizacao_id,
            medico: proc.medico?.nome || '',
            medico_id: proc.medico_realizacao_id,
            valor: proc.valor_cobrado || 0,
            data: proc.data_realizacao ? new Date(proc.data_realizacao) : null,
            status: proc.status || 'pendente', // Default status
            observacao: proc.observacao || '',
            convenio: proc.convenio_usado || '',
          })) as PacienteProcedimento[],
          historico: [], // Fetched separately in modal
          notas: [], // Fetched separately in modal
          valor: 0, // Calculated dynamically or fetched if needed
          marketingData: p.marketing_info || {},
          convenio: p.convenio || '',
        };
      });

      setPacientes(formattedData);

    } catch (error: any) {
      console.error("Error fetching pacientes:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Carregar Pacientes",
        description: error.message || 'Ocorreu um erro.'
      });
      setPacientes([]); // Set empty on error
    } finally {
      setIsLoading(false);
    }
  }, [toast, profilesMap, selectedFunnelId]); // Depend on profilesMap and selectedFunnelId

  return { pacientes, isLoadingPacientes: isLoading, fetchPacientes };
};
