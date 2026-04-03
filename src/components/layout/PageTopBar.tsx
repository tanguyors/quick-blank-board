import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

interface PageTopBarProps {
  children?: React.ReactNode;
}

export function PageTopBar({ children }: PageTopBarProps) {
  return (
    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur-md px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      <div className="flex shrink-0 items-center gap-1">
        <LanguageButtons />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </div>
  );
}
