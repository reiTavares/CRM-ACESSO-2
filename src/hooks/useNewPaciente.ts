import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PacienteDataExtended } from '@/components/pacientes/paciente-card';
import { Hospital, Medico, OrigemTipo } from '@/types/supabase';

interface UseNewPacienteProps {
  hospitais: Hospital[];
  medicos: Medico[];
  currentUserId: string;
  selectedFunnelId: number;
  fetchData: () => Promise<void>;
}

export const useNewPaciente = ({
  hospitais,
  medicos,
  currentUserId,
  selectedFunnelId,
  fetchData
}: UseNewPacienteProps) => {
  const { toast } = useToast();

  const handleNewPaciente = async (newPacienteData: Omit<PacienteDataExtended, 'id' | 'status'>, closeModal?: () => void) => {
    try {
      const hospitalId = hospitais.find(h => h.nome === newPacienteData.hospital)?.id;
      if (!hospitalId) {
        throw new Error(`Hospital "${newPacienteData.hospital}" não encontrado`);
      }
      
      let medicoId = null;
      if (newPacienteData.medico) {
        medicoId = medicos.find(m => m.nome === newPacienteData.medico)?.id;
      }

      // Validate origem is within allowed types
      let origem: OrigemTipo;
      if (newPacienteData.origem === "Publicidade Digital" ||
          newPacienteData.origem === "Publicidade Tradicional" ||
          newPacienteData.origem === "Indicação" ||
          newPacienteData.origem === "Evento") {
        origem = newPacienteData.origem as OrigemTipo;
      } else {
        // Default to Publicidade Digital if not a valid value
        origem = "Publicidade Digital";
      }
      
      const { data, error } = await supabase
        .from('pacientes')
        .insert({
          nome: newPacienteData.nome,
          hospital_id: hospitalId,
          medico_id: medicoId,
          telefone: newPacienteData.telefone,
          data_nascimento: newPacienteData.dataNascimento ? new Date(newPacienteData.dataNascimento).toISOString() : null,
          cpf: newPacienteData.cpf || null,
          telefone2: newPacienteData.telefone2 || null,
          email: newPacienteData.email || null,
          uf: newPacienteData.uf || null,
          cidade: newPacienteData.cidade || null,
          bairro: newPacienteData.bairro || null,
          origem: origem,
          status: 'Lead Recebido',
          funnel_id: selectedFunnelId,
          consultor_responsavel_id: currentUserId,
          quem_criou_id: currentUserId,
          convenio: newPacienteData.convenio || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({ 
        title: "Paciente Adicionado", 
        description: `${newPacienteData.nome} foi adicionado com sucesso.` 
      });
      
      if (closeModal) closeModal();
      
      fetchData();
      
    } catch (error: any) {
      console.error("Erro ao adicionar paciente:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao Adicionar", 
        description: error.message || 'Ocorreu um erro ao adicionar o paciente.' 
      });
    }
  };

  return { handleNewPaciente };
};
