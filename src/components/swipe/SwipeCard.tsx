import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react';

interface SwipeCardProps {
  property: any;
}

export function SwipeCard({ property }: SwipeCardProps) {
  const primaryMedia = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];

  return (
    <Card className="overflow-hidden select-none">
      <div className="relative aspect-[3/4]">
        {primaryMedia ? (
          <img src={primaryMedia.url} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Pas de photo</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-primary-foreground">
          <div className="flex gap-2 mb-2">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{property.type}</Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{property.operations === 'vente' ? 'Vente' : 'Location'}</Badge>
          </div>
          <p className="text-2xl font-bold">{property.prix.toLocaleString()} {property.prix_currency}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" /><span className="text-sm">{property.adresse}</span>
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            {property.surface && <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{property.surface} m²</span>}
            <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.chambres}</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.salles_bain}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
