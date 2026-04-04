import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AdminProfilePanel } from '@/components/admin/AdminProfilePanel';
import { useAuth } from '@/hooks/useAuth';
import { User, Shield } from 'lucide-react';

export default function Profile() {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'admin';

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          {isAdmin ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
          <span className="text-foreground font-semibold">{isAdmin ? 'Admin' : 'Profil'}</span>
        </div>
      </PageTopBar>
      {isAdmin ? <AdminProfilePanel /> : <ProfileForm />}
    </AppLayout>
  );
}
