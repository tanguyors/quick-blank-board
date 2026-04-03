import { supabase } from '@/integrations/supabase/client';

export type OwnerProfilePublic = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type OwnerScorePublic = {
  user_id: string;
  score: number;
  certified: boolean | null;
};

/** Joint profil public + score de chaleur pour chaque propriété (vendeur). */
export async function enrichPropertiesWithSellerPublic<T extends { owner_id: string }>(
  items: T[],
): Promise<Array<T & { owner_profile: OwnerProfilePublic | null; owner_score: OwnerScorePublic | null }>> {
  if (!items.length) {
    return items.map(i => ({ ...i, owner_profile: null, owner_score: null }));
  }
  const ownerIds = [...new Set(items.map(p => p.owner_id))];
  const [profilesRes, scoresRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name, avatar_url')
      .in('id', ownerIds),
    supabase.from('wf_user_scores').select('user_id, score, certified').in('user_id', ownerIds),
  ]);
  const profileById = new Map((profilesRes.data || []).map(p => [p.id, p as OwnerProfilePublic]));
  const scoreByUser = new Map((scoresRes.data || []).map(s => [s.user_id, s as OwnerScorePublic]));
  return items.map(p => ({
    ...p,
    owner_profile: profileById.get(p.owner_id) ?? null,
    owner_score: scoreByUser.get(p.owner_id) ?? null,
  }));
}
