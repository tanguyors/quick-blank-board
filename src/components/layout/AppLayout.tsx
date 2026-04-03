import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AppSidebar } from './AppSidebar';
import { useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/ui/PageTransition';
import { ChatBot } from '@/components/chatbot/ChatBot';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  /** Désactive le scroll du contenu principal (écrans plein écran type swipe / carte) */
  lockMainScroll?: boolean;
}

export function AppLayout({ children, hideHeader, lockMainScroll }: AppLayoutProps) {
  const { pathname } = useLocation();
  const hideNav = pathname === '/auth';

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-background">
      {!hideNav && <AppSidebar />}
      {/* Colonne principale : header + contenu scrollable + barre du bas = hauteur fixe type app native */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!hideHeader && <Header />}
        <main
          className={cn(
            'min-h-0 flex-1 touch-pan-y',
            lockMainScroll
              ? 'flex flex-col overflow-hidden overscroll-none'
              : 'overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]',
          )}
          role="main"
        >
          <PageTransition
            key={pathname}
            className={lockMainScroll ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'min-h-0'}
          >
            {children}
          </PageTransition>
        </main>
        {!hideNav && <BottomNav />}
      </div>
      {!hideNav && !pathname.startsWith('/transaction/') && !pathname.startsWith('/messages/') && <ChatBot />}
    </div>
  );
}
