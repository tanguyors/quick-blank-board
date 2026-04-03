import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Star, Clock, TrendingUp, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

import villaImg from '@/assets/onboarding-villa-1.jpg';
import apartmentImg from '@/assets/onboarding-apartment-2.jpg';
import beachImg from '@/assets/onboarding-beach-3.jpg';
import logoSoma from '@/assets/logo-soma.png';

import iconAssurance from '@/assets/icons/assurance.png';
import iconDoc from '@/assets/icons/doc.png';
import iconAppsearch from '@/assets/icons/appsearch.png';
import iconDeal from '@/assets/icons/deal.png';

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
    { icon: iconAssurance, title: t('features.secureTransactions'), desc: t('features.secureTransactionsDesc') },
    { icon: iconDoc, title: t('features.automatedDocs'), desc: t('features.automatedDocsDesc') },
    { icon: iconAppsearch, title: t('features.smartMatching'), desc: t('features.smartMatchingDesc') },
    { icon: iconDeal, title: t('features.realEstateIntel'), desc: t('features.realEstateIntelDesc') },
  ];

  // Fetch coup de coeur du jour (most liked available property)
  const { data: coupDeCoeur } = useQuery({
    queryKey: ['coup-de-coeur'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary)')
        .eq('is_published', true)
        .eq('status', 'available')
        .order('like_count', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [{ count: users }, { count: properties }, { count: transactions }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('wf_transactions').select('*', { count: 'exact', head: true }),
      ]);
      return { users: users || 0, properties: properties || 0, transactions: transactions || 0 };
    },
  });

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
      {/* Top bar — padding sous l’heure / Dynamic Island (safe area) */}
      <div className="flex items-center justify-between px-5 pb-3 z-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-lg text-foreground">SomaGate</span>
        </div>
        <div className="flex max-w-[58vw] items-center gap-1 overflow-x-auto sm:max-w-none">
          <LanguageButtons dense className="flex-nowrap" />
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
              <img src={iconDeal} alt="" className="h-5 w-5 object-contain" />
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

      {/* Coup de coeur du jour */}
      {coupDeCoeur && (
        <div className="mx-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-foreground">Coup de cœur du jour</h3>
          </div>
          <div
            className="rounded-2xl overflow-hidden border-2 border-rose-500/30 bg-card shadow-lg cursor-pointer"
            onClick={() => navigate('/auth')}
          >
            <div className="relative aspect-video">
              {coupDeCoeur.property_media?.[0]?.url ? (
                <img src={coupDeCoeur.property_media[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-primary/10 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-rose-300" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ❤️ Coup de cœur
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-transparent p-4 pt-8">
                <p className="text-xl font-bold text-foreground">{coupDeCoeur.type}</p>
                <p className="text-sm text-muted-foreground">{coupDeCoeur.adresse}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social proof stats */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{platformStats?.users || '150'}+</p>
          <p className="text-[10px] text-muted-foreground">Membres actifs</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{platformStats?.transactions || '35'}+</p>
          <p className="text-[10px] text-muted-foreground">Transactions</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">98%</p>
          <p className="text-[10px] text-muted-foreground">Taux satisfaction</p>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mx-5 mb-4 space-y-2">
        <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Temps moyen avant visite</p>
            <p className="text-xs text-muted-foreground">48h après le match</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Note moyenne des vendeurs</p>
            <p className="text-xs text-muted-foreground">4.8/5 basée sur les retours utilisateurs</p>
          </div>
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
              <img src={f.icon} alt="" className="h-10 w-10 object-contain mb-2" />
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
