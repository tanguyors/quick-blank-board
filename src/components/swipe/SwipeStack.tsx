import { useState, useRef, useCallback } from 'react';
import { useExplorableProperties, useSwipe } from '@/hooks/useSwipes';
import { SwipeCard } from './SwipeCard';
import { MatchAnimation } from './MatchAnimation';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';

export function SwipeStack() {
  const { data: properties, isLoading } = useExplorableProperties();
  const swipe = useSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const currentProperty = properties?.[currentIndex];

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!currentProperty || swipe.isPending) return;
    setSwipeDirection(direction);
    try {
      const result = await swipe.mutateAsync({
        propertyId: currentProperty.id,
        direction,
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
      handleSwipe(offset.x > 0 ? 'right' : 'left');
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (!currentProperty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Plus de biens à explorer</h2>
        <p className="text-muted-foreground">Revenez plus tard pour découvrir de nouveaux biens !</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-4">
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

      {offset.x < -50 && (
        <div className="absolute top-20 right-8 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-lg rotate-12">PASSER</div>
      )}
      {offset.x > 50 && (
        <div className="absolute top-20 left-8 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold text-lg -rotate-12">J'AIME</div>
      )}

      <div className="flex gap-8 mt-6">
        <Button
          size="lg" variant="outline"
          className="rounded-full h-16 w-16 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleSwipe('left')} disabled={swipe.isPending}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => handleSwipe('right')} disabled={swipe.isPending}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>

      {showMatch && <MatchAnimation onClose={() => setShowMatch(false)} />}
    </div>
  );
}
