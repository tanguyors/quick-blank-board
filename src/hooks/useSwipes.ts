import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { enrichPropertiesWithSellerPublic } from '@/lib/enrichPropertySellers';
import { useAuth } from './useAuth';
import { WorkflowService } from '@/services/workflowService';
import type { ExploreFilterValues } from '@/components/explore/ExploreFilters';

export function useExplorableProperties(filters?: ExploreFilterValues) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['explorable-properties', user?.id, filters],
    queryFn: async () => {
      const { data: swipes } = await supabase
        .from('swipes')
        .select('property_id')
        .eq('user_id', user!.id);
      const swipedIds = new Set(swipes?.map(s => s.property_id) || []);

      let query = supabase
        .from('properties')
        .select('*, property_media(*)')
        .eq('is_published', true)
        .eq('status', 'available')
        .neq('owner_id', user!.id);

      // Apply filters
      if (filters?.operation) {
        query = query.eq('operations', filters.operation as any);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type as any);
      }
      if (filters?.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000000)) {
        query = query.gte('prix', filters.priceRange[0]).lte('prix', filters.priceRange[1]);
      }
      if (filters?.surfaceRange && (filters.surfaceRange[0] > 0 || filters.surfaceRange[1] < 1000)) {
        query = query.gte('surface', filters.surfaceRange[0]).lte('surface', filters.surfaceRange[1]);
      }
      if (filters?.chambresMin && filters.chambresMin > 0) {
        query = query.gte('chambres', filters.chambresMin);
      }
      if (filters?.secteurs?.length) {
        query = query.in('secteur', filters.secteurs);
      }

      const { data, error } = await query;
      if (error) throw error;
      const filtered = data?.filter(p => !swipedIds.has(p.id)) || [];
      const withSeller = await enrichPropertiesWithSellerPublic(filtered);
      // Sort: boosted properties first, then by creation date
      return withSeller.sort((a, b) => {
        const aBoosted = a.boosted_until && new Date(a.boosted_until) > new Date() ? 1 : 0;
        const bBoosted = b.boosted_until && new Date(b.boosted_until) > new Date() ? 1 : 0;
        return bBoosted - aBoosted;
      });
    },
    enabled: !!user,
  });
}

export function useSwipe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, direction, ownerId, isSuperLike }: {
      propertyId: string;
      direction: 'left' | 'right';
      ownerId: string;
      isSuperLike?: boolean;
    }) => {
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({ user_id: user!.id, property_id: propertyId, direction });
      if (swipeError) throw swipeError;

      // Stats (best-effort) — ne pas utiliser .catch() : le client Supabase n’expose pas toujours une Promise native sur .rpc()
      if (direction === 'right') {
        await supabase.rpc('increment_property_like', { prop_id: propertyId });
      } else {
        await supabase.rpc('increment_property_pass', { prop_id: propertyId });
      }

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

        // Create workflow transaction
        try {
          await WorkflowService.createTransaction(propertyId, user!.id, ownerId);
        } catch (e) {
          console.error('Failed to create workflow transaction:', e);
        }

        // Super Like: send special notification to owner
        if (isSuperLike) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user!.id)
            .single();
          await supabase.from('wf_notifications').insert({
            user_id: ownerId,
            type: 'super_like',
            title: '⭐ Super Like reçu !',
            message: `${profile?.full_name || 'Un acheteur'} a eu un énorme coup de cœur pour votre bien !`,
          });
        }

        return { matched: true, isSuperLike };
      }
      return { matched: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explorable-properties'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
