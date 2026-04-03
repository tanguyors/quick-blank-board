import { useMyProperties } from '@/hooks/useProperties';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, MapPin, Rocket, Heart, X as XIcon, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convertCurrency, formatPrice } from '@/lib/currencies';
import { useTranslation } from 'react-i18next';

export function OwnerPropertyTab() {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useMyProperties();
  const { profile } = useProfile();
  const preferredCurrency = profile.data?.preferred_currency || 'EUR';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const STATUS_LABELS: Record<string, string> = {
    available: t('property.available'), sold: t('property.sold'), rented: t('property.rented'), draft: t('property.draft'),
  };

  const boostProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      const boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h boost
      const { error } = await supabase
        .from('properties')
        .update({ boosted_until: boostedUntil } as any)
        .eq('id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('🚀 Bien boosté pour 24h !');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('property.myProperties')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/map')} className="gap-2">
            <MapPin className="h-4 w-4" /> Carte
          </Button>
          <Button onClick={() => navigate('/properties/new')} className="gap-2">
            <Plus className="h-4 w-4" /> {t('property.add')}
          </Button>
        </div>
      </div>

      {!properties?.length ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Eye className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">{t('property.noProperty')}</h3>
          <p className="text-muted-foreground text-sm mb-6">Commencez par ajouter votre premier bien immobilier</p>
          <Button onClick={() => navigate('/properties/new')} className="gap-2">
            <Plus className="h-4 w-4" /> {t('property.addProperty')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {properties.map(property => {
            const primaryMedia = property.property_media?.find(m => m.is_primary) || property.property_media?.[0];
            return (
              <Card key={property.id} className="overflow-hidden">
                <div className="flex">
                  {primaryMedia ? (
                    <img src={primaryMedia.url} alt="" className="w-24 h-24 object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                  <div className="p-3 flex-1">
                    <div className="flex gap-1 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{property.type}</Badge>
                      <Badge variant={property.is_published ? 'default' : 'secondary'} className="text-xs">
                        {property.is_published ? t('property.published') : t('property.unpublished')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{STATUS_LABELS[property.status]}</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{property.adresse}</p>
                    <p className="text-sm font-bold text-primary">
                      {formatPrice(convertCurrency(property.prix, property.prix_currency, preferredCurrency), preferredCurrency)}
                    </p>
                    {/* Stats */}
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{(property as any).view_count || 0}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-primary" />{(property as any).like_count || 0}</span>
                      <span className="flex items-center gap-0.5"><XIcon className="h-3 w-3 text-destructive" />{(property as any).pass_count || 0}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(`/properties/${property.id}`)}><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(`/properties/${property.id}/edit`)}><Edit className="h-3 w-3" /></Button>
                      <Button
                        size="sm"
                        variant={(property as any).boosted_until && new Date((property as any).boosted_until) > new Date() ? 'default' : 'outline'}
                        className="h-7 px-2 gap-1"
                        onClick={() => boostProperty.mutate(property.id)}
                        disabled={boostProperty.isPending || ((property as any).boosted_until && new Date((property as any).boosted_until) > new Date())}
                      >
                        <Rocket className="h-3 w-3" />
                        {(property as any).boosted_until && new Date((property as any).boosted_until) > new Date() ? 'Boosté' : 'Boost'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
