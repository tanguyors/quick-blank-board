import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AddressResult {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  raw: any;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    osm_key?: string;
    osm_value?: string;
  };
}

function formatFeature(f: PhotonFeature): AddressResult {
  const p = f.properties;
  const parts = [
    [p.housenumber, p.street].filter(Boolean).join(' '),
    p.name && p.name !== p.street ? p.name : null,
    p.district,
    p.city,
    p.postcode,
    p.country,
  ].filter(Boolean);
  return {
    label: parts.join(', '),
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    city: p.city || p.district,
    country: p.country,
    raw: f,
  };
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  className?: string;
  /** Biais géographique pour prioriser les résultats (défaut: Bali) */
  biasLat?: number;
  biasLng?: number;
  /** Limiter à un pays (code ISO alpha-2, ex: 'id' pour Indonésie) */
  countryCode?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Saisissez une adresse',
  className,
  biasLat = -8.45,
  biasLng = 115.26,
  countryCode,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q,
          lang: 'en',
          limit: '6',
          lat: String(biasLat),
          lon: String(biasLng),
        });
        const res = await fetch(`https://photon.komoot.io/api?${params}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Photon API error');
        const data = await res.json();
        let features: PhotonFeature[] = data.features || [];
        if (countryCode) {
          features = features.filter(f => f.properties.country?.toLowerCase().startsWith(countryCode.toLowerCase()) || f.properties.country === 'Indonesia');
        }
        setSuggestions(features.map(formatFeature));
        setOpen(true);
        setActiveIdx(-1);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('[AddressAutocomplete] fetch error:', e);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, biasLat, biasLng, countryCode]);

  const handleSelect = (s: AddressResult) => {
    onChange(s.label);
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-72 overflow-auto">
          <ul className="py-1">
            {suggestions.map((s, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm flex items-start gap-2 hover:bg-accent hover:text-accent-foreground transition-colors',
                    activeIdx === idx && 'bg-accent text-accent-foreground'
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="flex-1">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors — via Photon
          </div>
        </div>
      )}
    </div>
  );
}
