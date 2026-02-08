import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BuyerPreferencesData {
  id?: string;
  user_id: string;
  preferred_types: string[];
  preferred_operation: string | null;
  preferred_chambres: number[];
  preferred_salles_bain: number[];
  preferred_sectors: string[];
  custom_sector: string | null;
  receive_alerts: boolean;
  preferred_status: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  intention: string | null;
  wants_advisor: boolean;
  payment_knowledge: string | null;
  cash_available: string | null;
  visit_availability: string[];
  is_complete: boolean;
}

export function useBuyerPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const preferences = useQuery({
    queryKey: ['buyer-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('buyer_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as BuyerPreferencesData | null;
    },
    enabled: !!user,
  });

  const upsertPreferences = useMutation({
    mutationFn: async (prefs: Partial<BuyerPreferencesData>) => {
      const existing = preferences.data;
      if (existing?.id) {
        const { error } = await (supabase as any)
          .from('buyer_preferences')
          .update(prefs)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('buyer_preferences')
          .insert({ ...prefs, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-preferences'] });
    },
  });

  const needsPreferences = useQuery({
    queryKey: ['needs-preferences-check', user?.id],
    queryFn: async () => {
      const [matchesRes, prefsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        (supabase as any)
          .from('buyer_preferences')
          .select('is_complete')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);
      const matchCount = matchesRes.count || 0;
      const isComplete = (prefsRes.data as any)?.is_complete === true;
      return matchCount >= 2 && !isComplete;
    },
    enabled: !!user,
  });

  return { preferences, upsertPreferences, needsPreferences: needsPreferences.data === true };
}
