import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface PageTopBarProps {
  children?: React.ReactNode;
}

export function PageTopBar({ children }: PageTopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {children}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </div>
  );
}
