import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const isIosDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIos(isIosDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    if (isStandalone) setIsInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <Download className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Installer</span>
        </div>
      </PageTopBar>

      <div className="mx-auto max-w-md space-y-6 px-4 pb-6 pt-8 text-center">
        <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <Smartphone className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Installer SomaGate</h1>
          <p className="text-muted-foreground mt-2">
            Ajoutez SomaGate à votre écran d'accueil pour une expérience rapide et fluide, même hors connexion.
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <p className="font-semibold text-foreground">SomaGate est installée !</p>
          </div>
        ) : isIos ? (
          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
            <p className="font-semibold text-foreground text-sm">Sur iPhone / iPad :</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-foreground shrink-0">1</span>
                <p>Appuyez sur le bouton <Share className="inline h-4 w-4 text-primary" /> Partager dans Safari</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-foreground shrink-0">2</span>
                <p>Sélectionnez <strong className="text-foreground">« Sur l'écran d'accueil »</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-foreground shrink-0">3</span>
                <p>Appuyez sur <strong className="text-foreground">Ajouter</strong></p>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button size="lg" className="w-full text-base" onClick={handleInstall}>
            <Download className="h-5 w-5 mr-2" />
            Installer l'application
          </Button>
        ) : (
          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
            <p className="font-semibold text-foreground text-sm">Pour installer :</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-foreground shrink-0">1</span>
                <p>Ouvrez le menu de votre navigateur <strong className="text-foreground">(⋮)</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-foreground shrink-0">2</span>
                <p>Sélectionnez <strong className="text-foreground">« Installer l'application »</strong> ou <strong className="text-foreground">« Ajouter à l'écran d'accueil »</strong></p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { emoji: '⚡', label: 'Rapide' },
            { emoji: '📴', label: 'Hors ligne' },
            { emoji: '🔔', label: 'Notifications' },
          ].map(f => (
            <div key={f.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <span className="text-2xl">{f.emoji}</span>
              <p className="text-xs text-muted-foreground mt-1">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
