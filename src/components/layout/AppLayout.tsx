import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AppSidebar } from './AppSidebar';
import { useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/ui/PageTransition';

interface AppLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function AppLayout({ children, hideHeader }: AppLayoutProps) {
  const { pathname } = useLocation();
  const hideNav = pathname === '/auth';

  return (
    <div className="flex h-screen bg-background w-full">
      {!hideNav && <AppSidebar />}
      <div className="flex flex-col flex-1 min-w-0">
        {!hideHeader && <Header />}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" role="main">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
