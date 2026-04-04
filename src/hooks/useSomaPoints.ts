import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePointsBalance(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;
  return useQuery({
    queryKey: ['soma-points', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soma_points_accounts')
        .select('*')
        .eq('user_id', id!)
        .maybeSingle();
      if (error) throw error;
      return data || { balance: 0, total_earned: 0, total_spent: 0 };
    },
    enabled: !!id,
  });
}

export function usePointsHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['soma-points-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soma_points_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useAwardPoints() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, type, description, referenceId }: {
      amount: number;
      type: string;
      description?: string;
      referenceId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Insert transaction
      const { error: txError } = await supabase
        .from('soma_points_transactions')
        .insert({
          user_id: user.id,
          amount,
          type,
          description,
          reference_id: referenceId,
        });
      if (txError) throw txError;

      // Upsert account balance
      const { data: existing } = await supabase
        .from('soma_points_accounts')
        .select('balance, total_earned')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('soma_points_accounts')
          .update({
            balance: existing.balance + amount,
            total_earned: existing.total_earned + amount,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('soma_points_accounts')
          .insert({
            user_id: user.id,
            balance: amount,
            total_earned: amount,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soma-points'] });
      queryClient.invalidateQueries({ queryKey: ['soma-points-history'] });
    },
  });
}

export function useSpendPoints() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, description, referenceId }: {
      amount: number;
      description?: string;
      referenceId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: account } = await supabase
        .from('soma_points_accounts')
        .select('balance, total_spent')
        .eq('user_id', user.id)
        .single();

      if (!account || account.balance < amount) {
        throw new Error('Insufficient points');
      }

      const { error: txError } = await supabase
        .from('soma_points_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          type: 'booking_spent',
          description,
          reference_id: referenceId,
        });
      if (txError) throw txError;

      const { error } = await supabase
        .from('soma_points_accounts')
        .update({
          balance: account.balance - amount,
          total_spent: account.total_spent + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soma-points'] });
      queryClient.invalidateQueries({ queryKey: ['soma-points-history'] });
    },
  });
}
