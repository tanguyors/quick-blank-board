import { useState, useEffect, lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ExploreFilters, DEFAULT_FILTERS, useFilterCount, type ExploreFilterValues } from '@/components/explore/ExploreFilters';
import { LayoutGrid, Map, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import logoSoma from '@/assets/logo-soma.png';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [view, setView] = useState<'swipe' | 'carte'>('swipe');
  const [filters, setFilters] = useState<ExploreFilterValues>(DEFAULT_FILTERS);
  const activeFilterCount = useFilterCount(filters);
  const [showGeoDialog, setShowGeoDialog] = useState(false);

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
        () => toast.success(t('explore.locationEnabled')),
        () => toast.info(t('explore.enableLocationHint'))
      );
    }
  };

  const handleGeoDecline = () => {
    sessionStorage.setItem('geo_asked', '1');
    setShowGeoDialog(false);
  };

  return (
    <AppLayout hideHeader>
      <AlertDialog open={showGeoDialog} onOpenChange={setShowGeoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">{t('explore.allowLocation')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('explore.allowLocationDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction onClick={handleGeoAccept} className="w-full">
              {t('explore.allow')}
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleGeoDecline} className="w-full">
              {t('explore.later')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col" style={{ height: 'calc(100dvh - 5rem)' }}>
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
            <span className="text-foreground font-semibold">SomaGate</span>
          </div>
          <div className="flex items-center gap-1">
            <ExploreFilters filters={filters} onFiltersChange={setFilters} activeCount={activeFilterCount} />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex justify-center px-4 pb-2 flex-shrink-0">
            <div className="flex items-center bg-secondary rounded-full p-1">
              <button
                onClick={() => setView('swipe')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  view === 'swipe' ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> {t('explore.swipe')}
              </button>
              <button
                onClick={() => setView('carte')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  view === 'carte' ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                <Map className="h-4 w-4" /> {t('explore.map')}
              </button>
            </div>
          </div>

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
