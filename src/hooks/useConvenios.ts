import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Convenio = {
  id: number;
  nome: string;
  tipo: string | null;
  hospital_id: number;
  created_at: string;
};

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConvenios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setConvenios(data || []);
    } catch (error: any) {
      console.error('Error fetching convenios:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar convênios',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConvenios();
  }, []);

  // Filter convenios by hospital
  const getConveniosByHospital = (hospitalId: number | string | null | undefined) => {
    if (!hospitalId) return [];
    const hospitalIdNum = typeof hospitalId === 'string' ? parseInt(hospitalId) : hospitalId;
    return convenios.filter(c => c.hospital_id === hospitalIdNum);
  };

  return {
    convenios,
    isLoading,
    refetchConvenios: fetchConvenios,
    getConveniosByHospital
  };
}
