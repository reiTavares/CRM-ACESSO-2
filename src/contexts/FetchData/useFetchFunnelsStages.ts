import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Funnel, PipelineStage } from '@/types/funnel';

const DEFAULT_FUNNEL_STAGES = [
  'Lead Recebido',
  'Tentativa de Contato',
  'Contato Realizado',
  'Agendamento de Consulta',
  'Consulta Realizada',
  'Agendamento de Exames',
  'Exames Realizados',
  'Agendamento Cirurgia (SMC)',
  '1º Olho - Cirurgia Realizada',
  'Agendamento Cirurgia 2º Olho',
  '2º Olho - Cirurgia Realizada'
];

export const useFetchFunnelsStages = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createDefaultFunnelAndStages = useCallback(async (): Promise<Funnel | null> => {
    console.log("Attempting to create default funnel and stages...");
    try {
      // Create Funnel
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          name: 'Processo Comercial',
          description: 'Funil padrão de vendas',
          is_default: true
        })
        .select()
        .single();

      if (funnelError) throw funnelError;
      if (!funnelData) throw new Error("Failed to retrieve created funnel data.");

      const newFunnel: Funnel = {
        id: funnelData.id,
        name: funnelData.name,
        description: funnelData.description,
        created_at: funnelData.created_at,
        is_default: funnelData.is_default
      };
      console.log("Default funnel created:", newFunnel);

      // Create Stages
      const stagesToInsert = DEFAULT_FUNNEL_STAGES.map((stageName, index) => ({
        funnel_id: newFunnel.id,
        name: stageName,
        position: index + 1
      }));

      const { error: stagesError } = await supabase
        .from('pipeline_stages')
        .insert(stagesToInsert);

      if (stagesError) throw stagesError;
      console.log("Default stages created for funnel:", newFunnel.id);

      return newFunnel;

    } catch (error: any) {
      console.error("Error creating default funnel and stages:", error);
      toast({
        variant: "destructive",
        title: "Erro Crítico",
        description: "Não foi possível criar o funil de vendas padrão. Contate o suporte."
      });
      return null;
    }
  }, [toast]);

  const fetchFunnels = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const typedFunnels = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          created_at: item.created_at,
          is_default: item.is_default
        })) as Funnel[];
        setFunnels(typedFunnels);
        // Select default or first funnel if none is selected yet or current selection is invalid
        const defaultFunnel = typedFunnels.find(f => f.is_default) || typedFunnels[0];
        if (defaultFunnel && (!selectedFunnelId || !typedFunnels.some(f => f.id === selectedFunnelId))) {
          setSelectedFunnelId(defaultFunnel.id);
        }
      } else {
        // No funnels exist, create the default one
        const newDefaultFunnel = await createDefaultFunnelAndStages();
        if (newDefaultFunnel) {
          setFunnels([newDefaultFunnel]);
          setSelectedFunnelId(newDefaultFunnel.id);
        } else {
          // Handle case where default funnel creation failed
          setFunnels([]);
          setSelectedFunnelId(null);
        }
      }
    } catch (error: any) {
      console.error("Error fetching funnels:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Carregar Funis",
        description: error.message || "Não foi possível carregar os funis."
      });
      setFunnels([]);
      setSelectedFunnelId(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, createDefaultFunnelAndStages, selectedFunnelId]); // Added selectedFunnelId dependency

  const fetchPipelineStages = useCallback(async () => {
    if (!selectedFunnelId) {
      setPipelineStages([]); // Clear stages if no funnel is selected
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('funnel_id', selectedFunnelId)
        .order('position', { ascending: true });

      if (error) throw error;
      if (data) {
        const typedStages = data.map(item => ({
          id: item.id,
          funnel_id: item.funnel_id,
          name: item.name,
          position: item.position,
          created_at: item.created_at
        })) as PipelineStage[];
        setPipelineStages(typedStages);
      } else {
        setPipelineStages([]);
      }
    } catch (error: any) {
      console.error('Error fetching pipeline stages:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Carregar Etapas',
        description: error.message || 'Não foi possível carregar as etapas do funil.'
      });
      setPipelineStages([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFunnelId, toast]);

  // Fetch funnels on mount
  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  // Fetch stages when selectedFunnelId changes
  useEffect(() => {
    fetchPipelineStages();
  }, [fetchPipelineStages]); // fetchPipelineStages already depends on selectedFunnelId

  return {
    funnels,
    pipelineStages,
    selectedFunnelId,
    setSelectedFunnelId, // Expose setter
    isLoadingFunnelsStages: isLoading,
    fetchFunnels,
    fetchPipelineStages,
  };
};
