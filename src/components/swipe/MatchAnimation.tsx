import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface MatchAnimationProps {
  onClose: () => void;
}

export function MatchAnimation({ onClose }: MatchAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="text-center text-primary-foreground">
        <Heart className="h-24 w-24 mx-auto mb-4 text-destructive fill-destructive animate-bounce" />
        <h2 className="text-4xl font-bold mb-2">C'est un Match !</h2>
        <p className="text-lg mb-6 text-primary-foreground/80">Vous pouvez maintenant discuter avec le propriétaire</p>
        <Button variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-foreground" onClick={onClose}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
