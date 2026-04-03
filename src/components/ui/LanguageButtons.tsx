import { useState } from 'react';
import { LANGUAGES } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Globe, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

function matchesLang(resolved: string | undefined, code: string): boolean {
  if (!resolved) return false;
  if (resolved === code) return true;
  return resolved.startsWith(`${code}-`);
}

interface LanguageButtonsProps {
  className?: string;
  dense?: boolean;
}

export function LanguageButtons({ className, dense }: LanguageButtonsProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const setLang = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setOpen(false);
    if (user) {
      await supabase.from('profiles').update({ preferred_language: code } as { preferred_language: string }).eq('id', user.id);
    }
  };

  const active = i18n.resolvedLanguage || i18n.language;
  const currentLang = LANGUAGES.find(l => matchesLang(active, l.code)) || LANGUAGES[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-1 rounded-full transition-colors hover:bg-secondary active:scale-95',
          dense ? 'h-7 px-1.5 text-xs' : 'h-8 px-2 text-sm',
          className,
        )}
        aria-label="Changer de langue"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium text-muted-foreground">{currentLang.code.toUpperCase()}</span>
      </button>

      {open && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

          {/* Modal */}
          <div
            style={{ position: 'relative', width: '85%', maxWidth: 320 }}
            className="rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border text-center">
              <p className="text-sm font-semibold text-foreground">{t('language.chooseLanguage')}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {LANGUAGES.map((lang) => {
                const isOn = matchesLang(active, lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => void setLang(lang.code)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all active:scale-95',
                      isOn
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-secondary/50 text-foreground hover:bg-secondary',
                    )}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="flex-1 text-xs font-medium">{lang.label}</span>
                    {isOn && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
