import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PointsPerNightDisplay } from '@/components/exchange/PointsPerNightDisplay';

import iconExchange from '@/assets/icons/exchange.png';
import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';

export default function ExchangeMyProperties() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-exchange-properties', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary, position)')
        .eq('owner_id', user!.id)
        .eq('operations', 'home_exchange')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/home-exchange')} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={iconExchange} alt="" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-foreground">{t('exchangeNav.myProperties')}</span>
        </div>
      </PageTopBar>

      <div className="p-4 space-y-4 pb-nav-scroll">
        <Button onClick={() => navigate('/properties/new')} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          {t('exchangeNav.addProperty')}
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="space-y-3">
            {properties.map(property => {
              const media = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];
              const eqArray = Array.isArray(property.equipements) ? property.equipements as string[] : [];

              return (
                <div
                  key={property.id}
                  className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
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
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">{property.type}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${property.is_published ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            {property.is_published ? t('exchangeNav.published') : t('exchangeNav.draft')}
                          </span>
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
                      <div className="mt-1.5">
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
            <p className="text-sm">{t('exchangeNav.noExchangeProperties')}</p>
            <p className="text-xs mt-1">{t('homeExchange.registrationBonus')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
