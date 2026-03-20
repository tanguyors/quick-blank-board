import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X, ArrowLeft, Heart, Star, MessageCircle } from 'lucide-react';
import logoSoma from '@/assets/logo-soma.png';
import { PropertyDetailSheet } from './PropertyDetailSheet';
import { useAuth } from '@/hooks/useAuth';
import { useSwipe } from '@/hooks/useSwipes';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';

type MarkerColor = 'seen' | 'favorite' | 'default';

function createPriceIcon(priceLabel: string, color: MarkerColor = 'default') {
  const bgMap: Record<MarkerColor, string> = {
    seen: '#9ca3af',
    favorite: '#06b6d4',
    default: '#faf7f2',
  };
  const textMap: Record<MarkerColor, string> = {
    seen: '#ffffff',
    favorite: '#ffffff',
    default: '#1a1a1a',
  };
  const bg = bgMap[color];
  const text = textMap[color];
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${bg};
      color: ${text};
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 8px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      border: 2px solid white;
      text-align: center;
      line-height: 1.3;
      display: inline-block;
      transform: translate(-50%, -50%);
    ">${priceLabel}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -15],
  });
}

interface PropertyMapProps {
  /** Hide the top banner (used when embedded inside Explore which has its own header) */
  embedded?: boolean;
}

export function PropertyMap({ embedded = false }: PropertyMapProps) {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { displayPrice } = useDisplayPrice();
  const [filters, setFilters] = useState({ type: '', operation: '', minPrice: '', maxPrice: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const isBuyer = !roles.includes('owner') && !roles.includes('notaire') && !roles.includes('admin');
  const swipeMutation = useSwipe();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const activeFilterCount = [filters.type, filters.operation, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  // Fetch user's swipes to know which properties were seen
  const { data: userSwipes } = useQuery({
    queryKey: ['user-swipes-map', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('swipes')
        .select('property_id')
        .eq('user_id', user!.id);
      return new Set(data?.map(s => s.property_id) || []);
    },
    enabled: !!user,
  });

  // Fetch user's favorites
  const { data: userFavIds } = useQuery({
    queryKey: ['user-fav-ids-map', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user!.id);
      return new Set(data?.map(f => f.property_id) || []);
    },
    enabled: !!user,
  });

  const { data: properties } = useQuery({
    queryKey: ['map-properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*, property_media(url, is_primary, type)')
        .eq('is_published', true)
        .eq('status', 'available')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      if (filters.type) query = query.eq('type', filters.type as any);
      if (filters.operation) query = query.eq('operations', filters.operation as any);
      if (filters.minPrice) query = query.gte('prix', Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte('prix', Number(filters.maxPrice));
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getMarkerColor = (propertyId: string): MarkerColor => {
    if (userFavIds?.has(propertyId)) return 'favorite';
    if (userSwipes?.has(propertyId)) return 'seen';
    return 'default';
  };

  const priceIcons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    properties?.forEach(p => {
      const label = displayPrice(p.prix, p.prix_currency);
      map.set(p.id, createPriceIcon(label, getMarkerColor(p.id)));
    });
    return map;
  }, [properties, displayPrice, userSwipes, userFavIds]);

  const handleLike = async (p: any) => {
    try {
      await swipeMutation.mutateAsync({ propertyId: p.id, direction: 'right', ownerId: p.owner_id });
      toast.success('Match créé ! Vous pouvez maintenant discuter.');
    } catch {
      toast.error('Erreur lors du match');
    }
  };

  const handleToggleFavorite = (propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFavorite.mutate(propertyId);
      toast.success('Retiré des favoris');
    } else {
      addFavorite.mutate(propertyId);
      toast.success('Ajouté aux favoris');
    }
  };

  const handleMessage = (p: any) => {
    // Open detail sheet which has the visit/message functionality
    setSelectedProperty(p);
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Top banner — only shown in standalone mode */}
      {!embedded && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-background border-b border-border shrink-0">
          <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img src={logoSoma} alt="SomaGate" className="h-7 w-7 object-contain" />
            <span className="text-foreground font-semibold text-base">SomaGate</span>
          </div>
          <Button
            size="sm"
            variant={showFilters ? 'default' : 'ghost'}
            className="gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Embedded floating filter button */}
      {embedded && (
        <div className="absolute top-3 right-3 z-[1000]">
          <Button
            size="sm"
            variant={showFilters ? 'default' : 'secondary'}
            className="shadow-lg gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {showFilters && (
        <div className={`absolute ${embedded ? 'top-14' : 'top-[calc(2.75rem+1px)]'} right-3 z-[1000] bg-card border border-border rounded-xl shadow-xl p-4 w-72 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Filtres</span>
            <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Select value={filters.operation || 'all'} onValueChange={v => setFilters(f => ({ ...f, operation: v === 'all' ? '' : v, type: '' }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Opération" /></SelectTrigger>
            <SelectContent className="z-[1100]">
              <SelectItem value="all">Toutes les opérations</SelectItem>
              <SelectItem value="freehold">Freehold</SelectItem>
              <SelectItem value="leasehold">Leasehold</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="home_exchange">Home Exchange</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.type || 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Type de bien" /></SelectTrigger>
            <SelectContent className="z-[1100]">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="bureau">Bureau</SelectItem>
              <SelectItem value="commerce">Commerce</SelectItem>
              <SelectItem value="entrepot">Entrepôt</SelectItem>
              {filters.operation !== 'location' && (
                <>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="maison_a_renover">Maison à rénover</SelectItem>
                </>
              )}
              {(filters.operation !== 'freehold' && filters.operation !== 'leasehold') && (
                <>
                  <SelectItem value="colocation_longue">Colocation longue</SelectItem>
                  <SelectItem value="colocation_courte">Colocation courte</SelectItem>
                  <SelectItem value="hebergement_service">Hébergement service</SelectItem>
                  <SelectItem value="hebergement_animaux">Hébergement animaux</SelectItem>
                  <SelectItem value="guesthouse">Guesthouse</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Prix min" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
            <Input type="number" placeholder="Prix max" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setFilters({ type: '', operation: '', minPrice: '', maxPrice: '' })}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {/* Full-screen map */}
      <div className="flex-1 relative">
        <MapContainer center={[-8.45, 115.26]} zoom={10} className="h-full w-full" style={{ minHeight: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {properties?.map(p => (
            p.latitude && p.longitude && (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={priceIcons.get(p.id) || createPriceIcon('—')}
              >
                <Popup maxWidth={260} minWidth={200}>
                  <div className="min-w-[180px]">
                    {(() => {
                      const primaryImg = (p.property_media as any[])?.find((m: any) => m.is_primary) || (p.property_media as any[])?.[0];
                      return primaryImg ? (
                        <img src={primaryImg.url} alt="" className="w-full h-28 object-cover rounded-lg mb-2" />
                      ) : (
                        <div className="w-full h-28 bg-muted rounded-lg mb-2 flex items-center justify-center text-muted-foreground text-xs">Pas de photo</div>
                      );
                    })()}
                    <p className="font-bold text-sm mb-0.5">{displayPrice(p.prix, p.prix_currency)}</p>
                    <p className="text-xs font-medium mb-0.5">{p.operations === 'freehold' ? 'Freehold' : p.operations === 'leasehold' ? 'Leasehold' : p.operations === 'home_exchange' ? 'Home Exchange' : 'Location'} · {p.type}</p>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {p.chambres} ch. · {p.salles_bain} sdb{p.surface ? ` · ${p.surface} m²` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">{p.adresse}</p>

                    {/* Buyer action buttons */}
                    {isBuyer && p.owner_id !== user?.id && (
                      <div className="flex gap-1.5 mb-2">
                        <button
                          onClick={() => handleLike(p)}
                          className="flex-1 flex items-center justify-center gap-1 bg-destructive text-destructive-foreground text-xs font-medium py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                          title="Matcher"
                        >
                          <Heart className="h-3.5 w-3.5" /> Match
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(p.id)}
                          className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg hover:opacity-90 transition-opacity ${
                            isFavorite(p.id)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                          title="Favori"
                        >
                          <Star className={`h-3.5 w-3.5 ${isFavorite(p.id) ? 'fill-current' : ''}`} />
                          {isFavorite(p.id) ? 'Favori' : 'Favori'}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedProperty(p)}
                      className="w-full text-center bg-primary text-primary-foreground text-xs font-medium py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Voir le détail
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Property detail sheet */}
      <PropertyDetailSheet
        property={selectedProperty}
        open={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        showBuyerActions={isBuyer}
        onLike={handleLike}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
      />
    </div>
  );
}