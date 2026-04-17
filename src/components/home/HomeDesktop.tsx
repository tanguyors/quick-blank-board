import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Calendar, TrendingUp, Apple, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageButtons } from '@/components/ui/LanguageButtons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoSoma from '@/assets/logo-soma.png';
import { HomeSwipeableCards } from '@/components/home/HomeSwipeableCards';
import { useAllowScroll } from '@/hooks/useAllowScroll';

export default function HomeDesktop() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useAllowScroll();

  const { data: stats } = useQuery({
    queryKey: ['home-desktop-stats'],
    queryFn: async () => {
      const [{ count: properties }, { count: users }] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      return { properties: properties || 500, users: users || 1000 };
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={logoSoma} alt="SomaGate" className="h-9 w-9 object-contain" />
            <span className="font-bold text-xl text-foreground tracking-tight">SomaGate</span>
          </button>

          {/* Center nav */}
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate('/features')}
              className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('homeDesktop.nav.features')} <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigate('/security')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('homeDesktop.nav.security')}
            </button>
            <button
              onClick={() => navigate('/assistance')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('homeDesktop.nav.help')}
            </button>
            <button
              onClick={() => navigate('/install')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t('homeDesktop.nav.download')}
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LanguageButtons dense />
            <Button
              onClick={() => navigate('/auth')}
              className="rounded-full px-5 h-10 bg-foreground text-background hover:bg-foreground/90"
            >
              <span className="mr-1.5">👤</span> {t('homeDesktop.nav.login')}
            </Button>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-5xl mx-auto px-8 py-24 text-center">
          <h1 className="text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
            {t('homeDesktop.hero.title1')}
            <br />
            <span className="italic font-serif text-primary/80">{t('homeDesktop.hero.title2')}</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t('homeDesktop.hero.subtitle')}
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/auth')}
              className="rounded-full h-14 px-8 text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
            >
              <Search className="h-5 w-5 mr-2" />
              {t('homeDesktop.hero.ctaPrimary')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="rounded-full h-14 px-8 text-base font-semibold border-border bg-card hover:bg-secondary"
            >
              {t('homeDesktop.hero.ctaSecondary')}
            </Button>
          </div>

          <div className="mt-14 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {stats?.properties || 500}+ {t('homeDesktop.hero.stat1')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {stats?.users || 1000}+ {t('homeDesktop.hero.stat2')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('homeDesktop.hero.stat3')}
            </span>
          </div>
        </div>
      </section>

      {/* ========== FEATURE CARDS ========== */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
          {[
            { icon: Heart, title: t('homeDesktop.features.f1Title'), desc: t('homeDesktop.features.f1Desc') },
            { icon: Calendar, title: t('homeDesktop.features.f2Title'), desc: t('homeDesktop.features.f2Desc') },
            { icon: TrendingUp, title: t('homeDesktop.features.f3Title'), desc: t('homeDesktop.features.f3Desc') },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl border border-border p-8 hover:shadow-lg transition-shadow"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== MATCHE. DÉCOUVRE. VISITE ========== */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
              {t('homeDesktop.showcase.line1')}
              <br />
              {t('homeDesktop.showcase.line2')}
              <br />
              {t('homeDesktop.showcase.line3')}
              <br />
              <span className="italic font-serif text-primary/80">SomaGate®</span>
            </h2>
            <p className="mt-8 text-base text-muted-foreground leading-relaxed max-w-md">
              {t('homeDesktop.showcase.desc')}
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="mt-8 rounded-full h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
            >
              {t('homeDesktop.showcase.cta')}
            </Button>
          </div>

          {/* Pile de cartes interactive : drag + boutons like/dislike */}
          <HomeSwipeableCards />
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-foreground text-background mt-auto">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <h3 className="text-2xl font-semibold text-primary/80 italic font-serif mb-6">
            {t('homeDesktop.footer.download')}
          </h3>

          <div className="flex gap-4 mb-12">
            <button className="flex items-center gap-3 bg-background text-foreground rounded-2xl px-5 py-3 hover:opacity-90 transition-opacity">
              <Apple className="h-7 w-7" />
              <div className="text-left">
                <p className="text-[10px] opacity-70">{t('homeDesktop.footer.downloadInAppStore')}</p>
                <p className="text-sm font-semibold">{t('homeDesktop.footer.appStore')}</p>
              </div>
            </button>
            <button className="flex items-center gap-3 bg-background text-foreground rounded-2xl px-5 py-3 hover:opacity-90 transition-opacity">
              <Play className="h-7 w-7" />
              <div className="text-left">
                <p className="text-[10px] opacity-70">{t('homeDesktop.footer.availableOnGooglePlay')}</p>
                <p className="text-sm font-semibold">{t('homeDesktop.footer.googlePlay')}</p>
              </div>
            </button>
          </div>

          <div className="text-xs text-background/60 leading-relaxed space-y-4 max-w-5xl">
            <p>{t('homeDesktop.footer.p1')}</p>
            <p>{t('homeDesktop.footer.p2')}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-background/10 flex flex-wrap gap-6 text-xs text-background/60">
            <button onClick={() => navigate('/assistance')} className="hover:text-background transition-colors">{t('homeDesktop.footer.faq')}</button>
            <button onClick={() => navigate('/assistance')} className="hover:text-background transition-colors">{t('homeDesktop.footer.assistance')}</button>
            <button onClick={() => navigate('/security')} className="hover:text-background transition-colors">{t('homeDesktop.footer.safety')}</button>
            <button onClick={() => navigate('/cgu')} className="hover:text-background transition-colors">{t('homeDesktop.footer.tos')}</button>
            <button onClick={() => navigate('/confidentialite')} className="hover:text-background transition-colors">{t('homeDesktop.footer.cookies')}</button>
            <button onClick={() => navigate('/confidentialite')} className="hover:text-background transition-colors">{t('homeDesktop.footer.privacy')}</button>
          </div>

          <p className="mt-8 text-xs text-background/40">{t('homeDesktop.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
