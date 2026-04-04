import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useReviewsForUser(userId?: string) {
  return useQuery({
    queryKey: ['exchange-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_reviews')
        .select('*, reviewer:profiles!exchange_reviews_reviewer_id_fkey(full_name, avatar_url)')
        .eq('reviewee_id', userId!)
        .order('created_at', { ascending: false });
      if (error) {
        // Fallback without join if FK not set up
        const { data: plain, error: e2 } = await supabase
          .from('exchange_reviews')
          .select('*')
          .eq('reviewee_id', userId!)
          .order('created_at', { ascending: false });
        if (e2) throw e2;
        return plain || [];
      }
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useMyReviewForExchange(transactionId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-exchange-review', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_reviews')
        .select('*')
        .eq('exchange_transaction_id', transactionId!)
        .eq('reviewer_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!transactionId && !!user,
  });
}

export function useSubmitExchangeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      exchange_transaction_id?: string;
      reviewer_id: string;
      reviewee_id: string;
      property_id: string;
      rating_overall: number;
      rating_cleanliness: number;
      rating_communication: number;
      rating_property_respect: number;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from('exchange_reviews')
        .insert(review);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-exchange-review'] });
    },
  });
}

export function useAverageRating(userId?: string) {
  const { data: reviews } = useReviewsForUser(userId);

  if (!reviews || reviews.length === 0) return null;

  const avg = (field: 'rating_overall' | 'rating_cleanliness' | 'rating_communication' | 'rating_property_respect') => {
    const sum = reviews.reduce((acc, r) => acc + (r[field] || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  return {
    overall: avg('rating_overall'),
    cleanliness: avg('rating_cleanliness'),
    communication: avg('rating_communication'),
    propertyRespect: avg('rating_property_respect'),
    count: reviews.length,
  };
}
