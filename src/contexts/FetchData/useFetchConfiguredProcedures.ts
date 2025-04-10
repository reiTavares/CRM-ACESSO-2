import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProcedimentoConfig } from '@/components/configuracoes/ProcedimentosSettings'; // Assuming type is defined here

export const useFetchConfiguredProcedures = () => {
  const [configuredProcedures, setConfiguredProcedures] = useState<ProcedimentoConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfiguredProcedures = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('procedimentos_config')
        .select(`
            id, descricao, preco, hospital_id, tipo,
            hospitais (nome)
          `); // Fetch hospital name

      if (error) throw error;

      if (data) {
        const procedures: ProcedimentoConfig[] = data.map(proc => ({
          id: proc.id.toString(),
          tipo: proc.tipo || '', // Ensure tipo is always a string
          descricao: proc.descricao,
          preco: proc.preco,
          hospitalId: proc.hospital_id, // Keep the ID
          hospitalVinculado: proc.hospitais?.nome || 'N/A' // Use fetched name
        }));
        setConfiguredProcedures(procedures);
      } else {
        setConfiguredProcedures([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar procedimentos configurados:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Carregar Procedimentos",
        description: error.message || 'Ocorreu um erro.'
      });
      setConfiguredProcedures([]); // Set empty on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { configuredProcedures, isLoadingConfiguredProcedures: isLoading, fetchConfiguredProcedures };
};
