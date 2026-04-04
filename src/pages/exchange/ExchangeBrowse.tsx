import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Home, Users, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SomaPointsBadge } from '@/components/exchange/SomaPointsBadge';
import { PointsPerNightDisplay } from '@/components/exchange/PointsPerNightDisplay';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';
import iconExchange from '@/assets/icons/exchange.png';
import iconPoints from '@/assets/icons/points.png';

export default function ExchangeBrowse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterMaxPoints, setFilterMaxPoints] = useState<string>('all');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['home-exchange-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary, position)')
        .eq('operations', 'home_exchange')
        .eq('is_published', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const sectors = [...new Set((properties || []).map(p => p.secteur).filter(Boolean))] as string[];

  const filtered = (properties || []).filter(p => {
    if (filterSector !== 'all' && p.secteur !== filterSector) return false;
    if (filterMaxPoints !== 'all' && p.points_per_night > parseInt(filterMaxPoints)) return false;
    return true;
  });

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/explore')} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={iconExchange} alt="" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-foreground">Home Exchange</span>
        </div>
      </PageTopBar>

      <div className="p-4 space-y-4 pb-nav-scroll">
        {/* Points badge */}
        <SomaPointsBadge />

        <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
          <img src={iconPoints} alt="" className="h-5 w-5 object-contain" />
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('homeExchange.registrationBonus')}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterSector} onValueChange={setFilterSector}>
            <SelectTrigger className="flex-1 bg-card border-border text-sm h-9">
              <SelectValue placeholder={t('homeExchange.filterByDestination')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('homeExchange.allDestinations')}</SelectItem>
              {sectors.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMaxPoints} onValueChange={setFilterMaxPoints}>
            <SelectTrigger className="w-32 bg-card border-border text-sm h-9">
              <SelectValue placeholder="Points" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="80">≤ 80 pts</SelectItem>
              <SelectItem value="120">≤ 120 pts</SelectItem>
              <SelectItem value="200">≤ 200 pts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listing */}
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {t('homeExchange.availableForExchange')}
          {filtered && <span className="text-muted-foreground font-normal text-sm">({filtered.length})</span>}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(property => {
              const media = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];
              const isOwn = property.owner_id === user?.id;
              const eqArray = Array.isArray(property.equipements) ? property.equipements as string[] : [];

              return (
                <div
                  key={property.id}
                  className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <div className="flex">
                    {media ? (
                      <img src={media.url} alt="" className="w-24 h-28 object-cover flex-shrink-0 rounded-l-xl" />
                    ) : (
                      <div className="w-24 h-28 bg-secondary flex items-center justify-center flex-shrink-0 rounded-l-xl">
                        <img src={iconExchange} alt="" className="h-8 w-8 object-contain opacity-50" />
                      </div>
                    )}
                    <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">{property.type}</span>
                          {isOwn && <span className="text-xs font-medium bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Mon bien</span>}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <img src={iconMap} alt="" className="h-3 w-3 object-contain" />
                          <span className="text-xs truncate">{property.adresse}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><img src={iconHome} alt="" className="h-3 w-3 object-contain" /> {property.chambres}</span>
                          {property.surface && <span>{property.surface}m²</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          {property.capacity > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> {property.capacity}</span>}
                          {property.available_from && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(property.available_from).toLocaleDateString()}</span>}
                        </div>
                        <PointsPerNightDisplay capacity={property.capacity} chambres={property.chambres} equipements={eqArray} precomputed={property.points_per_night || undefined} className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <img src={iconExchange} alt="" className="h-12 w-12 object-contain mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('homeExchange.noProperties')}</p>
            <p className="text-xs mt-1">{t('homeExchange.beFirst')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
