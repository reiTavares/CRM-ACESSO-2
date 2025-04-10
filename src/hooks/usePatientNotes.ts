import { PacienteHistorico, PacienteNota } from "@/components/pacientes/paciente-card";
import { supabase } from "@/integrations/supabase/client";
import { HistoricoTipo } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

interface UsePatientNotesProps {
  currentUserId: string;
}

export const usePatientNotes = ({
  currentUserId
}: UsePatientNotesProps) => {
  const { toast } = useToast();
  
  // Function to add new notes
  const addNewNotas = async (pacienteId: string, notas: PacienteNota[]) => {
    if (!notas || notas.length === 0) return true;
    
    const newNotes = notas.filter(nota => nota.id.toString().startsWith('temp-'));
    if (newNotes.length === 0) return true;
    
    console.log(`Adding ${newNotes.length} new notes for patient ${pacienteId}`);
    
    for (const nota of newNotes) {
      try {
        const { data, error } = await supabase
          .from('notas')
          .insert({
            paciente_id: parseInt(pacienteId),
            usuario_id: currentUserId,
            texto: nota.texto,
            anexo_path: nota.anexo_path || null
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error adding note:", error);
          toast({
            variant: "destructive",
            title: "Erro ao adicionar nota",
            description: error.message
          });
          throw error;
        }
        
        console.log("Note added successfully:", data);
        
      } catch (error) {
        console.error("Error adding note:", error);
        throw error;
      }
    }
    
    return true;
  };
  
  // Function to add new history entries
  const addNewHistorico = async (pacienteId: string, historico: PacienteHistorico[]) => {
    if (!historico || historico.length === 0) return true;
    
    const newHistory = historico.filter(hist => hist.id.toString().startsWith('temp-'));
    if (newHistory.length === 0) return true;
    
    console.log(`Adding ${newHistory.length} new history entries for patient ${pacienteId}`);
    
    for (const hist of newHistory) {
      try {
        // Convert tipo to a valid HistoricoTipo
        const tipoMapped = mapTipoToValidHistoricoTipo(hist.tipo);
        
        const { data, error } = await supabase
          .from('historico')
          .insert({
            paciente_id: parseInt(pacienteId),
            usuario_id: currentUserId,
            tipo: tipoMapped,
            descricao: hist.descricao
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error adding history:", error);
          toast({
            variant: "destructive",
            title: "Erro ao adicionar histórico",
            description: error.message
          });
          throw error;
        }
        
        console.log("History entry added successfully:", data);
        
      } catch (error) {
        console.error("Error adding history:", error);
        throw error;
      }
    }
    
    return true;
  };
  
  // Helper function to map any tipo string to a valid HistoricoTipo
  const mapTipoToValidHistoricoTipo = (tipo: string): HistoricoTipo => {
    switch (tipo) {
      case "Status":
        return "Status";
      case "Procedimento":
        return "Procedimento";
      case "Agendamento":
        return "Acompanhamento";
      case "Edição":
      case "Alteração":
        return "Alteração";
      case "Observação":
      case "Outro":
        return "Acompanhamento";
      case "Ligação":
        return "Ligação";
      case "Criação":
        return "Criação";
      default:
        return "Acompanhamento";
    }
  };
  
  // Function to fetch historico for a patient
  const fetchHistorico = async (pacienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('historico')
        .select(`
          *,
          usuario:usuario_id(nome)
        `)
        .eq('paciente_id', parseInt(pacienteId))
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data?.map(hist => ({
        id: hist.id.toString(),
        usuario_id: hist.usuario_id,
        usuario_nome: hist.usuario?.nome || 'Sistema',
        tipo: hist.tipo,
        descricao: hist.descricao,
        created_at: hist.created_at
      })) || [];
      
    } catch (error) {
      console.error("Error fetching historico:", error);
      return [];
    }
  };
  
  // Function to fetch notas for a patient
  const fetchNotas = async (pacienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select(`
          *,
          usuario:usuario_id(nome)
        `)
        .eq('paciente_id', parseInt(pacienteId))
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data?.map(nota => ({
        id: nota.id.toString(),
        usuario_id: nota.usuario_id,
        usuario_nome: nota.usuario?.nome || 'Sistema',
        texto: nota.texto,
        anexo_path: nota.anexo_path,
        created_at: nota.created_at
      })) || [];
      
    } catch (error) {
      console.error("Error fetching notas:", error);
      return [];
    }
  };
  
  return {
    addNewNotas,
    addNewHistorico,
    fetchHistorico,
    fetchNotas
  };
};
