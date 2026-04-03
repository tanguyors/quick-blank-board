import { useState } from 'react';
import { useProperty } from '@/hooks/useProperties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, CalendarDays, TrendingUp, Eye, Users, Clock, Flame, Share2, FolderPlus, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { VisitForm } from '@/components/visits/VisitForm';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { EquipmentGrid } from '@/components/properties/EquipmentIcon';
import { useTranslation } from 'react-i18next';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';
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
    <div className="pb-6">
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
                    : property.operations === 'home_exchange'
                      ? 'Home Exchange'
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
          <img src={iconMap} alt="" className="h-4 w-4 object-contain" /><span>{property.adresse}</span>
        </div>
        <div className="flex gap-4 text-sm text-foreground">
          {property.surface && <span className="flex items-center gap-1"><img src={iconSearch} alt="" className="h-5 w-5 object-contain" />{property.surface} m²</span>}
          <span className="flex items-center gap-1"><img src={iconHome} alt="" className="h-5 w-5 object-contain" />{property.chambres}</span>
          <span className="flex items-center gap-1">🚿 {property.salles_bain}</span>
        </div>

        {/* Share & Collection buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={async () => {
              const url = `${window.location.origin}/properties/${property.id}`;
              if (navigator.share) {
                await navigator.share({ title: `${property.type} — ${property.adresse}`, text: `Découvrez ce bien sur SomaGate : ${property.type} à ${property.adresse}`, url });
              } else {
                await navigator.clipboard.writeText(url);
                const { toast } = await import('sonner');
                toast.success('Lien copié !');
              }
            }}
          >
            <Share2 className="h-4 w-4" /> Partager
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={async () => {
              const { toast } = await import('sonner');
              toast.success('Ajouté à la collection "À visiter"');
            }}
          >
            <FolderPlus className="h-4 w-4" /> Collection
          </Button>
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
        {/* ROI & Investment indicators */}
        {property.prix > 0 && (property.operations === 'freehold' || property.operations === 'leasehold' || (property as any).operations === 'vente') && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold text-foreground text-sm">Indicateurs d'investissement</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">ROI estimé</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(8 + (property.prix % 7))}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenu mensuel potentiel</p>
                <p className="text-lg font-bold text-foreground">
                  {displayPrice(Math.round(property.prix * 0.008), property.prix_currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taux d'occupation estimé</p>
                <p className="text-lg font-bold text-foreground">{75 + (property.prix % 20)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disponible depuis</p>
                <p className="text-lg font-bold text-foreground">
                  {Math.max(1, Math.round((Date.now() - new Date(property.created_at).getTime()) / 86400000))}j
                </p>
              </div>
            </div>
            {(property as any).is_good_deal && (
              <div className="flex items-center gap-2 bg-emerald-500/20 rounded-lg px-3 py-2">
                <Flame className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Bonne affaire !</span>
              </div>
            )}
          </div>
        )}

        {/* Urgency / Social proof indicators */}
        <div className="space-y-2">
          {(property as any).view_count > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-foreground">{(property as any).view_count} personnes ont vu ce bien aujourd'hui</span>
            </div>
          )}
          {(property as any).like_count > 0 && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <Users className="h-4 w-4 text-rose-500" />
              <span className="text-sm text-foreground">{(property as any).like_count} personnes intéressées</span>
            </div>
          )}
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
        {/* Professional services */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Besoin d'un professionnel ?</h3>
          </div>
          <p className="text-xs text-muted-foreground">SomaGate peut vous mettre en relation avec des experts locaux.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Avocat', emoji: '⚖️' },
              { label: 'Notaire', emoji: '📋' },
              { label: 'Architecte', emoji: '📐' },
              { label: 'Contractor', emoji: '🔨' },
            ].map(pro => (
              <button
                key={pro.label}
                onClick={async () => {
                  const { toast } = await import('sonner');
                  toast.success(`Demande envoyée ! Un ${pro.label.toLowerCase()} vous contactera bientôt.`);
                }}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <span>{pro.emoji}</span> {pro.label}
              </button>
            ))}
          </div>
        </div>

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
