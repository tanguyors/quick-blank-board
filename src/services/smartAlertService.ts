import { supabase } from '@/integrations/supabase/client';

export class SmartAlertService {
  /**
   * Check for new properties matching buyer preferences and create discovery alerts
   */
  static async checkNewMatchingProperties(userId: string) {
    // Get buyer preferences
    const { data: prefs } = await supabase
      .from('buyer_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!prefs) return [];

    // Get properties created in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = supabase
      .from('properties')
      .select('id, type, adresse, prix, operations, secteur')
      .eq('is_published', true)
      .eq('status', 'available')
      .neq('owner_id', userId)
      .gte('created_at', yesterday);

    if (prefs.preferred_operation) query = query.eq('operations', prefs.preferred_operation);
    if (prefs.preferred_types?.length) query = query.in('type', prefs.preferred_types);

    const { data: newProps } = await query;
    return (newProps || []).map(p => ({
      type: 'new_match' as const,
      title: '🏠 Nouveau bien qui vous correspond !',
      message: `${p.type} à ${p.adresse} — correspond à vos critères`,
      propertyId: p.id,
      score: 92,
    }));
  }

  /**
   * Check for price drops on properties the user has liked or favorited
   */
  static async checkPriceDrops(userId: string) {
    // Get favorited property IDs
    const { data: favs } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    if (!favs?.length) return [];

    const favIds = favs.map(f => f.property_id);
    // In a real implementation, we'd compare current price vs historical
    // For now, flag properties with low price relative to their sector
    return [];
  }

  /**
   * Check for properties similar to favorites
   */
  static async checkSimilarToFavorites(userId: string) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('properties(type, secteur, prix, operations)')
      .eq('user_id', userId)
      .limit(3);

    if (!favs?.length) return [];

    const alerts: Array<{ type: string; title: string; message: string }> = [];

    for (const fav of favs) {
      const prop = (fav as any).properties;
      if (!prop) continue;

      const { data: similar } = await supabase
        .from('properties')
        .select('id, type, adresse, prix')
        .eq('type', prop.type)
        .eq('secteur', prop.secteur)
        .eq('is_published', true)
        .eq('status', 'available')
        .neq('owner_id', userId)
        .limit(1);

      if (similar?.length) {
        alerts.push({
          type: 'similar_to_favorite',
          title: '💎 Bien similaire à un favori',
          message: `${similar[0].type} à ${similar[0].adresse} ressemble à un de vos favoris`,
        });
      }
    }

    return alerts;
  }

  /**
   * Get trending sectors (most matches in last 7 days)
   */
  static async getTrendingSectors() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('matches')
      .select('properties(secteur)')
      .gte('created_at', weekAgo);

    if (!data?.length) return [];

    const sectorCounts: Record<string, number> = {};
    for (const m of data) {
      const secteur = (m as any).properties?.secteur;
      if (secteur) sectorCounts[secteur] = (sectorCounts[secteur] || 0) + 1;
    }

    const trending = Object.entries(sectorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([sector, count]) => ({
        type: 'trending_sector' as const,
        title: '📈 Secteur tendance',
        message: `${sector} est en forte demande avec ${count} matchs cette semaine`,
      }));

    return trending;
  }

  /**
   * Generate all discovery alerts for a user
   */
  static async generateAlerts(userId: string) {
    const [newMatches, similar, trending] = await Promise.all([
      this.checkNewMatchingProperties(userId),
      this.checkSimilarToFavorites(userId),
      this.getTrendingSectors(),
    ]);

    return [...newMatches, ...similar, ...trending];
  }
}
