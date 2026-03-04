import { useState } from 'react';
import { useProperty } from '@/hooks/useProperties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { VisitForm } from '@/components/visits/VisitForm';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { EquipmentGrid } from '@/components/properties/EquipmentIcon';
import { useTranslation } from 'react-i18next';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/home.png';
import iconSearch from '@/assets/icons/search.png';

interface PropertyDetailProps {
  propertyId: string;
  readOnly?: boolean;
}

export function PropertyDetail({ propertyId, readOnly = false }: PropertyDetailProps) {
  const { data: property, isLoading } = useProperty(propertyId);
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();
  const { t } = useTranslation();
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!property) return <div className="text-center p-8">{t('property.notFound')}</div>;

  const isOwner = property.owner_id === user?.id;
  const isViewerOwnerRole = roles.includes('owner');
  const hideActions = readOnly || (isViewerOwnerRole && !isOwner);
  const images = property.property_media
    ?.filter(m => m.type === 'image')
    .sort((a, b) => a.position - b.position) || [];

  return (
    <div className="pb-20">
      {images.length > 0 ? (
        <div className="relative aspect-video bg-muted">
          <img src={images[currentImage]?.url} alt="" className="w-full h-full object-cover" />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full ${i === currentImage ? 'bg-primary-foreground' : 'bg-primary-foreground/50'}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">{t('property.noPhoto')}</div>
      )}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <Badge>{property.type}</Badge>
              <Badge variant="secondary">
                {property.operations === 'vente' || property.operations === 'freehold'
                  ? 'Freehold'
                  : property.operations === 'leasehold'
                    ? 'Leasehold'
                    : property.operations === 'location'
                      ? t('property.rental')
                      : property.operations === 'achat'
                        ? t('property.purchase')
                        : property.operations}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-primary">{displayPrice(property.prix, property.prix_currency)}</p>
          </div>
          {isOwner && (
            <Button variant="outline" size="icon" onClick={() => navigate(`/properties/${property.id}/edit`)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" /><span>{property.adresse}</span>
        </div>
        <div className="flex gap-4 text-sm text-foreground">
          {property.surface && <span className="flex items-center gap-1"><Ruler className="h-5 w-5 text-primary" />{property.surface} m²</span>}
          <span className="flex items-center gap-1"><BedDouble className="h-5 w-5 text-primary" />{property.chambres}</span>
          <span className="flex items-center gap-1"><Bath className="h-5 w-5 text-primary" />{property.salles_bain}</span>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400 dark:border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-base font-bold text-amber-800 dark:text-amber-200">{t('property.importantInfo')}</p>
            <p className="text-sm text-amber-700 dark:text-amber-200/80 mt-1.5 leading-relaxed">
              {t('property.disclaimerText')}
              <br /><strong>{t('property.disclaimerBold')}</strong>
            </p>
          </div>
        </div>

        {/* Document status */}
        <div className="bg-secondary/50 border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">📄 {t('property.docStatus')}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30 font-medium">
              ⬜ {t('property.docNotProvided')}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
              ⬜ {t('property.docInProgress')}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
              ⬜ {t('property.docProvided')}
            </span>
          </div>
        </div>
        {property.description && (
          <div>
            <h3 className="font-semibold mb-1">{t('property.description')}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
          </div>
        )}
        {property.equipements && (property.equipements as string[]).length > 0 && (
          <EquipmentGrid equipments={property.equipements as string[]} />
        )}
        {!isOwner && !hideActions && (
          <Button className="w-full" onClick={() => setShowVisitForm(true)}>
            <CalendarDays className="h-4 w-4 mr-2" /> {t('property.requestVisit')}
          </Button>
        )}
        {showVisitForm && !hideActions && (
          <VisitForm propertyId={property.id} ownerId={property.owner_id} onClose={() => setShowVisitForm(false)} />
        )}
      </div>
    </div>
  );
}
