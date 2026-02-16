import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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

export interface ExploreFilterValues {
  operation: string | null;
  type: string | null;
  priceRange: [number, number];
  surfaceRange: [number, number];
  chambresMin: number;
  secteur: string | null;
}

const DEFAULT_FILTERS: ExploreFilterValues = {
  operation: null,
  type: null,
  priceRange: [0, 10000000000],
  surfaceRange: [0, 1000],
  chambresMin: 0,
  secteur: null,
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
          <SheetTitle>Filtres de recherche</SheetTitle>
          <SheetDescription>Affinez votre recherche immobilière</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-4 overflow-y-auto pb-24">
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

          {/* Secteur */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Secteur</label>
            <Select value={draft.secteur || ''} onValueChange={v => setDraft(d => ({ ...d, secteur: v || null }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  if (filters.secteur) count++;
  return count;
}

export { DEFAULT_FILTERS };
