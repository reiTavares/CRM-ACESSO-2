import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/hooks/useProfilesData'; // Assuming type is defined here

export const useFetchProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async (userIds: string[] = []) => {
    if (userIds.length === 0) {
      // Optionally fetch all profiles if no specific IDs are needed initially
      // Or just return if no specific users need mapping yet
      // setProfiles([]);
      // return;
    }
    setIsLoading(true);
    try {
      let query = supabase.from('profiles').select('id, nome, nivel_acesso'); // Select necessary fields

      // If userIds are provided, filter by them
      if (userIds.length > 0) {
        query = query.in('id', userIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Ensure data conforms to Profile type, handle potential nulls
      const typedProfiles: Profile[] = (data || []).map(p => ({
        id: p.id,
        nome: p.nome || 'Nome Indisponível', // Provide default if null
        nivel_acesso: p.nivel_acesso || 'Consultor', // Provide default if null
        // Add other fields with defaults if needed
        hospital_id: undefined, // Or fetch if needed
        cpf: undefined,
      }));

      setProfiles(typedProfiles);

    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Carregar Perfis",
        description: error.message || 'Ocorreu um erro.'
      });
      setProfiles([]); // Set empty on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch all profiles initially (optional, depends on needs)
  // useEffect(() => {
  //   fetchProfiles();
  // }, [fetchProfiles]);

  return { profiles, isLoadingProfiles: isLoading, fetchProfiles };
};
