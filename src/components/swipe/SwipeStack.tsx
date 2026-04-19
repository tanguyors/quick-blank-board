import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExplorableProperties, useSwipe } from '@/hooks/useSwipes';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { useFavorites } from '@/hooks/useFavorites';
import { SwipeCard } from './SwipeCard';
import { MatchAnimation } from './MatchAnimation';
import { PropertyDetailSheet } from '@/components/map/PropertyDetailSheet';
import { Undo2, X, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { ExploreFilterValues } from '@/components/explore/ExploreFilters';

import iconMatches from '@/assets/icons/matches.png';

interface SwipeStackProps {
  filters?: ExploreFilterValues;
}

export function SwipeStack({ filters }: SwipeStackProps) {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useExplorableProperties(filters);
  const swipe = useSwipe();
  const navigate = useNavigate();
  const { needsPreferences } = useBuyerPreferences();
  const { addFavorite, isFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const currentProperty = properties?.[currentIndex];
  const totalCount = properties?.length || 0;

  const handleMatch = useCallback(async () => {
    if (!currentProperty || swipe.isPending) return;
    setSwipeDirection('right');
    try {
      const result = await swipe.mutateAsync({
        propertyId: currentProperty.id,
        direction: 'right',
        ownerId: currentProperty.owner_id,
      });
      setTimeout(() => {
        setSwipeDirection(null);
        setOffset({ x: 0, y: 0 });
        setCurrentIndex(prev => prev + 1);
        if (result.matched) setShowMatch(true);
      }, 300);
    } catch (err) {
      console.error('handleMatch', err);
      toast.error(t('explore.swipeActionError'));
      setSwipeDirection(null);
      setOffset({ x: 0, y: 0 });
    }
  }, [currentProperty, swipe, t]);

  const handlePass = useCallback(async () => {
    if (!currentProperty || swipe.isPending) return;
    setSwipeDirection('left');
    try {
      await swipe.mutateAsync({
        propertyId: currentProperty.id,
        direction: 'left',
        ownerId: currentProperty.owner_id,
      });
      setTimeout(() => {
        setSwipeDirection(null);
        setOffset({ x: 0, y: 0 });
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } catch (err) {
      console.error('handlePass', err);
      toast.error(t('explore.swipeActionError'));
      setSwipeDirection(null);
      setOffset({ x: 0, y: 0 });
    }
  }, [currentProperty, swipe, t]);

  const handleSuperLike = useCallback(async () => {
    if (!currentProperty || swipe.isPending) return;
    setSwipeDirection('right');
    try {
      const result = await swipe.mutateAsync({
        propertyId: currentProperty.id,
        direction: 'right',
        ownerId: currentProperty.owner_id,
        isSuperLike: true,
      });
      setTimeout(() => {
        setSwipeDirection(null);
        setOffset({ x: 0, y: 0 });
        setCurrentIndex(prev => prev + 1);
        if (result.matched) setShowMatch(true);
      }, 300);
      toast.success('⭐ Super Like envoyé !');
    } catch (err) {
      console.error('handleSuperLike', err);
      toast.error(t('explore.swipeActionError'));
      setSwipeDirection(null);
      setOffset({ x: 0, y: 0 });
    }
  }, [currentProperty, swipe, t]);

  const handleFavorite = useCallback(async () => {
    if (!currentProperty || addFavorite.isPending) return;
    try {
      await addFavorite.mutateAsync(currentProperty.id);
      toast.success(t('explore.addedToFavorites'));
    } catch {
      toast.error(t('explore.alreadyFavorite'));
    }
  }, [currentProperty, addFavorite, t]);

  const onPointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  };

  const onPointerUp = () => {
    setIsDragging(false);
    if (Math.abs(offset.x) > 100) {
      if (offset.x > 0) handleMatch();
      else handlePass();
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!currentProperty) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden overscroll-none p-6 text-center sm:p-8">
        <img src={iconMatches} alt="" className="h-16 w-16 object-contain mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-foreground">{t('swipe.allHousesNotForEveryone')}</h2>
        <p className="text-muted-foreground mb-4">{t('swipe.searchingConnection')}</p>
        <p className="text-xs text-muted-foreground/60">{t('swipe.comeBackLater')}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center h-full">
      {currentIndex >= 3 && needsPreferences && (
        <div className="absolute top-2 left-4 z-10">
          <button
            onClick={() => navigate('/buyer/preferences')}
            className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-pulse"
          >
            {t('explore.startSearch')}
          </button>
        </div>
      )}

      <div className="absolute top-2 right-4 z-10">
        <span className="bg-secondary/80 text-foreground text-sm px-3 py-1.5 rounded-full font-medium">
          {currentIndex + 1}/{totalCount}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full px-4 pt-2 pb-0 min-h-0">
        <div
          className="w-full max-w-sm mx-auto touch-none"
          style={{
            transform: swipeDirection === 'left'
              ? 'translateX(-150%) rotate(-30deg)'
              : swipeDirection === 'right'
                ? 'translateX(150%) rotate(30deg)'
                : `translateX(${offset.x}px) rotate(${offset.x * 0.1}deg)`,
            transition: swipeDirection ? 'transform 0.3s ease-out, opacity 0.3s' : isDragging ? 'none' : 'transform 0.3s ease-out',
            opacity: swipeDirection ? 0 : 1,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <SwipeCard
            property={currentProperty}
            onInfoClick={() => setShowDetail(true)}
            onFavoriteClick={handleFavorite}
            isFavorite={isFavorite(currentProperty.id)}
            favoriteDisabled={addFavorite.isPending}
          />
        </div>
      </div>

      {offset.x < -50 && (
        <div className="absolute top-32 right-8 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-lg rotate-12 z-20">
          {t('explore.pass')}
        </div>
      )}
      {offset.x > 50 && (
        <div className="absolute top-32 left-8 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-lg -rotate-12 z-20">
          MATCH
        </div>
      )}

      <div className="relative z-[60] flex shrink-0 items-center justify-center gap-4 py-3">
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Retour"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handlePass}
          disabled={swipe.isPending}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(253,80,104,0.35)] transition-all hover:shadow-[0_6px_16px_rgba(253,80,104,0.45)] active:scale-95"
          aria-label={t('explore.pass')}
        >
          <X className="h-8 w-8 text-[#FD5068]" strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={handleSuperLike}
          disabled={swipe.isPending}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(94,195,250,0.40)] transition-all hover:shadow-[0_6px_18px_rgba(94,195,250,0.55)] active:scale-90"
          aria-label="Super Like"
        >
          <Star className="h-9 w-9 text-[#5EC3FA] fill-[#5EC3FA]" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={handleMatch}
          disabled={swipe.isPending}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(66,230,164,0.35)] transition-all hover:shadow-[0_6px_16px_rgba(66,230,164,0.45)] active:scale-95"
          aria-label="Match"
        >
          <Heart className="h-8 w-8 text-[#42E6A4] fill-[#42E6A4]" strokeWidth={2} />
        </button>
      </div>

      {showMatch && (
        <MatchAnimation onClose={() => {
          setShowMatch(false);
          if (needsPreferences) navigate('/buyer/preferences');
        }} />
      )}

      <PropertyDetailSheet
        property={currentProperty}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        showBuyerActions
        onLike={() => { setShowDetail(false); handleMatch(); }}
        onToggleFavorite={() => handleFavorite()}
        isFavorite={(id) => isFavorite(id)}
      />
    </div>
  );
}
