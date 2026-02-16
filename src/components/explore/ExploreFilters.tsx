import { useState, useCallback } from 'react';
import { Filter, X, Search, MapPin, Car, Bike, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ExploreFilterValues {
  operation: string | null;
  type: string | null;
  priceRange: [number, number];
  surfaceRange: [number, number];
  chambresMin: number;
  secteurs: string[];
  // Method 1: address search
  searchAddress: string;
  searchRadius: number; // in km
  transportMode: 'scooter' | 'voiture' | 'pied';
  searchMethod: 'filters' | 'address';
}

const DEFAULT_FILTERS: ExploreFilterValues = {
  operation: null,
  type: null,
  priceRange: [0, 10000000000],
  surfaceRange: [0, 1000],
  chambresMin: 0,
  secteurs: [],
  searchAddress: '',
  searchRadius: 5,
  transportMode: 'voiture',
  searchMethod: 'filters',
};

const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'studio', label: 'Studio' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'entrepot', label: 'Entrepôt' },
];

const SECTORS = [
  'Amed', 'Balangan', 'Balian', 'Bangli', 'Batubelig', 'Batu Bolong', 'Berawa', 'Bingin',
  'Bukit', 'Candidasa', 'Canggu', 'Denpasar', 'Echo Beach', 'Gianyar', 'Jatiluwih',
  'Jimbaran', 'Karangasem', 'Keramas', 'Kerobokan', 'Klungkung', 'Kuta', 'Legian',
  'Lembongan', 'Lovina', 'Medewi', 'Mengwi', 'Munduk', 'Negara', 'Nusa Ceningan',
  'Nusa Dua', 'Nusa Penida', 'Padang Padang', 'Pecatu', 'Pemuteran', 'Pererenan',
  'Sanur', 'Selemadeg', 'Seminyak', 'Sidemen', 'Singaraja', 'Tabanan', 'Tanah Lot',
  'Tegallalang', 'Tibubeneng', 'Ubud', 'Uluwatu', 'Ungasan',
];

const TRANSPORT_MODES = [
  { value: 'scooter' as const, label: 'Scooter', icon: Bike },
  { value: 'voiture' as const, label: 'Voiture', icon: Car },
  { value: 'pied' as const, label: 'À pied', icon: Footprints },
];

interface ExploreFiltersProps {
  filters: ExploreFilterValues;
  onFiltersChange: (filters: ExploreFilterValues) => void;
  activeCount: number;
}

function formatPrice(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M IDR`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt IDR`;
  return `${value.toLocaleString()} IDR`;
}

// Multi-select sectors component
function SectorMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sectors: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = SECTORS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (sector: string) => {
    if (selected.includes(sector)) {
      onChange(selected.filter(s => s !== sector));
    } else {
      onChange([...selected, sector]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          <span className={selected.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
            {selected.length === 0
              ? 'Tous les secteurs'
              : `${selected.length} secteur${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`}
          </span>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 z-50 bg-popover" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Rechercher un secteur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        {selected.length > 0 && (
          <div className="px-2 py-1.5 border-b border-border">
            <button
              onClick={() => onChange([])}
              className="text-xs text-primary hover:underline"
            >
              Tout désélectionner
            </button>
          </div>
        )}
        <ScrollArea className="h-52">
          <div className="p-2 space-y-0.5">
            {filtered.map(sector => (
              <label
                key={sector}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selected.includes(sector)}
                  onCheckedChange={() => toggle(sector)}
                />
                <span>{sector}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function ExploreFilters({ filters, onFiltersChange, activeCount }: ExploreFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ExploreFilterValues>(filters);

  const handleApply = () => {
    onFiltersChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          Filtres
          {activeCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Recherche de biens</SheetTitle>
          <SheetDescription>Choisissez votre méthode de recherche</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-4 overflow-y-auto pb-24">
          {/* Search Method Toggle */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Méthode de recherche</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft(d => ({ ...d, searchMethod: 'address' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  draft.searchMethod === 'address'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Par adresse
              </button>
              <button
                onClick={() => setDraft(d => ({ ...d, searchMethod: 'filters' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  draft.searchMethod === 'filters'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border'
                }`}
              >
                <Filter className="h-4 w-4" />
                Par filtres
              </button>
            </div>
          </div>

          {/* Method 1: Address Search */}
          {draft.searchMethod === 'address' && (
            <div className="space-y-4 p-4 rounded-xl border border-border bg-secondary/30">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Adresse</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Saisissez une adresse à Bali..."
                    value={draft.searchAddress}
                    onChange={e => setDraft(d => ({ ...d, searchAddress: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Rayon : {draft.searchRadius} km
                </label>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[draft.searchRadius]}
                  onValueChange={v => setDraft(d => ({ ...d, searchRadius: v[0] }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Mode de déplacement</label>
                <div className="flex gap-2">
                  {TRANSPORT_MODES.map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.value}
                        onClick={() => setDraft(d => ({ ...d, transportMode: mode.value }))}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-sm font-medium border transition-colors ${
                          draft.transportMode === mode.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary text-foreground border-border'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Method 2: Classic Filters */}
          {draft.searchMethod === 'filters' && (
            <div className="space-y-6">
              {/* Operation */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Opération</label>
                <div className="flex gap-2">
                  {[{ value: 'freehold', label: 'Freehold' }, { value: 'leasehold', label: 'Leasehold' }, { value: 'location', label: 'Location' }].map(op => (
                    <button
                      key={op.value}
                      onClick={() => setDraft(d => ({ ...d, operation: d.operation === op.value ? null : op.value }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        draft.operation === op.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-foreground border-border'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type de bien</label>
                <Select value={draft.type || ''} onValueChange={v => setDraft(d => ({ ...d, type: v || null }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Secteurs multi-select */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Secteurs</label>
                <SectorMultiSelect
                  selected={draft.secteurs}
                  onChange={secteurs => setDraft(d => ({ ...d, secteurs }))}
                />
                {draft.secteurs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {draft.secteurs.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1 text-xs">
                        {s}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setDraft(d => ({ ...d, secteurs: d.secteurs.filter(x => x !== s) }))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common filters (always visible) */}
          <div className="space-y-6 pt-2 border-t border-border">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Budget: {formatPrice(draft.priceRange[0])} — {formatPrice(draft.priceRange[1])}
              </label>
              <Slider
                min={0}
                max={10000000000}
                step={100000000}
                value={draft.priceRange}
                onValueChange={(v) => setDraft(d => ({ ...d, priceRange: v as [number, number] }))}
                className="mt-2"
              />
            </div>

            {/* Surface Range */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Surface: {draft.surfaceRange[0]}m² — {draft.surfaceRange[1]}m²
              </label>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={draft.surfaceRange}
                onValueChange={(v) => setDraft(d => ({ ...d, surfaceRange: v as [number, number] }))}
                className="mt-2"
              />
            </div>

            {/* Chambres */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Chambres minimum</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setDraft(d => ({ ...d, chambresMin: n }))}
                    className={`w-11 h-11 rounded-lg text-sm font-medium border transition-colors ${
                      draft.chambresMin === n
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-foreground border-border'
                    }`}
                  >
                    {n === 0 ? 'Tous' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function useFilterCount(filters: ExploreFilterValues): number {
  let count = 0;
  if (filters.operation) count++;
  if (filters.type) count++;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000000) count++;
  if (filters.surfaceRange[0] > 0 || filters.surfaceRange[1] < 1000) count++;
  if (filters.chambresMin > 0) count++;
  if (filters.secteurs.length > 0) count++;
  if (filters.searchAddress) count++;
  return count;
}

export { DEFAULT_FILTERS };
