import { Info, Bookmark } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useTranslation } from 'react-i18next';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';
import iconSearch from '@/assets/icons/search.png';
import { PropertySellerCard } from '@/components/properties/PropertySellerCard';
import type { OwnerProfilePublic, OwnerScorePublic } from '@/lib/enrichPropertySellers';

interface SwipeCardProps {
  property: any & {
    owner_profile?: OwnerProfilePublic | null;
    owner_score?: OwnerScorePublic | null;
  };
  onInfoClick?: () => void;
  /** Affiché en haut à droite de la photo */
  onFavoriteClick?: () => void;
  isFavorite?: boolean;
  favoriteDisabled?: boolean;
}

export function SwipeCard({ property, onInfoClick, onFavoriteClick, isFavorite, favoriteDisabled }: SwipeCardProps) {
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

        {/* Home Exchange badge */}
        {property.operations === 'home_exchange' && (
          <div className="absolute top-4 left-4 z-[15]">
            <span className="bg-cyan-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              Home Exchange
            </span>
          </div>
        )}

        {onFavoriteClick && (
          <button
            type="button"
            disabled={favoriteDisabled}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onFavoriteClick();
            }}
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(255,176,46,0.40)] transition-all hover:shadow-[0_6px_16px_rgba(255,176,46,0.55)] active:scale-95 disabled:opacity-50"
            aria-label={t('property.favorite')}
            aria-pressed={isFavorite}
          >
            <Bookmark
              className="h-5 w-5 text-[#FFB02E]"
              strokeWidth={2.5}
              fill={isFavorite ? '#FFB02E' : 'transparent'}
            />
          </button>
        )}

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-5 pt-16">
          <div className="mb-3">
            <PropertySellerCard
              variant="compact"
              profile={property.owner_profile}
              score={property.owner_score}
            />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{property.type}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <img src={iconMap} alt="" className="h-4 w-4 object-contain" />
            <span className="text-sm">{property.adresse}</span>
          </div>

          {/* Specs */}
          <div className="flex gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
              <img src={iconHome} alt="" className="h-5 w-5 object-contain" /> {property.chambres}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
              🚿 {property.salles_bain}
            </span>
            {property.surface && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary px-3 py-2 rounded-lg">
                <img src={iconSearch} alt="" className="h-5 w-5 object-contain" /> {property.surface}m²
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
