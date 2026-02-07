import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, ArrowRight, ChevronRight, MapPin, BedDouble, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

import villaImg from '@/assets/onboarding-villa-1.jpg';
import apartmentImg from '@/assets/onboarding-apartment-2.jpg';
import beachImg from '@/assets/onboarding-beach-3.jpg';

// Fake property cards to demo the swipe concept
const DEMO_CARDS = [
  {
    image: villaImg,
    type: 'Villa',
    location: 'Almadies, Dakar',
    price: '320 M FCFA',
    beds: 4,
    area: '280 m²',
  },
  {
    image: apartmentImg,
    type: 'Appartement',
    location: 'Plateau, Abidjan',
    price: '180 M FCFA',
    beds: 2,
    area: '120 m²',
  },
  {
    image: beachImg,
    type: 'Maison de plage',
    location: 'Cocody, Abidjan',
    price: '550 M FCFA',
    beds: 3,
    area: '200 m²',
  },
];

const SLIDES = [
  {
    key: 'swipe',
    badge: 'Le Tinder de l\'immobilier',
    title: 'Swipez pour trouver votre bien idéal',
    subtitle: 'Comme sur Tinder, swipez à droite si un bien vous plaît. C\'est aussi simple que ça.',
  },
  {
    key: 'secure',
    badge: 'Sécurité maximale',
    title: 'Des transactions 100% sécurisées',
    subtitle: 'Messagerie protégée, anti-fraude IA, score de fiabilité. Chaque étape est tracée.',
    icon: Shield,
  },
  {
    key: 'docs',
    badge: 'Tout automatisé',
    title: 'Documents générés en un clic',
    subtitle: 'LOI, contrats, term sheets — tout est créé automatiquement. Validez depuis votre téléphone.',
    icon: FileText,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [demoCardIndex, setDemoCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const currentCard = DEMO_CARDS[demoCardIndex % DEMO_CARDS.length];
  const nextCard = DEMO_CARDS[(demoCardIndex + 1) % DEMO_CARDS.length];

  const handleDemoSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection(null);
      setDemoCardIndex(i => i + 1);
    }, 350);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 60) {
      handleDemoSwipe(diff > 0 ? 'right' : 'left');
    }
    setTouchStart(null);
  };

  const goNext = () => {
    if (isLast) {
      navigate('/auth');
    } else {
      setCurrentSlide(c => c + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-2xl tracking-tight">𝔫</span>
          <span className="font-semibold text-lg text-foreground">SomaGate</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary/50"
        >
          Connexion
        </button>
      </div>

      {/* Slide badge */}
      <div className="px-5 pt-4 z-10 relative">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
          {slide.key === 'swipe' && <Heart className="h-3 w-3" />}
          {slide.icon && <slide.icon className="h-3 w-3" />}
          {slide.badge}
        </span>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Swipe demo slide */}
        {currentSlide === 0 && (
          <div className="flex-1 flex flex-col items-center px-5 pt-4">
            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground leading-tight text-left w-full">
              {slide.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-left w-full leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Swipe card stack */}
            <div className="relative w-full max-w-[300px] h-[380px] mt-6 mx-auto">
              {/* Background card (next) */}
              <div className="absolute inset-0 top-3 scale-[0.95] opacity-60">
                <div className="w-full h-full rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
                  <img
                    src={nextCard.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Main card */}
              <div
                ref={cardRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`absolute inset-0 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing ${
                  swipeDirection === 'right'
                    ? 'translate-x-[120%] rotate-[20deg] opacity-0'
                    : swipeDirection === 'left'
                    ? '-translate-x-[120%] -rotate-[20deg] opacity-0'
                    : ''
                }`}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden border border-border bg-card shadow-2xl relative">
                  <img
                    src={currentCard.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                  {/* Card info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-foreground">{currentCard.type}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-sm">{currentCard.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold text-lg">{currentCard.price}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" />
                          {currentCard.beds}
                        </span>
                        <span>{currentCard.area}</span>
                      </div>
                    </div>
                  </div>

                  {/* Swipe indicators */}
                  {swipeDirection === 'right' && (
                    <div className="absolute top-6 left-6 border-2 border-primary text-primary px-4 py-1 rounded-lg rotate-[-15deg] text-xl font-bold opacity-90">
                      LIKE ❤️
                    </div>
                  )}
                  {swipeDirection === 'left' && (
                    <div className="absolute top-6 right-6 border-2 border-destructive text-destructive px-4 py-1 rounded-lg rotate-[15deg] text-xl font-bold opacity-90">
                      NOPE
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Swipe buttons */}
            <div className="flex items-center justify-center gap-8 mt-5">
              <button
                onClick={() => handleDemoSwipe('left')}
                className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
              >
                <X className="h-7 w-7 text-destructive" />
              </button>
              <button
                onClick={() => handleDemoSwipe('right')}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform active:scale-95"
              >
                <Heart className="h-8 w-8 text-primary-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 animate-pulse">
              ← Swipez la carte ou utilisez les boutons →
            </p>
          </div>
        )}

        {/* Non-swipe slides */}
        {currentSlide > 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {slide.icon && (
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                <slide.icon className="h-12 w-12 text-primary" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {slide.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed max-w-xs">
              {slide.subtitle}
            </p>

            {/* Feature pills */}
            {currentSlide === 1 && (
              <div className="flex flex-wrap gap-2 mt-8 justify-center">
                {['Anti-fraude IA', 'Score fiabilité', 'Messages protégés', 'Traçabilité'].map(f => (
                  <span key={f} className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>
            )}
            {currentSlide === 2 && (
              <div className="flex flex-wrap gap-2 mt-8 justify-center">
                {["Lettre d'intention", 'Term Sheet', 'Contrat', 'Validation croisée'].map(f => (
                  <span key={f} className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="px-5 pb-8 pt-4 z-10 relative space-y-4">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* CTA buttons */}
        {isLast ? (
          <div className="space-y-3">
            <Button
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
              onClick={() => navigate('/auth')}
            >
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl text-base border-border"
              onClick={() => navigate('/auth')}
            >
              J'ai déjà un compte
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-14 rounded-2xl text-base font-semibold"
            onClick={goNext}
          >
            Suivant
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
