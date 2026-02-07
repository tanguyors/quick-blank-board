import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { LayoutGrid, Map } from 'lucide-react';
import { lazy, Suspense } from 'react';

const PropertyMap = lazy(() => import('@/components/map/PropertyMap').then(m => ({ default: m.PropertyMap })));

export default function Explore() {
  const [view, setView] = useState<'swipe' | 'carte'>('swipe');

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Top bar with toggle */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-2xl">𝔫</span>
            <span className="text-foreground font-semibold">SomaGate</span>
          </div>

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

          <div className="w-12" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'swipe' ? (
            <SwipeStack />
          ) : (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }>
              <PropertyMap />
            </Suspense>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
