import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { LanguageButtons } from '@/components/ui/LanguageButtons';
import { ChatBotToggle } from '@/components/chatbot/ChatBotToggle';

interface PageTopBarProps {
  children?: React.ReactNode;
}

export function PageTopBar({ children }: PageTopBarProps) {
  return (
    <>
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur-md px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] max-lg:fixed max-lg:inset-x-0 max-lg:top-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
        <div className="flex shrink-0 items-center gap-1">
          <ChatBotToggle />
          <RoleSwitcher />
          <LanguageButtons />
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
      {/* Mobile : la barre est sortie du flux (fixed) — réserve la hauteur pour le contenu scrollable */}
      <div
        className="hidden max-lg:block shrink-0 [height:calc(3.75rem+env(safe-area-inset-top,0px))]"
        aria-hidden
      />
    </>
  );
}
