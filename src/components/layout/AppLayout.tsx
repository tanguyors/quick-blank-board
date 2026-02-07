import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function AppLayout({ children, hideHeader }: AppLayoutProps) {
  const { pathname } = useLocation();
  const hideNav = pathname === '/auth';

  return (
    <div className="flex flex-col h-screen bg-background">
      {!hideHeader && <Header />}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
