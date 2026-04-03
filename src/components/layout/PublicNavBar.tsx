import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

interface PublicNavBarProps {
  title: string;
  /** Lien « retour » par défaut : accueil */
  backTo?: string;
  /** Si défini, remplace le lien par un bouton (ex. navigate(-1)) */
  onBack?: () => void;
}

export function PublicNavBar({ title, backTo = '/', onBack }: PublicNavBarProps) {
  const backBtn = (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted">
      <ArrowLeft className="h-5 w-5" />
    </span>
  );

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {onBack ? (
        <button type="button" onClick={onBack} className="shrink-0" aria-label="Retour">
          {backBtn}
        </button>
      ) : (
        <Link to={backTo} className="shrink-0" aria-label="Retour">
          {backBtn}
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate text-center text-lg font-semibold text-foreground">
        {title}
      </h1>
      <div className="max-w-[min(52vw,14rem)] shrink-0 overflow-x-auto sm:max-w-none">
        <LanguageButtons dense className="flex-nowrap justify-end" />
      </div>
    </div>
  );
}
