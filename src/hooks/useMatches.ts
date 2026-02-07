import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useMatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`*, properties (id, adresse, prix, type, prix_currency, surface, chambres, property_media (url, is_primary, position))`)
        .or(`user_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
