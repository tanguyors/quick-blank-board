import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Flame, Shield, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_SLIDES = [
  {
    icon: '🏠',
    title: 'Trouvez votre bien idéal',
    subtitle: 'Swipez, matchéz et visitez des propriétés en Indonésie en quelques gestes.',
  },
  {
    icon: '🔒',
    title: 'Transactions sécurisées',
    subtitle: 'Un workflow guidé étape par étape : visite, offre, documents — tout est tracé et protégé.',
  },
  {
    icon: '📄',
    title: 'Documents automatiques',
    subtitle: 'LOI, contrats et term sheets générés automatiquement. Validez depuis votre téléphone.',
  },
];

export default function Home() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // If logged in, redirect
  if (!loading && user) {
    const isOwner = roles.includes('owner');
    return <Navigate to={isOwner ? '/dashboard' : '/explore'} replace />;
  }

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top section with logo */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-2xl tracking-tight">𝔫</span>
          <span className="font-semibold text-lg text-foreground">SomaGate</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-7xl mb-8 animate-fade-in" key={currentSlide}>
          {slide.icon}
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight animate-fade-in" key={`t-${currentSlide}`}>
          {slide.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed max-w-xs animate-fade-in" key={`s-${currentSlide}`}>
          {slide.subtitle}
        </p>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {ONBOARDING_SLIDES.map((_, i) => (
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

      {/* Bottom buttons */}
      <div className="px-6 pb-8 space-y-3">
        {isLast ? (
          <>
            <Button
              className="w-full h-14 rounded-2xl text-base font-semibold"
              onClick={() => navigate('/auth')}
            >
              Créer mon compte
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl text-base"
              onClick={() => navigate('/auth')}
            >
              J'ai déjà un compte
            </Button>
          </>
        ) : (
          <Button
            className="w-full h-14 rounded-2xl text-base font-semibold"
            onClick={() => setCurrentSlide(c => c + 1)}
          >
            Suivant
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
