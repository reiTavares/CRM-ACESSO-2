import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Profile = {
  id: string;
  nome: string;
  nivel_acesso: string;
  hospital_id?: number;
  cpf?: string;
  created_at?: string;
  updated_at?: string;
};

export function useProfilesData() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfis',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    consultores: profiles.filter(p => ['Consultor', 'Supervisor', 'Gestor', 'Admin', 'Super Admin'].includes(p.nivel_acesso)),
    isLoading,
    refetchProfiles: fetchProfiles
  };
}
