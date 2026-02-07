import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useExplorableProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['explorable-properties', user?.id],
    queryFn: async () => {
      const { data: swipes } = await supabase
        .from('swipes')
        .select('property_id')
        .eq('user_id', user!.id);
      const swipedIds = new Set(swipes?.map(s => s.property_id) || []);

      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media(*)')
        .eq('is_published', true)
        .eq('status', 'available')
        .neq('owner_id', user!.id);
      if (error) throw error;
      return data?.filter(p => !swipedIds.has(p.id)) || [];
    },
    enabled: !!user,
  });
}

export function useSwipe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, direction, ownerId }: {
      propertyId: string;
      direction: 'left' | 'right';
      ownerId: string;
    }) => {
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({ user_id: user!.id, property_id: propertyId, direction });
      if (swipeError) throw swipeError;

      if (direction === 'right') {
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({ user_id: user!.id, property_id: propertyId, owner_id: ownerId })
          .select()
          .single();
        if (matchError) throw matchError;

        const { error: convError } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user!.id,
            owner_id: ownerId,
            property_id: propertyId,
            match_id: match.id,
          });
        if (convError) throw convError;
        return { matched: true };
      }
      return { matched: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explorable-properties'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
