import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function PropertyMap() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: '', operation: '', minPrice: '', maxPrice: '' });

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
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex gap-2 overflow-x-auto">
        <Select value={filters.type || 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? '' : v }))}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="appartement">Appart.</SelectItem>
            <SelectItem value="terrain">Terrain</SelectItem>
            <SelectItem value="maison">Maison</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.operation || 'all'} onValueChange={v => setFilters(f => ({ ...f, operation: v === 'all' ? '' : v }))}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Opération" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Prix min" className="w-24" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
        <Input type="number" placeholder="Prix max" className="w-24" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
      </div>
      <div className="flex-1">
        <MapContainer center={[5.35, -4.0]} zoom={12} className="h-full w-full" style={{ minHeight: '400px' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {properties?.map(p => (
            p.latitude && p.longitude && (
              <Marker key={p.id} position={[p.latitude, p.longitude]} icon={defaultIcon}>
                <Popup>
                  <div className="min-w-[180px]">
                    {(p.property_media as any)?.[0] && (
                      <img src={(p.property_media as any)[0].url} alt="" className="w-full h-20 object-cover rounded mb-2" />
                    )}
                    <p className="font-bold">{p.prix.toLocaleString()} {p.prix_currency}</p>
                    <p className="text-sm">{p.adresse}</p>
                    <button onClick={() => navigate(`/properties/${p.id}`)} className="text-primary text-sm underline mt-1">
                      Voir le détail
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
