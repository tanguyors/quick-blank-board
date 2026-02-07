import { useMatches } from '@/hooks/useMatches';
import { useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, CalendarDays, MessageSquare, ArrowRight } from 'lucide-react';

export function MatchList() {
  const { data: matches, isLoading } = useMatches();
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!matches?.length) return (
    <div className="text-center p-8 text-muted-foreground">Aucun match pour le moment</div>
  );

  return (
    <div className="grid gap-4 p-4">
      {matches.map(match => {
        const property = match.properties as any;
        const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

        return (
          <div key={match.id} className="rounded-2xl overflow-hidden bg-card border border-border">
            {/* Image */}
            <div className="relative">
              {primaryMedia ? (
                <img
                  src={primaryMedia.url}
                  alt=""
                  className="w-full h-56 object-cover cursor-pointer"
                  onClick={() => navigate(`/properties/${property?.id}`)}
                />
              ) : (
                <div className="w-full h-56 bg-secondary flex items-center justify-center text-muted-foreground">
                  Pas de photo
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Nouveau
                </span>
                <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium">
                  {property?.operations === 'vente' ? 'Vente' : 'Location'}
                </span>
              </div>

              {/* Price overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="bg-secondary/90 backdrop-blur-sm text-foreground font-bold text-lg px-4 py-2 rounded-xl">
                  {property?.prix ? `${(property.prix / 1000).toFixed(0)}K ${property.prix_currency}` : ''}
                </span>
                <button
                  onClick={() => navigate(`/properties/${property?.id}`)}
                  className="bg-secondary/90 backdrop-blur-sm text-foreground p-2 rounded-full"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-foreground">{property?.type}</h3>
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

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/visits`)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                >
                  <CalendarDays className="h-4 w-4" /> Visiter
                </button>
                <button
                  onClick={() => navigate(`/messages`)}
                  className="w-14 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
