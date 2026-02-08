import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExplorableProperties, useSwipe } from '@/hooks/useSwipes';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { useFavorites } from '@/hooks/useFavorites';
import { SwipeCard } from './SwipeCard';
import { MatchAnimation } from './MatchAnimation';
import { X, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { ExploreFilterValues } from '@/components/explore/ExploreFilters';

interface SwipeStackProps {
  filters?: ExploreFilterValues;
}

export function SwipeStack({ filters }: SwipeStackProps) {
  const { data: properties, isLoading } = useExplorableProperties(filters);
  const swipe = useSwipe();
  const navigate = useNavigate();
  const { needsPreferences } = useBuyerPreferences();
  const { addFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const currentProperty = properties?.[currentIndex];
  const totalCount = properties?.length || 0;

  // Heart = match (right swipe with conversation + transaction)
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
    } catch {
      setSwipeDirection(null);
      setOffset({ x: 0, y: 0 });
    }
  }, [currentProperty, swipe]);

  // X = pass (left swipe)
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
    } catch {
      setSwipeDirection(null);
      setOffset({ x: 0, y: 0 });
    }
  }, [currentProperty, swipe]);

  // Star = add to favorites (no match, no transaction, just bookmark)
  const handleFavorite = useCallback(async () => {
    if (!currentProperty || addFavorite.isPending) return;
    try {
      await addFavorite.mutateAsync(currentProperty.id);
      toast.success('Ajouté aux favoris ★');
    } catch {
      toast.error('Déjà dans vos favoris');
    }
  }, [currentProperty, addFavorite]);

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
      if (offset.x > 0) {
        handleMatch();
      } else {
        handlePass();
      }
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Plus de biens à explorer</h2>
        <p className="text-muted-foreground">Revenez plus tard ou ajustez vos filtres pour découvrir de nouveaux biens !</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      {/* Counter */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-secondary/80 text-foreground text-sm px-3 py-1.5 rounded-full font-medium">
          {currentIndex + 1}/{totalCount}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center w-full px-4">
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
          <SwipeCard property={currentProperty} />
        </div>
      </div>

      {/* Swipe indicators */}
      {offset.x < -50 && (
        <div className="absolute top-32 right-8 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-lg rotate-12 z-20">
          PASSER
        </div>
      )}
      {offset.x > 50 && (
        <div className="absolute top-32 left-8 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-lg -rotate-12 z-20">
          MATCH
        </div>
      )}

      {/* Action buttons: X (pass) | ★ (favorite) | ❤️ (match) */}
      <div className="flex items-center gap-6 py-6">
        <button
          onClick={handlePass}
          disabled={swipe.isPending}
          className="w-16 h-16 rounded-full border-2 border-destructive flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Passer"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={handleFavorite}
          disabled={addFavorite.isPending}
          className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background hover:bg-foreground/80 transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Star className="h-6 w-6" />
        </button>
        <button
          onClick={handleMatch}
          disabled={swipe.isPending}
          className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label="Match"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>

      {showMatch && (
        <MatchAnimation onClose={() => {
          setShowMatch(false);
          if (needsPreferences) {
            navigate('/buyer/preferences');
          }
        }} />
      )}
    </div>
  );
}
