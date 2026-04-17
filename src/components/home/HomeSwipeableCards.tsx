import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import villaImg from '@/assets/onboarding-villa-1.jpg';
import apartmentImg from '@/assets/onboarding-apartment-2.jpg';
import beachImg from '@/assets/onboarding-beach-3.jpg';

interface DemoCard {
  id: number;
  image: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  surface: number;
  price: string;
}

const DEMO_CARDS: DemoCard[] = [
  { id: 1, image: villaImg, title: 'Villa Moderna', location: 'Seminyak, Bali', beds: 4, baths: 3, surface: 250, price: '$850,000' },
  { id: 2, image: apartmentImg, title: 'Apartemen Canggu', location: 'Canggu, Bali', beds: 2, baths: 2, surface: 95, price: '$320,000' },
  { id: 3, image: beachImg, title: 'Beach House', location: 'Uluwatu, Bali', beds: 5, baths: 4, surface: 380, price: '$1,250,000' },
];

/**
 * Pile de cartes animées (drag horizontal + boutons like/dislike).
 * Like = swipe droite, Dislike = swipe gauche.
 * Démo visuelle pour la home desktop publique.
 */
export function HomeSwipeableCards() {
  const [cards, setCards] = useState<DemoCard[]>(DEMO_CARDS);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const handleDecision = (dir: 'left' | 'right') => {
    setExitDirection(dir);
    setTimeout(() => {
      setCards((prev) => {
        const next = prev.slice(1);
        // Re-feed the deck so the animation loops indefinitely
        return next.length === 0 ? DEMO_CARDS : next;
      });
      setExitDirection(null);
    }, 280);
  };

  const top = cards[0];
  const next = cards[1] ?? DEMO_CARDS[(DEMO_CARDS.findIndex((c) => c.id === top?.id) + 1) % DEMO_CARDS.length];

  return (
    <div className="relative h-[500px] w-full flex items-center justify-center select-none">
      {/* Carte derrière (statique, légèrement décalée) */}
      {next && (
        <div
          className="absolute w-72 h-96 rounded-3xl bg-card border border-border shadow-xl rotate-[-6deg] -translate-x-8 opacity-90"
          aria-hidden
        />
      )}

      <AnimatePresence mode="wait">
        {top && (
          <SwipeCardItem
            key={top.id}
            card={top}
            exit={exitDirection}
            onDecide={handleDecision}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SwipeCardItemProps {
  card: DemoCard;
  exit: 'left' | 'right' | null;
  onDecide: (dir: 'left' | 'right') => void;
}

function SwipeCardItem({ card, exit, onDecide }: SwipeCardItemProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 6, 24]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 110;
    if (info.offset.x > threshold) onDecide('right');
    else if (info.offset.x < -threshold) onDecide('left');
  };

  return (
    <motion.div
      className="relative w-72 h-96 rounded-3xl overflow-hidden bg-card border border-border shadow-2xl cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        exit === 'right'
          ? { x: 600, opacity: 0, rotate: 30, transition: { duration: 0.28 } }
          : exit === 'left'
          ? { x: -600, opacity: 0, rotate: -30, transition: { duration: 0.28 } }
          : { opacity: 0 }
      }
      whileTap={{ scale: 0.98 }}
    >
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

      {/* Stamps LIKE / NOPE */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 right-6 px-3 py-1 border-4 border-primary rounded-lg rotate-[-12deg] pointer-events-none"
      >
        <span className="font-extrabold text-2xl tracking-wider text-primary">LIKE</span>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 left-6 px-3 py-1 border-4 border-destructive rounded-lg rotate-12 pointer-events-none"
      >
        <span className="font-extrabold text-2xl tracking-wider text-destructive">NOPE</span>
      </motion.div>

      {/* Infos */}
      <div className="absolute bottom-0 inset-x-0 p-5 text-white pointer-events-none">
        <h3 className="text-2xl font-bold drop-shadow-lg">{card.title}</h3>
        <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {card.location}
        </p>
        <div className="flex items-center gap-3 text-xs mt-2 opacity-90">
          <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {card.beds}</span>
          <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {card.baths}</span>
          <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {card.surface} m²</span>
        </div>
        <p className="text-xl font-bold mt-2 drop-shadow-lg">{card.price}</p>
      </div>

      {/* Boutons Like/Dislike */}
      <div className="absolute bottom-5 right-5 flex gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDecide('left');
          }}
          aria-label="Dislike"
          className="h-12 w-12 rounded-full bg-background/95 hover:bg-background flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDecide('right');
          }}
          aria-label="Like"
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg text-primary-foreground transition-transform hover:scale-110"
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>
      </div>
    </motion.div>
  );
}
