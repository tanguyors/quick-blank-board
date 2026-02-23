import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, ArrowRight, ChevronRight, MapPin, BedDouble, Shield, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

import villaImg from '@/assets/onboarding-villa-1.jpg';
import apartmentImg from '@/assets/onboarding-apartment-2.jpg';
import beachImg from '@/assets/onboarding-beach-3.jpg';
import logoSoma from '@/assets/logo-soma.png';

// Grid of properties for the hero section
const HERO_PROPERTIES = [
  { image: villaImg, type: 'Villa', location: 'Seminyak', price: 'Rp 4.500.000.000', beds: 4 },
  { image: apartmentImg, type: 'Appartement', location: 'Canggu', price: 'Rp 2.800.000.000', beds: 2 },
  { image: beachImg, type: 'Maison', location: 'Ubud', price: 'Rp 7.500.000.000', beds: 3 },
  { image: villaImg, type: 'Villa', location: 'Uluwatu', price: 'Rp 5.200.000.000', beds: 5 },
  { image: apartmentImg, type: 'Studio', location: 'Pererenan', price: 'Rp 1.900.000.000', beds: 1 },
  { image: beachImg, type: 'Villa', location: 'Sanur', price: 'Rp 6.100.000.000', beds: 4 },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const FEATURES = [
    { icon: Shield, title: t('features.secureTransactions'), desc: t('features.secureTransactionsDesc') },
    { icon: FileText, title: t('features.automatedDocs'), desc: t('features.automatedDocsDesc') },
    { icon: Heart, title: t('features.smartMatching'), desc: t('features.smartMatchingDesc') },
    { icon: Sparkles, title: t('features.realEstateIntel'), desc: t('features.realEstateIntelDesc') },
  ];

  // Fetch today's match count
  const { data: todayMatchCount } = useQuery({
    queryKey: ['today-match-count'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      if (error) return 0;
      return count || 0;
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 z-10">
        <div className="flex items-center gap-2">
          <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-lg text-foreground">SomaGate</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSelector compact />
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary/50"
          >
            {t('home.login')}
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div className="px-5 pt-4">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary mb-3">
            <Sparkles className="h-3 w-3" />
            {t('home.intelligenceTag')}
          </span>
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-muted-foreground mt-2 text-base leading-relaxed">
            {t('home.heroSubtitle')}
          </p>
        </div>

        {/* Today's matches counter */}
        {(todayMatchCount ?? 0) > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary">
                {t('home.matchesToday', { count: todayMatchCount })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Property grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {HERO_PROPERTIES.map((prop, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
              <div className="relative aspect-[4/3]">
                <img src={prop.image} alt={prop.type} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-bold text-foreground">{prop.price}</p>
                  <p className="text-[10px] text-muted-foreground">{prop.type} · {prop.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slogan banner */}
      <div className="mx-5 mb-4 py-4 px-5 rounded-2xl bg-primary/5 border border-primary/10 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('home.slogan')}
        </p>
      </div>

      {/* Features grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-card border border-border">
              <f.icon className="h-6 w-6 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="px-5 pb-8 pt-2 space-y-3">
        <Button
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
          onClick={() => navigate('/auth')}
        >
          {t('home.ctaSwipe')}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="w-full h-14 rounded-2xl text-base border-border"
          onClick={() => navigate('/auth')}
        >
          {t('home.ctaAccount')}
        </Button>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button onClick={() => navigate('/features')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.features')}</button>
          <button onClick={() => navigate('/how-it-works')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.howItWorks')}</button>
          <button onClick={() => navigate('/security')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.security')}</button>
          <button onClick={() => navigate('/assistance')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.help')}</button>
          <button onClick={() => navigate('/cgu')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.cgu')}</button>
          <button onClick={() => navigate('/cgv')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.cgv')}</button>
          <button onClick={() => navigate('/cgv-abonnement')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.cgvAbo')}</button>
          <button onClick={() => navigate('/confidentialite')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('home.privacy')}</button>
        </div>

        {/* Bottom slogan */}
        <p className="text-center text-[10px] text-muted-foreground tracking-wider pt-2">
          {t('home.slogan')}
        </p>
      </div>
    </div>
  );
}
