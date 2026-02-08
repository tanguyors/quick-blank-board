import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favorites = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('favorites')
        .select('*, properties:property_id (id, adresse, prix, type, prix_currency, surface, chambres, salles_bain, operations, property_media (url, is_primary, position))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await (supabase as any)
        .from('favorites')
        .insert({ user_id: user!.id, property_id: propertyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await (supabase as any)
        .from('favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('property_id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorite = (propertyId: string) =>
    favorites.data?.some((f: any) => f.property_id === propertyId) ?? false;

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
