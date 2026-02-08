import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, BedDouble, Bath, Ruler, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useAuth } from '@/hooks/useAuth';
import { VisitForm } from '@/components/visits/VisitForm';

interface PropertyData {
  id: string;
  type: string;
  operations: string;
  prix: number;
  prix_currency: string;
  adresse: string;
  description?: string | null;
  surface?: number | null;
  chambres: number;
  salles_bain: number;
  secteur?: string | null;
  droit?: string | null;
  equipements?: any;
  owner_id: string;
  property_media?: { url: string; is_primary: boolean; type?: string }[];
}

interface PropertyDetailSheetProps {
  property: PropertyData | null;
  open: boolean;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  villa: 'Villa', appartement: 'Appartement', terrain: 'Terrain', maison: 'Maison',
  studio: 'Studio', bureau: 'Bureau', commerce: 'Commerce', entrepot: 'Entrepôt',
  commercial: 'Commercial', construction: 'Construction', maison_a_renover: 'Maison à rénover',
  colocation_longue: 'Colocation longue', colocation_courte: 'Colocation courte',
  hebergement_service: 'Hébergement service', hebergement_animaux: 'Hébergement animaux',
  guesthouse: 'Guesthouse',
};

const droitLabels: Record<string, string> = {
  titre_foncier: 'Titre foncier', bail: 'Bail', deliberation: 'Délibération',
  freehold: 'Freehold', leasehold: 'Leasehold',
};

export function PropertyDetailSheet({ property, open, onClose }: PropertyDetailSheetProps) {
  const { displayPrice } = useDisplayPrice();
  const { user, roles } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [showVisitForm, setShowVisitForm] = useState(false);

  if (!property) return null;

  const images = (property.property_media || []).filter((m: any) => !m.type || m.type === 'image');
  const isOwner = property.owner_id === user?.id;
  const isViewerOwnerRole = roles.includes('owner');
  const hideActions = isViewerOwnerRole && !isOwner;

  const nextImage = () => setCurrentImage(i => (i + 1) % images.length);
  const prevImage = () => setCurrentImage(i => (i - 1 + images.length) % images.length);

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 z-[1200]">
        <ScrollArea className="h-full">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="relative aspect-video bg-muted">
              <img
                src={images[currentImage]?.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-primary' : 'bg-background/50'}`}
                      />
                    ))}
                  </div>
                  <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {currentImage + 1}/{images.length}
                  </span>
                </>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground relative">
              Pas de photo
              <button
                onClick={onClose}
                className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Property details */}
          <div className="p-4 space-y-4 pb-8">
            <SheetHeader className="p-0">
              <div className="flex gap-2 flex-wrap mb-1">
                <Badge>{typeLabels[property.type] || property.type}</Badge>
                <Badge variant="secondary">{property.operations === 'vente' ? 'Vente' : 'Location'}</Badge>
                {property.droit && <Badge variant="outline">{droitLabels[property.droit] || property.droit}</Badge>}
              </div>
              <SheetTitle className="text-2xl font-bold text-primary">
                {displayPrice(property.prix, property.prix_currency)}
              </SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{property.adresse}</span>
            </div>

            {property.secteur && (
              <p className="text-sm text-muted-foreground">Secteur : {property.secteur}</p>
            )}

            <div className="flex gap-4 text-sm text-muted-foreground">
              {property.surface && (
                <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{property.surface} m²</span>
              )}
              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.chambres} ch.</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.salles_bain} sdb</span>
            </div>

            {property.description && (
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {property.equipements && (property.equipements as string[]).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {(property.equipements as string[]).map((eq: string) => (
                    <Badge key={eq} variant="outline">{eq}</Badge>
                  ))}
                </div>
              </div>
            )}

            {!isOwner && !hideActions && (
              <Button className="w-full" onClick={() => setShowVisitForm(true)}>
                <CalendarDays className="h-4 w-4 mr-2" /> Demander une visite
              </Button>
            )}

            {showVisitForm && !hideActions && (
              <VisitForm
                propertyId={property.id}
                ownerId={property.owner_id}
                onClose={() => setShowVisitForm(false)}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}