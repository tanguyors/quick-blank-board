import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const visits = useQuery({
    queryKey: ['visits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`*, properties (id, adresse, prix, type, prix_currency)`)
        .or(`buyer_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order('proposed_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const requestVisit = useMutation({
    mutationFn: async (visit: { property_id: string; owner_id: string; proposed_date: string; message?: string }) => {
      const { error } = await supabase.from('visits').insert({
        ...visit,
        buyer_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits'] }),
  });

  const updateVisitStatus = useMutation({
    mutationFn: async ({ id, status, cancel_reason }: { id: string; status: string; cancel_reason?: string }) => {
      const { error } = await supabase
        .from('visits')
        .update({ status: status as any, cancel_reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits'] }),
  });

  return { visits, requestVisit, updateVisitStatus };
}
