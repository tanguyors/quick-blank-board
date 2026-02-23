import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const handleChange = async (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: code } as any)
        .eq('id', user.id);
    }
  };

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  if (compact) {
    return (
      <Select value={i18n.language} onValueChange={handleChange}>
        <SelectTrigger className={`w-auto gap-1.5 border-0 bg-transparent px-2 py-1.5 h-auto text-sm ${className || ''}`}>
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>{current.flag}</span>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={i18n.language} onValueChange={handleChange}>
      <SelectTrigger className={`bg-secondary/50 border-border ${className || ''}`}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{current.flag}</span>
            <span>{current.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
