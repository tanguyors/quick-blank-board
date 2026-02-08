import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallFloat() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const isIosDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIos(isIosDevice);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    if (isStandalone) setIsInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating button — lifted above Safari bottom bar */}
      <button
        onClick={handleInstall}
        className="fixed z-50 flex items-center gap-2 bg-primary text-primary-foreground pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', right: '1.5rem' }}
        aria-label="Installer l'application"
      >
        <Download className="h-5 w-5" />
        <span className="text-sm font-semibold">Installer</span>
      </button>

      {/* iOS Guide Popup */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base">Installer SomaGate</h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Pour installer l'application sur votre iPhone ou iPad :
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <p className="text-sm text-foreground">
                  Appuyez sur{' '}
                  <Share className="inline h-4 w-4 text-primary align-text-bottom" />{' '}
                  <strong>Partager</strong> dans la barre Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <p className="text-sm text-foreground">
                  Faites défiler et appuyez sur{' '}
                  <strong>« Sur l'écran d'accueil »</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <p className="text-sm text-foreground">
                  Appuyez sur <strong>Ajouter</strong>
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => setShowIosGuide(false)}
            >
              Compris !
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
