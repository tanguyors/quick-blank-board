import { LANGUAGES } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

function matchesLang(resolved: string | undefined, code: string): boolean {
  if (!resolved) return false;
  if (resolved === code) return true;
  return resolved.startsWith(`${code}-`);
}

interface LanguageButtonsProps {
  className?: string;
  /** Boutons plus compacts (barres d’outils serrées) */
  dense?: boolean;
}

export function LanguageButtons({ className, dense }: LanguageButtonsProps) {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const setLang = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    if (user) {
      await supabase.from('profiles').update({ preferred_language: code } as { preferred_language: string }).eq('id', user.id);
    }
  };

  const active = i18n.resolvedLanguage || i18n.language;

  return (
    <div
      className={cn('inline-flex flex-wrap items-center justify-end gap-1', className)}
      role="group"
      aria-label="Langue"
    >
      {LANGUAGES.map((lang) => {
        const isOn = matchesLang(active, lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void setLang(lang.code)}
            className={cn(
              'rounded-md font-medium leading-none transition-colors border shrink-0',
              dense ? 'px-1 py-0.5 text-sm' : 'px-1.5 py-1 text-base',
              isOn
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : 'border-transparent bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground',
            )}
            title={lang.label}
            aria-pressed={isOn}
            aria-label={lang.label}
          >
            <span aria-hidden>{lang.flag}</span>
          </button>
        );
      })}
    </div>
  );
}
