import { MapPin, BedDouble, Bath, Maximize2, Info } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useTranslation } from 'react-i18next';

interface SwipeCardProps {
  property: any;
  onInfoClick?: () => void;
}

export function SwipeCard({ property, onInfoClick }: SwipeCardProps) {
  const { displayPrice } = useDisplayPrice();
  const { t } = useTranslation();
  const primaryMedia = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl w-full">
      <div className="relative aspect-[3/4] w-full">
        {primaryMedia ? (
          <img src={primaryMedia.url} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
            {t('property.noPhoto')}
          </div>
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
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
              <BedDouble className="h-5 w-5" /> {property.chambres}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
              <Bath className="h-5 w-5" /> {property.salles_bain}
            </span>
            {property.surface && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
                <Maximize2 className="h-5 w-5" /> {property.surface}m²
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="inline-block bg-primary text-primary-foreground font-bold text-xl tracking-wide px-5 py-2.5 rounded-xl">
              {displayPrice(property.prix, property.prix_currency)}
            </span>
          </div>

          {/* Detail button */}
          {onInfoClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onInfoClick();
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-foreground/10 backdrop-blur-md rounded-xl text-foreground text-sm font-medium hover:bg-foreground/20 transition-colors"
            >
              <Info className="h-4 w-4" />
              {t('property.viewDetails')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
