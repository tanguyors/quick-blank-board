import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

interface PageTopBarProps {
  children?: React.ReactNode;
}

export function PageTopBar({ children }: PageTopBarProps) {
  return (
    <div className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-border bg-background px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:max-w-[55%] sm:justify-end">
        <div className="max-w-full overflow-x-auto">
          <LanguageButtons dense className="flex-nowrap" />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}
