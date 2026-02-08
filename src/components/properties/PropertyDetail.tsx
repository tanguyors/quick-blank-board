import { useState } from 'react';
import { useProperty } from '@/hooks/useProperties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Ruler, Edit, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { VisitForm } from '@/components/visits/VisitForm';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';

interface PropertyDetailProps {
  propertyId: string;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const { data: property, isLoading } = useProperty(propertyId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!property) return <div className="text-center p-8">Bien non trouvé</div>;

  const isOwner = property.owner_id === user?.id;
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
        <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Pas de photo</div>
      )}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <Badge>{property.type}</Badge>
              <Badge variant="secondary">{property.operations === 'vente' ? 'Vente' : 'Location'}</Badge>
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
        <div className="flex gap-4 text-sm text-muted-foreground">
          {property.surface && <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{property.surface} m²</span>}
          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.chambres} ch.</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.salles_bain} sdb</span>
        </div>
        {property.description && (
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
          </div>
        )}
        {property.equipements && (property.equipements as string[]).length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Équipements</h3>
            <div className="flex flex-wrap gap-2">
              {(property.equipements as string[]).map(eq => <Badge key={eq} variant="outline">{eq}</Badge>)}
            </div>
          </div>
        )}
        {!isOwner && (
          <Button className="w-full" onClick={() => setShowVisitForm(true)}>
            <CalendarDays className="h-4 w-4 mr-2" /> Demander une visite
          </Button>
        )}
        {showVisitForm && (
          <VisitForm propertyId={property.id} ownerId={property.owner_id} onClose={() => setShowVisitForm(false)} />
        )}
      </div>
    </div>
  );
}
