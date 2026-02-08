import { MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';

interface SwipeCardProps {
  property: any;
  onInfoClick?: () => void;
}

export function SwipeCard({ property, onInfoClick }: SwipeCardProps) {
  const { displayPrice } = useDisplayPrice();
  const primaryMedia = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl">
      <div className="relative aspect-[3/4] max-h-[55vh]">
        {primaryMedia ? (
          <img src={primaryMedia.url} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
            Pas de photo
          </div>
        )}

        {/* Info button */}
        {onInfoClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground"
          >
            <span className="text-xl">ⓘ</span>
          </button>
        )}

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-5 pt-16">
          <h3 className="text-2xl font-bold text-foreground">{property.type}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{property.adresse}</span>
          </div>

          {/* Specs */}
          <div className="flex gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
              <BedDouble className="h-4 w-4" /> {property.chambres}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
              <Bath className="h-4 w-4" /> {property.salles_bain}
            </span>
            {property.surface && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                <Maximize2 className="h-4 w-4" /> {property.surface}m²
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="inline-block bg-secondary/90 text-foreground font-bold text-lg px-4 py-2 rounded-xl">
              {displayPrice(property.prix, property.prix_currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
