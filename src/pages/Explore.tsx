import { useState, useEffect, lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ExploreFilters, DEFAULT_FILTERS, useFilterCount, type ExploreFilterValues } from '@/components/explore/ExploreFilters';
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

import iconDashboard from '@/assets/icons/dashboard.png';
import iconMap from '@/assets/icons/appmap.png';
import iconMapPin from '@/assets/icons/map.png';

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
    <AppLayout hideHeader lockMainScroll>
      <AlertDialog open={showGeoDialog} onOpenChange={setShowGeoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={iconMapPin} alt="" className="h-6 w-6 object-contain" />
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

      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
                <img src={iconDashboard} alt="" className="h-4 w-4 object-contain" /> {t('explore.swipe')}
              </button>
              <button
                onClick={() => setView('carte')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  view === 'carte' ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                <img src={iconMap} alt="" className="h-4 w-4 object-contain" /> {t('explore.map')}
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
