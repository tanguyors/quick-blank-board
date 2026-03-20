import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, ChevronLeft, ChevronRight, X, Heart, Star } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useAuth } from '@/hooks/useAuth';
import { VisitForm } from '@/components/visits/VisitForm';
import { EquipmentGrid } from '@/components/properties/EquipmentIcon';
import { useTranslation } from 'react-i18next';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';
import iconSearch from '@/assets/icons/search.png';

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
  showBuyerActions?: boolean;
  onLike?: (property: PropertyData) => void;
  onToggleFavorite?: (propertyId: string) => void;
  isFavorite?: (propertyId: string) => boolean;
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

export function PropertyDetailSheet({
  property, open, onClose, showBuyerActions = false, onLike, onToggleFavorite, isFavorite,
}: PropertyDetailSheetProps) {
  const { displayPrice } = useDisplayPrice();
  const { user, roles } = useAuth();
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);
  const [showVisitForm, setShowVisitForm] = useState(false);

  if (!property) return null;

  const images = (property.property_media || []).filter((m: any) => !m.type || m.type === 'image');
  const isOwner = property.owner_id === user?.id;
  const isViewerOwnerRole = roles.includes('owner');
  const hideActions = isViewerOwnerRole && !isOwner;
  const fav = isFavorite ? isFavorite(property.id) : false;

  const nextImage = () => setCurrentImage(i => (i + 1) % images.length);
  const prevImage = () => setCurrentImage(i => (i - 1 + images.length) % images.length);

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { onClose(); setCurrentImage(0); setShowVisitForm(false); } }}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 z-[1200]">
        <ScrollArea className="h-full">
          {images.length > 0 ? (
            <div className="relative aspect-video bg-muted">
              <img src={images[currentImage]?.url} alt="" className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-primary' : 'bg-background/50'}`} />
                    ))}
                  </div>
                  <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full">{currentImage + 1}/{images.length}</span>
                </>
              )}
              <button onClick={onClose} className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"><X className="h-5 w-5" /></button>
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground relative">
              {t('property.noPhoto')}
              <button onClick={onClose} className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors"><X className="h-5 w-5" /></button>
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-4 space-y-4 pb-8">
            <SheetHeader className="p-0">
              <div className="flex gap-2 flex-wrap mb-1">
                <Badge>{typeLabels[property.type] || property.type}</Badge>
                <Badge variant="secondary">{property.operations === 'freehold' ? 'Freehold' : property.operations === 'leasehold' ? 'Leasehold' : property.operations === 'home_exchange' ? 'Home Exchange' : property.operations === 'location' ? t('property.rental') : property.operations}</Badge>
                {property.droit && <Badge variant="outline">{droitLabels[property.droit] || property.droit}</Badge>}
              </div>
              <SheetTitle className="text-2xl font-bold text-primary">{displayPrice(property.prix, property.prix_currency)}</SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-1 text-muted-foreground">
              <img src={iconMap} alt="" className="h-4 w-4 object-contain shrink-0" /><span className="text-sm">{property.adresse}</span>
            </div>

            {property.secteur && <p className="text-sm text-muted-foreground">{t('property.sector')} : {property.secteur}</p>}

            <div className="flex gap-4 text-sm text-muted-foreground">
              {property.surface && <span className="flex items-center gap-1"><img src={iconSearch} alt="" className="h-4 w-4 object-contain" />{property.surface} m²</span>}
              <span className="flex items-center gap-1"><img src={iconHome} alt="" className="h-4 w-4 object-contain" />{property.chambres}</span>
              <span className="flex items-center gap-1">🚿 {property.salles_bain}</span>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400 dark:border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="text-base font-bold text-amber-800 dark:text-amber-200">{t('property.importantInfo')}</p>
                <p className="text-sm text-amber-700 dark:text-amber-200/80 mt-1.5 leading-relaxed">
                  {t('property.disclaimerText')}<br /><strong>{t('property.disclaimerBold')}</strong>
                </p>
              </div>
            </div>

            {/* Document status */}
            <div className="bg-secondary/50 border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">📄 {t('property.docStatus')}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30 font-medium">⬜ {t('property.docNotProvided')}</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">⬜ {t('property.docInProgress')}</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">⬜ {t('property.docProvided')}</span>
              </div>
            </div>

            {property.description && (
              <div>
                <h3 className="font-semibold mb-1 text-foreground">{t('property.description')}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {property.equipements && (property.equipements as string[]).length > 0 && (
              <EquipmentGrid equipments={property.equipements as string[]} />
            )}

            {showBuyerActions && !isOwner && (
              <div className="flex gap-2">
                <Button className="flex-1" variant="destructive" onClick={() => onLike?.(property)}>
                  <Heart className="h-4 w-4 mr-2" /> {t('property.match')}
                </Button>
                <Button className="flex-1" variant={fav ? 'default' : 'secondary'} onClick={() => onToggleFavorite?.(property.id)}>
                  <Star className={`h-4 w-4 mr-2 ${fav ? 'fill-current' : ''}`} />
                  {fav ? t('property.favoriteAdded') : t('property.favorite')}
                </Button>
              </div>
            )}

            {!isOwner && !hideActions && (
              <Button className="w-full" variant="outline" onClick={() => setShowVisitForm(true)}>
                <CalendarDays className="h-4 w-4 mr-2" /> {t('property.requestVisit')}
              </Button>
            )}

            {showVisitForm && !hideActions && (
              <VisitForm propertyId={property.id} ownerId={property.owner_id} onClose={() => setShowVisitForm(false)} />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
