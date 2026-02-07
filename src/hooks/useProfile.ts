import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { TablesUpdate } from '@/integrations/supabase/types';

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: TablesUpdate<'profiles'>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return { profile, updateProfile };
}
