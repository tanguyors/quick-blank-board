import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X, ArrowLeft } from 'lucide-react';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function PropertyMap() {
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();
  const [filters, setFilters] = useState({ type: '', operation: '', minPrice: '', maxPrice: '' });
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [filters.type, filters.operation, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const { data: properties } = useQuery({
    queryKey: ['map-properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*, property_media(url, is_primary)')
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

  return (
    <div className="relative h-full w-full">
      {/* Floating top bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between">
        <Button
          size="sm"
          variant="secondary"
          className="shadow-lg"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
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

      {/* Floating filter panel */}
      {showFilters && (
        <div className="absolute top-14 right-3 z-[1000] bg-card border border-border rounded-xl shadow-xl p-4 w-72 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Filtres</span>
            <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Select value={filters.type || 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Type de bien" /></SelectTrigger>
            <SelectContent className="z-[1100]">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.operation || 'all'} onValueChange={v => setFilters(f => ({ ...f, operation: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Opération" /></SelectTrigger>
            <SelectContent className="z-[1100]">
              <SelectItem value="all">Toutes les opérations</SelectItem>
              <SelectItem value="vente">Vente</SelectItem>
              <SelectItem value="location">Location</SelectItem>
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
      <MapContainer center={[-8.45, 115.26]} zoom={10} className="h-full w-full" style={{ minHeight: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties?.map(p => (
          p.latitude && p.longitude && (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={defaultIcon}>
              <Popup maxWidth={280} minWidth={220}>
                <div className="min-w-[200px]">
                  {(() => {
                    const primaryImg = (p.property_media as any[])?.find((m: any) => m.is_primary) || (p.property_media as any[])?.[0];
                    return primaryImg ? (
                      <img src={primaryImg.url} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-lg mb-2 flex items-center justify-center text-muted-foreground text-xs">Pas de photo</div>
                    );
                  })()}
                  <p className="font-bold text-base mb-0.5">{displayPrice(p.prix, p.prix_currency)}</p>
                  <p className="text-sm text-muted-foreground mb-0.5">{p.type} · {p.chambres} ch. · {p.salles_bain} sdb</p>
                  <p className="text-xs text-muted-foreground mb-2">{p.adresse}</p>
                  <button
                    onClick={() => navigate(`/properties/${p.id}`)}
                    className="w-full text-center bg-primary text-primary-foreground text-sm font-medium py-1.5 rounded-lg hover:opacity-90 transition-opacity"
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
  );
}
