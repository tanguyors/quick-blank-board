import { useMyProperties } from '@/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible', sold: 'Vendu', rented: 'Loué', draft: 'Brouillon',
};

export function OwnerPropertyTab() {
  const { data: properties, isLoading } = useMyProperties();
  const navigate = useNavigate();

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
        <h2 className="text-xl font-bold text-foreground">Mes biens</h2>
        <Button onClick={() => navigate('/properties/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter un bien
        </Button>
      </div>

      {!properties?.length ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Eye className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Aucun bien pour le moment</h3>
          <p className="text-muted-foreground text-sm mb-6">Commencez par ajouter votre premier bien immobilier</p>
          <Button onClick={() => navigate('/properties/new')} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter un bien
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
                        {property.is_published ? 'Publié' : 'Non publié'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{STATUS_LABELS[property.status]}</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{property.adresse}</p>
                    <p className="text-sm font-bold text-primary">{property.prix.toLocaleString()} {property.prix_currency}</p>
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
