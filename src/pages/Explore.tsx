import { useState, useEffect, lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ExploreFilters, DEFAULT_FILTERS, useFilterCount, type ExploreFilterValues } from '@/components/explore/ExploreFilters';
import { LayoutGrid, Map, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import logoSoma from '@/assets/logo-soma.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PropertyMap = lazy(() => import('@/components/map/PropertyMap').then(m => ({ default: m.PropertyMap })));

export default function Explore() {
  const [view, setView] = useState<'swipe' | 'carte'>('swipe');
  const [filters, setFilters] = useState<ExploreFilterValues>(DEFAULT_FILTERS);
  const activeFilterCount = useFilterCount(filters);
  const [showGeoDialog, setShowGeoDialog] = useState(false);

  // Show geolocation permission dialog on first load
  useEffect(() => {
    const asked = sessionStorage.getItem('geo_asked');
    if (!asked) {
      setShowGeoDialog(true);
    }
  }, []);

  const handleGeoAccept = () => {
    sessionStorage.setItem('geo_asked', '1');
    setShowGeoDialog(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => toast.success('Position activée !'),
        () => toast.info('Activez la localisation pour une meilleure expérience.')
      );
    }
  };

  const handleGeoDecline = () => {
    sessionStorage.setItem('geo_asked', '1');
    setShowGeoDialog(false);
  };

  return (
    <AppLayout hideHeader>
      {/* Geolocation permission dialog */}
      <AlertDialog open={showGeoDialog} onOpenChange={setShowGeoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">Autoriser la localisation</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Autoriser l'application Soma Gate à accéder à la position de cet appareil pour vous proposer des biens à proximité.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction onClick={handleGeoAccept} className="w-full">
              Autoriser
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleGeoDecline} className="w-full">
              Plus tard
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col" style={{ height: 'calc(100dvh - 5rem)' }}>
        {/* Top bar: logo + icons */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
            <span className="text-foreground font-semibold">SomaGate</span>
          </div>

          <div className="flex items-center gap-1">
            <ExploreFilters
              filters={filters}
              onFiltersChange={setFilters}
              activeCount={activeFilterCount}
            />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>

        {/* Content area with centered toggle */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Swipe / Carte toggle - inside content area */}
          <div className="flex justify-center px-4 pb-2 flex-shrink-0">
            <div className="flex items-center bg-secondary rounded-full p-1">
              <button
                onClick={() => setView('swipe')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  view === 'swipe' ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> Swipe
              </button>
              <button
                onClick={() => setView('carte')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  view === 'carte' ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                <Map className="h-4 w-4" /> Carte
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-h-0">
            {view === 'swipe' ? (
              <SwipeStack filters={filters} />
            ) : (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              }>
                <PropertyMap embedded />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
