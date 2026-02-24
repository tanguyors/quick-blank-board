import { useMyProperties } from '@/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useTranslation } from 'react-i18next';

export function PropertyList() {
  const { data: properties, isLoading } = useMyProperties();
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();
  const { t } = useTranslation();

  const STATUS_LABELS: Record<string, string> = {
    available: t('property.available'), sold: t('property.sold'), rented: t('property.rented'), draft: t('property.draft'),
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('property.myProperties')}</h2>
        <Button onClick={() => navigate('/properties/new')} size="sm">
          <Plus className="h-4 w-4 mr-1" /> {t('property.add')}
        </Button>
      </div>
      {!properties?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('property.noProperties')}</p>
          <Button className="mt-4" onClick={() => navigate('/properties/new')}>{t('property.addProperty')}</Button>
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
                    <div className="w-24 h-24 bg-muted flex items-center justify-center text-xs text-muted-foreground">{t('property.noPhoto')}</div>
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
                    <p className="text-sm font-bold text-primary">{displayPrice(property.prix, property.prix_currency)}</p>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(`/properties/${property.id}`)}><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(`/properties/${property.id}/edit`)}><Edit className="h-3 w-3" /></Button>
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
