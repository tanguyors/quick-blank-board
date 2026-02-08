import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { Star, MapPin, BedDouble, Bath, Maximize2, ArrowRight, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-foreground font-semibold">Favoris</span>
            </div>
            {favorites.data?.length ? (
              <span className="text-sm text-muted-foreground">{favorites.data.length} bien(s)</span>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {favorites.isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !favorites.data?.length ? (
            <div className="text-center p-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">Aucun favori pour le moment</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Appuyez sur ★ dans Découvrir pour ajouter un bien</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favorites.data.map((fav: any) => {
                const property = fav.properties;
                const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

                return (
                  <div key={fav.id} className="rounded-2xl overflow-hidden bg-card border border-border">
                    <div className="relative">
                      {primaryMedia ? (
                        <img
                          src={primaryMedia.url}
                          alt=""
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => navigate(`/properties/${property?.id}`)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-secondary flex items-center justify-center text-muted-foreground">
                          Pas de photo
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium">
                          {property?.operations === 'vente' ? 'Vente' : 'Location'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-secondary/90 backdrop-blur-sm text-foreground font-bold text-lg px-4 py-2 rounded-xl">
                          {property?.prix ? displayPrice(property.prix, property.prix_currency) : ''}
                        </span>
                        <button
                          onClick={() => navigate(`/properties/${property?.id}`)}
                          className="bg-secondary/90 backdrop-blur-sm text-foreground p-2 rounded-full"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground capitalize">{property?.type}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property?.adresse}</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" /> {property?.chambres}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" /> {property?.salles_bain || 0}
                        </span>
                        {property?.surface && (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="h-4 w-4" /> {property?.surface}m²
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/properties/${property?.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                        >
                          Voir le bien
                        </button>
                        <button
                          onClick={() => removeFavorite.mutate(property?.id)}
                          className="w-14 flex items-center justify-center rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                          disabled={removeFavorite.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
