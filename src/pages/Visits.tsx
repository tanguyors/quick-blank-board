import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { VisitList } from '@/components/visits/VisitList';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'confirmed', label: 'Acceptées' },
  { value: 'pending', label: 'Demandées' },
  { value: 'completed', label: 'Réalisées' },
  { value: 'cancelled', label: 'Refusées' },
] as const;

export default function Visits() {
  const [filter, setFilter] = useState<string>('all');

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Visites</span>
        </div>
      </PageTopBar>

      {/* Status filter chips */}
      <div className="overflow-x-auto scrollbar-hide border-b border-border">
        <div className="flex gap-1.5 px-4 py-2 min-w-max">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <VisitList statusFilter={filter} />
    </AppLayout>
  );
}
